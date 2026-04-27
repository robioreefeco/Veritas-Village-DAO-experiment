import { Router } from "express";
import { db, proposalsTable, votesTable } from "@workspace/db";
import { sql, count, eq } from "drizzle-orm";

const router = Router();

router.get("/stats/dashboard", async (req, res) => {
  try {
    const [{ total }] = await db.select({ total: count() }).from(proposalsTable);
    const [{ active }] = await db
      .select({ active: count() })
      .from(proposalsTable)
      .where(eq(proposalsTable.status, "active"));
    const [{ totalVotes }] = await db.select({ totalVotes: count() }).from(votesTable);
    const [{ celoVotes }] = await db
      .select({ celoVotes: count() })
      .from(votesTable)
      .where(eq(votesTable.chain, "celo"));
    const [{ rskVotes }] = await db
      .select({ rskVotes: count() })
      .from(votesTable)
      .where(eq(votesTable.chain, "rsk"));
    const uniqueVotersResult = await db
      .selectDistinct({ voterAddress: votesTable.voterAddress })
      .from(votesTable);

    res.json({
      totalProposals: Number(total),
      activeProposals: Number(active),
      totalVotes: Number(totalVotes),
      celoVotes: Number(celoVotes),
      rskVotes: Number(rskVotes),
      uniqueVoters: uniqueVotersResult.length,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get dashboard stats");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/stats/chain-activity", async (req, res) => {
  try {
    const recentVotes = await db
      .select({
        chain: votesTable.chain,
        choice: votesTable.choice,
        voterAddress: votesTable.voterAddress,
        txHash: votesTable.txHash,
        createdAt: votesTable.createdAt,
        proposalTitle: proposalsTable.title,
      })
      .from(votesTable)
      .leftJoin(proposalsTable, eq(votesTable.proposalId, proposalsTable.id))
      .orderBy(sql`${votesTable.createdAt} desc`)
      .limit(20);

    const activity = recentVotes.map((v) => ({
      chain: v.chain,
      action: `Voted ${v.choice}`,
      address: v.voterAddress,
      proposalTitle: v.proposalTitle ?? "Unknown Proposal",
      txHash: v.txHash ?? null,
      timestamp: v.createdAt.toISOString(),
    }));

    res.json(activity);
  } catch (err) {
    req.log.error({ err }, "Failed to get chain activity");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

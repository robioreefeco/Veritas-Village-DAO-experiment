import { Router } from "express";
import { db, proposalsTable, votesTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { createVocdoniElection } from "../lib/vocdoni";
import {
  CreateProposalBody,
  CastVoteBody,
  ListProposalsQueryParams,
  GetProposalParams,
  CastVoteParams,
  GetProposalResultsParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/proposals", async (req, res) => {
  try {
    const parsed = ListProposalsQueryParams.safeParse(req.query);
    const chain = parsed.success ? parsed.data.chain : undefined;

    let proposals;
    if (chain && chain !== "all") {
      proposals = await db
        .select()
        .from(proposalsTable)
        .where(eq(proposalsTable.chain, chain as "celo" | "rsk"))
        .orderBy(sql`${proposalsTable.createdAt} desc`);
    } else {
      proposals = await db
        .select()
        .from(proposalsTable)
        .orderBy(sql`${proposalsTable.createdAt} desc`);
    }

    res.json(proposals);
  } catch (err) {
    req.log.error({ err }, "Failed to list proposals");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/proposals", async (req, res) => {
  try {
    const parsed = CreateProposalBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid body", issues: parsed.error.issues });
      return;
    }
    const { title, description, chain, census, endsAt, creatorAddress, creatorSignature, anchorTxHash, imageUrls } = parsed.data;

    // Verify the EIP-191 signature — proves the sender owns creatorAddress
    const expectedMessage = `Veritas Villages DAO: Creating proposal "${title}" on ${chain}`;
    let recoveredAddress: string;
    try {
      const { ethers } = await import("ethers");
      recoveredAddress = ethers.utils.verifyMessage(expectedMessage, creatorSignature);
    } catch {
      res.status(400).json({ error: "Invalid signature" });
      return;
    }
    if (recoveredAddress.toLowerCase() !== creatorAddress.toLowerCase()) {
      res.status(403).json({ error: "Signature does not match creatorAddress" });
      return;
    }

    // Try to create a real Vocdoni election, fall back to mock ID if unavailable
    let electionId = `election-${Date.now()}`;
    try {
      const endDate = endsAt ? new Date(endsAt) : new Date(Date.now() + 7 * 86400 * 1000);
      electionId = await createVocdoniElection({ title, description, endsAt: endDate });
      req.log.info({ electionId }, "Vocdoni election created");
    } catch (err) {
      req.log.warn({ err }, "Vocdoni election creation failed, using mock ID");
    }

    const [proposal] = await db
      .insert(proposalsTable)
      .values({
        title,
        description,
        chain: chain as "celo" | "rsk",
        census: census as "rbtc" | "cusd",
        endsAt: endsAt ? new Date(endsAt) : null,
        status: "active",
        electionId,
        anchorTxHash: anchorTxHash ?? null,
        imageUrls: imageUrls ?? null,
        creatorAddress: creatorAddress.toLowerCase(),
      })
      .returning();
    res.status(201).json(proposal);
  } catch (err) {
    req.log.error({ err }, "Failed to create proposal");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/proposals/:id", async (req, res) => {
  try {
    const parsed = GetProposalParams.safeParse({ id: Number(req.params.id) });
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    const [proposal] = await db
      .select()
      .from(proposalsTable)
      .where(eq(proposalsTable.id, parsed.data.id));
    if (!proposal) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json(proposal);
  } catch (err) {
    req.log.error({ err }, "Failed to get proposal");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/proposals/:id/vote", async (req, res) => {
  try {
    const paramsParsed = CastVoteParams.safeParse({ id: Number(req.params.id) });
    if (!paramsParsed.success) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    const bodyParsed = CastVoteBody.safeParse(req.body);
    if (!bodyParsed.success) {
      res.status(400).json({ error: "Invalid body", issues: bodyParsed.error.issues });
      return;
    }

    const { voterAddress, choice, chain, txHash } = bodyParsed.data;
    const proposalId = paramsParsed.data.id;

    const [existingVote] = await db
      .select()
      .from(votesTable)
      .where(and(eq(votesTable.proposalId, proposalId), eq(votesTable.voterAddress, voterAddress)));

    if (existingVote) {
      res.status(409).json({ error: "Already voted" });
      return;
    }

    const [vote] = await db
      .insert(votesTable)
      .values({
        proposalId,
        voterAddress,
        chain,
        choice: choice as "yes" | "no" | "abstain",
        txHash: txHash ?? null,
      })
      .returning();

    const voteIncrement =
      choice === "yes"
        ? { yesVotes: sql`${proposalsTable.yesVotes} + 1` }
        : choice === "no"
        ? { noVotes: sql`${proposalsTable.noVotes} + 1` }
        : { abstainVotes: sql`${proposalsTable.abstainVotes} + 1` };

    await db
      .update(proposalsTable)
      .set(voteIncrement)
      .where(eq(proposalsTable.id, proposalId));

    res.status(201).json(vote);
  } catch (err) {
    req.log.error({ err }, "Failed to cast vote");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/proposals/:id/results", async (req, res) => {
  try {
    const parsed = GetProposalResultsParams.safeParse({ id: Number(req.params.id) });
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    const proposalId = parsed.data.id;

    const votes = await db
      .select()
      .from(votesTable)
      .where(eq(votesTable.proposalId, proposalId));

    const tally = { yes: 0, no: 0, abstain: 0 };
    const byChain: Record<string, { yes: number; no: number; abstain: number }> = {
      celo: { yes: 0, no: 0, abstain: 0 },
      rsk: { yes: 0, no: 0, abstain: 0 },
    };

    for (const v of votes) {
      tally[v.choice]++;
      const c = v.chain in byChain ? v.chain : "celo";
      byChain[c][v.choice]++;
    }

    res.json({
      proposalId,
      ...tally,
      total: tally.yes + tally.no + tally.abstain,
      byChain,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get results");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

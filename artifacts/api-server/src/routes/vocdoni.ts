import { Router } from "express";
import { getRskBalance, getCeloBalance, signCspProof } from "../lib/vocdoni";
import { db, proposalsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { formatEther } from "viem";

const router = Router();

router.post("/vocdoni/csp-sign/:id", async (req, res) => {
  try {
    const proposalId = parseInt(req.params.id, 10);
    const { address } = req.body as { address?: string };

    if (!address || !/^0x[0-9a-fA-F]{40}$/.test(address)) {
      res.status(400).json({ error: "Invalid voter address" });
      return;
    }

    const [proposal] = await db
      .select()
      .from(proposalsTable)
      .where(eq(proposalsTable.id, proposalId));

    if (!proposal) {
      res.status(404).json({ error: "Proposal not found" });
      return;
    }

    if (proposal.status !== "active") {
      res.status(400).json({ error: "Proposal is not active" });
      return;
    }

    if (!proposal.electionId || proposal.electionId.startsWith("election-")) {
      res.status(400).json({ error: "Proposal has no live Vocdoni election" });
      return;
    }

    // Check on-chain balance for census eligibility
    let balance = 0n;
    let balanceFormatted = "0";
    try {
      if (proposal.chain === "rsk") {
        balance = await getRskBalance(address);
      } else {
        balance = await getCeloBalance(address);
      }
      balanceFormatted = formatEther(balance);
    } catch (err) {
      req.log.warn({ err }, "Balance check failed, proceeding anyway for testnet");
    }

    const minBalance = 0n;
    if (balance <= minBalance) {
      res.status(403).json({
        error: "Insufficient balance for census eligibility",
        balance: balanceFormatted,
        chain: proposal.chain,
        required: proposal.chain === "rsk" ? "rBTC > 0" : "CELO > 0",
      });
      return;
    }

    // Sign the CSP proof
    const electionId = proposal.electionId.replace(/^0x/, "");
    const signature = await signCspProof({ electionId, voterAddress: address });

    res.json({
      signature,
      electionId: proposal.electionId,
      proofType: 1,
      balance: balanceFormatted,
      chain: proposal.chain,
    });
  } catch (err) {
    req.log.error({ err }, "CSP sign failed");
    res.status(500).json({ error: "Failed to generate CSP proof" });
  }
});

// Fetch live balance for an address
router.get("/vocdoni/balance/:chain/:address", async (req, res) => {
  try {
    const { chain, address } = req.params;

    if (!/^0x[0-9a-fA-F]{40}$/.test(address)) {
      res.status(400).json({ error: "Invalid address" });
      return;
    }

    let balance = 0n;
    if (chain === "rsk") {
      balance = await getRskBalance(address);
    } else if (chain === "celo") {
      balance = await getCeloBalance(address);
    } else {
      res.status(400).json({ error: "Unknown chain" });
      return;
    }

    res.json({
      address,
      chain,
      balance: balance.toString(),
      balanceFormatted: formatEther(balance),
      symbol: chain === "rsk" ? "rBTC" : "CELO",
    });
  } catch (err) {
    req.log.error({ err }, "Balance fetch failed");
    res.status(500).json({ error: "Failed to fetch balance" });
  }
});

export default router;

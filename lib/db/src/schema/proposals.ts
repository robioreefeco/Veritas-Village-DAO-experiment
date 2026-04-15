import { pgTable, serial, text, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const chainEnum = pgEnum("chain", ["celo", "rsk"]);
export const censusEnum = pgEnum("census", ["rbtc", "cusd"]);
export const statusEnum = pgEnum("status", ["active", "ended", "pending"]);
export const choiceEnum = pgEnum("choice", ["yes", "no", "abstain"]);

export const proposalsTable = pgTable("proposals", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  chain: chainEnum("chain").notNull().default("celo"),
  census: censusEnum("census").notNull().default("cusd"),
  status: statusEnum("status").notNull().default("active"),
  electionId: text("election_id"),
  creatorAddress: text("creator_address"),
  rbtcBalance: text("rbtc_balance"),
  yesVotes: integer("yes_votes").notNull().default(0),
  noVotes: integer("no_votes").notNull().default(0),
  abstainVotes: integer("abstain_votes").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  endsAt: timestamp("ends_at"),
});

export const votesTable = pgTable("votes", {
  id: serial("id").primaryKey(),
  proposalId: integer("proposal_id").notNull().references(() => proposalsTable.id),
  voterAddress: text("voter_address").notNull(),
  chain: text("chain").notNull(),
  choice: choiceEnum("choice").notNull(),
  txHash: text("tx_hash"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertProposalSchema = createInsertSchema(proposalsTable).omit({ id: true, createdAt: true, yesVotes: true, noVotes: true, abstainVotes: true });
export const insertVoteSchema = createInsertSchema(votesTable).omit({ id: true, createdAt: true });

export type Proposal = typeof proposalsTable.$inferSelect;
export type InsertProposal = z.infer<typeof insertProposalSchema>;
export type Vote = typeof votesTable.$inferSelect;
export type InsertVote = z.infer<typeof insertVoteSchema>;

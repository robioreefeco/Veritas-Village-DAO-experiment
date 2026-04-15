import { useState } from "react";
import { useParams, Link, useLocation } from "wouter";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useGetProposal, useCastVote } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, CheckCircle2, Loader2, AlertCircle, ExternalLink, Wifi } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CastVoteBodyChoice } from "@workspace/api-zod";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useChainBalance } from "@/hooks/use-chain-balance";
import { VocdoniSDKClient, EnvOptions, CspVote, CspProofType } from "@vocdoni/sdk";

const API_BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

const CHOICE_INDEX: Record<string, number> = { yes: 0, no: 1, abstain: 2 };

async function getCspProof(proposalId: number, address: string) {
  const res = await fetch(`${API_BASE}/api/vocdoni/csp-sign/${proposalId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `CSP sign failed: ${res.status}`);
  }
  return res.json() as Promise<{ signature: string; electionId: string; proofType: number }>;
}

export default function Vote() {
  const { id } = useParams();
  const proposalId = parseInt(id || "0", 10);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { login, authenticated, user } = usePrivy();
  const { wallets } = useWallets();
  const { data: proposal, isLoading: proposalLoading } = useGetProposal(proposalId);
  const castVoteMutation = useCastVote();

  const [choice, setChoice] = useState<CastVoteBodyChoice | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [voteTxId, setVoteTxId] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string>("");

  const walletAddress = user?.wallet?.address;
  const isLiveElection = proposal?.electionId && !proposal.electionId.startsWith("election-");

  const { balance, formatted, symbol, loading: balanceLoading, error: balanceError } = useChainBalance(
    walletAddress,
    proposal?.chain as "rsk" | "celo" ?? "rsk"
  );

  const hasVotingPower = balance !== null && balance > 0n;

  if (proposalLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">Proposal Not Found</h2>
        <Link href="/proposals" className="text-primary hover:underline mt-4 inline-block">
          Return to Proposals
        </Link>
      </div>
    );
  }

  if (proposal.status !== "active") {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Link href={`/proposals/${proposal.id}`} className="text-xs font-mono text-muted-foreground hover:text-foreground flex items-center transition-colors">
          <ArrowLeft className="h-3 w-3 ml-1 mr-2" /> Back to Proposal
        </Link>
        <Alert className="rounded-none border-border bg-muted/20">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Voting Closed</AlertTitle>
          <AlertDescription>This proposal is no longer accepting votes. Status: {proposal.status}.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const handleVote = async () => {
    if (!choice || !walletAddress) return;
    setIsSubmitting(true);
    setStatusMsg("Checking eligibility...");

    try {
      let txId: string;

      if (isLiveElection) {
        // Real Vocdoni vote via CSP
        setStatusMsg("Getting census proof from backend...");
        const { signature, electionId } = await getCspProof(proposalId, walletAddress);

        setStatusMsg("Building Vocdoni vote transaction...");
        const privyWallet = wallets.find((w) => w.address.toLowerCase() === walletAddress.toLowerCase());
        if (!privyWallet) throw new Error("Wallet not found");

        const provider = await (privyWallet as any).getEthereumProvider();
        const { createWalletClient, custom } = await import("viem");
        const addr = walletAddress as `0x${string}`;
        const wc = createWalletClient({
          account: addr,
          transport: custom(provider),
        });

        // Minimal ethers-compatible signer adapter for Vocdoni SDK
        const signerAdapter = {
          getAddress: () => Promise.resolve(walletAddress),
          signMessage: (msg: string | Uint8Array) =>
            wc.signMessage({
              account: addr,
              message: typeof msg === "string" ? msg : { raw: msg as Uint8Array },
            }),
          _isSigner: true,
          provider: null,
        };

        const vocdoniEnv = (import.meta.env.VITE_VOCDONI_ENV as string) === "stg"
          ? EnvOptions.STG
          : (import.meta.env.VITE_VOCDONI_ENV as string) === "prod"
          ? EnvOptions.PROD
          : EnvOptions.DEV;

        const client = new VocdoniSDKClient({ env: vocdoniEnv, wallet: signerAdapter as any });
        client.setElectionId(electionId);

        setStatusMsg("Submitting vote to Vocdoni network...");
        const vote = new CspVote([CHOICE_INDEX[choice]]);
        txId = await client.cspVote(vote, signature, CspProofType.ECDSA);
      } else {
        // Fallback: mock tx for seeded proposals
        setStatusMsg("Submitting vote...");
        await new Promise((r) => setTimeout(r, 1500));
        txId = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
      }

      await castVoteMutation.mutateAsync({
        id: proposalId,
        data: { voterAddress: walletAddress, choice, chain: proposal.chain, txHash: txId },
      });

      setVoteTxId(txId);
      toast({ title: "Vote Cast Successfully", description: "Your vote is on-chain." });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Voting Failed",
        description: err?.message || "Please try again.",
      });
    } finally {
      setIsSubmitting(false);
      setStatusMsg("");
    }
  };

  const getExplorerUrl = () => {
    if (!voteTxId) return "#";
    if (isLiveElection) {
      return `https://dev.explorer.vote/process/${proposal.electionId}`;
    }
    if (proposal.chain === "celo") return `https://alfajores.celoscan.io/tx/${voteTxId}`;
    return `https://explorer.testnet.rootstock.io/tx/${voteTxId}`;
  };

  if (voteTxId) {
    return (
      <div className="max-w-2xl mx-auto mt-12 animate-in fade-in zoom-in duration-500">
        <Card className="rounded-none glass border-[#F7931A]/30">
          <CardContent className="p-12 flex flex-col items-center text-center space-y-6">
            <div className="h-24 w-24 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 mb-2">
              <CheckCircle2 className="h-12 w-12" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold uppercase tracking-tight text-white">Vote Confirmed</h2>
              <p className="text-white/50 font-mono text-sm">
                {isLiveElection ? "Cryptographic proof anchored on Vocdoni chain." : "Vote recorded."}
              </p>
            </div>
            <div className="w-full p-4 glass-terra border border-white/10 text-left space-y-3 font-mono text-sm rounded-sm">
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-white/40">Proposal</span>
                <span className="truncate max-w-[200px] font-bold text-white">{proposal.title}</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-white/40">Choice</span>
                <span className="uppercase font-bold text-[#F7931A]">{choice}</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-white/40">Network</span>
                <span className="uppercase font-bold text-white">{proposal.chain}</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-white/40">Tx / Vote ID</span>
                <a href={getExplorerUrl()} target="_blank" rel="noreferrer" className="text-[#F7931A] hover:underline flex items-center gap-1">
                  {voteTxId.slice(0, 10)}...{voteTxId.slice(-6)}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
            <Button
              className="w-full rounded-sm h-12 uppercase tracking-widest font-bold"
              style={{ background: "linear-gradient(135deg, #2D5A3A, #F7931A)" }}
              onClick={() => setLocation(`/proposals/${proposalId}`)}
            >
              Return to Proposal
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Link href={`/proposals/${proposal.id}`} className="text-xs font-mono text-white/40 hover:text-white flex items-center transition-colors">
        <ArrowLeft className="h-3 w-3 ml-1 mr-2" /> Cancel Voting
      </Link>

      {/* Live election badge */}
      {isLiveElection && (
        <div className="flex items-center gap-2 px-3 py-2 glass border border-green-500/20 rounded-sm">
          <Wifi className="h-3.5 w-3.5 text-green-400" />
          <span className="text-[11px] font-mono text-green-400">Live Vocdoni election · {proposal.chain.toUpperCase()} testnet</span>
          <span className="ml-auto text-[9px] font-mono text-white/30 truncate max-w-[120px]">{proposal.electionId?.slice(0, 12)}…</span>
        </div>
      )}

      <Card className="rounded-sm glass border-white/10 shadow-lg">
        <CardHeader className="border-b border-white/10 bg-white/5 pb-6">
          <div className="text-[10px] font-mono uppercase tracking-widest text-[#F7931A] mb-2">Cast Vote</div>
          <CardTitle className="text-2xl text-white">{proposal.title}</CardTitle>
          <CardDescription className="font-mono mt-2 text-white/40">
            Chain: <span className="uppercase font-bold text-white">{proposal.chain}</span> ·{" "}
            Census: <span className="uppercase font-bold text-white">{proposal.census}</span>
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 space-y-8">
          {!authenticated ? (
            <div className="py-8 text-center space-y-6">
              <div className="mx-auto w-16 h-16 glass rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="h-8 w-8 text-white/40" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">Wallet Required</h3>
                <p className="text-white/40 text-sm font-mono max-w-md mx-auto">
                  Connect a wallet holding {proposal.census.toUpperCase()} on{" "}
                  {proposal.chain === "celo" ? "Celo Alfajores" : "Rootstock Testnet"} to participate.
                </p>
              </div>
              <Button
                onClick={() => login()}
                className="rounded-sm h-12 px-8 uppercase tracking-widest font-bold"
                style={{ background: "linear-gradient(135deg, #2D5A3A, #F7931A)" }}
              >
                Connect Wallet to Vote
              </Button>
            </div>
          ) : (
            <>
              {/* Wallet + Balance Panel */}
              <div className="glass-terra border border-white/10 rounded-sm p-4 flex justify-between items-center font-mono text-sm">
                <div>
                  <div className="text-white/30 uppercase text-[10px] tracking-wider mb-1">Connected Wallet</div>
                  <div className="font-bold text-white">{walletAddress?.slice(0, 8)}...{walletAddress?.slice(-6)}</div>
                </div>
                <div className="text-right">
                  <div className="text-white/30 uppercase text-[10px] tracking-wider mb-1">Live Balance</div>
                  {balanceLoading ? (
                    <Skeleton className="h-5 w-24 bg-white/10 ml-auto" />
                  ) : balanceError ? (
                    <span className="text-red-400 text-xs">Error loading</span>
                  ) : (
                    <div className="font-bold text-[#F7931A]">
                      {formatted} {symbol}
                    </div>
                  )}
                </div>
              </div>

              {/* Balance gate warning */}
              {!balanceLoading && !hasVotingPower && balance !== null && (
                <Alert className="rounded-sm border-yellow-500/30 bg-yellow-500/10">
                  <AlertCircle className="h-4 w-4 text-yellow-400" />
                  <AlertTitle className="text-yellow-300">Insufficient Balance</AlertTitle>
                  <AlertDescription className="text-yellow-200/70 text-xs font-mono">
                    You need {symbol} on {proposal.chain === "rsk" ? "RSK Testnet" : "Celo Alfajores"} to vote.
                    Your current balance is {formatted} {symbol}.
                  </AlertDescription>
                </Alert>
              )}

              {/* Voting choices */}
              <div className="space-y-4">
                <h3 className="font-bold uppercase tracking-wider border-b border-white/10 pb-2 text-white text-sm">
                  Select Your Choice
                </h3>
                <RadioGroup
                  value={choice || ""}
                  onValueChange={(v) => setChoice(v as CastVoteBodyChoice)}
                  className="grid grid-cols-1 gap-3"
                >
                  {[
                    { value: "yes", label: "Yes", color: "text-green-400", activeBorder: "border-green-500 bg-green-500/10", desc: "Approve this proposal." },
                    { value: "no", label: "No", color: "text-red-400", activeBorder: "border-red-500 bg-red-500/10", desc: "Reject this proposal." },
                    { value: "abstain", label: "Abstain", color: "text-white/60", activeBorder: "border-white/40 bg-white/10", desc: "Register attendance without preference." },
                  ].map((opt) => (
                    <div
                      key={opt.value}
                      className={`relative border rounded-sm p-4 cursor-pointer transition-all ${
                        choice === opt.value ? opt.activeBorder : "border-white/10 hover:border-white/25 glass"
                      }`}
                    >
                      <RadioGroupItem value={opt.value} id={opt.value} className="absolute right-4 top-4" />
                      <Label htmlFor={opt.value} className="cursor-pointer flex flex-col gap-1 w-full h-full pr-8">
                        <span className={`font-bold text-lg uppercase tracking-widest ${opt.color}`}>{opt.label}</span>
                        <span className="text-xs text-white/30 font-mono">{opt.desc}</span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </>
          )}
        </CardContent>

        {authenticated && (
          <CardFooter className="p-6 border-t border-white/10 bg-white/5 flex-col gap-3">
            {statusMsg && (
              <div className="w-full flex items-center gap-2 text-[11px] font-mono text-white/50">
                <Loader2 className="h-3 w-3 animate-spin shrink-0" />
                {statusMsg}
              </div>
            )}
            <Button
              className="w-full rounded-sm h-14 uppercase tracking-widest font-bold text-lg"
              style={
                choice && !isSubmitting && hasVotingPower
                  ? { background: "linear-gradient(135deg, #2D5A3A, #F7931A)" }
                  : {}
              }
              disabled={!choice || isSubmitting || (!balanceLoading && !hasVotingPower && balance !== null)}
              onClick={handleVote}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Securing Vote...
                </>
              ) : (
                `Submit ${choice ? `"${choice.toUpperCase()}"` : ""} Vote`
              )}
            </Button>
            {isLiveElection && (
              <p className="text-[10px] font-mono text-white/25 text-center">
                Vote will be anchored on Vocdoni · {proposal.chain === "rsk" ? "RSK Testnet" : "Celo Alfajores"}
              </p>
            )}
          </CardFooter>
        )}
      </Card>
    </div>
  );
}

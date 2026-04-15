import { useState } from "react";
import { useLocation } from "wouter";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useCreateProposal } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ShieldPlus, TerminalSquare, Wallet, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CreateProposalBodyChain, CreateProposalBodyCensus } from "@workspace/api-zod";
import { useChainBalance } from "@/hooks/use-chain-balance";

export default function Admin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { login, authenticated, user } = usePrivy();
  const { wallets } = useWallets();
  const createProposalMutation = useCreateProposal();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signedTitle, setSignedTitle] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    chain: "rsk" as CreateProposalBodyChain,
    census: "rbtc" as CreateProposalBodyCensus,
    durationDays: "7",
  });

  const walletAddress = user?.wallet?.address;
  const chain = formData.chain as "rsk" | "celo";
  const { balance, formatted, symbol, loading: balanceLoading } = useChainBalance(walletAddress, chain);
  const hasBalance = balance !== null && balance > 0n;

  const handleChainChange = (value: CreateProposalBodyChain) => {
    setFormData({ ...formData, chain: value, census: value === "celo" ? "cusd" : "rbtc" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description) {
      toast({ variant: "destructive", title: "Missing fields", description: "Title and description are required." });
      return;
    }
    if (!walletAddress) {
      toast({ variant: "destructive", title: "Wallet required", description: "Connect a wallet first." });
      return;
    }

    setIsSubmitting(true);

    try {
      // Step 1: Sign the proposal intent with the connected Privy wallet
      const message = `Veritas Villages DAO: Creating proposal "${formData.title}" on ${formData.chain}`;

      const privyWallet = wallets.find(
        (w) => w.address.toLowerCase() === walletAddress.toLowerCase()
      );
      if (!privyWallet) throw new Error("Wallet not accessible");

      const provider = await (privyWallet as any).getEthereumProvider();

      // Switch to the correct chain so Privy shows RSK or Celo — not Base
      const targetChainId = formData.chain === "celo" ? "0xAEF3" : "0x1f"; // Celo Alfajores 44787 | RSK Testnet 31
      try {
        await provider.request({ method: "wallet_switchEthereumChain", params: [{ chainId: targetChainId }] });
      } catch (_) { /* wallet may already be on the right chain */ }

      const { createWalletClient, custom } = await import("viem");
      const walletClient = createWalletClient({
        account: walletAddress as `0x${string}`,
        transport: custom(provider),
      });
      const signature = await walletClient.signMessage({
        account: walletAddress as `0x${string}`,
        message,
      });

      setSignedTitle(formData.title);

      // Step 2: Submit the proposal with address + signature
      const endsAt = new Date();
      endsAt.setDate(endsAt.getDate() + parseInt(formData.durationDays, 10));

      const result = await createProposalMutation.mutateAsync({
        data: {
          title: formData.title,
          description: formData.description,
          chain: formData.chain,
          census: formData.census,
          endsAt: endsAt.toISOString(),
          creatorAddress: walletAddress,
          creatorSignature: signature,
        },
      });

      toast({ title: "Proposal Created", description: "Election anchored on Vocdoni." });
      setLocation(`/proposals/${result.id}`);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Creation Failed",
        description: err?.message || "Please try again.",
      });
      setSignedTitle(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!authenticated) {
    return (
      <div className="max-w-2xl mx-auto py-24 flex flex-col items-center gap-6 text-center animate-in fade-in duration-500">
        <div className="w-20 h-20 glass rounded-full flex items-center justify-center">
          <ShieldPlus className="h-10 w-10 text-[#F7931A]" />
        </div>
        <h1 className="text-2xl font-bold uppercase tracking-widest text-white">
          Governance Admin
        </h1>
        <p className="text-white/40 font-mono text-sm max-w-sm">
          Connect a wallet to create proposals. Your wallet signature will be used to authenticate each submission on-chain.
        </p>
        <Button
          size="lg"
          className="h-12 px-10 uppercase tracking-widest font-bold rounded-sm"
          style={{ background: "linear-gradient(135deg, #2D5A3A, #F7931A)" }}
          onClick={() => login()}
        >
          <Wallet className="mr-2 h-4 w-4" />
          Connect Wallet to Continue
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight uppercase flex items-center gap-3 text-white">
          <TerminalSquare className="h-8 w-8 text-[#F7931A]" />
          Governance Admin
        </h1>
        <p className="text-white/40 mt-1 font-mono text-sm">
          Initialize new sovereignty motions. Your wallet signs each proposal on-chain.
        </p>
      </div>

      {/* Wallet info bar */}
      <div className="flex items-center justify-between glass-terra border border-white/10 rounded-sm px-4 py-3 font-mono text-sm">
        <div className="flex items-center gap-2">
          <Wallet className="h-3.5 w-3.5 text-[#F7931A]" />
          <span className="text-white/60">{walletAddress?.slice(0, 8)}...{walletAddress?.slice(-6)}</span>
        </div>
        <div className="flex items-center gap-2">
          {balanceLoading ? (
            <span className="text-white/30 text-xs">Loading balance...</span>
          ) : (
            <span className={`text-xs font-bold ${hasBalance ? "text-green-400" : "text-red-400"}`}>
              {formatted} {symbol}
            </span>
          )}
          <span className={`w-1.5 h-1.5 rounded-full ${hasBalance ? "bg-green-400" : "bg-red-400"}`} />
        </div>
      </div>

      <Card className="rounded-sm glass border-white/10 shadow-none">
        <CardHeader className="bg-white/5 border-b border-white/10 pb-6">
          <CardTitle className="uppercase tracking-widest text-lg flex items-center gap-2 text-white">
            <ShieldPlus className="h-5 w-5 text-[#F7931A]" />
            Create Proposal
          </CardTitle>
          <CardDescription className="font-mono text-xs mt-2 text-white/40">
            On submit, your wallet will sign: <span className="text-[#F7931A]">"Veritas Villages DAO: Creating proposal …"</span>
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label className="uppercase tracking-wider text-xs text-white/40">Proposal Title</Label>
              <Input
                placeholder='e.g., "Allocate 5000 cUSD for Community Water Project"'
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="rounded-sm font-mono focus-visible:ring-[#F7931A] h-12 bg-white/5 border-white/15 text-white"
                required
              />
            </div>

            <div className="space-y-3">
              <Label className="uppercase tracking-wider text-xs text-white/40">Description</Label>
              <Textarea
                placeholder="Detail the motion, goals, and execution plan..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="rounded-sm font-mono focus-visible:ring-[#F7931A] min-h-[180px] bg-white/5 border-white/15 text-white"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-white/10">
              <div className="space-y-3">
                <Label className="uppercase tracking-wider text-xs text-white/40">Target Network</Label>
                <Select value={formData.chain} onValueChange={(v) => handleChainChange(v as CreateProposalBodyChain)}>
                  <SelectTrigger className="rounded-sm font-bold uppercase tracking-widest h-12 bg-white/5 border-white/15 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-sm font-mono bg-[#0a1a0f] border-white/15">
                    <SelectItem value="rsk" className="uppercase tracking-widest text-[#F7931A]">Rootstock (RSK Testnet)</SelectItem>
                    <SelectItem value="celo" className="uppercase tracking-widest text-green-400">Celo (Alfajores)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="uppercase tracking-wider text-xs text-white/40">Census Token</Label>
                <Select value={formData.census} onValueChange={(v) => setFormData({ ...formData, census: v as CreateProposalBodyCensus })}>
                  <SelectTrigger className="rounded-sm font-bold uppercase tracking-widest h-12 bg-white/5 border-white/15 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-sm font-mono bg-[#0a1a0f] border-white/15">
                    {formData.chain === "celo" && <SelectItem value="cusd" className="uppercase tracking-widest">cUSD</SelectItem>}
                    {formData.chain === "rsk" && <SelectItem value="rbtc" className="uppercase tracking-widest">rBTC</SelectItem>}
                  </SelectContent>
                </Select>
                <p className="text-[10px] font-mono text-white/30">Only wallets holding this token can vote.</p>
              </div>

              <div className="space-y-3 sm:col-span-2 border-t border-white/10 pt-4">
                <Label className="uppercase tracking-wider text-xs text-white/40">Voting Duration</Label>
                <Select value={formData.durationDays} onValueChange={(v) => setFormData({ ...formData, durationDays: v })}>
                  <SelectTrigger className="rounded-sm font-mono h-12 bg-white/5 border-white/15 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-sm font-mono bg-[#0a1a0f] border-white/15">
                    <SelectItem value="3">3 Days</SelectItem>
                    <SelectItem value="7">7 Days</SelectItem>
                    <SelectItem value="14">14 Days</SelectItem>
                    <SelectItem value="30">30 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Signing flow indicator */}
            <div className="flex flex-col gap-2 text-[11px] font-mono text-white/30 pt-2">
              <div className="flex items-center gap-2">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] border ${walletAddress ? "border-green-400 text-green-400" : "border-white/20"}`}>
                  {walletAddress ? "✓" : "1"}
                </span>
                Connect wallet
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] border ${signedTitle ? "border-green-400 text-green-400" : "border-white/20"}`}>
                  {signedTitle ? "✓" : "2"}
                </span>
                Sign proposal intent with wallet
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] border border-white/20">3</span>
                Create Vocdoni election + store on-chain
              </div>
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                className="w-full rounded-sm h-14 uppercase tracking-widest font-bold text-lg"
                style={
                  !isSubmitting
                    ? { background: "linear-gradient(135deg, #2D5A3A, #F7931A)" }
                    : {}
                }
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {signedTitle ? "Creating Vocdoni Election..." : "Waiting for Signature..."}
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    Sign & Create Proposal
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useCreateProposal } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ShieldPlus, TerminalSquare, Wallet, CheckCircle2, ImagePlus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CreateProposalBodyChain, CreateProposalBodyCensus } from "@workspace/api-zod";
import { useChainBalance } from "@/hooks/use-chain-balance";

interface UploadedImage {
  objectPath: string;
  previewUrl: string;
  name: string;
}

function PhotoUploadArea({
  images,
  onAdd,
  onRemove,
}: {
  images: UploadedImage[];
  onAdd: (img: UploadedImage) => void;
  onRemove: (objectPath: string) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || !files.length) return;
    setUploading(true);
    setUploadError(null);
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      try {
        const res = await fetch("/api/storage/uploads/request-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: file.name, size: file.size, contentType: file.type }),
        });
        if (!res.ok) throw new Error("Failed to get upload URL");
        const { uploadURL, objectPath } = await res.json();
        await fetch(uploadURL, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type },
        });
        onAdd({ objectPath, previewUrl: URL.createObjectURL(file), name: file.name });
      } catch (err: any) {
        setUploadError(err?.message || "Upload failed");
      }
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {images.map((img) => (
          <div key={img.objectPath} className="relative group w-24 h-24 border border-border overflow-hidden">
            <img src={img.previewUrl} alt={img.name} className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => onRemove(img.objectPath)}
              className="absolute top-1 right-1 bg-black/70 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-3 w-3 text-white" />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-24 h-24 border border-dashed border-white/20 hover:border-[#F7931A]/50 flex flex-col items-center justify-center gap-1 text-white/40 hover:text-[#F7931A]/70 transition-colors"
        >
          {uploading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <ImagePlus className="h-5 w-5" />
          )}
          <span className="text-[9px] uppercase tracking-wider font-mono">
            {uploading ? "Uploading..." : "Add Photo"}
          </span>
        </button>
      </div>

      {uploadError && (
        <p className="text-xs text-red-400 font-mono">{uploadError}</p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}

export default function Admin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { login, authenticated, user } = usePrivy();
  const { wallets } = useWallets();
  const createProposalMutation = useCreateProposal();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signedTitle, setSignedTitle] = useState<string | null>(null);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
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

      // Step 2: Anchor on RSK / Celo — send a 0-value tx with proposal data as calldata
      let anchorTxHash: string | null = null;
      try {
        const { toHex, defineChain } = await import("viem");
        const targetChain = formData.chain === "celo"
          ? defineChain({ id: 44787, name: "Celo Alfajores", nativeCurrency: { name: "CELO", symbol: "CELO", decimals: 18 }, rpcUrls: { default: { http: ["https://alfajores-forno.celo-testnet.org"] } } })
          : defineChain({ id: 31, name: "RSK Testnet", nativeCurrency: { name: "rBTC", symbol: "rBTC", decimals: 18 }, rpcUrls: { default: { http: ["https://public-node.testnet.rsk.co"] } } });

        const calldata = toHex(`VeritasDAO:${formData.title}:${formData.chain}:${walletAddress}`);
        anchorTxHash = await walletClient.sendTransaction({
          account: walletAddress as `0x${string}`,
          to: walletAddress as `0x${string}`,
          value: 0n,
          data: calldata,
          chain: targetChain,
        });
      } catch (txErr) {
        console.warn("On-chain anchor failed, continuing without TX hash:", txErr);
      }

      // Step 3: Submit the proposal with address + signature + anchor TX
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
          anchorTxHash,
          imageUrls: uploadedImages.length > 0 ? uploadedImages.map((img) => img.objectPath) : null,
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
        <div className="flex items-center gap-3">
          <img
            src={formData.chain === "celo" ? "/celo-logo.png" : "/rootstock-logo.png"}
            alt={formData.chain === "celo" ? "Celo" : "Rootstock"}
            className="h-4 w-auto object-contain"
            style={{ filter: formData.chain === "rsk" ? "invert(1)" : "none", opacity: 0.7 }}
          />
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

            <div className="space-y-3 pt-2">
              <Label className="uppercase tracking-wider text-xs text-white/40">
                Proposal Photos <span className="text-white/20 normal-case tracking-normal font-normal">(optional — stored in Veritas DAO App Storage)</span>
              </Label>
              <PhotoUploadArea
                images={uploadedImages}
                onAdd={(img) => setUploadedImages((prev) => [...prev, img])}
                onRemove={(path) => setUploadedImages((prev) => prev.filter((i) => i.objectPath !== path))}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 pt-4 border-t border-white/10">
              <div className="space-y-3">
                <Label className="uppercase tracking-wider text-xs text-white/40">Target Network</Label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    {
                      value: "rsk" as CreateProposalBodyChain,
                      label: "Rootstock",
                      sublabel: "RSK Testnet · rBTC census",
                      logo: "/rootstock-logo.png",
                      color: "#F7931A",
                      census: "rbtc",
                    },
                    {
                      value: "celo" as CreateProposalBodyChain,
                      label: "Celo",
                      sublabel: "Alfajores · cUSD census",
                      logo: "/celo-logo.png",
                      color: "#35D07F",
                      census: "cusd",
                    },
                  ].map((net) => {
                    const active = formData.chain === net.value;
                    return (
                      <button
                        key={net.value}
                        type="button"
                        onClick={() => handleChainChange(net.value)}
                        className={`flex flex-col items-center gap-2 px-4 py-4 rounded-sm border-2 transition-all duration-150 ${
                          active
                            ? "bg-white/8 border-current"
                            : "border-white/10 hover:border-white/25 hover:bg-white/5"
                        }`}
                        style={active ? { borderColor: net.color } : {}}
                      >
                        <img
                          src={net.logo}
                          alt={net.label}
                          className="h-8 w-auto object-contain"
                          style={{
                            filter: net.value === "rsk" ? "invert(1)" : "none",
                            opacity: active ? 1 : 0.4,
                          }}
                        />
                        <div className="text-center">
                          <p className={`font-bold text-xs uppercase tracking-widest ${active ? "text-white" : "text-white/40"}`}
                            style={active ? { color: net.color } : {}}>
                            {net.label}
                          </p>
                          <p className="font-mono text-[9px] text-white/30 mt-0.5">{net.sublabel}</p>
                        </div>
                        {active && (
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: net.color }} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="uppercase tracking-wider text-xs text-white/40">Census Token</Label>
                <div className={`flex items-center gap-3 px-4 py-3 rounded-sm border font-mono text-sm ${
                  formData.chain === "celo" ? "border-[#35D07F]/40 bg-[#35D07F]/5 text-[#35D07F]" : "border-[#F7931A]/40 bg-[#F7931A]/5 text-[#F7931A]"
                }`}>
                  <span className="text-lg font-bold">{formData.census === "rbtc" ? "₿" : "$"}</span>
                  <div>
                    <p className="font-bold uppercase tracking-widest text-sm">{formData.census === "rbtc" ? "rBTC" : "cUSD"}</p>
                    <p className="text-[10px] opacity-60">Only holders can vote</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
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
                Sign proposal intent (EIP-191)
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] border border-white/20">3</span>
                Anchor TX on {formData.chain === "celo" ? "Celo Alfajores" : "RSK Testnet"} → real TX hash
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] border border-white/20">4</span>
                Create Vocdoni election + save proposal
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

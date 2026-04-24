import { useState, useEffect, useCallback } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useChainBalance } from "@/hooks/use-chain-balance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowRightLeft, Bitcoin, Loader2, ExternalLink, Droplets,
  ArrowDown, RefreshCw, Info, CheckCircle2, Copy, Wallet
} from "lucide-react";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

// ─── Chain configs ────────────────────────────────────────────────────────────
const CHAINS = {
  rsk: {
    id: 31,
    hexId: "0x1f",
    name: "RSK Testnet",
    symbol: "rBTC",
    logo: `${BASE}/rootstock-logo.png`,
    logoFilter: "invert(1)",
    color: "#F7931A",
    rpc: "https://public-node.testnet.rsk.co",
    explorer: "https://explorer.testnet.rsk.co",
    faucetUrl: "https://faucet.rsk.co/",
    faucetLabel: "RSK Testnet Faucet",
  },
  celo: {
    id: 44787,
    hexId: "0xAEF3",
    name: "Celo Alfajores",
    symbol: "CELO",
    logo: `${BASE}/celo-logo.png`,
    logoFilter: "none",
    color: "#35D07F",
    rpc: "https://alfajores-forno.celo-testnet.org",
    explorer: "https://alfajores.celoscan.io",
    faucetUrl: "https://faucet.celo.org/alfajores",
    faucetLabel: "Celo Alfajores Faucet",
  },
} as const;

type ChainKey = keyof typeof CHAINS;

// ─── Squid Router helpers ─────────────────────────────────────────────────────
const SQUID_API = "https://apiplus.squidrouter.com/v2";
const SQUID_INTEGRATOR = "veritas-dao";

interface SquidRoute {
  estimate: {
    fromAmount: string;
    toAmount: string;
    toAmountMin: string;
    feeCosts: Array<{ amount: string; token: { symbol: string } }>;
    gasCosts: Array<{ amount: string; token: { symbol: string } }>;
    exchangeRate: string;
  };
  transactionRequest: {
    to: string;
    data: string;
    value: string;
    gasLimit: string;
    gasPrice?: string;
    chainId: number;
  };
}

async function fetchSquidRoute(
  fromChainId: number,
  toChainId: number,
  fromToken: string,
  toToken: string,
  fromAmount: string,
  fromAddress: string
): Promise<SquidRoute | null> {
  try {
    const res = await fetch(`${SQUID_API}/route`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-integrator-id": SQUID_INTEGRATOR,
      },
      body: JSON.stringify({
        fromChain: fromChainId,
        toChain: toChainId,
        fromToken,
        toToken,
        fromAmount,
        fromAddress,
        toAddress: fromAddress,
        slippage: 1,
        enableForecall: true,
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.route ?? null;
  } catch {
    return null;
  }
}

// ─── Native token addresses (Squid uses these for native assets) ──────────────
const NATIVE = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

// ─── Sub-components ───────────────────────────────────────────────────────────

function ChainBadge({ chainKey }: { chainKey: ChainKey }) {
  const c = CHAINS[chainKey];
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm border text-[10px] font-mono font-bold uppercase tracking-widest"
      style={{ borderColor: `${c.color}50`, color: c.color, background: `${c.color}10` }}>
      <img src={c.logo} alt={c.name} className="h-3 w-3 object-contain"
        style={{ filter: c.logoFilter }} />
      {c.symbol}
    </span>
  );
}

function BalancePill({ address, chain }: { address?: string; chain: "rsk" | "celo" }) {
  const { formatted, symbol, loading } = useChainBalance(address, chain);
  const c = CHAINS[chain];
  if (!address) return null;
  return (
    <span className="font-mono text-[11px]" style={{ color: c.color }}>
      {loading ? "…" : `${formatted} ${symbol}`}
    </span>
  );
}

// ─── BTC ↔ rBTC PowPeg Tab ───────────────────────────────────────────────────
function PowpegTab() {
  const { authenticated, user } = usePrivy();
  const address = user?.wallet?.address;
  const [copied, setCopied] = useState(false);

  const copy = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass-terra border border-[#F7931A]/20 rounded-sm p-5">
        <div className="flex items-center gap-3 mb-3">
          <Bitcoin className="h-6 w-6 text-[#F7931A]" />
          <div>
            <h3 className="font-bold text-white uppercase tracking-widest text-sm">Rootstock PowPeg</h3>
            <p className="text-white/40 font-mono text-[10px]">Bitcoin-native, 2-way peg secured by HSMs</p>
          </div>
        </div>

        {/* Flow diagram */}
        <div className="grid grid-cols-3 gap-2 items-center my-5">
          <div className="glass rounded-sm p-3 text-center">
            <Bitcoin className="h-6 w-6 text-[#F7931A] mx-auto mb-1" />
            <div className="font-bold text-white text-xs uppercase tracking-widest">BTC</div>
            <div className="text-white/30 font-mono text-[9px] mt-0.5">Bitcoin</div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <ArrowRightLeft className="h-5 w-5 text-white/30" />
            <span className="text-[8px] font-mono text-white/25 text-center">~100 blocks<br/>≈16 hrs</span>
          </div>
          <div className="glass rounded-sm p-3 text-center" style={{ borderColor: "#F7931A30", background: "#F7931A08" }}>
            <img src={`${BASE}/rootstock-logo.png`} alt="RSK" className="h-6 w-6 mx-auto mb-1 object-contain" style={{ filter: "invert(1)" }} />
            <div className="font-bold text-[#F7931A] text-xs uppercase tracking-widest">rBTC</div>
            <div className="text-[#F7931A]/40 font-mono text-[9px] mt-0.5">Rootstock</div>
          </div>
        </div>

        {/* User's RSK address */}
        {authenticated && address ? (
          <div className="space-y-2">
            <Label className="uppercase tracking-wider text-xs text-white/40">Your RSK deposit address</Label>
            <div className="flex items-center gap-2 glass px-3 py-2.5 rounded-sm font-mono text-xs text-white/70">
              <Wallet className="h-3.5 w-3.5 text-[#F7931A] shrink-0" />
              <span className="flex-1 truncate">{address}</span>
              <button onClick={copy} className="shrink-0 hover:text-white transition-colors">
                {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
            <p className="text-[10px] font-mono text-white/25">
              Use this address as your Rootstock destination when using the PowPeg.
            </p>
            <div className="flex items-center gap-2 text-[#F7931A]/60 font-mono text-[10px]">
              <BalancePill address={address} chain="rsk" />
              <span className="text-white/20">current rBTC balance</span>
            </div>
          </div>
        ) : (
          <div className="glass px-3 py-3 rounded-sm text-center text-white/30 font-mono text-xs">
            Connect wallet to see your RSK deposit address
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <a
          href="https://app.rootstock.io/rbtc"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between gap-3 glass px-4 py-3 rounded-sm hover:bg-white/5 transition-colors group"
        >
          <div>
            <div className="font-bold text-white text-xs uppercase tracking-widest">Mainnet PowPeg</div>
            <div className="font-mono text-[10px] text-white/30 mt-0.5">app.rootstock.io/rbtc</div>
          </div>
          <ExternalLink className="h-4 w-4 text-white/20 group-hover:text-[#F7931A] transition-colors shrink-0" />
        </a>
        <a
          href="https://faucet.rsk.co/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between gap-3 glass px-4 py-3 rounded-sm hover:bg-white/5 transition-colors group border border-[#F7931A]/20"
        >
          <div>
            <div className="font-bold text-[#F7931A] text-xs uppercase tracking-widest">RSK Testnet Faucet</div>
            <div className="font-mono text-[10px] text-white/30 mt-0.5">Get free tRBTC</div>
          </div>
          <Droplets className="h-4 w-4 text-[#F7931A]/40 group-hover:text-[#F7931A] transition-colors shrink-0" />
        </a>
      </div>

      <div className="glass rounded-sm px-4 py-3 space-y-2 border border-white/5">
        <div className="flex items-start gap-2 text-[11px] font-mono text-white/40">
          <Info className="h-3.5 w-3.5 shrink-0 mt-0.5 text-white/25" />
          <span>1 BTC = 1 rBTC, always. The PowPeg is a federation of HSMs that lock BTC on Bitcoin and release rBTC on Rootstock.</span>
        </div>
        <div className="flex items-start gap-2 text-[11px] font-mono text-white/40">
          <Info className="h-3.5 w-3.5 shrink-0 mt-0.5 text-white/25" />
          <span>Peg-out (rBTC → BTC) also takes ~100 RSK block confirmations.</span>
        </div>
      </div>
    </div>
  );
}

// ─── Cross-chain Swap Tab (Squid Router) ──────────────────────────────────────
function SwapTab() {
  const { authenticated, user } = usePrivy();
  const { wallets } = useWallets();
  const { toast } = useToast();
  const address = user?.wallet?.address;

  const [fromChain, setFromChain] = useState<ChainKey>("rsk");
  const [toChain, setToChain] = useState<ChainKey>("celo");
  const [amount, setAmount] = useState("");
  const [route, setRoute] = useState<SquidRoute | null>(null);
  const [fetchingRoute, setFetchingRoute] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const fromC = CHAINS[fromChain];
  const toC = CHAINS[toChain];

  const swap = () => {
    const prev = fromChain;
    setFromChain(toChain);
    setToChain(prev);
    setRoute(null);
    setAmount("");
    setTxHash(null);
  };

  const getRoute = useCallback(async () => {
    if (!amount || !address || isNaN(Number(amount)) || Number(amount) <= 0) return;
    setFetchingRoute(true);
    setRoute(null);
    try {
      const fromAmountWei = BigInt(Math.floor(Number(amount) * 1e18)).toString();
      const r = await fetchSquidRoute(
        fromC.id, toC.id,
        NATIVE, NATIVE,
        fromAmountWei,
        address
      );
      if (r) {
        setRoute(r);
      } else {
        toast({
          variant: "destructive",
          title: "Route not available",
          description: `Squid Router does not currently support ${fromC.name} → ${toC.name} on testnet. Use the faucets to get testnet tokens.`,
        });
      }
    } finally {
      setFetchingRoute(false);
    }
  }, [amount, address, fromC, toC, toast]);

  const executeSwap = async () => {
    if (!route || !address) return;
    setExecuting(true);
    try {
      const wallet = wallets.find(w => w.address.toLowerCase() === address.toLowerCase());
      if (!wallet) throw new Error("Wallet not found");

      const provider = await (wallet as any).getEthereumProvider();
      try {
        await provider.request({ method: "wallet_switchEthereumChain", params: [{ chainId: fromC.hexId }] });
      } catch {}

      const { createWalletClient, custom, defineChain } = await import("viem");
      const chain = defineChain({
        id: fromC.id,
        name: fromC.name,
        nativeCurrency: { name: fromC.symbol, symbol: fromC.symbol, decimals: 18 },
        rpcUrls: { default: { http: [fromC.rpc] } },
      });
      const client = createWalletClient({ account: address as `0x${string}`, transport: custom(provider) });
      const tx = route.transactionRequest;

      const hash = await client.sendTransaction({
        account: address as `0x${string}`,
        to: tx.to as `0x${string}`,
        data: tx.data as `0x${string}`,
        value: BigInt(tx.value || "0"),
        chain,
      });
      setTxHash(hash);
      toast({ title: "Swap submitted!", description: `TX: ${hash.slice(0, 18)}…` });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Swap failed", description: err?.message || "Transaction rejected." });
    } finally {
      setExecuting(false);
    }
  };

  const toAmountFormatted = route
    ? (Number(route.estimate.toAmount) / 1e18).toFixed(6)
    : "—";
  const totalFee = route
    ? route.estimate.feeCosts.reduce((s, f) => s + Number(f.amount) / 1e18, 0).toFixed(6)
    : null;

  return (
    <div className="space-y-5">
      {/* Chain selector row */}
      <div className="flex items-center gap-3">
        <div className="flex-1 space-y-1.5">
          <Label className="uppercase tracking-wider text-[10px] text-white/30">From</Label>
          <div className="glass rounded-sm p-3 flex items-center gap-2.5" style={{ borderColor: `${fromC.color}30` }}>
            <img src={fromC.logo} alt={fromC.name} className="h-5 w-5 object-contain" style={{ filter: fromC.logoFilter }} />
            <div>
              <div className="font-bold text-xs uppercase tracking-widest" style={{ color: fromC.color }}>{fromC.symbol}</div>
              <div className="font-mono text-[9px] text-white/30">{fromC.name}</div>
            </div>
            {address && <div className="ml-auto"><BalancePill address={address} chain={fromChain} /></div>}
          </div>
        </div>

        <button
          onClick={swap}
          className="mt-6 glass p-2.5 rounded-sm hover:bg-white/10 transition-colors group"
          title="Swap direction"
        >
          <ArrowRightLeft className="h-4 w-4 text-white/40 group-hover:text-white transition-colors" />
        </button>

        <div className="flex-1 space-y-1.5">
          <Label className="uppercase tracking-wider text-[10px] text-white/30">To</Label>
          <div className="glass rounded-sm p-3 flex items-center gap-2.5" style={{ borderColor: `${toC.color}30` }}>
            <img src={toC.logo} alt={toC.name} className="h-5 w-5 object-contain" style={{ filter: toC.logoFilter }} />
            <div>
              <div className="font-bold text-xs uppercase tracking-widest" style={{ color: toC.color }}>{toC.symbol}</div>
              <div className="font-mono text-[9px] text-white/30">{toC.name}</div>
            </div>
            {address && <div className="ml-auto"><BalancePill address={address} chain={toChain} /></div>}
          </div>
        </div>
      </div>

      {/* Amount input */}
      <div className="space-y-2">
        <Label className="uppercase tracking-wider text-[10px] text-white/30">Amount ({fromC.symbol})</Label>
        <div className="relative">
          <Input
            type="number"
            min="0"
            step="any"
            placeholder="0.000000"
            value={amount}
            onChange={e => { setAmount(e.target.value); setRoute(null); setTxHash(null); }}
            className="rounded-sm font-mono text-lg h-14 pr-24 bg-white/5 border-white/15 text-white focus-visible:ring-[#F7931A]"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            <img src={fromC.logo} alt={fromC.symbol} className="h-4 w-4 object-contain" style={{ filter: fromC.logoFilter }} />
            <span className="font-bold text-sm" style={{ color: fromC.color }}>{fromC.symbol}</span>
          </div>
        </div>
      </div>

      {/* Get Route button */}
      <Button
        onClick={getRoute}
        disabled={!authenticated || !amount || Number(amount) <= 0 || fetchingRoute}
        variant="outline"
        className="w-full h-11 uppercase tracking-widest text-xs border-white/20 text-white/60 hover:text-white hover:border-white/40"
      >
        {fetchingRoute ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Fetching route…</> : <><RefreshCw className="mr-2 h-4 w-4" /> Get Route via Squid Router</>}
      </Button>

      {/* Route result */}
      {route && (
        <div className="glass rounded-sm p-4 space-y-3 border border-green-400/20">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="h-4 w-4 text-green-400" />
            <span className="text-green-400 text-xs font-mono uppercase tracking-widest font-bold">Route found</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ChainBadge chainKey={fromChain} />
              <ArrowDown className="h-3.5 w-3.5 text-white/30" />
              <ChainBadge chainKey={toChain} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-[11px] font-mono">
            <div className="glass rounded-sm px-3 py-2">
              <div className="text-white/30 mb-0.5">You receive</div>
              <div className="font-bold text-white">{toAmountFormatted} {toC.symbol}</div>
            </div>
            <div className="glass rounded-sm px-3 py-2">
              <div className="text-white/30 mb-0.5">Bridge fee</div>
              <div className="font-bold text-white/70">{totalFee} {fromC.symbol}</div>
            </div>
          </div>
        </div>
      )}

      {/* TX hash */}
      {txHash && (
        <div className="glass rounded-sm px-4 py-3 flex items-center gap-2 border border-green-400/30">
          <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0" />
          <span className="font-mono text-[11px] text-white/60 truncate flex-1">{txHash}</span>
          <a href={`${fromC.explorer}/tx/${txHash}`} target="_blank" rel="noreferrer">
            <ExternalLink className="h-3.5 w-3.5 text-white/30 hover:text-white" />
          </a>
        </div>
      )}

      {/* Execute */}
      {!authenticated ? (
        <div className="glass px-4 py-3 rounded-sm text-center font-mono text-xs text-white/30">
          Connect wallet to bridge assets
        </div>
      ) : (
        <Button
          onClick={executeSwap}
          disabled={!route || executing}
          className="w-full h-14 uppercase tracking-widest font-bold text-sm rounded-sm"
          style={route && !executing ? { background: "linear-gradient(135deg, #2D5A3A, #F7931A)" } : {}}
        >
          {executing ? (
            <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Executing swap…</>
          ) : (
            <><ArrowRightLeft className="mr-2 h-5 w-5" /> Execute Bridge Swap</>
          )}
        </Button>
      )}

      <div className="flex items-start gap-2 text-[10px] font-mono text-white/25">
        <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
        <span>Routes are fetched live from Squid Router v2 API. Testnet pairs (RSK 31, Celo 44787) may not have liquidity — use faucets for testnet tokens.</span>
      </div>
    </div>
  );
}

// ─── Faucets Tab ──────────────────────────────────────────────────────────────
function FaucetsTab() {
  const { user } = usePrivy();
  const address = user?.wallet?.address;
  const [copied, setCopied] = useState(false);

  const copy = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const faucets = [
    {
      name: "RSK Testnet Faucet",
      description: "Get free tRBTC for RSK Testnet (chainId 31)",
      url: `https://faucet.rsk.co/`,
      chain: "rsk" as const,
      token: "tRBTC",
      color: "#F7931A",
      logo: `${BASE}/rootstock-logo.png`,
      logoFilter: "invert(1)",
    },
    {
      name: "Celo Alfajores Faucet",
      description: "Get free CELO + cUSD for Celo Alfajores (chainId 44787)",
      url: "https://faucet.celo.org/alfajores",
      chain: "celo" as const,
      token: "CELO + cUSD",
      color: "#35D07F",
      logo: `${BASE}/celo-logo.png`,
      logoFilter: "none",
    },
  ];

  return (
    <div className="space-y-5">
      {address && (
        <div className="glass rounded-sm px-4 py-3 flex items-center gap-3">
          <Wallet className="h-4 w-4 text-[#F7931A] shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-[10px] text-white/30 font-mono uppercase tracking-widest mb-0.5">Your wallet address</div>
            <div className="font-mono text-xs text-white/70 truncate">{address}</div>
          </div>
          <button onClick={copy} className="shrink-0 hover:text-white text-white/30 transition-colors">
            {copied ? <CheckCircle2 className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
      )}

      <p className="text-[11px] font-mono text-white/30">
        Copy your wallet address above and paste it into the faucet to receive testnet tokens.
      </p>

      {faucets.map((f) => (
        <a
          key={f.chain}
          href={f.url}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-4 glass px-5 py-4 rounded-sm transition-all hover:bg-white/5 group border"
          style={{ borderColor: `${f.color}25` }}
        >
          <img src={f.logo} alt={f.name} className="h-8 w-8 object-contain shrink-0"
            style={{ filter: f.logoFilter, opacity: 0.8 }} />
          <div className="flex-1 min-w-0">
            <div className="font-bold uppercase tracking-widest text-sm" style={{ color: f.color }}>{f.name}</div>
            <div className="font-mono text-[10px] text-white/30 mt-0.5">{f.description}</div>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <span className="font-mono text-xs font-bold" style={{ color: f.color }}>{f.token}</span>
            {address && <BalancePill address={address} chain={f.chain} />}
          </div>
          <ExternalLink className="h-4 w-4 text-white/20 group-hover:text-white/60 shrink-0 transition-colors" />
        </a>
      ))}

      {/* Mainnet bridge links */}
      <div className="pt-2 border-t border-white/10">
        <p className="text-[9px] font-mono uppercase tracking-widest text-white/20 mb-3">Mainnet bridges</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { label: "Rootstock PowPeg", sub: "BTC ↔ rBTC", url: "https://app.rootstock.io/rbtc", color: "#F7931A" },
            { label: "Squid Router", sub: "Cross-chain EVM", url: "https://app.squidrouter.com/", color: "#35D07F" },
            { label: "Li.Fi", sub: "Multi-chain bridge", url: "https://jumper.exchange/", color: "#8B5CF6" },
            { label: "Wormhole Portal", sub: "Celo + 20 chains", url: "https://portalbridge.com/", color: "#64B5F6" },
          ].map((b) => (
            <a key={b.label} href={b.url} target="_blank" rel="noreferrer"
              className="flex items-center justify-between gap-3 glass px-3 py-2.5 rounded-sm hover:bg-white/5 transition-colors group">
              <div>
                <div className="font-mono text-xs font-bold" style={{ color: b.color }}>{b.label}</div>
                <div className="font-mono text-[9px] text-white/25">{b.sub}</div>
              </div>
              <ExternalLink className="h-3.5 w-3.5 text-white/20 group-hover:text-white/50 shrink-0" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Bridge page ─────────────────────────────────────────────────────────
export default function Bridge() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight uppercase flex items-center gap-3 text-white">
          <ArrowRightLeft className="h-8 w-8 text-[#F7931A]" />
          Asset Bridge
        </h1>
        <p className="text-white/40 mt-1 font-mono text-sm">
          Move assets between Bitcoin, Rootstock, and Celo to participate in governance.
        </p>
      </div>

      {/* Live chain status */}
      <div className="grid grid-cols-2 gap-3">
        {(["rsk", "celo"] as ChainKey[]).map((k) => {
          const c = CHAINS[k];
          return (
            <div key={k} className="glass rounded-sm px-4 py-3 flex items-center gap-3"
              style={{ borderColor: `${c.color}20` }}>
              <img src={c.logo} alt={c.name} className="h-5 w-5 object-contain" style={{ filter: c.logoFilter }} />
              <div className="flex-1 min-w-0">
                <div className="font-bold text-[10px] uppercase tracking-widest" style={{ color: c.color }}>{c.symbol}</div>
                <div className="font-mono text-[9px] text-white/30 truncate">{c.name}</div>
              </div>
              <span className="text-[9px] font-mono uppercase tracking-wider" style={{ color: c.color }}>Live</span>
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: c.color }} />
            </div>
          );
        })}
      </div>

      {/* Main tab panel */}
      <Tabs defaultValue="powpeg" className="w-full">
        <TabsList className="w-full grid grid-cols-3 h-11 rounded-sm bg-white/5 p-1">
          <TabsTrigger value="powpeg" className="rounded-sm text-[10px] uppercase tracking-widest font-mono data-[state=active]:bg-[#F7931A] data-[state=active]:text-black">
            <Bitcoin className="h-3.5 w-3.5 mr-1.5" /> BTC ↔ rBTC
          </TabsTrigger>
          <TabsTrigger value="swap" className="rounded-sm text-[10px] uppercase tracking-widest font-mono data-[state=active]:bg-[#2D5A3A] data-[state=active]:text-white">
            <ArrowRightLeft className="h-3.5 w-3.5 mr-1.5" /> Cross-chain
          </TabsTrigger>
          <TabsTrigger value="faucets" className="rounded-sm text-[10px] uppercase tracking-widest font-mono data-[state=active]:bg-white/15 data-[state=active]:text-white">
            <Droplets className="h-3.5 w-3.5 mr-1.5" /> Faucets
          </TabsTrigger>
        </TabsList>

        <TabsContent value="powpeg" className="mt-5">
          <PowpegTab />
        </TabsContent>
        <TabsContent value="swap" className="mt-5">
          <SwapTab />
        </TabsContent>
        <TabsContent value="faucets" className="mt-5">
          <FaucetsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { useState, useCallback } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useChainBalance } from "@/hooks/use-chain-balance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowRightLeft, Bitcoin, Loader2, ExternalLink, Droplets,
  Info, CheckCircle2, Copy, Wallet, PlusCircle, Send,
  AlertCircle, RefreshCw, ArrowDown, Zap, Building2, CreditCard,
  ShieldCheck, Globe,
} from "lucide-react";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

// ─── Chain configs ─────────────────────────────────────────────────────────────
const CHAINS = {
  rsk: {
    id: 30,
    hexId: "0x1e",
    name: "Rootstock",
    symbol: "rBTC",
    logo: `${BASE}/rootstock-logo.png`,
    logoFilter: "invert(1)",
    color: "#F7931A",
    rpc: "https://public-node.rsk.co",
    explorer: "https://explorer.rsk.co",
    faucetUrl: "https://faucet.rsk.co/",
    faucetToken: "rBTC",
    blockExplorerName: "RSK Explorer",
    mainnet: true,
  },
  celo: {
    id: 42220,
    hexId: "0xA4EC",
    name: "Celo",
    symbol: "CELO",
    logo: `${BASE}/celo-logo.png`,
    logoFilter: "brightness(0) invert(1)",
    color: "#35D07F",
    rpc: "https://forno.celo.org",
    explorer: "https://celoscan.io",
    faucetUrl: "https://faucet.celo.org/celo-sepolia",
    faucetToken: "CELO",
    blockExplorerName: "Celoscan",
    mainnet: true,
  },
  rskTestnet: {
    id: 31,
    hexId: "0x1f",
    name: "RSK Testnet",
    symbol: "tRBTC",
    logo: `${BASE}/rootstock-logo.png`,
    logoFilter: "invert(1)",
    color: "#F7931A",
    rpc: "https://public-node.testnet.rsk.co",
    explorer: "https://explorer.testnet.rsk.co",
    faucetUrl: "https://faucet.rsk.co/",
    faucetToken: "tRBTC",
    blockExplorerName: "RSK Explorer",
    mainnet: false,
  },
  celoTestnet: {
    id: 11142220,
    hexId: "0xAA044C",
    name: "Celo Sepolia",
    symbol: "CELO",
    logo: `${BASE}/celo-logo.png`,
    logoFilter: "brightness(0) invert(1)",
    color: "#35D07F",
    rpc: "https://forno.celo.org/sepolia",
    explorer: "https://celo-sepolia.blockscout.com",
    faucetUrl: "https://faucet.celo.org/celo-sepolia",
    faucetToken: "CELO",
    blockExplorerName: "Blockscout",
    mainnet: false,
  },
} as const;

type ChainKey = keyof typeof CHAINS;

// ─── Shared helpers ────────────────────────────────────────────────────────────
function BalancePill({ address, chain }: { address?: string; chain: ChainKey }) {
  const { formatted, symbol, loading, refresh } = useChainBalance(address, chain);
  const c = CHAINS[chain];
  if (!address) return null;
  return (
    <button
      onClick={refresh}
      className="flex items-center gap-1.5 font-mono text-[11px] hover:opacity-80 transition-opacity group"
      title="Refresh balance"
    >
      <span style={{ color: c.color }}>{loading ? "…" : `${formatted} ${symbol}`}</span>
      <RefreshCw className="h-2.5 w-2.5 text-white/20 group-hover:text-white/50 transition-colors" />
    </button>
  );
}

function CopyableAddress({ address }: { address: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="flex items-center gap-2 glass px-3 py-2.5 rounded-sm font-mono text-xs text-white/70">
      <Wallet className="h-3.5 w-3.5 text-[#F7931A] shrink-0" />
      <span className="flex-1 truncate">{address}</span>
      <button onClick={copy} className="shrink-0 hover:text-white transition-colors">
        {copied
          ? <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
          : <Copy className="h-3.5 w-3.5 text-white/30" />}
      </button>
    </div>
  );
}

// ─── "Add Network" helper ──────────────────────────────────────────────────────
async function addNetworkToWallet(provider: any, key: ChainKey) {
  const c = CHAINS[key];
  await provider.request({
    method: "wallet_addEthereumChain",
    params: [{
      chainId: c.hexId,
      chainName: c.name,
      nativeCurrency: { name: c.symbol, symbol: c.symbol, decimals: 18 },
      rpcUrls: [c.rpc],
      blockExplorerUrls: [c.explorer],
    }],
  });
}

// ─── Tab 1: Get rBTC (mirrors rootstock.io/rbtc/#get-rbtc) ────────────────────
type GetRbtcMethod = "btc" | "digital" | "fiat";

interface RbtcOption {
  name: string;
  icon: React.ReactNode;
  description: string;
  badge?: string;
  badgeColor?: string;
  url: string;
  cta: string;
}

const WITH_BTC_OPTIONS: RbtcOption[] = [
  {
    name: "PowPeg",
    icon: <img src={`${BASE}/rootstock-logo.png`} alt="PowPeg" className="h-6 w-6 object-contain" style={{ filter: "invert(1)" }} />,
    description: "The most direct and native mechanism for acquiring rBTC with your BTC. 1:1 peg secured by Bitcoin merge-mining and HSMs.",
    badge: "Native · 1:1",
    badgeColor: "#F7931A",
    url: "https://powpeg.rootstock.io",
    cta: "Go to PowPeg",
  },
  {
    name: "Boltz",
    icon: <Zap className="h-6 w-6 text-yellow-400" />,
    description: "Non-custodial Bitcoin bridge built to swap between different Bitcoin layers like Rootstock and the Lightning Network.",
    badge: "Lightning · Fast",
    badgeColor: "#EAB308",
    url: "https://boltz.exchange",
    cta: "Go to Boltz",
  },
];

const WITH_DIGITAL_OPTIONS: RbtcOption[] = [
  {
    name: "Sovryn",
    icon: <Globe className="h-6 w-6 text-orange-400" />,
    description: "RSK-native DEX and money protocol. Swap stablecoins or RIF tokens for rBTC directly on Rootstock.",
    badge: "DEX · RSK-native",
    badgeColor: "#F7931A",
    url: "https://sovryn.app/",
    cta: "Trade on Sovryn",
  },
  {
    name: "KuCoin",
    icon: <Building2 className="h-6 w-6 text-green-400" />,
    description: "Buy rBTC on KuCoin with USDT, BTC or other digital assets and withdraw to your RSK wallet.",
    badge: "CEX",
    badgeColor: "#22C55E",
    url: "https://www.kucoin.com/trade/RBTC-USDT",
    cta: "Buy on KuCoin",
  },
  {
    name: "Binance",
    icon: <Building2 className="h-6 w-6 text-yellow-400" />,
    description: "Purchase rBTC via Binance with crypto assets and withdraw to your Rootstock address.",
    badge: "CEX",
    badgeColor: "#EAB308",
    url: "https://www.binance.com",
    cta: "Open Binance",
  },
  {
    name: "Gate.io",
    icon: <Building2 className="h-6 w-6 text-blue-400" />,
    description: "Trade rBTC pairs on Gate.io. Supports multiple base assets including USDT and BTC.",
    badge: "CEX",
    badgeColor: "#60A5FA",
    url: "https://www.gate.io",
    cta: "Open Gate.io",
  },
];

const WITH_FIAT_OPTIONS: RbtcOption[] = [
  {
    name: "Mt Pelerin",
    icon: <CreditCard className="h-6 w-6 text-blue-300" />,
    description: "Buy rBTC directly with bank transfer, SEPA, or credit card. Swiss-regulated and non-custodial.",
    badge: "Bank Transfer · Card",
    badgeColor: "#93C5FD",
    url: "https://www.mtpelerin.com/buy-rbtc",
    cta: "Buy with Mt Pelerin",
  },
  {
    name: "Transak",
    icon: <CreditCard className="h-6 w-6 text-purple-400" />,
    description: "On-ramp service supporting 100+ countries. Buy rBTC with credit card, debit card or bank transfer.",
    badge: "100+ countries",
    badgeColor: "#C084FC",
    url: "https://global.transak.com/?defaultCryptoCurrency=RBTC",
    cta: "Buy with Transak",
  },
  {
    name: "Ramp Network",
    icon: <CreditCard className="h-6 w-6 text-green-300" />,
    description: "Fast and easy fiat on-ramp for rBTC. Supports Apple Pay, Google Pay, cards and bank accounts.",
    badge: "Apple Pay · Google Pay",
    badgeColor: "#86EFAC",
    url: "https://ramp.network",
    cta: "Buy via Ramp",
  },
];

function RbtcOptionCard({ option }: { option: RbtcOption }) {
  return (
    <div className="glass rounded-sm p-4 border border-white/8 flex flex-col gap-3 hover:border-[#F7931A]/30 transition-colors group">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-sm bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-white/8 transition-colors">
          {option.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-sm text-white uppercase tracking-widest">{option.name}</span>
            {option.badge && (
              <span className="text-[8px] font-mono px-1.5 py-0.5 rounded-full border"
                style={{ color: option.badgeColor, borderColor: `${option.badgeColor}40`, background: `${option.badgeColor}10` }}>
                {option.badge}
              </span>
            )}
          </div>
          <p className="text-[10px] font-mono text-white/40 mt-1 leading-relaxed">{option.description}</p>
        </div>
      </div>
      <a
        href={option.url}
        target="_blank"
        rel="noreferrer"
        className="flex items-center justify-center gap-2 w-full py-2 rounded-sm border border-[#F7931A]/30 text-[#F7931A] hover:bg-[#F7931A]/10 transition-colors text-[10px] font-mono uppercase tracking-widest"
      >
        {option.cta}
        <ExternalLink className="h-3 w-3" />
      </a>
    </div>
  );
}

function PowpegTab() {
  const { authenticated, user } = usePrivy();
  const { wallets } = useWallets();
  const { toast } = useToast();
  const address = user?.wallet?.address;
  const [adding, setAdding] = useState<ChainKey | null>(null);
  const [method, setMethod] = useState<GetRbtcMethod>("btc");

  const addNetwork = async (key: ChainKey) => {
    const wallet = wallets.find(w => w.address.toLowerCase() === (address ?? "").toLowerCase());
    if (!wallet) { toast({ variant: "destructive", title: "No wallet found" }); return; }
    setAdding(key);
    try {
      const provider = await (wallet as any).getEthereumProvider();
      await addNetworkToWallet(provider, key);
      toast({ title: `${CHAINS[key].name} added!`, description: "Network is now available in your wallet." });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Failed to add network", description: e?.message });
    } finally {
      setAdding(null);
    }
  };

  const METHOD_TABS: { key: GetRbtcMethod; label: string; icon: React.ReactNode; options: RbtcOption[] }[] = [
    { key: "btc",     label: "With BTC",            icon: <Bitcoin className="h-3.5 w-3.5" />,    options: WITH_BTC_OPTIONS },
    { key: "digital", label: "With Digital Assets",  icon: <ArrowRightLeft className="h-3.5 w-3.5" />, options: WITH_DIGITAL_OPTIONS },
    { key: "fiat",    label: "With Fiat",            icon: <CreditCard className="h-3.5 w-3.5" />, options: WITH_FIAT_OPTIONS },
  ];

  const activeOptions = METHOD_TABS.find(t => t.key === method)!.options;

  return (
    <div className="space-y-5">

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <img src={`${BASE}/rootstock-logo.png`} alt="RSK" className="h-5 w-5 object-contain" style={{ filter: "invert(1)" }} />
          <h3 className="font-bold text-white uppercase tracking-widest text-sm">Get rBTC</h3>
          <a href="https://rootstock.io/rbtc/#get-rbtc" target="_blank" rel="noreferrer"
            className="ml-auto flex items-center gap-1 text-[9px] font-mono text-white/30 hover:text-[#F7931A] transition-colors uppercase tracking-widest">
            rootstock.io <ExternalLink className="h-2.5 w-2.5" />
          </a>
        </div>
        <p className="text-[10px] font-mono text-white/35 leading-relaxed">
          Popular methods for getting rBTC. See the full list of bridges & exchanges on the{" "}
          <a href="https://rootstock.io/ecosystem" target="_blank" rel="noreferrer"
            className="text-[#F7931A]/70 hover:text-[#F7931A] underline underline-offset-2">
            Rootstock ecosystem page
          </a>.
        </p>
      </div>

      {/* Method selector tabs */}
      <div className="flex gap-1 p-1 glass rounded-sm border border-white/8">
        {METHOD_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setMethod(t.key)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-sm text-[10px] font-mono uppercase tracking-widest transition-all"
            style={method === t.key
              ? { background: "#F7931A", color: "#000", fontWeight: 700 }
              : { color: "rgba(255,255,255,0.4)" }}
          >
            {t.icon}
            <span className="hidden sm:inline">{t.label}</span>
            <span className="sm:hidden">{t.key === "btc" ? "BTC" : t.key === "digital" ? "Digital" : "Fiat"}</span>
          </button>
        ))}
      </div>

      {/* Option cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {activeOptions.map((opt) => <RbtcOptionCard key={opt.name} option={opt} />)}
      </div>

      {/* Personalized rBTC options CTA */}
      <a
        href="https://rootstock.io/rbtc/"
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-3 glass px-4 py-3 rounded-sm border border-white/8 hover:border-[#F7931A]/30 transition-colors group"
      >
        <Globe className="h-5 w-5 text-[#F7931A]/60 group-hover:text-[#F7931A] shrink-0 transition-colors" />
        <div className="flex-1 min-w-0">
          <div className="text-[11px] font-bold text-white uppercase tracking-widest">Get personalized rBTC options</div>
          <div className="text-[9px] font-mono text-white/30 mt-0.5">Discover options from your region and preferred asset → rootstock.io/rbtc</div>
        </div>
        <ExternalLink className="h-4 w-4 text-white/20 group-hover:text-[#F7931A] transition-colors shrink-0" />
      </a>

      <div className="border-t border-white/8 pt-4 space-y-4">

        {/* Wallet address panel */}
        <div>
          <p className="text-[9px] uppercase tracking-widest font-mono text-white/25 mb-2">Your RSK wallet</p>
          {authenticated && address ? (
            <div className="space-y-2">
              <CopyableAddress address={address} />
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-white/30">rBTC balance</span>
                <BalancePill address={address} chain="rsk" />
              </div>
            </div>
          ) : (
            <div className="glass px-3 py-3 rounded-sm text-center text-white/25 font-mono text-[10px]">
              Connect wallet to see your RSK address and balance
            </div>
          )}
        </div>

        {/* Add Networks + Testnet faucet */}
        {authenticated && (
          <div className="space-y-3">
            <p className="text-[9px] uppercase tracking-widest font-mono text-white/25">Add networks to wallet</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(["rsk", "celo"] as ChainKey[]).map((key) => {
                const c = CHAINS[key];
                return (
                  <button key={key} onClick={() => addNetwork(key)} disabled={adding === key}
                    className="flex items-center gap-2.5 glass px-3 py-2.5 rounded-sm hover:bg-white/5 transition-colors group border text-left"
                    style={{ borderColor: `${c.color}20` }}>
                    <img src={c.logo} alt={c.name} className="h-5 w-5 object-contain shrink-0" style={{ filter: c.logoFilter }} />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-[10px] uppercase tracking-widest" style={{ color: c.color }}>{c.name}</div>
                      <div className="font-mono text-[8px] text-white/25">Chain ID: {c.id}</div>
                    </div>
                    {adding === key
                      ? <Loader2 className="h-3.5 w-3.5 text-white/30 animate-spin shrink-0" />
                      : <PlusCircle className="h-3.5 w-3.5 text-white/20 group-hover:text-white/60 shrink-0 transition-colors" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Testnet faucet */}
        <a href="https://faucet.rsk.co/" target="_blank" rel="noreferrer"
          className="flex items-center justify-between gap-3 glass px-4 py-2.5 rounded-sm hover:bg-white/5 transition-colors group border border-[#F7931A]/15">
          <div className="flex items-center gap-2.5">
            <Droplets className="h-4 w-4 text-[#F7931A]/50 group-hover:text-[#F7931A] transition-colors shrink-0" />
            <div>
              <div className="font-bold text-[10px] text-[#F7931A] uppercase tracking-widest">RSK Testnet Faucet</div>
              <div className="font-mono text-[9px] text-white/25">Get free tRBTC → faucet.rsk.co</div>
            </div>
          </div>
          <ExternalLink className="h-3.5 w-3.5 text-white/20 group-hover:text-[#F7931A] shrink-0 transition-colors" />
        </a>
      </div>

      {/* Info footer */}
      <div className="glass rounded-sm px-4 py-3 space-y-1.5 border border-white/5">
        <InfoLine><span className="text-[#F7931A]">1 BTC = 1 rBTC</span>, always. The PowPeg locks BTC in HSMs and mints rBTC on Rootstock.</InfoLine>
        <InfoLine>PowPeg peg-in and peg-out take ~100 RSK block confirmations (≈16 hours).</InfoLine>
        <InfoLine>rBTC is Bitcoin made programmable — use it for gas, DeFi, governance, and swaps on RSK.</InfoLine>
      </div>
    </div>
  );
}

// ─── Tab 2: Send Tokens ────────────────────────────────────────────────────────
function SendTab() {
  const { authenticated, user } = usePrivy();
  const { wallets } = useWallets();
  const { toast } = useToast();
  const address = user?.wallet?.address;

  const [chain, setChain] = useState<ChainKey>("rsk");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [sending, setSending] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const c = CHAINS[chain];
  const { formatted, loading: balLoading, refresh } = useChainBalance(address, chain);

  const isValidAddress = /^0x[0-9a-fA-F]{40}$/.test(recipient);
  const isValidAmount = !isNaN(Number(amount)) && Number(amount) > 0;

  const send = useCallback(async () => {
    if (!address || !isValidAddress || !isValidAmount) return;
    const wallet = wallets.find(w => w.address.toLowerCase() === address.toLowerCase());
    if (!wallet) { toast({ variant: "destructive", title: "Wallet not found" }); return; }

    setSending(true);
    setTxHash(null);
    try {
      const provider = await (wallet as any).getEthereumProvider();

      // Switch / add chain
      try {
        await provider.request({ method: "wallet_switchEthereumChain", params: [{ chainId: c.hexId }] });
      } catch {
        await addNetworkToWallet(provider, chain);
      }

      const amountWei = "0x" + (BigInt(Math.floor(Number(amount) * 1e18))).toString(16);

      const hash = await provider.request({
        method: "eth_sendTransaction",
        params: [{
          from: address,
          to: recipient,
          value: amountWei,
          chainId: c.hexId,
        }],
      });

      setTxHash(hash);
      setAmount("");
      setRecipient("");
      toast({ title: "Transaction sent!", description: `${amount} ${c.symbol} → ${recipient.slice(0, 10)}…` });
      setTimeout(refresh, 5000);
    } catch (e: any) {
      toast({ variant: "destructive", title: "Transaction failed", description: e?.message || "Rejected." });
    } finally {
      setSending(false);
    }
  }, [address, chain, recipient, amount, isValidAddress, isValidAmount, wallets, c, toast, refresh]);

  const fillSelf = () => { if (address) setRecipient(address); };

  return (
    <div className="space-y-5">
      {/* Chain selector */}
      <div className="space-y-1.5">
        <Label className="uppercase tracking-wider text-[10px] text-white/30">Network</Label>
        <div className="grid grid-cols-2 gap-2">
          {(["rsk", "celo"] as ChainKey[]).map((key) => {
            const ch = CHAINS[key];
            const active = chain === key;
            return (
              <button
                key={key}
                onClick={() => { setChain(key); setTxHash(null); }}
                className="flex items-center gap-2.5 rounded-sm px-3 py-2.5 text-left transition-all border"
                style={{
                  borderColor: active ? `${ch.color}60` : "rgba(255,255,255,0.07)",
                  background: active ? `${ch.color}12` : "rgba(255,255,255,0.03)",
                }}
              >
                <img src={ch.logo} alt={ch.name} className="h-5 w-5 object-contain shrink-0"
                  style={{ filter: ch.logoFilter }} />
                <div>
                  <div className="font-bold text-xs uppercase tracking-widest" style={{ color: active ? ch.color : "rgba(255,255,255,0.5)" }}>
                    {ch.symbol}
                  </div>
                  <div className="font-mono text-[9px] text-white/25">{ch.name}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Balance display */}
      {authenticated && address && (
        <div className="flex items-center justify-between glass px-3 py-2 rounded-sm">
          <span className="text-[10px] font-mono text-white/30">Your balance</span>
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-sm font-bold" style={{ color: c.color }}>
              {balLoading ? "…" : formatted} {c.symbol}
            </span>
            <button onClick={refresh} className="text-white/20 hover:text-white/50 transition-colors">
              <RefreshCw className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}

      {/* Recipient */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="uppercase tracking-wider text-[10px] text-white/30">Recipient address</Label>
          {address && (
            <button onClick={fillSelf}
              className="text-[9px] font-mono text-[#F7931A]/60 hover:text-[#F7931A] transition-colors uppercase tracking-widest">
              Use my address
            </button>
          )}
        </div>
        <Input
          placeholder="0x…"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          className={`rounded-sm font-mono text-sm h-11 bg-white/5 border-white/15 text-white focus-visible:ring-[#F7931A] ${
            recipient && !isValidAddress ? "border-red-500/50" : ""
          }`}
        />
        {recipient && !isValidAddress && (
          <p className="text-[10px] font-mono text-red-400 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" /> Invalid EVM address
          </p>
        )}
      </div>

      {/* Amount */}
      <div className="space-y-1.5">
        <Label className="uppercase tracking-wider text-[10px] text-white/30">Amount ({c.symbol})</Label>
        <div className="relative">
          <Input
            type="number"
            min="0"
            step="any"
            placeholder="0.000000"
            value={amount}
            onChange={(e) => { setAmount(e.target.value); setTxHash(null); }}
            className="rounded-sm font-mono text-lg h-14 pr-24 bg-white/5 border-white/15 text-white focus-visible:ring-[#F7931A]"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            <img src={c.logo} alt={c.symbol} className="h-4 w-4 object-contain" style={{ filter: c.logoFilter }} />
            <span className="font-bold text-sm" style={{ color: c.color }}>{c.symbol}</span>
          </div>
        </div>
      </div>

      {/* Arrow indicator */}
      {isValidAddress && isValidAmount && (
        <div className="flex items-center gap-3 glass px-4 py-3 rounded-sm border border-white/5">
          <div className="text-[11px] font-mono text-white/50 truncate">{address?.slice(0, 8)}…{address?.slice(-4)}</div>
          <ArrowDown className="h-4 w-4 text-[#F7931A] shrink-0" />
          <div className="text-[11px] font-mono text-white/80 truncate flex-1">{recipient.slice(0, 8)}…{recipient.slice(-4)}</div>
          <span className="text-xs font-bold shrink-0" style={{ color: c.color }}>{amount} {c.symbol}</span>
        </div>
      )}

      {/* TX hash result */}
      {txHash && (
        <div className="glass rounded-sm px-4 py-3 flex items-center gap-2 border border-green-400/30">
          <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0" />
          <span className="font-mono text-[11px] text-white/60 truncate flex-1">{txHash}</span>
          <a href={`${c.explorer}/tx/${txHash}`} target="_blank" rel="noreferrer"
            className="shrink-0 text-white/30 hover:text-white transition-colors">
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      )}

      {/* Send button */}
      {!authenticated ? (
        <div className="glass px-4 py-3 rounded-sm text-center font-mono text-xs text-white/30">
          Connect wallet to send tokens
        </div>
      ) : (
        <Button
          onClick={send}
          disabled={!isValidAddress || !isValidAmount || sending}
          className="w-full h-14 uppercase tracking-widest font-bold text-sm rounded-sm"
          style={isValidAddress && isValidAmount && !sending
            ? { background: "linear-gradient(135deg, #2D5A3A, #F7931A)" }
            : {}}
        >
          {sending
            ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Sending…</>
            : <><Send className="mr-2 h-5 w-5" /> Send {c.symbol} on {c.name}</>}
        </Button>
      )}

      <InfoLine>
        This sends native {c.symbol} on {c.name} (Chain ID {c.id}). Make sure you have gas.
      </InfoLine>
    </div>
  );
}

// ─── Tab 3: Faucets ────────────────────────────────────────────────────────────
function FaucetsTab() {
  const { user } = usePrivy();
  const address = user?.wallet?.address;
  const [copied, setCopied] = useState(false);

  const copy = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const faucets = [
    {
      name: "RSK Testnet Faucet",
      description: "Get free tRBTC for RSK Testnet — used for governance voting",
      url: address ? `https://faucet.rsk.co/?address=${address}` : "https://faucet.rsk.co/",
      chain: "rskTestnet" as ChainKey,
      token: "tRBTC",
      color: "#F7931A",
      logo: `${BASE}/rootstock-logo.png`,
      logoFilter: "invert(1)",
    },
    {
      name: "Celo Sepolia Faucet",
      description: "Get free CELO for Celo Sepolia — used for governance voting",
      url: address ? `https://faucet.celo.org/celo-sepolia?address=${address}` : "https://faucet.celo.org/celo-sepolia",
      chain: "celoTestnet" as ChainKey,
      token: "CELO",
      color: "#35D07F",
      logo: `${BASE}/celo-logo.png`,
      logoFilter: "brightness(0) invert(1)",
    },
  ];

  return (
    <div className="space-y-5">
      {/* Wallet address with copy */}
      <div className="space-y-2">
        <Label className="uppercase tracking-wider text-[10px] text-white/30">Your wallet address</Label>
        {address ? (
          <>
            <CopyableAddress address={address} />
            <p className="text-[10px] font-mono text-white/25">
              Your address is pre-filled in each faucet link below.
            </p>
          </>
        ) : (
          <div className="glass px-3 py-3 rounded-sm text-center text-white/30 font-mono text-xs">
            Connect wallet to auto-fill faucet links
          </div>
        )}
      </div>

      {/* Balances */}
      {address && (
        <div className="grid grid-cols-2 gap-3">
          {(["rsk", "celo"] as ChainKey[]).map((key) => {
            const c = CHAINS[key];
            return (
              <div key={key} className="glass rounded-sm px-3 py-3 border"
                style={{ borderColor: `${c.color}20` }}>
                <div className="flex items-center gap-2 mb-2">
                  <img src={c.logo} alt={c.name} className="h-4 w-4 object-contain"
                    style={{ filter: c.logoFilter }} />
                  <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: c.color }}>
                    {c.name}
                  </span>
                </div>
                <BalancePill address={address} chain={key} />
              </div>
            );
          })}
        </div>
      )}

      {/* Faucet links */}
      {faucets.map((f) => (
        <a key={f.chain} href={f.url} target="_blank" rel="noreferrer"
          className="flex items-center gap-4 glass px-5 py-4 rounded-sm transition-all hover:bg-white/5 group border"
          style={{ borderColor: `${f.color}25` }}>
          <img src={f.logo} alt={f.name} className="h-8 w-8 object-contain shrink-0"
            style={{ filter: f.logoFilter, opacity: 0.8 }} />
          <div className="flex-1 min-w-0">
            <div className="font-bold uppercase tracking-widest text-sm" style={{ color: f.color }}>
              {f.name}
            </div>
            <div className="font-mono text-[10px] text-white/30 mt-0.5">{f.description}</div>
            {address && (
              <div className="font-mono text-[9px] text-white/20 mt-1 truncate">
                → {address}
              </div>
            )}
          </div>
          <div className="shrink-0 flex flex-col items-end gap-1">
            <span className="font-mono text-xs font-bold" style={{ color: f.color }}>{f.token}</span>
            {address && <BalancePill address={address} chain={f.chain} />}
          </div>
          <ExternalLink className="h-4 w-4 text-white/20 group-hover:text-white/60 shrink-0 transition-colors" />
        </a>
      ))}

      {/* Mainnet links */}
      <div className="pt-2 border-t border-white/10">
        <p className="text-[9px] font-mono uppercase tracking-widest text-white/20 mb-3">Mainnet bridges</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { label: "RSK PowPeg", url: "https://powpeg.rootstock.io", color: "#F7931A" },
            { label: "Celo Bridge", url: "https://jumper.exchange/?fromChain=1&toChain=42220", color: "#35D07F" },
          ].map((b) => (
            <a key={b.label} href={b.url} target="_blank" rel="noreferrer"
              className="flex items-center justify-between gap-3 glass px-4 py-3 rounded-sm hover:bg-white/5 transition-colors group">
              <div className="font-bold text-xs uppercase tracking-widest" style={{ color: b.color }}>{b.label}</div>
              <ExternalLink className="h-3.5 w-3.5 text-white/20 group-hover:text-white/50 transition-colors" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── InfoLine helper ───────────────────────────────────────────────────────────
function InfoLine({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 text-[11px] font-mono text-white/35">
      <Info className="h-3.5 w-3.5 shrink-0 mt-0.5 text-white/25" />
      <span>{children}</span>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function Bridge() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <ArrowRightLeft className="h-5 w-5 text-[#F7931A]" />
          <h1 className="text-xl font-bold uppercase tracking-widest text-white">Bridge &amp; Acquire</h1>
        </div>
        <p className="text-white/40 font-mono text-xs">
          Get rBTC or CELO to participate in Veritas Villages governance voting.
        </p>
      </div>

      {/* Governance Context Banner */}
      <div className="glass rounded-sm px-4 py-3 border border-[#2D5A3A]/50 flex items-start gap-3">
        <ShieldCheck className="h-4 w-4 text-[#F7931A] shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-widest text-[#F7931A] mb-0.5">Why you need tokens</div>
          <p className="text-[10px] font-mono text-white/40 leading-relaxed">
            DAO proposals use a census based on your <span className="text-white/70">rBTC</span> (RSK proposals) or <span className="text-white/70">cUSD/CELO</span> (Celo proposals) balance.
            Acquire tokens here, then go vote.
          </p>
        </div>
        <a href="/proposals" className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-sm text-[9px] font-mono uppercase tracking-widest border border-[#F7931A]/30 text-[#F7931A]/70 hover:text-[#F7931A] hover:border-[#F7931A]/50 transition-colors">
          View proposals <ExternalLink className="h-2.5 w-2.5" />
        </a>
      </div>

      {/* Testnet notice */}
      <div className="flex items-start gap-3 rounded-sm px-4 py-3 border border-yellow-500/25 bg-yellow-500/8">
        <AlertCircle className="h-4 w-4 text-yellow-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="text-[11px] font-bold uppercase tracking-widest text-yellow-300">Testnet mode — no cross-chain swaps</p>
          <p className="text-[10px] font-mono text-yellow-200/60 leading-relaxed">
            Squid Router does not support RSK Testnet ↔ Celo Sepolia swaps. Use the <span className="text-yellow-300 font-bold">Faucets</span> tab to get free testnet tokens on each chain separately.
          </p>
        </div>
      </div>

      {/* Chain status bar */}
      <div className="grid grid-cols-2 gap-3">
        {(["rsk", "celo"] as ChainKey[]).map((key) => {
          const c = CHAINS[key];
          return (
            <div key={key} className="glass rounded-sm px-4 py-3 flex items-center gap-3 border border-white/5">
              <img src={c.logo} alt={c.name} className="h-5 w-5 object-contain shrink-0"
                style={{ filter: c.logoFilter }} />
              <div className="flex-1 min-w-0">
                <div className="font-bold text-xs uppercase tracking-widest" style={{ color: c.color }}>{c.symbol}</div>
                <div className="font-mono text-[9px] text-white/30">{c.name}</div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: c.color }} />
                <span className="text-[9px] font-mono uppercase tracking-wider" style={{ color: c.color }}>Live</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="powpeg" className="space-y-4">
        <TabsList className="w-full grid grid-cols-3 glass rounded-sm h-11 p-1 border border-white/10">
          <TabsTrigger value="powpeg"
            className="rounded-sm text-[10px] font-mono uppercase tracking-widest data-[state=active]:bg-[#F7931A] data-[state=active]:text-black">
            <Bitcoin className="h-3.5 w-3.5 mr-1.5" /> BTC ↔ rBTC
          </TabsTrigger>
          <TabsTrigger value="send"
            className="rounded-sm text-[10px] font-mono uppercase tracking-widest data-[state=active]:bg-[#F7931A] data-[state=active]:text-black">
            <Send className="h-3.5 w-3.5 mr-1.5" /> Send Tokens
          </TabsTrigger>
          <TabsTrigger value="faucets"
            className="rounded-sm text-[10px] font-mono uppercase tracking-widest data-[state=active]:bg-[#F7931A] data-[state=active]:text-black">
            <Droplets className="h-3.5 w-3.5 mr-1.5" /> Faucets
          </TabsTrigger>
        </TabsList>

        <div className="glass rounded-sm p-5 border border-white/5">
          <TabsContent value="powpeg" className="mt-0">
            <PowpegTab />
          </TabsContent>
          <TabsContent value="send" className="mt-0">
            <SendTab />
          </TabsContent>
          <TabsContent value="faucets" className="mt-0">
            <FaucetsTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

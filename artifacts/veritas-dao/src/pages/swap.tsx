import { useState, useEffect, useCallback } from "react";
import { usePrivy } from "@privy-io/react-auth";
import {
  ArrowRightLeft, ArrowDown, RefreshCw, ExternalLink, Zap, Globe,
  Clock, ChevronDown, AlertCircle, CheckCircle2, Loader2,
  TrendingUp, ShieldCheck, Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ─── Constants ─────────────────────────────────────────────────────────────────

const LIFI_API = "https://li.quest/v1";

interface Token {
  symbol: string;
  address: string;
  decimals: number;
  logoURI?: string;
  name: string;
}

interface ChainDef {
  id: number;
  name: string;
  shortName: string;
  color: string;
  tokens: Token[];
}

const CHAINS: ChainDef[] = [
  {
    id: 42220,
    name: "Celo",
    shortName: "CELO",
    color: "#35D07F",
    tokens: [
      { symbol: "CELO", name: "Celo", address: "0x471EcE3750Da237f93B8E339c536989b8978a438", decimals: 18, logoURI: "https://s2.coinmarketcap.com/static/img/coins/64x64/5567.png" },
      { symbol: "cUSD", name: "Celo Dollar", address: "0x765DE816845861e75A25fCA122bb6898B8B1282a", decimals: 18, logoURI: "https://cryptologos.cc/logos/celo-celo-logo.png" },
      { symbol: "USDC", name: "USD Coin", address: "0xcebA9300f2b948710d2653dD7B07f33A8B32118C", decimals: 6, logoURI: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png" },
      { symbol: "USDT", name: "Tether USD", address: "0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e", decimals: 6, logoURI: "https://cryptologos.cc/logos/tether-usdt-logo.png" },
    ],
  },
  {
    id: 137,
    name: "Polygon",
    shortName: "POL",
    color: "#8247E5",
    tokens: [
      { symbol: "POL", name: "Polygon", address: "0x0000000000000000000000000000000000001010", decimals: 18, logoURI: "https://cryptologos.cc/logos/polygon-matic-logo.png" },
      { symbol: "USDC", name: "USD Coin", address: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359", decimals: 6, logoURI: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png" },
      { symbol: "USDT", name: "Tether USD", address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", decimals: 6, logoURI: "https://cryptologos.cc/logos/tether-usdt-logo.png" },
      { symbol: "WETH", name: "Wrapped Ether", address: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619", decimals: 18, logoURI: "https://cryptologos.cc/logos/ethereum-eth-logo.png" },
    ],
  },
  {
    id: 10,
    name: "Optimism",
    shortName: "OP",
    color: "#FF0420",
    tokens: [
      { symbol: "ETH", name: "Ether", address: "0x0000000000000000000000000000000000000000", decimals: 18, logoURI: "https://cryptologos.cc/logos/ethereum-eth-logo.png" },
      { symbol: "USDC", name: "USD Coin", address: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85", decimals: 6, logoURI: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png" },
      { symbol: "USDT", name: "Tether USD", address: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58", decimals: 6, logoURI: "https://cryptologos.cc/logos/tether-usdt-logo.png" },
      { symbol: "OP", name: "Optimism", address: "0x4200000000000000000000000000000000000042", decimals: 18, logoURI: "https://cryptologos.cc/logos/optimism-ethereum-op-logo.png" },
    ],
  },
  {
    id: 42161,
    name: "Arbitrum",
    shortName: "ARB",
    color: "#12AAFF",
    tokens: [
      { symbol: "ETH", name: "Ether", address: "0x0000000000000000000000000000000000000000", decimals: 18, logoURI: "https://cryptologos.cc/logos/ethereum-eth-logo.png" },
      { symbol: "USDC", name: "USD Coin", address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", decimals: 6, logoURI: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png" },
      { symbol: "ARB", name: "Arbitrum", address: "0x912CE59144191C1204E64559FE8253a0e49E6548", decimals: 18, logoURI: "https://cryptologos.cc/logos/arbitrum-arb-logo.png" },
      { symbol: "USDT", name: "Tether USD", address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9", decimals: 6, logoURI: "https://cryptologos.cc/logos/tether-usdt-logo.png" },
    ],
  },
  {
    id: 30,
    name: "Rootstock",
    shortName: "RSK",
    color: "#F7931A",
    tokens: [
      { symbol: "RBTC", name: "Rootstock BTC", address: "0x0000000000000000000000000000000000000000", decimals: 18, logoURI: "https://cryptologos.cc/logos/bitcoin-btc-logo.png" },
      { symbol: "RIF", name: "RIF Token", address: "0x2AcC95758f8b5F583470ba265EB685a8F45fC9D5", decimals: 18, logoURI: "https://assets.coingecko.com/coins/images/7460/small/8befc44a46c247e8a3f7fc8abba586b1_%283%29.png" },
      { symbol: "USDC.e", name: "USD Coin", address: "0x74c9f2b00581F1B11AA7ff05aa9F608B7389De67", decimals: 6, logoURI: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png" },
    ],
  },
];

interface SwapProvider {
  name: string;
  tagline: string;
  badge: string;
  badgeColor: string;
  url: string;
  chains: string;
  icon: React.ReactNode;
}

const PROVIDERS: SwapProvider[] = [
  {
    name: "LI.FI / Jumper",
    tagline: "The best cross-chain swap aggregator. Finds optimal routes across all major DEXes and bridges.",
    badge: "Top Pick · Multi-chain",
    badgeColor: "#6366F1",
    url: "https://jumper.exchange",
    chains: "Celo · RSK · 40+ chains",
    icon: <Zap className="h-5 w-5 text-indigo-400" />,
  },
  {
    name: "Squid Router",
    tagline: "Cross-chain swaps powered by Axelar. Specializes in Celo bridging with deep liquidity.",
    badge: "Celo Native",
    badgeColor: "#35D07F",
    url: "https://app.squidrouter.com",
    chains: "Celo · 30+ chains",
    icon: <Globe className="h-5 w-5 text-green-400" />,
  },
  {
    name: "Sovryn",
    tagline: "RSK's native DEX and money protocol. Best rates for RBTC and RIF token swaps.",
    badge: "RSK Native",
    badgeColor: "#F7931A",
    url: "https://sovryn.app/",
    chains: "RSK · Bitcoin",
    icon: <TrendingUp className="h-5 w-5 text-orange-400" />,
  },
  {
    name: "Ubeswap",
    tagline: "Celo's leading DEX with deep cUSD, CELO, and stablecoin liquidity.",
    badge: "Celo DEX",
    badgeColor: "#35D07F",
    url: "https://app.ubeswap.org",
    chains: "Celo",
    icon: <ShieldCheck className="h-5 w-5 text-emerald-400" />,
  },
];

// ─── Helpers ────────────────────────────────────────────────────────────────────

function toWei(amount: string, decimals: number): string {
  if (!amount || isNaN(Number(amount))) return "0";
  const n = parseFloat(amount);
  return Math.floor(n * 10 ** decimals).toString();
}

function fromWei(amount: string, decimals: number, precision = 6): string {
  if (!amount || amount === "0") return "—";
  const n = Number(amount) / 10 ** decimals;
  if (n === 0) return "0";
  if (n < 0.000001) return "< 0.000001";
  return n.toPrecision(precision).replace(/\.?0+$/, "");
}

function buildJumperUrl(fromChain: number, toChain: number, fromToken: Token, toToken: Token) {
  const params = new URLSearchParams({
    fromChain: String(fromChain),
    toChain: String(toChain),
    fromToken: fromToken.address,
    toToken: toToken.address,
  });
  return `https://jumper.exchange/?${params}`;
}

// ─── Sub-components ─────────────────────────────────────────────────────────────

function TokenLogo({ token, size = 7 }: { token: Token; size?: number }) {
  return token.logoURI ? (
    <img src={token.logoURI} alt={token.symbol} className={`h-${size} w-${size} rounded-full object-contain bg-white/5 shrink-0`} />
  ) : (
    <div className={`h-${size} w-${size} rounded-full bg-white/10 flex items-center justify-center text-[9px] font-bold text-white/60 shrink-0`}>
      {token.symbol.slice(0, 2)}
    </div>
  );
}

function ChainBadge({ chain }: { chain: ChainDef }) {
  return (
    <span className="inline-flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.5 rounded-full border"
      style={{ color: chain.color, borderColor: `${chain.color}40`, background: `${chain.color}12` }}>
      {chain.shortName}
    </span>
  );
}

interface TokenSelectProps {
  label: string;
  chain: ChainDef;
  token: Token;
  onChainChange: (c: ChainDef) => void;
  onTokenChange: (t: Token) => void;
  amount?: string;
  onAmountChange?: (v: string) => void;
  readOnly?: boolean;
  outputValue?: string;
  loading?: boolean;
}

function TokenSelect({
  label, chain, token, onChainChange, onTokenChange,
  amount, onAmountChange, readOnly, outputValue, loading,
}: TokenSelectProps) {
  const [showChains, setShowChains] = useState(false);
  const [showTokens, setShowTokens] = useState(false);

  return (
    <div className="glass rounded-sm p-4 border border-white/8 space-y-3 relative">
      <p className="text-[9px] uppercase tracking-widest font-mono text-white/30">{label}</p>

      {/* Chain + Token row */}
      <div className="flex items-center gap-2">
        {/* Chain picker */}
        <div className="relative">
          <button onClick={() => { setShowChains(s => !s); setShowTokens(false); }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm bg-white/8 hover:bg-white/12 transition-colors border border-white/10"
          >
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: chain.color }}>{chain.shortName}</span>
            <ChevronDown className="h-3 w-3 text-white/30" />
          </button>
          {showChains && (
            <div className="absolute left-0 top-full mt-1 w-36 glass border border-white/12 rounded-sm shadow-2xl z-20 overflow-hidden">
              {CHAINS.map(c => (
                <button key={c.id} onClick={() => { onChainChange(c); onTokenChange(c.tokens[0]); setShowChains(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/8 transition-colors text-left"
                >
                  <span className="font-bold text-[10px] uppercase tracking-wider" style={{ color: c.color }}>{c.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Token picker */}
        <div className="relative flex-1">
          <button onClick={() => { setShowTokens(s => !s); setShowChains(false); }}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-sm bg-white/8 hover:bg-white/12 transition-colors border border-white/10 w-full"
          >
            <TokenLogo token={token} size={5} />
            <span className="text-[11px] font-bold text-white uppercase tracking-wider flex-1 text-left">{token.symbol}</span>
            <ChevronDown className="h-3 w-3 text-white/30 shrink-0" />
          </button>
          {showTokens && (
            <div className="absolute left-0 top-full mt-1 w-44 glass border border-white/12 rounded-sm shadow-2xl z-20 overflow-hidden">
              {chain.tokens.map(t => (
                <button key={t.address} onClick={() => { onTokenChange(t); setShowTokens(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/8 transition-colors text-left"
                >
                  <TokenLogo token={t} size={5} />
                  <div>
                    <div className="text-[11px] font-bold text-white">{t.symbol}</div>
                    <div className="text-[9px] font-mono text-white/30">{t.name}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Amount */}
      {readOnly ? (
        <div className="flex items-center gap-2 h-10 px-3 rounded-sm bg-white/5 border border-white/8">
          {loading
            ? <Loader2 className="h-4 w-4 text-white/30 animate-spin" />
            : <span className="font-mono text-base text-white/80 font-bold">{outputValue || "—"}</span>}
        </div>
      ) : (
        <Input
          type="number"
          min="0"
          step="any"
          placeholder="0.00"
          value={amount}
          onChange={e => onAmountChange?.(e.target.value)}
          className="bg-white/5 border-white/10 text-white font-mono text-base h-10 focus:border-[#F7931A]/50"
        />
      )}
    </div>
  );
}

interface LifiQuote {
  estimate: {
    toAmount: string;
    toAmountMin: string;
    executionDuration: number;
    gasCosts: { amount: string; token: { symbol: string; decimals: number } }[];
    feeCosts: { amount: string; token: { symbol: string; decimals: number }; name: string }[];
  };
  tool: string;
  toolDetails: { name: string; logoURI: string };
  action: { fromChainId: number; toChainId: number };
}

function RoutePreview({ quote, toToken }: { quote: LifiQuote; toToken: Token }) {
  const out = fromWei(quote.estimate.toAmount, toToken.decimals);
  const outMin = fromWei(quote.estimate.toAmountMin, toToken.decimals);
  const duration = quote.estimate.executionDuration;
  const mins = Math.ceil(duration / 60);

  return (
    <div className="glass rounded-sm border border-[#6366F1]/20 p-4 space-y-3">
      <div className="flex items-center gap-2">
        {quote.toolDetails?.logoURI && (
          <img src={quote.toolDetails.logoURI} alt={quote.toolDetails.name} className="h-5 w-5 rounded-full object-contain bg-white/5" />
        )}
        <span className="text-[10px] font-mono text-white/50 uppercase tracking-widest">Best route via</span>
        <span className="text-[11px] font-bold text-white uppercase tracking-widest">{quote.toolDetails?.name || quote.tool}</span>
        <CheckCircle2 className="h-3.5 w-3.5 text-green-400 ml-auto" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="glass rounded-sm px-3 py-2 text-center">
          <div className="text-[9px] font-mono text-white/30 uppercase tracking-widest mb-0.5">You get</div>
          <div className="text-sm font-bold text-white">{out}</div>
          <div className="text-[8px] font-mono text-white/25">{toToken.symbol}</div>
        </div>
        <div className="glass rounded-sm px-3 py-2 text-center">
          <div className="text-[9px] font-mono text-white/30 uppercase tracking-widest mb-0.5">Min. received</div>
          <div className="text-sm font-bold text-white">{outMin}</div>
          <div className="text-[8px] font-mono text-white/25">{toToken.symbol}</div>
        </div>
        <div className="glass rounded-sm px-3 py-2 text-center">
          <div className="text-[9px] font-mono text-white/30 uppercase tracking-widest mb-0.5">Est. time</div>
          <div className="text-sm font-bold text-white">{mins}</div>
          <div className="text-[8px] font-mono text-white/25">min{mins !== 1 ? "s" : ""}</div>
        </div>
      </div>
    </div>
  );
}

function ProviderCard({ p }: { p: SwapProvider }) {
  return (
    <div className="glass rounded-sm p-4 border border-white/8 flex flex-col gap-3 hover:border-white/15 transition-colors group">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-sm bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-white/8 transition-colors">
          {p.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-[12px] text-white uppercase tracking-widest">{p.name}</span>
            <span className="text-[8px] font-mono px-1.5 py-0.5 rounded-full border"
              style={{ color: p.badgeColor, borderColor: `${p.badgeColor}40`, background: `${p.badgeColor}12` }}>
              {p.badge}
            </span>
          </div>
          <p className="text-[10px] font-mono text-white/40 mt-1 leading-relaxed">{p.tagline}</p>
          <p className="text-[9px] font-mono text-white/25 mt-0.5">{p.chains}</p>
        </div>
      </div>
      <a href={p.url} target="_blank" rel="noreferrer"
        className="flex items-center justify-center gap-2 w-full py-2 rounded-sm border border-white/15 text-white/60 hover:text-white hover:border-white/30 transition-colors text-[10px] font-mono uppercase tracking-widest">
        Launch {p.name.split(" ")[0]}
        <ExternalLink className="h-3 w-3" />
      </a>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────

export default function Swap() {
  const { authenticated, login, user } = usePrivy();

  const [fromChain, setFromChain] = useState<ChainDef>(CHAINS[0]);
  const [fromToken, setFromToken] = useState<Token>(CHAINS[0].tokens[0]);  // CELO
  const [toChain, setToChain] = useState<ChainDef>(CHAINS[0]);
  const [toToken, setToToken] = useState<Token>(CHAINS[0].tokens[1]);      // cUSD (same chain, live route)
  const [amount, setAmount] = useState("1");

  const [quote, setQuote] = useState<LifiQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  const address = user?.wallet?.address;

  const fetchQuote = useCallback(async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setQuote(null);
      setQuoteError(null);
      return;
    }
    setQuoteLoading(true);
    setQuoteError(null);
    setQuote(null);
    try {
      const fromAmount = toWei(amount, fromToken.decimals);
      const params = new URLSearchParams({
        fromChain: String(fromChain.id),
        toChain: String(toChain.id),
        fromToken: fromToken.address,
        toToken: toToken.address,
        fromAmount,
        fromAddress: address || "0x0000000000000000000000000000000000000001",
        slippage: "0.005",
      });
      const res = await fetch(`${LIFI_API}/quote?${params}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as any)?.message || `HTTP ${res.status}`);
      }
      const data: LifiQuote = await res.json();
      setQuote(data);
    } catch (e: any) {
      setQuoteError(e?.message || "Could not fetch quote");
    } finally {
      setQuoteLoading(false);
    }
  }, [fromChain, toChain, fromToken, toToken, amount, address]);

  useEffect(() => {
    const t = setTimeout(fetchQuote, 800);
    return () => clearTimeout(t);
  }, [fetchQuote]);

  const flip = () => {
    setFromChain(toChain);
    setFromToken(toToken);
    setToChain(fromChain);
    setToToken(fromToken);
    setQuote(null);
  };

  const jumperUrl = buildJumperUrl(fromChain.id, toChain.id, fromToken, toToken);

  const outValue = quote
    ? fromWei(quote.estimate.toAmount, toToken.decimals)
    : undefined;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <ArrowRightLeft className="h-6 w-6 text-[#F7931A]" />
          <h1 className="text-2xl font-bold text-white uppercase tracking-widest">Swap Tokens</h1>
        </div>
        <p className="text-white/40 font-mono text-sm">
          Best-rate cross-chain swaps powered by LI.FI aggregation across Celo and Rootstock.
        </p>
      </div>

      {/* Mainnet notice */}
      <div className="flex items-start gap-3 glass-terra border border-[#35D07F]/20 rounded-sm px-4 py-3">
        <TrendingUp className="h-4 w-4 text-[#35D07F] shrink-0 mt-0.5" />
        <p className="text-[10px] font-mono text-white/50 leading-relaxed">
          <span className="text-[#35D07F] font-bold">MAINNET SWAPS</span> — Quotes use Celo mainnet (42220) and Rootstock mainnet (30).
          Governance voting uses testnets. Connect a mainnet wallet to execute swaps.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ─── Swap Card ── */}
        <div className="space-y-2">
          <TokenSelect
            label="From"
            chain={fromChain}
            token={fromToken}
            onChainChange={setFromChain}
            onTokenChange={setFromToken}
            amount={amount}
            onAmountChange={setAmount}
          />

          {/* Flip button */}
          <div className="flex justify-center">
            <button onClick={flip}
              className="w-9 h-9 glass rounded-full border border-white/10 flex items-center justify-center hover:border-[#F7931A]/40 hover:bg-[#F7931A]/10 transition-colors group">
              <ArrowDown className="h-4 w-4 text-white/30 group-hover:text-[#F7931A] transition-colors" />
            </button>
          </div>

          <TokenSelect
            label="To"
            chain={toChain}
            token={toToken}
            onChainChange={setToChain}
            onTokenChange={setToToken}
            readOnly
            outputValue={outValue}
            loading={quoteLoading}
          />

          {/* RSK notice */}
          {(fromChain.id === 30 || toChain.id === 30) && (
            <div className="flex items-start gap-2 glass border border-[#F7931A]/20 rounded-sm px-3 py-2.5">
              <AlertCircle className="h-4 w-4 text-[#F7931A] shrink-0 mt-0.5" />
              <p className="text-[10px] font-mono text-white/50 leading-relaxed">
                RSK routes are not available via LI.FI. Use{" "}
                <a href="https://sovryn.app/" target="_blank" rel="noreferrer" className="text-[#F7931A] hover:underline">Sovryn</a>
                {" "}for RBTC/RIF swaps, or the{" "}
                <a href="https://app.rootstock.io/rbtc" target="_blank" rel="noreferrer" className="text-[#F7931A] hover:underline">PowPeg</a>
                {" "}to bridge BTC ↔ rBTC.
              </p>
            </div>
          )}

          {/* Route preview */}
          {quote && !quoteLoading && (fromChain.id !== 30 && toChain.id !== 30) && (
            <RoutePreview quote={quote} toToken={toToken} />
          )}
          {quoteError && fromChain.id !== 30 && toChain.id !== 30 && (
            <div className="flex items-start gap-2 glass border border-red-500/20 rounded-sm px-3 py-2.5">
              <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
              <p className="text-[10px] font-mono text-red-400/80">{quoteError}</p>
            </div>
          )}
          {quoteLoading && !quote && (
            <div className="flex items-center gap-2 glass rounded-sm px-3 py-2.5 border border-white/8">
              <Loader2 className="h-4 w-4 text-white/30 animate-spin shrink-0" />
              <span className="text-[10px] font-mono text-white/30">Finding best route…</span>
            </div>
          )}

          {/* CTA */}
          <div className="flex gap-2 pt-1">
            <a href={jumperUrl} target="_blank" rel="noreferrer" className="flex-1">
              <Button className="w-full h-11 text-[11px] font-bold uppercase tracking-widest text-black gap-2"
                style={{ background: "linear-gradient(135deg, #2D5A3A, #F7931A)" }}>
                <Zap className="h-4 w-4" />
                Swap via Jumper
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </a>
            <button onClick={fetchQuote} disabled={quoteLoading}
              className="w-11 h-11 glass border border-white/10 rounded-sm flex items-center justify-center hover:border-[#F7931A]/30 transition-colors disabled:opacity-40">
              <RefreshCw className={`h-4 w-4 text-white/40 ${quoteLoading ? "animate-spin" : ""}`} />
            </button>
          </div>

          {/* Sign in prompt */}
          {!authenticated && (
            <button onClick={login}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-sm border border-[#F7931A]/20 text-[#F7931A]/60 hover:text-[#F7931A] hover:border-[#F7931A]/40 transition-colors text-[10px] font-mono uppercase tracking-widest">
              <Wallet className="h-3.5 w-3.5" />
              Sign in to use your address for quotes
            </button>
          )}
        </div>

        {/* ─── Info Panel ── */}
        <div className="space-y-4">
          <div>
            <p className="text-[9px] uppercase tracking-widest font-mono text-white/25 mb-3">Route info</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between glass rounded-sm px-3 py-2.5 border border-white/8">
                <span className="text-[10px] font-mono text-white/40">From chain</span>
                <ChainBadge chain={fromChain} />
              </div>
              <div className="flex items-center justify-between glass rounded-sm px-3 py-2.5 border border-white/8">
                <span className="text-[10px] font-mono text-white/40">To chain</span>
                <ChainBadge chain={toChain} />
              </div>
              <div className="flex items-center justify-between glass rounded-sm px-3 py-2.5 border border-white/8">
                <span className="text-[10px] font-mono text-white/40">Aggregator</span>
                <span className="text-[10px] font-mono text-white/60">LI.FI</span>
              </div>
              <div className="flex items-center justify-between glass rounded-sm px-3 py-2.5 border border-white/8">
                <span className="text-[10px] font-mono text-white/40">Slippage</span>
                <span className="text-[10px] font-mono text-white/60">0.5%</span>
              </div>
              {quote && (
                <div className="flex items-center justify-between glass rounded-sm px-3 py-2.5 border border-[#35D07F]/15">
                  <span className="text-[10px] font-mono text-white/40 flex items-center gap-1.5">
                    <Clock className="h-3 w-3" /> Est. time
                  </span>
                  <span className="text-[10px] font-mono text-[#35D07F]">
                    ~{Math.ceil(quote.estimate.executionDuration / 60)} min
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="glass rounded-sm border border-white/5 px-4 py-3 space-y-1.5">
            <div className="flex items-center gap-1.5 mb-2">
              <ShieldCheck className="h-3.5 w-3.5 text-[#35D07F]" />
              <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">How it works</span>
            </div>
            {[
              "LI.FI scans 30+ DEXes and bridges to find the best route.",
              "Quotes include gas, bridge fees, and slippage estimates.",
              "Cross-chain swaps between Celo and RSK route via Axelar or CCTP.",
              "Execute directly via Jumper or your preferred provider below.",
            ].map((s, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-[#F7931A] font-mono text-[9px] shrink-0 mt-0.5">{i + 1}.</span>
                <p className="text-[10px] font-mono text-white/35 leading-relaxed">{s}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Provider Grid ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-[10px] uppercase tracking-widest font-mono text-white/30">Top Swap Providers</p>
          <p className="text-[9px] font-mono text-white/20">All providers support Celo · RSK</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PROVIDERS.map(p => <ProviderCard key={p.name} p={p} />)}
        </div>
      </div>
    </div>
  );
}

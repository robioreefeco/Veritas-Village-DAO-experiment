import { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import {
  CreditCard, Smartphone, CheckCircle2, AlertCircle, Loader2,
  ExternalLink, Wallet, RefreshCw, Coins, Heart, ShieldCheck, Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMiniPay, CUSD_ADDRESS, type Address } from "@/hooks/useMiniPay";
import { useToast } from "@/hooks/use-toast";

const DAO_TREASURY: Address = "0x4f93fa058b03953c851efaa2e4fc5c34afdfab84";
const CELO_EXPLORER = "https://celoscan.io";

const PAYMENT_PLANS = [
  {
    id: "dues",
    icon: <ShieldCheck className="h-5 w-5" />,
    title: "Community Dues",
    subtitle: "Monthly membership",
    amount: "10",
    description: "Monthly contribution covering shared infrastructure, governance overhead, and community tools.",
    color: "#2D5A3A",
    badge: "MONTHLY",
  },
  {
    id: "bond",
    icon: <Coins className="h-5 w-5" />,
    title: "Proposal Bond",
    subtitle: "Refundable deposit",
    amount: "5",
    description: "Refundable bond required to create a governance proposal. Returned after vote concludes.",
    color: "#F7931A",
    badge: "REFUNDABLE",
  },
  {
    id: "donation",
    icon: <Heart className="h-5 w-5" />,
    title: "Treasury Donation",
    subtitle: "Custom amount",
    amount: "",
    description: "Support the DAO treasury directly. Funds land acquisition, legal costs, and community projects.",
    color: "#35D07F",
    badge: "OPEN",
  },
] as const;

type PlanId = (typeof PAYMENT_PLANS)[number]["id"];

function shortAddr(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function fmt(val: string | null): string {
  if (!val) return "—";
  const n = parseFloat(val);
  return isNaN(n) ? "—" : n.toFixed(4);
}

export default function Pay() {
  const { authenticated, login } = usePrivy();
  const {
    isMiniPay, address, cusdBalance, ceurBalance,
    loading, sending, error, sendPayment, refreshBalances,
  } = useMiniPay();
  const { toast } = useToast();

  const [selectedPlan, setSelectedPlan] = useState<PlanId>("dues");
  const [customAmount, setCustomAmount] = useState("");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [txSuccess, setTxSuccess] = useState<boolean | null>(null);

  const plan = PAYMENT_PLANS.find(p => p.id === selectedPlan)!;
  const payAmount = plan.id === "donation" ? customAmount : plan.amount;
  const canPay =
    isMiniPay &&
    address &&
    !!payAmount &&
    parseFloat(payAmount) > 0 &&
    !sending &&
    parseFloat(cusdBalance ?? "0") >= parseFloat(payAmount);

  async function handlePay() {
    if (!canPay) return;
    setTxHash(null);
    setTxSuccess(null);
    try {
      const result = await sendPayment({
        to: DAO_TREASURY,
        amountCusd: payAmount,
      });
      setTxHash(result.txHash);
      setTxSuccess(result.success);
      toast({
        title: result.success ? "Payment sent!" : "Transaction failed",
        description: result.success
          ? `${payAmount} cUSD sent to DAO treasury.`
          : "Check the explorer for details.",
      });
    } catch (e: any) {
      toast({ title: "Error", description: e?.message ?? "Unknown error", variant: "destructive" });
    }
  }

  function copyAddr(v: string) {
    navigator.clipboard.writeText(v).then(() =>
      toast({ title: "Copied", description: v })
    );
  }

  return (
    <div className="min-h-full p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <CreditCard className="h-6 w-6 text-[#F7931A]" />
        <div>
          <h1 className="text-2xl font-bold font-mono uppercase tracking-widest text-white">
            Pay with MiniPay
          </h1>
          <p className="text-sm text-white/50 font-mono mt-0.5">
            Frictionless cUSD payments on Celo — gas-free for you
          </p>
        </div>
      </div>

      {/* MiniPay detection banner */}
      {loading ? (
        <div className="glass border border-white/10 rounded-sm p-6 flex items-center gap-3">
          <Loader2 className="h-5 w-5 text-[#F7931A] animate-spin shrink-0" />
          <span className="font-mono text-sm text-white/60">Detecting MiniPay wallet…</span>
        </div>
      ) : !isMiniPay ? (
        <div className="glass border border-[#F7931A]/30 rounded-sm p-5 flex gap-4 items-start">
          <Smartphone className="h-8 w-8 text-[#F7931A] shrink-0 mt-0.5" />
          <div className="space-y-2 flex-1">
            <p className="font-mono text-sm font-bold text-white uppercase tracking-wider">Open in MiniPay</p>
            <p className="text-xs text-white/50 font-mono leading-relaxed">
              MiniPay is Opera Mini's built-in Celo wallet. Gas fees are paid in cUSD — no ETH needed.
              Open this dApp inside the MiniPay browser to enable direct cUSD payments.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <a
                href="https://minipay.opera.com"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-[#F7931A] hover:underline"
              >
                <ExternalLink className="h-3 w-3" /> Get MiniPay
              </a>
              <span className="text-white/20 font-mono text-[10px]">·</span>
              <a
                href="https://docs.celo.org/build-on-celo/build-on-minipay/overview"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-white/40 hover:text-white/70"
              >
                <ExternalLink className="h-3 w-3" /> Docs
              </a>
            </div>
          </div>
        </div>
      ) : (
        /* ─── MiniPay Connected ─── */
        <div className="glass border border-[#2D5A3A]/50 rounded-sm p-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2D5A3A] to-[#35D07F] flex items-center justify-center shrink-0">
            <Smartphone className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-[#35D07F] uppercase tracking-wider">MiniPay Connected</span>
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
            </div>
            <button
              onClick={() => address && copyAddr(address)}
              className="flex items-center gap-1 mt-0.5 text-[11px] font-mono text-white/50 hover:text-white/80 transition-colors"
            >
              {address ? shortAddr(address) : "—"}
              <Copy className="h-2.5 w-2.5" />
            </button>
          </div>
          <button
            onClick={refreshBalances}
            className="p-1.5 rounded-sm hover:bg-white/5 text-white/30 hover:text-white/60 transition-colors"
            title="Refresh balances"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* ─── Left: Balances + Plan selector ─── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Balances */}
          {isMiniPay && (
            <div className="glass border border-white/10 rounded-sm p-4 space-y-3">
              <p className="text-[9px] font-mono uppercase tracking-widest text-white/30">Your Balances</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-[#35D07F]/20 flex items-center justify-center">
                      <span className="text-[8px] font-bold text-[#35D07F]">$</span>
                    </div>
                    <span className="text-xs font-mono text-white/70">cUSD</span>
                    <span className="text-[9px] font-mono text-white/25 uppercase">Celo Dollar</span>
                  </div>
                  <span className="text-sm font-mono font-bold text-white">{fmt(cusdBalance)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-[#2D5A3A]/30 flex items-center justify-center">
                      <span className="text-[8px] font-bold text-[#35D07F]">€</span>
                    </div>
                    <span className="text-xs font-mono text-white/70">cEUR</span>
                    <span className="text-[9px] font-mono text-white/25 uppercase">Celo Euro</span>
                  </div>
                  <span className="text-sm font-mono font-bold text-white">{fmt(ceurBalance)}</span>
                </div>
              </div>
            </div>
          )}

          {/* DAO Treasury info */}
          <div className="glass border border-white/10 rounded-sm p-4 space-y-2">
            <p className="text-[9px] font-mono uppercase tracking-widest text-white/30">DAO Treasury</p>
            <button
              onClick={() => copyAddr(DAO_TREASURY)}
              className="flex items-center gap-1.5 text-[11px] font-mono text-white/50 hover:text-white/80 transition-colors w-full"
            >
              <Wallet className="h-3 w-3 shrink-0" />
              <span className="truncate">{shortAddr(DAO_TREASURY)}</span>
              <Copy className="h-2.5 w-2.5 shrink-0 ml-auto" />
            </button>
            <a
              href={`${CELO_EXPLORER}/address/${DAO_TREASURY}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-[10px] font-mono text-[#F7931A]/60 hover:text-[#F7931A] transition-colors"
            >
              <ExternalLink className="h-2.5 w-2.5" /> View on Celoscan
            </a>
            <a
              href={`${CELO_EXPLORER}/token/${CUSD_ADDRESS}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-[10px] font-mono text-white/30 hover:text-white/60 transition-colors"
            >
              <ExternalLink className="h-2.5 w-2.5" /> cUSD token contract
            </a>
          </div>

          {/* Fee abstraction note */}
          <div className="rounded-sm border border-white/8 p-3 bg-white/2">
            <p className="text-[10px] font-mono text-white/30 leading-relaxed">
              <span className="text-[#35D07F]">✦ Gas-free</span> — Celo fee abstraction lets MiniPay
              pay transaction fees in cUSD. No CELO needed in your wallet.
            </p>
          </div>
        </div>

        {/* ─── Right: Payment form ─── */}
        <div className="lg:col-span-3 space-y-4">

          {/* Plan selector */}
          <div className="space-y-2">
            <p className="text-[9px] font-mono uppercase tracking-widest text-white/30">Select Payment Type</p>
            <div className="space-y-2">
              {PAYMENT_PLANS.map(p => (
                <button
                  key={p.id}
                  onClick={() => { setSelectedPlan(p.id); setTxHash(null); setTxSuccess(null); }}
                  className={`w-full text-left p-4 rounded-sm border transition-all ${
                    selectedPlan === p.id
                      ? "border-[#F7931A]/50 bg-[#F7931A]/5"
                      : "border-white/8 hover:border-white/20 bg-white/2"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className="mt-0.5 shrink-0"
                      style={{ color: selectedPlan === p.id ? p.color : "rgba(255,255,255,0.35)" }}
                    >
                      {p.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                          {p.title}
                        </span>
                        <span
                          className="text-[8px] font-mono px-1.5 py-0.5 rounded-sm uppercase tracking-wider"
                          style={{
                            background: selectedPlan === p.id ? `${p.color}25` : "rgba(255,255,255,0.05)",
                            color: selectedPlan === p.id ? p.color : "rgba(255,255,255,0.3)",
                          }}
                        >
                          {p.badge}
                        </span>
                      </div>
                      <p className="text-[10px] font-mono text-white/40 mt-0.5">{p.subtitle}</p>
                      <p className="text-[10px] text-white/30 mt-1 leading-relaxed">{p.description}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      {p.amount ? (
                        <span className="text-base font-mono font-bold text-white">{p.amount}</span>
                      ) : (
                        <span className="text-xs font-mono text-white/30">custom</span>
                      )}
                      {p.amount && (
                        <p className="text-[9px] font-mono text-white/30">cUSD</p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom amount input (donation only) */}
          {selectedPlan === "donation" && (
            <div className="space-y-1.5">
              <label className="text-[9px] font-mono uppercase tracking-widest text-white/30">
                Amount (cUSD)
              </label>
              <div className="relative">
                <Input
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                  value={customAmount}
                  onChange={e => setCustomAmount(e.target.value)}
                  className="font-mono text-lg pr-16 bg-card border-white/12 text-white placeholder:text-white/20 h-12"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-white/30 uppercase">
                  cUSD
                </span>
              </div>
              {isMiniPay && cusdBalance && customAmount && parseFloat(customAmount) > parseFloat(cusdBalance) && (
                <p className="text-[10px] font-mono text-red-400 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> Insufficient cUSD balance
                </p>
              )}
            </div>
          )}

          {/* Pay button */}
          <button
            onClick={isMiniPay ? handlePay : login}
            disabled={isMiniPay ? !canPay || sending : false}
            className="w-full flex items-center justify-center gap-2.5 h-12 rounded-sm font-mono font-bold text-sm uppercase tracking-widest text-white transition-opacity disabled:opacity-40"
            style={{ background: "linear-gradient(135deg, #2D5A3A, #F7931A)" }}
          >
            {sending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending…
              </>
            ) : !isMiniPay ? (
              <>
                <Smartphone className="h-4 w-4" />
                Open in MiniPay to Pay
              </>
            ) : !authenticated ? (
              <>
                <Wallet className="h-4 w-4" />
                Connect Wallet
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4" />
                Pay {payAmount ? `${payAmount} cUSD` : ""}
              </>
            )}
          </button>

          {/* Insufficient balance hint */}
          {isMiniPay && payAmount && parseFloat(payAmount) > parseFloat(cusdBalance ?? "0") && !sending && (
            <div className="flex items-center gap-2 text-[11px] font-mono text-amber-400/80">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>
                You need {payAmount} cUSD — balance is {fmt(cusdBalance)}.{" "}
                <a href="/swap" className="underline hover:text-amber-300">Swap tokens first.</a>
              </span>
            </div>
          )}

          {/* Tx result */}
          {txHash && (
            <div
              className={`rounded-sm border p-4 space-y-2 ${
                txSuccess
                  ? "border-green-500/30 bg-green-500/5"
                  : "border-red-500/30 bg-red-500/5"
              }`}
            >
              <div className="flex items-center gap-2">
                {txSuccess ? (
                  <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
                )}
                <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  {txSuccess ? "Payment Confirmed" : "Transaction Failed"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-white/30 truncate">{txHash}</span>
                <button
                  onClick={() => copyAddr(txHash)}
                  className="shrink-0 text-white/30 hover:text-white/60"
                >
                  <Copy className="h-3 w-3" />
                </button>
              </div>
              <a
                href={`${CELO_EXPLORER}/tx/${txHash}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-[10px] font-mono text-[#F7931A]/70 hover:text-[#F7931A]"
              >
                <ExternalLink className="h-2.5 w-2.5" /> View on Celoscan
              </a>
            </div>
          )}

          {/* Error */}
          {error && !sending && (
            <div className="flex items-center gap-2 text-[11px] font-mono text-red-400/80">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

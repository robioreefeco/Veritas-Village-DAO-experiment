import { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { Link } from "wouter";
import {
  KeyRound, ShieldCheck, AlertTriangle, ArrowRight, Mail,
  CheckCircle2, RefreshCw, Wallet, Eye, ChevronDown, ChevronRight,
  ExternalLink,
} from "lucide-react";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.741l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

const STEPS = [
  {
    n: "01",
    title: "Verify your identity",
    body: "Privy re-authenticates you with the same social account you used to sign up. No password needed.",
  },
  {
    n: "02",
    title: "Privy reveals your key",
    body: "Your private key is displayed inside a secure Privy iframe — it never touches our servers.",
  },
  {
    n: "03",
    title: "Save it offline",
    body: "Copy the key and store it in a password manager, an encrypted USB, or write it down and lock it away.",
  },
];

const IMPORT_GUIDES = [
  {
    wallet: "MetaMask",
    steps: [
      "Open MetaMask → click the account selector at the top.",
      "Click + Add account or hardware wallet.",
      "Choose Import account.",
      'Select "Private Key" as type, paste your key, and click Import.',
    ],
    url: "https://support.metamask.io/managing-my-wallet/accounts-and-addresses/how-to-import-an-account/",
  },
  {
    wallet: "Rabby",
    steps: [
      "Open Rabby → Settings → Address management.",
      "Click + Add address.",
      'Choose "Import private key".',
      "Paste your key and confirm.",
    ],
    url: "https://rabby.io/",
  },
  {
    wallet: "Rainbow",
    steps: [
      "Open Rainbow → Settings → Wallets & Backup.",
      "Tap + Add wallet.",
      "Choose Import a wallet → Private Key.",
      "Paste your key and save.",
    ],
    url: "https://rainbow.me/",
  },
];

function ImportGuide({ guide }: { guide: typeof IMPORT_GUIDES[0] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-sm border border-white/8 overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white/3 hover:bg-white/6 transition-colors text-left"
      >
        <span className="font-mono text-[11px] uppercase tracking-widest text-white/70">{guide.wallet}</span>
        {open
          ? <ChevronDown className="h-3.5 w-3.5 text-white/30 shrink-0" />
          : <ChevronRight className="h-3.5 w-3.5 text-white/30 shrink-0" />}
      </button>
      {open && (
        <div className="px-4 py-3 space-y-2 bg-white/2">
          {guide.steps.map((s, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <span className="text-[#F7931A]/50 font-mono text-[9px] mt-0.5 shrink-0 w-4">{i + 1}.</span>
              <span className="text-[10px] font-mono text-white/45 leading-relaxed">{s}</span>
            </div>
          ))}
          <a
            href={guide.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex items-center gap-1 text-[9px] font-mono text-[#F7931A]/50 hover:text-[#F7931A] transition-colors"
          >
            Official docs <ExternalLink className="h-2.5 w-2.5" />
          </a>
        </div>
      )}
    </div>
  );
}

export default function Recovery() {
  const { authenticated, login, ready, user, exportWallet } = usePrivy();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const walletAddress = user?.wallet?.address ?? "";
  const twitterUsername = (user as any)?.twitter?.username as string | undefined;
  const googleEmail = (user as any)?.google?.email as string | undefined;
  const email = user?.email?.address;

  const isSocialUser = !!(twitterUsername || googleEmail || email);
  const isExternalWalletOnly = authenticated && !isSocialUser;

  const socialLabel = twitterUsername
    ? `@${twitterUsername} (X / Twitter)`
    : googleEmail
    ? `${googleEmail} (Google)`
    : email ?? null;

  const socialIcon = twitterUsername
    ? <XIcon className="h-4 w-4 text-white/70" />
    : googleEmail
    ? <GoogleIcon className="h-4 w-4" />
    : <Mail className="h-4 w-4 text-white/60" />;

  const shortAddress = walletAddress
    ? `${walletAddress.slice(0, 8)}…${walletAddress.slice(-6)}`
    : "";

  const handleExport = async () => {
    if (!walletAddress) return;
    setLoading(true);
    try {
      await exportWallet({ address: walletAddress });
      setDone(true);
      setTimeout(() => setDone(false), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">

      {/* ── Page header ── */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-sm bg-[#F7931A]/15 border border-[#F7931A]/25 flex items-center justify-center">
            <KeyRound className="h-4 w-4 text-[#F7931A]" />
          </div>
          <h1 className="font-mono text-xs uppercase tracking-widest text-[#F7931A]">
            Private Key Recovery
          </h1>
        </div>
        <p className="text-2xl font-bold text-white leading-snug">
          Self-custody your embedded wallet
        </p>
        <p className="text-sm font-mono text-white/40 leading-relaxed">
          When you sign in with Google, X, or Email, Privy creates a non-custodial embedded wallet secured by your social login. You can export the private key at any time to gain full self-custody.
        </p>
      </div>

      {/* ── State: not ready ── */}
      {!ready && (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-5 w-5 text-white/20 animate-spin" />
        </div>
      )}

      {/* ── State: logged out ── */}
      {ready && !authenticated && (
        <div className="rounded-sm border border-white/10 bg-white/3 p-6 space-y-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-[#2D5A3A] shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-white mb-1">Sign in to recover your key</p>
              <p className="text-[11px] font-mono text-white/40 leading-relaxed">
                Log in with the same social account you used when you first joined. Privy will re-verify your identity and reveal your embedded wallet's private key.
              </p>
            </div>
          </div>
          <button
            onClick={login}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-sm font-mono text-[11px] uppercase tracking-widest transition-all"
            style={{ background: "linear-gradient(135deg, rgba(45,90,58,0.5), rgba(247,147,26,0.25))", border: "1px solid rgba(247,147,26,0.35)" }}
          >
            <KeyRound className="h-4 w-4 text-[#F7931A]" />
            <span className="text-[#F7931A]">Sign in to recover</span>
          </button>
        </div>
      )}

      {/* ── State: external wallet only ── */}
      {ready && isExternalWalletOnly && (
        <div className="rounded-sm border border-white/10 bg-white/3 p-6 space-y-3">
          <div className="flex items-start gap-3">
            <Wallet className="h-5 w-5 text-white/50 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-white mb-1">External wallet detected</p>
              <p className="text-[11px] font-mono text-white/40 leading-relaxed">
                You're connected with an external wallet (MetaMask, Rabby, Rainbow, etc.). Your private key is already in your wallet — you don't need to recover it here. Check your wallet's built-in backup or seed-phrase export instead.
              </p>
            </div>
          </div>
          <Link href="/">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-[#F7931A]/60 hover:text-[#F7931A] transition-colors cursor-pointer">
              <ArrowRight className="h-3 w-3" /> Back to Dashboard
            </span>
          </Link>
        </div>
      )}

      {/* ── State: social user authenticated ── */}
      {ready && authenticated && isSocialUser && (
        <>
          {/* Guardian row */}
          <div className="rounded-sm border border-[#2D5A3A]/40 bg-[#2D5A3A]/10 px-4 py-3 flex items-center gap-3">
            <ShieldCheck className="h-4 w-4 text-[#2D5A3A] shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[9px] uppercase tracking-widest text-white/30 font-mono mb-0.5">Guardian account</p>
              <div className="flex items-center gap-2">
                {socialIcon}
                <span className="font-mono text-[11px] text-white/70 truncate">{socialLabel}</span>
              </div>
            </div>
            <span className="text-[8px] font-mono uppercase tracking-widest text-green-400/70 border border-green-400/20 px-1.5 py-0.5 rounded shrink-0">
              Active
            </span>
          </div>

          {/* Embedded wallet address */}
          {walletAddress && (
            <div className="rounded-sm border border-white/8 bg-white/3 px-4 py-3">
              <p className="text-[9px] uppercase tracking-widest text-white/30 font-mono mb-1">Embedded wallet</p>
              <div className="flex items-center gap-2">
                <Wallet className="h-3.5 w-3.5 text-[#F7931A] shrink-0" />
                <span className="font-mono text-[11px] text-white/60">{shortAddress}</span>
              </div>
            </div>
          )}

          {/* How it works */}
          <div className="space-y-3">
            <p className="text-[9px] uppercase tracking-widest text-white/25 font-mono">How it works</p>
            <div className="grid gap-2">
              {STEPS.map((step) => (
                <div key={step.n} className="flex items-start gap-3 p-3 rounded-sm bg-white/3 border border-white/6">
                  <span className="font-mono text-[10px] text-[#F7931A]/50 shrink-0 w-6 pt-0.5">{step.n}</span>
                  <div>
                    <p className="text-[11px] font-bold text-white/80 mb-0.5">{step.title}</p>
                    <p className="text-[10px] font-mono text-white/35 leading-relaxed">{step.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Security warning */}
          <div className="flex items-start gap-3 px-4 py-3 rounded-sm border border-amber-500/20 bg-amber-500/5">
            <AlertTriangle className="h-4 w-4 text-amber-400/70 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold text-amber-400/80 uppercase tracking-wider">Security warning</p>
              <p className="text-[10px] font-mono text-white/35 leading-relaxed">
                Anyone with your private key has full, permanent access to this wallet and all its assets. Never share it, never paste it into a website, and never store it unencrypted.
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="space-y-2">
            <button
              onClick={handleExport}
              disabled={loading || !walletAddress}
              className="w-full flex items-center justify-center gap-2.5 px-4 py-4 rounded-sm font-mono text-[12px] uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: done
                  ? "rgba(74,207,114,0.12)"
                  : "linear-gradient(135deg, rgba(45,90,58,0.45), rgba(247,147,26,0.22))",
                border: done
                  ? "1px solid rgba(74,207,114,0.35)"
                  : "1px solid rgba(247,147,26,0.4)",
              }}
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 text-[#F7931A] animate-spin" />
              ) : done ? (
                <CheckCircle2 className="h-4 w-4 text-green-400" />
              ) : (
                <Eye className="h-4 w-4 text-[#F7931A]" />
              )}
              <span className={done ? "text-green-400" : "text-[#F7931A]"}>
                {loading ? "Authenticating…" : done ? "Private key revealed" : "Reveal private key"}
              </span>
            </button>
            <p className="text-[9px] font-mono text-white/20 text-center leading-relaxed">
              Privy will re-verify your social login before displaying the key.
            </p>
          </div>

          {/* Import guides */}
          <div className="space-y-3 pt-2 border-t border-white/8">
            <p className="text-[9px] uppercase tracking-widest text-white/25 font-mono">
              Import into your wallet
            </p>
            <p className="text-[10px] font-mono text-white/35 leading-relaxed">
              After exporting, paste the private key into any EVM-compatible wallet to use it for transactions, staking, or long-term storage outside Privy.
            </p>
            <div className="space-y-2">
              {IMPORT_GUIDES.map((g) => (
                <ImportGuide key={g.wallet} guide={g} />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

import { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { Link } from "wouter";
import { useApp } from "@/context/AppContext";
import { useListProposals } from "@workspace/api-client-react";
import {
  ArrowRight, CheckCircle2, Copy, KeyRound, LogOut,
  Mail, MapPin, ShieldCheck, User, Wallet, Zap,
} from "lucide-react";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.741l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="shrink-0 transition-colors"
    >
      {copied
        ? <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
        : <Copy className="h-3.5 w-3.5 text-white/20 hover:text-white/50" />}
    </button>
  );
}

export default function Profile() {
  const { logout } = usePrivy();
  const { twitterUsername, googleEmail, userEmail, walletAddress, isSocialUser, selectedCommunity } = useApp();
  const { data: proposals } = useListProposals({ chain: "all" });

  const shortAddress = walletAddress
    ? `${walletAddress.slice(0, 8)}…${walletAddress.slice(-6)}`
    : "";

  const displayName = twitterUsername
    ? `@${twitterUsername}`
    : googleEmail ?? userEmail ?? shortAddress ?? "Anon";

  const initials = displayName.replace("@", "").slice(0, 2).toUpperCase();

  const linkedAccounts = [
    twitterUsername && {
      key: "twitter",
      icon: <XIcon className="h-4 w-4 text-white/70" />,
      label: `@${twitterUsername}`,
      type: "X / Twitter",
      copyValue: twitterUsername,
    },
    googleEmail && {
      key: "google",
      icon: <GoogleIcon className="h-4 w-4" />,
      label: googleEmail,
      type: "Google",
      copyValue: googleEmail,
    },
    userEmail && {
      key: "email",
      icon: <Mail className="h-4 w-4 text-white/60" />,
      label: userEmail,
      type: "Email",
      copyValue: userEmail,
    },
    walletAddress && {
      key: "wallet",
      icon: <Wallet className="h-4 w-4 text-[#F7931A]" />,
      label: shortAddress,
      type: "Embedded Wallet",
      copyValue: walletAddress,
    },
  ].filter(Boolean) as Array<{ key: string; icon: JSX.Element; label: string; type: string; copyValue: string }>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* ── Header ── */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-sm bg-white/8 border border-white/10 flex items-center justify-center">
          <User className="h-4 w-4 text-white/60" />
        </div>
        <h1 className="font-mono text-xs uppercase tracking-widest text-white/50">My Profile</h1>
      </div>

      {/* ── Avatar + display name ── */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#2D5A3A] to-[#F7931A] flex items-center justify-center shrink-0">
          <span className="font-bold text-white text-xl">{initials}</span>
        </div>
        <div>
          <p className="text-xl font-bold text-white">{displayName}</p>
          {selectedCommunity && (
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-base">{selectedCommunity.flag}</span>
              <span className="text-[10px] font-mono text-white/40">{selectedCommunity.name}</span>
              <span className="text-[8px] text-white/20">·</span>
              <MapPin className="h-2.5 w-2.5 text-white/25" />
              <span className="text-[10px] font-mono text-white/30">{selectedCommunity.country}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Linked accounts ── */}
      <div className="space-y-3">
        <p className="text-[9px] uppercase tracking-widest text-white/25 font-mono">Linked accounts</p>

        {linkedAccounts.length === 0 ? (
          <div className="text-center py-6 text-[11px] font-mono text-white/25">No linked accounts.</div>
        ) : (
          <div className="space-y-2">
            {linkedAccounts.map((acct) => (
              <div key={acct.key} className="flex items-center gap-3 px-4 py-3.5 rounded-sm border border-white/8 bg-white/3">
                <span className="shrink-0 w-7 flex items-center justify-center">{acct.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[8px] uppercase tracking-widest text-white/25 font-mono mb-0.5">{acct.type}</p>
                  <p className="text-[11px] font-mono text-white/65 truncate">{acct.label}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-400/60" />
                  <CopyButton text={acct.copyValue} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Community membership ── */}
      <div className="space-y-3">
        <p className="text-[9px] uppercase tracking-widest text-white/25 font-mono">Community</p>
        {selectedCommunity ? (
          <div className="flex items-center gap-3 px-4 py-3.5 rounded-sm border border-white/8 bg-white/3">
            <span className="text-2xl shrink-0">{selectedCommunity.flag}</span>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-bold text-white">{selectedCommunity.name}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <MapPin className="h-2.5 w-2.5 text-white/25" />
                <span className="text-[9px] font-mono text-white/35">{selectedCommunity.country}</span>
                <span className="text-[8px] font-mono text-green-400/60 ml-2 border border-green-400/20 px-1.5 py-0.5 rounded uppercase tracking-wider">
                  {selectedCommunity.status === "active" ? "Active" : "Coming Soon"}
                </span>
              </div>
            </div>
            <Link href={`/workspace/${selectedCommunity.id}`}>
              <div className="flex items-center gap-1 text-[9px] font-mono uppercase tracking-widest text-[#F7931A]/60 hover:text-[#F7931A] transition-colors cursor-pointer">
                Workspace <ArrowRight className="h-3 w-3" />
              </div>
            </Link>
          </div>
        ) : (
          <div className="flex items-center justify-between px-4 py-3.5 rounded-sm border border-dashed border-white/12 bg-white/2">
            <p className="text-[10px] font-mono text-white/30">No community selected</p>
            <Link href="/onboarding">
              <span className="text-[9px] font-mono uppercase tracking-widest text-[#F7931A]/60 hover:text-[#F7931A] transition-colors cursor-pointer">
                Set up →
              </span>
            </Link>
          </div>
        )}
      </div>

      {/* ── Voting activity ── */}
      <div className="space-y-3">
        <p className="text-[9px] uppercase tracking-widest text-white/25 font-mono">Governance activity</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-sm border border-white/8 bg-white/3 space-y-1">
            <p className="font-mono text-2xl font-bold text-white">{proposals?.filter(p => p.status === "active").length ?? 0}</p>
            <p className="text-[9px] uppercase tracking-widest font-mono text-white/30">Active proposals</p>
          </div>
          <div className="p-4 rounded-sm border border-white/8 bg-white/3 space-y-1">
            <p className="font-mono text-2xl font-bold text-white">{proposals?.length ?? 0}</p>
            <p className="text-[9px] uppercase tracking-widest font-mono text-white/30">Total proposals</p>
          </div>
        </div>
        <Link href="/proposals">
          <div className="flex items-center justify-between px-4 py-3 rounded-sm border border-white/8 bg-white/2 hover:bg-white/4 transition-colors cursor-pointer group">
            <span className="text-[11px] font-mono text-white/50 group-hover:text-white/70">View all proposals</span>
            <ArrowRight className="h-3.5 w-3.5 text-white/25 group-hover:text-[#F7931A] transition-colors" />
          </div>
        </Link>
      </div>

      {/* ── Security actions ── */}
      <div className="space-y-3">
        <p className="text-[9px] uppercase tracking-widest text-white/25 font-mono">Security</p>
        <div className="space-y-2">
          {isSocialUser && (
            <Link href="/recovery">
              <div className="flex items-center gap-3 px-4 py-3.5 rounded-sm border border-[#F7931A]/15 bg-[#F7931A]/4 hover:bg-[#F7931A]/8 transition-colors cursor-pointer group">
                <KeyRound className="h-4 w-4 text-[#F7931A] shrink-0" />
                <div className="flex-1">
                  <p className="text-[11px] font-bold text-[#F7931A]/80 group-hover:text-[#F7931A]">Private Key Recovery</p>
                  <p className="text-[9px] font-mono text-white/30 mt-0.5">Export your embedded wallet key for full self-custody</p>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-[#F7931A]/40 group-hover:text-[#F7931A] transition-colors shrink-0" />
              </div>
            </Link>
          )}
          <div className="flex items-center gap-3 px-4 py-3.5 rounded-sm border border-white/8 bg-white/3">
            <ShieldCheck className="h-4 w-4 text-[#2D5A3A] shrink-0" />
            <div className="flex-1">
              <p className="text-[11px] font-bold text-white/70">Privy Embedded Wallet</p>
              <p className="text-[9px] font-mono text-white/30 mt-0.5">Non-custodial · secured by your social login</p>
            </div>
            <span className="text-[8px] font-mono uppercase tracking-widest text-green-400/60 border border-green-400/20 px-1.5 py-0.5 rounded shrink-0">Active</span>
          </div>
          <div className="flex items-center gap-3 px-4 py-3.5 rounded-sm border border-white/8 bg-white/3">
            <Zap className="h-4 w-4 text-white/40 shrink-0" />
            <div className="flex-1">
              <p className="text-[11px] font-bold text-white/70">Vocdoni Voting</p>
              <p className="text-[9px] font-mono text-white/30 mt-0.5">Anonymous, censorship-resistant governance</p>
            </div>
            <span className="text-[8px] font-mono uppercase tracking-widest text-green-400/60 border border-green-400/20 px-1.5 py-0.5 rounded shrink-0">Ready</span>
          </div>
        </div>
      </div>

      {/* ── Sign out ── */}
      <div className="pt-2 border-t border-white/8">
        <button
          onClick={logout}
          className="flex items-center gap-2 px-4 py-3 rounded-sm text-red-400/60 hover:text-red-400 hover:bg-red-500/8 border border-transparent hover:border-red-500/15 transition-all"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span className="text-[11px] font-mono uppercase tracking-widest">Disconnect & sign out</span>
        </button>
      </div>
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { usePrivy, useLoginWithOAuth, useLoginWithEmail, useConnectWallet } from "@privy-io/react-auth";
import {
  LayoutDashboard, Shield, Wallet, Menu, PlusCircle, Globe, X,
  ExternalLink, ArrowRightLeft, Mail, LogOut, ChevronDown, ChevronUp, Copy, CheckCircle2,
  Bitcoin, KeyRound, RefreshCw, User, MapPin, ChevronRight, Layers, Loader2, ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp, COMMUNITIES } from "@/context/AppContext";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

function VeritasLogo({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <img
      src={`${BASE}/veritas-logo.png`}
      alt="Veritas Villages"
      className={className}
      style={{ imageRendering: "auto", ...style }}
    />
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.741l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

// ─── Wallet Icons ───────────────────────────────────────────────────────────────
function MetaMaskIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 35 33" fill="none">
      <path d="M32.96 1L19.37 10.56l2.45-5.77L32.96 1z" fill="#E17726" stroke="#E17726" strokeWidth=".25" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2.04 1l13.46 9.65-2.33-5.86L2.04 1z" fill="#E27625" stroke="#E27625" strokeWidth=".25" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M28.17 23.53l-3.61 5.52 7.73 2.13 2.22-7.52-6.34-.13zM1.52 23.66l2.21 7.52 7.72-2.13-3.6-5.52-6.33.13z" fill="#E27625" stroke="#E27625" strokeWidth=".25" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M11.03 14.51l-2.16 3.27 7.68.35-.26-8.25-5.26 4.63zM23.97 14.51l-5.32-4.72-.17 8.34 7.67-.35-2.18-3.27zM11.45 29.05l4.61-2.24-3.98-3.1-.63 5.34zM18.94 26.81l4.6 2.24-.62-5.34-3.98 3.1z" fill="#E27625" stroke="#E27625" strokeWidth=".25" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function RabbyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="8" fill="#8697FF"/>
      <path d="M8 16c0-4.4 3.6-8 8-8s8 3.6 8 8-3.6 8-8 8-8-3.6-8-8z" fill="white" opacity=".3"/>
      <path d="M11 16a5 5 0 1 1 10 0A5 5 0 0 1 11 16z" fill="white"/>
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

function RainbowIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 120" fill="none">
      <rect width="120" height="120" rx="28" fill="url(#rw-bg)"/>
      <path d="M20 80c0-22.1 17.9-40 40-40s40 17.9 40 40" stroke="url(#rw-red)" strokeWidth="12" strokeLinecap="round" fill="none"/>
      <path d="M30 80c0-16.6 13.4-30 30-30s30 13.4 30 30" stroke="url(#rw-or)" strokeWidth="12" strokeLinecap="round" fill="none"/>
      <path d="M40 80c0-11 9-20 20-20s20 9 20 20" stroke="#FFF176" strokeWidth="12" strokeLinecap="round" fill="none"/>
      <path d="M50 80c0-5.5 4.5-10 10-10s10 4.5 10 10" stroke="#A5D6A7" strokeWidth="12" strokeLinecap="round" fill="none"/>
      <defs>
        <linearGradient id="rw-bg" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1E1B4B"/>
          <stop offset="1" stopColor="#312E81"/>
        </linearGradient>
        <linearGradient id="rw-red" x1="20" y1="80" x2="100" y2="80" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF6B6B"/>
          <stop offset="1" stopColor="#FF8E53"/>
        </linearGradient>
        <linearGradient id="rw-or" x1="30" y1="80" x2="90" y2="80" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFB347"/>
          <stop offset="1" stopColor="#FFCC02"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

function WalletConnectIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="8" fill="#3B99FC"/>
      <path d="M9.6 13.5c3.5-3.5 9.3-3.5 12.8 0l.4.4c.2.2.2.5 0 .7l-1.4 1.4c-.1.1-.3.1-.4 0l-.6-.6c-2.5-2.5-6.5-2.5-8.9 0l-.6.6c-.1.1-.3.1-.4 0L9.1 14.6c-.2-.2-.2-.5 0-.7l.5-.4zm15.8 2.9l1.2 1.2c.2.2.2.5 0 .7l-5.6 5.6c-.2.2-.5.2-.7 0l-3.9-3.9c-.1-.1-.2-.1-.3 0l-3.9 3.9c-.2.2-.5.2-.7 0L5.9 18.3c-.2-.2-.2-.5 0-.7l1.2-1.2c.2-.2.5-.2.7 0l3.9 3.9c.1.1.2.1.3 0l3.9-3.9c.2-.2.5-.2.7 0l3.9 3.9c.1.1.2.1.3 0l3.9-3.9c.2-.2.5-.2.7 0z" fill="white"/>
    </svg>
  );
}

// ─── TopBar Login Dropdown ───────────────────────────────────────────────────────
function LoginDropdown({ onClose }: { onClose: () => void }) {
  const { initOAuth } = useLoginWithOAuth();
  const { sendCode, loginWithCode } = useLoginWithEmail();
  const { connectWallet } = useConnectWallet();

  const [emailStep, setEmailStep] = useState<'idle' | 'email' | 'code'>('idle');
  const [emailVal, setEmailVal] = useState('');
  const [codeVal, setCodeVal] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const handleOAuth = async (provider: 'google' | 'twitter') => {
    try { onClose(); await initOAuth({ provider }); } catch { /* redirect in progress */ }
  };
  const handleSend = async () => {
    if (!emailVal.trim()) return;
    setBusy(true); setErr('');
    try { await sendCode({ email: emailVal.trim() }); setEmailStep('code'); }
    catch { setErr('Could not send code. Check your email address.'); }
    finally { setBusy(false); }
  };
  const handleVerify = async () => {
    if (!codeVal.trim()) return;
    setBusy(true); setErr('');
    try { await loginWithCode({ code: codeVal.trim() }); onClose(); }
    catch { setErr('Invalid code — please try again.'); }
    finally { setBusy(false); }
  };

  return (
    <div className="absolute right-0 top-full mt-2 w-72 z-50 glass border border-white/12 rounded-sm shadow-2xl overflow-hidden">
      <div className="p-3 space-y-1">
        {emailStep === 'idle' && (<>
          <p className="text-[8px] uppercase tracking-widest text-white/25 font-mono px-1 pb-1">Social login</p>
          <LoginMethodButton onClick={() => handleOAuth('twitter')} icon={<XIcon className="h-4 w-4 text-white" />} label="Twitter / X" sublabel="Connect your X account" />
          <LoginMethodButton onClick={() => handleOAuth('google')} icon={<GoogleIcon className="h-4 w-4" />} label="Google / Gmail" sublabel="Continue with your Google account" />
          <LoginMethodButton onClick={() => setEmailStep('email')} icon={<Mail className="h-4 w-4 text-white/70" />} label="Email" sublabel="One-time code — no password" />
          <div className="border-t border-white/8 my-1" />
          <p className="text-[8px] uppercase tracking-widest text-white/25 font-mono px-1 pt-1 pb-1">Crypto wallet</p>
          <LoginMethodButton onClick={() => { onClose(); connectWallet(); }} icon={<div className="flex items-center gap-0.5"><RainbowIcon className="h-4 w-4" /><RabbyIcon className="h-3.5 w-3.5" /></div>} label="Rainbow / Rabby" sublabel="Connect an existing wallet" />
          <LoginMethodButton onClick={() => { onClose(); connectWallet(); }} icon={<WalletConnectIcon className="h-4 w-4" />} label="WalletConnect" sublabel="Any wallet via QR code" />
        </>)}
        {emailStep === 'email' && (
          <div className="space-y-2 py-1">
            <button onClick={() => setEmailStep('idle')} className="flex items-center gap-1 text-[9px] text-white/40 hover:text-white/70 font-mono mb-1">
              <ArrowLeft className="h-3 w-3" /> Back
            </button>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/60 px-1">Enter your email</p>
            <input value={emailVal} onChange={e => setEmailVal(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="you@example.com" className="w-full bg-white/5 border border-white/15 rounded-sm px-3 py-2 text-[11px] font-mono text-white placeholder:text-white/20 focus:outline-none focus:border-[#F7931A]/50" />
            {err && <p className="text-[9px] text-red-400 font-mono px-1">{err}</p>}
            <button onClick={handleSend} disabled={busy || !emailVal.trim()} className="w-full flex items-center justify-center gap-2 py-2 rounded-sm bg-[#F7931A]/80 hover:bg-[#F7931A] disabled:opacity-40 transition-all text-[10px] font-bold uppercase tracking-widest text-white">
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Send Code'}
            </button>
          </div>
        )}
        {emailStep === 'code' && (
          <div className="space-y-2 py-1">
            <button onClick={() => setEmailStep('email')} className="flex items-center gap-1 text-[9px] text-white/40 hover:text-white/70 font-mono mb-1">
              <ArrowLeft className="h-3 w-3" /> Back
            </button>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/60 px-1">Check your inbox</p>
            <p className="text-[9px] font-mono text-white/35 px-1">Enter the code sent to <span className="text-[#F7931A]/70">{emailVal}</span></p>
            <input value={codeVal} onChange={e => setCodeVal(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleVerify()} placeholder="6-digit code" maxLength={8} className="w-full bg-white/5 border border-white/15 rounded-sm px-3 py-2 text-[11px] font-mono text-white placeholder:text-white/20 focus:outline-none focus:border-[#35D07F]/50 tracking-[0.3em] text-center" />
            {err && <p className="text-[9px] text-red-400 font-mono px-1">{err}</p>}
            <button onClick={handleVerify} disabled={busy || !codeVal.trim()} className="w-full flex items-center justify-center gap-2 py-2 rounded-sm bg-[#35D07F]/70 hover:bg-[#35D07F] disabled:opacity-40 transition-all text-[10px] font-bold uppercase tracking-widest text-white">
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Verify & Sign In'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function UserDropdown({ onClose, onLogout }: { onClose: () => void; onLogout: () => void }) {
  const { user } = usePrivy();
  const [copied, setCopied] = useState(false);
  const address = user?.wallet?.address ?? "";
  const twitterUsername = (user as any)?.twitter?.username as string | undefined;
  const googleEmail = (user as any)?.google?.email as string | undefined;
  const email = user?.email?.address;
  const shortAddress = address ? `${address.slice(0, 6)}…${address.slice(-4)}` : "";
  const copy = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="absolute right-0 top-full mt-2 w-64 z-50 glass border border-white/12 rounded-sm shadow-2xl overflow-hidden">
      <div className="p-3 space-y-1.5">
        {twitterUsername && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-sm bg-white/5">
            <XIcon className="h-3 w-3 text-white/50 shrink-0" />
            <span className="font-mono text-[10px] text-white/60">@{twitterUsername}</span>
          </div>
        )}
        {googleEmail && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-sm bg-white/5">
            <GoogleIcon className="h-3 w-3 shrink-0" />
            <span className="font-mono text-[10px] text-white/60 truncate">{googleEmail}</span>
          </div>
        )}
        {email && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-sm bg-white/5">
            <Mail className="h-3 w-3 text-white/50 shrink-0" />
            <span className="font-mono text-[10px] text-white/60 truncate">{email}</span>
          </div>
        )}
        {address && (
          <button onClick={copy}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-sm bg-white/5 hover:bg-white/8 transition-colors text-left group">
            <Wallet className="h-3.5 w-3.5 text-[#F7931A] shrink-0" />
            <span className="font-mono text-[10px] text-white/60 flex-1 truncate">{shortAddress}</span>
            {copied
              ? <CheckCircle2 className="h-3 w-3 text-green-400 shrink-0" />
              : <Copy className="h-3 w-3 text-white/20 group-hover:text-white/50 shrink-0" />}
          </button>
        )}

        {/* Social key recovery */}
        {address && (
          <>
            <div className="border-t border-white/8 my-1" />
            <div className="px-1 py-1">
              <SocialKeyRecovery
                address={address}
                twitterUsername={twitterUsername}
                googleEmail={googleEmail}
                email={email}
                compact
              />
            </div>
          </>
        )}

        <div className="border-t border-white/8 my-1" />
        <button onClick={() => { onLogout(); onClose(); }}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-sm text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-colors">
          <LogOut className="h-3.5 w-3.5 shrink-0" />
          <span className="text-[10px] font-mono uppercase tracking-widest">Disconnect</span>
        </button>
      </div>
    </div>
  );
}

function TopBar() {
  const { authenticated, logout, user } = usePrivy();
  const [open, setOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const loginRef = useRef<HTMLDivElement>(null);
  const address = user?.wallet?.address ?? "";
  const twitterUsername = (user as any)?.twitter?.username as string | undefined;
  const email = user?.email?.address;
  const shortAddress = address ? `${address.slice(0, 6)}…${address.slice(-4)}` : "";
  const displayName = twitterUsername ? `@${twitterUsername}` : email ?? (shortAddress || "");

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => {
    if (!loginOpen) return;
    const handler = (e: MouseEvent) => {
      if (loginRef.current && !loginRef.current.contains(e.target as Node)) setLoginOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [loginOpen]);

  return (
    <div className="hidden md:flex items-center justify-end gap-2 px-6 py-3 border-b border-white/8 sidebar-glass shrink-0">
      {authenticated ? (
        /* ── Authenticated: user chip + quick logout ── */
        <div className="flex items-center gap-2">
          <div className="relative" ref={ref}>
            <button
              onClick={() => setOpen(o => !o)}
              className="flex items-center gap-2.5 px-3 py-2 glass rounded-sm border border-white/10 hover:border-[#F7931A]/30 transition-colors group"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#2D5A3A] to-[#F7931A] flex items-center justify-center shrink-0">
                {twitterUsername
                  ? <XIcon className="h-3 w-3 text-white" />
                  : email
                    ? <Mail className="h-3 w-3 text-white" />
                    : <Wallet className="h-3 w-3 text-white" />}
              </div>
              <span className="text-[11px] font-mono text-white/70 group-hover:text-white transition-colors max-w-[120px] truncate">
                {displayName}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
              <ChevronDown className={`h-3 w-3 text-white/30 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
            </button>
            {open && (
              <UserDropdown onClose={() => setOpen(false)} onLogout={logout} />
            )}
          </div>

          {/* Quick one-click logout button */}
          <button
            onClick={() => logout()}
            title="Log out"
            className="flex items-center gap-1.5 px-3 py-2 glass rounded-sm border border-white/8 hover:border-red-500/30 hover:bg-red-500/8 text-white/35 hover:text-red-400 transition-all group"
          >
            <LogOut className="h-3.5 w-3.5 shrink-0" />
            <span className="text-[10px] font-mono uppercase tracking-widest hidden lg:inline">Log out</span>
          </button>
        </div>
      ) : (
        /* ── Unauthenticated: login dropdown ── */
        <div className="relative" ref={loginRef}>
          <button
            onClick={() => setLoginOpen(o => !o)}
            className="flex items-center gap-2 px-4 py-2 rounded-sm font-bold text-[11px] uppercase tracking-widest text-white transition-opacity hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #2D5A3A, #F7931A)" }}
          >
            <Wallet className="h-3.5 w-3.5" />
            Log In
            <ChevronDown className={`h-3 w-3 transition-transform ${loginOpen ? "rotate-180" : ""}`} />
          </button>
          {loginOpen && <LoginDropdown onClose={() => setLoginOpen(false)} />}
        </div>
      )}
    </div>
  );
}

function PoweredBy() {
  return (
    <div className="px-4 py-4 border-t border-white/10 space-y-4">
      <div>
        <p className="text-[9px] uppercase tracking-widest text-white/30 mb-3 font-mono">Powered by</p>
        <div className="space-y-1.5">
          <a href="https://vocdoni.io" target="_blank" rel="noreferrer"
            className="flex items-center gap-2.5 px-2 py-1.5 rounded-sm hover:bg-white/5 transition-colors group">
            <img src={`${BASE}/vocdoni-logo.png`} alt="Vocdoni" className="h-4 w-4 object-contain opacity-40 group-hover:opacity-70 transition-opacity" style={{ filter: "invert(1)" }} />
            <span className="text-[10px] font-mono text-white/30 group-hover:text-white/60 transition-colors uppercase tracking-wider">Vocdoni</span>
            <span className="ml-auto text-[8px] font-mono text-white/15 group-hover:text-white/30">Voting</span>
          </a>
          <a href="https://rootstock.io" target="_blank" rel="noreferrer"
            className="flex items-center gap-2.5 px-2 py-1.5 rounded-sm hover:bg-white/5 transition-colors group">
            <img src={`${BASE}/rootstock-logo.png`} alt="Rootstock" className="h-4 w-4 object-contain opacity-40 group-hover:opacity-70 transition-opacity" style={{ filter: "invert(1)" }} />
            <span className="text-[10px] font-mono text-white/30 group-hover:text-white/60 transition-colors uppercase tracking-wider">Rootstock</span>
            <span className="ml-auto text-[8px] font-mono text-[#F7931A]/40 group-hover:text-[#F7931A]/70">rBTC</span>
          </a>
          <a href="https://celo.org" target="_blank" rel="noreferrer"
            className="flex items-center gap-2.5 px-2 py-1.5 rounded-sm hover:bg-white/5 transition-colors group">
            <img src={`${BASE}/celo-symbol.png`} alt="Celo" className="h-4 w-4 object-contain opacity-40 group-hover:opacity-70 transition-opacity" style={{ filter: "brightness(0) invert(1)" }} />
            <span className="text-[10px] font-mono text-white/30 group-hover:text-white/60 transition-colors uppercase tracking-wider">Celo</span>
            <span className="ml-auto text-[8px] font-mono text-[#35D07F]/40 group-hover:text-[#35D07F]/70">CELO</span>
          </a>
        </div>
      </div>
      <div className="border-t border-white/5 pt-3">
        <p className="text-[9px] uppercase tracking-widest text-white/20 mb-2 font-mono">Built at</p>
        <img src={`${BASE}/ipe-city-logo.png`} alt="Ipê City"
          className="h-5 w-auto object-contain opacity-30 hover:opacity-60 transition-opacity" />
      </div>
    </div>
  );
}

// ─── Social Key Recovery Card ────────────────────────────────────────────────
function SocialKeyRecovery({
  address,
  twitterUsername,
  googleEmail,
  email,
  compact = false,
}: {
  address: string;
  twitterUsername?: string;
  googleEmail?: string;
  email?: string;
  compact?: boolean;
}) {
  const { exportWallet } = usePrivy();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const socialLabel = twitterUsername
    ? `@${twitterUsername} (X / Twitter)`
    : googleEmail
    ? googleEmail + " (Google)"
    : email ?? "your social account";
  const socialIcon = twitterUsername
    ? <XIcon className="h-3 w-3 text-white/60" />
    : googleEmail
    ? <GoogleIcon className="h-3 w-3" />
    : <Mail className="h-3 w-3 text-white/60" />;

  const handleExport = async () => {
    setLoading(true);
    try {
      await exportWallet({ address });
      setDone(true);
      setTimeout(() => setDone(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  if (compact) {
    return (
      <div className="border-t border-white/8 pt-2 space-y-1.5">
        <p className="text-[8px] uppercase tracking-widest text-white/25 font-mono px-1">
          Social key recovery
        </p>
        <button
          onClick={handleExport}
          disabled={loading}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-sm bg-[#F7931A]/8 hover:bg-[#F7931A]/15 border border-[#F7931A]/20 hover:border-[#F7931A]/40 transition-all group disabled:opacity-50"
        >
          {loading
            ? <RefreshCw className="h-3.5 w-3.5 text-[#F7931A] shrink-0 animate-spin" />
            : done
            ? <CheckCircle2 className="h-3.5 w-3.5 text-green-400 shrink-0" />
            : <KeyRound className="h-3.5 w-3.5 text-[#F7931A] shrink-0" />}
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#F7931A]/80 group-hover:text-[#F7931A]">
            {done ? "Key revealed" : "Recover private key"}
          </span>
        </button>
        <p className="text-[8px] font-mono text-white/20 leading-relaxed px-1">
          Authenticated via {socialLabel}. Keep your key safe — it gives full wallet access.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-sm border border-[#F7931A]/15 bg-[#F7931A]/5 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 pt-3 pb-2">
        <div className="w-6 h-6 rounded-full bg-[#F7931A]/15 flex items-center justify-center shrink-0">
          <KeyRound className="h-3.5 w-3.5 text-[#F7931A]" />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#F7931A]">
            Social Key Recovery
          </p>
          <p className="text-[8px] font-mono text-white/30 leading-relaxed mt-0.5">
            Your wallet is guarded by your social login
          </p>
        </div>
      </div>

      {/* Social account row */}
      <div className="mx-3 mb-2 flex items-center gap-1.5 px-2 py-1.5 rounded-sm bg-white/5 border border-white/8">
        {socialIcon}
        <span className="text-[9px] font-mono text-white/50 truncate flex-1">{socialLabel}</span>
        <span className="text-[8px] font-mono text-green-400/70 uppercase tracking-wider shrink-0">Guardian</span>
      </div>

      {/* Explanation bullets */}
      <div className="mx-3 mb-2 space-y-0.5">
        {[
          "Privy verifies your social login before revealing the key",
          "Export your private key to use in any external wallet",
          "Store it offline — it grants full, permanent access",
        ].map((t) => (
          <div key={t} className="flex items-start gap-1.5">
            <span className="text-[#F7931A]/40 text-[8px] mt-0.5 shrink-0">›</span>
            <span className="text-[8px] font-mono text-white/25 leading-relaxed">{t}</span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="px-3 pb-3">
        <button
          onClick={handleExport}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-sm font-mono text-[10px] uppercase tracking-widest transition-all disabled:opacity-50"
          style={{ background: done ? "rgba(74,207,114,0.15)" : "linear-gradient(135deg, rgba(45,90,58,0.4), rgba(247,147,26,0.2))", border: done ? "1px solid rgba(74,207,114,0.4)" : "1px solid rgba(247,147,26,0.3)" }}
        >
          {loading
            ? <RefreshCw className="h-3.5 w-3.5 text-[#F7931A] animate-spin" />
            : done
            ? <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
            : <KeyRound className="h-3.5 w-3.5 text-[#F7931A]" />}
          <span className={done ? "text-green-400" : "text-[#F7931A]"}>
            {loading ? "Authenticating…" : done ? "Private key revealed" : "Recover private key"}
          </span>
        </button>
      </div>
    </div>
  );
}

function LoginMethodButton({
  onClick, icon, label, sublabel, color,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  color?: string;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-sm border border-white/10 hover:border-white/25 bg-white/3 hover:bg-white/6 transition-all group text-left"
    >
      <span className="shrink-0 w-7 h-7 flex items-center justify-center">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="text-[11px] font-bold uppercase tracking-widest text-white group-hover:text-white/90">{label}</div>
        {sublabel && <div className="text-[9px] font-mono text-white/30 mt-0.5">{sublabel}</div>}
      </div>
      <span className="text-white/20 group-hover:text-white/50 text-xs">→</span>
    </button>
  );
}

function UserPanel({ onLogout }: { onLogout: () => void }) {
  const { user } = usePrivy();
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const walletAddress = user?.wallet?.address;
  const email = user?.email?.address;
  const twitterUsername = (user as any)?.twitter?.username;
  const googleEmail = (user as any)?.google?.email as string | undefined;
  const displayName = twitterUsername ? `@${twitterUsername}` : googleEmail ?? email ?? "";
  const shortAddress = walletAddress
    ? `${walletAddress.slice(0, 6)}…${walletAddress.slice(-4)}`
    : "";
  const copy = () => {
    if (!walletAddress) return;
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-3 border-t border-white/10 space-y-2">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center gap-2.5 p-2.5 glass rounded-sm hover:bg-white/8 transition-colors group"
      >
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#2D5A3A] to-[#F7931A] flex items-center justify-center shrink-0 text-white text-[10px] font-bold">
          {twitterUsername ? <XIcon className="h-3.5 w-3.5 text-white" />
            : googleEmail ? <GoogleIcon className="h-3.5 w-3.5" />
            : email ? <Mail className="h-3.5 w-3.5 text-white" />
            : <Wallet className="h-3.5 w-3.5 text-white" />}
        </div>
        <div className="flex-1 min-w-0 text-left">
          {displayName && (
            <div className="text-[11px] font-bold text-white truncate">{displayName}</div>
          )}
          {walletAddress && (
            <div className="text-[9px] font-mono text-white/40 truncate">{shortAddress}</div>
          )}
        </div>
        <span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
        {expanded
          ? <ChevronUp className="h-3 w-3 text-white/30 shrink-0" />
          : <ChevronDown className="h-3 w-3 text-white/30 shrink-0" />}
      </button>

      {expanded && (
        <div className="space-y-1.5 px-1">
          {walletAddress && (
            <button onClick={copy}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-sm bg-white/5 hover:bg-white/8 transition-colors text-left group">
              <Wallet className="h-3.5 w-3.5 text-[#F7931A] shrink-0" />
              <span className="font-mono text-[10px] text-white/60 flex-1 truncate">{shortAddress}</span>
              {copied
                ? <CheckCircle2 className="h-3 w-3 text-green-400 shrink-0" />
                : <Copy className="h-3 w-3 text-white/20 group-hover:text-white/50 shrink-0" />}
            </button>
          )}
          {twitterUsername && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-sm bg-white/5">
              <XIcon className="h-3 w-3 text-white/50 shrink-0" />
              <span className="font-mono text-[10px] text-white/60">@{twitterUsername}</span>
            </div>
          )}
          {googleEmail && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-sm bg-white/5">
              <GoogleIcon className="h-3 w-3 shrink-0" />
              <span className="font-mono text-[10px] text-white/60 truncate">{googleEmail}</span>
            </div>
          )}
          {email && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-sm bg-white/5">
              <Mail className="h-3 w-3 text-white/50 shrink-0" />
              <span className="font-mono text-[10px] text-white/60 truncate">{email}</span>
            </div>
          )}

          {/* Social key recovery — full card */}
          {walletAddress && (
            <div className="pt-1.5">
              <SocialKeyRecovery
                address={walletAddress}
                twitterUsername={twitterUsername}
                googleEmail={googleEmail}
                email={email}
              />
            </div>
          )}

          <button onClick={onLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-sm text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-colors group">
            <LogOut className="h-3.5 w-3.5 shrink-0" />
            <span className="text-[10px] font-mono uppercase tracking-widest">Disconnect</span>
          </button>
        </div>
      )}
    </div>
  );
}

function SignInPanel() {
  const { initOAuth } = useLoginWithOAuth();
  const { sendCode, loginWithCode } = useLoginWithEmail();
  const { connectWallet } = useConnectWallet();

  const [emailStep, setEmailStep] = useState<'idle' | 'email' | 'code'>('idle');
  const [emailVal, setEmailVal] = useState('');
  const [codeVal, setCodeVal] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const handleOAuth = async (provider: 'google' | 'twitter') => {
    try { await initOAuth({ provider }); } catch { /* redirect in progress */ }
  };

  const handleSend = async () => {
    if (!emailVal.trim()) return;
    setBusy(true); setErr('');
    try { await sendCode({ email: emailVal.trim() }); setEmailStep('code'); }
    catch { setErr('Could not send code. Check your email address.'); }
    finally { setBusy(false); }
  };

  const handleVerify = async () => {
    if (!codeVal.trim()) return;
    setBusy(true); setErr('');
    try { await loginWithCode({ code: codeVal.trim() }); }
    catch { setErr('Invalid code — please try again.'); }
    finally { setBusy(false); }
  };

  return (
    <div className="p-3 border-t border-white/10 space-y-3">
      {emailStep === 'idle' && (<>
        {/* Social logins */}
        <div className="space-y-1.5">
          <p className="text-[8px] uppercase tracking-widest text-white/25 font-mono px-1">Social login</p>
          <LoginMethodButton onClick={() => handleOAuth('twitter')} icon={<XIcon className="h-4 w-4 text-white" />} label="Twitter / X" sublabel="Connect your X account" />
          <LoginMethodButton onClick={() => handleOAuth('google')} icon={<GoogleIcon className="h-4 w-4" />} label="Google / Gmail" sublabel="Continue with your Google account" />
          <LoginMethodButton onClick={() => setEmailStep('email')} icon={<Mail className="h-4 w-4 text-white/70" />} label="Email" sublabel="One-time code — no password" />
        </div>

        {/* Crypto wallet logins */}
        <div className="space-y-1.5">
          <p className="text-[8px] uppercase tracking-widest text-white/25 font-mono px-1">Crypto wallet</p>
          <LoginMethodButton onClick={() => connectWallet()} icon={<RainbowIcon className="h-5 w-5" />} label="Rainbow Wallet" sublabel="Mobile-first multichain wallet" />
          <LoginMethodButton onClick={() => connectWallet()} icon={<RabbyIcon className="h-4 w-4" />} label="Rabby Wallet" sublabel="Security-focused EVM wallet" />
          <LoginMethodButton onClick={() => connectWallet()} icon={<WalletConnectIcon className="h-4 w-4" />} label="WalletConnect" sublabel="Any wallet via QR code" />
        </div>

        {/* Recovery hint */}
        <div className="rounded-sm border border-[#F7931A]/12 bg-[#F7931A]/4 px-3 py-2.5 space-y-1.5">
          <div className="flex items-center gap-1.5">
            <KeyRound className="h-3 w-3 text-[#F7931A]/60 shrink-0" />
            <p className="text-[9px] font-bold uppercase tracking-widest text-[#F7931A]/70">Returning? Recover your wallet</p>
          </div>
          <p className="text-[8px] font-mono text-white/30 leading-relaxed">
            Sign in with the same social account — Privy automatically restores your embedded wallet.
          </p>
          <button onClick={() => handleOAuth('google')} className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-sm border border-[#F7931A]/20 hover:border-[#F7931A]/40 bg-[#F7931A]/8 hover:bg-[#F7931A]/15 transition-all">
            <RefreshCw className="h-3 w-3 text-[#F7931A]/70" />
            <span className="text-[9px] font-mono uppercase tracking-widest text-[#F7931A]/70">Restore wallet access</span>
          </button>
        </div>
      </>)}

      {emailStep === 'email' && (
        <div className="space-y-2">
          <button onClick={() => { setEmailStep('idle'); setErr(''); }} className="flex items-center gap-1 text-[9px] text-white/40 hover:text-white/70 font-mono">
            <ArrowLeft className="h-3 w-3" /> Back
          </button>
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">Enter your email</p>
          <input
            value={emailVal} onChange={e => setEmailVal(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="you@example.com" autoFocus
            className="w-full bg-white/5 border border-white/15 rounded-sm px-3 py-2 text-[11px] font-mono text-white placeholder:text-white/20 focus:outline-none focus:border-[#F7931A]/50"
          />
          {err && <p className="text-[9px] text-red-400 font-mono">{err}</p>}
          <button onClick={handleSend} disabled={busy || !emailVal.trim()} className="w-full flex items-center justify-center gap-2 py-2 rounded-sm bg-[#F7931A]/80 hover:bg-[#F7931A] disabled:opacity-40 transition-all text-[10px] font-bold uppercase tracking-widest text-white">
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Send Code →'}
          </button>
        </div>
      )}

      {emailStep === 'code' && (
        <div className="space-y-2">
          <button onClick={() => { setEmailStep('email'); setCodeVal(''); setErr(''); }} className="flex items-center gap-1 text-[9px] text-white/40 hover:text-white/70 font-mono">
            <ArrowLeft className="h-3 w-3" /> Back
          </button>
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">Check your inbox</p>
          <p className="text-[9px] font-mono text-white/35">Code sent to <span className="text-[#F7931A]/70">{emailVal}</span></p>
          <input
            value={codeVal} onChange={e => setCodeVal(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleVerify()}
            placeholder="Enter code" maxLength={8} autoFocus
            className="w-full bg-white/5 border border-white/15 rounded-sm px-3 py-2 text-[13px] font-mono text-white placeholder:text-white/20 focus:outline-none focus:border-[#35D07F]/50 tracking-[0.4em] text-center"
          />
          {err && <p className="text-[9px] text-red-400 font-mono">{err}</p>}
          <button onClick={handleVerify} disabled={busy || !codeVal.trim()} className="w-full flex items-center justify-center gap-2 py-2 rounded-sm bg-[#35D07F]/70 hover:bg-[#35D07F] disabled:opacity-40 transition-all text-[10px] font-bold uppercase tracking-widest text-white">
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Verify & Sign In →'}
          </button>
        </div>
      )}
    </div>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { logout, authenticated } = usePrivy();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [communityOpen, setCommunityOpen] = useState(false);
  const [mobileLoginOpen, setMobileLoginOpen] = useState(false);
  const mobileLoginRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mobileLoginOpen) return;
    const handler = (e: MouseEvent) => {
      if (mobileLoginRef.current && !mobileLoginRef.current.contains(e.target as Node)) setMobileLoginOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [mobileLoginOpen]);

  const { selectedCommunity, setSelectedCommunity, isSocialUser } = useApp();

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  const govItems = [
    { href: "/", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
    { href: "/proposals", label: "Proposals", icon: <Shield className="h-4 w-4" /> },
    { href: "/admin", label: "Create Proposal", icon: <PlusCircle className="h-4 w-4" /> },
  ];

  const financeItems = [
    { href: "/bridge", label: "Bridge & Acquire", icon: <Bitcoin className="h-4 w-4" /> },
    { href: "/swap", label: "Swap", icon: <ArrowRightLeft className="h-4 w-4" /> },
  ];

  const isActive = (href: string) =>
    href === "/" ? location === "/" : location === href || location.startsWith(href + "/");

  function NavItem({ href, label, icon, badge }: { href: string; label: string; icon: React.ReactNode; badge?: string }) {
    return (
      <Link href={href}>
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className={`flex items-center gap-3 px-3 py-2.5 text-sm transition-all cursor-pointer rounded-sm ${
            isActive(href)
              ? "glass-terra text-white border-l-2 border-[#F7931A]"
              : "text-white/50 hover:text-white hover:bg-white/5 border-l-2 border-transparent"
          }`}
        >
          <span className={isActive(href) ? "text-[#F7931A]" : "text-white/40"}>{icon}</span>
          <span className="font-mono text-xs uppercase tracking-wider flex-1">{label}</span>
          {badge && (
            <span className="text-[8px] font-mono px-1.5 py-0.5 rounded-full bg-[#F7931A]/20 text-[#F7931A] font-bold">{badge}</span>
          )}
        </div>
      </Link>
    );
  }

  const SidebarContent = () => (
    <>
      {/* Fixed logo — never scrolls away */}
      <div className="p-5 border-b border-white/10 gradient-terra-gold shrink-0">
        <VeritasLogo className="h-16 w-auto mx-auto object-contain" style={{ filter: "brightness(10) saturate(0.3)" }} />
        <p className="text-[10px] text-white/50 mt-2 text-center font-mono uppercase tracking-widest">
          Sovereign MultiChain DAO
        </p>
      </div>

      {/* Community context pill — shows active community scope */}
      {selectedCommunity && (
        <div className="px-4 py-2.5 border-b border-white/8 bg-white/2 flex items-center gap-2">
          <span className="text-base leading-none">{selectedCommunity.flag}</span>
          <div className="flex-1 min-w-0">
            <div className="text-[9px] font-mono text-white/25 uppercase tracking-widest">Active community</div>
            <div className="text-[11px] font-bold text-white/70 truncate">{selectedCommunity.name}</div>
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
        </div>
      )}

      {/* Scrollable body: nav + auth panel + powered-by */}
      <div className="flex-1 overflow-y-auto flex flex-col min-h-0">
        <nav className="p-4 space-y-1">
          {/* Governance section */}
          <div className="text-[9px] font-semibold text-white/30 mb-2 uppercase tracking-widest px-2">
            Governance
          </div>
          {govItems.map((item) => (
            <NavItem key={item.href} {...item} />
          ))}

          {/* Finance section */}
          <div className="pt-3 mt-2 border-t border-white/8">
            <div className="text-[9px] font-semibold text-white/20 mb-2 uppercase tracking-widest px-2">Finance</div>
            {financeItems.map((item) => (
              <NavItem key={item.href} {...item} />
            ))}
          </div>

          {/* Profile — authenticated users */}
          {authenticated && (
            <div className="pt-3 mt-2 border-t border-white/10">
              <div className="text-[9px] font-semibold text-white/20 mb-2 uppercase tracking-widest px-2">Account</div>
              <NavItem href="/profile" label="My Profile" icon={<User className="h-4 w-4" />} />
            </div>
          )}

          {/* Regen Spaces */}
          <div className="pt-3 mt-2 border-t border-white/10">
            <button
              onClick={() => setCommunityOpen(o => !o)}
              className="w-full flex items-center gap-2 px-2 mb-2 text-left group"
            >
              <Layers className="h-3 w-3 text-white/25 shrink-0" />
              <div className="text-[9px] font-semibold text-white/20 uppercase tracking-widest flex-1 group-hover:text-white/35 transition-colors">Regen Spaces</div>
              {communityOpen
                ? <ChevronDown className="h-3 w-3 text-white/20 shrink-0" />
                : <ChevronRight className="h-3 w-3 text-white/20 shrink-0" />}
            </button>
            {communityOpen && (
              <div className="space-y-0.5">
                {COMMUNITIES.map((c) => (
                  <Link key={c.id} href={`/workspace/${c.id}`}>
                    <div
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2 text-sm transition-all cursor-pointer rounded-sm ${
                        location === `/workspace/${c.id}`
                          ? "glass-terra text-white border-l-2 border-[#F7931A]"
                          : "text-white/40 hover:text-white hover:bg-white/5 border-l-2 border-transparent"
                      }`}
                    >
                      <span className="text-base leading-none shrink-0">{c.flag}</span>
                      <span className="font-mono text-xs flex-1 truncate">{c.name}</span>
                      {c.status === "coming_soon" && (
                        <span className="text-[7px] font-mono text-white/20 shrink-0">soon</span>
                      )}
                      {selectedCommunity?.id === c.id && (
                        <div className="w-1.5 h-1.5 rounded-full bg-[#F7931A] shrink-0" />
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Key Recovery — only for web2 social users */}
          {isSocialUser && (
            <div className="pt-3 mt-2 border-t border-white/10">
              <div className="text-[9px] font-semibold text-white/20 mb-2 uppercase tracking-widest px-2">Security</div>
              <Link href="/recovery">
                <div
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 text-sm transition-all cursor-pointer rounded-sm ${
                    isActive("/recovery")
                      ? "glass-terra text-white border-l-2 border-[#F7931A]"
                      : "text-white/50 hover:text-white hover:bg-white/5 border-l-2 border-transparent"
                  }`}
                >
                  <span className={isActive("/recovery") ? "text-[#F7931A]" : "text-white/40"}>
                    <KeyRound className="h-4 w-4" />
                  </span>
                  <span className="font-mono text-xs uppercase tracking-wider flex-1">Key Recovery</span>
                  <span className="text-[8px] font-mono text-[#F7931A]/40 border border-[#F7931A]/20 px-1 py-0.5 rounded shrink-0">Web2</span>
                </div>
              </Link>
            </div>
          )}

          <div className="pt-3 mt-2 border-t border-white/10">
            <div className="text-[9px] font-semibold text-white/20 mb-2 uppercase tracking-widest px-2">Community</div>
            <a
              href="https://www.veritasvillages.com/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 text-sm transition-all cursor-pointer rounded-sm text-white/50 hover:text-white hover:bg-white/5 border-l-2 border-transparent group"
            >
              <span className="text-white/40 group-hover:text-[#2D5A3A]">
                <Globe className="h-4 w-4" />
              </span>
              <span className="font-mono text-xs uppercase tracking-wider flex-1">Veritas Villages</span>
              <ExternalLink className="h-3 w-3 text-white/20 group-hover:text-white/50 shrink-0" />
            </a>
          </div>
        </nav>

        <div className="mt-auto">
          {authenticated ? <UserPanel onLogout={logout} /> : <SignInPanel />}
          <PoweredBy />
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex w-full selection:bg-primary selection:text-primary-foreground relative">

      {/* ── Fixed background: village image + layered dark overlays ── */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `url(${BASE}/veritas-bg.jpg)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      />
      {/* Dark gradient overlay — preserves image warmth, ensures UI contrast */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(135deg, rgba(5,14,10,0.88) 0%, rgba(8,20,14,0.80) 40%, rgba(10,16,8,0.85) 100%)",
        }}
      />

      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:flex flex-col w-60 border-r border-white/8 shrink-0 h-screen sticky top-0 z-10 sidebar-glass">
        <SidebarContent />
      </aside>

      {/* ── Mobile layout ── */}
      <div className="md:hidden flex flex-col w-full min-h-screen relative z-10">
        <header className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0 sidebar-glass">
          <VeritasLogo className="h-10 w-auto object-contain" />
          <div className="flex items-center gap-2">
            {!authenticated && (
              <div className="relative" ref={mobileLoginRef}>
                <Button
                  size="sm"
                  className="text-[10px] h-8 px-3 uppercase tracking-widest font-bold"
                  style={{ background: "linear-gradient(135deg, #2D5A3A, #F7931A)" }}
                  onClick={() => setMobileLoginOpen(o => !o)}
                >
                  Log In
                  <ChevronDown className={`ml-1 h-3 w-3 transition-transform ${mobileLoginOpen ? "rotate-180" : ""}`} />
                </Button>
                {mobileLoginOpen && <LoginDropdown onClose={() => setMobileLoginOpen(false)} />}
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="text-white/60"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </header>

        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
            <aside className="relative flex flex-col w-72 border-r border-white/10 z-10 overflow-y-auto sidebar-glass">
              <SidebarContent />
            </aside>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-4">
          <div className="max-w-4xl mx-auto space-y-6">{children}</div>
        </main>
      </div>

      {/* ── Desktop main panel ── */}
      <div className="hidden md:flex flex-col flex-1 min-h-0 relative z-10">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="max-w-5xl mx-auto space-y-8">{children}</div>
        </main>
      </div>
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { usePrivy } from "@privy-io/react-auth";
import {
  LayoutDashboard, Shield, Wallet, Menu, PlusCircle, Globe, X,
  ExternalLink, ArrowRightLeft, Mail, LogOut, ChevronDown, ChevronUp, Copy, CheckCircle2,
  Bitcoin, CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";

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

// ─── TopBar Login Dropdown ───────────────────────────────────────────────────────
function LoginDropdown({ onClose }: { onClose: () => void }) {
  const { login } = usePrivy();

  const handle = () => { login(); onClose(); };

  return (
    <div className="absolute right-0 top-full mt-2 w-72 z-50 glass border border-white/12 rounded-sm shadow-2xl overflow-hidden">
      <div className="p-3 space-y-1">
        <LoginMethodButton onClick={handle} icon={<XIcon className="h-4 w-4 text-white" />} label="Twitter / X" sublabel="Connect your X account" />
        <LoginMethodButton onClick={handle} icon={<Mail className="h-4 w-4 text-white/70" />} label="Email" sublabel="Magic link — no password" />
      </div>
    </div>
  );
}

function UserDropdown({ onClose, onLogout }: { onClose: () => void; onLogout: () => void }) {
  const { user } = usePrivy();
  const [copied, setCopied] = useState(false);
  const address = user?.wallet?.address ?? "";
  const twitterUsername = (user as any)?.twitter?.username as string | undefined;
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
  const { authenticated, login, logout, user } = usePrivy();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
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

  return (
    <div className="hidden md:flex items-center justify-end px-6 py-3 border-b border-white/8 bg-card/80 backdrop-blur-sm shrink-0">
      <div className="relative" ref={ref}>
        {authenticated ? (
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
        ) : (
          <button
            onClick={() => login()}
            className="flex items-center gap-2 px-4 py-2 rounded-sm font-bold text-[11px] uppercase tracking-widest text-white transition-opacity hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #2D5A3A, #F7931A)" }}
          >
            <Wallet className="h-3.5 w-3.5" />
            Log In
          </button>
        )}

        {open && authenticated && (
          <UserDropdown onClose={() => setOpen(false)} onLogout={logout} />
        )}
      </div>
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
            <img src={`${BASE}/celo-logo.png`} alt="Celo" className="h-3 w-auto object-contain opacity-40 group-hover:opacity-70 transition-opacity" style={{ maxWidth: "40px", filter: "brightness(0) invert(1)" }} />
            <span className="text-[10px] font-mono text-white/30 group-hover:text-white/60 transition-colors uppercase tracking-wider">Celo</span>
            <span className="ml-auto text-[8px] font-mono text-green-500/40 group-hover:text-green-400/70">CELO</span>
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
  const displayName = twitterUsername ? `@${twitterUsername}` : email ?? "";
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
          {email && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-sm bg-white/5">
              <Mail className="h-3 w-3 text-white/50 shrink-0" />
              <span className="font-mono text-[10px] text-white/60 truncate">{email}</span>
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

function SignInPanel({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="p-3 border-t border-white/10">
      <p className="text-[9px] uppercase tracking-widest text-white/30 mb-2.5 font-mono px-1">Sign in to vote</p>
      <div className="space-y-1.5">
        <LoginMethodButton
          onClick={onLogin}
          icon={<XIcon className="h-4 w-4 text-white" />}
          label="Twitter / X"
          sublabel="Connect your X account"
        />
        <LoginMethodButton
          onClick={onLogin}
          icon={<Mail className="h-4 w-4 text-white/70" />}
          label="Email"
          sublabel="Magic link — no password"
        />
      </div>
    </div>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { login, logout, authenticated } = usePrivy();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  const navItems = [
    { href: "/", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
    { href: "/proposals", label: "Proposals", icon: <Shield className="h-4 w-4" /> },
    { href: "/admin", label: "Create Proposal", icon: <PlusCircle className="h-4 w-4" /> },
    { href: "/swap", label: "Swap", icon: <ArrowRightLeft className="h-4 w-4" /> },
    { href: "/bridge", label: "Bridge", icon: <Bitcoin className="h-4 w-4" /> },
    { href: "/pay", label: "Pay", icon: <CreditCard className="h-4 w-4" /> },
  ];

  const isActive = (href: string) =>
    href === "/" ? location === "/" : location === href || location.startsWith(href + "/");

  const SidebarContent = () => (
    <>
      {/* Fixed logo — never scrolls away */}
      <div className="p-5 border-b border-white/10 gradient-terra-gold shrink-0">
        <VeritasLogo className="h-16 w-auto mx-auto object-contain" style={{ filter: "brightness(10) saturate(0.3)" }} />
        <p className="text-[10px] text-white/50 mt-2 text-center font-mono uppercase tracking-widest">
          Sovereign MultiChain DAO
        </p>
      </div>

      {/* Scrollable body: nav + auth panel + powered-by */}
      <div className="flex-1 overflow-y-auto flex flex-col min-h-0">
        <nav className="p-4 space-y-1">
          <div className="text-[9px] font-semibold text-white/30 mb-4 uppercase tracking-widest px-2">
            Navigation
          </div>
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <div
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm transition-all cursor-pointer rounded-sm ${
                  isActive(item.href)
                    ? "glass-terra text-white border-l-2 border-[#F7931A]"
                    : "text-white/50 hover:text-white hover:bg-white/5 border-l-2 border-transparent"
                }`}
              >
                <span className={isActive(item.href) ? "text-[#F7931A]" : "text-white/40"}>
                  {item.icon}
                </span>
                <span className="font-mono text-xs uppercase tracking-wider">{item.label}</span>
              </div>
            </Link>
          ))}

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
          {authenticated && <UserPanel onLogout={logout} />}
          <PoweredBy />
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex w-full bg-background selection:bg-primary selection:text-primary-foreground">
      <aside className="hidden md:flex flex-col w-60 border-r border-white/10 bg-card shrink-0 h-screen sticky top-0">
        <SidebarContent />
      </aside>

      <div className="md:hidden flex flex-col w-full min-h-screen">
        <header className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-card shrink-0">
          <VeritasLogo className="h-10 w-auto object-contain" />
          <div className="flex items-center gap-2">
            {!authenticated && (
              <Button
                size="sm"
                className="text-[10px] h-8 px-3 uppercase tracking-widest font-bold"
                style={{ background: "linear-gradient(135deg, #2D5A3A, #F7931A)" }}
                onClick={() => login()}
              >
                Log In
              </Button>
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
            <aside className="relative flex flex-col w-72 bg-card border-r border-white/10 z-10 overflow-y-auto">
              <SidebarContent />
            </aside>
          </div>
        )}

        <main className="flex-1 overflow-y-auto bg-background p-4">
          <div className="max-w-4xl mx-auto space-y-6">{children}</div>
        </main>
      </div>

      <div className="hidden md:flex flex-col flex-1 min-h-0">
        <TopBar />
        <main className="flex-1 overflow-y-auto bg-background p-6 lg:p-10">
          <div className="max-w-5xl mx-auto space-y-8">{children}</div>
        </main>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { usePrivy } from "@privy-io/react-auth";
import { LayoutDashboard, Shield, Wallet, Menu, PlusCircle, Globe, X, ExternalLink } from "lucide-react";
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

function PoweredBy() {
  return (
    <div className="px-4 py-4 border-t border-white/10 space-y-4">
      <div>
        <p className="text-[9px] uppercase tracking-widest text-white/30 mb-3 font-mono">Powered by</p>
        <div className="flex items-center gap-4">
          <a href="https://vocdoni.io" target="_blank" rel="noreferrer" title="Vocdoni" className="opacity-40 hover:opacity-80 transition-opacity">
            <img src={`${BASE}/vocdoni-logo.png`} alt="Vocdoni" className="h-6 w-6 object-contain" style={{ filter: "invert(1)" }} />
          </a>
          <a href="https://rootstock.io" target="_blank" rel="noreferrer" title="Rootstock" className="opacity-40 hover:opacity-80 transition-opacity">
            <img src={`${BASE}/rootstock-logo.png`} alt="Rootstock" className="h-6 w-6 object-contain" style={{ filter: "invert(1)" }} />
          </a>
          <a href="https://celo.org" target="_blank" rel="noreferrer" title="Celo" className="opacity-40 hover:opacity-80 transition-opacity">
            <img src={`${BASE}/celo-logo.png`} alt="Celo" className="h-4 w-14 object-contain" style={{ filter: "invert(1)" }} />
          </a>
        </div>
      </div>

      <div className="border-t border-white/5 pt-3">
        <p className="text-[9px] uppercase tracking-widest text-white/20 mb-2 font-mono">Built at</p>
        <img
          src={`${BASE}/ipe-city-logo.png`}
          alt="Ipê City"
          className="h-5 w-auto object-contain opacity-30 hover:opacity-60 transition-opacity"
        />
      </div>
    </div>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { login, logout, authenticated, user } = usePrivy();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const walletAddress = user?.wallet?.address;
  const shortAddress = walletAddress
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : "";

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  const navItems = [
    { href: "/", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
    { href: "/proposals", label: "Proposals", icon: <Shield className="h-4 w-4" /> },
    { href: "/admin", label: "Create Proposal", icon: <PlusCircle className="h-4 w-4" /> },
  ];

  const isActive = (href: string) =>
    href === "/"
      ? location === "/"
      : location === href || location.startsWith(href + "/");

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="p-5 border-b border-white/10 gradient-terra-gold">
        <VeritasLogo className="h-16 w-auto mx-auto object-contain" style={{ filter: "brightness(10) saturate(0.3)" }} />
        <p className="text-[10px] text-white/50 mt-2 text-center font-mono uppercase tracking-widest">
          Sovereign MultiChain DAO
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
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

      {/* Wallet */}
      <div className="p-4 border-t border-white/10">
        {authenticated ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-2 glass rounded-sm">
              <Wallet className="h-3.5 w-3.5 text-[#F7931A] shrink-0" />
              <span className="text-[11px] font-mono text-white/80 truncate">{shortAddress}</span>
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-[10px] h-8 uppercase tracking-widest border-white/15 text-white/60 hover:text-white hover:border-white/30"
              onClick={() => logout()}
            >
              Disconnect
            </Button>
          </div>
        ) : (
          <Button
            size="sm"
            className="w-full text-[10px] h-9 uppercase tracking-widest font-bold"
            style={{ background: "linear-gradient(135deg, #2D5A3A, #F7931A)" }}
            onClick={() => login()}
          >
            Connect Wallet
          </Button>
        )}
      </div>

      {/* Powered By */}
      <PoweredBy />
    </>
  );

  return (
    <div className="min-h-screen flex w-full bg-background selection:bg-primary selection:text-primary-foreground">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-60 border-r border-white/10 bg-card shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden flex flex-col w-full min-h-screen">
        <header className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-card shrink-0">
          <VeritasLogo className="h-10 w-auto object-contain" />
          <Button
            variant="ghost"
            size="icon"
            className="text-white/60"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </header>

        {/* Mobile Drawer */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex">
            <div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <aside className="relative flex flex-col w-72 bg-card border-r border-white/10 z-10 overflow-y-auto">
              <SidebarContent />
            </aside>
          </div>
        )}

        <main className="flex-1 overflow-y-auto bg-background p-4">
          <div className="max-w-4xl mx-auto space-y-6">{children}</div>
        </main>
      </div>

      {/* Desktop Main */}
      <main className="hidden md:block flex-1 overflow-y-auto bg-background p-6 lg:p-10">
        <div className="max-w-5xl mx-auto space-y-8">{children}</div>
      </main>
    </div>
  );
}

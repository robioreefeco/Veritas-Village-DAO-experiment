import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { usePrivy } from "@privy-io/react-auth";
import { Activity, LayoutDashboard, Shield, Wallet, Zap, Menu, PlusCircle, ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { login, logout, authenticated, user } = usePrivy();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const walletAddress = user?.wallet?.address;
  const shortAddress = walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : "";

  // Always force dark mode on document element
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  const navItems = [
    { href: "/", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
    { href: "/proposals", label: "Proposals", icon: <Shield className="h-4 w-4" /> },
    { href: "/admin", label: "Create Proposal", icon: <PlusCircle className="h-4 w-4" /> },
    { href: "/bridge", label: "Bridge", icon: <ArrowRightLeft className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen flex w-full bg-background selection:bg-primary selection:text-primary-foreground">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-2 font-bold text-lg text-primary tracking-tighter">
            <Zap className="h-5 w-5 text-orange-500" />
            <span>VERITAS DAO</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Sovereign multichain governance</p>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <div className="text-xs font-semibold text-muted-foreground mb-4 uppercase tracking-widest">Menu</div>
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <div
                className={`flex items-center gap-3 px-3 py-2 text-sm transition-colors cursor-pointer group ${
                  location === item.href || (item.href !== "/" && location.startsWith(item.href))
                    ? "bg-accent text-accent-foreground border-l-2 border-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground border-l-2 border-transparent"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </div>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          {authenticated ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-sm">
                <Wallet className="h-4 w-4 text-green-500" />
                <span className="text-xs font-medium font-mono">{shortAddress}</span>
              </div>
              <Button variant="outline" size="sm" className="w-full text-xs h-8 uppercase tracking-widest" onClick={() => logout()}>
                Disconnect
              </Button>
            </div>
          ) : (
            <Button variant="default" size="sm" className="w-full text-xs h-8 uppercase tracking-widest bg-primary text-primary-foreground" onClick={() => login()}>
              Connect Wallet
            </Button>
          )}
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden flex flex-col w-full h-screen overflow-hidden">
        <header className="flex items-center justify-between p-4 border-b border-border bg-card">
          <div className="flex items-center gap-2 font-bold text-lg">
            <Zap className="h-5 w-5 text-orange-500" />
            <span>VERITAS DAO</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <Menu className="h-5 w-5" />
          </Button>
        </header>

        {isMobileMenuOpen && (
          <nav className="p-4 border-b border-border bg-card space-y-2 shrink-0 z-50">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <div
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-3 text-sm transition-colors cursor-pointer ${
                    location === item.href
                      ? "bg-accent text-accent-foreground border-l-2 border-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground border-l-2 border-transparent"
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </div>
              </Link>
            ))}
            <div className="pt-2 mt-2 border-t border-border">
              {authenticated ? (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono">{shortAddress}</span>
                  <Button variant="outline" size="sm" className="text-xs" onClick={() => logout()}>Disconnect</Button>
                </div>
              ) : (
                <Button variant="default" className="w-full text-xs" onClick={() => login()}>Connect Wallet</Button>
              )}
            </div>
          </nav>
        )}

        <main className="flex-1 overflow-y-auto bg-background p-4 sm:p-6 lg:p-8">
          <div className="max-w-5xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>

      {/* Desktop Main Content */}
      <main className="hidden md:block flex-1 overflow-y-auto bg-background p-6 lg:p-10">
        <div className="max-w-5xl mx-auto space-y-8">
          {children}
        </div>
      </main>
    </div>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetDashboardStats, useGetChainActivity, useListProposals } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Activity, CheckCircle2, ChevronRight, Layers, Users,
  MapPin, ExternalLink, Bitcoin, Vote, ShieldCheck, Zap
} from "lucide-react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";

// ─── Real Veritas Villages community data ────────────────────────────────────
const COMMUNITIES = [
  {
    name: "Playa Pacifica",
    country: "Nicaragua",
    flag: "🇳🇮",
    status: "active" as const,
    description: "Spanish-style beach neighborhood inside Gran Pacifica Beach & Golf Resort. Year-round surf, golf, horseback riding — the closest gated beachfront community to the international airport.",
    url: "https://www.veritasvillages.com/playa-pacifica",
    color: "#2D5A3A",
  },
  {
    name: "Coronado",
    country: "Panama",
    flag: "🇵🇦",
    status: "active" as const,
    description: "Nestled in the hills near Coronado, designed for food security, natural water access, and luxury off-grid living — minutes from beaches, restaurants, and services.",
    url: "https://www.veritasvillages.com/coronado",
    color: "#F7931A",
  },
  {
    name: "Chiriquí",
    country: "Panama",
    flag: "🇵🇦",
    status: "active" as const,
    description: "A smaller, more intimate community near Boquete and the Costa Rica border. Perfect for peace, self-sufficiency, and a close-knit neighborhood feel.",
    url: "https://www.veritasvillages.com/chiriqui",
    color: "#2D5A3A",
  },
  {
    name: "Atenas",
    country: "Costa Rica",
    flag: "🇨🇷",
    status: "coming_soon" as const,
    description: "Our newest location in Costa Rica's Central Valley. Currently in early planning — details on site plans, pricing, and availability will be announced as the project progresses.",
    url: "https://www.veritasvillages.com/costa-rica-coming-soon",
    color: "#64B5F6",
  },
];

// F.I.R.S.T. principles from the website
const FIRST_PRINCIPLES = [
  { letter: "F", word: "Freedom", desc: "Live among like-minded neighbors who value freedom and privacy." },
  { letter: "I", word: "Independence", desc: "Grow food, generate power, and rely less on outside systems." },
  { letter: "R", word: "Resiliency", desc: "Communities built to withstand uncertainty and adapt." },
  { letter: "S", word: "Self-Sustainability", desc: "Natural water, off-grid solar, and on-site food production." },
  { letter: "T", word: "Transparency", desc: "No HOA boards or hidden rules — every resident votes through the DAO." },
];

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: activity, isLoading: activityLoading } = useGetChainActivity();
  const { data: proposals, isLoading: proposalsLoading } = useListProposals({ chain: "all" });

  const activeProposals = proposals?.filter((p) => p.status === "active")?.slice(0, 4) || [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Hero Banner — real tagline from veritasvillages.com */}
      <div className="relative overflow-hidden rounded-sm glass-terra p-6 border border-[#2D5A3A]/50">
        <div className="absolute inset-0 opacity-10"
          style={{ background: "radial-gradient(ellipse at 70% 50%, #F7931A 0%, transparent 60%)" }} />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="h-4 w-4 text-[#F7931A]" />
            <span className="text-[10px] uppercase tracking-widest font-mono text-[#F7931A]">
              Veritas Villages — Sovereign Multichain DAO
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Live free and sustainably{" "}
            <span className="gradient-gold-text">in Latin America.</span>
          </h1>
          <p className="text-white/50 mt-1 font-mono text-xs max-w-xl">
            Intentional off-grid communities across Nicaragua, Panama and Costa Rica — governed on-chain by residents via Bitcoin-secured voting. No HOA boards. No hidden rules. Every resident has a vote.
          </p>
          {/* Real metrics */}
          <div className="flex flex-wrap gap-3 mt-4">
            <div className="flex items-center gap-2 glass px-3 py-1.5 rounded-sm">
              <MapPin className="h-3.5 w-3.5 text-green-400" />
              <span className="text-xs font-mono text-white/70">4 communities</span>
            </div>
            <div className="flex items-center gap-2 glass px-3 py-1.5 rounded-sm">
              <span className="text-sm">🌎</span>
              <span className="text-xs font-mono text-white/70">3 countries</span>
            </div>
            <div className="flex items-center gap-2 glass px-3 py-1.5 rounded-sm">
              <Bitcoin className="h-3.5 w-3.5 text-[#F7931A]" />
              <span className="text-xs font-mono text-white/70">BTC accepted</span>
            </div>
            <a
              href="https://www.veritasvillages.com"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 glass px-3 py-1.5 rounded-sm hover:bg-white/10 transition-colors group"
            >
              <ExternalLink className="h-3 w-3 text-white/30 group-hover:text-[#F7931A]" />
              <span className="text-xs font-mono text-white/50 group-hover:text-white/80">veritasvillages.com</span>
            </a>
          </div>
        </div>
      </div>

      {/* DAO Stats Grid — live data */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Total Proposals" value={stats?.totalProposals}
          icon={<Layers className="h-4 w-4 text-white/40" />} loading={statsLoading} />
        <StatCard title="Active Proposals" value={stats?.activeProposals}
          icon={<CheckCircle2 className="h-4 w-4 text-[#F7931A]" />} loading={statsLoading} highlight />
        <StatCard title="Total Votes" value={stats?.totalVotes}
          icon={<Activity className="h-4 w-4 text-green-400" />} loading={statsLoading}
          subtitle={stats ? `Celo: ${stats.celoVotes}  ·  RSK: ${stats.rskVotes}` : undefined} />
        <StatCard title="Unique Voters" value={stats?.uniqueVoters}
          icon={<Users className="h-4 w-4 text-blue-400" />} loading={statsLoading} />
      </div>

      {/* Real Village Communities */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-widest text-white/80">Our Communities</h2>
          <a href="https://www.veritasvillages.com" target="_blank" rel="noreferrer"
            className="text-[10px] font-mono text-[#F7931A] hover:underline flex items-center gap-1">
            veritasvillages.com <ExternalLink className="h-3 w-3" />
          </a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {COMMUNITIES.map((c) => (
            <a key={c.name} href={c.url} target="_blank" rel="noreferrer"
              className="glass rounded-sm p-4 flex flex-col gap-3 hover:bg-white/5 transition-colors group border border-white/5 hover:border-white/10">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-lg">{c.flag}</span>
                </div>
                <Badge
                  className={`rounded-sm text-[8px] uppercase tracking-widest font-mono px-1.5 py-0.5 border-0 ${
                    c.status === "active"
                      ? "bg-green-400/15 text-green-400"
                      : "bg-blue-400/15 text-blue-400"
                  }`}>
                  {c.status === "active" ? "Active" : "Coming Soon"}
                </Badge>
              </div>
              <div>
                <div className="font-bold text-white text-sm">{c.name}</div>
                <div className="flex items-center gap-1 mt-0.5">
                  <MapPin className="h-3 w-3 text-white/25" />
                  <span className="text-[10px] font-mono text-white/30">{c.country}</span>
                </div>
              </div>
              <p className="text-[10px] font-mono text-white/40 leading-relaxed flex-1">{c.description}</p>
              <div className="flex items-center gap-1 text-[9px] font-mono text-white/20 group-hover:text-[#F7931A]/60 transition-colors">
                Learn more <ExternalLink className="h-2.5 w-2.5" />
              </div>
            </a>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Proposals — live data */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-widest text-white/80">Active Proposals</h2>
            <Link href="/proposals" className="text-[10px] font-mono text-[#F7931A] hover:underline flex items-center gap-1">
              View All <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {proposalsLoading
              ? Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)
              : activeProposals.length > 0
              ? activeProposals.map((proposal) => {
                  const total = proposal.yesVotes + proposal.noVotes + proposal.abstainVotes;
                  const pct = total > 0 ? Math.round((proposal.yesVotes / total) * 100) : 0;
                  const isCelo = proposal.chain === "celo";
                  return (
                    <div key={proposal.id}
                      className="glass group hover:glass-terra transition-all duration-200 p-4 rounded-sm">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2 flex-1 min-w-0">
                          <h3 className="font-bold text-sm text-white leading-tight">{proposal.title}</h3>
                          <div className="flex gap-2 items-center text-[10px] font-mono flex-wrap">
                            <Badge variant="outline"
                              className={`rounded-sm uppercase tracking-widest text-[9px] px-2 py-0.5 ${
                                isCelo
                                  ? "text-green-400 border-green-400/40 bg-green-400/10"
                                  : "text-[#F7931A] border-[#F7931A]/40 bg-[#F7931A]/10"
                              }`}>
                              {proposal.chain === "celo" ? "Celo" : "RSK"}
                            </Badge>
                            <span className="text-white/30">·</span>
                            <span className="text-white/40">{proposal.census === "rbtc" ? "rBTC census" : "cUSD census"}</span>
                            {proposal.endsAt && (
                              <>
                                <span className="text-white/30">·</span>
                                <span className="text-white/40">
                                  Ends {new Date(proposal.endsAt).toLocaleDateString()}
                                </span>
                              </>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                              <div className="h-full rounded-full transition-all duration-500"
                                style={{ width: `${pct}%`, background: "linear-gradient(90deg, #2D5A3A, #F7931A)" }} />
                            </div>
                            <span className="text-[10px] font-mono text-white/50 shrink-0">{pct}% Yes</span>
                          </div>
                        </div>
                        <Link href={`/proposals/${proposal.id}`}>
                          <div className="shrink-0 px-3 py-2 text-[10px] font-bold uppercase tracking-widest cursor-pointer transition-all glass-gold hover:bg-[#F7931A] hover:text-black rounded-sm text-[#F7931A]">
                            Vote
                          </div>
                        </Link>
                      </div>
                    </div>
                  );
                })
              : (
                <div className="glass p-8 text-center text-white/30 text-sm font-mono rounded-sm">
                  No active proposals at this time.
                </div>
              )}
          </div>

          {/* F.I.R.S.T. Principles — real content from veritasvillages.com */}
          <div className="pt-2">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="h-4 w-4 text-[#F7931A]" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-white/80">The F.I.R.S.T. Principles</h2>
            </div>
            <div className="glass rounded-sm divide-y divide-white/5 border border-white/5">
              {FIRST_PRINCIPLES.map((p) => (
                <div key={p.letter} className="flex items-start gap-3 px-4 py-3">
                  <span className="font-black text-lg w-6 shrink-0 leading-none" style={{ color: "#F7931A" }}>{p.letter}</span>
                  <div>
                    <span className="font-bold text-xs uppercase tracking-widest text-white">{p.word}</span>
                    <p className="text-[10px] font-mono text-white/40 mt-0.5 leading-relaxed">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Activity Feed + Chain Status */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-white/30" />
            <h2 className="text-sm font-bold uppercase tracking-widest text-white/80">Activity Feed</h2>
          </div>

          <div className="glass rounded-sm overflow-hidden divide-y divide-white/5">
            {activityLoading
              ? Array(5).fill(0).map((_, i) => (
                  <div key={i} className="p-4"><Skeleton className="h-8 w-full" /></div>
                ))
              : activity && activity.length > 0
              ? activity.slice(0, 6).map((act, i) => (
                  <div key={i} className="p-3 flex gap-3 text-sm group hover:bg-white/5 transition-colors">
                    <div className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${
                      act.chain === "celo" ? "bg-green-400" : "bg-[#F7931A]"
                    }`} />
                    <div className="space-y-0.5 min-w-0">
                      <p className="font-mono text-[11px] truncate">
                        <span className="text-white/40">{act.address.slice(0, 6)}...{act.address.slice(-4)}</span>{" "}
                        <span className="text-white font-bold">{act.action}</span>
                      </p>
                      <p className="text-[10px] text-white/30 truncate">{act.proposalTitle}</p>
                      <p className="text-[9px] text-white/20 font-mono uppercase">
                        {new Date(act.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              : (
                <div className="p-8 text-center text-white/30 text-sm font-mono">
                  No recent activity.
                </div>
              )}
          </div>

          {/* Chain Status */}
          <div className="space-y-2">
            <p className="text-[9px] uppercase tracking-widest text-white/25 font-mono">Chain Status</p>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between glass px-3 py-2 rounded-sm">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  <span className="text-[11px] font-mono text-white/60">Celo Sepolia</span>
                </div>
                <span className="text-[9px] text-green-400/80 font-mono uppercase tracking-wider">Live</span>
              </div>
              <div className="flex items-center justify-between glass px-3 py-2 rounded-sm">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F7931A]" />
                  <span className="text-[11px] font-mono text-white/60">RSK Testnet</span>
                </div>
                <span className="text-[9px] text-[#F7931A]/80 font-mono uppercase tracking-wider">Live</span>
              </div>
            </div>
          </div>

          {/* DAO note — from website: "every resident has a vote through our DAO" */}
          <div className="glass rounded-sm px-4 py-3 border border-[#F7931A]/15">
            <div className="flex items-start gap-2">
              <Vote className="h-3.5 w-3.5 text-[#F7931A] shrink-0 mt-0.5" />
              <p className="text-[10px] font-mono text-white/40 leading-relaxed">
                "No HOA boards or hidden rules — every resident has a vote through our{" "}
                <span className="text-[#F7931A]">Decentralized Autonomous Organization.</span>"
              </p>
            </div>
            <div className="mt-2 text-[9px] font-mono text-white/20">— veritasvillages.com</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title, value, icon, loading, subtitle, highlight,
}: {
  title: string; value?: number; icon: React.ReactNode;
  loading: boolean; subtitle?: string; highlight?: boolean;
}) {
  return (
    <Card className={`rounded-sm border-0 ${highlight ? "glass-gold" : "glass"}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
        <CardTitle className="text-[10px] font-mono font-medium text-white/40 uppercase tracking-wider">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent className="px-4 pb-4">
        {loading ? (
          <Skeleton className="h-8 w-16 bg-white/10" />
        ) : (
          <>
            <div className={`text-2xl font-bold ${highlight ? "gradient-gold-text" : "text-white"}`}>
              {value?.toLocaleString() ?? 0}
            </div>
            {subtitle && <p className="text-[10px] text-white/30 font-mono mt-1">{subtitle}</p>}
          </>
        )}
      </CardContent>
    </Card>
  );
}

import { useParams, Link } from "wouter";
import { usePrivy } from "@privy-io/react-auth";
import { useApp, COMMUNITIES } from "@/context/AppContext";
import { useListProposals } from "@workspace/api-client-react";
import {
  Activity, ArrowRight, ExternalLink, MapPin, Plus,
  ShieldCheck, Users, Vote, Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const CHAIN_BADGE: Record<string, { label: string; color: string }> = {
  celo: { label: "Celo", color: "#35D07F" },
  rsk: { label: "RSK", color: "#F7931A" },
  all: { label: "All", color: "#64B5F6" },
};

// Per-community resource links
const COMMUNITY_RESOURCES: Record<string, Array<{ label: string; url: string }>> = {
  "playa-pacifica": [
    { label: "Playa Pacifica page", url: "https://www.veritasvillages.com/playa-pacifica" },
    { label: "Gran Pacifica Resort", url: "https://granpacifica.com" },
  ],
  coronado: [
    { label: "Coronado community page", url: "https://www.veritasvillages.com/coronado" },
  ],
  chiriqui: [
    { label: "Chiriquí community page", url: "https://www.veritasvillages.com/chiriqui" },
  ],
  atenas: [
    { label: "Costa Rica community page", url: "https://www.veritasvillages.com/costa-rica-coming-soon" },
  ],
};

// F.I.R.S.T. principles
const FIRST_PRINCIPLES = [
  { letter: "F", word: "Freedom", desc: "Live among like-minded neighbors who value freedom and privacy." },
  { letter: "I", word: "Independence", desc: "Grow food, generate power, and rely less on outside systems." },
  { letter: "R", word: "Resiliency", desc: "Communities built to withstand uncertainty and adapt." },
  { letter: "S", word: "Self-Sustainability", desc: "Natural water, off-grid solar, and on-site food production." },
  { letter: "T", word: "Transparency", desc: "No HOA boards or hidden rules — every resident votes through the DAO." },
];

export default function Workspace() {
  const { id } = useParams<{ id: string }>();
  const { authenticated } = usePrivy();
  const { setSelectedCommunity } = useApp();

  const community = COMMUNITIES.find(c => c.id === id);
  const { data: allProposals, isLoading } = useListProposals({ chain: "all" });

  if (!community) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
        <p className="text-white/40 font-mono text-sm">Community not found.</p>
        <Link href="/">
          <span className="text-[#F7931A]/70 hover:text-[#F7931A] font-mono text-xs uppercase tracking-widest transition-colors cursor-pointer">← Back to Dashboard</span>
        </Link>
      </div>
    );
  }

  // Use all proposals as community-level proposals (Vocdoni will scope per process in production)
  const communityProposals = allProposals?.slice(0, 6) ?? [];
  const activeProposals = communityProposals.filter(p => p.status === "active");

  const handleJoin = () => setSelectedCommunity(community);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* ── Community hero ── */}
      <div
        className="relative overflow-hidden rounded-sm p-6 border"
        style={{ borderColor: `${community.color}30`, background: `linear-gradient(135deg, ${community.color}18, rgba(247,147,26,0.06))` }}
      >
        <div className="absolute inset-0 opacity-5"
          style={{ background: `radial-gradient(ellipse at 80% 20%, ${community.color} 0%, transparent 60%)` }} />
        <div className="relative z-10 flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-3xl">{community.flag}</span>
              <span
                className={`text-[8px] font-mono uppercase tracking-widest px-2 py-0.5 rounded border ${
                  community.status === "active"
                    ? "text-green-400/70 border-green-400/25"
                    : "text-white/30 border-white/15"
                }`}
              >
                {community.status === "active" ? "Active" : "Coming Soon"}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white">{community.name}</h1>
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3 w-3 text-white/30" />
              <span className="text-[10px] font-mono text-white/40">{community.country}</span>
            </div>
            <p className="text-[11px] font-mono text-white/40 leading-relaxed max-w-lg">
              {community.description}
            </p>
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            <button
              onClick={handleJoin}
              className="flex items-center gap-1.5 px-3 py-2 rounded-sm font-mono text-[10px] uppercase tracking-widest transition-all"
              style={{ background: `${community.color}20`, border: `1px solid ${community.color}40` }}
            >
              <ShieldCheck className="h-3.5 w-3.5" style={{ color: community.color }} />
              <span style={{ color: community.color }}>Set as my community</span>
            </button>
            <a
              href={community.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-sm border border-white/10 bg-white/4 hover:bg-white/8 transition-colors font-mono text-[10px] uppercase tracking-widest text-white/40 hover:text-white/70"
            >
              <ExternalLink className="h-3 w-3" />
              Official site
            </a>
          </div>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: <Vote className="h-4 w-4 text-[#F7931A]" />, value: activeProposals.length, label: "Active Votes" },
          { icon: <Activity className="h-4 w-4 text-[#2D5A3A]" />, value: communityProposals.length, label: "Total Proposals" },
          { icon: <Zap className="h-4 w-4 text-[#F7931A]" />, value: "Celo + RSK", label: "Chains" },
          { icon: <Users className="h-4 w-4 text-white/40" />, value: "—", label: "Members" },
        ].map((stat) => (
          <div key={stat.label} className="p-4 rounded-sm border border-white/8 bg-white/3 space-y-2">
            {stat.icon}
            <p className="font-mono text-xl font-bold text-white">{stat.value}</p>
            <p className="text-[8px] uppercase tracking-widest font-mono text-white/30">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* ── Active proposals ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-[9px] uppercase tracking-widest text-white/25 font-mono">Active proposals</p>
          {authenticated && (
            <Link href="/admin">
              <div className="flex items-center gap-1 text-[9px] font-mono uppercase tracking-widest text-[#F7931A]/50 hover:text-[#F7931A] transition-colors cursor-pointer">
                <Plus className="h-3 w-3" /> New proposal
              </div>
            </Link>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 rounded-sm bg-white/4 animate-pulse" />
            ))}
          </div>
        ) : communityProposals.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-white/10 rounded-sm">
            <Vote className="h-8 w-8 text-white/15 mx-auto mb-2" />
            <p className="text-[11px] font-mono text-white/25">No proposals yet for this community.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {communityProposals.map((p) => {
              const chain = (p as any).chain ?? "all";
              const badge = CHAIN_BADGE[chain] ?? CHAIN_BADGE["all"];
              return (
                <Link key={p.id} href={`/proposals/${p.id}`}>
                  <div className="flex items-center gap-4 px-4 py-4 rounded-sm border border-white/8 bg-white/3 hover:border-white/20 hover:bg-white/5 transition-all cursor-pointer group">
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="text-[12px] font-bold text-white/80 group-hover:text-white truncate">{p.title}</p>
                      <div className="flex items-center gap-2">
                        <span
                          className="text-[8px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded border"
                          style={{ color: badge.color, borderColor: `${badge.color}30` }}
                        >
                          {badge.label}
                        </span>
                        <Badge
                          variant={p.status === "active" ? "default" : "secondary"}
                          className="text-[8px] uppercase tracking-widest rounded-none px-1.5 h-4"
                        >
                          {p.status}
                        </Badge>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-white/20 group-hover:text-[#F7931A] transition-colors shrink-0" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        <Link href="/proposals">
          <div className="flex items-center justify-center gap-1.5 py-3 rounded-sm border border-white/8 hover:border-white/20 bg-white/2 hover:bg-white/4 transition-all cursor-pointer">
            <span className="text-[10px] font-mono uppercase tracking-widest text-white/35 hover:text-white/60">View all proposals</span>
            <ArrowRight className="h-3 w-3 text-white/25" />
          </div>
        </Link>
      </div>

      {/* ── F.I.R.S.T. principles ── */}
      <div className="space-y-4">
        <p className="text-[9px] uppercase tracking-widest text-white/25 font-mono">Community principles</p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {FIRST_PRINCIPLES.map((p) => (
            <div key={p.letter} className="flex items-start gap-3 p-4 rounded-sm border border-white/6 bg-white/2">
              <span
                className="font-mono font-black text-2xl shrink-0 leading-none"
                style={{ color: community.color }}
              >
                {p.letter}
              </span>
              <div>
                <p className="text-[11px] font-bold text-white/80 uppercase tracking-wider">{p.word}</p>
                <p className="text-[9px] font-mono text-white/30 leading-relaxed mt-0.5">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Resources ── */}
      {COMMUNITY_RESOURCES[community.id]?.length > 0 && (
        <div className="space-y-3">
          <p className="text-[9px] uppercase tracking-widest text-white/25 font-mono">Resources</p>
          <div className="space-y-2">
            {COMMUNITY_RESOURCES[community.id].map((r) => (
              <a
                key={r.url}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-4 py-3 rounded-sm border border-white/8 bg-white/2 hover:border-white/20 hover:bg-white/4 transition-all group"
              >
                <span className="text-[11px] font-mono text-white/50 group-hover:text-white/80 transition-colors">{r.label}</span>
                <ExternalLink className="h-3.5 w-3.5 text-white/20 group-hover:text-[#F7931A] transition-colors shrink-0" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

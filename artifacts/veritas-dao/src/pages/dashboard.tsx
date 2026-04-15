import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetDashboardStats, useGetChainActivity, useListProposals } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, CheckCircle2, ChevronRight, Layers, Users, Zap } from "lucide-react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: activity, isLoading: activityLoading } = useGetChainActivity();
  const { data: proposals, isLoading: proposalsLoading } = useListProposals({ chain: 'all' });

  const activeProposals = proposals?.filter(p => p.status === 'active')?.slice(0, 3) || [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight uppercase">Network Overview</h1>
        <p className="text-muted-foreground mt-1 font-mono text-sm">Real-time governance metrics and cross-chain activity.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Proposals" 
          value={stats?.totalProposals} 
          icon={<Layers className="h-4 w-4 text-muted-foreground" />} 
          loading={statsLoading} 
        />
        <StatCard 
          title="Active Proposals" 
          value={stats?.activeProposals} 
          icon={<Zap className="h-4 w-4 text-orange-500" />} 
          loading={statsLoading} 
        />
        <StatCard 
          title="Total Votes" 
          value={stats?.totalVotes} 
          icon={<CheckCircle2 className="h-4 w-4 text-green-500" />} 
          loading={statsLoading} 
          subtitle={stats ? `Celo: ${stats.celoVotes} / RSK: ${stats.rskVotes}` : undefined}
        />
        <StatCard 
          title="Unique Voters" 
          value={stats?.uniqueVoters} 
          icon={<Users className="h-4 w-4 text-blue-500" />} 
          loading={statsLoading} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Active Proposals Summary */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold uppercase tracking-wider">Active Proposals</h2>
            <Link href="/proposals" className="text-xs font-mono text-primary hover:underline flex items-center">
              View All <ChevronRight className="h-3 w-3 ml-1" />
            </Link>
          </div>
          
          <div className="space-y-3">
            {proposalsLoading ? (
              Array(3).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-none" />
              ))
            ) : activeProposals.length > 0 ? (
              activeProposals.map(proposal => (
                <Card key={proposal.id} className="rounded-none border-border hover:border-primary transition-colors">
                  <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <h3 className="font-bold">{proposal.title}</h3>
                      <div className="flex gap-2 items-center text-xs font-mono">
                        <Badge variant="outline" className={`rounded-none uppercase tracking-widest border-opacity-50 ${proposal.chain === 'celo' ? 'text-green-500 border-green-500' : 'text-orange-500 border-orange-500'}`}>
                          {proposal.chain}
                        </Badge>
                        <span className="text-muted-foreground">Ends: {new Date(proposal.endsAt || '').toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Link href={`/proposals/${proposal.id}`}>
                      <div className="px-4 py-2 border border-border text-xs uppercase tracking-widest font-bold hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer text-center">
                        Vote
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="rounded-none border-dashed border-border bg-transparent">
                <CardContent className="p-8 text-center text-muted-foreground text-sm font-mono">
                  No active proposals at this time.
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Recent Chain Activity */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-lg font-bold uppercase tracking-wider">Activity Feed</h2>
          </div>
          
          <Card className="rounded-none border-border bg-card overflow-hidden">
            <div className="divide-y divide-border">
              {activityLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <div key={i} className="p-4"><Skeleton className="h-8 w-full" /></div>
                ))
              ) : activity && activity.length > 0 ? (
                activity.slice(0, 5).map((act, i) => (
                  <div key={i} className="p-4 flex gap-3 text-sm">
                    <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${act.chain === 'celo' ? 'bg-green-500' : 'bg-orange-500'}`} />
                    <div className="space-y-1">
                      <p className="font-mono">
                        <span className="text-muted-foreground">{act.address.slice(0,6)}...{act.address.slice(-4)}</span>
                        {' '}<span className="font-bold text-primary">{act.action}</span>
                      </p>
                      <p className="text-xs text-muted-foreground truncate max-w-[200px]">{act.proposalTitle}</p>
                      <p className="text-[10px] text-muted-foreground/50 font-mono uppercase">{new Date(act.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-muted-foreground text-sm font-mono">
                  No recent activity.
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, loading, subtitle }: { title: string, value?: number, icon: React.ReactNode, loading: boolean, subtitle?: string }) {
  return (
    <Card className="rounded-none border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xs font-mono font-medium text-muted-foreground uppercase tracking-wider">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-16" />
        ) : (
          <>
            <div className="text-2xl font-bold">{value?.toLocaleString() || 0}</div>
            {subtitle && <p className="text-xs text-muted-foreground font-mono mt-1">{subtitle}</p>}
          </>
        )}
      </CardContent>
    </Card>
  );
}

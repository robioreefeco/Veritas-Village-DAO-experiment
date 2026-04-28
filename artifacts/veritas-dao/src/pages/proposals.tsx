import { useState } from "react";
import { Link } from "wouter";
import { useListProposals } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { FileText, Filter, LayoutGrid, List, MapPin, PlusCircle } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function Proposals() {
  const { selectedCommunity } = useApp();
  const [chainFilter, setChainFilter] = useState<"all" | "celo" | "rsk">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  // @ts-ignore
  const { data: proposals, isLoading } = useListProposals({ chain: chainFilter });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight uppercase">Proposals</h1>
          <p className="text-muted-foreground mt-1 font-mono text-sm">Active and historical governance motions.</p>
          {selectedCommunity && (
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-base leading-none">{selectedCommunity.flag}</span>
              <span className="text-[10px] font-mono text-white/40">
                Viewing as member of <span className="text-[#F7931A]">{selectedCommunity.name}</span>
              </span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center space-x-2 bg-muted p-1 border border-border">
            <Filter className="h-4 w-4 ml-2 text-muted-foreground" />
            <ToggleGroup type="single" value={chainFilter} onValueChange={(v) => v && setChainFilter(v as any)} className="justify-start">
              <ToggleGroupItem value="all" className="h-8 px-3 text-xs uppercase tracking-widest rounded-none data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">All</ToggleGroupItem>
              <ToggleGroupItem value="celo" className="h-8 px-3 text-xs uppercase tracking-widest rounded-none data-[state=on]:bg-green-500 data-[state=on]:text-primary-foreground">Celo</ToggleGroupItem>
              <ToggleGroupItem value="rsk" className="h-8 px-3 text-xs uppercase tracking-widest rounded-none data-[state=on]:bg-orange-500 data-[state=on]:text-primary-foreground">RSK</ToggleGroupItem>
            </ToggleGroup>
          </div>

          <div className="hidden sm:flex bg-muted p-1 border border-border">
            <ToggleGroup type="single" value={viewMode} onValueChange={(v) => v && setViewMode(v as any)}>
              <ToggleGroupItem value="list" className="h-8 w-8 p-0 rounded-none data-[state=on]:bg-background">
                <List className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="grid" className="h-8 w-8 p-0 rounded-none data-[state=on]:bg-background">
                <LayoutGrid className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "space-y-4"}>
          {Array(6).fill(0).map((_, i) => (
            <Skeleton key={i} className={viewMode === "grid" ? "h-48 w-full rounded-none" : "h-24 w-full rounded-none"} />
          ))}
        </div>
      ) : proposals && proposals.length > 0 ? (
        <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "space-y-4"}>
          {proposals.map(proposal => (
            <Card key={proposal.id} className="rounded-none border-border hover:border-primary transition-colors group">
              <CardContent className={`p-0 ${viewMode === "list" ? "flex flex-col sm:flex-row" : "flex flex-col h-full"}`}>
                <div className={`p-4 md:p-6 flex-1 flex flex-col justify-between ${viewMode === "list" ? "border-r border-border border-opacity-50" : "border-b border-border border-opacity-50"}`}>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">
                        <Link href={`/proposals/${proposal.id}`}>
                          {proposal.title}
                        </Link>
                      </h3>
                      <Badge variant={proposal.status === 'active' ? 'default' : proposal.status === 'ended' ? 'secondary' : 'outline'} className="uppercase tracking-widest text-[10px] rounded-none shrink-0">
                        {proposal.status}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-sm line-clamp-2">{proposal.description}</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-x-4 gap-y-2 items-center text-xs font-mono mt-auto">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground uppercase tracking-wider">Chain:</span>
                      <Badge variant="outline" className={`rounded-none uppercase tracking-widest border-opacity-50 ${proposal.chain === 'celo' ? 'text-green-500 border-green-500' : 'text-orange-500 border-orange-500'}`}>
                        {proposal.chain}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground uppercase tracking-wider">Census:</span>
                      <span className="font-bold">{proposal.census.toUpperCase()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground uppercase tracking-wider">Ends:</span>
                      <span>{new Date(proposal.endsAt || '').toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className={`bg-muted/30 p-4 md:p-6 flex flex-col justify-center gap-4 ${viewMode === "list" ? "w-full sm:w-48 shrink-0" : ""}`}>
                  <div className="space-y-1 w-full">
                    <div className="flex justify-between text-xs font-mono mb-1">
                      <span className="text-muted-foreground">Participation</span>
                      <span>{proposal.yesVotes + proposal.noVotes + proposal.abstainVotes} votes</span>
                    </div>
                    <div className="h-1.5 w-full bg-border flex">
                      {(() => {
                        const total = proposal.yesVotes + proposal.noVotes + proposal.abstainVotes;
                        if (total === 0) return null;
                        return (
                          <>
                            <div className="h-full bg-green-500" style={{ width: `${(proposal.yesVotes / total) * 100}%` }} />
                            <div className="h-full bg-red-500" style={{ width: `${(proposal.noVotes / total) * 100}%` }} />
                            <div className="h-full bg-muted-foreground" style={{ width: `${(proposal.abstainVotes / total) * 100}%` }} />
                          </>
                        );
                      })()}
                    </div>
                  </div>
                  
                  <Link href={`/proposals/${proposal.id}`} className="w-full">
                    <div className="w-full px-4 py-2 border border-border text-xs uppercase tracking-widest font-bold hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer text-center">
                      {proposal.status === 'active' ? 'Vote Now' : 'View Results'}
                    </div>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="rounded-none border-dashed border-border bg-transparent">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
            <FileText className="h-12 w-12 mb-4 opacity-20" />
            <h3 className="text-lg font-bold mb-1 text-foreground">No proposals found</h3>
            <p className="text-sm font-mono max-w-sm">
              There are no proposals matching your current filter criteria.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

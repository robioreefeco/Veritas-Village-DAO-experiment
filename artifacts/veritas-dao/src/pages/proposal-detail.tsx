import { useParams, Link } from "wouter";
import { useGetProposal, useGetProposalResults } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Info, ShieldAlert, Vote as VoteIcon, ExternalLink, Database, Copy, CheckCircle2 } from "lucide-react";
import { ipfsGatewayUrl, ipfsShortCid } from "@/lib/ipfs";
import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from "recharts";

export default function ProposalDetail() {
  const { id } = useParams();
  const proposalId = parseInt(id || "0", 10);
  const [copiedCid, setCopiedCid] = useState(false);

  const { data: proposal, isLoading: proposalLoading } = useGetProposal(proposalId);
  const { data: results, isLoading: resultsLoading } = useGetProposalResults(proposalId);

  const handleCopyCid = (cid: string) => {
    navigator.clipboard.writeText(cid).then(() => {
      setCopiedCid(true);
      setTimeout(() => setCopiedCid(false), 2000);
    });
  };

  if (proposalLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-24 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-64 w-full md:col-span-2" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">Proposal Not Found</h2>
        <Link href="/proposals" className="text-primary hover:underline mt-4 inline-block">
          Return to Proposals
        </Link>
      </div>
    );
  }

  const chartData = results ? [
    { name: "Yes", value: results.yes, color: "hsl(142.1 76.2% 36.3%)" }, // green-500
    { name: "No", value: results.no, color: "hsl(0 84.2% 60.2%)" }, // red-500
    { name: "Abstain", value: results.abstain, color: "hsl(215.4 16.3% 46.9%)" } // muted-foreground
  ] : [];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Link href="/proposals" className="text-xs font-mono text-muted-foreground hover:text-foreground flex items-center transition-colors">
        <ArrowLeft className="h-3 w-3 ml-1 mr-2" /> Back to Proposals
      </Link>

      <div className="border-b border-border pb-6 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant={proposal.status === 'active' ? 'default' : proposal.status === 'ended' ? 'secondary' : 'outline'} className="uppercase tracking-widest text-[10px] rounded-none shrink-0">
            {proposal.status}
          </Badge>
          <Badge variant="outline" className={`rounded-none uppercase tracking-widest border-opacity-50 ${proposal.chain === 'celo' ? 'text-green-500 border-green-500' : 'text-orange-500 border-orange-500'}`}>
            {proposal.chain}
          </Badge>
          <div className="text-xs font-mono text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {proposal.status === 'active' ? 'Ends' : 'Ended'}: {new Date(proposal.endsAt || '').toLocaleDateString()}
          </div>
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight">{proposal.title}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="prose prose-sm md:prose-base dark:prose-invert max-w-none font-sans">
            <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground border-b border-border pb-2 mb-4">Description</h3>
            <div className="whitespace-pre-wrap">{proposal.description}</div>
          </section>

          {proposal.imageUrls && proposal.imageUrls.length > 0 && (
            <section className="space-y-4">
              <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground border-b border-border pb-2">
                Proposal Photos
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {proposal.imageUrls.map((objectPath, idx) => (
                  <a
                    key={objectPath}
                    href={`/api/storage${objectPath}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block aspect-square overflow-hidden border border-border hover:border-[#F7931A]/50 transition-colors group"
                  >
                    <img
                      src={`/api/storage${objectPath}`}
                      alt={`Proposal photo ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </a>
                ))}
              </div>
            </section>
          )}

          <section className="space-y-4 pt-8 border-t border-border">
            <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Governance Parameters</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-muted/30 border border-border">
                <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Census Token</div>
                <div className="font-bold font-mono">{proposal.census.toUpperCase()}</div>
              </div>
              <div className="p-4 bg-muted/30 border border-border">
                <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Target Chain</div>
                <div className="font-bold font-mono capitalize">{proposal.chain}</div>
              </div>
              <div className="p-4 bg-muted/30 border border-border">
                <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Start Date</div>
                <div className="font-bold font-mono text-sm">{new Date(proposal.createdAt).toLocaleDateString()}</div>
              </div>
              <div className="p-4 bg-muted/30 border border-border">
                <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Election ID</div>
                <div className="font-bold font-mono text-xs truncate" title={proposal.electionId || "N/A"}>
                  {proposal.electionId ? proposal.electionId.slice(0, 8) + '...' : 'N/A'}
                </div>
              </div>
            </div>

            {proposal.anchorTxHash && (() => {
              const isCelo = proposal.chain === 'celo';
              const chainLabel = isCelo ? 'Celo' : 'Rootstock';
              const txSlug = `/tx/${proposal.anchorTxHash}`;
              const scanners = isCelo
                ? [
                    { url: `https://celoscan.io${txSlug}`, label: "Celoscan (Mainnet)" },
                    { url: `https://celo-sepolia.blockscout.com${txSlug}`, label: "Celo Sepolia Blockscout (Testnet)" },
                  ]
                : [
                    { url: `https://explorer.rsk.co${txSlug}`, label: "RSK Explorer (Mainnet)" },
                    { url: `https://explorer.testnet.rsk.co${txSlug}`, label: "RSK Explorer (Testnet)" },
                  ];
              return (
                <div className="mt-4 space-y-2">
                  <div className="text-xs font-mono text-[#F7931A]/70 uppercase tracking-wider">
                    On-Chain Anchor TX · {chainLabel}
                  </div>
                  <div className="font-bold font-mono text-sm text-[#F7931A] break-all px-1">
                    {proposal.anchorTxHash.slice(0, 18)}…{proposal.anchorTxHash.slice(-8)}
                  </div>
                  {scanners.map(s => (
                    <a
                      key={s.url}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 border border-[#F7931A]/20 bg-[#F7931A]/5 hover:bg-[#F7931A]/10 transition-colors group rounded-sm"
                    >
                      <span className="text-[11px] font-mono text-[#F7931A]/80 group-hover:text-[#F7931A]">{s.label}</span>
                      <ExternalLink className="h-3.5 w-3.5 text-[#F7931A]/50 group-hover:text-[#F7931A] shrink-0 ml-3 transition-colors" />
                    </a>
                  ))}
                </div>
              );
            })()}

            <div className="flex items-start gap-3 p-4 border border-blue-500/20 bg-blue-500/5 text-blue-400 mt-4">
              <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-bold mb-1">Vocdoni Integration Note</p>
                <p className="opacity-80">This proposal is secured via Vocdoni's decentralized voting protocol. Census data and cryptographic proofs are anchored to the {proposal.chain === 'celo' ? 'Celo' : 'Rootstock'} network.</p>
              </div>
            </div>

            {/* IPFS Storage Section */}
            {(proposal as any).ipfsCid ? (
              <div className="mt-4 space-y-3">
                <div className="text-xs font-mono text-[#2D5A3A] uppercase tracking-wider flex items-center gap-2">
                  <Database className="h-3.5 w-3.5 text-[#2D5A3A]" />
                  IPFS Content Storage
                </div>
                <div className="p-4 border border-[#2D5A3A]/40 bg-[#2D5A3A]/5 rounded-sm space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-[10px] text-white/30 font-mono uppercase tracking-wider mb-1">Content ID (CID)</div>
                      <div className="font-mono text-sm text-[#F7931A] break-all">{ipfsShortCid((proposal as any).ipfsCid)}</div>
                    </div>
                    <button
                      onClick={() => handleCopyCid((proposal as any).ipfsCid)}
                      className="shrink-0 p-2 border border-white/10 hover:border-[#F7931A]/40 hover:bg-[#F7931A]/5 transition-colors rounded-sm"
                      title="Copy full CID"
                    >
                      {copiedCid
                        ? <CheckCircle2 className="h-4 w-4 text-green-400" />
                        : <Copy className="h-4 w-4 text-white/40" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-white/30 font-mono leading-relaxed">
                    The proposal content is content-addressed on IPFS. The CID is a cryptographic fingerprint — anyone can verify the content has not been altered by re-computing the same hash from the original JSON.
                  </p>
                  <a
                    href={ipfsGatewayUrl((proposal as any).ipfsCid)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between w-full p-3 border border-[#2D5A3A]/40 bg-[#2D5A3A]/10 hover:bg-[#2D5A3A]/20 transition-colors rounded-sm group"
                  >
                    <span className="text-[11px] font-mono text-[#2D5A3A] group-hover:text-green-400 transition-colors">Verify on IPFS Gateway</span>
                    <ExternalLink className="h-3.5 w-3.5 text-[#2D5A3A]/60 group-hover:text-green-400 transition-colors shrink-0 ml-2" />
                  </a>
                </div>
              </div>
            ) : (
              <div className="mt-4 flex items-center gap-2 p-3 border border-white/5 bg-white/2 rounded-sm">
                <Database className="h-3.5 w-3.5 text-white/15 shrink-0" />
                <span className="text-[10px] font-mono text-white/20">No IPFS record — this proposal was created before IPFS integration.</span>
              </div>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <Card className="rounded-none border-border bg-card">
            <CardHeader className="border-b border-border bg-muted/20">
              <CardTitle className="text-sm font-mono uppercase tracking-widest flex items-center gap-2">
                <VoteIcon className="h-4 w-4" />
                Current Tally
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {resultsLoading ? (
                <Skeleton className="h-48 w-full" />
              ) : results ? (
                <>
                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                        <Tooltip 
                          cursor={{ fill: 'hsl(var(--muted)/0.5)' }}
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: 0 }}
                          itemStyle={{ color: 'hsl(var(--foreground))' }}
                        />
                        <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-border">
                    <div className="flex justify-between items-center text-sm font-mono">
                      <span className="text-muted-foreground">Total Votes</span>
                      <span className="font-bold">{results.total}</span>
                    </div>
                    {/* Chain breakdown if applicable */}
                    <div className="text-xs text-muted-foreground space-y-1 mt-2">
                      <div className="flex justify-between items-center opacity-70">
                        <span>via Celo:</span>
                        <span>{results.byChain.celo.yes + results.byChain.celo.no + results.byChain.celo.abstain}</span>
                      </div>
                      <div className="flex justify-between items-center opacity-70">
                        <span>via RSK:</span>
                        <span>{results.byChain.rsk.yes + results.byChain.rsk.no + results.byChain.rsk.abstain}</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center text-muted-foreground text-sm py-8 font-mono">
                  No tally data available.
                </div>
              )}

              {proposal.status === 'active' && (
                <Link href={`/vote/${proposal.id}`}>
                  <Button className="w-full rounded-none h-12 uppercase tracking-widest font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all">
                    Cast Your Vote
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-none border-border bg-card/50">
            <CardContent className="p-4 flex items-start gap-3 text-xs text-muted-foreground">
              <Info className="h-4 w-4 shrink-0 mt-0.5" />
              <p>Votes are final and recorded on-chain. Ensure your wallet has sufficient {proposal.census.toUpperCase()} balance to participate in this census.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

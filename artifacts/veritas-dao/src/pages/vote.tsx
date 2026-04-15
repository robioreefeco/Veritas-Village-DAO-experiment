import { useState } from "react";
import { useParams, Link, useLocation } from "wouter";
import { usePrivy } from "@privy-io/react-auth";
import { useGetProposal, useCastVote } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, CheckCircle2, Loader2, AlertCircle, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CastVoteBodyChoice } from "@workspace/api-zod";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Vote() {
  const { id } = useParams();
  const proposalId = parseInt(id || "0", 10);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const { login, authenticated, user } = usePrivy();
  const { data: proposal, isLoading: proposalLoading } = useGetProposal(proposalId);
  const castVoteMutation = useCastVote();

  const [choice, setChoice] = useState<CastVoteBodyChoice | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const walletAddress = user?.wallet?.address;
  // Mock balance for UI purposes based on chain
  const mockBalance = proposal?.chain === 'rsk' ? "0.045 rBTC" : "150.00 cUSD";

  if (proposalLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-96 w-full" />
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

  if (proposal.status !== 'active') {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Link href={`/proposals/${proposal.id}`} className="text-xs font-mono text-muted-foreground hover:text-foreground flex items-center transition-colors">
          <ArrowLeft className="h-3 w-3 ml-1 mr-2" /> Back to Proposal
        </Link>
        <Alert className="rounded-none border-border bg-muted/20">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Voting Closed</AlertTitle>
          <AlertDescription>
            This proposal is no longer accepting votes. Status: {proposal.status}.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const handleVote = async () => {
    if (!choice || !walletAddress) return;
    
    setIsSubmitting(true);
    
    try {
      // Simulate blockchain delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate mock tx hash
      const mockHash = "0x" + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
      
      const result = await castVoteMutation.mutateAsync({
        id: proposalId,
        data: {
          voterAddress: walletAddress,
          choice: choice,
          chain: proposal.chain,
          txHash: mockHash
        }
      });
      
      setTxHash(mockHash);
      toast({
        title: "Vote Cast Successfully",
        description: "Your vote has been recorded on-chain.",
      });
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Voting Failed",
        description: "There was an error submitting your vote. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getExplorerUrl = () => {
    if (!txHash) return "#";
    if (proposal.chain === 'celo') return `https://alfajores.celoscan.io/tx/${txHash}`;
    return `https://explorer.testnet.rootstock.io/tx/${txHash}`;
  };

  if (txHash) {
    return (
      <div className="max-w-2xl mx-auto mt-12 animate-in fade-in zoom-in duration-500">
        <Card className="rounded-none border-border border-2">
          <CardContent className="p-12 flex flex-col items-center text-center space-y-6">
            <div className="h-24 w-24 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 mb-2">
              <CheckCircle2 className="h-12 w-12" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-3xl font-bold uppercase tracking-tight">Vote Confirmed</h2>
              <p className="text-muted-foreground font-mono">Your cryptographic proof has been anchored.</p>
            </div>
            
            <div className="w-full p-4 bg-muted/30 border border-border text-left space-y-3 font-mono text-sm">
              <div className="flex justify-between border-b border-border/50 pb-2">
                <span className="text-muted-foreground">Proposal</span>
                <span className="truncate max-w-[200px] font-bold">{proposal.title}</span>
              </div>
              <div className="flex justify-between border-b border-border/50 pb-2">
                <span className="text-muted-foreground">Choice</span>
                <span className="uppercase font-bold text-primary">{choice}</span>
              </div>
              <div className="flex justify-between border-b border-border/50 pb-2">
                <span className="text-muted-foreground">Network</span>
                <span className="uppercase font-bold">{proposal.chain}</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-muted-foreground">Transaction</span>
                <a href={getExplorerUrl()} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1">
                  {txHash.slice(0, 10)}...{txHash.slice(-8)}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
            
            <Button 
              className="w-full rounded-none h-12 uppercase tracking-widest font-bold"
              onClick={() => setLocation(`/proposals/${proposalId}`)}
            >
              Return to Proposal
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Link href={`/proposals/${proposal.id}`} className="text-xs font-mono text-muted-foreground hover:text-foreground flex items-center transition-colors">
        <ArrowLeft className="h-3 w-3 ml-1 mr-2" /> Cancel Voting
      </Link>

      <Card className="rounded-none border-border shadow-lg">
        <CardHeader className="border-b border-border bg-muted/10 pb-6">
          <div className="text-xs font-mono uppercase tracking-widest text-primary mb-2">Cast Vote</div>
          <CardTitle className="text-2xl">{proposal.title}</CardTitle>
          <CardDescription className="font-mono mt-2">
            Chain: <span className="uppercase font-bold text-foreground">{proposal.chain}</span> | 
            Census: <span className="uppercase font-bold text-foreground">{proposal.census}</span>
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-6 space-y-8">
          {!authenticated ? (
            <div className="py-8 text-center space-y-6">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Wallet Required</h3>
                <p className="text-muted-foreground text-sm font-mono max-w-md mx-auto">
                  You must connect a wallet holding {proposal.census.toUpperCase()} on {proposal.chain === 'celo' ? 'Celo' : 'Rootstock'} to participate in this census.
                </p>
              </div>
              <Button 
                onClick={() => login()} 
                className="rounded-none h-12 px-8 uppercase tracking-widest font-bold"
              >
                Connect Wallet to Vote
              </Button>
            </div>
          ) : (
            <>
              <div className="p-4 border border-primary/20 bg-primary/5 flex justify-between items-center font-mono text-sm">
                <div>
                  <div className="text-muted-foreground uppercase text-xs tracking-wider mb-1">Connected Address</div>
                  <div className="font-bold">{walletAddress?.slice(0,8)}...{walletAddress?.slice(-6)}</div>
                </div>
                <div className="text-right">
                  <div className="text-muted-foreground uppercase text-xs tracking-wider mb-1">Voting Power</div>
                  <div className="font-bold text-primary">{mockBalance}</div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold uppercase tracking-wider border-b border-border pb-2">Select Your Choice</h3>
                
                <RadioGroup 
                  value={choice || ""} 
                  onValueChange={(v) => setChoice(v as CastVoteBodyChoice)}
                  className="grid grid-cols-1 gap-4"
                >
                  <div className={`relative border p-4 cursor-pointer transition-all ${choice === "yes" ? "border-green-500 bg-green-500/10" : "border-border hover:border-foreground/50"}`}>
                    <RadioGroupItem value="yes" id="yes" className="absolute right-4 top-4" />
                    <Label htmlFor="yes" className="cursor-pointer flex flex-col gap-1 w-full h-full pr-8">
                      <span className="font-bold text-lg text-green-500 uppercase tracking-widest">Yes</span>
                      <span className="text-xs text-muted-foreground font-mono">Approve this proposal.</span>
                    </Label>
                  </div>
                  
                  <div className={`relative border p-4 cursor-pointer transition-all ${choice === "no" ? "border-red-500 bg-red-500/10" : "border-border hover:border-foreground/50"}`}>
                    <RadioGroupItem value="no" id="no" className="absolute right-4 top-4" />
                    <Label htmlFor="no" className="cursor-pointer flex flex-col gap-1 w-full h-full pr-8">
                      <span className="font-bold text-lg text-red-500 uppercase tracking-widest">No</span>
                      <span className="text-xs text-muted-foreground font-mono">Reject this proposal.</span>
                    </Label>
                  </div>
                  
                  <div className={`relative border p-4 cursor-pointer transition-all ${choice === "abstain" ? "border-foreground bg-muted" : "border-border hover:border-foreground/50"}`}>
                    <RadioGroupItem value="abstain" id="abstain" className="absolute right-4 top-4" />
                    <Label htmlFor="abstain" className="cursor-pointer flex flex-col gap-1 w-full h-full pr-8">
                      <span className="font-bold text-lg uppercase tracking-widest">Abstain</span>
                      <span className="text-xs text-muted-foreground font-mono">Register attendance without preference.</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </>
          )}
        </CardContent>
        
        {authenticated && (
          <CardFooter className="p-6 border-t border-border bg-muted/10">
            <Button 
              className="w-full rounded-none h-14 uppercase tracking-widest font-bold text-lg"
              disabled={!choice || isSubmitting}
              onClick={handleVote}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Securing Vote...
                </>
              ) : (
                `Submit ${choice ? `"${choice.toUpperCase()}"` : ''} Vote`
              )}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}

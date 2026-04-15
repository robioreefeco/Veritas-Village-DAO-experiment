import { useState } from "react";
import { useLocation } from "wouter";
import { useCreateProposal } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ShieldPlus, TerminalSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CreateProposalBodyChain, CreateProposalBodyCensus } from "@workspace/api-zod";

export default function Admin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createProposalMutation = useCreateProposal();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    chain: "celo" as CreateProposalBodyChain,
    census: "cusd" as CreateProposalBodyCensus,
    durationDays: "7"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Title and description are required.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Calculate endsAt date
      const endsAt = new Date();
      endsAt.setDate(endsAt.getDate() + parseInt(formData.durationDays, 10));

      const result = await createProposalMutation.mutateAsync({
        data: {
          title: formData.title,
          description: formData.description,
          chain: formData.chain,
          census: formData.census,
          endsAt: endsAt.toISOString()
        }
      });

      toast({
        title: "Proposal Created",
        description: "The proposal has been initialized and anchored on-chain.",
      });

      setLocation(`/proposals/${result.id}`);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Creation Failed",
        description: "There was an error creating the proposal. Please try again.",
      });
      setIsSubmitting(false);
    }
  };

  const handleChainChange = (value: CreateProposalBodyChain) => {
    setFormData({
      ...formData,
      chain: value,
      // Auto-update census token default based on chain
      census: value === 'celo' ? 'cusd' : 'rbtc'
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight uppercase flex items-center gap-3">
          <TerminalSquare className="h-8 w-8" /> Governance Admin
        </h1>
        <p className="text-muted-foreground mt-1 font-mono text-sm">Initialize new sovereignty motions and elections.</p>
      </div>

      <Card className="rounded-none border-border shadow-none">
        <CardHeader className="bg-muted/10 border-b border-border pb-6">
          <CardTitle className="uppercase tracking-widest text-lg flex items-center gap-2">
            <ShieldPlus className="h-5 w-5 text-primary" /> Create Proposal
          </CardTitle>
          <CardDescription className="font-mono text-xs mt-2">
            Proposals are securely anchored using Vocdoni's zero-knowledge voting protocol.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="title" className="uppercase tracking-wider text-xs text-muted-foreground">Proposal Title</Label>
              <Input 
                id="title" 
                placeholder="e.g., Allocate 5000 cUSD for Community Water Project" 
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="rounded-none font-mono focus-visible:ring-primary h-12" 
                required
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="description" className="uppercase tracking-wider text-xs text-muted-foreground">Full Description (Markdown supported)</Label>
              <Textarea 
                id="description" 
                placeholder="Detail the motion, goals, and execution plan..." 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="rounded-none font-mono focus-visible:ring-primary min-h-[200px]" 
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-border">
              <div className="space-y-3">
                <Label htmlFor="chain" className="uppercase tracking-wider text-xs text-muted-foreground">Target Network</Label>
                <Select value={formData.chain} onValueChange={(val) => handleChainChange(val as CreateProposalBodyChain)}>
                  <SelectTrigger id="chain" className="rounded-none font-bold uppercase tracking-widest h-12 focus:ring-primary">
                    <SelectValue placeholder="Select network" />
                  </SelectTrigger>
                  <SelectContent className="rounded-none font-mono">
                    <SelectItem value="celo" className="uppercase tracking-widest text-green-500 focus:text-green-500">Celo (Alfajores)</SelectItem>
                    <SelectItem value="rsk" className="uppercase tracking-widest text-orange-500 focus:text-orange-500">Rootstock (Testnet)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label htmlFor="census" className="uppercase tracking-wider text-xs text-muted-foreground">Census Token</Label>
                <Select value={formData.census} onValueChange={(val) => setFormData({...formData, census: val as CreateProposalBodyCensus})}>
                  <SelectTrigger id="census" className="rounded-none font-bold uppercase tracking-widest h-12 focus:ring-primary">
                    <SelectValue placeholder="Select census token" />
                  </SelectTrigger>
                  <SelectContent className="rounded-none font-mono">
                    {formData.chain === 'celo' && <SelectItem value="cusd" className="uppercase tracking-widest">cUSD</SelectItem>}
                    {formData.chain === 'rsk' && <SelectItem value="rbtc" className="uppercase tracking-widest">rBTC</SelectItem>}
                  </SelectContent>
                </Select>
                <p className="text-[10px] font-mono text-muted-foreground mt-1">
                  Only wallets holding this token can vote.
                </p>
              </div>

              <div className="space-y-3 sm:col-span-2 border-t border-border pt-4">
                <Label htmlFor="duration" className="uppercase tracking-wider text-xs text-muted-foreground">Voting Duration (Days)</Label>
                <Select value={formData.durationDays} onValueChange={(val) => setFormData({...formData, durationDays: val})}>
                  <SelectTrigger id="duration" className="rounded-none font-mono h-12 focus:ring-primary">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent className="rounded-none font-mono">
                    <SelectItem value="3">3 Days</SelectItem>
                    <SelectItem value="7">7 Days</SelectItem>
                    <SelectItem value="14">14 Days</SelectItem>
                    <SelectItem value="30">30 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="pt-6">
              <Button 
                type="submit" 
                className="w-full rounded-none h-14 uppercase tracking-widest font-bold text-lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Initializing Election...
                  </>
                ) : (
                  "Create Proposal"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

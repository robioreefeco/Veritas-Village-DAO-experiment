import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRightLeft, ArrowDown, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export default function Bridge() {
  const [amount, setAmount] = useState("");
  const { toast } = useToast();

  const handleBridge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) return;

    toast({
      title: "Bridge Process Initiated",
      description: "Redirecting to Rootstock Powpeg UI. In production, this would open the official peg bridge.",
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight uppercase flex items-center gap-3">
          <ArrowRightLeft className="h-8 w-8" /> Asset Bridge
        </h1>
        <p className="text-muted-foreground mt-1 font-mono text-sm">Transfer assets across networks to participate in sovereign governance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card className="rounded-none border-border">
            <CardHeader className="bg-muted/30 border-b border-border">
              <CardTitle className="uppercase tracking-widest text-sm flex items-center gap-2">
                <Zap className="h-4 w-4 text-orange-500" />
                BTC to rBTC Powpeg
              </CardTitle>
              <CardDescription className="font-mono text-xs mt-2">
                Get Rootstock Bitcoin (rBTC) to vote in RSK census proposals.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleBridge} className="space-y-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 p-4 border border-border bg-card text-center">
                    <div className="font-bold text-xl uppercase tracking-wider">BTC</div>
                    <div className="text-xs text-muted-foreground font-mono mt-1">Bitcoin Network</div>
                  </div>
                  <ArrowRightLeft className="h-6 w-6 text-muted-foreground shrink-0" />
                  <div className="flex-1 p-4 border border-orange-500/30 bg-orange-500/5 text-center">
                    <div className="font-bold text-xl uppercase tracking-wider text-orange-500">rBTC</div>
                    <div className="text-xs text-orange-500/70 font-mono mt-1">Rootstock Network</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount" className="uppercase tracking-wider text-xs">Amount to Peg-In</Label>
                  <div className="relative">
                    <Input 
                      id="amount" 
                      placeholder="0.0" 
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="rounded-none font-mono text-lg h-12 pr-16 border-border focus-visible:ring-orange-500" 
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">
                      BTC
                    </div>
                  </div>
                  <div className="flex justify-between text-xs font-mono text-muted-foreground mt-1">
                    <span>Min: 0.005 BTC</span>
                    <span>Fee: ~0.0001 BTC</span>
                  </div>
                </div>

                <Button type="submit" className="w-full rounded-none h-12 uppercase tracking-widest font-bold bg-orange-500 hover:bg-orange-600 text-black">
                  Start Powpeg Process
                </Button>
              </form>
            </CardContent>
          </Card>
          
          <Card className="rounded-none border-border border-dashed bg-transparent">
            <CardContent className="p-6 text-sm font-mono text-muted-foreground space-y-4">
              <p className="flex items-start gap-2">
                <ShieldCheck className="h-5 w-5 shrink-0 text-primary" />
                <span>The Powpeg is a 2-way bridge connecting Bitcoin and Rootstock. It is secured by a federation of hardware security modules (HSMs).</span>
              </p>
              <p className="flex items-start gap-2">
                <ShieldCheck className="h-5 w-5 shrink-0 text-primary" />
                <span>Peg-in (BTC → rBTC) takes approximately 100 block confirmations (~16 hours) for maximum security.</span>
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-bold uppercase tracking-tight border-b border-border pb-2">Alternative Bridges</h2>
          
          <a href="https://app.squidrouter.com/" target="_blank" rel="noreferrer" className="block group">
            <Card className="rounded-none border-border hover:border-primary transition-colors h-full">
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="font-bold text-lg uppercase tracking-wider">Squid Router</div>
                  <Badge variant="outline" className="rounded-none font-mono text-[10px]">Cross-chain</Badge>
                </div>
                <p className="text-sm text-muted-foreground">Bridge USDC, ETH, or other assets directly to Celo for cUSD census proposals.</p>
                <div className="text-primary text-xs uppercase tracking-widest font-bold flex items-center group-hover:translate-x-1 transition-transform">
                  Launch App <ArrowRightLeft className="h-3 w-3 ml-1" />
                </div>
              </CardContent>
            </Card>
          </a>

          <a href="https://portal.txsync.io/" target="_blank" rel="noreferrer" className="block group">
            <Card className="rounded-none border-border hover:border-primary transition-colors h-full">
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="font-bold text-lg uppercase tracking-wider">Portal Bridge</div>
                  <Badge variant="outline" className="rounded-none font-mono text-[10px]">Wormhole</Badge>
                </div>
                <p className="text-sm text-muted-foreground">Transfer assets between Celo, Ethereum, Solana, and 20+ other networks.</p>
                <div className="text-primary text-xs uppercase tracking-widest font-bold flex items-center group-hover:translate-x-1 transition-transform">
                  Launch App <ArrowRightLeft className="h-3 w-3 ml-1" />
                </div>
              </CardContent>
            </Card>
          </a>
          
          <a href="https://faucet.celo.org/alfajores" target="_blank" rel="noreferrer" className="block group">
            <Card className="rounded-none border-border border-dashed bg-muted/10 hover:border-green-500 transition-colors h-full">
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="font-bold text-lg uppercase tracking-wider text-green-500">Celo Faucet</div>
                  <Badge variant="outline" className="rounded-none font-mono text-[10px] text-green-500 border-green-500">Testnet</Badge>
                </div>
                <p className="text-sm text-muted-foreground">Get testnet CELO and cUSD for Alfajores testnet proposals.</p>
                <div className="text-green-500 text-xs uppercase tracking-widest font-bold flex items-center group-hover:translate-x-1 transition-transform">
                  Get Test Tokens <ArrowRightLeft className="h-3 w-3 ml-1" />
                </div>
              </CardContent>
            </Card>
          </a>
        </div>
      </div>
    </div>
  );
}

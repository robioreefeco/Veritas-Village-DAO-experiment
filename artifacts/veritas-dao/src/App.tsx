import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { PrivyProvider } from '@privy-io/react-auth';
import { Layout } from "@/components/layout";

import Dashboard from "@/pages/dashboard";
import Proposals from "@/pages/proposals";
import ProposalDetail from "@/pages/proposal-detail";
import Vote from "@/pages/vote";
import Admin from "@/pages/admin";

const queryClient = new QueryClient();

// Chain configs
const celoAlfajores = { 
  id: 44787, 
  name: 'Celo Alfajores', 
  nativeCurrency: { name: 'CELO', symbol: 'CELO', decimals: 18 }, 
  rpcUrls: { default: { http: [import.meta.env.VITE_CELO_RPC || 'https://alfajores-forno.celo-testnet.org'] } } 
};
const rskTestnet = { 
  id: 31, 
  name: 'RSK Testnet', 
  nativeCurrency: { name: 'rBTC', symbol: 'rBTC', decimals: 18 }, 
  rpcUrls: { default: { http: [import.meta.env.VITE_RSK_RPC || 'https://public-node.testnet.rsk.co'] } } 
};

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/proposals" component={Proposals} />
        <Route path="/proposals/:id" component={ProposalDetail} />
        <Route path="/vote/:id" component={Vote} />
        <Route path="/admin" component={Admin} /> 
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  const appId = import.meta.env.VITE_PRIVY_APP_ID || 'demo';

  return (
    <PrivyProvider 
      appId={appId}
      config={{ 
        defaultChain: rskTestnet,
        supportedChains: [rskTestnet, celoAlfajores],
        appearance: {
          theme: 'dark',
          accentColor: '#F7931A'
        }
      }}
    >
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}

export default App;

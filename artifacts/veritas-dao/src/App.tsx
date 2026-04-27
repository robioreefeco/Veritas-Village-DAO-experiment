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
import Bridge from "@/pages/bridge";
import Swap from "@/pages/swap";

const queryClient = new QueryClient();

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

const celoSepolia = {
  id: 11142220,
  name: 'Celo Sepolia',
  nativeCurrency: { name: 'CELO', symbol: 'CELO', decimals: 18 },
  rpcUrls: { default: { http: [import.meta.env.VITE_CELO_RPC || 'https://forno.celo.org/sepolia'] } }
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
        <Route path="/bridge" component={Bridge} />
        <Route path="/swap" component={Swap} />
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
        supportedChains: [rskTestnet, celoSepolia],
        loginMethods: ['email', 'twitter', 'wallet'],
        appearance: {
          theme: 'dark',
          accentColor: '#F7931A',
          logo: `${window.location.origin}${BASE}/veritas-logo.png`,
          walletList: ['metamask', 'rabby', 'coinbase_wallet', 'detected_wallets'],
          landingHeader: 'Veritas Villages DAO',
          loginMessage: 'Sign in to vote, create proposals, and govern sovereign communities.',
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
        },
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

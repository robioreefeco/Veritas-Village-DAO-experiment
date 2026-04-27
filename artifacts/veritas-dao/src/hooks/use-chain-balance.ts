import { useCallback, useEffect, useState } from "react";
import { createPublicClient, http, formatEther } from "viem";

const RSK_CHAIN = {
  id: 31,
  name: "RSK Testnet",
  nativeCurrency: { name: "rBTC", symbol: "rBTC", decimals: 18 },
  rpcUrls: {
    default: { http: [import.meta.env.VITE_RSK_RPC || "https://public-node.testnet.rsk.co"] },
  },
};

const CELO_CHAIN = {
  id: 11142220,
  name: "Celo Sepolia",
  nativeCurrency: { name: "CELO", symbol: "CELO", decimals: 18 },
  rpcUrls: {
    default: { http: [import.meta.env.VITE_CELO_RPC || "https://forno.celo.org/sepolia"] },
  },
};

export type ChainBalanceResult = {
  balance: bigint | null;
  formatted: string;
  symbol: string;
  loading: boolean;
  error: string | null;
  refresh: () => void;
};

export function useChainBalance(address: string | undefined, chain: "rsk" | "celo"): ChainBalanceResult {
  const [balance, setBalance] = useState<bigint | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const symbol = chain === "rsk" ? "rBTC" : "CELO";
  const chainConfig = chain === "rsk" ? RSK_CHAIN : CELO_CHAIN;

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    if (!address) {
      setBalance(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    const client = createPublicClient({
      chain: chainConfig as Parameters<typeof createPublicClient>[0]["chain"],
      transport: http(chainConfig.rpcUrls.default.http[0]),
    });

    client
      .getBalance({ address: address as `0x${string}` })
      .then((bal) => {
        if (!cancelled) {
          setBalance(bal);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || "Balance fetch failed");
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [address, chain, tick]);

  const formatted = balance !== null ? Number(formatEther(balance)).toFixed(6) : "—";

  return { balance, formatted, symbol, loading, error, refresh };
}

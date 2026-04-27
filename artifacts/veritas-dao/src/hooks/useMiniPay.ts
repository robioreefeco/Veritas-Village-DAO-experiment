import { useState, useEffect, useCallback } from "react";
import {
  createPublicClient,
  createWalletClient,
  custom,
  http,
  parseEther,
  formatEther,
  encodeFunctionData,
  type Address,
} from "viem";
import { celo } from "viem/chains";

// ─── Celo mainnet contract addresses ────────────────────────────────────────
export const CUSD_ADDRESS: Address = "0x765DE816845861e75A25fCA122bb6898B8B1282a";
export const CEUR_ADDRESS: Address = "0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73";

// Minimal ERC-20 ABI (transfer + balanceOf)
const ERC20_ABI = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "transfer",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "value", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "decimals",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
  },
] as const;

export interface MiniPayState {
  isMiniPay: boolean;
  address: Address | null;
  cusdBalance: string | null;
  ceurBalance: string | null;
  loading: boolean;
  error: string | null;
}

export interface SendPaymentParams {
  to: Address;
  amountCusd: string;
  token?: "cusd" | "ceur";
}

export interface SendPaymentResult {
  txHash: string;
  success: boolean;
}

const celoPublicClient = createPublicClient({
  chain: celo,
  transport: http("https://forno.celo.org"),
});

export function useMiniPay() {
  const [state, setState] = useState<MiniPayState>({
    isMiniPay: false,
    address: null,
    cusdBalance: null,
    ceurBalance: null,
    loading: true,
    error: null,
  });
  const [sending, setSending] = useState(false);

  const detectAndLoad = useCallback(async () => {
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      const detected =
        typeof window !== "undefined" &&
        !!window.ethereum &&
        !!(window.ethereum as any).isMiniPay;

      if (!detected) {
        setState(s => ({ ...s, isMiniPay: false, loading: false }));
        return;
      }

      // Request accounts
      const accounts = (await (window.ethereum as any).request({
        method: "eth_requestAccounts",
        params: [],
      })) as Address[];
      const address = accounts[0] ?? null;

      let cusdBalance: string | null = null;
      let ceurBalance: string | null = null;

      if (address) {
        const [cusdRaw, ceurRaw] = await Promise.all([
          celoPublicClient.readContract({
            address: CUSD_ADDRESS,
            abi: ERC20_ABI,
            functionName: "balanceOf",
            args: [address],
          }),
          celoPublicClient.readContract({
            address: CEUR_ADDRESS,
            abi: ERC20_ABI,
            functionName: "balanceOf",
            args: [address],
          }),
        ]);
        cusdBalance = formatEther(cusdRaw as bigint);
        ceurBalance = formatEther(ceurRaw as bigint);
      }

      setState({
        isMiniPay: true,
        address,
        cusdBalance,
        ceurBalance,
        loading: false,
        error: null,
      });
    } catch (e: any) {
      setState(s => ({ ...s, loading: false, error: e?.message ?? "Unknown error" }));
    }
  }, []);

  useEffect(() => {
    detectAndLoad();
  }, [detectAndLoad]);

  const refreshBalances = useCallback(async () => {
    if (!state.address) return;
    try {
      const [cusdRaw, ceurRaw] = await Promise.all([
        celoPublicClient.readContract({
          address: CUSD_ADDRESS,
          abi: ERC20_ABI,
          functionName: "balanceOf",
          args: [state.address],
        }),
        celoPublicClient.readContract({
          address: CEUR_ADDRESS,
          abi: ERC20_ABI,
          functionName: "balanceOf",
          args: [state.address],
        }),
      ]);
      setState(s => ({
        ...s,
        cusdBalance: formatEther(cusdRaw as bigint),
        ceurBalance: formatEther(ceurRaw as bigint),
      }));
    } catch (_) {}
  }, [state.address]);

  const sendPayment = useCallback(
    async ({ to, amountCusd, token = "cusd" }: SendPaymentParams): Promise<SendPaymentResult> => {
      if (!state.address) throw new Error("No MiniPay address connected");
      setSending(true);
      try {
        const walletClient = createWalletClient({
          chain: celo,
          transport: custom(window.ethereum as any),
        });

        const tokenAddress = token === "ceur" ? CEUR_ADDRESS : CUSD_ADDRESS;
        const amountWei = parseEther(amountCusd);

        // Encode the ERC-20 transfer call
        const data = encodeFunctionData({
          abi: ERC20_ABI,
          functionName: "transfer",
          args: [to, amountWei],
        });

        // Estimate gas with cUSD as fee currency (Celo fee abstraction)
        const gasLimit = await celoPublicClient.estimateGas({
          account: state.address,
          to: tokenAddress,
          data,
          feeCurrency: CUSD_ADDRESS,
        } as any);

        const txHash = await walletClient.sendTransaction({
          account: state.address,
          to: tokenAddress,
          data,
          gas: gasLimit,
          feeCurrency: CUSD_ADDRESS,
          chain: celo,
        } as any);

        // Wait for receipt
        const receipt = await celoPublicClient.waitForTransactionReceipt({ hash: txHash });
        const success = receipt.status === "success";

        await refreshBalances();
        return { txHash, success };
      } finally {
        setSending(false);
      }
    },
    [state.address, refreshBalances]
  );

  return { ...state, sending, sendPayment, refreshBalances, detectAndLoad };
}

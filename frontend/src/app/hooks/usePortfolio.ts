import { useState, useEffect } from "react";
import {
  portfolioApiService,
  Transaction,
  PortfolioMetrics,
  TokenHolding,
} from "../services/portfolioApi";

export interface UsePortfolioReturn {
  transactions: Transaction[];
  metrics: PortfolioMetrics | null;
  tokenHoldings: TokenHolding[];
  smartWallets: string[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function usePortfolio(selectedWallet?: string): UsePortfolioReturn {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [metrics, setMetrics] = useState<PortfolioMetrics | null>(null);
  const [tokenHoldings, setTokenHoldings] = useState<TokenHolding[]>([]);
  const [smartWallets, setSmartWallets] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use the complete portfolio overview from backend
      const overview = await portfolioApiService.getPortfolioOverview(
        selectedWallet
      );
      const wallets = await portfolioApiService.getSmartWalletAddresses();

      setTransactions(overview.transactions);
      setMetrics(overview.metrics);
      setTokenHoldings(overview.tokenHoldings);
      setSmartWallets(wallets);
    } catch (err) {
      console.error("Failed to fetch portfolio data:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch portfolio data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedWallet]);

  return {
    transactions,
    metrics,
    tokenHoldings,
    smartWallets,
    loading,
    error,
    refetch: fetchData,
  };
}

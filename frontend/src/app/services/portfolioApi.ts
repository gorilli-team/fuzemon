const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

export interface Transaction {
  _id: string;
  smartWalletAddress: string;
  tokenSymbol: string;
  tokenAmount: number;
  tokenPrice: number;
  action: string;
  usdValue: number;
  txHash: string;
  timestamp: number;
  status: string;
  metadata: {
    source: string;
    signalId?: string;
  };
}

export interface PortfolioMetrics {
  totalDeposits: number;
  totalWithdrawals: number;
  totalBuys: number;
  totalSells: number;
  netValue: number;
  totalTransactions: number;
}

export interface TokenHolding {
  symbol: string;
  amount: number;
  value: number;
  avgPrice: number;
}

class PortfolioApiService {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  // Get all smart wallet transactions
  async getSmartWalletTransactions(): Promise<Transaction[]> {
    return this.request<Transaction[]>("/api/smart-wallet/transactions");
  }

  // Get transactions for a specific smart wallet
  async getTransactionsByWallet(
    smartWalletAddress: string
  ): Promise<Transaction[]> {
    return this.request<Transaction[]>(
      `/api/smart-wallet/transactions?smartWalletAddress=${smartWalletAddress}`
    );
  }

  // Get portfolio metrics from backend
  async getPortfolioMetrics(
    smartWalletAddress?: string
  ): Promise<PortfolioMetrics> {
    const endpoint = smartWalletAddress
      ? `/api/portfolio/metrics?smartWalletAddress=${smartWalletAddress}`
      : "/api/portfolio/metrics";

    return this.request<PortfolioMetrics>(endpoint);
  }

  // Get token holdings from backend
  async getTokenHoldings(smartWalletAddress?: string): Promise<TokenHolding[]> {
    const endpoint = smartWalletAddress
      ? `/api/portfolio/holdings?smartWalletAddress=${smartWalletAddress}`
      : "/api/portfolio/holdings";

    return this.request<TokenHolding[]>(endpoint);
  }

  // Get smart wallet addresses from backend
  async getSmartWalletAddresses(): Promise<string[]> {
    return this.request<string[]>("/api/portfolio/wallets");
  }

  // Get complete portfolio overview from backend
  async getPortfolioOverview(smartWalletAddress?: string): Promise<{
    metrics: PortfolioMetrics;
    tokenHoldings: TokenHolding[];
    transactions: Transaction[];
  }> {
    const endpoint = smartWalletAddress
      ? `/api/portfolio/overview?smartWalletAddress=${smartWalletAddress}`
      : "/api/portfolio/overview";

    return this.request(endpoint);
  }
}

export const portfolioApiService = new PortfolioApiService();

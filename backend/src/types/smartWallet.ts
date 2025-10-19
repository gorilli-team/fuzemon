export interface CreateSmartWalletRequest {
  userWallet: string;
  smartWallet: string;
  chainId: number;
}

export interface SmartWalletResponse {
  _id: string;
  userWallet: string;
  smartWallet: string;
  chainId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TrackTransactionRequest {
  smartWalletAddress: string;
  tokenSymbol: string;
  tokenAmount: string;
  tokenPrice: number;
  action: "deposit" | "withdraw" | "buy" | "sell";
  txHash: string;
  signalId?: string;
}

export interface SmartWalletBalance {
  smartWallet: string;
  tokenBalances: {
    [tokenSymbol: string]: {
      balance: string;
      usdValue: number;
    };
  };
  totalUsdValue: number;
}

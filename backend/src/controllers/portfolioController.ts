import { Request, Response } from "express";
import SmartWalletTransaction from "../models/SmartWalletTransaction";

interface PortfolioMetrics {
  totalDeposits: number;
  totalWithdrawals: number;
  totalBuys: number;
  totalSells: number;
  netValue: number;
  totalTransactions: number;
}

interface TokenHolding {
  symbol: string;
  amount: number;
  value: number;
  avgPrice: number;
}

// Get portfolio metrics for a smart wallet
export const getPortfolioMetrics = async (req: Request, res: Response) => {
  try {
    const { smartWalletAddress } = req.query;

    // Build query filter
    const query: any = {};
    if (smartWalletAddress) {
      query.smartWalletAddress = smartWalletAddress;
    }

    // Get all transactions
    const transactions = await SmartWalletTransaction.find(query).lean();

    // Token decimals mapping
    const tokenDecimals: { [key: string]: number } = {
      USDC: 6,
      USDT: 6,
      ETH: 18,
      WETH: 18,
      CHOG: 18,
      BTC: 8,
      MONAD: 18,
    };

    // Convert token amounts to human-readable format
    transactions.forEach((tx) => {
      const isWeiFormat = tx.tokenAmount > 1e15;
      if (isWeiFormat) {
        tx.tokenAmount =
          tx.tokenAmount / Math.pow(10, tokenDecimals[tx.tokenSymbol] || 18);
      }
    });

    // Calculate metrics
    const totalDeposits = transactions
      .filter((tx) => tx.action === "deposit")
      .reduce((sum, tx) => sum + tx.usdValue, 0);

    const totalWithdrawals = transactions
      .filter((tx) => tx.action === "withdraw")
      .reduce((sum, tx) => sum + tx.usdValue, 0);

    const totalBuys = transactions
      .filter((tx) => tx.action === "buy")
      .reduce((sum, tx) => sum + tx.usdValue, 0);

    const totalSells = transactions
      .filter((tx) => tx.action === "sell")
      .reduce((sum, tx) => sum + tx.usdValue, 0);

    const netValue = totalDeposits + totalSells - totalWithdrawals - totalBuys;

    const metrics: PortfolioMetrics = {
      totalDeposits,
      totalWithdrawals,
      totalBuys,
      totalSells,
      netValue,
      totalTransactions: transactions.length,
    };

    res.status(200).json(metrics);
  } catch (err) {
    console.error("Failed to get portfolio metrics:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get token holdings for a smart wallet
export const getTokenHoldings = async (req: Request, res: Response) => {
  try {
    const { smartWalletAddress } = req.query;

    // Build query filter
    const query: any = {};
    if (smartWalletAddress) {
      query.smartWalletAddress = smartWalletAddress;
    }

    // Get all transactions
    const transactions = await SmartWalletTransaction.find(query).lean();

    // Token decimals mapping
    const tokenDecimals: { [key: string]: number } = {
      USDC: 6,
      USDT: 6,
      ETH: 18,
      WETH: 18,
      CHOG: 18,
      BTC: 8,
      MONAD: 18,
    };

    const holdings: { [key: string]: { amount: number; totalCost: number } } =
      {};

    transactions.forEach((tx) => {
      if (!holdings[tx.tokenSymbol]) {
        holdings[tx.tokenSymbol] = { amount: 0, totalCost: 0 };
      }

      // Check if tokenAmount is already in human-readable format
      // If it's a very large number (> 1e15), it's likely in wei format
      const isWeiFormat = tx.tokenAmount > 1e15;
      const humanReadableAmount = isWeiFormat
        ? tx.tokenAmount / Math.pow(10, tokenDecimals[tx.tokenSymbol] || 18)
        : tx.tokenAmount;

      if (tx.action === "deposit" || tx.action === "buy") {
        holdings[tx.tokenSymbol].amount += humanReadableAmount;
        holdings[tx.tokenSymbol].totalCost += tx.usdValue;
      } else if (tx.action === "withdraw" || tx.action === "sell") {
        holdings[tx.tokenSymbol].amount -= humanReadableAmount;
        holdings[tx.tokenSymbol].totalCost -= tx.usdValue;
      }
    });

    const tokenHoldings: TokenHolding[] = Object.entries(holdings)
      .filter(([_, data]) => data.amount > 0)
      .map(([symbol, data]) => ({
        symbol,
        amount: data.amount,
        value: data.totalCost,
        avgPrice: data.amount > 0 ? data.totalCost / data.amount : 0,
      }));

    res.status(200).json(tokenHoldings);
  } catch (err) {
    console.error("Failed to get token holdings:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get smart wallet addresses
export const getSmartWalletAddresses = async (req: Request, res: Response) => {
  try {
    const addresses = await SmartWalletTransaction.distinct(
      "smartWalletAddress"
    );
    res.status(200).json(addresses);
  } catch (err) {
    console.error("Failed to get smart wallet addresses:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get portfolio overview (combines metrics and holdings)
export const getPortfolioOverview = async (req: Request, res: Response) => {
  try {
    const { smartWalletAddress } = req.query;

    // Build query filter
    const query: any = {};
    if (smartWalletAddress) {
      query.smartWalletAddress = smartWalletAddress;
    }

    // Get all transactions
    const transactions = await SmartWalletTransaction.find(query).lean();

    // Token decimals mapping
    const tokenDecimals: { [key: string]: number } = {
      USDC: 6,
      USDT: 6,
      ETH: 18,
      WETH: 18,
      CHOG: 18,
      BTC: 8,
      MONAD: 18,
    };

    // Convert token amounts to human-readable format
    transactions.forEach((tx) => {
      const isWeiFormat = tx.tokenAmount > 1e15;
      if (isWeiFormat) {
        tx.tokenAmount =
          tx.tokenAmount / Math.pow(10, tokenDecimals[tx.tokenSymbol] || 18);
      }
    });

    // Calculate metrics
    const totalDeposits = transactions
      .filter((tx) => tx.action === "deposit")
      .reduce((sum, tx) => sum + tx.usdValue, 0);

    const totalWithdrawals = transactions
      .filter((tx) => tx.action === "withdraw")
      .reduce((sum, tx) => sum + tx.usdValue, 0);

    const totalBuys = transactions
      .filter((tx) => tx.action === "buy")
      .reduce((sum, tx) => sum + tx.usdValue, 0);

    const totalSells = transactions
      .filter((tx) => tx.action === "sell")
      .reduce((sum, tx) => sum + tx.usdValue, 0);

    const netValue = totalDeposits + totalSells - totalWithdrawals - totalBuys;

    const metrics: PortfolioMetrics = {
      totalDeposits,
      totalWithdrawals,
      totalBuys,
      totalSells,
      netValue,
      totalTransactions: transactions.length,
    };

    // Calculate token holdings
    const holdings: { [key: string]: { amount: number; totalCost: number } } =
      {};

    transactions.forEach((tx) => {
      if (!holdings[tx.tokenSymbol]) {
        holdings[tx.tokenSymbol] = { amount: 0, totalCost: 0 };
      }

      // Check if tokenAmount is already in human-readable format
      // If it's a very large number (> 1e15), it's likely in wei format
      const isWeiFormat = tx.tokenAmount > 1e15;
      const humanReadableAmount = isWeiFormat
        ? tx.tokenAmount / Math.pow(10, tokenDecimals[tx.tokenSymbol] || 18)
        : tx.tokenAmount;

      if (tx.action === "deposit" || tx.action === "buy") {
        holdings[tx.tokenSymbol].amount += humanReadableAmount;
        holdings[tx.tokenSymbol].totalCost += tx.usdValue;
      } else if (tx.action === "withdraw" || tx.action === "sell") {
        holdings[tx.tokenSymbol].amount -= humanReadableAmount;
        holdings[tx.tokenSymbol].totalCost -= tx.usdValue;
      }
    });

    const tokenHoldings: TokenHolding[] = Object.entries(holdings)
      .filter(([_, data]) => data.amount > 0)
      .map(([symbol, data]) => ({
        symbol,
        amount: data.amount,
        value: data.totalCost,
        avgPrice: data.amount > 0 ? data.totalCost / data.amount : 0,
      }));

    res.status(200).json({
      metrics,
      tokenHoldings,
      transactions: transactions.slice(-10), // Last 10 transactions
    });
  } catch (err) {
    console.error("Failed to get portfolio overview:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

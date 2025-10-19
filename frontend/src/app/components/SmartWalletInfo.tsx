"use client";

import { useState, useEffect } from "react";
import { useBalance } from "wagmi";
import { formatUnits } from "viem";

interface SmartWalletInfoProps {
  smartWallet: string;
  onOpenDepositModal: () => void;
  onOpenWithdrawModal: () => void;
  onOpenTradingModal?: () => void;
}

interface SmartWalletTransaction {
  _id: string;
  smartWalletAddress: string;
  tokenSymbol: string;
  tokenAmount: number;
  tokenPrice: number;
  action: "deposit" | "withdraw" | "buy" | "sell";
  usdValue: number;
  txHash: string;
  timestamp: number;
  status: string;
  metadata: {
    source: string;
    signalId?: string;
  };
}

export function SmartWalletInfo({
  smartWallet,
  onOpenDepositModal,
  onOpenWithdrawModal,
  onOpenTradingModal,
}: SmartWalletInfoProps) {
  const [balance, setBalance] = useState<string>("0");
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<SmartWalletTransaction[]>(
    []
  );
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [showTransactions, setShowTransactions] = useState(false);

  // Get USDC balance for the smart wallet
  const { data: usdcBalance } = useBalance({
    address: smartWallet as `0x${string}`,
    token: process.env.NEXT_PUBLIC_USDC_ADDRESS_MONAD as `0x${string}`,
  });

  useEffect(() => {
    if (usdcBalance) {
      setBalance(formatUnits(usdcBalance.value, usdcBalance.decimals));
      setLoading(false);
    }
  }, [usdcBalance]);

  const fetchTransactions = async () => {
    try {
      setTransactionsLoading(true);
      const response = await fetch(
        `/api/smart-wallet/transactions?smartWalletAddress=${smartWallet}`
      );
      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
      }
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    } finally {
      setTransactionsLoading(false);
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const formatAmount = (amount: number, symbol: string) => {
    return `${amount.toFixed(6)} ${symbol}`;
  };

  const formatUSDValue = (value: number) => {
    return `$${value.toFixed(2)}`;
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "deposit":
        return "text-green-400";
      case "withdraw":
        return "text-red-400";
      case "buy":
        return "text-blue-400";
      case "sell":
        return "text-orange-400";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div className="mt-6 p-6 bg-dark-700 border border-dark-600 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">
          Smart Wallet Details
        </h3>
        <div className="flex gap-2">
          <button
            onClick={onOpenDepositModal}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            Deposit
          </button>
          <button
            onClick={onOpenWithdrawModal}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            Withdraw
          </button>
          {onOpenTradingModal && (
            <button
              onClick={onOpenTradingModal}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              Trade
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Address:</span>
              <span className="font-mono text-sm text-white break-all">
                {smartWallet}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-400">USDC Balance:</span>
              {loading ? (
                <div className="animate-pulse bg-gray-600 h-4 w-16 rounded"></div>
              ) : (
                <span className="font-medium text-white">{balance} USDC</span>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Network:</span>
              <span className="text-white">Monad Testnet</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-400">Status:</span>
              <span className="text-green-400">Active</span>
            </div>
          </div>
        </div>

        <div className="border-t border-dark-600 pt-4">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-md font-medium text-white">
              Recent Transactions
            </h4>
            <button
              onClick={() => {
                setShowTransactions(!showTransactions);
                if (!showTransactions && transactions.length === 0) {
                  fetchTransactions();
                }
              }}
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              {showTransactions ? "Hide" : "Show"} Transactions
            </button>
          </div>

          {showTransactions && (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {transactionsLoading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-4 text-gray-400">
                  No transactions found
                </div>
              ) : (
                transactions.map((tx) => (
                  <div
                    key={tx._id}
                    className="flex justify-between items-center p-3 bg-dark-800 rounded-lg border border-dark-600"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-medium ${getActionColor(tx.action)}`}
                        >
                          {tx.action.toUpperCase()}
                        </span>
                        <span className="text-white">
                          {formatAmount(tx.tokenAmount, tx.tokenSymbol)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-400">
                        {formatTimestamp(tx.timestamp)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-medium">
                        {formatUSDValue(tx.usdValue)}
                      </div>
                      <div className="text-xs text-gray-400 font-mono">
                        {tx.txHash.slice(0, 8)}...{tx.txHash.slice(-6)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

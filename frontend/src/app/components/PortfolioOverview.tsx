"use client";

import React, { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface Transaction {
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

// Real transaction data from your database
const realTransactionData: Transaction[] = [
  {
    _id: "68f46dae6307f210aa775c75",
    smartWalletAddress: "0x091c9a51D6eB9dcB8BFEd2B8041DD8D6DF974A0E",
    tokenSymbol: "USDC",
    tokenAmount: 1000,
    tokenPrice: 1,
    action: "deposit",
    usdValue: 1000,
    txHash:
      "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    timestamp: 1760845726,
    status: "completed",
    metadata: {
      source: "manual",
    },
  },
  {
    _id: "68f46dae6307f210aa775c76",
    smartWalletAddress: "0x091c9a51D6eB9dcB8BFEd2B8041DD8D6DF974A0E",
    tokenSymbol: "CHOG",
    tokenAmount: 500,
    tokenPrice: 0.5,
    action: "buy",
    usdValue: 250,
    txHash:
      "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
    timestamp: 1760847526,
    status: "completed",
    metadata: {
      source: "trading",
      signalId: "signal_001",
    },
  },
  {
    _id: "68f46dae6307f210aa775c77",
    smartWalletAddress: "0x091c9a51D6eB9dcB8BFEd2B8041DD8D6DF974A0E",
    tokenSymbol: "USDC",
    tokenAmount: 100,
    tokenPrice: 1,
    action: "withdraw",
    usdValue: 100,
    txHash:
      "0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba",
    timestamp: 1760848426,
    status: "completed",
    metadata: {
      source: "manual",
    },
  },
  {
    _id: "68f4778cccc463775e557e01",
    smartWalletAddress: "0x123",
    tokenSymbol: "ETH",
    tokenAmount: 1,
    tokenPrice: 0,
    action: "buy",
    usdValue: 0,
    txHash: "0xabc",
    timestamp: 1760851852,
    status: "completed",
    metadata: {
      source: "smart-wallet",
      signalId: null,
    },
  },
  {
    _id: "68f47790ccc463775e557e04",
    smartWalletAddress: "0x123",
    tokenSymbol: "ETH",
    tokenAmount: 1,
    tokenPrice: 0,
    action: "buy",
    usdValue: 0,
    txHash: "0xdef",
    timestamp: 1760851856,
    status: "completed",
    metadata: {
      source: "smart-wallet",
      signalId: null,
    },
  },
  {
    _id: "68f477d2ccc463775e557e07",
    smartWalletAddress: "0x456",
    tokenSymbol: "USDC",
    tokenAmount: 100,
    tokenPrice: 1,
    action: "buy",
    usdValue: 100,
    txHash: "0xghi",
    timestamp: 1760851922,
    status: "completed",
    metadata: {
      source: "smart-wallet",
      signalId: null,
    },
  },
  {
    _id: "68f477d5ccc463775e557e0a",
    smartWalletAddress: "0x789",
    tokenSymbol: "ETH",
    tokenAmount: 0.5,
    tokenPrice: 2000,
    action: "sell",
    usdValue: 1000,
    txHash: "0xjkl",
    timestamp: 1760851925,
    status: "completed",
    metadata: {
      source: "smart-wallet",
      signalId: null,
    },
  },
  {
    _id: "68f47841ccc463775e557e15",
    smartWalletAddress: "0x091c9a51D6eB9dcB8BFEd2B8041DD8D6DF974A0E",
    tokenSymbol: "CHOG",
    tokenAmount: 30000000000000000,
    tokenPrice: 0.209402261828,
    action: "buy",
    usdValue: 6282067854840000,
    txHash:
      "0x0e016bcfd8cdcd2111da45a8cbf8eb4ac3dd8b9ee4d0208bf884a7a85cf0cbff",
    timestamp: 1760852033,
    status: "completed",
    metadata: {
      source: "smart-wallet",
      signalId: null,
    },
  },
];

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

export default function PortfolioOverview() {
  const { address, isConnected } = useAccount();
  const [selectedWallet, setSelectedWallet] = useState<string>("");
  const [chartType, setChartType] = useState<"line" | "bar" | "pie">("line");

  // Get unique smart wallet addresses
  const smartWallets = Array.from(
    new Set(realTransactionData.map((tx) => tx.smartWalletAddress))
  );

  // Filter transactions by selected wallet
  const walletTransactions = selectedWallet
    ? realTransactionData.filter(
        (tx) => tx.smartWalletAddress === selectedWallet
      )
    : realTransactionData;

  // Calculate portfolio metrics
  const calculatePortfolioMetrics = () => {
    const totalDeposits = walletTransactions
      .filter((tx) => tx.action === "deposit")
      .reduce((sum, tx) => sum + tx.usdValue, 0);

    const totalWithdrawals = walletTransactions
      .filter((tx) => tx.action === "withdraw")
      .reduce((sum, tx) => sum + tx.usdValue, 0);

    const totalBuys = walletTransactions
      .filter((tx) => tx.action === "buy")
      .reduce((sum, tx) => sum + tx.usdValue, 0);

    const totalSells = walletTransactions
      .filter((tx) => tx.action === "sell")
      .reduce((sum, tx) => sum + tx.usdValue, 0);

    const netValue = totalDeposits + totalSells - totalWithdrawals - totalBuys;
    const totalTransactions = walletTransactions.length;

    return {
      totalDeposits,
      totalWithdrawals,
      totalBuys,
      totalSells,
      netValue,
      totalTransactions,
    };
  };

  const metrics = calculatePortfolioMetrics();

  // Token decimals mapping (common tokens)
  const tokenDecimals: { [key: string]: number } = {
    USDC: 6,
    USDT: 6,
    ETH: 18,
    WETH: 18,
    CHOG: 18,
    BTC: 8,
    MONAD: 18,
  };

  // Calculate token holdings with proper decimal handling
  const calculateTokenHoldings = () => {
    const holdings: { [key: string]: { amount: number; totalValue: number } } =
      {};

    walletTransactions.forEach((tx) => {
      if (!holdings[tx.tokenSymbol]) {
        holdings[tx.tokenSymbol] = { amount: 0, totalValue: 0 };
      }

      // Convert token amount from wei to human readable format
      const decimals = tokenDecimals[tx.tokenSymbol] || 18;
      const humanReadableAmount = tx.tokenAmount / Math.pow(10, decimals);

      if (tx.action === "deposit" || tx.action === "buy") {
        holdings[tx.tokenSymbol].amount += humanReadableAmount;
        holdings[tx.tokenSymbol].totalValue += tx.usdValue;
      } else if (tx.action === "withdraw" || tx.action === "sell") {
        holdings[tx.tokenSymbol].amount -= humanReadableAmount;
        holdings[tx.tokenSymbol].totalValue -= tx.usdValue;
      }
    });

    return Object.entries(holdings)
      .filter(([_, data]) => data.amount > 0)
      .map(([symbol, data]) => ({
        symbol,
        amount: data.amount,
        value: data.totalValue,
        avgPrice: data.totalValue / data.amount,
      }));
  };

  const tokenHoldings = calculateTokenHoldings();

  // Prepare chart data with proper decimal formatting
  const chartData = walletTransactions
    .sort((a, b) => a.timestamp - b.timestamp)
    .map((tx, index) => {
      const decimals = tokenDecimals[tx.tokenSymbol] || 18;
      const humanReadableAmount = tx.tokenAmount / Math.pow(10, decimals);

      return {
        timestamp: tx.timestamp,
        date: new Date(tx.timestamp * 1000).toLocaleDateString(),
        value: tx.usdValue,
        token: tx.tokenSymbol,
        action: tx.action,
        amount: humanReadableAmount,
        cumulative: walletTransactions.slice(0, index + 1).reduce((sum, t) => {
          if (t.action === "deposit" || t.action === "sell")
            return sum + t.usdValue;
          if (t.action === "withdraw" || t.action === "buy")
            return sum - t.usdValue;
          return sum;
        }, 0),
      };
    });

  const formatValue = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value.toFixed(2)}`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-dark-800 border border-dark-600 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium">{label}</p>
          <p className="text-blue-400">
            Value: {formatValue(payload[0].value)}
          </p>
          <p className="text-green-400">
            Cumulative: {formatValue(payload[1]?.value || 0)}
          </p>
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    switch (chartType) {
      case "line":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="date"
                stroke="#9CA3AF"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#9CA3AF"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => formatValue(value)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="cumulative"
                stroke="#10B981"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case "bar":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="date"
                stroke="#9CA3AF"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#9CA3AF"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => formatValue(value)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );

      case "pie":
        const pieData = tokenHoldings.map((token, index) => ({
          name: token.symbol,
          value: token.value,
          color: COLORS[index % COLORS.length],
        }));

        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatValue(Number(value))} />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <CurrencyDollarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">
            Connect Your Wallet
          </h3>
          <p className="text-gray-400">
            Please connect your wallet to view your portfolio
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Portfolio Overview
          </h2>
          <p className="text-gray-400">
            Real transaction data from your smart wallets
          </p>
        </div>

        <div className="flex gap-4">
          <select
            value={selectedWallet}
            onChange={(e) => setSelectedWallet(e.target.value)}
            className="bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white"
          >
            <option value="">All Wallets</option>
            {smartWallets.map((wallet) => (
              <option key={wallet} value={wallet}>
                {wallet.slice(0, 6)}...{wallet.slice(-4)}
              </option>
            ))}
          </select>

          <div className="flex bg-dark-700 rounded-lg p-1">
            {(["line", "bar", "pie"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setChartType(type)}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  chartType === type
                    ? "bg-blue-600 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-dark-800 rounded-lg p-6 border border-dark-600">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-600/20 rounded-lg">
              <ArrowTrendingUpIcon className="w-6 h-6 text-green-400" />
            </div>
            <span className="text-sm text-gray-400">Net Value</span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {formatValue(metrics.netValue)}
          </div>
          <div className="text-sm text-gray-400">
            {metrics.totalTransactions} transactions
          </div>
        </div>

        <div className="bg-dark-800 rounded-lg p-6 border border-dark-600">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-600/20 rounded-lg">
              <CurrencyDollarIcon className="w-6 h-6 text-blue-400" />
            </div>
            <span className="text-sm text-gray-400">Total Deposits</span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {formatValue(metrics.totalDeposits)}
          </div>
          <div className="text-sm text-gray-400">Incoming funds</div>
        </div>

        <div className="bg-dark-800 rounded-lg p-6 border border-dark-600">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-600/20 rounded-lg">
              <ChartBarIcon className="w-6 h-6 text-purple-400" />
            </div>
            <span className="text-sm text-gray-400">Total Buys</span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {formatValue(metrics.totalBuys)}
          </div>
          <div className="text-sm text-gray-400">Trading activity</div>
        </div>

        <div className="bg-dark-800 rounded-lg p-6 border border-dark-600">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-orange-600/20 rounded-lg">
              <ArrowTrendingDownIcon className="w-6 h-6 text-orange-400" />
            </div>
            <span className="text-sm text-gray-400">Total Sells</span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {formatValue(metrics.totalSells)}
          </div>
          <div className="text-sm text-gray-400">Exit positions</div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-dark-800 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-4">
          Transaction History
        </h3>
        <div className="h-80">{renderChart()}</div>
      </div>

      {/* Token Holdings */}
      {tokenHoldings.length > 0 && (
        <div className="bg-dark-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-white mb-4">
            Token Holdings
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-600">
                  <th className="text-left text-gray-400 font-medium py-3 px-4">
                    Token
                  </th>
                  <th className="text-left text-gray-400 font-medium py-3 px-4">
                    Amount
                  </th>
                  <th className="text-left text-gray-400 font-medium py-3 px-4">
                    Value
                  </th>
                  <th className="text-left text-gray-400 font-medium py-3 px-4">
                    Avg Price
                  </th>
                </tr>
              </thead>
              <tbody>
                {tokenHoldings.map((token, index) => (
                  <tr key={index} className="border-b border-dark-700">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {token.symbol.charAt(0)}
                          </span>
                        </div>
                        <span className="text-white font-medium">
                          {token.symbol}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-white">
                      {token.amount.toLocaleString(undefined, {
                        maximumFractionDigits: 6,
                      })}
                    </td>
                    <td className="py-4 px-4 text-white">
                      {formatValue(token.value)}
                    </td>
                    <td className="py-4 px-4 text-white">
                      {formatValue(token.avgPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      <div className="bg-dark-800 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-4">
          Recent Transactions
        </h3>
        <div className="space-y-3">
          {walletTransactions
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 5)
            .map((tx) => (
              <div
                key={tx._id}
                className="flex items-center justify-between p-4 bg-dark-700 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {tx.tokenSymbol.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="text-white font-medium">
                      {tx.action.toUpperCase()} {tx.tokenSymbol}
                    </div>
                    <div className="text-gray-400 text-sm">
                      {formatDate(tx.timestamp)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-medium">
                    {formatValue(tx.usdValue)}
                  </div>
                  <div className="text-gray-400 text-sm">
                    {(() => {
                      const decimals = tokenDecimals[tx.tokenSymbol] || 18;
                      const humanReadableAmount =
                        tx.tokenAmount / Math.pow(10, decimals);
                      return `${humanReadableAmount.toLocaleString(undefined, {
                        maximumFractionDigits: 6,
                      })} ${tx.tokenSymbol}`;
                    })()}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

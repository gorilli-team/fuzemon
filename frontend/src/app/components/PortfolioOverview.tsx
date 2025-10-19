"use client";

import React, { useState } from "react";
import { useAccount } from "wagmi";
import { usePortfolio } from "../hooks/usePortfolio";
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

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

export default function PortfolioOverview() {
  const { address, isConnected } = useAccount();
  const [selectedWallet, setSelectedWallet] = useState<string>("");
  const [chartType, setChartType] = useState<"line" | "bar" | "pie">("line");

  // Use the portfolio hook to fetch real data from backend
  const {
    transactions: walletTransactions,
    metrics,
    tokenHoldings,
    smartWallets,
    loading,
    error,
  } = usePortfolio(selectedWallet);

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Loading Portfolio Data
          </h3>
          <p className="text-gray-400">
            Fetching your transaction history from the database
          </p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Error Loading Portfolio
          </h3>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Token decimals mapping for chart display
  const tokenDecimals: { [key: string]: number } = {
    USDC: 6,
    USDT: 6,
    ETH: 18,
    WETH: 18,
    CHOG: 18,
    BTC: 8,
    MONAD: 18,
  };

  // Prepare chart data with proper decimal formatting
  const chartData = walletTransactions
    .sort((a, b) => a.timestamp - b.timestamp)
    .map((tx, index) => {
      // Check if tokenAmount is already in human-readable format
      // If it's a very large number (> 1e15), it's likely in wei format
      const isWeiFormat = tx.tokenAmount > 1e15;
      const humanReadableAmount = isWeiFormat
        ? tx.tokenAmount / Math.pow(10, tokenDecimals[tx.tokenSymbol] || 18)
        : tx.tokenAmount;

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
                tickFormatter={(value) => {
                  if (value >= 1000000) {
                    return `$${(value / 1000000).toFixed(1)}M`;
                  } else if (value >= 1000) {
                    return `$${(value / 1000).toFixed(1)}K`;
                  }
                  return `$${value.toFixed(0)}`;
                }}
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
                tickFormatter={(value) => {
                  if (value >= 1000000) {
                    return `$${(value / 1000000).toFixed(1)}M`;
                  } else if (value >= 1000) {
                    return `$${(value / 1000).toFixed(1)}K`;
                  }
                  return `$${value.toFixed(0)}`;
                }}
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
            {formatValue(metrics?.netValue || 0)}
          </div>
          <div className="text-sm text-gray-400">
            {metrics?.totalTransactions || 0} transactions
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
            {formatValue(metrics?.totalDeposits || 0)}
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
            {formatValue(metrics?.totalBuys || 0)}
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
            {formatValue(metrics?.totalSells || 0)}
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

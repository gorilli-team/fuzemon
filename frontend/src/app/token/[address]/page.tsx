"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import CandlestickChart from "@/app/components/CandlestickChart";
import { Time } from "lightweight-charts";
import pricesData from "../../../../data/prices_monad.json";

interface TokenData {
  name: string;
  symbol: string;
  address: string;
  imageUrl?: string;
  totalEvents: number;
  trackedSince: string;
  trackingTime: string;
}

interface PriceData {
  time: Time;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface MonadPriceData {
  timestamp: string;
  id: number;
  token_id: string;
  chain_id: number;
  currency: string;
  high: number;
  low: number;
  open: number;
  close: number;
  volume: number;
  created_at: string;
  updated_at: string;
}

interface PricePoints {
  current: number | null;
  oneHourAgo: number | null;
  sixHoursAgo: number | null;
  twentyFourHoursAgo: number | null;
  timestamps: {
    current: string | null;
    oneHourAgo: string | null;
    sixHoursAgo: string | null;
    twentyFourHoursAgo: string | null;
  };
}

interface CompletedTrade {
  _id: string;
  userAddress: string;
  tokenSymbol: string;
  tokenAmount: number;
  tokenPrice: number;
  action: string;
  usdValue: number;
  timestamp: number;
  status: string;
  txHash?: string;
}

export default function TokenPage() {
  const params = useParams();
  const tokenAddress = params.address as string;

  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<TokenData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [priceData, setPriceData] = useState<PriceData[]>([]);
  const [pricePoints, setPricePoints] = useState<PricePoints | null>(null);
  const [completedTrades, setCompletedTrades] = useState<CompletedTrade[]>([]);
  const [tradesLoading] = useState(false);

  // Get token data based on address
  const getTokenData = (address: string): TokenData => {
    const tokenMap: Record<string, TokenData> = {
      "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE": {
        name: "Monad",
        symbol: "MON",
        address: address,
        imageUrl:
          "https://imagedelivery.net/cBNDGgkrsEA-b_ixIp9SkQ/I_t8rg_V_400x400.jpg/public",
        totalEvents: 1250,
        trackedSince: "2024-01-15T10:30:00Z",
        trackingTime: "45 days",
      },
      "0x0000000000000000000000000000000000000000": {
        name: "Wrapped Ethereum",
        symbol: "WETH",
        address: address,
        imageUrl:
          "https://imagedelivery.net/tWwhAahBw7afBzFUrX5mYQ/27759359-9374-4995-341c-b2636a432800/public",
        totalEvents: 890,
        trackedSince: "2024-02-01T08:15:00Z",
        trackingTime: "30 days",
      },
      "0xE0590015A873bF326bd645c3E1266d4db41C4E6B": {
        name: "Chog",
        symbol: "CHOG",
        address: address,
        imageUrl:
          "https://imagedelivery.net/tWwhAahBw7afBzFUrX5mYQ/5d1206c2-042c-4edc-9f8b-dcef2e9e8f00/public",
        totalEvents: 2100,
        trackedSince: "2024-01-01T00:00:00Z",
        trackingTime: "60 days",
      },
    };

    return (
      tokenMap[address] || {
        name: "Unknown Token",
        symbol: "UNKNOWN",
        address: address,
        imageUrl: "/ethereum.png",
        totalEvents: 0,
        trackedSince: "2024-01-01T00:00:00Z",
        trackingTime: "0 days",
      }
    );
  };

  const mockTokenData = getTokenData(tokenAddress);

  // Process real price data for MON token
  const getRealPriceData = (symbol: string): PriceData[] => {
    if (symbol === "MON") {
      // Get the price data from the JSON file
      const priceDataKey = Object.keys(pricesData)[0];
      const monadPrices = (pricesData as Record<string, MonadPriceData[]>)[
        priceDataKey
      ];

      // Convert to chart format, taking the most recent 50 data points
      return monadPrices.slice(0, 50).map((price) => ({
        time: Math.floor(new Date(price.timestamp).getTime() / 1000) as Time,
        open: price.open,
        high: price.high,
        low: price.low,
        close: price.close,
      }));
    }

    // Fallback mock data for other tokens
    return [
      {
        time: 1704067200 as Time,
        open: 0.5,
        high: 0.52,
        low: 0.48,
        close: 0.51,
      },
      {
        time: 1704153600 as Time,
        open: 0.51,
        high: 0.54,
        low: 0.5,
        close: 0.53,
      },
      {
        time: 1704240000 as Time,
        open: 0.53,
        high: 0.55,
        low: 0.51,
        close: 0.52,
      },
      {
        time: 1704326400 as Time,
        open: 0.52,
        high: 0.56,
        low: 0.51,
        close: 0.55,
      },
      {
        time: 1704412800 as Time,
        open: 0.55,
        high: 0.58,
        low: 0.53,
        close: 0.57,
      },
      {
        time: 1704499200 as Time,
        open: 0.57,
        high: 0.59,
        low: 0.55,
        close: 0.58,
      },
      {
        time: 1704585600 as Time,
        open: 0.58,
        high: 0.61,
        low: 0.56,
        close: 0.59,
      },
      {
        time: 1704672000 as Time,
        open: 0.59,
        high: 0.62,
        low: 0.57,
        close: 0.6,
      },
    ];
  };

  const mockPriceData = getRealPriceData(mockTokenData.symbol);

  // Get price points based on token
  const getPricePoints = (symbol: string): PricePoints => {
    if (symbol === "MON") {
      // Get real price data from the JSON file
      const priceDataKey = Object.keys(pricesData)[0];
      const monadPrices = (pricesData as Record<string, MonadPriceData[]>)[
        priceDataKey
      ];

      if (monadPrices.length > 0) {
        const current = monadPrices[0].close;
        const oneHourAgo =
          monadPrices[Math.min(60, monadPrices.length - 1)].close;
        const sixHoursAgo =
          monadPrices[Math.min(360, monadPrices.length - 1)].close;
        const twentyFourHoursAgo =
          monadPrices[Math.min(1440, monadPrices.length - 1)].close;

        return {
          current,
          oneHourAgo,
          sixHoursAgo,
          twentyFourHoursAgo,
          timestamps: {
            current: monadPrices[0].timestamp,
            oneHourAgo:
              monadPrices[Math.min(60, monadPrices.length - 1)].timestamp,
            sixHoursAgo:
              monadPrices[Math.min(360, monadPrices.length - 1)].timestamp,
            twentyFourHoursAgo:
              monadPrices[Math.min(1440, monadPrices.length - 1)].timestamp,
          },
        };
      }
    }

    const priceMap: Record<string, PricePoints> = {
      MON: {
        current: 0.6,
        oneHourAgo: 0.59,
        sixHoursAgo: 0.58,
        twentyFourHoursAgo: 0.55,
        timestamps: {
          current: new Date().toISOString(),
          oneHourAgo: new Date(Date.now() - 3600000).toISOString(),
          sixHoursAgo: new Date(Date.now() - 21600000).toISOString(),
          twentyFourHoursAgo: new Date(Date.now() - 86400000).toISOString(),
        },
      },
      WETH: {
        current: 1.25,
        oneHourAgo: 1.24,
        sixHoursAgo: 1.23,
        twentyFourHoursAgo: 1.2,
        timestamps: {
          current: new Date().toISOString(),
          oneHourAgo: new Date(Date.now() - 3600000).toISOString(),
          sixHoursAgo: new Date(Date.now() - 21600000).toISOString(),
          twentyFourHoursAgo: new Date(Date.now() - 86400000).toISOString(),
        },
      },
      CHOG: {
        current: 0.85,
        oneHourAgo: 0.84,
        sixHoursAgo: 0.82,
        twentyFourHoursAgo: 0.8,
        timestamps: {
          current: new Date().toISOString(),
          oneHourAgo: new Date(Date.now() - 3600000).toISOString(),
          sixHoursAgo: new Date(Date.now() - 21600000).toISOString(),
          twentyFourHoursAgo: new Date(Date.now() - 86400000).toISOString(),
        },
      },
    };

    return (
      priceMap[symbol] || {
        current: 0.5,
        oneHourAgo: 0.49,
        sixHoursAgo: 0.48,
        twentyFourHoursAgo: 0.45,
        timestamps: {
          current: new Date().toISOString(),
          oneHourAgo: new Date(Date.now() - 3600000).toISOString(),
          sixHoursAgo: new Date(Date.now() - 21600000).toISOString(),
          twentyFourHoursAgo: new Date(Date.now() - 86400000).toISOString(),
        },
      }
    );
  };

  const mockPricePoints = getPricePoints(mockTokenData.symbol);

  // Mock completed trades based on token
  const getCompletedTrades = (symbol: string): CompletedTrade[] => {
    const tradesMap: Record<string, CompletedTrade[]> = {
      MON: [
        {
          _id: "1",
          userAddress: "0x1234...5678",
          tokenSymbol: "MON",
          tokenAmount: 1000,
          tokenPrice: 0.58,
          action: "BUY",
          usdValue: 580,
          timestamp: Date.now() - 3600000,
          status: "completed",
          txHash: "0xabcd...efgh",
        },
        {
          _id: "2",
          userAddress: "0x9876...5432",
          tokenSymbol: "MON",
          tokenAmount: 500,
          tokenPrice: 0.59,
          action: "SELL",
          usdValue: 295,
          timestamp: Date.now() - 7200000,
          status: "completed",
          txHash: "0xijkl...mnop",
        },
      ],
      WETH: [
        {
          _id: "1",
          userAddress: "0x1234...5678",
          tokenSymbol: "WETH",
          tokenAmount: 100,
          tokenPrice: 1.24,
          action: "BUY",
          usdValue: 124,
          timestamp: Date.now() - 3600000,
          status: "completed",
          txHash: "0xabcd...efgh",
        },
        {
          _id: "2",
          userAddress: "0x9876...5432",
          tokenSymbol: "WETH",
          tokenAmount: 50,
          tokenPrice: 1.25,
          action: "SELL",
          usdValue: 62.5,
          timestamp: Date.now() - 7200000,
          status: "completed",
          txHash: "0xijkl...mnop",
        },
      ],
      CHOG: [
        {
          _id: "1",
          userAddress: "0x1234...5678",
          tokenSymbol: "CHOG",
          tokenAmount: 2000,
          tokenPrice: 0.84,
          action: "BUY",
          usdValue: 1680,
          timestamp: Date.now() - 3600000,
          status: "completed",
          txHash: "0xabcd...efgh",
        },
        {
          _id: "2",
          userAddress: "0x9876...5432",
          tokenSymbol: "CHOG",
          tokenAmount: 1000,
          tokenPrice: 0.85,
          action: "SELL",
          usdValue: 850,
          timestamp: Date.now() - 7200000,
          status: "completed",
          txHash: "0xijkl...mnop",
        },
      ],
    };

    return tradesMap[symbol] || [];
  };

  const mockCompletedTrades = getCompletedTrades(mockTokenData.symbol);

  useEffect(() => {
    const fetchTokenInfo = async () => {
      try {
        setIsLoading(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        setToken(mockTokenData);
        setPriceData(mockPriceData);
        setPricePoints(mockPricePoints);
        setCompletedTrades(mockCompletedTrades);
      } catch (error) {
        console.error("Error fetching token info:", error);
        setError("Failed to load token information");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTokenInfo();
  }, [
    tokenAddress,
    mockTokenData,
    mockPriceData,
    mockPricePoints,
    mockCompletedTrades,
  ]);

  const getTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diffInSeconds = Math.floor((now - timestamp) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const getActionColor = (action: string) => {
    return action === "BUY" ? "text-green-500" : "text-red-500";
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white text-xl">Loading token information...</div>
      </div>
    );
  }

  if (error || !token) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-red-500 text-xl">{error || "Token not found"}</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            {token.imageUrl && (
              <Image
                src={token.imageUrl}
                alt={token.symbol}
                width={48}
                height={48}
                className="w-12 h-12 rounded-full"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold text-white">{token.name}</h1>
              <p className="text-dark-400">{token.symbol}</p>
            </div>
          </div>
          <p className="text-dark-400 text-sm">Address: {token.address}</p>
        </div>

        {/* Token Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-dark-800 rounded-lg p-4">
            <div className="text-dark-400 text-sm">Total Events</div>
            <div className="text-white text-2xl font-bold">
              {token.totalEvents.toLocaleString()}
            </div>
          </div>
          <div className="bg-dark-800 rounded-lg p-4">
            <div className="text-dark-400 text-sm">Tracked Since</div>
            <div className="text-white text-lg">
              {new Date(token.trackedSince).toLocaleDateString()}
            </div>
          </div>
          <div className="bg-dark-800 rounded-lg p-4">
            <div className="text-dark-400 text-sm">Tracking Time</div>
            <div className="text-white text-lg">{token.trackingTime}</div>
          </div>
          <div className="bg-dark-800 rounded-lg p-4">
            <div className="text-dark-400 text-sm">Current Price</div>
            <div className="text-white text-2xl font-bold">
              ${pricePoints?.current?.toFixed(6) || "N/A"}
            </div>
          </div>
        </div>

        {/* Price Chart Section */}
        <div className="bg-dark-800 rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
            <h2 className="text-xl font-semibold text-white mb-4 md:mb-0">
              Price Chart
            </h2>

            {/* Price Points */}
            <div className="flex flex-wrap gap-4 text-sm">
              {pricePoints?.current && pricePoints?.oneHourAgo && (
                <div
                  className={`${
                    pricePoints.current >= pricePoints.oneHourAgo
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  1h:{" "}
                  {pricePoints.current >= pricePoints.oneHourAgo ? "▲" : "▼"}{" "}
                  {(
                    ((pricePoints.current - pricePoints.oneHourAgo) /
                      pricePoints.oneHourAgo) *
                    100
                  ).toFixed(2)}
                  %
                </div>
              )}
              {pricePoints?.current && pricePoints?.sixHoursAgo && (
                <div
                  className={`${
                    pricePoints.current >= pricePoints.sixHoursAgo
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  6h:{" "}
                  {pricePoints.current >= pricePoints.sixHoursAgo ? "▲" : "▼"}{" "}
                  {(
                    ((pricePoints.current - pricePoints.sixHoursAgo) /
                      pricePoints.sixHoursAgo) *
                    100
                  ).toFixed(2)}
                  %
                </div>
              )}
              {pricePoints?.current && pricePoints?.twentyFourHoursAgo && (
                <div
                  className={`${
                    pricePoints.current >= pricePoints.twentyFourHoursAgo
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  24h:{" "}
                  {pricePoints.current >= pricePoints.twentyFourHoursAgo
                    ? "▲"
                    : "▼"}{" "}
                  {(
                    ((pricePoints.current - pricePoints.twentyFourHoursAgo) /
                      pricePoints.twentyFourHoursAgo) *
                    100
                  ).toFixed(2)}
                  %
                </div>
              )}
            </div>
          </div>

          {/* Chart */}
          <div className="h-80">
            <CandlestickChart
              data={priceData}
              tokenSymbol={token.symbol}
              signals={[]}
            />
          </div>
        </div>

        {/* Completed Trades Section */}
        <div className="bg-dark-800 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Recent Trades
          </h2>
          {tradesLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dark-600"></div>
            </div>
          ) : completedTrades.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-dark-400 text-sm">No trades found</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-600">
                    <th className="text-left py-3 px-4 font-medium text-white">
                      USER ADDRESS
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-white">
                      ACTION
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-white">
                      AMOUNT
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-white">
                      PRICE
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-white">
                      TOTAL VALUE
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-white">
                      DATE
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {completedTrades.map((trade) => (
                    <tr
                      key={trade._id}
                      className="border-b border-dark-700 hover:bg-dark-700"
                    >
                      <td className="py-3 px-4 text-dark-300">
                        {formatAddress(trade.userAddress)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`font-medium ${getActionColor(
                            trade.action
                          )}`}
                        >
                          {trade.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-dark-300">
                        {trade.tokenAmount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-dark-300">
                        ${trade.tokenPrice.toFixed(6)}
                      </td>
                      <td className="py-3 px-4 text-dark-300">
                        ${trade.usdValue.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-dark-300">
                        {getTimeAgo(trade.timestamp)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

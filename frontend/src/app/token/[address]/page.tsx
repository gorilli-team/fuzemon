"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import CandlestickChart from "@/app/components/CandlestickChart";
import { Time } from "lightweight-charts";
import monadPricesData from "../../../../data/prices_monad.json";
import wethPricesData from "../../../../data/prices_weth.json";
import chogPricesData from "../../../../data/prices_chog.json";

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

interface Signal {
  action: string;
  price: number;
  timestamp: string;
  symbol: string;
  confidence: number;
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
  const [signals, setSignals] = useState<Signal[]>([]);
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

  const mockTokenData = useMemo(
    () => getTokenData(tokenAddress),
    [tokenAddress]
  );

  // Process real price data for all tokens
  const getRealPriceData = (symbol: string): PriceData[] => {
    // Get the appropriate price data based on token symbol
    let pricesData: Record<string, MonadPriceData[]>;

    switch (symbol) {
      case "MON":
        pricesData = monadPricesData as Record<string, MonadPriceData[]>;
        break;
      case "WETH":
        pricesData = wethPricesData as Record<string, MonadPriceData[]>;
        break;
      case "CHOG":
        pricesData = chogPricesData as Record<string, MonadPriceData[]>;
        break;
      default:
        return [];
    }

    if (pricesData) {
      // Get the first (and only) key which contains the price data
      const priceDataKey = Object.keys(pricesData)[0];
      const monadPrices = pricesData[priceDataKey];

      // Create proper candlestick data by aggregating time periods
      const candlestickData: MonadPriceData[] = [];
      const threeHoursInMs = 3 * 60 * 60 * 1000; // 3 hours in milliseconds

      // Group data by 3-hour time windows to create meaningful candlesticks
      const timeGroups = new Map<string, MonadPriceData[]>();

      monadPrices.forEach((price) => {
        const timestamp = new Date(price.timestamp).getTime();
        // Round down to the nearest 3-hour window
        const windowStart =
          Math.floor(timestamp / threeHoursInMs) * threeHoursInMs;
        const windowKey = new Date(windowStart).toISOString();

        if (!timeGroups.has(windowKey)) {
          timeGroups.set(windowKey, []);
        }
        timeGroups.get(windowKey)!.push(price);
      });

      // Convert each time group into a proper candlestick
      timeGroups.forEach((groupPrices, windowKey) => {
        if (groupPrices.length > 0) {
          // Sort by timestamp to get proper order
          groupPrices.sort(
            (a, b) =>
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );

          // Calculate OHLC for this time period
          const open = groupPrices[0].open;
          const close = groupPrices[groupPrices.length - 1].close;
          const high = Math.max(...groupPrices.map((p) => p.high));
          const low = Math.min(...groupPrices.map((p) => p.low));
          const volume = groupPrices.reduce((sum, p) => sum + p.volume, 0);

          // Use the first timestamp as the representative time for this candlestick
          const candlestick: MonadPriceData = {
            ...groupPrices[0],
            open,
            high,
            low,
            close,
            volume,
            timestamp: windowKey,
          };

          candlestickData.push(candlestick);
        }
      });

      // Sort by timestamp (newest first, like the original data)
      candlestickData.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      // Convert to chart format, using the aggregated candlestick data
      const chartData = candlestickData.map((price) => ({
        time: Math.floor(new Date(price.timestamp).getTime() / 1000) as Time,
        open: price.open,
        high: price.high,
        low: price.low,
        close: price.close,
      }));

      // Debug logging to understand the data
      console.log("Chart data points:", chartData.length);
      console.log("Price range:", {
        min: Math.min(...chartData.map((d) => d.close)),
        max: Math.max(...chartData.map((d) => d.close)),
        first: chartData[0]?.close,
        last: chartData[chartData.length - 1]?.close,
      });

      return chartData;
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

  const mockPriceData = useMemo(
    () => getRealPriceData(mockTokenData.symbol),
    [mockTokenData.symbol]
  );

  // Get price points based on token
  const getPricePoints = (symbol: string): PricePoints => {
    // Get the appropriate price data based on token symbol
    let pricesData: Record<string, MonadPriceData[]>;

    switch (symbol) {
      case "MON":
        pricesData = monadPricesData as Record<string, MonadPriceData[]>;
        break;
      case "WETH":
        pricesData = wethPricesData as Record<string, MonadPriceData[]>;
        break;
      case "CHOG":
        pricesData = chogPricesData as Record<string, MonadPriceData[]>;
        break;
      default:
        return {
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
        };
    }

    if (pricesData) {
      // Get the first (and only) key which contains the price data
      const priceDataKey = Object.keys(pricesData)[0];
      const monadPrices = pricesData[priceDataKey];

      if (monadPrices.length > 0) {
        // Create proper candlestick data by aggregating time periods
        const candlestickData: MonadPriceData[] = [];
        const threeHoursInMs = 3 * 60 * 60 * 1000; // 3 hours in milliseconds

        // Group data by 3-hour time windows to create meaningful candlesticks
        const timeGroups = new Map<string, MonadPriceData[]>();

        monadPrices.forEach((price) => {
          const timestamp = new Date(price.timestamp).getTime();
          // Round down to the nearest 3-hour window
          const windowStart =
            Math.floor(timestamp / threeHoursInMs) * threeHoursInMs;
          const windowKey = new Date(windowStart).toISOString();

          if (!timeGroups.has(windowKey)) {
            timeGroups.set(windowKey, []);
          }
          timeGroups.get(windowKey)!.push(price);
        });

        // Convert each time group into a proper candlestick
        timeGroups.forEach((groupPrices, windowKey) => {
          if (groupPrices.length > 0) {
            // Sort by timestamp to get proper order
            groupPrices.sort(
              (a, b) =>
                new Date(a.timestamp).getTime() -
                new Date(b.timestamp).getTime()
            );

            // Calculate OHLC for this time period
            const open = groupPrices[0].open;
            const close = groupPrices[groupPrices.length - 1].close;
            const high = Math.max(...groupPrices.map((p) => p.high));
            const low = Math.min(...groupPrices.map((p) => p.low));
            const volume = groupPrices.reduce((sum, p) => sum + p.volume, 0);

            // Use the first timestamp as the representative time for this candlestick
            const candlestick: MonadPriceData = {
              ...groupPrices[0],
              open,
              high,
              low,
              close,
              volume,
              timestamp: windowKey,
            };

            candlestickData.push(candlestick);
          }
        });

        // Sort by timestamp (newest first, like the original data)
        candlestickData.sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        if (candlestickData.length > 0) {
          // Use the most recent data point as current
          const current = candlestickData[0].close;

          // Calculate time-based comparisons using the full timeframe
          const now = Date.now() / 1000;
          const oneHourAgo = now - 3600;
          const sixHoursAgo = now - 3600 * 6;
          const twentyFourHoursAgo = now - 3600 * 24;

          // Find closest data points to these times
          let oneHourPrice = current;
          let sixHoursPrice = current;
          let twentyFourHoursPrice = current;
          let oneHourTimestamp = candlestickData[0].timestamp;
          let sixHoursTimestamp = candlestickData[0].timestamp;
          let twentyFourHoursTimestamp = candlestickData[0].timestamp;

          for (const dataPoint of candlestickData) {
            const dataTime = new Date(dataPoint.timestamp).getTime() / 1000;

            if (
              dataTime <= oneHourAgo &&
              Math.abs(dataTime - oneHourAgo) <
                Math.abs(
                  new Date(oneHourTimestamp).getTime() / 1000 - oneHourAgo
                )
            ) {
              oneHourPrice = dataPoint.close;
              oneHourTimestamp = dataPoint.timestamp;
            }
            if (
              dataTime <= sixHoursAgo &&
              Math.abs(dataTime - sixHoursAgo) <
                Math.abs(
                  new Date(sixHoursTimestamp).getTime() / 1000 - sixHoursAgo
                )
            ) {
              sixHoursPrice = dataPoint.close;
              sixHoursTimestamp = dataPoint.timestamp;
            }
            if (
              dataTime <= twentyFourHoursAgo &&
              Math.abs(dataTime - twentyFourHoursAgo) <
                Math.abs(
                  new Date(twentyFourHoursTimestamp).getTime() / 1000 -
                    twentyFourHoursAgo
                )
            ) {
              twentyFourHoursPrice = dataPoint.close;
              twentyFourHoursTimestamp = dataPoint.timestamp;
            }
          }

          return {
            current,
            oneHourAgo: oneHourPrice,
            sixHoursAgo: sixHoursPrice,
            twentyFourHoursAgo: twentyFourHoursPrice,
            timestamps: {
              current: candlestickData[0].timestamp,
              oneHourAgo: oneHourTimestamp,
              sixHoursAgo: sixHoursTimestamp,
              twentyFourHoursAgo: twentyFourHoursTimestamp,
            },
          };
        }
      }
    }

    const priceMap: Record<string, PricePoints> = {
      MON: {
        current: 3.79,
        oneHourAgo: 3.78,
        sixHoursAgo: 3.75,
        twentyFourHoursAgo: 3.22,
        timestamps: {
          current: new Date().toISOString(),
          oneHourAgo: new Date(Date.now() - 3600000).toISOString(),
          sixHoursAgo: new Date(Date.now() - 21600000).toISOString(),
          twentyFourHoursAgo: new Date(Date.now() - 86400000).toISOString(),
        },
      },
      WETH: {
        current: 3249.87,
        oneHourAgo: 3250.45,
        sixHoursAgo: 3248.3,
        twentyFourHoursAgo: 3245.12,
        timestamps: {
          current: new Date().toISOString(),
          oneHourAgo: new Date(Date.now() - 3600000).toISOString(),
          sixHoursAgo: new Date(Date.now() - 21600000).toISOString(),
          twentyFourHoursAgo: new Date(Date.now() - 86400000).toISOString(),
        },
      },
      CHOG: {
        current: 0.000124,
        oneHourAgo: 0.000125,
        sixHoursAgo: 0.000122,
        twentyFourHoursAgo: 0.000118,
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

  const mockPricePoints = useMemo(
    () => getPricePoints(mockTokenData.symbol),
    [mockTokenData.symbol]
  );

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

  // Generate signals based on price data
  const generateSignals = (symbol: string): Signal[] => {
    const signals: Signal[] = [];

    // Get the appropriate price data based on token symbol
    let pricesData: Record<string, MonadPriceData[]>;

    switch (symbol) {
      case "MON":
        pricesData = monadPricesData as Record<string, MonadPriceData[]>;
        break;
      case "WETH":
        pricesData = wethPricesData as Record<string, MonadPriceData[]>;
        break;
      case "CHOG":
        pricesData = chogPricesData as Record<string, MonadPriceData[]>;
        break;
      default:
        return [];
    }

    if (pricesData) {
      const priceDataKey = Object.keys(pricesData)[0];
      const monadPrices = pricesData[priceDataKey];

      if (monadPrices.length > 0) {
        // Create candlestick data for signal analysis
        const candlestickData: MonadPriceData[] = [];
        const threeHoursInMs = 3 * 60 * 60 * 1000; // 3 hours in milliseconds

        // Group data by 3-hour time windows
        const timeGroups = new Map<string, MonadPriceData[]>();

        monadPrices.forEach((price) => {
          const timestamp = new Date(price.timestamp).getTime();
          const windowStart =
            Math.floor(timestamp / threeHoursInMs) * threeHoursInMs;
          const windowKey = new Date(windowStart).toISOString();

          if (!timeGroups.has(windowKey)) {
            timeGroups.set(windowKey, []);
          }
          timeGroups.get(windowKey)!.push(price);
        });

        // Convert each time group into a proper candlestick
        timeGroups.forEach((groupPrices, windowKey) => {
          if (groupPrices.length > 0) {
            groupPrices.sort(
              (a, b) =>
                new Date(a.timestamp).getTime() -
                new Date(b.timestamp).getTime()
            );

            const open = groupPrices[0].open;
            const close = groupPrices[groupPrices.length - 1].close;
            const high = Math.max(...groupPrices.map((p) => p.high));
            const low = Math.min(...groupPrices.map((p) => p.low));
            const volume = groupPrices.reduce((sum, p) => sum + p.volume, 0);

            const candlestick: MonadPriceData = {
              ...groupPrices[0],
              open,
              high,
              low,
              close,
              volume,
              timestamp: windowKey,
            };

            candlestickData.push(candlestick);
          }
        });

        // Sort by timestamp (newest first)
        candlestickData.sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        // Generate signals based on price patterns
        for (let i = 2; i < candlestickData.length; i++) {
          const current = candlestickData[i];
          const previous = candlestickData[i - 1];

          // Bullish signal: Higher high and higher low
          if (
            current.high > previous.high &&
            current.low > previous.low &&
            current.close > current.open
          ) {
            signals.push({
              action: "BUY",
              price: current.close,
              timestamp: current.timestamp,
              symbol: symbol,
              confidence: Math.min(0.9, 0.6 + (current.volume / 1000000) * 0.3), // Volume-based confidence
            });
          }

          // Bearish signal: Lower high and lower low
          if (
            current.high < previous.high &&
            current.low < previous.low &&
            current.close < current.open
          ) {
            signals.push({
              action: "SELL",
              price: current.close,
              timestamp: current.timestamp,
              symbol: symbol,
              confidence: Math.min(0.9, 0.6 + (current.volume / 1000000) * 0.3),
            });
          }

          // Strong momentum signal: Significant price change with high volume
          const priceChange =
            Math.abs(current.close - previous.close) / previous.close;
          if (priceChange > 0.05 && current.volume > previous.volume * 1.5) {
            const action = current.close > previous.close ? "BUY" : "SELL";
            signals.push({
              action,
              price: current.close,
              timestamp: current.timestamp,
              symbol: symbol,
              confidence: Math.min(0.95, 0.7 + priceChange * 2),
            });
          }

          // Limit to last 10 signals to avoid too many
          if (signals.length >= 10) break;
        }
      }
    }

    return signals;
  };

  const mockCompletedTrades = useMemo(
    () => getCompletedTrades(mockTokenData.symbol),
    [mockTokenData.symbol]
  );

  const mockSignals = useMemo(
    () => generateSignals(mockTokenData.symbol),
    [mockTokenData.symbol]
  );

  useEffect(() => {
    const fetchTokenInfo = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Add timeout to prevent infinite loading
        const timeoutId = setTimeout(() => {
          setError("Loading timeout - please refresh the page");
          setIsLoading(false);
        }, 10000); // 10 second timeout

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        clearTimeout(timeoutId);
        setToken(mockTokenData);
        setPriceData(mockPriceData);
        setPricePoints(mockPricePoints);
        setCompletedTrades(mockCompletedTrades);
        setSignals(mockSignals);
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
    mockSignals,
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
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <div className="text-white text-xl">Loading token information...</div>
        </div>
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
              signals={signals}
            />
          </div>
        </div>

        {/* Signals Section */}
        <div className="bg-dark-800 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Trading Signals
          </h2>
          {signals.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-dark-400 text-sm">No signals available</div>
            </div>
          ) : (
            <div className="space-y-3">
              {signals.slice(0, 5).map((signal, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    signal.action === "BUY"
                      ? "border-green-500 bg-green-500/10"
                      : "border-red-500 bg-red-500/10"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        signal.action === "BUY" ? "bg-green-500" : "bg-red-500"
                      }`}
                    />
                    <div>
                      <div className="text-white font-medium">
                        {signal.action} {signal.symbol}
                      </div>
                      <div className="text-dark-400 text-sm">
                        {new Date(signal.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-medium">
                      ${signal.price.toFixed(6)}
                    </div>
                    <div className="text-dark-400 text-sm">
                      Confidence: {(signal.confidence * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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

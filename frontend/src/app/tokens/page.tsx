"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import pricesData from "../../../data/prices_monad.json";

interface TokenData {
  id: number;
  name: string;
  symbol: string;
  address: string;
  imageUrl?: string;
  totalEvents: number;
  trackedSince: string;
  trackingTime: string;
  currentPrice: number;
  priceChange24h: number;
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

// Get real price data for MON token
const getRealMonPrice = () => {
  const priceDataKey = Object.keys(pricesData)[0];
  const monadPrices = (pricesData as Record<string, MonadPriceData[]>)[
    priceDataKey
  ];

  if (monadPrices.length > 0) {
    const current = monadPrices[0].close;
    const twentyFourHoursAgo =
      monadPrices[Math.min(1440, monadPrices.length - 1)].close;
    const priceChange24h =
      ((current - twentyFourHoursAgo) / twentyFourHoursAgo) * 100;

    return {
      currentPrice: current,
      priceChange24h: priceChange24h,
    };
  }

  return {
    currentPrice: 0.6,
    priceChange24h: 5.8,
  };
};

const monPriceData = getRealMonPrice();

// Real tokens from Gorillionaire
const mockTokens: TokenData[] = [
  {
    id: 1,
    name: "Monad",
    symbol: "MON",
    address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    imageUrl:
      "https://imagedelivery.net/cBNDGgkrsEA-b_ixIp9SkQ/I_t8rg_V_400x400.jpg/public",
    totalEvents: 1250,
    trackedSince: "2024-01-15T10:30:00Z",
    trackingTime: "45 days",
    currentPrice: monPriceData.currentPrice,
    priceChange24h: monPriceData.priceChange24h,
  },
  {
    id: 2,
    name: "Wrapped Ethereum",
    symbol: "WETH",
    address: "0x0000000000000000000000000000000000000000",
    imageUrl: "/ethereum.png",
    totalEvents: 890,
    trackedSince: "2024-02-01T08:15:00Z",
    trackingTime: "30 days",
    currentPrice: 1.25,
    priceChange24h: -2.3,
  },
  {
    id: 3,
    name: "Chog",
    symbol: "CHOG",
    address: "0xE0590015A873bF326bd645c3E1266d4db41C4E6B",
    imageUrl:
      "https://imagedelivery.net/tWwhAahBw7afBzFUrX5mYQ/5d1206c2-042c-4edc-9f8b-dcef2e9e8f00/public",
    totalEvents: 2100,
    trackedSince: "2024-01-01T00:00:00Z",
    trackingTime: "60 days",
    currentPrice: 0.85,
    priceChange24h: 12.5,
  },
];

export default function TokensPage() {
  const [tokens, setTokens] = useState<TokenData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setTokens(mockTokens);
      } catch (error) {
        console.error("Error fetching tokens:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTokens();
  }, []);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getPriceChangeColor = (change: number) => {
    return change >= 0 ? "text-green-500" : "text-red-500";
  };

  const getPriceChangeIcon = (change: number) => {
    return change >= 0 ? "▲" : "▼";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white text-xl">Loading tokens...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Tokens</h1>
        <p className="text-dark-400">
          Track and analyze token performance with real-time data
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tokens.map((token) => (
          <Link
            key={token.id}
            href={`/token/${token.address}`}
            className="bg-dark-800 rounded-lg p-6 hover:bg-dark-700 transition-colors border border-dark-700 hover:border-dark-600"
          >
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
                <h3 className="text-xl font-semibold text-white">
                  {token.name}
                </h3>
                <p className="text-dark-400">{token.symbol}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-dark-400 text-sm">Current Price</span>
                <span className="text-white font-semibold">
                  ${token.currentPrice.toFixed(6)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-dark-400 text-sm">24h Change</span>
                <span
                  className={`font-semibold ${getPriceChangeColor(
                    token.priceChange24h
                  )}`}
                >
                  {getPriceChangeIcon(token.priceChange24h)}{" "}
                  {Math.abs(token.priceChange24h).toFixed(2)}%
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-dark-400 text-sm">Total Events</span>
                <span className="text-white">
                  {token.totalEvents.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-dark-400 text-sm">Address</span>
                <span className="text-dark-300 text-sm font-mono">
                  {formatAddress(token.address)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-dark-400 text-sm">Tracked Since</span>
                <span className="text-dark-300 text-sm">
                  {new Date(token.trackedSince).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-dark-700">
              <div className="flex items-center justify-between">
                <span className="text-dark-400 text-sm">Tracking Time</span>
                <span className="text-white text-sm">{token.trackingTime}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {tokens.length === 0 && (
        <div className="text-center py-12">
          <div className="text-dark-400 text-lg">No tokens found</div>
          <p className="text-dark-500 text-sm mt-2">
            Tokens will appear here once they are tracked
          </p>
        </div>
      )}
    </div>
  );
}

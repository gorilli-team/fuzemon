"use client";

import React, { useState, useEffect } from "react";
import CandlestickChart from "../components/CandlestickChart";
import { Time } from "lightweight-charts";

interface PriceData {
  time: Time;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface Signal {
  action: string;
  price: number;
  timestamp: string;
  symbol: string;
}

export default function ChartTestPage() {
  const [priceData, setPriceData] = useState<PriceData[]>([]);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Generate sample price data
    const generateSampleData = () => {
      const data: PriceData[] = [];
      const now = Date.now() / 1000; // Current time in seconds
      let price = 100; // Starting price

      // Generate 100 data points over the last 7 days
      for (let i = 0; i < 100; i++) {
        const time = (now - (100 - i) * 3600) as Time; // Each point is 1 hour apart
        const open = price;
        const change = (Math.random() - 0.5) * 10; // Random price change
        const close = Math.max(0.01, open + change);
        const high = Math.max(open, close) + Math.random() * 5;
        const low = Math.min(open, close) - Math.random() * 5;

        data.push({
          time,
          open,
          high,
          low,
          close,
        });

        price = close;
      }

      return data;
    };

    // Generate sample signals
    const generateSampleSignals = () => {
      const now = Date.now();
      return [
        {
          action: "BUY",
          price: 105.5,
          timestamp: new Date(now - 86400 * 1000).toISOString(), // 1 day ago
          symbol: "BTCUSDT",
        },
        {
          action: "SELL",
          price: 98.2,
          timestamp: new Date(now - 43200 * 1000).toISOString(), // 12 hours ago
          symbol: "BTCUSDT",
        },
      ];
    };

    setPriceData(generateSampleData());
    setSignals(generateSampleSignals());
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white">Loading chart...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">
          TradingView Chart Test
        </h1>

        {/* Price Chart Section - Inspired by Gorillionaire */}
        <div className="bg-dark-800 rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
            <h2 className="text-xl font-semibold text-white mb-4 md:mb-0">
              Sample Price Chart
            </h2>

            {/* Price Points */}
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="text-green-500">1h: ▲ 2.5%</div>
              <div className="text-red-500">6h: ▼ -1.2%</div>
              <div className="text-green-500">24h: ▲ 5.8%</div>
            </div>
          </div>

          {/* Chart */}
          <div className="h-80">
            <CandlestickChart
              data={priceData}
              tokenSymbol="BTCUSDT"
              signals={signals}
            />
          </div>
        </div>

        <div className="bg-dark-800 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Chart Information
          </h2>
          <div className="text-gray-300 space-y-2">
            <p>Data points: {priceData.length}</p>
            <p>Signals: {signals.length}</p>
            <p>
              Price range: $
              {Math.min(...priceData.map((d) => d.low)).toFixed(2)} - $
              {Math.max(...priceData.map((d) => d.high)).toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

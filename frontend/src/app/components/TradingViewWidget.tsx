"use client";

import React, { useEffect, useRef, useState } from "react";

export interface TradingViewWidgetOptions {
  autosize: boolean;
  symbol: string;
  interval: string;
  container_id: string;
  theme: string;
  style: string;
  locale: string;
  toolbar_bg: string;
  hide_side_toolbar: boolean;
  allow_symbol_change: boolean;
}

interface TradingViewWidgetProps {
  symbol?: string;
  interval?: string;
  theme?: "light" | "dark";
  autosize?: boolean;
  hide_side_toolbar?: boolean;
  allow_symbol_change?: boolean;
  height?: number;
  width?: number;
  className?: string;
}

declare global {
  interface Window {
    TradingView: any;
  }
}

const TradingViewWidget: React.FC<TradingViewWidgetProps> = ({
  symbol = "BTCUSDT",
  interval = "1D",
  theme = "dark",
  autosize = true,
  hide_side_toolbar = false,
  allow_symbol_change = true,
  height = 400,
  width,
  className = "",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadTradingViewScript = () => {
      if (window.TradingView) {
        setIsLoaded(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/tv.js";
      script.async = true;
      script.onload = () => {
        setIsLoaded(true);
      };
      script.onerror = () => {
        console.error("Failed to load TradingView script");
      };
      document.head.appendChild(script);
    };

    loadTradingViewScript();
  }, []);

  useEffect(() => {
    if (!isLoaded || !containerRef.current || !window.TradingView) {
      return;
    }

    // Clean up existing widget
    if (widgetRef.current) {
      widgetRef.current.remove();
      widgetRef.current = null;
    }

    const containerId = `tradingview_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    if (containerRef.current) {
      containerRef.current.id = containerId;
    }

    const widgetOptions: TradingViewWidgetOptions = {
      autosize,
      symbol,
      interval,
      container_id: containerId,
      theme,
      style: "1",
      locale: "en",
      toolbar_bg: theme === "dark" ? "#1e1e1e" : "#ffffff",
      hide_side_toolbar,
      allow_symbol_change,
    };

    try {
      const widget = new window.TradingView.widget(widgetOptions);
      widgetRef.current = widget;
    } catch (error) {
      console.error("Error creating TradingView widget:", error);
    }

    return () => {
      if (widgetRef.current) {
        try {
          widgetRef.current.remove();
        } catch (error) {
          console.error("Error removing TradingView widget:", error);
        }
        widgetRef.current = null;
      }
    };
  }, [
    isLoaded,
    symbol,
    interval,
    theme,
    autosize,
    hide_side_toolbar,
    allow_symbol_change,
  ]);

  if (!isLoaded) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 ${className}`}
        style={{ height, width }}
      >
        <div className="text-gray-600 dark:text-gray-400">
          Loading TradingView...
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`tradingview-widget-container ${className}`}
      style={{ height, width }}
    />
  );
};

export default TradingViewWidget;

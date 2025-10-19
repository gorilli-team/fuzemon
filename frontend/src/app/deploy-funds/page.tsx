"use client";
import React from "react";
import RealSwapComponent from "../components/RealSwapComponent";

export default function DeployFundsPage() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Deploy Funds</h1>
        <p className="text-gray-400">
          Bridge your assets between Ethereum Sepolia and Monad Testnet
        </p>
      </div>

      {/* Real Swap Interface */}
      <div className="bg-dark-800 rounded-lg p-6">
        <RealSwapComponent />
      </div>
    </div>
  );
}

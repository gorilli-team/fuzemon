"use client";
import React from "react";
import SmartWalletManager from "../components/SmartWalletManager";
import PortfolioOverview from "../components/PortfolioOverview";

export default function DashboardPage() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">Welcome to Fuzemon Dashboard</p>
      </div>

      {/* Smart Wallet Section */}
      <div className="mb-8">
        <div className="bg-dark-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-4">Smart Wallets</h2>
          <p className="text-gray-400 mb-6">
            Deploy and manage your smart wallets for automated trading
          </p>
          <SmartWalletManager />
        </div>
      </div>

      {/* Portfolio Overview */}
      <div className="mb-8">
        <PortfolioOverview />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-dark-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Portfolio</h3>
          <p className="text-gray-400">Track your assets across networks</p>
        </div>

        <div className="bg-dark-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-white mb-4">
            Recent Activity
          </h3>
          <p className="text-gray-400">View your transaction history</p>
        </div>

        <div className="bg-dark-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-white mb-4">
            Quick Actions
          </h3>
          <p className="text-gray-400">Deploy funds and manage orders</p>
        </div>
      </div>
    </div>
  );
}

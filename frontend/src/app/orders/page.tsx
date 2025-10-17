"use client";
import React from "react";

export default function OrdersPage() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Orders</h1>
        <p className="text-gray-400">
          Manage your bridge orders and transactions
        </p>
      </div>

      <div className="bg-dark-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Recent Orders</h2>
        <div className="text-gray-400">
          <p>
            No orders yet. Start by deploying funds to see your transactions
            here.
          </p>
        </div>
      </div>
    </div>
  );
}

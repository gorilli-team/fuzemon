"use client";

import {
  ArrowPathIcon,
  TrashIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { useOrders } from "../hooks/useOrders";
import OrderCard from "./OrderCard";

interface OpenOrdersProps {
  userAddress?: string;
}

export default function OpenOrders({ userAddress }: OpenOrdersProps) {
  const { orders, loading, error, refresh, deleteOrder, clearError } =
    useOrders({
      userAddress,
      autoRefresh: true,
      refreshInterval: 5000,
    });

  const handleRefresh = async () => {
    await refresh();
  };

  const handleClearCompleted = async () => {
    const completedOrders = orders.filter(
      (order) => order.status === "COMPLETED" || order.status === "FAILED"
    );

    // Delete completed orders from backend
    for (const order of completedOrders) {
      await deleteOrder(order.id);
    }
  };

  if (loading && orders.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto bg-dark-800 rounded-2xl shadow-xl p-6 border border-dark-600">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Orders</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleRefresh}
              disabled={true}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              title="Refresh orders"
            >
              <ArrowPathIcon className="w-5 h-5 animate-spin" />
              <span className="sr-only">Loading orders</span>
            </button>
          </div>
        </div>
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-dark-700 rounded-full flex items-center justify-center">
            <ArrowPathIcon className="w-8 h-8 text-gray-400 dark:text-gray-500 animate-spin" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
            Loading orders...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-4xl mx-auto bg-dark-800 rounded-2xl shadow-xl p-6 border border-dark-600">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Orders</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleRefresh}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              title="Refresh orders"
            >
              <ArrowPathIcon className="w-5 h-5" />
              <span className="sr-only">Refresh orders</span>
            </button>
          </div>
        </div>
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <ExclamationTriangleIcon className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <p className="text-red-600 dark:text-red-400 text-lg font-medium">
            Failed to load orders
          </p>
          <p className="text-red-500 dark:text-red-300 text-sm mt-2">{error}</p>
          <button
            onClick={clearError}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto bg-dark-800 rounded-2xl shadow-xl p-6 border border-dark-600">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Orders</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleRefresh}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              title="Refresh orders"
            >
              <ArrowPathIcon className="w-5 h-5" />
              <span className="sr-only">Refresh orders</span>
            </button>
          </div>
        </div>
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-dark-700 rounded-full flex items-center justify-center">
            <ArrowPathIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
            No orders found
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
            Start your first cross-chain exchange to see orders here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto bg-dark-800 rounded-2xl shadow-xl p-6 border border-dark-600">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Orders</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {orders.length} order{orders.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors disabled:opacity-50"
            title="Refresh orders"
          >
            <ArrowPathIcon
              className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
            />
            <span className="sr-only">Refresh orders</span>
          </button>
          <button
            onClick={handleClearCompleted}
            className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
            title="Clear completed orders"
          >
            <TrashIcon className="w-5 h-5" />
            <span className="sr-only">Clear completed orders</span>
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>
    </div>
  );
}

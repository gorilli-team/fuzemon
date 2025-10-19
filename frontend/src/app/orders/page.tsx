"use client";
import React, { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useOrders } from "../hooks/useOrders";
import OrderCard from "../components/OrderCard";
import {
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

export default function OrdersPage() {
  const { address } = useAccount();
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  const { orders, loading, error, refresh, pagination } = useOrders({
    userAddress: address,
    page: currentPage,
    limit: ordersPerPage,
    autoRefresh: true,
    refreshInterval: 30000,
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRefresh = async () => {
    await refresh();
  };

  const totalPages = pagination?.totalPages || 1;
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Orders</h1>
        <p className="text-gray-400">
          Manage your bridge orders and transactions
        </p>
      </div>

      <div className="bg-dark-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white">Recent Orders</h2>
            {pagination && (
              <p className="text-sm text-gray-400 mt-1">
                Showing {orders.length} of {pagination.total} orders
              </p>
            )}
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="p-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
            title="Refresh orders"
          >
            <ArrowPathIcon
              className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
            />
          </button>
        </div>

        {loading && orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-dark-700 rounded-full flex items-center justify-center">
              <ArrowPathIcon className="w-8 h-8 text-gray-400 animate-spin" />
            </div>
            <p className="text-gray-400 text-lg">Loading orders...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-900/20 rounded-full flex items-center justify-center">
              <span className="text-red-400 text-2xl">⚠️</span>
            </div>
            <p className="text-red-400 text-lg mb-2">Failed to load orders</p>
            <p className="text-gray-400 text-sm">{error}</p>
            <button
              onClick={handleRefresh}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">
              No orders yet. Start by creating a bridge transaction to see your
              orders here.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-6">
              {orders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-dark-600 pt-4">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!hasPrevPage}
                    className="flex items-center px-3 py-2 text-sm text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeftIcon className="w-4 h-4 mr-1" />
                    Previous
                  </button>

                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                            currentPage === pageNum
                              ? "bg-primary text-white"
                              : "text-gray-400 hover:text-white hover:bg-dark-700"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!hasNextPage}
                    className="flex items-center px-3 py-2 text-sm text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                    <ChevronRightIcon className="w-4 h-4 ml-1" />
                  </button>
                </div>

                <div className="text-sm text-gray-400">
                  Page {currentPage} of {totalPages}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

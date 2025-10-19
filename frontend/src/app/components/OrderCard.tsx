"use client";

import {
  ArrowTopRightOnSquareIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import { Order } from "../types/order";
import { getChainLogo } from "../constants/chains";

interface OrderCardProps {
  order: Order;
}

export default function OrderCard({ order }: OrderCardProps) {
  const formatAmount = (amount: string, decimals: number) => {
    try {
      return Number(amount).toFixed(decimals);
    } catch (error) {
      console.error("Error formatting amount:", error);
      return "0";
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CREATED":
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary text-white">
            <ClockIcon className="w-3 h-3 mr-1" />
            Created
          </span>
        );
      case "PENDING_SECRET":
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <ClockIcon className="w-3 h-3 mr-1" />
            Pending
          </span>
        );
      case "PENDING_WITHDRAW":
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
            <ClockIcon className="w-3 h-3 mr-1" />
            Withdrawing
          </span>
        );
      case "COMPLETED":
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircleIcon className="w-3 h-3 mr-1" />
            Completed
          </span>
        );
      case "FAILED":
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircleIcon className="w-3 h-3 mr-1" />
            Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-dark-100 text-dark-800">
            {status}
          </span>
        );
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CREATED":
        return "border-primary bg-primary";
      case "PENDING_SECRET":
        return "border-yellow-200 bg-yellow-50";
      case "PENDING_WITHDRAW":
        return "border-orange-200 bg-orange-50";
      case "COMPLETED":
        return "border-green-200 bg-green-50";
      case "FAILED":
        return "border-red-200 bg-red-50";
      default:
        return "border-dark-200 bg-dark-50";
    }
  };

  const TransactionLink = ({
    href,
    tooltip,
    className = "",
    iconClassName = "w-6 h-6 text-blue-600 hover:text-blue-800 transition-colors",
    showTooltip = false,
  }: {
    href: string;
    tooltip: string;
    className?: string;
    iconClassName?: string;
    showTooltip?: boolean;
  }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`group relative ${className}`}
      title={tooltip}
    >
      <ArrowTopRightOnSquareIcon className={iconClassName} />
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-dark-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
          {tooltip}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-dark-900"></div>
        </div>
      )}
    </a>
  );

  return (
    <div
      className={`rounded-lg p-3 bg-dark-800 border transition-all duration-200 hover:shadow-md ${getStatusColor(
        order.status
      )}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          {getStatusBadge(order.status)}
          <span className="text-xs text-dark-500 dark:text-dark-400">
            {formatDate(order.createdAt)}
          </span>
        </div>
        {order.orderHash && (
          <span className="text-xs text-dark-400 dark:text-dark-500 font-mono bg-dark-100 dark:bg-dark-700 px-1.5 py-0.5 rounded">
            {order.orderHash.slice(0, 6)}...{order.orderHash.slice(-4)}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-3">
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-dark-700 dark:text-dark-300 uppercase tracking-wide">
            Trade Details
          </h3>
          <div className="p-3 bg-white dark:bg-dark-600 rounded">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-sm text-dark-600 dark:text-dark-400">
                  From:
                </span>
                <span className="text-sm font-medium text-dark-900 dark:text-white">
                  {formatAmount(
                    order.swapState.fromAmount,
                    order.fromToken.decimals
                  )}{" "}
                  {order.fromToken.symbol}
                </span>
                <div className="w-8 h-8 flex items-center justify-center">
                  <Image
                    src={getChainLogo(order.swapState.fromChain)}
                    alt={order.fromToken.symbol}
                    width={32}
                    height={32}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-dark-100 dark:bg-dark-500 rounded-full flex items-center justify-center">
                  <svg
                    className="w-3 h-3 text-dark-600 dark:text-dark-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 12h14m0 0l-4-4m4 4l-4 4"
                    />
                  </svg>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 flex items-center justify-center">
                  <Image
                    src={getChainLogo(order.swapState.toChain)}
                    alt={order.toToken.symbol}
                    width={32}
                    height={32}
                  />
                </div>
                <span className="text-sm text-dark-600 dark:text-dark-400">
                  To:
                </span>
                <span className="text-sm font-medium text-dark-900 dark:text-white">
                  {formatAmount(
                    order.swapState.toAmount,
                    order.toToken.decimals
                  )}{" "}
                  {order.toToken.symbol}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-dark-500 dark:text-dark-400">
                Chain ID: {order.swapState.fromChain}
              </span>
              <span className="text-xs text-dark-500 dark:text-dark-400">
                Chain ID: {order.swapState.toChain}
              </span>
            </div>
          </div>
        </div>

        {order.transactions && Object.keys(order.transactions).length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <h3 className="text-xs font-semibold text-dark-700 dark:text-dark-300 uppercase tracking-wide">
                Transaction links:
              </h3>
              <div className="flex items-center space-x-2">
                {order.transactions.orderFill && (
                  <TransactionLink
                    href={order.transactions.orderFill.txLink}
                    tooltip="Source Escrow Deploy - Order fill transaction on source chain"
                    iconClassName="w-6 h-6 text-blue-600 hover:text-blue-800 transition-colors"
                    showTooltip={true}
                  />
                )}
                {order.transactions.dstEscrowDeploy && (
                  <TransactionLink
                    href={order.transactions.dstEscrowDeploy.txLink}
                    tooltip="Destination Escrow Deploy - Escrow contract deployment on destination chain"
                    iconClassName="w-6 h-6 text-green-600 hover:text-green-800 transition-colors"
                    showTooltip={true}
                  />
                )}
                {order.transactions.dstWithdraw && (
                  <TransactionLink
                    href={order.transactions.dstWithdraw.txLink}
                    tooltip="Destination Withdrawal - Final withdrawal of tokens on destination chain"
                    iconClassName="w-6 h-6 text-purple-600 hover:text-purple-800 transition-colors"
                    showTooltip={true}
                  />
                )}
                {order.transactions.srcWithdraw && (
                  <TransactionLink
                    href={order.transactions.srcWithdraw.txLink}
                    tooltip="Source Withdrawal - Cleanup withdrawal on source chain"
                    iconClassName="w-6 h-6 text-orange-600 hover:text-orange-800 transition-colors"
                    showTooltip={true}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {order.message && (
        <div className="mt-2 p-2 bg-dark-600 rounded border border-dark-500 dark:border-dark-500">
          <p className="text-xs text-white dark:text-white">{order.message}</p>
        </div>
      )}

      {order.error && (
        <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
          <p className="text-xs text-red-700 dark:text-red-300">
            <strong>Error:</strong> {order.error}
          </p>
        </div>
      )}

      <div className="mt-2 flex items-center justify-between text-xs text-dark-500 dark:text-dark-400">
        <span>ID: {order.id}</span>
        <div className="flex space-x-2">
          {order.completedAt && <span>✓ {formatDate(order.completedAt)}</span>}
          {order.failedAt && <span>✗ {formatDate(order.failedAt)}</span>}
        </div>
      </div>
    </div>
  );
}

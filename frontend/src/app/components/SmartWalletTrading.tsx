"use client";

import { useState, useEffect } from "react";
import { useAccount, useBalance } from "wagmi";
import { formatUnits, parseUnits } from "viem";
import { useSmartWalletTrading } from "../hooks/useSmartWalletTrading";
import { useDepositUSDC } from "../hooks/useDepositUSDC";
import { useWithdrawUSDC } from "../hooks/useWithdrawUSDC";

interface SmartWalletTradingProps {
  smartWallet: string;
  onClose: () => void;
  isOpen?: boolean;
}

export function SmartWalletTrading({
  smartWallet,
  onClose,
  isOpen = true,
}: SmartWalletTradingProps) {
  const { address } = useAccount();
  const [amount, setAmount] = useState("");
  const [tokenOut, setTokenOut] = useState("");
  const [slippage, setSlippage] = useState("0.5");
  const [isBuying, setIsBuying] = useState(true);
  const [loading, setLoading] = useState(false);

  const { buyTokensV4, sellTokensV4, isPending } = useSmartWalletTrading();
  const { depositUSDC } = useDepositUSDC();
  const { withdrawUSDC } = useWithdrawUSDC();

  // Get smart wallet USDC balance
  const { data: usdcBalance } = useBalance({
    address: smartWallet as `0x${string}`,
    token: process.env.NEXT_PUBLIC_USDC_ADDRESS_MONAD as `0x${string}`,
  });

  const handleTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !tokenOut) return;

    try {
      setLoading(true);
      const parsedAmount = parseUnits(amount, 6);
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 1800); // 30 minutes

      if (isBuying) {
        // Buy tokens with USDC
        await buyTokensV4(
          smartWallet as `0x${string}`,
          {
            currency0: process.env
              .NEXT_PUBLIC_USDC_ADDRESS_MONAD as `0x${string}`,
            currency1: tokenOut as `0x${string}`,
            fee: 3000, // 0.3%
            tickSpacing: 60,
            hooks: "0x0000000000000000000000000000000000000000",
          },
          true, // zeroForOne
          parsedAmount, // amountOut
          parsedAmount, // amountInMax
          deadline
        );
      } else {
        // Sell tokens for USDC
        await sellTokensV4(
          smartWallet as `0x${string}`,
          {
            currency0: tokenOut as `0x${string}`,
            currency1: process.env
              .NEXT_PUBLIC_USDC_ADDRESS_MONAD as `0x${string}`,
            fee: 3000, // 0.3%
            tickSpacing: 60,
            hooks: "0x0000000000000000000000000000000000000000",
          },
          false, // zeroForOne
          parsedAmount, // amountIn
          BigInt(0), // amountOutMin
          deadline
        );
      }

      setAmount("");
      setTokenOut("");
    } catch (error) {
      console.error("Trading failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async () => {
    if (!amount) return;

    try {
      setLoading(true);
      const parsedAmount = parseUnits(amount, 6);
      await depositUSDC(smartWallet as `0x${string}`, parsedAmount);
      setAmount("");
    } catch (error) {
      console.error("Deposit failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!amount) return;

    try {
      setLoading(true);
      const parsedAmount = parseUnits(amount, 6);
      await withdrawUSDC(smartWallet as `0x${string}`, parsedAmount);
      setAmount("");
    } catch (error) {
      console.error("Withdraw failed:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Smart Wallet Trading</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ✕
          </button>
        </div>

        {/* Smart Wallet Info */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Smart Wallet</p>
              <p className="font-mono text-sm">
                {smartWallet.slice(0, 6)}...{smartWallet.slice(-4)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">USDC Balance</p>
              <p className="font-medium">
                {usdcBalance
                  ? formatUnits(usdcBalance.value, usdcBalance.decimals)
                  : "0"}{" "}
                USDC
              </p>
            </div>
          </div>
        </div>

        {/* Trading Form */}
        <form onSubmit={handleTrade} className="space-y-4">
          <div className="flex gap-2 mb-4">
            <button
              type="button"
              onClick={() => setIsBuying(true)}
              className={`px-4 py-2 rounded-lg font-medium ${
                isBuying
                  ? "bg-purple-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Buy
            </button>
            <button
              type="button"
              onClick={() => setIsBuying(false)}
              className={`px-4 py-2 rounded-lg font-medium ${
                !isBuying
                  ? "bg-purple-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Sell
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount (USDC)
            </label>
            <input
              type="number"
              step="0.000001"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Token Address
            </label>
            <input
              type="text"
              value={tokenOut}
              onChange={(e) => setTokenOut(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0x..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Slippage (%)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="50"
              value={slippage}
              onChange={(e) => setSlippage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleDeposit}
              disabled={loading || !amount}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
            >
              Deposit USDC
            </button>
            <button
              type="button"
              onClick={handleWithdraw}
              disabled={loading || !amount}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
            >
              Withdraw USDC
            </button>
          </div>

          <button
            type="submit"
            disabled={loading || !amount || !tokenOut}
            className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? "Processing..." : `${isBuying ? "Buy" : "Sell"} Tokens`}
          </button>
        </form>
      </div>
    </div>
  );
}

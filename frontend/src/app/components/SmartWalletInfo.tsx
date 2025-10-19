"use client";

import { useState, useEffect } from "react";
import { useBalance } from "wagmi";
import { formatUnits } from "viem";

interface SmartWalletInfoProps {
  smartWallet: string;
  onOpenDepositModal: () => void;
  onOpenWithdrawModal: () => void;
  onOpenTradingModal?: () => void;
}

export function SmartWalletInfo({
  smartWallet,
  onOpenDepositModal,
  onOpenWithdrawModal,
  onOpenTradingModal,
}: SmartWalletInfoProps) {
  const [balance, setBalance] = useState<string>("0");
  const [loading, setLoading] = useState(true);

  // Get USDC balance for the smart wallet
  const { data: usdcBalance } = useBalance({
    address: smartWallet as `0x${string}`,
    token: process.env.NEXT_PUBLIC_USDC_ADDRESS_MONAD as `0x${string}`,
  });

  useEffect(() => {
    if (usdcBalance) {
      setBalance(formatUnits(usdcBalance.value, usdcBalance.decimals));
      setLoading(false);
    }
  }, [usdcBalance]);

  return (
    <div className="mt-6 p-6 bg-dark-700 border border-dark-600 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">
          Smart Wallet Details
        </h3>
        <div className="flex gap-2">
          <button
            onClick={onOpenDepositModal}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            Deposit
          </button>
          <button
            onClick={onOpenWithdrawModal}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            Withdraw
          </button>
          {onOpenTradingModal && (
            <button
              onClick={onOpenTradingModal}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              Trade
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-400">Address:</span>
          <span className="font-mono text-sm text-white">{smartWallet}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-400">USDC Balance:</span>
          {loading ? (
            <div className="animate-pulse bg-gray-600 h-4 w-16 rounded"></div>
          ) : (
            <span className="font-medium text-white">{balance} USDC</span>
          )}
        </div>
      </div>
    </div>
  );
}

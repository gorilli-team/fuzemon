"use client";

import { useState, useEffect, useCallback } from "react";
import { useAccount } from "wagmi";
import { parseUnits } from "viem";
import { useCreateSmartWallet } from "../hooks/useCreateSmartWallet";
import { useDepositUSDC } from "../hooks/useDepositUSDC";
import { useWithdrawUSDC } from "../hooks/useWithdrawUSDC";
import { SmartWalletInfo } from "./SmartWalletInfo";
import { CreateSmartWalletModal } from "./CreateSmartWalletModal";
import { DepositModal } from "./DepositModal";
import { WithdrawModal } from "./WithdrawModal";
import { SmartWalletTrading } from "./SmartWalletTrading";

interface SmartWallet {
  _id: string;
  userWallet: string;
  smartWallet: string;
  chainId: number;
  createdAt: string;
  updatedAt: string;
}

export default function SmartWalletManager() {
  const { address, isConnected } = useAccount();
  const [smartWallets, setSmartWallets] = useState<SmartWallet[]>([]);
  const [selectedSmartWallet, setSelectedSmartWallet] =
    useState<SmartWallet | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showTradingModal, setShowTradingModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { createSmartWallet, isPending: isCreating } = useCreateSmartWallet();
  const { depositUSDC, isPending: isDepositing } = useDepositUSDC();
  const { withdrawUSDC, isPending: isWithdrawing } = useWithdrawUSDC();

  // Fetch user's smart wallets
  const fetchSmartWallets = useCallback(
    async (isRefresh = false) => {
      if (!address) return;

      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const response = await fetch(`/api/smart-wallet?userWallet=${address}`);
        if (response.ok) {
          const wallets = await response.json();
          setSmartWallets(wallets);
          if (wallets.length > 0) {
            // If no wallet is selected or the selected wallet is not in the list, select the first one
            if (
              !selectedSmartWallet ||
              !wallets.find(
                (w: SmartWallet) => w._id === selectedSmartWallet._id
              )
            ) {
              setSelectedSmartWallet(wallets[0]);
            }
          } else {
            setSelectedSmartWallet(null);
          }
        } else {
          console.error("Failed to fetch smart wallets:", response.statusText);
        }
      } catch (error) {
        console.error("Failed to fetch smart wallets:", error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [address, selectedSmartWallet]
  );

  useEffect(() => {
    fetchSmartWallets();
  }, [fetchSmartWallets]);

  const handleCreateSmartWallet = async (
    usdc: string,
    universalRouter: string,
    poolManager: string,
    permit2: string
  ) => {
    try {
      const { user, smartWallet } = await createSmartWallet(
        usdc,
        universalRouter,
        poolManager,
        permit2
      );

      // Save to backend
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/smart-wallet`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userWallet: user,
            smartWallet,
            chainId: 10143, // Monad Testnet
          }),
        }
      );

      if (response.ok) {
        await fetchSmartWallets();
        setShowCreateModal(false);
      }
    } catch (error) {
      console.error("Failed to create smart wallet:", error);
    }
  };

  const handleDeposit = async (amount: string) => {
    if (!selectedSmartWallet) return;

    try {
      const parsedAmount = parseUnits(amount, 6);
      await depositUSDC(
        selectedSmartWallet.smartWallet as `0x${string}`,
        parsedAmount
      );
      setShowDepositModal(false);
    } catch (error) {
      console.error("Failed to deposit USDC:", error);
    }
  };

  const handleWithdraw = async (amount: string) => {
    if (!selectedSmartWallet) return;

    try {
      const parsedAmount = parseUnits(amount, 6);
      await withdrawUSDC(
        selectedSmartWallet.smartWallet as `0x${string}`,
        parsedAmount
      );
      setShowWithdrawModal(false);
    } catch (error) {
      console.error("Failed to withdraw USDC:", error);
    }
  };

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-white mb-2">
            Connect Your Wallet
          </h3>
          <p className="text-gray-400">
            Please connect your wallet to manage smart wallets
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dark-600"></div>
        </div>
      ) : smartWallets.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold text-white mb-2">
            No Smart Wallets
          </h3>
          <p className="text-gray-400 mb-4">
            Create your first smart wallet to start trading
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-dark-600 hover:bg-dark-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            Create Smart Wallet
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">
              Your Smart Wallets
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => fetchSmartWallets(true)}
                disabled={refreshing}
                className="bg-gray-600 hover:bg-gray-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
              >
                {refreshing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Refreshing...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    Refresh
                  </>
                )}
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                Create New Wallet
              </button>
            </div>
          </div>

          {smartWallets.map((wallet) => (
            <div
              key={wallet._id}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedSmartWallet?._id === wallet._id
                  ? "border-blue-500 bg-blue-900/20"
                  : "border-dark-600 hover:border-dark-500 bg-dark-700"
              }`}
              onClick={() => setSelectedSmartWallet(wallet)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium text-white">Smart Wallet</h3>
                    {selectedSmartWallet?._id === wallet._id && (
                      <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">
                        Selected
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 font-mono mb-2">
                    {wallet.smartWallet}
                  </p>
                  <div className="flex gap-4 text-xs text-gray-400">
                    <span>Chain ID: {wallet.chainId}</span>
                    <span>
                      Created: {new Date(wallet.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-400 mb-1">Status</div>
                  <div className="text-green-400 text-sm font-medium">
                    Active
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedSmartWallet && (
        <SmartWalletInfo
          smartWallet={selectedSmartWallet.smartWallet}
          onOpenDepositModal={() => setShowDepositModal(true)}
          onOpenWithdrawModal={() => setShowWithdrawModal(true)}
          onOpenTradingModal={() => setShowTradingModal(true)}
        />
      )}

      <CreateSmartWalletModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateSmartWallet}
        isCreating={isCreating}
      />

      <DepositModal
        isOpen={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        onDeposit={handleDeposit}
        isDepositing={isDepositing}
      />

      <WithdrawModal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        onWithdraw={handleWithdraw}
        isWithdrawing={isWithdrawing}
      />

      {selectedSmartWallet && (
        <SmartWalletTrading
          smartWallet={selectedSmartWallet.smartWallet}
          onClose={() => setShowTradingModal(false)}
          isOpen={showTradingModal}
        />
      )}
    </div>
  );
}

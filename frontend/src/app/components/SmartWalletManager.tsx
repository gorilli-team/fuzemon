"use client";

import { useState, useEffect } from "react";
import { useAccount, useBalance } from "wagmi";
import { formatUnits, parseUnits } from "viem";
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

  const { createSmartWallet, isPending: isCreating } = useCreateSmartWallet();
  const { depositUSDC, isPending: isDepositing } = useDepositUSDC();
  const { withdrawUSDC, isPending: isWithdrawing } = useWithdrawUSDC();

  // Fetch user's smart wallets
  const fetchSmartWallets = async () => {
    if (!address) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/smart-wallet?userWallet=${address}`);
      if (response.ok) {
        const wallets = await response.json();
        setSmartWallets(wallets);
        if (wallets.length > 0) {
          setSelectedSmartWallet(wallets[0]);
        }
      }
    } catch (error) {
      console.error("Failed to fetch smart wallets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSmartWallets();
  }, [address]);

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
      const response = await fetch("/api/smart-wallet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userWallet: user,
          smartWallet,
          chainId: 10143, // Monad Testnet
        }),
      });

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
          {smartWallets.map((wallet) => (
            <div
              key={wallet._id}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedSmartWallet?._id === wallet._id
                  ? "border-dark-500 bg-dark-900/20"
                  : "border-dark-600 hover:border-dark-500 bg-dark-700"
              }`}
              onClick={() => setSelectedSmartWallet(wallet)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium text-white">Smart Wallet</h3>
                  <p className="text-sm text-gray-400 font-mono">
                    {wallet.smartWallet.slice(0, 6)}...
                    {wallet.smartWallet.slice(-4)}
                  </p>
                </div>
                <div className="text-sm text-gray-400">
                  Chain ID: {wallet.chainId}
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

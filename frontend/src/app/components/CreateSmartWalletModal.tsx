"use client";

import { useState } from "react";

interface CreateSmartWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (
    usdc: string,
    universalRouter: string,
    poolManager: string,
    permit2: string
  ) => Promise<void>;
  isCreating: boolean;
}

export function CreateSmartWalletModal({
  isOpen,
  onClose,
  onCreate,
  isCreating,
}: CreateSmartWalletModalProps) {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Use environment variables for smart wallet parameters
    const usdc = process.env.NEXT_PUBLIC_USDC_ADDRESS_MONAD;
    const universalRouter = process.env.NEXT_PUBLIC_UNIVERSAL_ROUTER_MONAD;
    const poolManager = process.env.NEXT_PUBLIC_POOL_MANAGER_MONAD;
    const permit2 = process.env.NEXT_PUBLIC_PERMIT2_MONAD;

    console.log("Environment variables:", {
      usdc,
      universalRouter,
      poolManager,
      permit2,
    });

    if (!usdc || !universalRouter || !poolManager || !permit2) {
      console.error(
        "Missing required environment variables for smart wallet creation",
        {
          usdc: !!usdc,
          universalRouter: !!universalRouter,
          poolManager: !!poolManager,
          permit2: !!permit2,
        }
      );
      alert(
        "Missing required environment variables. Please check your .env.local file."
      );
      return;
    }

    try {
      await onCreate(usdc, universalRouter, poolManager, permit2);
    } catch (error) {
      console.error("Error in CreateSmartWalletModal:", error);
      alert("Failed to create smart wallet. Check console for details.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Create Smart Wallet</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isCreating}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="mb-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="text-sm font-medium text-purple-900 mb-2">
              Smart Wallet Configuration
            </h4>
            <div className="text-xs text-purple-700 space-y-1">
              <p>
                <strong>USDC:</strong>{" "}
                {process.env.NEXT_PUBLIC_USDC_ADDRESS_MONAD || "Not configured"}
              </p>
              <p>
                <strong>Universal Router:</strong>{" "}
                {process.env.NEXT_PUBLIC_UNIVERSAL_ROUTER_MONAD ||
                  "Not configured"}
              </p>
              <p>
                <strong>Pool Manager:</strong>{" "}
                {process.env.NEXT_PUBLIC_POOL_MANAGER_MONAD || "Not configured"}
              </p>
              <p>
                <strong>Permit2:</strong>{" "}
                {process.env.NEXT_PUBLIC_PERMIT2_MONAD || "Not configured"}
              </p>
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              disabled={isCreating}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
            >
              {isCreating ? "Creating..." : "Create Smart Wallet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

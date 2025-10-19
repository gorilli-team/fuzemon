"use client";

import { useState, useEffect } from "react";
import { useAccount, useBalance } from "wagmi";
import { formatUnits, parseUnits } from "viem";
import { useSmartWalletTrading } from "../hooks/useSmartWalletTrading";
import { useDepositUSDC } from "../hooks/useDepositUSDC";
import { useWithdrawUSDC } from "../hooks/useWithdrawUSDC";

interface SmartWalletTokenTradingProps {
  tokenAddress: string;
  tokenSymbol: string;
  tokenName: string;
  currentPrice: number;
  onTransactionComplete?: () => void;
}

interface SmartWallet {
  _id: string;
  userWallet: string;
  smartWallet: string;
  chainId: number;
  createdAt: string;
  updatedAt: string;
}

export function SmartWalletTokenTrading({
  tokenAddress,
  tokenSymbol,
  tokenName,
  currentPrice,
  onTransactionComplete,
}: SmartWalletTokenTradingProps) {
  const { address, isConnected } = useAccount();
  const [smartWallets, setSmartWallets] = useState<SmartWallet[]>([]);
  const [selectedSmartWallet, setSelectedSmartWallet] =
    useState<SmartWallet | null>(null);
  const [showTradingModal, setShowTradingModal] = useState(false);
  const [tradingType, setTradingType] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("");
  const [usdcAmount, setUsdcAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    buyTokensV4,
    sellTokensV4,
    isPending: isTrading,
  } = useSmartWalletTrading();
  const { depositUSDC, isPending: isDepositing } = useDepositUSDC();
  const { withdrawUSDC, isPending: isWithdrawing } = useWithdrawUSDC();

  // Get USDC balance for the selected smart wallet
  const { data: usdcBalance } = useBalance({
    address: selectedSmartWallet?.smartWallet as `0x${string}`,
    token: process.env.NEXT_PUBLIC_USDC_ADDRESS_MONAD as `0x${string}`,
  });

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

  // Log environment variables for debugging
  useEffect(() => {
    console.log("🔧 Environment Configuration:");
    console.log("USDC Address:", process.env.NEXT_PUBLIC_USDC_ADDRESS_MONAD);
    console.log(
      "Smart Wallet Factory:",
      process.env.NEXT_PUBLIC_SMART_WALLET_FACTORY_MONAD
    );
    console.log(
      "Universal Router:",
      process.env.NEXT_PUBLIC_UNIVERSAL_ROUTER_MONAD
    );
    console.log("Pool Manager:", process.env.NEXT_PUBLIC_POOL_MANAGER_MONAD);
    console.log("Permit2:", process.env.NEXT_PUBLIC_PERMIT2_MONAD);
  }, []);

  // Calculate USDC amount when token amount changes
  useEffect(() => {
    if (amount && currentPrice) {
      const usdcValue = parseFloat(amount) * currentPrice;
      setUsdcAmount(usdcValue.toFixed(6));
    } else {
      setUsdcAmount("");
    }
  }, [amount, currentPrice]);

  // Calculate token amount when USDC amount changes
  useEffect(() => {
    if (usdcAmount && currentPrice) {
      const tokenValue = parseFloat(usdcAmount) / currentPrice;
      setAmount(tokenValue.toFixed(6));
    } else {
      setAmount("");
    }
  }, [usdcAmount, currentPrice]);

  const handleTrading = async () => {
    if (!selectedSmartWallet || !amount) return;

    try {
      setError(null);
      setLoading(true);

      console.log("🚀 Starting trade execution...");
      console.log("📊 Trade Details:", {
        tradingType,
        tokenAddress,
        tokenSymbol,
        amount,
        usdcAmount,
        currentPrice,
        smartWallet: selectedSmartWallet.smartWallet,
      });

      // Validate inputs
      if (!amount || parseFloat(amount) <= 0) {
        throw new Error("Invalid token amount");
      }
      if (!usdcAmount || parseFloat(usdcAmount) <= 0) {
        throw new Error("Invalid USDC amount");
      }

      // Validate environment variables
      const requiredEnvVars = [
        "NEXT_PUBLIC_USDC_ADDRESS_MONAD",
        "NEXT_PUBLIC_SMART_WALLET_FACTORY_MONAD",
        "NEXT_PUBLIC_UNIVERSAL_ROUTER_MONAD",
        "NEXT_PUBLIC_POOL_MANAGER_MONAD",
        "NEXT_PUBLIC_PERMIT2_MONAD",
      ];

      // const missingEnvVars = requiredEnvVars.filter(
      //   (envVar) => !process.env[envVar]
      // );
      // if (missingEnvVars.length > 0) {
      //   console.error("❌ Missing environment variables:", missingEnvVars);
      //   throw new Error(
      //     `Missing required environment variables: ${missingEnvVars.join(", ")}`
      //   );
      // }

      console.log("✅ All required environment variables are set");

      // Check USDC balance
      if (usdcBalance && tradingType === "buy") {
        const requiredUSDC = parseUnits(usdcAmount, 6);
        console.log("💰 USDC Balance Check:", {
          required: formatUnits(requiredUSDC, 6),
          available: formatUnits(usdcBalance.value, usdcBalance.decimals),
          sufficient: usdcBalance.value >= requiredUSDC,
        });

        if (usdcBalance.value < requiredUSDC) {
          throw new Error(
            `Insufficient USDC balance. Required: ${formatUnits(
              requiredUSDC,
              6
            )}, Available: ${formatUnits(
              usdcBalance.value,
              usdcBalance.decimals
            )}`
          );
        }
      }

      if (tradingType === "buy") {
        console.log("🛒 Executing BUY trade...");

        // For buying, we need to swap USDC for the token
        const usdcAmountBigInt = parseUnits(usdcAmount, 6);
        const tokenAmountBigInt = parseUnits(amount, 18); // Assuming 18 decimals for most tokens

        console.log("📈 Buy Parameters:", {
          usdcAmount: formatUnits(usdcAmountBigInt, 6),
          tokenAmount: formatUnits(tokenAmountBigInt, 18),
          usdcAddress: process.env.NEXT_PUBLIC_USDC_ADDRESS_MONAD,
          tokenAddress,
        });

        // Create the pool key for the swap
        const poolKey = {
          currency0: process.env
            .NEXT_PUBLIC_USDC_ADDRESS_MONAD as `0x${string}`,
          currency1: tokenAddress as `0x${string}`,
          fee: 3000, // 0.3% fee
          tickSpacing: 60,
          hooks: "0x0000000000000000000000000000000000000000" as `0x${string}`,
        };

        console.log("🏊 Pool Configuration:", poolKey);

        console.log(
          "⏰ Transaction deadline:",
          new Date(Date.now() + 1800000).toISOString()
        );

        const txHash = await buyTokensV4(
          selectedSmartWallet.smartWallet as `0x${string}`,
          poolKey,
          true, // zeroForOne: true means we're swapping currency0 (USDC) for currency1 (token)
          tokenAmountBigInt,
          usdcAmountBigInt,
          BigInt(Math.floor(Date.now() / 1000) + 1800) // 30 minutes deadline
        );

        console.log("✅ Buy transaction submitted:", txHash);
      } else {
        console.log("💸 Executing SELL trade...");

        // For selling, we need to swap the token for USDC
        const tokenAmountBigInt = parseUnits(amount, 18);
        const usdcAmountBigInt = parseUnits(usdcAmount, 6);

        console.log("📉 Sell Parameters:", {
          tokenAmount: formatUnits(tokenAmountBigInt, 18),
          usdcAmount: formatUnits(usdcAmountBigInt, 6),
          usdcAddress: process.env.NEXT_PUBLIC_USDC_ADDRESS_MONAD,
          tokenAddress,
        });

        // Create the pool key for the swap
        const poolKey = {
          currency0: process.env
            .NEXT_PUBLIC_USDC_ADDRESS_MONAD as `0x${string}`,
          currency1: tokenAddress as `0x${string}`,
          fee: 3000, // 0.3% fee
          tickSpacing: 60,
          hooks: "0x0000000000000000000000000000000000000000" as `0x${string}`,
        };

        console.log("🏊 Pool Configuration:", poolKey);

        console.log(
          "⏰ Transaction deadline:",
          new Date(Date.now() + 1800000).toISOString()
        );

        const txHash = await sellTokensV4(
          selectedSmartWallet.smartWallet as `0x${string}`,
          poolKey,
          false, // zeroForOne: false means we're swapping currency1 (token) for currency0 (USDC)
          tokenAmountBigInt,
          usdcAmountBigInt,
          BigInt(Math.floor(Date.now() / 1000) + 1800) // 30 minutes deadline
        );

        console.log("✅ Sell transaction submitted:", txHash);
      }

      console.log("🎉 Trade execution completed successfully!");
      setShowTradingModal(false);
      setAmount("");
      setUsdcAmount("");
      onTransactionComplete?.();
    } catch (error) {
      console.error("❌ Trading failed:", error);

      // Enhanced error logging
      if (error instanceof Error) {
        console.error("Error details:", {
          name: error.name,
          message: error.message,
          stack: error.stack,
        });

        // Check for specific error types
        if (error.message.includes("revert")) {
          console.error("🔄 Transaction reverted - possible causes:");
          console.error("1. Insufficient balance");
          console.error("2. Slippage too high");
          console.error("3. Pool doesn't exist");
          console.error("4. Invalid token addresses");
          console.error("5. Smart wallet not properly configured");
        }

        if (error.message.includes("gas")) {
          console.error("⛽ Gas-related error - possible causes:");
          console.error("1. Gas limit too low");
          console.error("2. Gas price too low");
          console.error("3. Network congestion");
        }

        if (error.message.includes("user rejected")) {
          console.error("👤 User rejected transaction");
        }
      }

      setError(error instanceof Error ? error.message : "Trading failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async () => {
    if (!selectedSmartWallet || !usdcAmount) return;

    try {
      setError(null);
      console.log("💰 Starting USDC deposit...");
      console.log("📱 Smart Wallet:", selectedSmartWallet.smartWallet);
      console.log("💵 USDC Amount:", usdcAmount);

      const usdcAmountBigInt = parseUnits(usdcAmount, 6);
      console.log("🔢 Parsed Amount:", usdcAmountBigInt.toString());

      const txHash = await depositUSDC(
        selectedSmartWallet.smartWallet as `0x${string}`,
        usdcAmountBigInt
      );

      console.log("✅ Deposit transaction hash:", txHash);
      onTransactionComplete?.();
    } catch (error) {
      console.error("❌ Deposit failed:", error);
      setError(error instanceof Error ? error.message : "Deposit failed");
    }
  };

  const handleWithdraw = async () => {
    if (!selectedSmartWallet || !usdcAmount) return;

    try {
      setError(null);
      console.log("💸 Starting USDC withdrawal...");
      console.log("📱 Smart Wallet:", selectedSmartWallet.smartWallet);
      console.log("💵 USDC Amount:", usdcAmount);

      const usdcAmountBigInt = parseUnits(usdcAmount, 6);
      console.log("🔢 Parsed Amount:", usdcAmountBigInt.toString());

      const txHash = await withdrawUSDC(
        selectedSmartWallet.smartWallet as `0x${string}`,
        usdcAmountBigInt
      );

      console.log("✅ Withdrawal transaction hash:", txHash);
      onTransactionComplete?.();
    } catch (error) {
      console.error("❌ Withdraw failed:", error);
      setError(error instanceof Error ? error.message : "Withdraw failed");
    }
  };

  if (!isConnected) {
    return (
      <div className="bg-dark-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Smart Wallet Trading
        </h3>
        <div className="text-center py-8">
          <p className="text-gray-400 mb-4">
            Connect your wallet to start trading
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-dark-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Smart Wallet Trading
        </h3>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-gray-400">Loading smart wallets...</p>
        </div>
      </div>
    );
  }

  if (smartWallets.length === 0) {
    return (
      <div className="bg-dark-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Smart Wallet Trading
        </h3>
        <div className="text-center py-8">
          <p className="text-gray-400 mb-4">No smart wallets found</p>
          <p className="text-sm text-gray-500">
            Create a smart wallet to start trading
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-dark-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">
        Smart Wallet Trading
      </h3>

      {/* Smart Wallet Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Select Smart Wallet
        </label>
        <select
          value={selectedSmartWallet?._id || ""}
          onChange={(e) => {
            const wallet = smartWallets.find((w) => w._id === e.target.value);
            setSelectedSmartWallet(wallet || null);
          }}
          className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white"
        >
          {smartWallets.map((wallet) => (
            <option key={wallet._id} value={wallet._id}>
              {wallet.smartWallet.slice(0, 6)}...{wallet.smartWallet.slice(-4)}
            </option>
          ))}
        </select>
      </div>

      {/* USDC Balance */}
      {selectedSmartWallet && usdcBalance && (
        <div className="mb-4 p-3 bg-dark-700 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">USDC Balance:</span>
            <span className="text-white font-medium">
              {formatUnits(usdcBalance.value, usdcBalance.decimals)} USDC
            </span>
          </div>
        </div>
      )}

      {/* Trading Buttons */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <button
          onClick={() => {
            setTradingType("buy");
            setShowTradingModal(true);
          }}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium"
        >
          Buy {tokenSymbol}
        </button>
        <button
          onClick={() => {
            setTradingType("sell");
            setShowTradingModal(true);
          }}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium"
        >
          Sell {tokenSymbol}
        </button>
      </div>

      {/* Deposit/Withdraw Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => {
            setTradingType("buy");
            setShowTradingModal(true);
          }}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium"
        >
          Deposit USDC
        </button>
        <button
          onClick={() => {
            setTradingType("sell");
            setShowTradingModal(true);
          }}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium"
        >
          Withdraw USDC
        </button>
      </div>

      {/* Trading Modal */}
      {showTradingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-dark-800 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">
                {tradingType === "buy" ? "Buy" : "Sell"} {tokenSymbol}
              </h3>
              <button
                onClick={() => setShowTradingModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-900/20 border border-red-500 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {tradingType === "buy" ? "Amount to Buy" : "Amount to Sell"} (
                  {tokenSymbol})
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.0"
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  USDC Amount
                </label>
                <input
                  type="number"
                  value={usdcAmount}
                  onChange={(e) => setUsdcAmount(e.target.value)}
                  placeholder="0.0"
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="text-sm text-gray-400">
                Current Price: ${currentPrice.toFixed(6)} per {tokenSymbol}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowTradingModal(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleTrading}
                  disabled={!amount || !usdcAmount || isTrading || loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg"
                >
                  {isTrading || loading
                    ? "Processing..."
                    : `${tradingType === "buy" ? "Buy" : "Sell"}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

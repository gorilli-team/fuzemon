"use client";

import { Address, AmountMode, TakerTraits } from "@1inch/cross-chain-sdk";
import { ArrowsUpDownIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { formatUnits, hashTypedData, parseUnits } from "viem";
import {
  useAccount,
  useBalance,
  useReadContract,
  useSignTypedData,
  useSwitchChain,
  useWriteContract,
} from "wagmi";
import { CHAINS, getChainLogo } from "../constants/chains";
import { ChainConfigs } from "../constants/contracts";
import { LOP_ADDRESSES, TOKENS } from "../constants/tokens";
import { createOrder as createOrderLogic } from "../logic/swap";
import { type Order, type SwapState } from "../types/order";
import { baseSepolia } from "wagmi/chains";
import { monadTestnet } from "../config/wagmi";
import { apiService } from "../services/api";

export default function RealSwapComponent() {
  const { address, isConnected } = useAccount();
  const { switchChain } = useSwitchChain();
  const { writeContract } = useWriteContract();
  const { signTypedDataAsync } = useSignTypedData();

  const [swapState, setSwapState] = useState<SwapState>({
    fromChain: baseSepolia.id, // Base Sepolia
    toChain: monadTestnet.id, // Monad Testnet
    fromToken: TOKENS[baseSepolia.id][0],
    toToken: TOKENS[monadTestnet.id][0],
    fromAmount: "",
    toAmount: "",
    userAddress: address,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [showFromTokenList, setShowFromTokenList] = useState(false);
  const [showToTokenList, setShowToTokenList] = useState(false);
  const [showFromChainList, setShowFromChainList] = useState(false);
  const [showToChainList, setShowToChainList] = useState(false);

  // Get balances and allowances
  const { data: fromTokenBalance } = useBalance({
    address,
    token:
      swapState.fromToken.address ===
      "0x0000000000000000000000000000000000000000"
        ? undefined
        : (swapState.fromToken.address as `0x${string}`),
    chainId: swapState.fromChain as 84532 | 10143,
  });

  const { data: toTokenBalance } = useBalance({
    address,
    token:
      swapState.toToken.address === "0x0000000000000000000000000000000000000000"
        ? undefined
        : (swapState.toToken.address as `0x${string}`),
    chainId: swapState.toChain as 84532 | 10143,
  });

  const { data: allowance } = useReadContract({
    address: swapState.fromToken.address as `0x${string}`,
    abi: [
      {
        constant: true,
        inputs: [
          { name: "_owner", type: "address" },
          { name: "_spender", type: "address" },
        ],
        name: "allowance",
        outputs: [{ name: "", type: "uint256" }],
        type: "function",
      },
    ],
    functionName: "allowance",
    args: [address!, LOP_ADDRESSES[swapState.fromChain] as `0x${string}`],
    chainId: swapState.fromChain as 84532 | 10143,
  });

  const needsApproval = () => {
    if (
      !address ||
      !swapState.fromAmount ||
      allowance === undefined ||
      allowance === null
    ) {
      return false;
    }

    try {
      const requiredAmount = parseUnits(
        swapState.fromAmount,
        swapState.fromToken.decimals
      );

      if (requiredAmount <= 0) {
        return false;
      }

      const currentAllowance = allowance as bigint;
      const needsApproval = currentAllowance < requiredAmount;

      console.log("🔍 Checking spending allowance...");
      console.log(
        `Current allowance: ${formatUnits(
          currentAllowance,
          swapState.fromToken.decimals
        )} ${swapState.fromToken.symbol}`
      );
      console.log(
        `Required amount: ${formatUnits(
          requiredAmount,
          swapState.fromToken.decimals
        )} ${swapState.fromToken.symbol}`
      );
      console.log(`Needs approval: ${needsApproval}`);

      return needsApproval;
    } catch (error) {
      console.error("Error checking approval:", error);
      return false;
    }
  };

  const handleApprove = async () => {
    if (!address || !swapState.fromAmount) return;

    setIsApproving(true);
    try {
      console.log("🔐 Setting spending cap for token...");
      const requiredAmount = parseUnits(
        swapState.fromAmount,
        swapState.fromToken.decimals
      );

      console.log(
        `Approving spending cap of ${formatUnits(
          requiredAmount,
          swapState.fromToken.decimals
        )} ${swapState.fromToken.symbol}`
      );
      console.log(`Spender: ${LOP_ADDRESSES[swapState.fromChain]}`);

      await writeContract({
        address: swapState.fromToken.address as `0x${string}`,
        abi: [
          {
            constant: false,
            inputs: [
              { name: "_spender", type: "address" },
              { name: "_value", type: "uint256" },
            ],
            name: "approve",
            outputs: [{ name: "", type: "bool" }],
            type: "function",
          },
        ],
        functionName: "approve",
        args: [
          LOP_ADDRESSES[swapState.fromChain] as `0x${string}`,
          requiredAmount,
        ],
        chainId: swapState.fromChain as 84532 | 10143,
      });

      console.log("✅ Spending cap approved successfully");
    } catch (error) {
      console.error("❌ Spending cap approval failed:", error);
    } finally {
      setIsApproving(false);
    }
  };

  // Mock price calculation - replace with actual pricing API
  useEffect(() => {
    if (swapState.fromAmount && !isNaN(Number(swapState.fromAmount))) {
      // Simple 1:1 conversion for demo - replace with actual rates
      setSwapState((prev) => ({
        ...prev,
        toAmount: prev.fromAmount,
      }));
    }
  }, [swapState.fromAmount]);

  const handleSwapDirection = () => {
    setSwapState((prev) => ({
      ...prev,
      fromChain: prev.toChain,
      toChain: prev.fromChain,
      fromToken: prev.toToken,
      toToken: prev.fromToken,
      fromAmount: prev.toAmount,
      toAmount: prev.fromAmount,
    }));
  };

  const handleSwap = async () => {
    if (!isConnected) return;

    if (needsApproval()) {
      console.error(
        "❌ Cannot proceed with swap: Insufficient allowance. Please approve spending cap first."
      );
      return;
    }

    setIsLoading(true);

    console.log("🚀 Starting CrossChainOrder creation process...");

    // Create order details for storage
    const orderDetails: Omit<Order, "id" | "createdAt"> = {
      swapState: swapState,
      fromToken: swapState.fromToken,
      toToken: swapState.toToken,
      message: "Order created and signed",
      status: "CREATED",
      transactions: {},
    };

    // Save order to backend
    let orderId: string;
    try {
      const response = await apiService.createOrder(orderDetails);
      if (response.success && response.data) {
        orderId = response.data.id;
        console.log("💾 Order created and saved to backend with ID:", orderId);
      } else {
        console.error("❌ Failed to save order to backend");
        return;
      }
    } catch (error) {
      console.error("❌ Error saving order to backend:", error);
      return;
    }

    try {
      console.log("🔄 Switching to source chain...");
      await switchChain({ chainId: swapState.fromChain as 84532 | 10143 });
      console.log("Switched to source chain");
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const secret =
        "0x0000000000000000000000000000000000000000000000000000000000000000";
      console.log("✅ Switched to source chain successfully");

      console.log("📝 Creating order data...");
      const order = await createOrderLogic(
        address!,
        swapState.fromAmount,
        swapState.toAmount,
        swapState.fromToken.address,
        swapState.toToken.address,
        secret,
        swapState.fromChain,
        swapState.toChain,
        swapState.fromToken.decimals,
        swapState.toToken.decimals
      );

      console.log("🔐 Signing order data...");
      const signature = await signTypedDataAsync(order.orderdata);

      console.log("📦 Preparing order for submission...");
      const orderBuild = order.order.build();
      const hashLock =
        order.order.escrowExtension?.hashLockInfo ||
        "0x0000000000000000000000000000000000000000000000000000000000000000";
      const orderHash = hashTypedData(
        order.orderdata as {
          domain: Record<string, unknown>;
          types: Record<string, unknown>;
          primaryType: string;
          message: Record<string, unknown>;
        }
      );
      const takerTraits = TakerTraits.default()
        .setExtension(order.order.extension)
        .setAmountMode(AmountMode.maker)
        .setAmountThreshold(order.order.takingAmount)
        .encode();
      const immutables = order.order
        .toSrcImmutables(
          swapState.fromChain,
          new Address(
            ChainConfigs[swapState.fromChain].ResolverContractAddress
          ) as Address,
          order.order.makingAmount,
          hashLock
        )
        .build();
      const srcSafetyDeposit = BigInt(
        order.order.escrowExtension?.srcSafetyDeposit || 0
      );

      console.log("🚀 Submitting order to exchange...");

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      const response = await fetch("/api/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          {
            order: order.order,
            swapState: swapState,
            signature: signature,
            immutables: immutables,
            hashLock: hashLock,
            orderHash: orderHash,
            orderBuild: orderBuild,
            takerTraits: takerTraits,
            srcSafetyDeposit: srcSafetyDeposit,
          },
          (key, value) => (typeof value === "bigint" ? value.toString() : value)
        ),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const resultBody = await response.json();

      console.log("✅ Exchange initiated successfully!");
      console.log("📊 Transaction details:", {
        orderFill: resultBody.transactions?.orderFill?.txLink,
        dstEscrowDeploy: resultBody.transactions?.dstEscrowDeploy?.txLink,
        status: resultBody.status,
      });

      // Update order with initial transaction data
      orderDetails.transactions = resultBody.transactions || {};
      orderDetails.message = resultBody.message || "Exchange initiated";
      orderDetails.status = "PENDING_SECRET";

      // Update existing order in localStorage
      const pendingSecretOrders = JSON.parse(
        localStorage.getItem("orders") || "[]"
      );
      const updatedOrders = pendingSecretOrders.map((o: Order) =>
        o.id === orderId
          ? {
              ...o,
              status: "PENDING_SECRET",
              transactions: resultBody.transactions || {},
              message:
                resultBody.message ||
                "Escrow contracts deployed on both chains. Waiting for secret revelation.",
            }
          : o
      );
      localStorage.setItem("orders", JSON.stringify(updatedOrders));
      console.log("💾 Order updated in localStorage with ID:", orderId);

      const responseData = {
        srcEscrowEvent: resultBody.srcEscrowEvent,
        dstDeployedAt: resultBody.dstDeployedAt,
        dstImmutablesData: resultBody.dstImmutablesData,
        dstImmutablesHash: resultBody.dstImmutablesHash,
        srcImmutablesHash: resultBody.srcImmutablesHash,
        srcImmutablesData: resultBody.srcImmutablesData,
        transactions: resultBody.transactions,
        status: resultBody.status,
        message: resultBody.message,
      };

      console.log("⏳ Initiating secret revelation phase...");

      // Update order status to PENDING_WITHDRAW before secret revelation
      const currentOrders = JSON.parse(localStorage.getItem("orders") || "[]");
      const withdrawOrders = currentOrders.map((o: Order) =>
        o.id === orderId
          ? {
              ...o,
              status: "PENDING_WITHDRAW",
              message: "Secret revealed. Starting withdrawal process...",
            }
          : o
      );
      localStorage.setItem("orders", JSON.stringify(withdrawOrders));

      const secretRevealController = new AbortController();
      const secretRevealTimeoutId = setTimeout(
        () => secretRevealController.abort(),
        60000
      );

      const secretRevealResponse = await fetch("/api/order/secret-reveal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          {
            order: order.order,
            swapState: swapState,
            signature: signature,
            secret: secret,
            srcEscrowEvent: responseData.srcEscrowEvent,
            dstDeployedAt: responseData.dstDeployedAt,
            dstImmutablesData: responseData.dstImmutablesData,
            dstImmutablesHash: responseData.dstImmutablesHash,
            srcImmutablesHash: responseData.srcImmutablesHash,
            srcImmutablesData: responseData.srcImmutablesData,
          },
          (key, value) => (typeof value === "bigint" ? value.toString() : value)
        ),
        signal: secretRevealController.signal,
      });

      clearTimeout(secretRevealTimeoutId);

      if (!secretRevealResponse.ok) {
        throw new Error(`Secret reveal failed: ${secretRevealResponse.status}`);
      }

      const secretRevealResult = await secretRevealResponse.json();
      console.log("✅ Secret revelation completed!");
      console.log("📊 Withdrawal transaction details:", {
        dstWithdraw: secretRevealResult.transactions?.dstWithdraw?.txLink,
        srcWithdraw: secretRevealResult.transactions?.srcWithdraw?.txLink,
        status: secretRevealResult.status,
        message: secretRevealResult.message,
      });

      // Update order status to completed
      const completedOrders = JSON.parse(
        localStorage.getItem("orders") || "[]"
      );
      const completedOrderIndex = completedOrders.findIndex(
        (o: Order) => o.id === orderId
      );
      if (completedOrderIndex !== -1) {
        completedOrders[completedOrderIndex].status = "COMPLETED";
        completedOrders[completedOrderIndex].completedAt = Date.now();
        completedOrders[completedOrderIndex].transactions = {
          ...completedOrders[completedOrderIndex].transactions,
          ...secretRevealResult.transactions,
        };
        completedOrders[completedOrderIndex].message =
          secretRevealResult.message;
        localStorage.setItem("orders", JSON.stringify(completedOrders));
        console.log("✅ Order status updated to completed");
      }

      console.log("✅ Cross-chain exchange process completed!");
    } catch (error) {
      console.error("❌ Exchange failed:", error);

      // Update order status to failed
      const failedOrders = JSON.parse(localStorage.getItem("orders") || "[]");
      const failedOrderIndex = failedOrders.findIndex(
        (o: Order) => o.id === orderId
      );
      if (failedOrderIndex !== -1) {
        failedOrders[failedOrderIndex].status = "FAILED";
        failedOrders[failedOrderIndex].failedAt = Date.now();
        failedOrders[failedOrderIndex].error =
          error instanceof Error ? error.message : "Unknown error";
        localStorage.setItem("orders", JSON.stringify(failedOrders));
        console.log("❌ Order status updated to failed");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatBalance = (
    balance: { value: bigint; decimals: number } | undefined
  ) => {
    if (!balance) return "0.00";
    return Number(formatUnits(balance.value, balance.decimals)).toFixed(4);
  };

  const validateAmount = (
    amount: string,
    balance: { value: bigint; decimals: number } | undefined
  ) => {
    if (!amount || amount === "") return true; // Allow empty input
    if (!balance) return false; // No balance data

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < 0) return false;

    const balanceAmount = Number(formatUnits(balance.value, balance.decimals));
    return numAmount <= balanceAmount;
  };

  const handleAmountChange = (value: string) => {
    // Allow empty string
    if (value === "") {
      setSwapState((prev) => ({ ...prev, fromAmount: "" }));
      return;
    }

    // Allow only numbers and decimal point
    if (!/^\d*\.?\d*$/.test(value)) return;

    // Check if amount is valid
    if (validateAmount(value, fromTokenBalance)) {
      setSwapState((prev) => ({ ...prev, fromAmount: value }));
    }
  };

  return (
    <div className="w-md mx-auto bg-dark-800 rounded-2xl shadow-xl p-6 border border-dark-600">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">
          Real Cross-Chain Exchange
        </h2>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm text-gray-400">
            {isConnected ? "Connected" : "Not Connected"}
          </span>
        </div>
      </div>

      {/* From Section */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-medium text-gray-300">From</label>
          <div className="flex flex-col items-end">
            <span className="text-sm text-gray-400">
              Balance: {formatBalance(fromTokenBalance)}
            </span>
            {swapState.fromAmount &&
              !validateAmount(swapState.fromAmount, fromTokenBalance) && (
                <span className="text-xs text-red-400 mt-1">
                  Amount exceeds balance
                </span>
              )}
          </div>
        </div>

        <div className="bg-dark-700 rounded-xl p-4 border border-dark-500">
          <div className="flex justify-between items-center mb-3">
            {/* Chain Selector */}
            <div className="relative">
              <button
                onClick={() => setShowFromChainList(!showFromChainList)}
                className="flex items-center space-x-2 bg-dark-600 rounded-lg px-3 py-2 border border-dark-500 hover:bg-dark-500 transition-colors"
              >
                <img
                  src={getChainLogo(swapState.fromChain)}
                  alt="Chain logo"
                  className="w-6 h-6 rounded-full"
                />
                <span className="text-sm font-medium text-white">
                  {CHAINS.find((c) => c.id === swapState.fromChain)?.name}
                </span>
                <ChevronDownIcon className="w-4 h-4 text-gray-400" />
              </button>

              {showFromChainList && (
                <div className="absolute top-full left-0 mt-2 bg-dark-600 border border-dark-500 rounded-lg shadow-lg z-10 min-w-full">
                  {CHAINS.map((chain) => (
                    <button
                      key={chain.id}
                      onClick={() => {
                        setSwapState((prev) => ({
                          ...prev,
                          fromChain: chain.id,
                          fromToken: TOKENS[chain.id][0],
                        }));
                        setShowFromChainList(false);
                      }}
                      className="w-full flex items-center space-x-2 px-3 py-2 hover:bg-dark-500 transition-colors"
                    >
                      <img
                        src={getChainLogo(chain.id)}
                        alt={`${chain.name} logo`}
                        className="w-6 h-6 rounded-full"
                      />
                      <span className="text-sm text-white">{chain.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Token Selector */}
            <div className="relative">
              <button
                onClick={() => setShowFromTokenList(!showFromTokenList)}
                className="flex items-center space-x-2 bg-dark-600 rounded-lg px-3 py-2 border border-dark-500 hover:bg-dark-500 transition-colors"
              >
                <img
                  src={swapState.fromToken.logo}
                  alt={`${swapState.fromToken.symbol} logo`}
                  className="w-6 h-6 rounded-full"
                />
                <span className="text-sm font-medium text-white">
                  {swapState.fromToken.symbol}
                </span>
                <ChevronDownIcon className="w-4 h-4 text-gray-400" />
              </button>

              {showFromTokenList && (
                <div className="absolute top-full right-0 mt-2 bg-dark-600 border border-dark-500 rounded-lg shadow-lg z-10 min-w-full">
                  {TOKENS[swapState.fromChain].map((token) => (
                    <button
                      key={token.address}
                      onClick={() => {
                        setSwapState((prev) => ({
                          ...prev,
                          fromToken: token,
                        }));
                        setShowFromTokenList(false);
                      }}
                      className="w-full flex items-center space-x-2 px-3 py-2 hover:bg-dark-500 transition-colors"
                    >
                      <img
                        src={token.logo}
                        alt={`${token.symbol} logo`}
                        className="w-6 h-6 rounded-full"
                      />
                      <span className="text-sm text-white">{token.symbol}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <input
            type="number"
            placeholder="0.0"
            value={swapState.fromAmount}
            onChange={(e) => handleAmountChange(e.target.value)}
            min="0"
            step="any"
            className={`w-full bg-transparent text-2xl font-bold outline-none ${
              swapState.fromAmount &&
              !validateAmount(swapState.fromAmount, fromTokenBalance)
                ? "text-red-400"
                : "text-white"
            }`}
          />
        </div>
      </div>

      {/* Swap Direction Button */}
      <div className="flex justify-center mb-4">
        <button
          onClick={handleSwapDirection}
          className="p-2 bg-dark-700 rounded-full hover:bg-dark-600 transition-colors"
        >
          <ArrowsUpDownIcon className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* To Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-medium text-gray-300">To</label>
          <span className="text-sm text-gray-400">
            Balance: {formatBalance(toTokenBalance)}
          </span>
        </div>

        <div className="bg-dark-700 rounded-xl p-4 border border-dark-500">
          <div className="flex justify-between items-center mb-3">
            {/* Chain Selector */}
            <div className="relative">
              <button
                onClick={() => setShowToChainList(!showToChainList)}
                className="flex items-center space-x-2 bg-dark-600 rounded-lg px-3 py-2 border border-dark-500 hover:bg-dark-500 transition-colors"
              >
                <img
                  src={getChainLogo(swapState.toChain)}
                  alt="Chain logo"
                  className="w-6 h-6 rounded-full"
                />
                <span className="text-sm font-medium text-white">
                  {CHAINS.find((c) => c.id === swapState.toChain)?.name}
                </span>
                <ChevronDownIcon className="w-4 h-4 text-gray-400" />
              </button>

              {showToChainList && (
                <div className="absolute top-full left-0 mt-2 bg-dark-600 border border-dark-500 rounded-lg shadow-lg z-10 min-w-full">
                  {CHAINS.map((chain) => (
                    <button
                      key={chain.id}
                      onClick={() => {
                        setSwapState((prev) => ({
                          ...prev,
                          toChain: chain.id,
                          toToken: TOKENS[chain.id][0],
                        }));
                        setShowToChainList(false);
                      }}
                      className="w-full flex items-center space-x-2 px-3 py-2 hover:bg-dark-500 transition-colors"
                    >
                      <img
                        src={getChainLogo(chain.id)}
                        alt={`${chain.name} logo`}
                        className="w-6 h-6 rounded-full"
                      />
                      <span className="text-sm text-white">{chain.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Token Selector */}
            <div className="relative">
              <button
                onClick={() => setShowToTokenList(!showToTokenList)}
                className="flex items-center space-x-2 bg-dark-600 rounded-lg px-3 py-2 border border-dark-500 hover:bg-dark-500 transition-colors"
              >
                <img
                  src={swapState.toToken.logo}
                  alt={`${swapState.toToken.symbol} logo`}
                  className="w-6 h-6 rounded-full"
                />
                <span className="text-sm font-medium text-white">
                  {swapState.toToken.symbol}
                </span>
                <ChevronDownIcon className="w-4 h-4 text-gray-400" />
              </button>

              {showToTokenList && (
                <div className="absolute top-full right-0 mt-2 bg-dark-600 border border-dark-500 rounded-lg shadow-lg z-10 min-w-full">
                  {TOKENS[swapState.toChain].map((token) => (
                    <button
                      key={token.address}
                      onClick={() => {
                        setSwapState((prev) => ({
                          ...prev,
                          toToken: token,
                        }));
                        setShowToTokenList(false);
                      }}
                      className="w-full flex items-center space-x-2 px-3 py-2 hover:bg-dark-500 transition-colors"
                    >
                      <img
                        src={token.logo}
                        alt={`${token.symbol} logo`}
                        className="w-6 h-6 rounded-full"
                      />
                      <span className="text-sm text-white">{token.symbol}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <input
            type="number"
            placeholder="0.0"
            value={swapState.toAmount}
            onChange={(e) =>
              setSwapState((prev) => ({ ...prev, toAmount: e.target.value }))
            }
            className="w-full bg-transparent text-2xl font-bold text-white outline-none"
          />
        </div>
      </div>

      {/* Exchange Fee */}
      <div className="mb-6 p-4 bg-dark-700 rounded-xl">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">Exchange Fee</span>
          <span className="text-sm font-medium text-white">0.001 ETH</span>
        </div>

        <div className="flex justify-between items-center mt-2">
          <span className="text-sm text-gray-400">Allowance</span>
          <span className="text-sm font-medium text-white">
            {allowance != null
              ? formatUnits(allowance as bigint, swapState.fromToken.decimals)
              : "0.00"}
          </span>
        </div>
      </div>

      {/* Action Button */}
      {!isConnected ? (
        <div className="w-full text-center py-3 px-6 bg-dark-600 text-gray-400 rounded-xl">
          Please connect your wallet
        </div>
      ) : !swapState.fromAmount || !swapState.toAmount ? (
        <div className="w-full text-center py-3 px-6 bg-dark-600 text-gray-400 rounded-xl">
          Enter amounts to continue
        </div>
      ) : !validateAmount(swapState.fromAmount, fromTokenBalance) ? (
        <div className="w-full text-center py-3 px-6 bg-red-600 text-white rounded-xl">
          Amount exceeds balance
        </div>
      ) : needsApproval() ? (
        <button
          onClick={handleApprove}
          disabled={isApproving}
          className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
        >
          {isApproving
            ? "Setting spending cap..."
            : `Approve spending of ${swapState.fromAmount} ${swapState.fromToken.symbol}`}
        </button>
      ) : (
        <button
          onClick={handleSwap}
          disabled={isLoading}
          className="w-full bg-accent-purple hover:bg-accent-purple/80 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
        >
          {isLoading ? "Exchanging..." : "Create Real Limit Order"}
        </button>
      )}
    </div>
  );
}

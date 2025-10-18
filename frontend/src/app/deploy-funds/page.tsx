"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import OpenOrders from "../components/OpenOrders";
import TokenHoldings from "../components/TokenHoldings";
import RealSwapComponent from "../components/RealSwapComponent";
import { SwapState, Token } from "../types/order";
import { apiService } from "../services/api";

interface NetworkInfo {
  name: string;
  chainId: number;
  rpcUrl: string;
  symbol: string;
  icon: string;
}

const networks: NetworkInfo[] = [
  {
    name: "Ethereum Sepolia",
    chainId: 11155111,
    rpcUrl: "https://sepolia.infura.io/v3/",
    symbol: "ETH",
    icon: "/ethereum.png",
  },
  {
    name: "Monad Testnet",
    chainId: 10143,
    rpcUrl: "https://testnet-rpc.monad.xyz",
    symbol: "MON",
    icon: "/monad.png",
  },
];

export default function DeployFundsPage() {
  const [activeTab, setActiveTab] = useState<"real-swap" | "bridge" | "orders">(
    "real-swap"
  );
  const [fromNetwork, setFromNetwork] = useState<NetworkInfo>(networks[0]);
  const [toNetwork, setToNetwork] = useState<NetworkInfo>(networks[1]);
  const [amount, setAmount] = useState<string>("");
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isConnected, setIsConnected] = useState<boolean>(false);
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [txHash, setTxHash] = useState<string>("");
  const [currentChainId, setCurrentChainId] = useState<number | null>(null);

  // Limit order states
  const [limitOrderAmount, setLimitOrderAmount] = useState<string>("");
  const [limitOrderPrice, setLimitOrderPrice] = useState<string>("");
  const [limitOrderType, setLimitOrderType] = useState<"buy" | "sell">("buy");

  const checkCurrentChain = async () => {
    if (window.ethereum) {
      try {
        const chainId = await window.ethereum.request({
          method: "eth_chainId",
        });
        setCurrentChainId(parseInt(chainId, 16));
      } catch (error) {
        console.error("Failed to get chain ID:", error);
      }
    }
  };

  useEffect(() => {
    checkCurrentChain();
  }, []);

  const switchNetwork = async (network: NetworkInfo) => {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${network.chainId.toString(16)}` }],
      });
    } catch (error: unknown) {
      if ((error as { code?: number }).code === 4902) {
        // Network not added, try to add it
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: `0x${network.chainId.toString(16)}`,
                chainName: network.name,
                rpcUrls: [network.rpcUrl],
                nativeCurrency: {
                  name: network.symbol,
                  symbol: network.symbol,
                  decimals: 18,
                },
              },
            ],
          });
        } catch (addError) {
          console.error("Failed to add network:", addError);
        }
      }
    }
  };

  const handleSwap = async () => {
    if (!amount || !isConnected || !window.ethereum) return;

    setIsLoading(true);
    try {
      // Switch to source network first
      await switchNetwork(fromNetwork);

      // Simulate transaction (in real implementation, you'd call your bridge contract)
      const tx = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: walletAddress,
            to: "0x0000000000000000000000000000000000000000", // Bridge contract address
            value: `0x${(parseFloat(amount) * Math.pow(10, 18)).toString(16)}`,
            gas: "0x5208", // 21000 gas
          },
        ],
      });

      setTxHash(tx);

      // Switch to destination network
      await switchNetwork(toNetwork);
    } catch (error) {
      console.error("Transaction failed:", error);
      alert("Transaction failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const swapNetworks = () => {
    const temp = fromNetwork;
    setFromNetwork(toNetwork);
    setToNetwork(temp);
  };

  const createLimitOrder = async () => {
    if (!limitOrderAmount || !limitOrderPrice) return;

    // Create token objects for the order
    const fromToken: Token = {
      symbol: fromNetwork.symbol,
      name: fromNetwork.name,
      address: "0x0000000000000000000000000000000000000000", // Native token
      decimals: 18,
    };

    const toToken: Token = {
      symbol: toNetwork.symbol,
      name: toNetwork.name,
      address: "0x0000000000000000000000000000000000000000", // Native token
      decimals: 18,
    };

    const swapState: SwapState = {
      fromChain: fromNetwork.chainId,
      toChain: toNetwork.chainId,
      fromToken,
      toToken,
      fromAmount: limitOrderAmount,
      toAmount: limitOrderPrice,
      userAddress: walletAddress,
    };

    // Order data for backend
    const orderData = {
      swapState,
      fromToken,
      toToken,
      status: "CREATED" as const,
      message: `Limit ${limitOrderType} order created for ${limitOrderAmount} ${fromToken.symbol} at ${limitOrderPrice} ${toToken.symbol}`,
      transactions: {},
    };

    // Save to backend
    try {
      const response = await apiService.createOrder(orderData);

      if (response.success) {
        // Reset form
        setLimitOrderAmount("");
        setLimitOrderPrice("");
        alert("Limit order created successfully!");
      } else {
        alert("Failed to create limit order. Please try again.");
      }
    } catch (error) {
      console.error("Error creating limit order:", error);
      alert("Failed to create limit order. Please try again.");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Deploy Funds</h1>
        <p className="text-gray-400">
          Bridge your assets between Ethereum Sepolia and Monad Testnet
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-dark-700 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab("real-swap")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === "real-swap"
                ? "bg-accent-purple text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Real Swap
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === "orders"
                ? "bg-accent-purple text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Limit Orders
          </button>
          <button
            onClick={() => setActiveTab("bridge")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === "bridge"
                ? "bg-accent-purple text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Bridge Assets
          </button>
        </div>
      </div>

      {/* Bridge Interface */}
      {activeTab === "bridge" && (
        <div className="bg-dark-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-6">
            Bridge Assets
          </h2>

          {/* From Network */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              From
            </label>
            <div className="bg-dark-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <Image
                    src={fromNetwork.icon}
                    alt={fromNetwork.name}
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                  <div>
                    <p className="text-white font-medium">{fromNetwork.name}</p>
                    <p className="text-gray-400 text-sm">
                      Chain ID: {fromNetwork.chainId}
                    </p>
                  </div>
                </div>
                {currentChainId !== fromNetwork.chainId && (
                  <button
                    onClick={() => switchNetwork(fromNetwork)}
                    className="text-accent-purple hover:text-accent-purple/80 text-sm"
                  >
                    Switch Network
                  </button>
                )}
              </div>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="0.0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="flex-1 bg-dark-600 text-white px-4 py-3 rounded-lg border border-dark-500 focus:border-accent-purple focus:outline-none"
                />
                <button className="bg-dark-600 hover:bg-dark-500 text-white px-4 py-3 rounded-lg">
                  {fromNetwork.symbol}
                </button>
              </div>
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center my-4">
            <button
              onClick={swapNetworks}
              className="bg-dark-600 hover:bg-dark-500 p-3 rounded-full transition-colors"
            >
              <i className="fa-solid fa-arrow-up-arrow-down text-white"></i>
            </button>
          </div>

          {/* To Network */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              To
            </label>
            <div className="bg-dark-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <Image
                    src={toNetwork.icon}
                    alt={toNetwork.name}
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                  <div>
                    <p className="text-white font-medium">{toNetwork.name}</p>
                    <p className="text-gray-400 text-sm">
                      Chain ID: {toNetwork.chainId}
                    </p>
                  </div>
                </div>
                {currentChainId !== toNetwork.chainId && (
                  <button
                    onClick={() => switchNetwork(toNetwork)}
                    className="text-accent-purple hover:text-accent-purple/80 text-sm"
                  >
                    Switch Network
                  </button>
                )}
              </div>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="0.0"
                  value={amount}
                  readOnly
                  className="flex-1 bg-dark-600 text-white px-4 py-3 rounded-lg border border-dark-500"
                />
                <button className="bg-dark-600 text-white px-4 py-3 rounded-lg">
                  {toNetwork.symbol}
                </button>
              </div>
            </div>
          </div>

          {/* Transaction Details */}
          {amount && (
            <div className="bg-dark-700 rounded-lg p-4 mb-6">
              <h3 className="text-white font-medium mb-2">
                Transaction Details
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Amount:</span>
                  <span className="text-white">
                    {amount} {fromNetwork.symbol}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Bridge Fee:</span>
                  <span className="text-white">0.001 {fromNetwork.symbol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Estimated Time:</span>
                  <span className="text-white">2-5 minutes</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={handleSwap}
              disabled={!amount || !isConnected || isLoading}
              className="flex-1 bg-accent-purple hover:bg-accent-purple/80 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : (
                "Deploy Funds"
              )}
            </button>
          </div>

          {/* Transaction Hash */}
          {txHash && (
            <div className="mt-6 bg-green-900/20 border border-green-500/30 rounded-lg p-4">
              <h3 className="text-green-400 font-medium mb-2">
                Transaction Successful!
              </h3>
              <p className="text-gray-300 text-sm mb-2">Transaction Hash:</p>
              <p className="text-green-400 font-mono text-sm break-all">
                {txHash}
              </p>
              <a
                href={`https://sepolia.etherscan.io/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent-purple hover:text-accent-purple/80 text-sm mt-2 inline-block"
              >
                View on Etherscan →
              </a>
            </div>
          )}
        </div>
      )}

      {/* Real Swap Interface */}
      {activeTab === "real-swap" && (
        <div className="space-y-6">
          <RealSwapComponent />
        </div>
      )}

      {/* Limit Orders Interface */}
      {activeTab === "orders" && (
        <div className="space-y-6">
          {/* Token Holdings */}
          <TokenHoldings />

          {/* Create Limit Order Form */}
          <div className="bg-dark-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-6">
              Create Limit Order
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Order Type */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Order Type
                </label>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setLimitOrderType("buy")}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                      limitOrderType === "buy"
                        ? "bg-green-600 text-white"
                        : "bg-dark-600 text-gray-400 hover:text-white"
                    }`}
                  >
                    Buy
                  </button>
                  <button
                    onClick={() => setLimitOrderType("sell")}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                      limitOrderType === "sell"
                        ? "bg-red-600 text-white"
                        : "bg-dark-600 text-gray-400 hover:text-white"
                    }`}
                  >
                    Sell
                  </button>
                </div>
              </div>

              {/* Networks */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Networks
                </label>
                <div className="bg-dark-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Image
                        src={fromNetwork.icon}
                        alt={fromNetwork.name}
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                      <div>
                        <p className="text-white font-medium">
                          {fromNetwork.name}
                        </p>
                        <p className="text-gray-400 text-sm">
                          Chain ID: {fromNetwork.chainId}
                        </p>
                      </div>
                    </div>
                    <div className="text-gray-400">→</div>
                    <div className="flex items-center space-x-3">
                      <Image
                        src={toNetwork.icon}
                        alt={toNetwork.name}
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                      <div>
                        <p className="text-white font-medium">
                          {toNetwork.name}
                        </p>
                        <p className="text-gray-400 text-sm">
                          Chain ID: {toNetwork.chainId}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Amount and Price */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Amount ({fromNetwork.symbol})
                </label>
                <input
                  type="number"
                  placeholder="0.0"
                  value={limitOrderAmount}
                  onChange={(e) => setLimitOrderAmount(e.target.value)}
                  className="w-full bg-dark-600 text-white px-4 py-3 rounded-lg border border-dark-500 focus:border-accent-purple focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Price ({toNetwork.symbol})
                </label>
                <input
                  type="number"
                  placeholder="0.0"
                  value={limitOrderPrice}
                  onChange={(e) => setLimitOrderPrice(e.target.value)}
                  className="w-full bg-dark-600 text-white px-4 py-3 rounded-lg border border-dark-500 focus:border-accent-purple focus:outline-none"
                />
              </div>
            </div>

            {/* Order Summary */}
            {limitOrderAmount && limitOrderPrice && (
              <div className="bg-dark-700 rounded-lg p-4 mt-6">
                <h3 className="text-white font-medium mb-2">Order Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Type:</span>
                    <span className="text-white capitalize">
                      {limitOrderType}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Amount:</span>
                    <span className="text-white">
                      {limitOrderAmount} {fromNetwork.symbol}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Price:</span>
                    <span className="text-white">
                      {limitOrderPrice} {toNetwork.symbol}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Value:</span>
                    <span className="text-white">
                      {(
                        parseFloat(limitOrderAmount) *
                        parseFloat(limitOrderPrice)
                      ).toFixed(6)}{" "}
                      {toNetwork.symbol}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Create Order Button */}
            <div className="mt-6">
              <button
                onClick={createLimitOrder}
                disabled={!limitOrderAmount || !limitOrderPrice}
                className="w-full bg-accent-purple hover:bg-accent-purple/80 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Create Limit Order
              </button>
            </div>
          </div>

          {/* Orders List */}
          <OpenOrders />
        </div>
      )}
    </div>
  );
}

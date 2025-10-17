"use client";
import React, { useState } from "react";

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
    icon: "🔷",
  },
  {
    name: "Monad Testnet",
    chainId: 10143,
    rpcUrl: "https://testnet-rpc.monad.xyz",
    symbol: "MON",
    icon: "🔶",
  },
];

export default function DeployFundsPage() {
  const [fromNetwork, setFromNetwork] = useState<NetworkInfo>(networks[0]);
  const [toNetwork, setToNetwork] = useState<NetworkInfo>(networks[1]);
  const [amount, setAmount] = useState<string>("");
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isConnected, setIsConnected] = useState<boolean>(false);
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [txHash, setTxHash] = useState<string>("");

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

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Deploy Funds</h1>
        <p className="text-gray-400">
          Bridge your assets between Ethereum Sepolia and Monad Testnet
        </p>
      </div>

      {/* Bridge Interface */}
      <div className="bg-dark-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Bridge Assets</h2>

        {/* From Network */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            From
          </label>
          <div className="bg-dark-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{fromNetwork.icon}</span>
                <div>
                  <p className="text-white font-medium">{fromNetwork.name}</p>
                  <p className="text-gray-400 text-sm">
                    Chain ID: {fromNetwork.chainId}
                  </p>
                </div>
              </div>
              <button
                onClick={() => switchNetwork(fromNetwork)}
                className="text-accent-purple hover:text-accent-purple/80 text-sm"
              >
                Switch Network
              </button>
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
                <span className="text-2xl">{toNetwork.icon}</span>
                <div>
                  <p className="text-white font-medium">{toNetwork.name}</p>
                  <p className="text-gray-400 text-sm">
                    Chain ID: {toNetwork.chainId}
                  </p>
                </div>
              </div>
              <button
                onClick={() => switchNetwork(toNetwork)}
                className="text-accent-purple hover:text-accent-purple/80 text-sm"
              >
                Switch Network
              </button>
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
            <h3 className="text-white font-medium mb-2">Transaction Details</h3>
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
    </div>
  );
}

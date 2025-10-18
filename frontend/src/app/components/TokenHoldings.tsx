"use client";

import { useEffect, useState } from "react";
import { formatUnits } from "viem";

interface TokenInfo {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  logo: string;
}

const SEPOLIA_TOKENS: TokenInfo[] = [
  {
    symbol: "ETH",
    name: "Ethereum",
    address: "0x0000000000000000000000000000000000000000", // Native token
    decimals: 18,
    logo: "/ethereum.png",
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    address: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238", // USDC on Sepolia
    decimals: 6,
    logo: "/usdc.svg",
  },
];

interface TokenBalance {
  token: TokenInfo;
  balance: string;
  usdValue?: string;
}

export default function TokenHoldings() {
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [walletAddress, setWalletAddress] = useState<string>("");

  useEffect(() => {
    // Check if wallet is connected
    if (window.ethereum) {
      window.ethereum
        .request({ method: "eth_accounts" })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
            fetchBalances(accounts[0]);
          } else {
            setIsLoading(false);
          }
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchBalances = async (address: string) => {
    setIsLoading(true);
    try {
      const balancePromises = SEPOLIA_TOKENS.map(async (token) => {
        let balance = "0";

        if (token.symbol === "ETH") {
          // Fetch native ETH balance
          const ethBalance = await window.ethereum.request({
            method: "eth_getBalance",
            params: [address, "latest"],
          });
          balance = formatUnits(BigInt(ethBalance), token.decimals);
        } else {
          // Fetch ERC-20 token balance
          try {
            const tokenBalance = await window.ethereum.request({
              method: "eth_call",
              params: [
                {
                  to: token.address,
                  data: `0x70a08231000000000000000000000000${address.slice(2)}`,
                },
                "latest",
              ],
            });
            balance = formatUnits(BigInt(tokenBalance), token.decimals);
          } catch (error) {
            console.error(`Error fetching ${token.symbol} balance:`, error);
            balance = "0";
          }
        }

        return {
          token,
          balance,
        };
      });

      const tokenBalances = await Promise.all(balancePromises);
      setBalances(tokenBalances);
    } catch (error) {
      console.error("Error fetching balances:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatBalance = (balance: string, decimals: number) => {
    const num = parseFloat(balance);
    if (num === 0) return "0.00";
    if (num < 0.01) return "< 0.01";
    return num.toFixed(4);
  };

  const getTotalValue = () => {
    // Simple calculation - in a real app you'd fetch USD prices
    const ethBalance = balances.find((b) => b.token.symbol === "ETH");
    const usdcBalance = balances.find((b) => b.token.symbol === "USDC");

    if (!ethBalance || !usdcBalance) return "0.00";

    // Mock ETH price of $2000 for demo
    const ethValue = parseFloat(ethBalance.balance) * 2000;
    const usdcValue = parseFloat(usdcBalance.balance);

    return (ethValue + usdcValue).toFixed(2);
  };

  if (!walletAddress) {
    return (
      <div className="bg-dark-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Token Holdings
        </h3>
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-dark-700 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <p className="text-gray-400">
            Connect your wallet to view token holdings
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-dark-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Token Holdings</h3>
        <div className="text-right">
          <p className="text-sm text-gray-400">Total Value</p>
          <p className="text-lg font-bold text-white">${getTotalValue()}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {SEPOLIA_TOKENS.map((token) => (
            <div
              key={token.symbol}
              className="flex items-center justify-between p-3 bg-dark-700 rounded-lg animate-pulse"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-600 rounded-full"></div>
                <div>
                  <div className="h-4 bg-gray-600 rounded w-16 mb-1"></div>
                  <div className="h-3 bg-gray-600 rounded w-12"></div>
                </div>
              </div>
              <div className="h-4 bg-gray-600 rounded w-20"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {balances.map(({ token, balance }) => (
            <div
              key={token.symbol}
              className="flex items-center justify-between p-3 bg-dark-700 rounded-lg hover:bg-dark-600 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  <img
                    src={token.logo}
                    alt={`${token.symbol} logo`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to text symbol if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = `<div class="w-full h-full bg-gray-600 rounded-full flex items-center justify-center"><span class="text-xs font-bold text-white">${
                          token.symbol === "ETH" ? "Ξ" : "$"
                        }</span></div>`;
                      }
                    }}
                  />
                </div>
                <div>
                  <p className="text-white font-medium">{token.symbol}</p>
                  <p className="text-gray-400 text-sm">{token.name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-semibold">
                  {formatBalance(balance, token.decimals)}
                </p>
                <p className="text-gray-400 text-sm">
                  {token.symbol === "ETH" ? "ETH" : "USDC"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-dark-600">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Network:</span>
          <span className="text-white">Ethereum Sepolia</span>
        </div>
        <div className="flex items-center justify-between text-sm mt-1">
          <span className="text-gray-400">Address:</span>
          <span className="text-white font-mono text-xs">
            {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </span>
        </div>
      </div>
    </div>
  );
}

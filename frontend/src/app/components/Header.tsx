"use client";
import React from "react";
import { useAuth } from "../contexts/AuthContext";

export default function Header() {
  const { login, logout, isAuthenticated, isLoading, user, address } =
    useAuth();

  const formatAddress = (addr: string) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <header className="h-16 px-2 sm:px-4 lg:px-6 flex items-center justify-between border-b border-dark-600 bg-dark-800 sticky top-0 z-20">
      <div className="flex items-center"></div>

      <div className="flex items-center gap-4">
        {isAuthenticated && address ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-accent-purple rounded-full flex items-center justify-center">
                <i className="fa-solid fa-wallet text-white text-sm"></i>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-white font-medium">
                  {formatAddress(address)}
                </span>
                <span className="text-xs text-dark-text-secondary">
                  Connected
                </span>
              </div>
            </div>

            <button
              onClick={logout}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <button
            onClick={login}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-accent-purple rounded-lg hover:bg-accent-purple/80 disabled:opacity-50 transition-colors"
          >
            {isLoading ? "Connecting..." : "Connect Wallet"}
          </button>
        )}
      </div>
    </header>
  );
}

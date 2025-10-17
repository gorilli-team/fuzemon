"use client";
import type { ReactNode } from "react";
import { PrivyProvider } from "@privy-io/react-auth";
import { defineChain } from "viem";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./contexts/AuthContext";

// Define a simple chain for Fuzemon
export const fuzemonChain = defineChain({
  id: 1,
  name: "Ethereum",
  network: "ethereum",
  nativeCurrency: {
    decimals: 18,
    name: "Ethereum",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: ["https://eth.llamarpc.com"],
    },
    public: {
      http: ["https://eth.llamarpc.com"],
    },
  },
  blockExplorers: {
    default: {
      name: "Etherscan",
      url: "https://etherscan.io",
    },
  },
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: ReactNode }) {
  const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

  // If no Privy App ID, render without Privy to prevent crashes
  if (!privyAppId) {
    return (
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{children}</AuthProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <PrivyProvider
        appId={privyAppId}
        config={{
          appearance: {
            theme: "dark",
            accentColor: "#843DFF",
          },
          supportedChains: [fuzemonChain],
          loginMethods: [
            "email",
            "google",
            "apple",
            "discord",
            "twitter",
            "wallet",
          ],
        }}
      >
        <AuthProvider>{children}</AuthProvider>
      </PrivyProvider>
    </QueryClientProvider>
  );
}

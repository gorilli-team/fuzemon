import { createConfig, http } from "wagmi";
import { sepolia, baseSepolia } from "wagmi/chains";
import { injected, metaMask, walletConnect } from "wagmi/connectors";

// Define custom Monad testnet chain
export const monadTestnet = {
  id: 10143,
  name: "Monad Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Monad",
    symbol: "MON",
  },
  rpcUrls: {
    default: {
      http: ["https://testnet-rpc.monad.xyz"],
    },
    public: {
      http: ["https://testnet-rpc.monad.xyz"],
    },
  },
  blockExplorers: {
    default: {
      name: "Monad Explorer",
      url: "https://testnet-explorer.monad.xyz",
    },
  },
  testnet: true,
} as const;

export const config = createConfig({
  chains: [sepolia, baseSepolia, monadTestnet],
  connectors: [
    injected(),
    metaMask(),
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "",
    }),
  ],
  transports: {
    [sepolia.id]: http(),
    [baseSepolia.id]: http(),
    [monadTestnet.id]: http(),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}

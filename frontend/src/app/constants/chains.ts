export interface ChainInfo {
  id: number;
  name: string;
  rpcUrl: string;
  symbol: string;
  icon: string;
  blockExplorer: string;
}

export const CHAINS: ChainInfo[] = [
  {
    id: 84532, // Base Sepolia
    name: "Base Sepolia",
    rpcUrl: "https://base-sepolia-rpc.publicnode.com",
    symbol: "ETH",
    icon: "/ethereum.png",
    blockExplorer: "https://sepolia.basescan.org",
  },
  {
    id: 10143, // Monad Testnet
    name: "Monad Testnet",
    rpcUrl: "https://testnet-rpc.monad.xyz",
    symbol: "MON",
    icon: "/monad.png",
    blockExplorer: "https://testnet-explorer.monad.xyz",
  },
];

export const getChainName = (chainId: number): string => {
  const chain = CHAINS.find((c) => c.id === chainId);
  return chain?.name || `Chain ${chainId}`;
};

export const getChainLogo = (chainId: number): string => {
  const chain = CHAINS.find((c) => c.id === chainId);
  return chain?.icon || "/ethereum.png";
};

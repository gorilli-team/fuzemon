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
    id: 11155111, // Ethereum Sepolia
    name: "Ethereum Sepolia",
    rpcUrl: "https://sepolia.infura.io/v3/",
    symbol: "ETH",
    icon: "/ethereum.png",
    blockExplorer: "https://sepolia.etherscan.io",
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

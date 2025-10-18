export interface Token {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  logo: string;
}

export const TOKENS: Record<number, Token[]> = {
  84532: [
    // Base Sepolia
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
      address: "0x036CbD53842c5426634e7929541eC2318f3dCF7e", // Base Sepolia USDC
      decimals: 6,
      logo: "/usdc.svg",
    },
  ],
  11155111: [
    // ETH Sepolia
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
      address: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238", // ETH Sepolia USDC
      decimals: 6,
      logo: "/usdc.svg",
    },
  ],
  10143: [
    // Monad Testnet
    {
      symbol: "MON",
      name: "Monad",
      address: "0x0000000000000000000000000000000000000000", // Native token
      decimals: 18,
      logo: "/monad.png",
    },
    {
      symbol: "USDC",
      name: "USD Coin",
      address: "0x62534e4bbd6d9ebac0ac99aeaa0aa48e56372df0", // Monad Testnet USDC
      decimals: 6,
      logo: "/usdc.svg",
    },
  ],
};

export const LOP_ADDRESSES: Record<number, string> = {
  84532: "0xe30f9abbadc1eb84b41d41035b2a2c7d0bd5f9b2", // Base Sepolia - AggregationRouterV6 (Limit Order Protocol)
  11155111: "0x1111111254EEB25477B68fb85Ed929f73A960582", // ETH Sepolia - AggregationRouterV6 (Limit Order Protocol)
  10143: "0xCAEa711010565904d3427b74794e3F36c191a6e7", // Monad Testnet - AggregationRouterV6 (Limit Order Protocol)
};

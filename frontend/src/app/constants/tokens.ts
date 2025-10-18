export interface Token {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  logo: string;
}

export const TOKENS: Record<number, Token[]> = {
  11155111: [
    // Ethereum Sepolia
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
      address: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238", // Sepolia USDC
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
  ],
};

export const LOP_ADDRESSES: Record<number, string> = {
  11155111: "0x111111125421cA6dc452d289314280a0f8842A65", // Ethereum Sepolia - AggregationRouterV6 (Limit Order Protocol)
  10143: "0xCAEa711010565904d3427b74794e3F36c191a6e7", // Monad Testnet - AggregationRouterV6 (Limit Order Protocol)
};

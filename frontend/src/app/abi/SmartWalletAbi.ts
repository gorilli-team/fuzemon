export const SmartWalletAbi = [
  {
    type: "constructor",
    inputs: [
      {
        name: "user",
        type: "address",
        internalType: "address",
      },
      {
        name: "usdc",
        type: "address",
        internalType: "address",
      },
      {
        name: "factoryV2",
        type: "address",
        internalType: "address",
      },
      {
        name: "router",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "buyTokens",
    inputs: [
      {
        name: "tokenOut",
        type: "address",
        internalType: "address",
      },
      {
        name: "amountOut",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "amountInMax",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "depositUSDC",
    inputs: [
      {
        name: "amount",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "i_factoryV2",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "i_owner",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "i_router",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "i_usdc",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "sellTokens",
    inputs: [
      {
        name: "tokenIn",
        type: "address",
        internalType: "address",
      },
      {
        name: "amountIn",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "amountOutMin",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "withdrawAllUSDC",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "withdrawUSDC",
    inputs: [
      {
        name: "amount",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    name: "BuyTokens",
    inputs: [
      {
        name: "smartWallet",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "pair",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "tokenIn",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "tokenOut",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "operator",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "amountIn",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "amountOut",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "amountInMax",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "DepositUSDC",
    inputs: [
      {
        name: "usdc",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "amount",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "SellTokens",
    inputs: [
      {
        name: "smartWallet",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "pair",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "tokenIn",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "tokenOut",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "operator",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "amountIn",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "amountOut",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "amountOutMin",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "WithdrawUSDC",
    inputs: [
      {
        name: "usdc",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "amount",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "error",
    name: "SmartWallet__EmptyUSDCBalance",
    inputs: [],
  },
  {
    type: "error",
    name: "SmartWallet__InsufficientUSDCBalance",
    inputs: [],
  },
  {
    type: "error",
    name: "SmartWallet__InvalidAmount",
    inputs: [],
  },
  {
    type: "error",
    name: "SmartWallet__InvalidTokenAddress",
    inputs: [],
  },
  {
    type: "error",
    name: "SmartWallet__NotOperator",
    inputs: [],
  },
  {
    type: "error",
    name: "SmartWallet__NotOwner",
    inputs: [],
  },
  {
    type: "error",
    name: "SmartWallet__TransferFailed",
    inputs: [],
  },
] as const;

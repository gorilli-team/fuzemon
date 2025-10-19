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
        name: "router",
        type: "address",
        internalType: "address",
      },
      {
        name: "poolManager",
        type: "address",
        internalType: "address",
      },
      {
        name: "permit2",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "receive",
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "buyTokensV4",
    inputs: [
      {
        name: "key",
        type: "tuple",
        internalType: "struct PoolKey",
        components: [
          {
            name: "currency0",
            type: "address",
            internalType: "Currency",
          },
          {
            name: "currency1",
            type: "address",
            internalType: "Currency",
          },
          {
            name: "fee",
            type: "uint24",
            internalType: "uint24",
          },
          {
            name: "tickSpacing",
            type: "int24",
            internalType: "int24",
          },
          {
            name: "hooks",
            type: "address",
            internalType: "contract IHooks",
          },
        ],
      },
      {
        name: "zeroForOne",
        type: "bool",
        internalType: "bool",
      },
      {
        name: "amountOut",
        type: "uint128",
        internalType: "uint128",
      },
      {
        name: "amountInMax",
        type: "uint128",
        internalType: "uint128",
      },
      {
        name: "deadline",
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
    name: "i_permit2",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract IPermit2",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "i_poolManager",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract IPoolManager",
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
        internalType: "contract IUniversalRouter",
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
        internalType: "contract IERC20",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "s_isOperator",
    inputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "sellTokensV4",
    inputs: [
      {
        name: "key",
        type: "tuple",
        internalType: "struct PoolKey",
        components: [
          {
            name: "currency0",
            type: "address",
            internalType: "Currency",
          },
          {
            name: "currency1",
            type: "address",
            internalType: "Currency",
          },
          {
            name: "fee",
            type: "uint24",
            internalType: "uint24",
          },
          {
            name: "tickSpacing",
            type: "int24",
            internalType: "int24",
          },
          {
            name: "hooks",
            type: "address",
            internalType: "contract IHooks",
          },
        ],
      },
      {
        name: "zeroForOne",
        type: "bool",
        internalType: "bool",
      },
      {
        name: "amountIn",
        type: "uint128",
        internalType: "uint128",
      },
      {
        name: "amountOutMin",
        type: "uint128",
        internalType: "uint128",
      },
      {
        name: "deadline",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setOperator",
    inputs: [
      {
        name: "operator",
        type: "address",
        internalType: "address",
      },
      {
        name: "authorized",
        type: "bool",
        internalType: "bool",
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
    name: "AuthorizeOperator",
    inputs: [
      {
        name: "smartWallet",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "operator",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "authorized",
        type: "bool",
        indexed: false,
        internalType: "bool",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "BuyTokensV4",
    inputs: [
      {
        name: "smartWallet",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "poolId",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
      {
        name: "amountOut",
        type: "uint128",
        indexed: false,
        internalType: "uint128",
      },
      {
        name: "amountInMax",
        type: "uint128",
        indexed: false,
        internalType: "uint128",
      },
      {
        name: "deadline",
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
        name: "smartWallet",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "usdc",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "amount",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "SellTokensV4",
    inputs: [
      {
        name: "smartWallet",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "poolId",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
      {
        name: "amountIn",
        type: "uint128",
        indexed: false,
        internalType: "uint128",
      },
      {
        name: "amountOutMin",
        type: "uint128",
        indexed: false,
        internalType: "uint128",
      },
      {
        name: "deadline",
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
        name: "smartWallet",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "to",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "amount",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "usdc",
        type: "address",
        indexed: false,
        internalType: "address",
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
    name: "SmartWallet__InvalidOperatorAddress",
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
    name: "SmartWallet__PoolMustIncludeUSDC",
    inputs: [],
  },
  {
    type: "error",
    name: "SmartWallet__TransferFailed",
    inputs: [],
  },
] as const;

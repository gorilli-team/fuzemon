# Smart Wallet Integration for Fuzemon

This document describes the smart wallet functionality that has been integrated into the Fuzemon project, inspired by the Gorillionaire project architecture.

## Overview

The smart wallet system allows users to:
- Deploy smart wallets on Monad Testnet
- Deposit and withdraw USDC from smart wallets
- Trade tokens directly from smart wallets
- Manage multiple smart wallets per user

## Architecture

### Backend Components

#### Models
- **SmartWallet**: Stores user wallet to smart wallet mappings
- **SmartWalletTransaction**: Tracks all smart wallet transactions

#### API Endpoints
- `POST /api/smart-wallet` - Create a new smart wallet
- `GET /api/smart-wallet` - Get user's smart wallets
- `GET /api/smart-wallet/:id` - Get specific smart wallet
- `POST /api/smart-wallet/track-transaction` - Track smart wallet transactions
- `GET /api/smart-wallet/transactions` - Get transaction history

### Frontend Components

#### Hooks
- `useCreateSmartWallet` - Deploy new smart wallets
- `useDepositUSDC` - Deposit USDC to smart wallets
- `useWithdrawUSDC` - Withdraw USDC from smart wallets
- `useSmartWalletTrading` - Execute trades from smart wallets

#### Components
- `SmartWalletManager` - Main management interface
- `SmartWalletInfo` - Display wallet details and balances
- `CreateSmartWalletModal` - Smart wallet deployment form
- `DepositModal` - USDC deposit interface
- `WithdrawModal` - USDC withdrawal interface
- `SmartWalletTrading` - Trading interface for smart wallets

## Smart Contract Integration

### Smart Wallet Factory
- **ABI**: `SmartWalletFactoryAbi.ts`
- **Function**: `createSmartWallet(usdc, router, poolManager, permit2)`
- **Event**: `SmartWalletCreated(user, smartWallet)`

### Smart Wallet Contract
- **ABI**: `SmartWalletAbi.ts`
- **Functions**:
  - `depositUSDC(amount)` - Deposit USDC
  - `withdrawUSDC(amount)` - Withdraw USDC
  - `buyTokensV4(...)` - Buy tokens using Uniswap V4
  - `sellTokensV4(...)` - Sell tokens using Uniswap V4

## Environment Variables

Add these to your `.env.local`:

```bash
# Smart Wallet Configuration
NEXT_PUBLIC_SMART_WALLET_FACTORY_MONAD=0x...
NEXT_PUBLIC_USDC_ADDRESS_MONAD=0x...
NEXT_PUBLIC_UNIVERSAL_ROUTER_MONAD=0x...
NEXT_PUBLIC_POOL_MANAGER_MONAD=0x...
NEXT_PUBLIC_PERMIT2_MONAD=0x...
```

**Note:** All smart wallet parameters are automatically configured from environment variables. Users don't need to manually input contract addresses when creating smart wallets.

## Usage

### 1. Deploy Smart Wallet

```typescript
const { createSmartWallet } = useCreateSmartWallet();

const { user, smartWallet } = await createSmartWallet(
  usdcAddress,
  universalRouterAddress,
  poolManagerAddress,
  permit2Address
);
```

### 2. Deposit USDC

```typescript
const { depositUSDC } = useDepositUSDC();

await depositUSDC(smartWalletAddress, parseUnits("100", 6));
```

### 3. Withdraw USDC

```typescript
const { withdrawUSDC } = useWithdrawUSDC();

await withdrawUSDC(smartWalletAddress, parseUnits("50", 6));
```

### 4. Trade Tokens

```typescript
const { buyTokensV4, sellTokensV4 } = useSmartWalletTrading();

// Buy tokens
await buyTokensV4(
  smartWalletAddress,
  poolKey,
  true, // zeroForOne
  amountOut,
  amountInMax,
  deadline
);

// Sell tokens
await sellTokensV4(
  smartWalletAddress,
  poolKey,
  false, // zeroForOne
  amountIn,
  amountOutMin,
  deadline
);
```

## Navigation

The smart wallet functionality is accessible via:
- **URL**: `/smart-wallet`
- **Sidebar**: "Smart Wallet" menu item

## Features

### Smart Wallet Management
- Create multiple smart wallets per user
- View wallet addresses and balances
- Track transaction history

### Deposit/Withdraw
- Deposit USDC from user wallet to smart wallet
- Withdraw USDC from smart wallet to user wallet
- Real-time balance updates

### Trading
- Buy tokens using USDC from smart wallet
- Sell tokens for USDC in smart wallet
- Uniswap V4 integration for trading
- Slippage protection

### Transaction Tracking
- All smart wallet transactions are tracked in the database
- Support for deposit, withdraw, buy, and sell actions
- Transaction metadata and status tracking

## Database Schema

### SmartWallet Collection
```typescript
{
  userWallet: string;      // User's wallet address
  smartWallet: string;      // Smart wallet address
  chainId: number;         // Chain ID (Monad Testnet)
  createdAt: Date;
  updatedAt: Date;
}
```

### SmartWalletTransaction Collection
```typescript
{
  smartWalletAddress: string;
  tokenSymbol: string;
  tokenAmount: number;
  tokenPrice: number;
  action: 'deposit' | 'withdraw' | 'buy' | 'sell';
  usdValue: number;
  txHash: string;
  timestamp: number;
  status: 'pending' | 'completed' | 'failed';
  metadata?: {
    source?: string;
    signalId?: string;
  };
}
```

## Security Considerations

- Smart wallets are deployed with user as owner
- All transactions require user signature
- Smart wallet contracts include operator authorization
- USDC transfers are protected by standard ERC-20 security

## Future Enhancements

- Multi-signature smart wallets
- Automated trading strategies
- Portfolio analytics
- Cross-chain smart wallet support
- Integration with more DEX protocols

## Troubleshooting

### Common Issues

1. **Smart wallet creation fails**
   - Check contract addresses in environment variables
   - Ensure sufficient gas for deployment
   - Verify user has connected wallet

2. **Deposit/withdraw fails**
   - Check USDC allowance for smart wallet
   - Ensure sufficient USDC balance
   - Verify smart wallet address is correct

3. **Trading fails**
   - Check token addresses and pool configuration
   - Verify sufficient USDC balance in smart wallet
   - Ensure slippage tolerance is appropriate

### Debug Mode

Enable debug logging by setting:
```bash
NODE_ENV=development
```

This will provide detailed transaction logs and error messages.

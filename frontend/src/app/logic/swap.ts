"use client";
import {
  Address,
  AuctionDetails,
  CrossChainOrder,
  HashLock,
  randBigInt,
  TimeLocks,
} from "@1inch/cross-chain-sdk";
import { parseUnits } from "viem";
import { ChainConfigs } from "../constants/contracts";

// Type definitions for SDK compatibility
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EvmAddress = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AddressLike = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EvmChain = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupportedChain = any;

export const createOrder = async (
  srcChainUserAddress: string,
  makingAmount: string,
  takingAmount: string,
  srcTokenAddress: string,
  dstTokenAddress: string,
  secret: string,
  srcChainId: number,
  dstChainId: number,
  srcTokenDecimals: number = 18,
  dstTokenDecimals: number = 18
): Promise<{
  order: CrossChainOrder;
  orderdata: {
    domain: Record<string, unknown>;
    types: Record<string, unknown>;
    primaryType: string;
    message: Record<string, unknown>;
  };
  secret: string;
}> => {
  const escrowFactoryAddress = ChainConfigs[srcChainId].EscrowFactory;
  const srcTimestamp = BigInt(Math.floor(Date.now() / 1000));

  // Create order info with enhanced randomness
  const salt = randBigInt(1000000); // Increased randomness
  const orderInfo = {
    makerAsset: new Address(srcTokenAddress) as EvmAddress,
    takerAsset: new Address(dstTokenAddress) as AddressLike,
    makingAmount: parseUnits(makingAmount, srcTokenDecimals),
    takingAmount: parseUnits(takingAmount, dstTokenDecimals),
    maker: new Address(srcChainUserAddress) as EvmAddress,
    salt: salt,
  };

  console.log("🔢 Order salt:", salt.toString());

  // Create escrow parameters
  const escrowParams = {
    hashLock: HashLock.forSingleFill(secret),
    timeLocks: TimeLocks.new({
      srcWithdrawal: BigInt(10), // 10sec finality lock for test
      srcPublicWithdrawal: BigInt(120), // 2m for private withdrawal
      srcCancellation: BigInt(121), // 1sec public withdrawal
      srcPublicCancellation: BigInt(122), // 1sec private cancellation
      dstWithdrawal: BigInt(10), // 10sec finality lock for test
      dstPublicWithdrawal: BigInt(100), // 100sec private withdrawal
      dstCancellation: BigInt(101), // 1sec public withdrawal
    }),
    srcChainId: srcChainId as EvmChain,
    dstChainId: dstChainId as SupportedChain,
    srcSafetyDeposit: ChainConfigs[srcChainId].SafetyDeposit,
    dstSafetyDeposit: ChainConfigs[dstChainId].SafetyDeposit,
  };

  // Create auction details
  const details = {
    auction: new AuctionDetails({
      initialRateBump: 0,
      points: [],
      duration: BigInt(120),
      startTime: BigInt(srcTimestamp),
    }),
    whitelist: [
      {
        address: new Address(
          ChainConfigs[srcChainId].ResolverContractAddress
        ) as EvmAddress,
        allowFrom: BigInt(0),
      },
    ],
    resolvingStartTime: BigInt(0),
  };

  // Create extra options with enhanced randomness
  const nonce = randBigInt(1000000); // Increased randomness
  const extra = {
    nonce: nonce,
    allowPartialFills: false,
    allowMultipleFills: false,
  };

  console.log("🔢 Order nonce:", nonce.toString());

  const order = CrossChainOrder.new(
    new Address(escrowFactoryAddress) as EvmAddress,
    orderInfo,
    escrowParams,
    details,
    extra
  );

  console.log("📦 Order created:", order);
  console.log("🔑 Order hash:", order.getOrderHash(srcChainId));

  const orderTypedData = order.getTypedData(srcChainId);
  const orderdata = {
    domain: {
      name: "1inch Limit Order Protocol",
      version: "4",
      chainId: srcChainId,
      verifyingContract: ChainConfigs[srcChainId].LOP,
    },
    types: orderTypedData.types,
    primaryType: orderTypedData.primaryType,
    message: orderTypedData.message,
  };

  return { order, orderdata, secret };
};

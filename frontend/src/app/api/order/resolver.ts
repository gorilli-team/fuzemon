import * as Sdk from "@1inch/cross-chain-sdk";
import { Interface, Signature } from "ethers";
import ResolverABI from "./abi/Resolver.json";

// Define TransactionData type
interface TransactionData {
  to: string;
  data: string;
  value: bigint;
}

// Use the actual Resolver ABI from the JSON file
const RESOLVER_ABI = ResolverABI;

export const deploySrcCallData = (
  srcAddress: string,
  signature: string,
  immutables: Sdk.ImmutablesData,
  takerTraits: unknown,
  amount: bigint,
  orderHash: string,
  hashLock: Sdk.HashLock,
  orderBuild: unknown,
  srcSafetyDeposit: bigint
) => {
  // Removed client-side logging to reduce noise

  const { r, yParityAndS: vs } = Signature.from(signature);

  // Ensure r and vs are proper hex strings
  const rHex =
    typeof r === "string" ? r : (r as { toString(): string }).toString();
  const vsHex =
    typeof vs === "string" ? vs : (vs as { toString(): string }).toString();
  const { trait } = takerTraits as { args: unknown; trait: unknown };

  // Structure immutables as a tuple object with named properties
  const immutablesTuple = {
    orderHash: orderHash, // orderHash (bytes32)
    hashlock:
      "0x0000000000000000000000000000000000000000000000000000000000000000", // hashlock (bytes32) - using default for now
    maker: BigInt(immutables.maker.toString()), // maker (uint256)
    taker: BigInt(immutables.taker.toString()), // taker (uint256)
    token: BigInt(immutables.token.toString()), // token (uint256)
    amount: BigInt(immutables.amount), // amount (uint256)
    safetyDeposit: BigInt(immutables.safetyDeposit), // safetyDeposit (uint256)
    timelocks: BigInt(immutables.timelocks), // timelocks (uint256)
  };

  // Structure order as a tuple object with named properties
  const order = orderBuild as {
    salt: bigint;
    maker: bigint;
    receiver: bigint;
    makerAsset: bigint;
    takerAsset: bigint;
    makingAmount: bigint;
    takingAmount: bigint;
    makerTraits: bigint;
  };

  // Ensure all values are properly converted to BigInt, handling Address objects
  const orderTuple = {
    salt: BigInt(order.salt), // salt (uint256)
    maker: BigInt(order.maker.toString()), // maker (uint256)
    receiver: BigInt(order.receiver.toString()), // receiver (uint256)
    makerAsset: BigInt(order.makerAsset.toString()), // makerAsset (uint256)
    takerAsset: BigInt(order.takerAsset.toString()), // takerAsset (uint256)
    makingAmount: BigInt(order.makingAmount), // makingAmount (uint256)
    takingAmount: BigInt(order.takingAmount), // takingAmount (uint256)
    makerTraits: BigInt(order.makerTraits), // makerTraits (uint256)
  };

  // Removed debug logging to reduce noise

  try {
    // Debug logging to see what we're passing
    console.log(
      "DEBUG: immutablesTuple:",
      JSON.stringify(immutablesTuple, (key, value) =>
        typeof value === "bigint" ? value.toString() : value
      )
    );
    console.log(
      "DEBUG: orderTuple:",
      JSON.stringify(orderTuple, (key, value) =>
        typeof value === "bigint" ? value.toString() : value
      )
    );
    console.log("DEBUG: rHex:", rHex);
    console.log("DEBUG: vsHex:", vsHex);
    console.log("DEBUG: amount:", amount);
    console.log("DEBUG: trait:", trait);

    const encodedData = new Interface(RESOLVER_ABI).encodeFunctionData(
      "deploySrc",
      [
        immutablesTuple,
        orderTuple,
        rHex,
        vsHex,
        BigInt(amount),
        BigInt(trait as string | number),
        "0x", // args - empty bytes for now
      ]
    );

    // Removed success logging to reduce noise

    return {
      to: srcAddress,
      data: encodedData,
      value: srcSafetyDeposit,
    };
  } catch (error) {
    console.error(`[RESOLVER ERROR] deploySrcCallData encoding failed:`, {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });
    throw error;
  }
};

export const deployDstCallData = (
  dstAddress: string,
  immutablesData: Sdk.ImmutablesData,
  privateCancellation: bigint,
  safetyDeposit: bigint
): TransactionData => {
  return {
    to: dstAddress,
    data: new Interface(RESOLVER_ABI).encodeFunctionData("deployDst", [
      immutablesData,
      privateCancellation,
    ]),
    value: safetyDeposit,
  };
};
export const withdrawCallData = (
  side: "src" | "dst",
  escrow: string,
  secret: string,
  immutables: Sdk.ImmutablesData,
  toAddress: string
) => {
  return {
    to: toAddress,
    data: new Interface(RESOLVER_ABI).encodeFunctionData("withdraw", [
      escrow,
      secret,
      immutables,
    ]),
  };
};

// Use SDK types instead of custom interfaces

class Resolver {
  private iface: Interface;
  public srcAddress: string;
  public dstAddress: string;

  constructor(srcAddress: string, dstAddress: string) {
    this.srcAddress = srcAddress;
    this.dstAddress = dstAddress;
    this.iface = new Interface(RESOLVER_ABI);
  }

  deploySrc(
    chainId: number,
    order: Sdk.CrossChainOrder,
    signature: string,
    takerTraits: Sdk.TakerTraits,
    fillAmount: bigint
  ): TransactionData {
    // This method should be used with the SDK's built-in transaction handling
    // The working example shows: resolverContract.deploySrc(chainId, order, signature, takerTraits, fillAmount)
    // This returns transaction data that can be sent via the SDK's transaction system

    // Using manual parameter construction approach

    // Extract basic data from the order
    const orderHash = order.getOrderHash(chainId);

    // Use the existing deploySrcCallData function with extracted data
    return deploySrcCallData(
      this.srcAddress,
      signature,
      {} as Sdk.ImmutablesData, // immutables - should be extracted from order
      takerTraits,
      fillAmount,
      orderHash,
      {} as Sdk.HashLock, // hashLock - should be extracted from order
      order,
      BigInt(0) // safetyDeposit - should be extracted from order
    );
  }

  deployDst(immutables: Sdk.Immutables): TransactionData {
    return {
      to: this.dstAddress,
      data: this.iface.encodeFunctionData("deployDst", [
        immutables.build(),
        immutables.timeLocks.toSrcTimeLocks().privateCancellation,
      ]),
      value: immutables.safetyDeposit,
    };
  }

  withdraw(
    side: "src" | "dst",
    escrow: Sdk.Address,
    secret: string,
    immutables: Sdk.Immutables
  ): TransactionData {
    return {
      to: side === "src" ? this.srcAddress : this.dstAddress,
      data: this.iface.encodeFunctionData("withdraw", [
        escrow.toString(),
        secret,
        immutables.build(),
      ]),
      value: BigInt(0),
    };
  }

  cancel(
    side: "src" | "dst",
    escrow: Sdk.Address,
    immutables: Sdk.Immutables
  ): TransactionData {
    return {
      to: side === "src" ? this.srcAddress : this.dstAddress,
      data: this.iface.encodeFunctionData("cancel", [
        escrow.toString(),
        immutables.build(),
      ]),
      value: BigInt(0),
    };
  }
}

export { Resolver };

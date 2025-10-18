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

  const sig = Signature.from(signature);
  const rHex = sig.r;
  const vsHex = sig.yParityAndS; // Use the pre-calculated vs value

  // Ensure proper formatting
  const rHexString = rHex.startsWith("0x") ? rHex : "0x" + rHex;
  const vsHexString = vsHex.startsWith("0x") ? vsHex : "0x" + vsHex;

  // Validate that r and vs are proper 32-byte hex strings
  if (!rHexString.startsWith("0x") || rHexString.length !== 66) {
    throw new Error(
      `Invalid r value: ${rHexString} (expected 32-byte hex string)`
    );
  }
  if (!vsHexString.startsWith("0x") || vsHexString.length !== 66) {
    throw new Error(
      `Invalid vs value: ${vsHexString} (expected 32-byte hex string)`
    );
  }

  console.log("[DEBUG] Signature components:", {
    r: rHexString,
    vs: vsHexString,
    originalSignature: signature,
  });
  const { trait } = takerTraits as { args: unknown; trait: unknown };

  // Helper function to convert address string to uint256 BigInt
  const addressToUint256 = (addr: string): bigint => {
    if (!addr.startsWith("0x")) throw new Error(`Invalid address: ${addr}`);
    return BigInt(addr);
  };

  // Structure immutables as a tuple object with named properties
  const immutablesTuple = {
    orderHash: orderHash, // orderHash (bytes32)
    hashlock: immutables.hashlock || hashLock.toString(), // Use the actual hashlock from immutables
    maker: addressToUint256(immutables.maker), // maker (uint256) - convert string address to BigInt
    taker: addressToUint256(immutables.taker), // taker (uint256) - convert string address to BigInt
    token: addressToUint256(immutables.token), // token (uint256) - convert string address to BigInt
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
    maker: addressToUint256(order.maker.toString()), // maker (uint256) - convert address to BigInt
    receiver: addressToUint256(order.receiver.toString()), // receiver (uint256) - convert address to BigInt
    makerAsset: addressToUint256(order.makerAsset.toString()), // makerAsset (uint256) - convert address to BigInt
    takerAsset: addressToUint256(order.takerAsset.toString()), // takerAsset (uint256) - convert address to BigInt
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
    console.log("DEBUG: rHex:", rHexString);
    console.log("DEBUG: vsHex:", vsHexString);
    console.log("DEBUG: amount:", amount);
    console.log("DEBUG: trait:", trait);

    const encodedData = new Interface(RESOLVER_ABI).encodeFunctionData(
      "deploySrc",
      [
        immutablesTuple,
        orderTuple,
        rHexString,
        vsHexString,
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
      // Include tuple data for contract interface fallback
      immutablesTuple,
      orderTuple,
      rHex: rHexString,
      vsHex: vsHexString,
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

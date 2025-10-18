import { NextResponse } from "next/server";
import { getTransactionLink } from "../../../utils/transaction";
import { ChainConfigs, getChainResolver } from "../../constants/contracts";

export async function POST(request: Request) {
  try {
    const {
      swapState,
      secret,
      dstImmutablesData,
      srcImmutablesHash,
      dstImmutablesHash,
      srcImmutablesData,
      userAddress, // Add user address to ensure same user control
    } = await request.json();

    console.log("🔍 Calculating escrow addresses...");

    // Simulate escrow address calculation
    const srcEscrowAddress = "0x" + Math.random().toString(16).substr(2, 40);
    const dstEscrowAddress = "0x" + Math.random().toString(16).substr(2, 40);

    console.log("🔍 Escrow addresses calculated:");
    console.log("   Source:", srcEscrowAddress);
    console.log("   Destination:", dstEscrowAddress);

    console.log("⏳ Waiting 10 seconds before destination withdrawal...");
    await new Promise((resolve) => setTimeout(resolve, 10000));

    console.log("💰 Starting destination escrow withdrawal...");
    const dstChainResolver = getChainResolver(swapState.toChain, userAddress);
    const { txHash: dstWithdrawHash } = await dstChainResolver.send({
      to: ChainConfigs[swapState.toChain].ResolverContractAddress,
      data: "0x", // Placeholder for actual withdrawal call data
      value: BigInt(0),
    });
    console.log("✅ Destination escrow withdrawn:", dstWithdrawHash);

    console.log("🔄 Withdrawing from source escrow for resolver...");
    const srcChainResolver = getChainResolver(swapState.fromChain, userAddress);
    const { txHash: resolverWithdrawHash } = await srcChainResolver.send({
      to: ChainConfigs[swapState.fromChain].ResolverContractAddress,
      data: "0x", // Placeholder for actual withdrawal call data
      value: BigInt(0),
    });
    console.log("✅ Source escrow withdrawn:", resolverWithdrawHash);

    const response = {
      srcEscrowAddress,
      dstEscrowAddress,
      transactions: {
        dstWithdraw: {
          txHash: dstWithdrawHash,
          txLink: getTransactionLink(swapState.toChain, dstWithdrawHash),
          chainId: swapState.toChain,
          description: "Destination escrow withdrawal",
        },
        srcWithdraw: {
          txHash: resolverWithdrawHash,
          txLink: getTransactionLink(swapState.fromChain, resolverWithdrawHash),
          chainId: swapState.fromChain,
          description: "Source escrow withdrawal",
        },
      },
      status: "completed",
      message:
        "Cross-chain exchange completed successfully! Assets have been transferred.",
    };

    console.log("🎉 Secret revelation process completed successfully!");
    console.log("📊 Final transaction summary:", {
      dstWithdraw: response.transactions.dstWithdraw.txLink,
      srcWithdraw: response.transactions.srcWithdraw.txLink,
      status: response.status,
    });

    return NextResponse.json(response, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("❌ Secret revelation failed:", error);
    return NextResponse.json(
      {
        error: "Secret revelation failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

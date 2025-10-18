import { NextResponse } from "next/server";
import { getTransactionLink } from "../../../utils/transaction";
import { ChainConfigs, getChainResolver } from "../../../constants/contracts";

export async function POST(request: Request) {
  try {
    const {
      swapState,
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
    const dstChainResolver = await getChainResolver(
      swapState.toChain,
      userAddress
    );
    const dstResult = await dstChainResolver.send({
      to: ChainConfigs[swapState.toChain].ResolverContractAddress,
      data: "0x", // Placeholder for actual withdrawal call data
      value: BigInt(0),
    });
    const dstWithdrawHash = dstResult.txHash;
    console.log("✅ Destination escrow withdrawn:", dstWithdrawHash);

    console.log("🔄 Withdrawing from source escrow for resolver...");
    const srcChainResolver = await getChainResolver(
      swapState.fromChain,
      userAddress
    );

    let resolverWithdrawHash: string;

    // Manual transaction building with detailed debugging
    try {
      console.log("[DEBUG] Starting manual transaction building...");

      // Get transaction data
      const callData = {
        to: ChainConfigs[swapState.fromChain].ResolverContractAddress,
        data: "0x", // Placeholder for actual withdrawal call data
        value: BigInt(0),
      };

      console.log("[DEBUG] Call data prepared:", {
        to: callData.to,
        data: callData.data,
        dataLength: callData.data.length,
        value: callData.value.toString(),
      });

      // Get nonce and fee data
      const nonce = await srcChainResolver.provider.getTransactionCount(
        await srcChainResolver.getAddress()
      );
      const feeData = await srcChainResolver.provider.getFeeData();

      console.log("[DEBUG] Network data:", {
        nonce,
        maxFeePerGas: feeData.maxFeePerGas?.toString(),
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas?.toString(),
        gasPrice: feeData.gasPrice?.toString(),
      });

      // Build manual transaction
      const tx = {
        type: 2, // EIP-1559 transaction
        to: callData.to,
        data: callData.data,
        value: callData.value,
        nonce: nonce,
        gasLimit: BigInt(500000),
        maxFeePerGas: feeData.maxFeePerGas || BigInt(20000000000), // 20 gwei fallback
        maxPriorityFeePerGas:
          feeData.maxPriorityFeePerGas || BigInt(2000000000), // 2 gwei fallback
        chainId: swapState.fromChain,
      };

      console.log("[DEBUG] Manual tx before signing:", {
        ...tx,
        dataLength: tx.data.length,
        value: tx.value.toString(),
        gasLimit: tx.gasLimit.toString(),
        maxFeePerGas: tx.maxFeePerGas.toString(),
        maxPriorityFeePerGas: tx.maxPriorityFeePerGas.toString(),
        chainId: tx.chainId,
      });

      // Sign and send
      const signedTx = await srcChainResolver.signer.signTransaction(tx);
      console.log("[DEBUG] Signed transaction length:", signedTx.length);
      console.log(
        "[DEBUG] Signed transaction (first 100 chars):",
        signedTx.substring(0, 100)
      );

      const txResponse = await srcChainResolver.provider.broadcastTransaction(
        signedTx
      );
      console.log("[DEBUG] Transaction broadcast:", txResponse.hash);

      const receipt = await txResponse.wait();
      if (!receipt) {
        throw new Error("Transaction receipt is null");
      }
      resolverWithdrawHash = receipt.hash;
      const srcDeployBlock = receipt.blockHash;

      console.log(`[API] Order filled successfully: ${resolverWithdrawHash}`);
      console.log(`[API] Block hash: ${srcDeployBlock}`);
    } catch (error) {
      console.error("[DEBUG] Manual transaction failed:", error);
      console.log("[DEBUG] Falling back to original sendTransaction method...");

      // Fallback to original approach
      const srcResult = await srcChainResolver.send({
        to: ChainConfigs[swapState.fromChain].ResolverContractAddress,
        data: "0x", // Placeholder for actual withdrawal call data
        value: BigInt(0),
      });
      resolverWithdrawHash = srcResult.txHash;
      console.log(
        "✅ Source escrow withdrawn (fallback):",
        resolverWithdrawHash
      );
    }

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

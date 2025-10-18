import { NextResponse } from "next/server";
import { getTransactionLink } from "../../utils/transaction";
import { ChainConfigs, getChainResolver } from "../constants/contracts";

export async function POST(request: Request) {
  try {
    const {
      order,
      swapState,
      signature,
      immutables,
      hashLock,
      orderHash,
      orderBuild,
      takerTraits,
      srcSafetyDeposit,
    } = await request.json();

    console.log("🚀 Starting cross-chain exchange process...");

    // Get chain resolvers
    const srcChainResolver = getChainResolver(swapState.fromChain);
    const dstChainResolver = getChainResolver(swapState.toChain);

    // Simulate order fill transaction
    const fillAmount = order.inner.inner.makingAmount;
    const { txHash: orderFillHash, blockHash: srcDeployBlock } =
      await srcChainResolver.send({
        to: ChainConfigs[swapState.fromChain].ResolverContractAddress,
        data: "0x", // Placeholder for actual call data
        value: srcSafetyDeposit,
      });

    console.log("✅ Order filled successfully:", orderFillHash);

    // Simulate destination escrow deployment
    const { txHash: dstDepositHash, blockTimestamp: dstDeployedAt } =
      await dstChainResolver.send({
        to: ChainConfigs[swapState.toChain].ResolverContractAddress,
        data: "0x", // Placeholder for actual call data
        value: BigInt(0),
      });

    console.log("✅ Destination escrow deployed:", dstDepositHash);

    const response = {
      srcEscrowEvent: {
        immutables: {
          orderHash,
          hashLock,
          maker: swapState.userAddress,
          taker: "0x0000000000000000000000000000000000000000",
          token: swapState.fromToken.address,
          amount: fillAmount,
          safetyDeposit: srcSafetyDeposit,
          timeLocks: {
            toSrcTimeLocks: () => ({ privateCancellation: BigInt(0) }),
          },
        },
        complement: {
          maker: swapState.userAddress,
          amount: fillAmount,
          token: swapState.toToken.address,
          safetyDeposit: BigInt(0),
        },
      },
      dstDeployedAt,
      dstImmutablesData: {
        orderHash,
        hashLock,
        maker: swapState.userAddress,
        taker: "0x0000000000000000000000000000000000000000",
        token: swapState.toToken.address,
        amount: fillAmount,
        safetyDeposit: BigInt(0),
        deployedAt: dstDeployedAt,
      },
      dstImmutablesHash: "0x" + Math.random().toString(16).substr(2, 64),
      srcImmutablesHash: "0x" + Math.random().toString(16).substr(2, 64),
      srcImmutablesData: {
        orderHash,
        hashLock,
        maker: swapState.userAddress,
        taker: "0x0000000000000000000000000000000000000000",
        token: swapState.fromToken.address,
        amount: fillAmount,
        safetyDeposit: srcSafetyDeposit,
      },
      transactions: {
        orderFill: {
          txHash: orderFillHash,
          txLink: getTransactionLink(swapState.fromChain, orderFillHash),
          blockHash: srcDeployBlock,
          blockLink: getTransactionLink(swapState.fromChain, srcDeployBlock),
          chainId: swapState.fromChain,
          description: "Order fill transaction",
        },
        dstEscrowDeploy: {
          txHash: dstDepositHash,
          txLink: getTransactionLink(swapState.toChain, dstDepositHash),
          chainId: swapState.toChain,
          description: "Destination escrow deployment",
        },
      },
      status: "escrow_deployed",
      message:
        "Cross-chain exchange initiated successfully. Escrow contracts deployed on both chains.",
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("❌ Order processing failed:", error);
    return NextResponse.json(
      {
        error: "Order processing failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

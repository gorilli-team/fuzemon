import { Address, Immutables } from "@1inch/cross-chain-sdk";
import { NextResponse } from "next/server";
import {
  getBlockExplorerLink,
  getTransactionLink,
} from "../../utils/transaction";
import { ChainConfigs, getChainResolver } from "../../constants/contracts";
import { getSrcDeployEvent } from "./escrow";
import { deploySrcCallData, Resolver } from "./resolver";

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
      userAddress, // Add user address to ensure same user control
    } = await request.json();

    console.log(`[API] Starting cross-chain exchange for user: ${userAddress}`);

    const resolverContract = new Resolver(
      ChainConfigs[swapState.fromChain].ResolverContractAddress,
      ChainConfigs[swapState.toChain].ResolverContractAddress
    );

    // The order data should contain the necessary properties
    const srcChainResolver = getChainResolver(swapState.fromChain, userAddress);

    const fillAmount = order.inner.inner.makingAmount;

    const callData = deploySrcCallData(
      ChainConfigs[swapState.fromChain].ResolverContractAddress,
      signature,
      immutables,
      takerTraits,
      fillAmount,
      orderHash,
      hashLock,
      orderBuild,
      srcSafetyDeposit
    );

    console.log(
      `[API] Sending order fill transaction for user: ${userAddress}`
    );
    const { txHash: orderFillHash, blockHash: srcDeployBlock } =
      await srcChainResolver.send(callData);
    console.log(`[API] Order filled successfully: ${orderFillHash}`);

    console.log(
      `[API] Fetching source escrow deployment event for user: ${userAddress}`
    );
    const srcEscrowEvent = await getSrcDeployEvent(
      srcChainResolver.provider,
      ChainConfigs[swapState.fromChain].EscrowFactory,
      srcDeployBlock
    );
    console.log(`[API] Source escrow event retrieved for user: ${userAddress}`);

    const dstImmutables = (srcEscrowEvent[0] as Immutables)
      .withComplement(srcEscrowEvent[1])
      .withTaker(new Address(resolverContract.dstAddress));

    console.log(`[API] Deploying destination escrow for user: ${userAddress}`);
    const dstChainResolver = getChainResolver(swapState.toChain, userAddress);
    const { txHash: dstDepositHash, blockTimestamp: dstDeployedAt } =
      await dstChainResolver.send(
        resolverContract.deployDst(dstImmutables as Immutables)
      );
    console.log(
      `[API] Destination escrow deployed: ${dstDepositHash} for user: ${userAddress}`
    );

    const dstImmutablesData = dstImmutables
      .withDeployedAt(dstDeployedAt)
      .build();
    const dstImmutablesHash = dstImmutables
      .withDeployedAt(dstDeployedAt)
      .hash();
    const srcImmutablesHash = (srcEscrowEvent[0] as Immutables).hash();
    const srcImmutablesData = (srcEscrowEvent[0] as Immutables).build();

    const res = {
      srcEscrowEvent: srcEscrowEvent,
      dstDeployedAt: dstDeployedAt,
      dstImmutablesData: dstImmutablesData,
      dstImmutablesHash: dstImmutablesHash,
      srcImmutablesHash: srcImmutablesHash,
      srcImmutablesData: srcImmutablesData,
      // Transaction information with links
      transactions: {
        orderFill: {
          txHash: orderFillHash,
          txLink: getTransactionLink(swapState.fromChain, orderFillHash),
          blockHash: srcDeployBlock,
          blockLink: getBlockExplorerLink(swapState.fromChain, srcDeployBlock),
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

    // Custom serializer to handle BigInt values
    const serializedRes = JSON.parse(
      JSON.stringify(res, (key, value) =>
        typeof value === "bigint" ? value.toString() : value
      )
    );

    console.log(
      `[API] Cross-chain exchange completed successfully for user: ${userAddress}`
    );
    return NextResponse.json(serializedRes, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error(`[API ERROR] /api/orders POST failed:`, {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        error: "Failed to process cross-chain exchange",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
        status: "error",
      },
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}

import { Address, Immutables } from "@1inch/cross-chain-sdk";
import { NextResponse } from "next/server";
import { Contract } from "ethers";
import {
  getBlockExplorerLink,
  getTransactionLink,
} from "../../utils/transaction";
import { ChainConfigs, getChainResolver } from "../../constants/contracts";
import { getSrcDeployEvent } from "./escrow";
import { deploySrcCallData, Resolver } from "./resolver";
import ResolverABI from "./abi/Resolver.json";

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
    const srcChainResolver = await getChainResolver(
      swapState.fromChain,
      userAddress
    );

    // Log the actual wallet address being used
    const walletAddress = await srcChainResolver.getAddress();
    console.log(
      `[API] Using wallet address: ${walletAddress} for user: ${userAddress}`
    );

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

    console.log(`[API] Call data:`, {
      to: callData.to,
      data: callData.data,
      value: callData.value.toString(),
      dataLength: callData.data.length,
      dataStartsWith0x: callData.data.startsWith("0x"),
      dataIsEmpty: callData.data === "" || callData.data === "0x",
    });

    console.log(
      `[API] Sending order fill transaction for user: ${userAddress}`
    );

    // Debug the transaction before sending
    console.log("[DEBUG] About to send transaction:", {
      to: callData.to,
      dataLength: callData.data.length,
      valueInWei: callData.value.toString(),
      from: await srcChainResolver.getAddress(),
    });

    // Try sending with explicit properties
    const txRequest = {
      to: callData.to,
      data: callData.data,
      value: callData.value,
    };

    console.log("[DEBUG] Transaction request:", txRequest);

    // Debug smart contract requirements before sending
    console.log("[DEBUG] Checking smart contract requirements...");

    // Check token approvals
    try {
      const ERC20_ABI = [
        "function allowance(address owner, address spender) view returns (uint256)",
        "function balanceOf(address account) view returns (uint256)",
      ];
      const tokenContract = new Contract(
        immutables.token,
        ERC20_ABI,
        srcChainResolver.provider
      );
      const allowance = await tokenContract.allowance(userAddress, callData.to);
      const tokenBalance = await tokenContract.balanceOf(userAddress);
      console.log("[DEBUG] Token allowance:", allowance.toString());
      console.log("[DEBUG] Token balance:", tokenBalance.toString());
      console.log("[DEBUG] Required amount:", fillAmount.toString());
    } catch (tokenError) {
      console.log("[DEBUG] Could not check token data:", tokenError);
    }

    // Check ETH balance
    try {
      const ethBalance = await srcChainResolver.provider.getBalance(
        userAddress
      );
      console.log("[DEBUG] ETH balance:", ethBalance.toString());
      console.log("[DEBUG] Required ETH value:", callData.value.toString());
    } catch (balanceError) {
      console.log("[DEBUG] Could not check ETH balance:", balanceError);
    }

    let orderFillHash: string;
    let srcDeployBlock: string;

    try {
      // ACTUALLY CALL sendTransaction - this is what was missing
      console.log("[DEBUG] Calling sendTransaction...");

      // Try with explicit gas limit to bypass estimation issues
      const txRequestWithGas = {
        ...txRequest,
        gasLimit: 500000, // Set explicit gas limit
      };

      const tx = await srcChainResolver.signer.sendTransaction(
        txRequestWithGas
      );
      console.log("[DEBUG] Transaction sent successfully:", tx.hash);

      const receipt = await tx.wait();
      if (!receipt) {
        throw new Error("Transaction receipt is null");
      }
      orderFillHash = receipt.hash;
      srcDeployBlock = receipt.blockHash;

      console.log(`[API] Order filled successfully: ${orderFillHash}`);
    } catch (sendError) {
      console.error("[DEBUG] sendTransaction failed:", sendError);

      // Only NOW try the contract interface approach
      console.log("[DEBUG] Attempting contract interface approach...");
      const contract = new Contract(
        callData.to,
        ResolverABI,
        srcChainResolver.signer // Use signer, not srcChainResolver
      );

      try {
        console.log(
          "[DEBUG] Contract interface approach - calling deploySrc..."
        );

        // Debug the parameters being passed to the contract
        console.log("[DEBUG] Contract call parameters:", {
          immutablesTuple: callData.immutablesTuple,
          orderTuple: callData.orderTuple,
          rHex: callData.rHex,
          vsHex: callData.vsHex,
          fillAmount: fillAmount.toString(),
          trait: BigInt(
            (takerTraits as { trait: string | number }).trait
          ).toString(),
          value: callData.value.toString(),
        });

        const tx = await contract.deploySrc(
          callData.immutablesTuple,
          callData.orderTuple,
          callData.rHex,
          callData.vsHex,
          fillAmount,
          BigInt((takerTraits as { trait: string | number }).trait),
          "0x", // args - empty bytes
          {
            value: callData.value,
            gasLimit: 500000, // Set explicit gas limit for contract call too
          }
        );

        const receipt = await tx.wait();
        if (!receipt) {
          throw new Error("Transaction receipt is null");
        }
        orderFillHash = receipt.hash;
        srcDeployBlock = receipt.blockHash;

        console.log(
          `[API] Order filled successfully via contract interface: ${orderFillHash}`
        );
      } catch (contractError) {
        console.error("[DEBUG] Contract interface failed:", contractError);
        console.error(`[API] Transaction failed:`, {
          error:
            contractError instanceof Error
              ? contractError.message
              : "Unknown error",
          callData: {
            to: callData.to,
            data: callData.data,
            value: callData.value.toString(),
          },
        });
        throw contractError;
      }
    }

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
    const dstChainResolver = await getChainResolver(
      swapState.toChain,
      userAddress
    );
    const dstCallData = resolverContract.deployDst(dstImmutables as Immutables);
    const dstResult = await dstChainResolver.send(dstCallData);
    const dstDepositHash = dstResult.txHash;
    const dstDeployedAt = dstResult.blockTimestamp;
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

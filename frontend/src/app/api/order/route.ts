import { Address, Immutables } from "@1inch/cross-chain-sdk";
import { NextResponse } from "next/server";
import { Contract, ethers } from "ethers";
import {
  getBlockExplorerLink,
  getTransactionLink,
} from "../../utils/transaction";
import { ChainConfigs, getChainResolver } from "../../constants/contracts";
import { getSrcDeployEvent } from "./escrow";
import { deploySrcCallData, Resolver } from "./resolver";

export async function POST(request: Request) {
  try {
    const requestBody = await request.json();
    console.log("[DEBUG] Raw request body keys:", Object.keys(requestBody));

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
    } = requestBody;

    console.log(`[API] Starting cross-chain exchange for user: ${userAddress}`);

    // Debug what we actually received
    console.log("[DEBUG] Received order object:", order);
    console.log("[DEBUG] Received orderBuild:", orderBuild);
    console.log("[DEBUG] Received orderHash:", orderHash);
    console.log("[DEBUG] Received signature:", signature);
    console.log("[DEBUG] Received immutables:", immutables);
    console.log("[DEBUG] Received takerTraits:", takerTraits);

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

    // Check if we have a valid order object, if not use orderBuild
    let orderToUse = order;
    if (!order || Object.keys(order).length === 0) {
      console.log(
        "[DEBUG] Order object is empty/undefined, using orderBuild instead"
      );
      orderToUse = orderBuild;
    }

    // CRITICAL: Validate order hash consistency to prevent signature mismatch
    let finalOrderHash: string;

    // First, try to compute the order hash from the order object
    let computedOrderHash: string | null = null;
    try {
      if (order && order.getOrderHash) {
        computedOrderHash = order.getOrderHash(swapState.fromChain);
        console.log(
          "[DEBUG] Computed order hash from order object:",
          computedOrderHash
        );
      } else if (orderToUse && orderToUse.getOrderHash) {
        computedOrderHash = orderToUse.getOrderHash(swapState.fromChain);
        console.log(
          "[DEBUG] Computed order hash from orderToUse:",
          computedOrderHash
        );
      }
    } catch (hashError) {
      console.log(
        "[DEBUG] Could not compute order hash from order object:",
        hashError
      );
    }

    // Determine which order hash to use based on consistency
    if (computedOrderHash && orderHash && computedOrderHash === orderHash) {
      // Perfect match - signature was created for this order hash
      finalOrderHash = orderHash;
      console.log(
        "[DEBUG] ✅ Order hash validation passed - using received orderHash:",
        finalOrderHash
      );
    } else if (
      computedOrderHash &&
      immutables.orderHash &&
      computedOrderHash === immutables.orderHash
    ) {
      // Order hash matches immutables - use immutables orderHash
      finalOrderHash = immutables.orderHash;
      console.log(
        "[DEBUG] ✅ Order hash matches immutables - using immutables orderHash:",
        finalOrderHash
      );
    } else {
      // Mismatch detected - this will likely cause transaction to revert
      console.error("[CRITICAL] Order hash mismatch detected!");
      console.error("[CRITICAL] Received orderHash:", orderHash);
      console.error("[CRITICAL] Computed orderHash:", computedOrderHash);
      console.error("[CRITICAL] Immutables orderHash:", immutables.orderHash);
      console.error(
        "[CRITICAL] This will cause transaction to revert due to signature mismatch!"
      );

      // Use the computed hash if available, otherwise use immutables
      finalOrderHash = computedOrderHash || immutables.orderHash;
      console.log(
        "[DEBUG] Using computed order hash as fallback:",
        finalOrderHash
      );
    }

    const callData = deploySrcCallData(
      ChainConfigs[swapState.fromChain].ResolverContractAddress,
      signature,
      immutables,
      takerTraits,
      fillAmount,
      finalOrderHash, // Use the corrected order hash
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

    // Log the function being called
    const functionSelector = callData.data.slice(0, 10);
    console.log(`[API] Function selector: ${functionSelector}`);
    console.log(
      `[API] Function being called: ${
        functionSelector === "0xca218276" ? "deploySrc" : "unknown"
      }`
    );

    // Log chain information
    console.log(
      `[API] Source chain: ${swapState.fromChain} (${
        swapState.fromChain === 11155111 ? "Sepolia" : "Unknown"
      })`
    );
    console.log(
      `[API] Destination chain: ${swapState.toChain} (${
        swapState.toChain === 10143 ? "Monad Testnet" : "Unknown"
      })`
    );
    console.log(`[API] Contract address: ${callData.to}`);
    console.log(
      `[API] Resolver contract for source chain: ${
        ChainConfigs[swapState.fromChain].ResolverContractAddress
      }`
    );

    // Debug order signature and validation
    console.log("[DEBUG] Order signature validation:");
    console.log("[DEBUG] Received orderHash:", orderHash);
    console.log("[DEBUG] Signature:", signature);
    console.log("[DEBUG] Final order hash being used:", finalOrderHash);

    // CRITICAL: Validate that the signature matches the order being executed
    if (finalOrderHash !== orderHash) {
      console.error("[CRITICAL] SIGNATURE MISMATCH DETECTED!");
      console.error(
        "[CRITICAL] The signature was created for orderHash:",
        orderHash
      );
      console.error(
        "[CRITICAL] But we're trying to execute with orderHash:",
        finalOrderHash
      );
      console.error("[CRITICAL] This will cause the transaction to revert!");
      console.error(
        "[CRITICAL] The smart contract will reject this as an invalid signature!"
      );

      // This is a critical error - the transaction will fail
      throw new Error(
        `Signature mismatch: signature was created for orderHash ${orderHash} but trying to execute with ${finalOrderHash}`
      );
    }

    // Fix: Access the nested order structure with proper object handling
    let orderStructure = {};
    if (orderToUse && orderToUse.inner && orderToUse.inner.inner) {
      orderStructure = {
        salt: orderToUse.inner.inner._salt?.toString(),
        maker:
          orderToUse.inner.inner.maker?.val?.toString() ||
          orderToUse.inner.inner.maker?.toString(),
        receiver:
          orderToUse.inner.inner.receiver?.val?.toString() ||
          orderToUse.inner.inner.receiver?.toString(),
        makerAsset:
          orderToUse.inner.inner.makerAsset?.val?.toString() ||
          orderToUse.inner.inner.makerAsset?.toString(),
        takerAsset:
          orderToUse.inner.inner.takerAsset?.val?.toString() ||
          orderToUse.inner.inner.takerAsset?.toString(),
        makingAmount: orderToUse.inner.inner.makingAmount?.toString(),
        takingAmount: orderToUse.inner.inner.takingAmount?.toString(),
        makerTraits:
          orderToUse.inner.inner.makerTraits?.val?.toString() ||
          orderToUse.inner.inner.makerTraits?.toString(),
      };
    } else {
      orderStructure = {
        salt: orderToUse?.salt?.toString(),
        maker: orderToUse?.maker?.toString(),
        receiver: orderToUse?.receiver?.toString(),
        makerAsset: orderToUse?.makerAsset?.toString(),
        takerAsset: orderToUse?.takerAsset?.toString(),
        makingAmount: orderToUse?.makingAmount?.toString(),
        takingAmount: orderToUse?.takingAmount?.toString(),
        makerTraits: orderToUse?.makerTraits?.toString(),
      };
    }

    console.log("[DEBUG] Order structure:", orderStructure);
    console.log("[DEBUG] Taker traits:", takerTraits);
    console.log("[DEBUG] Fill amount:", fillAmount.toString());
    console.log("[DEBUG] User address:", userAddress);
    console.log("[DEBUG] Wallet address:", await srcChainResolver.getAddress());

    // Check if order has already been filled
    try {
      console.log("[DEBUG] Checking if order has already been filled...");
      // This would require checking the contract state or events
      // For now, we'll log that we're proceeding with the order
      console.log(
        "[DEBUG] Proceeding with order execution (assuming not filled)"
      );

      // Suggestion: If this order keeps failing, try creating a fresh order
      // with a new salt/nonce to ensure it hasn't been executed before
      console.log(
        "[DEBUG] NOTE: If this order fails repeatedly, try creating a fresh order with a new salt"
      );
    } catch (orderCheckError) {
      console.log("[DEBUG] Could not check order status:", orderCheckError);
    }

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

    // 1. Check ETH balance for safety deposit
    const ethBalance = await srcChainResolver.provider.getBalance(
      await srcChainResolver.getAddress()
    );
    console.log("[DEBUG] ETH Balance:", ethers.formatEther(ethBalance));
    console.log(
      "[DEBUG] Required safety deposit:",
      ethers.formatEther(callData.value)
    );
    console.log(
      "[DEBUG] ETH balance sufficient:",
      ethBalance >= callData.value
    );

    // 2. Verify the LOP contract address the resolver expects
    const resolverInterface = new ethers.Interface([
      "function _LOP() view returns (address)",
    ]);
    try {
      const lopAddress = await srcChainResolver.provider.call({
        to: ChainConfigs[swapState.fromChain].ResolverContractAddress,
        data: resolverInterface.encodeFunctionData("_LOP"),
      });
      const decodedLOP = resolverInterface.decodeFunctionResult(
        "_LOP",
        lopAddress
      )[0];
      console.log("[DEBUG] Resolver expects LOP at:", decodedLOP);
      console.log(
        "[DEBUG] Config LOP address:",
        ChainConfigs[swapState.fromChain].LOP
      );
      console.log(
        "[DEBUG] LOP addresses match:",
        decodedLOP.toLowerCase() ===
          ChainConfigs[swapState.fromChain].LOP.toLowerCase()
      );
    } catch (e) {
      console.log(
        "[DEBUG] Could not read LOP address from resolver:",
        e instanceof Error ? e.message : "Unknown error"
      );
    }

    // 3. Verify the escrow factory address
    const factoryInterface = new ethers.Interface([
      "function _FACTORY() view returns (address)",
    ]);
    try {
      const factoryAddress = await srcChainResolver.provider.call({
        to: ChainConfigs[swapState.fromChain].ResolverContractAddress,
        data: factoryInterface.encodeFunctionData("_FACTORY"),
      });
      const decodedFactory = factoryInterface.decodeFunctionResult(
        "_FACTORY",
        factoryAddress
      )[0];
      console.log("[DEBUG] Resolver expects Factory at:", decodedFactory);
      console.log(
        "[DEBUG] Config Factory address:",
        ChainConfigs[swapState.fromChain].EscrowFactory
      );
      console.log(
        "[DEBUG] Factory addresses match:",
        decodedFactory.toLowerCase() ===
          ChainConfigs[swapState.fromChain].EscrowFactory.toLowerCase()
      );
    } catch (e) {
      console.log(
        "[DEBUG] Could not read Factory address from resolver:",
        e instanceof Error ? e.message : "Unknown error"
      );
    }

    // 4. Check if the resolver contract has the required ETH for safety deposit
    const resolverEthBalance = await srcChainResolver.provider.getBalance(
      ChainConfigs[swapState.fromChain].ResolverContractAddress
    );
    console.log(
      "[DEBUG] Resolver ETH balance:",
      ethers.formatEther(resolverEthBalance)
    );
    console.log(
      "[DEBUG] Required safety deposit:",
      ethers.formatEther(callData.value)
    );

    // 5. Verify the order parameters are valid
    console.log("[DEBUG] Order validation:");
    console.log("[DEBUG] - Order hash:", finalOrderHash);
    console.log("[DEBUG] - Signature:", signature);
    console.log("[DEBUG] - Immutables token:", immutables.token);
    console.log("[DEBUG] - Immutables amount:", immutables.amount);
    console.log("[DEBUG] - Fill amount:", fillAmount.toString());
    console.log("[DEBUG] - Taker traits:", takerTraits);

    // 6. Check if the LOP contract exists and is valid
    try {
      const lopCode = await srcChainResolver.provider.getCode(
        ChainConfigs[swapState.fromChain].LOP
      );
      console.log("[DEBUG] LOP contract code length:", lopCode.length);
      console.log("[DEBUG] LOP contract exists:", lopCode !== "0x");
    } catch (e) {
      console.log(
        "[DEBUG] Could not check LOP contract:",
        e instanceof Error ? e.message : "Unknown error"
      );
    }

    // 7. Check if the EscrowFactory contract exists and is valid
    try {
      const factoryCode = await srcChainResolver.provider.getCode(
        ChainConfigs[swapState.fromChain].EscrowFactory
      );
      console.log(
        "[DEBUG] EscrowFactory contract code length:",
        factoryCode.length
      );
      console.log(
        "[DEBUG] EscrowFactory contract exists:",
        factoryCode !== "0x"
      );
    } catch (e) {
      console.log(
        "[DEBUG] Could not check EscrowFactory contract:",
        e instanceof Error ? e.message : "Unknown error"
      );
    }

    // Check and handle token approvals
    try {
      const ERC20_ABI = [
        "function allowance(address owner, address spender) view returns (uint256)",
        "function balanceOf(address account) view returns (uint256)",
        "function approve(address spender, uint256 amount) returns (bool)",
      ];
      const tokenContract = new Contract(
        immutables.token,
        ERC20_ABI,
        srcChainResolver.signer // Use signer for transactions
      );

      const allowance = await tokenContract.allowance(userAddress, callData.to);
      const tokenBalance = await tokenContract.balanceOf(userAddress);
      console.log("[DEBUG] Token allowance:", allowance.toString());
      console.log("[DEBUG] Token balance:", tokenBalance.toString());
      console.log("[DEBUG] Required amount:", fillAmount.toString());

      // Check if approval is needed
      if (allowance < fillAmount) {
        console.log(
          "[DEBUG] Token allowance insufficient, approving token spend..."
        );
        console.log(
          "[DEBUG] Approving",
          fillAmount.toString(),
          "tokens for",
          callData.to
        );

        const approveTx = await tokenContract.approve(callData.to, fillAmount);
        console.log("[DEBUG] Approval transaction sent:", approveTx.hash);

        const approveReceipt = await approveTx.wait();
        console.log(
          "[DEBUG] Token approval complete, gas used:",
          approveReceipt.gasUsed.toString()
        );

        // Verify the approval went through
        const newAllowance = await tokenContract.allowance(
          userAddress,
          callData.to
        );
        console.log("[DEBUG] New token allowance:", newAllowance.toString());
      } else {
        console.log("[DEBUG] Token allowance sufficient, no approval needed");
      }
    } catch (tokenError) {
      console.log("[DEBUG] Could not handle token approval:", tokenError);
      throw tokenError; // Re-throw to prevent proceeding without approval
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
      // Use sendTransaction as the primary method
      console.log("[DEBUG] Calling sendTransaction...");

      // Try with explicit gas limit and ensure data is preserved
      const txRequestWithGas = {
        to: txRequest.to,
        data: txRequest.data,
        value: txRequest.value,
        gasLimit: 500000, // Set explicit gas limit
        type: 2, // EIP-1559 transaction
      };

      console.log("[DEBUG] Final transaction request:", {
        to: txRequestWithGas.to,
        data: txRequestWithGas.data,
        dataLength: txRequestWithGas.data.length,
        value: txRequestWithGas.value.toString(),
        gasLimit: txRequestWithGas.gasLimit,
        type: txRequestWithGas.type,
      });

      console.log(`[API] Sending transaction to source chain...`);
      console.log(`[API] Transaction details:`, {
        to: txRequestWithGas.to,
        data: txRequestWithGas.data?.slice(0, 20) + "...",
        value: txRequestWithGas.value?.toString(),
        gasLimit: txRequestWithGas.gasLimit?.toString(),
      });

      const tx = await srcChainResolver.signer.sendTransaction(
        txRequestWithGas
      );
      console.log("[DEBUG] Transaction sent successfully:", tx.hash);
      console.log(`[API] Waiting for transaction confirmation...`);

      const receipt = await tx.wait();
      if (!receipt) {
        throw new Error("Transaction receipt is null");
      }
      console.log(
        `[API] Transaction confirmed in block: ${receipt.blockNumber}`
      );
      orderFillHash = receipt.hash;
      srcDeployBlock = receipt.blockHash;

      console.log(`[API] Order filled successfully: ${orderFillHash}`);
    } catch (sendError) {
      console.error("[DEBUG] Transaction failed:", sendError);

      // Enhanced error logging for debugging
      if (sendError instanceof Error) {
        console.error("[DEBUG] Error message:", sendError.message);
        console.error("[DEBUG] Error stack:", sendError.stack);
      }

      // Don't try alternative methods - just return the error
      // Handle BigInt serialization to prevent API crashes
      return NextResponse.json(
        {
          error:
            sendError instanceof Error
              ? sendError.message
              : "Transaction failed",
          callData: JSON.parse(
            JSON.stringify(callData, (key, value) =>
              typeof value === "bigint" ? value.toString() : value
            )
          ),
        },
        { status: 500 }
      );
    }

    console.log(`[API] ✅ Transaction completed successfully!`);
    console.log(`[API] Order fill hash: ${orderFillHash}`);
    console.log(`[API] Source deploy block: ${srcDeployBlock}`);

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

    console.log(
      `[API] 🔄 Deploying destination escrow for user: ${userAddress}`
    );
    console.log(
      `[API] Destination chain: ${swapState.toChain} (${
        swapState.toChain === 10143 ? "Monad Testnet" : "Unknown"
      })`
    );

    const dstChainResolver = await getChainResolver(
      swapState.toChain,
      userAddress
    );
    console.log(`[API] Destination chain resolver connected`);

    const dstCallData = resolverContract.deployDst(dstImmutables as Immutables);
    console.log(`[API] Destination call data prepared`);

    const dstResult = await dstChainResolver.send(dstCallData);
    const dstDepositHash = dstResult.txHash;
    const dstDeployedAt = dstResult.blockTimestamp;
    console.log(
      `[API] ✅ Destination escrow deployed: ${dstDepositHash} for user: ${userAddress}`
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
      `[API] 🎉 Cross-chain exchange completed successfully for user: ${userAddress}`
    );
    console.log(`[API] 📊 Summary:`);
    console.log(
      `[API] - Source escrow deployed on chain ${swapState.fromChain}`
    );
    console.log(
      `[API] - Destination escrow deployed on chain ${swapState.toChain}`
    );
    console.log(`[API] - Order fill hash: ${orderFillHash}`);
    console.log(`[API] - Destination deploy hash: ${dstDepositHash}`);
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

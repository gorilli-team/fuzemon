import { useWriteContract } from "wagmi";
import { SmartWalletAbi } from "../abi/SmartWalletAbi";
import { trackTransaction } from "../utils/trackTransaction";

export function useSmartWalletTrading() {
  const { writeContractAsync, isPending, error } = useWriteContract();

  const buyTokens = async (
    smartWallet: `0x${string}`,
    tokenOut: string,
    amountOut: bigint,
    amountInMax: bigint,
    tokenSymbol: string,
    tokenPrice: number
  ) => {
    console.log("🔍 SmartWalletTrading - buyTokens called with:");
    console.log("📱 Smart Wallet:", smartWallet);
    console.log("🪙 Token Out:", tokenOut);
    console.log("📤 Amount Out:", amountOut.toString());
    console.log("📥 Amount In Max:", amountInMax.toString());

    try {
      console.log("📝 Preparing contract call...");

      const contractCall = {
        abi: SmartWalletAbi,
        address: smartWallet,
        functionName: "buyTokens" as const,
        args: [tokenOut as `0x${string}`, amountOut, amountInMax] as const,
      };

      console.log("📋 Contract call details:", contractCall);

      const txHash = await writeContractAsync(contractCall);

      console.log("✅ buyTokens transaction hash:", txHash);

      // Track the transaction in the database
      try {
        await trackTransaction({
          smartWalletAddress: smartWallet,
          tokenSymbol: tokenSymbol,
          tokenAmount: amountOut.toString(),
          tokenPrice: tokenPrice,
          action: "buy",
          txHash: txHash,
        });
        console.log("✅ Buy transaction tracked in database");
      } catch (trackError) {
        console.error(
          "⚠️ Failed to track buy transaction in database:",
          trackError
        );
        // Don't throw here - the transaction was successful, just tracking failed
      }

      return txHash;
    } catch (error) {
      console.error("❌ buyTokens failed:", error);

      if (error instanceof Error) {
        console.error("Error details:", {
          name: error.name,
          message: error.message,
          stack: error.stack,
        });
      }

      throw error;
    }
  };

  const sellTokens = async (
    smartWallet: `0x${string}`,
    tokenIn: string,
    amountIn: bigint,
    amountOutMin: bigint,
    tokenSymbol: string,
    tokenPrice: number
  ) => {
    console.log("🔍 SmartWalletTrading - sellTokens called with:");
    console.log("📱 Smart Wallet:", smartWallet);
    console.log("🪙 Token In:", tokenIn);
    console.log("📥 Amount In:", amountIn.toString());
    console.log("📤 Amount Out Min:", amountOutMin.toString());

    try {
      console.log("📝 Preparing contract call...");

      const contractCall = {
        abi: SmartWalletAbi,
        address: smartWallet,
        functionName: "sellTokens" as const,
        args: [tokenIn as `0x${string}`, amountIn, amountOutMin] as const,
      };

      console.log("📋 Contract call details:", contractCall);

      const txHash = await writeContractAsync(contractCall);

      console.log("✅ sellTokens transaction hash:", txHash);

      // Track the transaction in the database
      try {
        await trackTransaction({
          smartWalletAddress: smartWallet,
          tokenSymbol: tokenSymbol,
          tokenAmount: amountIn.toString(),
          tokenPrice: tokenPrice,
          action: "sell",
          txHash: txHash,
        });
        console.log("✅ Sell transaction tracked in database");
      } catch (trackError) {
        console.error(
          "⚠️ Failed to track sell transaction in database:",
          trackError
        );
        // Don't throw here - the transaction was successful, just tracking failed
      }

      return txHash;
    } catch (error) {
      console.error("❌ sellTokens failed:", error);

      if (error instanceof Error) {
        console.error("Error details:", {
          name: error.name,
          message: error.message,
          stack: error.stack,
        });
      }

      throw error;
    }
  };

  return { buyTokens, sellTokens, isPending, error };
}

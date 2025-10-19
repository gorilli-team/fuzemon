import { useWriteContract } from "wagmi";
import { SmartWalletAbi } from "../abi/SmartWalletAbi";

export function useSmartWalletTrading() {
  const { writeContractAsync, isPending, error } = useWriteContract();

  const buyTokens = async (
    smartWallet: `0x${string}`,
    tokenOut: string,
    amountOut: bigint,
    amountInMax: bigint
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
        args: [tokenOut, amountOut, amountInMax],
      };

      console.log("📋 Contract call details:", contractCall);

      const txHash = await writeContractAsync(contractCall as any);

      console.log("✅ buyTokens transaction hash:", txHash);
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
    amountOutMin: bigint
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
        args: [tokenIn, amountIn, amountOutMin],
      };

      console.log("📋 Contract call details:", contractCall);

      const txHash = await writeContractAsync(contractCall as any);

      console.log("✅ sellTokens transaction hash:", txHash);
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

import { useWriteContract } from "wagmi";
import { SmartWalletAbi } from "../abi/SmartWalletAbi";

export function useSmartWalletTrading() {
  const { writeContractAsync, isPending, error } = useWriteContract();

  const buyTokensV4 = async (
    smartWallet: `0x${string}`,
    key: {
      currency0: `0x${string}`;
      currency1: `0x${string}`;
      fee: number;
      tickSpacing: number;
      hooks: `0x${string}`;
    },
    zeroForOne: boolean,
    amountOut: bigint,
    amountInMax: bigint,
    deadline: bigint
  ) => {
    console.log("🔍 SmartWalletTrading - buyTokensV4 called with:");
    console.log("📱 Smart Wallet:", smartWallet);
    console.log("🔑 Pool Key:", key);
    console.log("🔄 Zero for One:", zeroForOne);
    console.log("📤 Amount Out:", amountOut.toString());
    console.log("📥 Amount In Max:", amountInMax.toString());
    console.log(
      "⏰ Deadline:",
      deadline.toString(),
      new Date(Number(deadline) * 1000).toISOString()
    );

    try {
      console.log("📝 Preparing contract call...");

      const contractCall = {
        abi: SmartWalletAbi,
        address: smartWallet,
        functionName: "buyTokensV4" as const,
        args: [key, zeroForOne, amountOut, amountInMax, deadline],
      };

      console.log("📋 Contract call details:", contractCall);

      const txHash = await writeContractAsync(contractCall as any);

      console.log("✅ buyTokensV4 transaction hash:", txHash);
      return txHash;
    } catch (error) {
      console.error("❌ buyTokensV4 failed:", error);

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

  const sellTokensV4 = async (
    smartWallet: `0x${string}`,
    key: {
      currency0: `0x${string}`;
      currency1: `0x${string}`;
      fee: number;
      tickSpacing: number;
      hooks: `0x${string}`;
    },
    zeroForOne: boolean,
    amountIn: bigint,
    amountOutMin: bigint,
    deadline: bigint
  ) => {
    console.log("🔍 SmartWalletTrading - sellTokensV4 called with:");
    console.log("📱 Smart Wallet:", smartWallet);
    console.log("🔑 Pool Key:", key);
    console.log("🔄 Zero for One:", zeroForOne);
    console.log("📥 Amount In:", amountIn.toString());
    console.log("📤 Amount Out Min:", amountOutMin.toString());
    console.log(
      "⏰ Deadline:",
      deadline.toString(),
      new Date(Number(deadline) * 1000).toISOString()
    );

    try {
      console.log("📝 Preparing contract call...");

      const contractCall = {
        abi: SmartWalletAbi,
        address: smartWallet,
        functionName: "sellTokensV4" as const,
        args: [key, zeroForOne, amountIn, amountOutMin, deadline],
      };

      console.log("📋 Contract call details:", contractCall);

      const txHash = await writeContractAsync(contractCall as any);

      console.log("✅ sellTokensV4 transaction hash:", txHash);
      return txHash;
    } catch (error) {
      console.error("❌ sellTokensV4 failed:", error);

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

  return { buyTokensV4, sellTokensV4, isPending, error };
}

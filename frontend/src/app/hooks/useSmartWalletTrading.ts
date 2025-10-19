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
    const txHash = await writeContractAsync({
      abi: SmartWalletAbi,
      address: smartWallet,
      functionName: "buyTokensV4",
      args: [key, zeroForOne, amountOut, amountInMax, deadline],
    });

    return txHash;
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
    const txHash = await writeContractAsync({
      abi: SmartWalletAbi,
      address: smartWallet,
      functionName: "sellTokensV4",
      args: [key, zeroForOne, amountIn, amountOutMin, deadline],
    });

    return txHash;
  };

  return { buyTokensV4, sellTokensV4, isPending, error };
}

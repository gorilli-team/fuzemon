import { useWriteContract } from "wagmi";
import { SmartWalletAbi } from "../abi/SmartWalletAbi";

export function useWithdrawUSDC() {
  const { writeContractAsync, isPending, error } = useWriteContract();

  const withdrawUSDC = async (smartWallet: `0x${string}`, amount: bigint) => {
    const txHash = await writeContractAsync({
      abi: SmartWalletAbi,
      address: smartWallet,
      functionName: "withdrawUSDC",
      args: [amount],
    });

    return txHash;
  };

  const withdrawAllUSDC = async (smartWallet: `0x${string}`) => {
    const txHash = await writeContractAsync({
      abi: SmartWalletAbi,
      address: smartWallet,
      functionName: "withdrawAllUSDC",
      args: [],
    });

    return txHash;
  };

  return { withdrawUSDC, withdrawAllUSDC, isPending, error };
}

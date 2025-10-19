import { useWriteContract } from "wagmi";
import { SmartWalletAbi } from "../abi/SmartWalletAbi";

export function useDepositUSDC() {
  const { writeContractAsync, isPending, error } = useWriteContract();

  const depositUSDC = async (smartWallet: `0x${string}`, amount: bigint) => {
    const txHash = await writeContractAsync({
      abi: SmartWalletAbi,
      address: smartWallet,
      functionName: "depositUSDC",
      args: [amount],
    });

    return txHash;
  };

  return { depositUSDC, isPending, error };
}

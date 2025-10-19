import { useWriteContract, usePublicClient } from "wagmi";
import { SmartWalletFactoryAbi } from "../abi/SmartWalletFactoryAbi";
import { Interface } from "ethers";

export function useCreateSmartWallet() {
  const { writeContractAsync, isPending, error } = useWriteContract();
  const publicClient = usePublicClient();

  const createSmartWallet = async (
    usdc: string,
    universalRouter: string,
    poolManager: string,
    permit2: string
  ) => {
    const tx = await writeContractAsync({
      abi: SmartWalletFactoryAbi,
      address: process.env
        .NEXT_PUBLIC_SMART_WALLET_FACTORY_MONAD as `0x${string}`,
      functionName: "createSmartWallet",
      args: [usdc, universalRouter, poolManager, permit2],
    });

    const receipt = await publicClient?.waitForTransactionReceipt({ hash: tx });

    const iface = new Interface(SmartWalletFactoryAbi);
    let user: string | undefined = undefined;
    let smartWallet: string | undefined = undefined;

    for (const log of receipt?.logs as { topics: string[]; data: string }[]) {
      try {
        const parsedLog = iface.parseLog(log);

        if (parsedLog?.name === "SmartWalletCreated") {
          user = parsedLog.args.user;
          smartWallet = parsedLog.args.smartWallet;
          break;
        }
      } catch (parseError) {
        console.error("Could not parse log:", parseError);
      }
    }

    if (!user || !smartWallet) {
      console.error("SmartWalletCreated event not found in logs");
      throw new Error("SmartWalletCreated event not found.");
    }

    return { user, smartWallet };
  };

  return { createSmartWallet, isPending, error };
}

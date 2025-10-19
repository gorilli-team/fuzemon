import {
  useWriteContract,
  usePublicClient,
  useAccount,
  useSwitchChain,
  useReadContract,
} from "wagmi";
import { SmartWalletFactoryAbi } from "../abi/SmartWalletFactoryAbi";
import { Interface } from "ethers";
import { monadTestnet } from "../config/wagmi";

export function useCreateSmartWallet() {
  const { writeContractAsync, isPending, error } = useWriteContract();
  const publicClient = usePublicClient();
  const { chain } = useAccount();
  const { switchChain } = useSwitchChain();

  const createSmartWallet = async (
    usdc: string,
    universalRouter: string,
    poolManager: string,
    permit2: string
  ) => {
    console.log("Creating smart wallet with params:", {
      usdc,
      universalRouter,
      poolManager,
      permit2,
      factoryAddress: process.env.NEXT_PUBLIC_SMART_WALLET_FACTORY_MONAD,
      currentChain: chain?.id,
      targetChain: monadTestnet.id,
    });

    if (!process.env.NEXT_PUBLIC_SMART_WALLET_FACTORY_MONAD) {
      throw new Error("Smart wallet factory address not configured");
    }

    // Check if user is on the correct chain
    if (chain?.id !== monadTestnet.id) {
      console.log("Switching to Monad Testnet...");
      await switchChain({ chainId: monadTestnet.id });
    }

    try {
      // First, let's verify the factory contract is accessible
      console.log("Verifying factory contract...");
      try {
        const totalWallets = await publicClient?.readContract({
          abi: SmartWalletFactoryAbi,
          address: process.env
            .NEXT_PUBLIC_SMART_WALLET_FACTORY_MONAD as `0x${string}`,
          functionName: "getTotalDeployedSmartWallets",
        });
        console.log(
          "Factory contract accessible, total wallets:",
          totalWallets
        );

        // Check if user already has smart wallets
        const userWallets = await publicClient?.readContract({
          abi: SmartWalletFactoryAbi,
          address: process.env
            .NEXT_PUBLIC_SMART_WALLET_FACTORY_MONAD as `0x${string}`,
          functionName: "getUserSmartWallets",
          args: [chain?.address as `0x${string}`],
        });
        console.log("User's existing smart wallets:", userWallets);

        if (
          userWallets &&
          Array.isArray(userWallets) &&
          userWallets.length > 0
        ) {
          throw new Error(
            "User already has smart wallets. Please use existing ones or contact support."
          );
        }
      } catch (contractError) {
        console.error("Factory contract not accessible:", contractError);
        throw new Error(
          "Smart wallet factory contract not found or not accessible"
        );
      }

      // First, let's estimate gas to see if the call would succeed
      console.log("Estimating gas for smart wallet creation...");

      const tx = await writeContractAsync({
        abi: SmartWalletFactoryAbi,
        address: process.env
          .NEXT_PUBLIC_SMART_WALLET_FACTORY_MONAD as `0x${string}`,
        functionName: "createSmartWallet",
        args: [usdc, universalRouter, poolManager, permit2],
        gas: 5000000n, // Set a higher gas limit
      });

      console.log("Transaction submitted:", tx);

      const receipt = await publicClient?.waitForTransactionReceipt({
        hash: tx,
      });
      console.log("Transaction receipt:", receipt);

      // Check if transaction was successful
      if (receipt?.status === "reverted") {
        console.error("Transaction reverted!");
        console.error("Transaction hash:", tx);
        console.error("Gas used:", receipt.cumulativeGasUsed);
        throw new Error(
          "Smart wallet creation transaction reverted. This could be due to insufficient gas, invalid parameters, or contract issues."
        );
      }

      const iface = new Interface(SmartWalletFactoryAbi);
      let user: string | undefined = undefined;
      let smartWallet: string | undefined = undefined;

      for (const log of receipt?.logs as { topics: string[]; data: string }[]) {
        try {
          const parsedLog = iface.parseLog(log);
          console.log("Parsed log:", parsedLog);

          if (parsedLog?.name === "SmartWalletCreated") {
            user = parsedLog.args.user;
            smartWallet = parsedLog.args.smartWallet;
            console.log("Found SmartWalletCreated event:", {
              user,
              smartWallet,
            });
            break;
          }
        } catch (parseError) {
          console.error("Could not parse log:", parseError);
        }
      }

      if (!user || !smartWallet) {
        console.error("SmartWalletCreated event not found in logs");
        console.error("All logs:", receipt?.logs);
        throw new Error("SmartWalletCreated event not found.");
      }

      return { user, smartWallet };
    } catch (error) {
      console.error("Error in createSmartWallet:", error);
      throw error;
    }
  };

  return { createSmartWallet, isPending, error };
}

import { Address, EscrowFactory } from "@1inch/cross-chain-sdk";
import { JsonRpcProvider } from "ethers";
import { parseEther } from "viem";
import { id } from "ethers";
import { Wallet } from "../api/order/wallet";

// Helper functions for escrow implementation
export async function getSourceImpl(
  provider: JsonRpcProvider,
  address: string
) {
  return Address.fromBigInt(
    BigInt(
      await provider.call({
        to: address,
        data: id("ESCROW_SRC_IMPLEMENTATION()").slice(0, 10),
      })
    )
  );
}

export async function getDestinationImpl(
  provider: JsonRpcProvider,
  address: string
) {
  return Address.fromBigInt(
    BigInt(
      await provider.call({
        to: address,
        data: id("ESCROW_DST_IMPLEMENTATION()").slice(0, 10),
      })
    )
  );
}

export const ChainIds = {
  Sepolia: 11155111,
  BaseSepolia: 84532,
  MonadTestnet: 10143,
};

export const ChainConfigs = {
  [ChainIds.Sepolia]: {
    LOP: "0x111111125421cA6dc452d289314280a0f8842A65",
    EscrowFactory: "0x61a32a9263c6ff568c66799a94f8fe09c1db7a66",
    ResolverContractAddress: "0xb763BA9a8D756E5698Afc2EAC33C7b8f3A46A586",
    BLT: "0x0BF8E91b08b242cD7380bC92385C90c8270b37f0",
    EscrowSrcImplementationAddress:
      "0xa17ddb01f03a42e0070a0e25099cf3d27b705fff",
    EscrowDstImplementationAddress:
      "0x7490329e69ab8e298a32dc59493034e4d02a5ccf",
    ChainName: "Sepolia",
    RpcUrl: "https://ethereum-sepolia-rpc.publicnode.com",
    // Alternative RPC endpoints for testing
    AlternativeRpcUrls: [
      "https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161", // Infura
      "https://eth-sepolia.g.alchemy.com/v2/demo", // Alchemy
      "https://rpc.sepolia.org", // Sepolia Foundation
    ],
    ResolverPrivateKey: process.env.SEPOLIA_USER_PRIVATE_KEY,
    SafetyDeposit: parseEther("0.0001"), // Reduced from 0.001 to 0.0001 ETH
  },
  [ChainIds.BaseSepolia]: {
    LOP: "0xe30f9abbadc1eb84b41d41035b2a2c7d0bd5f9b2",
    EscrowFactory: "0x178ddaca4499a89e40826ec247baf608051edf9e",
    ResolverContractAddress: "0x3fe279B56F330304446522F04907fBBe03Fe236a",
    BLT: "0xbb7f72d58f5F7147CBa030Ba4c46a94a07E4c2CA",
    EscrowSrcImplementationAddress:
      "0xe55061a78bf30e7f38410b90a6a167d5621cc068",
    EscrowDstImplementationAddress:
      "0x0418b6e80a602474fbfadc3a2594413fe68496bb",
    ChainName: "BaseSepolia",
    RpcUrl: "https://base-sepolia-rpc.publicnode.com",
    ResolverPrivateKey: process.env.BASE_SEPOLIA_USER_PRIVATE_KEY,
    SafetyDeposit: parseEther("0.001"),
  },
  [ChainIds.MonadTestnet]: {
    LOP: "0xCAEa711010565904d3427b74794e3F36c191a6e7",
    EscrowFactory: "0x65c169Cef9904499788FE61ea708EB6F99C34Ff6",
    ResolverContractAddress: "0xCE285fAA5817A0fb8701Faf49a8B395432933137",
    BLT: "0x60c13fAcC3d2363fa4c1D4c8A0456a4FeBc98903",
    EscrowSrcImplementationAddress:
      "0xb067a3695e316f4d6f42ef047cac941a3f0298f1",
    EscrowDstImplementationAddress:
      "0x4a2d6954c17ff9be4af9b0c9a74e2d0ff4cf128d",
    ChainName: "MonadTestnet",
    RpcUrl: "https://rpc.ankr.com/monad_testnet",
    ResolverPrivateKey: process.env.MONAD_TESTNET_USER_PRIVATE_KEY,
    SafetyDeposit: parseEther("0.001"),
  },
};

// Store the authorized user address for each chain
const authorizedUsers = new Map<number, string>();

// Function to test RPC endpoint connectivity
const testRpcEndpoint = async (rpcUrl: string): Promise<boolean> => {
  try {
    const testProvider = new JsonRpcProvider(rpcUrl);
    testProvider._getConnection().timeout = 10000; // 10 seconds timeout for testing
    await testProvider.getBlockNumber();
    return true;
  } catch (error) {
    console.log(
      `[RPC TEST] Failed to connect to ${rpcUrl}:`,
      error instanceof Error ? error.message : "Unknown error"
    );
    return false;
  }
};

// Function to find working RPC endpoint
const findWorkingRpcEndpoint = async (
  chainConfig: (typeof ChainConfigs)[number]
): Promise<string> => {
  // Test primary RPC first
  console.log(`[RPC TEST] Testing primary RPC: ${chainConfig.RpcUrl}`);
  if (await testRpcEndpoint(chainConfig.RpcUrl)) {
    console.log(`[RPC TEST] Primary RPC is working: ${chainConfig.RpcUrl}`);
    return chainConfig.RpcUrl;
  }

  // Test alternative RPCs if available
  if (chainConfig.AlternativeRpcUrls) {
    for (const altRpc of chainConfig.AlternativeRpcUrls) {
      console.log(`[RPC TEST] Testing alternative RPC: ${altRpc}`);
      if (await testRpcEndpoint(altRpc)) {
        console.log(`[RPC TEST] Alternative RPC is working: ${altRpc}`);
        return altRpc;
      }
    }
  }

  // If all fail, return the primary RPC (will likely fail but gives better error message)
  console.log(
    `[RPC TEST] All RPC endpoints failed, using primary: ${chainConfig.RpcUrl}`
  );
  return chainConfig.RpcUrl;
};

export const getChainResolver = async (
  chainId: number,
  userAddress?: string
) => {
  const chainConfig = ChainConfigs[chainId];
  if (!chainConfig?.ResolverPrivateKey) {
    throw new Error(`No resolver private key found for chain ${chainId}`);
  }

  // Find working RPC endpoint
  const workingRpcUrl = await findWorkingRpcEndpoint(chainConfig);
  console.log(`[RESOLVER DEBUG] Using RPC: ${workingRpcUrl}`);

  const provider = new JsonRpcProvider(workingRpcUrl);
  // Set timeout for the provider
  provider._getConnection().timeout = 30000; // 30 seconds timeout

  const wallet = new Wallet(chainConfig.ResolverPrivateKey, provider);

  // Get the actual address from the private key
  const privateKeyOwnerAddress = await wallet.getAddress();

  console.log(`[RESOLVER DEBUG] Chain ${chainId} wallet details:`, {
    privateKeyOwnerAddress,
    userAddress,
    chainId,
    rpcUrl: chainConfig.RpcUrl,
  });

  // If userAddress is provided, validate it matches the private key owner
  if (userAddress) {
    if (privateKeyOwnerAddress.toLowerCase() !== userAddress.toLowerCase()) {
      throw new Error(
        `Unauthorized: User ${userAddress} does not own the private key. Expected: ${privateKeyOwnerAddress}, Got: ${userAddress}`
      );
    }
    // Store the authorized user for this chain
    authorizedUsers.set(chainId, userAddress.toLowerCase());
    console.log(
      `[RESOLVER DEBUG] User ${userAddress} authorized for chain ${chainId}`
    );
  } else {
    // Check if we already have an authorized user for this chain
    const existingUser = authorizedUsers.get(chainId);
    if (existingUser) {
      console.log(
        `[RESOLVER DEBUG] Using authorized user for chain ${chainId}: ${existingUser}`
      );
    } else {
      console.log(
        `[RESOLVER DEBUG] No user address provided, using dev wallet: ${privateKeyOwnerAddress}`
      );
    }
  }

  return wallet;
};

// Function to get the authorized user for a chain
export const getAuthorizedUser = (chainId: number): string | null => {
  return authorizedUsers.get(chainId) || null;
};

// Function to clear authorization (useful for logout)
export const clearUserAuthorization = (chainId?: number) => {
  if (chainId) {
    authorizedUsers.delete(chainId);
  } else {
    authorizedUsers.clear();
  }
};

export const getSrcEscrowAddress = async (
  chainId: number,
  immutablesHash: string
) => {
  const chainConfig = ChainConfigs[chainId];
  const provider = new JsonRpcProvider(chainConfig.RpcUrl);
  // Set timeout for the provider
  provider._getConnection().timeout = 30000; // 30 seconds timeout
  const ESCROW_SRC_IMPLEMENTATION = await getSourceImpl(
    provider,
    chainConfig.EscrowFactory
  );
  return new EscrowFactory(
    new Address(chainConfig.EscrowFactory)
  ).getEscrowAddress(immutablesHash, ESCROW_SRC_IMPLEMENTATION);
};

export const getDstEscrowAddress = async (
  dstChainId: number,
  immutablesHash: string
) => {
  const chainConfig = ChainConfigs[dstChainId];
  console.log(
    "🔍 Fetching destination escrow deployment event...",
    chainConfig
  );
  const provider = new JsonRpcProvider(chainConfig.RpcUrl);
  // Set timeout for the provider
  provider._getConnection().timeout = 30000; // 30 seconds timeout
  const ESCROW_DST_IMPLEMENTATION = await getDestinationImpl(
    provider,
    chainConfig.EscrowFactory
  );
  return new EscrowFactory(
    new Address(chainConfig.EscrowFactory)
  ).getEscrowAddress(immutablesHash, ESCROW_DST_IMPLEMENTATION);
};

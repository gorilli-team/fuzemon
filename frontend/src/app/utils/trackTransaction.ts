interface TrackTransactionRequest {
  smartWalletAddress: string;
  tokenSymbol: string;
  tokenAmount: string;
  tokenPrice: number;
  action: "deposit" | "withdraw" | "buy" | "sell";
  txHash: string;
  signalId?: string;
}

export async function trackTransaction(
  transactionData: TrackTransactionRequest
) {
  try {
    console.log("🔍 Attempting to track transaction:", transactionData);

    // Call backend directly to store in MongoDB
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/smart-wallet/track-transaction`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transactionData),
      }
    );

    console.log("📡 Response status:", response.status);
    console.log("📡 Response ok:", response.ok);

    if (!response.ok) {
      const errorData = await response.json();
      console.error("❌ Backend error response:", errorData);
      throw new Error(errorData.error || "Failed to track transaction");
    }

    const result = await response.json();
    console.log("✅ Transaction tracked successfully:", result);
    return result;
  } catch (error) {
    console.error("❌ Failed to track transaction:", error);
    throw error;
  }
}

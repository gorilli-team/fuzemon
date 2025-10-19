const mongoose = require("mongoose");
require("dotenv").config();

// Smart Wallet Schema
const SmartWalletSchema = new mongoose.Schema(
  {
    userWallet: {
      type: String,
      required: true,
      index: true,
    },
    smartWallet: {
      type: String,
      required: true,
      unique: true,
    },
    chainId: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Smart Wallet Transaction Schema
const SmartWalletTransactionSchema = new mongoose.Schema(
  {
    smartWalletAddress: {
      type: String,
      required: true,
      index: true,
    },
    tokenSymbol: {
      type: String,
      required: true,
    },
    tokenAmount: {
      type: Number,
      required: true,
    },
    tokenPrice: {
      type: Number,
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: ["deposit", "withdraw", "buy", "sell"],
    },
    usdValue: {
      type: Number,
      required: true,
    },
    txHash: {
      type: String,
      required: true,
      unique: true,
    },
    timestamp: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    metadata: {
      source: String,
      signalId: String,
    },
  },
  {
    timestamps: true,
  }
);

const SmartWallet = mongoose.model("SmartWallet", SmartWalletSchema);
const SmartWalletTransaction = mongoose.model(
  "SmartWalletTransaction",
  SmartWalletTransactionSchema
);

async function updateSmartWalletForUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/fuzemon"
    );
    console.log("Connected to MongoDB");

    // Get the user wallet address from command line argument or use default
    const userWallet =
      process.argv[2] || "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6";

    console.log(`Updating smart wallets for user: ${userWallet}`);

    // Update all smart wallets to use the specified user wallet
    const result = await SmartWallet.updateMany({}, { userWallet: userWallet });

    console.log("Updated smart wallets:", result);

    // Show current smart wallets
    const wallets = await SmartWallet.find({});
    console.log("Current smart wallets:", JSON.stringify(wallets, null, 2));

    // Show current transactions
    const transactions = await SmartWalletTransaction.find({});
    console.log("Current transactions:", transactions.length);

    console.log("✅ Smart wallet data updated successfully!");
    console.log("Smart Wallets:", await SmartWallet.countDocuments());
    console.log("Transactions:", await SmartWalletTransaction.countDocuments());
  } catch (error) {
    console.error("❌ Error updating smart wallet data:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

// Run the script
updateSmartWalletForUser();

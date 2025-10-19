const mongoose = require("mongoose");
require("dotenv").config();

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

const SmartWalletTransaction = mongoose.model(
  "SmartWalletTransaction",
  SmartWalletTransactionSchema
);

async function addTestTransaction() {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/fuzemon"
    );
    console.log("Connected to MongoDB");

    // Add a new test transaction
    const newTransaction = {
      smartWalletAddress: "0x091c9a51D6eB9dcB8BFEd2B8041DD8D6DF974A0E",
      tokenSymbol: "MONAD",
      tokenAmount: 100,
      tokenPrice: 0.1,
      action: "buy",
      usdValue: 10,
      txHash: `0x${Math.random().toString(16).substr(2, 64)}`,
      timestamp: Math.floor(Date.now() / 1000),
      status: "completed",
      metadata: {
        source: "test",
        signalId: "test_signal_001",
      },
    };

    const transaction = await SmartWalletTransaction.create(newTransaction);
    console.log("✅ Added test transaction:", transaction);
  } catch (error) {
    console.error("❌ Error adding test transaction:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

// Run the script
addTestTransaction();

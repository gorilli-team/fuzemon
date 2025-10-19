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

async function mockSmartWalletData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/fuzemon"
    );
    console.log("Connected to MongoDB");

    // Clear existing data
    await SmartWallet.deleteMany({});
    await SmartWalletTransaction.deleteMany({});
    console.log("Cleared existing data");

    // Mock smart wallet data
    const smartWalletData = {
      userWallet: "0x3C016742DeFDefBCFf91C3bfbc3619F8d5331480",
      smartWallet: "0x091c9a51D6eB9dcB8BFEd2B8041DD8D6DF974A0E",
      chainId: 10143, // Monad Testnet
    };

    const smartWallet = await SmartWallet.create(smartWalletData);
    console.log("Created smart wallet:", smartWallet);

    // Mock some transactions
    const transactions = [
      {
        smartWalletAddress: "0x091c9a51D6eB9dcB8BFEd2B8041DD8D6DF974A0E",
        tokenSymbol: "USDC",
        tokenAmount: 1000,
        tokenPrice: 1.0,
        action: "deposit",
        usdValue: 1000,
        txHash:
          "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        timestamp: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
        status: "completed",
        metadata: {
          source: "manual",
        },
      },
      {
        smartWalletAddress: "0x091c9a51D6eB9dcB8BFEd2B8041DD8D6DF974A0E",
        tokenSymbol: "CHOG",
        tokenAmount: 500,
        tokenPrice: 0.5,
        action: "buy",
        usdValue: 250,
        txHash:
          "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
        timestamp: Math.floor(Date.now() / 1000) - 1800, // 30 minutes ago
        status: "completed",
        metadata: {
          source: "trading",
          signalId: "signal_001",
        },
      },
      {
        smartWalletAddress: "0x091c9a51D6eB9dcB8BFEd2B8041DD8D6DF974A0E",
        tokenSymbol: "USDC",
        tokenAmount: 100,
        tokenPrice: 1.0,
        action: "withdraw",
        usdValue: 100,
        txHash:
          "0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba",
        timestamp: Math.floor(Date.now() / 1000) - 900, // 15 minutes ago
        status: "completed",
        metadata: {
          source: "manual",
        },
      },
    ];

    const createdTransactions = await SmartWalletTransaction.insertMany(
      transactions
    );
    console.log("Created transactions:", createdTransactions.length);

    // Add another smart wallet for testing multiple wallets
    const secondSmartWallet = await SmartWallet.create({
      userWallet: "0x3C016742DeFDefBCFf91C3bfbc3619F8d5331480",
      smartWallet: "0x1234567890abcdef1234567890abcdef12345678",
      chainId: 10143,
    });
    console.log("Created second smart wallet:", secondSmartWallet);

    console.log("✅ Mock data created successfully!");
    console.log("Smart Wallets:", await SmartWallet.countDocuments());
    console.log("Transactions:", await SmartWalletTransaction.countDocuments());
  } catch (error) {
    console.error("❌ Error creating mock data:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

// Run the script
mockSmartWalletData();

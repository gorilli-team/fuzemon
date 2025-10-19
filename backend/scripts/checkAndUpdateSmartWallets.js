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

const SmartWallet = mongoose.model("SmartWallet", SmartWalletSchema);

async function checkAndUpdateSmartWallets() {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/fuzemon"
    );
    console.log("Connected to MongoDB");

    // Get all smart wallets
    const wallets = await SmartWallet.find({});
    console.log("Current smart wallets in database:");
    wallets.forEach((wallet, index) => {
      console.log(`${index + 1}. User: ${wallet.userWallet}`);
      console.log(`   Smart Wallet: ${wallet.smartWallet}`);
      console.log(`   Chain ID: ${wallet.chainId}`);
      console.log(`   Created: ${wallet.createdAt}`);
      console.log("---");
    });

    console.log(`Total smart wallets: ${wallets.length}`);

    // Instructions for the user
    console.log("\n📝 To make smart wallets visible in the frontend:");
    console.log("1. Connect your wallet in the frontend");
    console.log("2. Copy your wallet address from the browser");
    console.log(
      "3. Run: node scripts/updateSmartWalletForUser.js YOUR_WALLET_ADDRESS"
    );
    console.log("4. Refresh the frontend page");
  } catch (error) {
    console.error("❌ Error checking smart wallets:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

// Run the script
checkAndUpdateSmartWallets();

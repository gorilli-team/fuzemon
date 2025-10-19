import mongoose, { Document, Schema } from "mongoose";

export interface ISmartWalletTransaction extends Document {
  smartWalletAddress: string;
  tokenSymbol: string;
  tokenAmount: number;
  tokenPrice: number;
  action: "deposit" | "withdraw" | "buy" | "sell";
  usdValue: number;
  txHash: string;
  timestamp: number;
  status: "pending" | "completed" | "failed";
  metadata?: {
    source?: string;
    signalId?: string;
  };
}

const SmartWalletTransactionSchema = new Schema<ISmartWalletTransaction>(
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

export default mongoose.model<ISmartWalletTransaction>(
  "SmartWalletTransaction",
  SmartWalletTransactionSchema
);

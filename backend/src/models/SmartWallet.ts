import mongoose, { Document, Schema } from "mongoose";

export interface ISmartWallet extends Document {
  userWallet: string;
  smartWallet: string;
  chainId: number;
  createdAt: Date;
  updatedAt: Date;
}

const SmartWalletSchema = new Schema<ISmartWallet>(
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

export default mongoose.model<ISmartWallet>("SmartWallet", SmartWalletSchema);

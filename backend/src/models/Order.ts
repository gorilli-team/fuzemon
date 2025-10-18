import mongoose, { Document, Schema } from "mongoose";
import {
  Order as IOrder,
  OrderStatus,
  Token,
  SwapState,
  OrderTransactions,
} from "../types/order";

// Token schema
const TokenSchema = new Schema<Token>(
  {
    symbol: { type: String, required: true },
    name: { type: String, required: true },
    address: { type: String, required: true },
    decimals: { type: Number, required: true },
    logo: { type: String, required: false },
  },
  { _id: false }
);

// Transaction schema
const TransactionSchema = new Schema(
  {
    txHash: { type: String, required: true },
    txLink: { type: String, required: true },
    description: { type: String, required: true },
    chainId: { type: Number, required: false },
    blockHash: { type: String, required: false },
    blockLink: { type: String, required: false },
  },
  { _id: false }
);

// Order transactions schema
const OrderTransactionsSchema = new Schema<OrderTransactions>(
  {
    orderFill: { type: TransactionSchema, required: false },
    dstEscrowDeploy: { type: TransactionSchema, required: false },
    dstWithdraw: { type: TransactionSchema, required: false },
    srcWithdraw: { type: TransactionSchema, required: false },
  },
  { _id: false }
);

// Swap state schema
const SwapStateSchema = new Schema<SwapState>(
  {
    fromChain: { type: Number, required: true },
    toChain: { type: Number, required: true },
    fromToken: { type: TokenSchema, required: true },
    toToken: { type: TokenSchema, required: true },
    fromAmount: { type: String, required: true },
    toAmount: { type: String, required: true },
    userAddress: { type: String, required: false },
  },
  { _id: false }
);

// Main Order schema
const OrderSchema = new Schema<IOrder & Document>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    createdAt: {
      type: Number,
      required: true,
      default: Date.now,
    },
    updatedAt: {
      type: Number,
      required: false,
    },
    status: {
      type: String,
      enum: [
        "CREATED",
        "PENDING_SECRET",
        "PENDING_WITHDRAW",
        "COMPLETED",
        "FAILED",
      ],
      required: true,
      default: "CREATED",
      index: true,
    },
    swapState: {
      type: SwapStateSchema,
      required: true,
    },
    fromToken: {
      type: TokenSchema,
      required: true,
    },
    toToken: {
      type: TokenSchema,
      required: true,
    },
    orderHash: {
      type: String,
      required: false,
      index: true,
    },
    secret: {
      type: String,
      required: false,
    },
    orderFillTxHash: {
      type: String,
      required: false,
    },
    dstEscrowDeployTxHash: {
      type: String,
      required: false,
    },
    dstWithdrawTxHash: {
      type: String,
      required: false,
    },
    srcWithdrawTxHash: {
      type: String,
      required: false,
    },
    orderFillTxLink: {
      type: String,
      required: false,
    },
    dstEscrowDeployTxLink: {
      type: String,
      required: false,
    },
    dstWithdrawTxLink: {
      type: String,
      required: false,
    },
    srcWithdrawTxLink: {
      type: String,
      required: false,
    },
    completedAt: {
      type: Number,
      required: false,
    },
    failedAt: {
      type: Number,
      required: false,
    },
    message: {
      type: String,
      required: false,
    },
    error: {
      type: String,
      required: false,
    },
    transactions: {
      type: OrderTransactionsSchema,
      required: false,
    },
    metadata: {
      type: Schema.Types.Mixed,
      required: false,
    },
  },
  {
    timestamps: false, // We're using custom timestamp fields
    versionKey: false,
  }
);

// Indexes for better query performance
OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ "swapState.userAddress": 1, createdAt: -1 });
OrderSchema.index({ orderHash: 1 });
OrderSchema.index({ createdAt: -1 });

// Pre-save middleware to update updatedAt
OrderSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Pre-update middleware to update updatedAt
OrderSchema.pre(
  ["updateOne", "updateMany", "findOneAndUpdate"],
  function (next) {
    this.set({ updatedAt: Date.now() });
    next();
  }
);

// Static methods for common queries
OrderSchema.statics.findByUserAddress = function (
  userAddress: string,
  limit = 50,
  skip = 0
) {
  return this.find({ "swapState.userAddress": userAddress })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

OrderSchema.statics.findByStatus = function (
  status: OrderStatus,
  limit = 50,
  skip = 0
) {
  return this.find({ status }).sort({ createdAt: -1 }).limit(limit).skip(skip);
};

OrderSchema.statics.findByOrderHash = function (orderHash: string) {
  return this.findOne({ orderHash });
};

// Instance methods
OrderSchema.methods.updateStatus = function (
  status: OrderStatus,
  message?: string,
  error?: string
) {
  this.status = status;
  this.updatedAt = Date.now();

  if (message) {
    this.message = message;
  }

  if (error) {
    this.error = error;
  }

  if (status === "COMPLETED") {
    this.completedAt = Date.now();
  } else if (status === "FAILED") {
    this.failedAt = Date.now();
  }

  return this.save();
};

export const Order = mongoose.model<IOrder & Document>("Order", OrderSchema);

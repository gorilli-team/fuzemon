import { Request, Response } from "express";
import SmartWallet from "../models/SmartWallet";
import SmartWalletTransaction from "../models/SmartWalletTransaction";
import {
  CreateSmartWalletRequest,
  TrackTransactionRequest,
} from "../types/smartWallet";

export const createSmartWallet = async (req: Request, res: Response) => {
  try {
    const { userWallet, smartWallet, chainId }: CreateSmartWalletRequest =
      req.body;

    if (!userWallet || !smartWallet || !chainId) {
      return res.status(400).json({
        error: "Missing required fields: userWallet, smartWallet, chainId",
      });
    }

    // Check if smart wallet already exists
    const existingSmartWallet = await SmartWallet.findOne({ smartWallet });
    if (existingSmartWallet) {
      return res.status(409).json({
        error: "Smart wallet already exists",
      });
    }

    // Check if user already has a smart wallet on this chain
    const existingUserWallet = await SmartWallet.findOne({
      userWallet,
      chainId,
    });
    if (existingUserWallet) {
      return res.status(409).json({
        error: "User already has a smart wallet on this chain",
      });
    }

    const newSmartWallet = await SmartWallet.create({
      userWallet,
      smartWallet,
      chainId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return res.status(201).json(newSmartWallet);
  } catch (err) {
    console.error("Failed to create smart wallet:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getSmartWallets = async (req: Request, res: Response) => {
  try {
    const { userWallet, chainId } = req.query;

    let query: any = {};
    if (userWallet) {
      query.userWallet = userWallet;
    }
    if (chainId) {
      query.chainId = parseInt(chainId as string);
    }

    const smartWallets = await SmartWallet.find(query).sort({ createdAt: -1 });

    return res.status(200).json(smartWallets);
  } catch (err) {
    console.error("Failed to get smart wallets:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getSmartWalletById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const smartWallet = await SmartWallet.findById(id);
    if (!smartWallet) {
      return res.status(404).json({ error: "Smart wallet not found" });
    }

    return res.status(200).json(smartWallet);
  } catch (err) {
    console.error("Failed to get smart wallet:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const trackTransaction = async (req: Request, res: Response) => {
  try {
    const {
      smartWalletAddress,
      tokenSymbol,
      tokenAmount,
      tokenPrice,
      action,
      txHash,
      signalId,
    }: TrackTransactionRequest = req.body;

    if (
      !smartWalletAddress ||
      !tokenSymbol ||
      !tokenAmount ||
      !action ||
      !txHash
    ) {
      return res.status(400).json({
        error:
          "Missing required fields: smartWalletAddress, tokenSymbol, tokenAmount, action, txHash",
      });
    }

    // Check if transaction already exists
    const existingTransaction = await SmartWalletTransaction.findOne({
      txHash,
    });
    if (existingTransaction) {
      return res.status(409).json({
        error: "Transaction already tracked",
      });
    }

    const transaction = await SmartWalletTransaction.create({
      smartWalletAddress,
      tokenSymbol,
      tokenAmount: parseFloat(tokenAmount),
      tokenPrice: tokenPrice || 0,
      action: action.toLowerCase() as "deposit" | "withdraw" | "buy" | "sell",
      usdValue: parseFloat(tokenAmount) * (tokenPrice || 0),
      txHash,
      timestamp: Math.floor(Date.now() / 1000),
      status: "completed",
      metadata: {
        source: "smart-wallet",
        signalId: signalId || null,
      },
    });

    return res.status(201).json({
      success: true,
      transaction,
      message: "Smart wallet transaction tracked successfully",
    });
  } catch (err) {
    console.error("Failed to track smart wallet transaction:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getSmartWalletTransactions = async (
  req: Request,
  res: Response
) => {
  try {
    const { smartWalletAddress, action, limit = 50, offset = 0 } = req.query;

    let query: any = {};
    if (smartWalletAddress) {
      query.smartWalletAddress = smartWalletAddress;
    }
    if (action) {
      query.action = action;
    }

    const transactions = await SmartWalletTransaction.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit as string))
      .skip(parseInt(offset as string));

    return res.status(200).json(transactions);
  } catch (err) {
    console.error("Failed to get smart wallet transactions:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

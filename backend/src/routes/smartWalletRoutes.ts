import express from "express";
import {
  createSmartWallet,
  getSmartWallets,
  getSmartWalletById,
  trackTransaction,
  getSmartWalletTransactions,
} from "../controllers/smartWalletController";

const router = express.Router();

// Smart wallet routes
router.post("/", createSmartWallet);
router.get("/", getSmartWallets);

// Transaction tracking routes
router.post("/track-transaction", trackTransaction);
router.get("/transactions", getSmartWalletTransactions);

// Smart wallet by ID (must be last to avoid conflicts)
router.get("/:id", getSmartWalletById);

export default router;

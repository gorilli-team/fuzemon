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
router.get("/:id", getSmartWalletById);

// Transaction tracking routes
router.post("/track-transaction", trackTransaction);
router.get("/transactions", getSmartWalletTransactions);

export default router;

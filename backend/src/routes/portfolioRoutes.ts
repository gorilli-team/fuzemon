import { Router } from "express";
import {
  getPortfolioMetrics,
  getTokenHoldings,
  getSmartWalletAddresses,
  getPortfolioOverview,
} from "../controllers/portfolioController";

const router = Router();

// @route   GET /api/portfolio/metrics
// @desc    Get portfolio metrics for a smart wallet
// @access  Public
router.get("/metrics", getPortfolioMetrics);

// @route   GET /api/portfolio/holdings
// @desc    Get token holdings for a smart wallet
// @access  Public
router.get("/holdings", getTokenHoldings);

// @route   GET /api/portfolio/wallets
// @desc    Get all smart wallet addresses
// @access  Public
router.get("/wallets", getSmartWalletAddresses);

// @route   GET /api/portfolio/overview
// @desc    Get complete portfolio overview
// @access  Public
router.get("/overview", getPortfolioOverview);

export default router;

import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  getUserMarketAssets,
  upsertUserMarketAsset,
  deleteUserMarketAsset,
  getPortfolioMarketAssets,
  addMarketAssetToPortfolio,
  removeMarketAssetFromPortfolio,
} from "../controllers/holdings.controller.js";

// ─────────────────────────────────────────────
// User-level market asset holdings — mounted at /api/holdings
// ─────────────────────────────────────────────
export const holdingsRouter = express.Router();

holdingsRouter.get("/", protect, getUserMarketAssets);
holdingsRouter.post("/", protect, upsertUserMarketAsset);
holdingsRouter.delete("/:userMarketAssetId", protect, deleteUserMarketAsset);

// ─────────────────────────────────────────────
// Portfolio ↔ market asset links — nested under /api/portfolios/:portfolioId/holdings
// Uses mergeParams to inherit :portfolioId
// ─────────────────────────────────────────────
export const portfolioHoldingsRouter = express.Router({ mergeParams: true });

portfolioHoldingsRouter.get("/", protect, getPortfolioMarketAssets);
portfolioHoldingsRouter.post("/", protect, addMarketAssetToPortfolio);
portfolioHoldingsRouter.delete("/:userMarketAssetId", protect, removeMarketAssetFromPortfolio);
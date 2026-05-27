import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  searchMarketAssets,
  createMarketAsset,
  getCustomAssets,
  createCustomAsset,
  updateCustomAsset,
  deleteCustomAsset,
} from "../controllers/asset.controller.js";

// ─────────────────────────────────────────────
// Market asset routes — mounted at /api/assets
// ─────────────────────────────────────────────
export const marketAssetRouter = express.Router();

marketAssetRouter.get("/", searchMarketAssets);          // GET /api/assets/market?q=AAPL
marketAssetRouter.post("/", protect, createMarketAsset); // POST /api/assets/market

// ─────────────────────────────────────────────
// Custom asset routes — mounted at /api/portfolios/:portfolioId/assets/custom
// Uses mergeParams to inherit :portfolioId
// ─────────────────────────────────────────────
export const customAssetRouter = express.Router({ mergeParams: true });

customAssetRouter.get("/", protect, getCustomAssets);
customAssetRouter.post("/", protect, createCustomAsset);
customAssetRouter.patch("/:assetId", protect, updateCustomAsset);
customAssetRouter.delete("/:assetId", protect, deleteCustomAsset);

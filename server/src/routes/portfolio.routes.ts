import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  createPortfolio,
  getUserPortfolios,
  getPortfolioById,
  updatePortfolio,
  deletePortfolio,
} from "../controllers/portfolio.controller.js";

// Nested routers
import accountRoutes from "./account.routes.js";
import holdingsRoutes from "./holdings.routes.js";
import transactionRoutes from "./transaction.routes.js";
import { customAssetRouter as customAssetRoutes } from "./asset.routes.js";

const router = express.Router();

// Portfolio CRUD
router.post("/", protect, createPortfolio);
router.get("/", protect, getUserPortfolios);
router.get("/:portfolioId", protect, getPortfolioById);
router.patch("/:portfolioId", protect, updatePortfolio);
router.delete("/:portfolioId", protect, deletePortfolio);

// Nested resource routes under /:portfolioId
router.use("/:portfolioId/accounts", protect,accountRoutes);
router.use("/:portfolioId/holdings", protect,holdingsRoutes);
router.use("/:portfolioId/transactions",protect, transactionRoutes);
router.use("/:portfolioId/assets/custom", protect,customAssetRoutes);

export default router;
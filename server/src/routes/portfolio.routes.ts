import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  createPortfolio,
  getUserPortfolios,
  getPortfolioById,
  updatePortfolio,
  deletePortfolio,
} from "../controllers/portfolio.controller.js";

// Nested portfolio ↔ holdings router
import { portfolioHoldingsRouter } from "./holdings.routes.js";

const router = express.Router();

// Portfolio CRUD
router.post("/", protect, createPortfolio);
router.get("/", protect, getUserPortfolios);
router.get("/:portfolioId", protect, getPortfolioById);
router.patch("/:portfolioId", protect, updatePortfolio);
router.delete("/:portfolioId", protect, deletePortfolio);

// Nested: manage which UserMarketAssets belong to a portfolio
router.use("/:portfolioId/holdings", protect, portfolioHoldingsRouter);

export default router;
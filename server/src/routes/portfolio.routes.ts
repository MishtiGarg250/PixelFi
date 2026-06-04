import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  createPortfolio,
  getUserPortfolios,
  getPortfolioById,
  updatePortfolio,
  deletePortfolio,
} from "../controllers/portfolio.controller.js";



const router = express.Router();

// Portfolio CRUD
router.post("/", protect, createPortfolio);
router.get("/", protect, getUserPortfolios);
router.get("/:portfolioId", protect, getPortfolioById);
router.patch("/:portfolioId", protect, updatePortfolio);
router.delete("/:portfolioId", protect, deletePortfolio);


export default router;
import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  createTransaction,
  getPortfolioTransactions,
} from "../controllers/transaction.controller.js";

// Mounted at /api/portfolios/:portfolioId/transactions
const router = express.Router({ mergeParams: true });

router.post('/', protect, createTransaction);
router.get('/', protect, getPortfolioTransactions);

export default router;

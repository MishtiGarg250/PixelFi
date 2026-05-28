import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  createAccount,
  getPortfolioAccounts,
  deleteAccount,
} from "../controllers/account.controller.js";

// Mounted at /api/portfolios/:portfolioId/accounts
const router = express.Router({ mergeParams: true });

router.post("/", protect, createAccount);
router.get("/", protect, getPortfolioAccounts);
router.delete("/:accountId", protect, deleteAccount);

export default router;
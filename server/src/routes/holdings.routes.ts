import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { getPortfolioHoldings } from "../controllers/holdings.controller.js";

// Mounted at /api/portfolios/:portfolioId/holdings
const router = express.Router({ mergeParams: true });

router.get("/", protect, getPortfolioHoldings);

export default router;
import express from "express";

import { protect } from "../middleware/auth.middleware.js";

import {
  createPortfolio,
  getUserPortfolios,
} from "../controllers/portfolio.controller.js";

const router = express.Router();

router.post(
  "/",
  protect,
  createPortfolio
);

router.get(
  "/",
  protect,
  getUserPortfolios
);

export default router;
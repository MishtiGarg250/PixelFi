import express from "express";
import { protect }
from "../middleware/auth.middleware.js";

import {
  getNetWorth,
  getAllocation,
  getPerformance,
  getDashboard,
  getRiskScore,
  getDiversification,
} from "../controllers/analytics.controller.js";

const router = express.Router();

router.get("/net-worth",protect,getNetWorth);
router.get( "/allocation", protect, getAllocation);
router.get("/performance",protect,getPerformance);
router.get( "/dashboard",protect,getDashboard);
router.get("/risk-score",protect,getRiskScore);
router.get("/diversification",protect,getDiversification);

export default router;
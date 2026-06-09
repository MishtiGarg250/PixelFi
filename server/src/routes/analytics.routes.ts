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
  getAnalyticsOverview,
  getSnapshotSeries,
  getLatestMonthlyAnalysis,
  runMonthlyAnalysisNow,
} from "../controllers/analytics.controller.js";

const router = express.Router();

router.get("/net-worth",protect,getNetWorth);
router.get( "/allocation", protect, getAllocation);
router.get("/performance",protect,getPerformance);
router.get( "/dashboard",protect,getDashboard);
router.get("/risk-score",protect,getRiskScore);
router.get("/diversification",protect,getDiversification);
router.get("/overview", protect, getAnalyticsOverview);
router.get("/snapshots", protect, getSnapshotSeries);
router.get("/monthly-analysis/latest",protect,getLatestMonthlyAnalysis);
router.post("/monthly-analysis/run",protect,runMonthlyAnalysisNow);

export default router;

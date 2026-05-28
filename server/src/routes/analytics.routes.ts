import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  getNetWorth,
  getAllocation,
  getPerformance,
} from "../controllers/analytics.controller.js";

const router = express.Router();

router.get("/net-worth", protect, getNetWorth);
router.get("/allocation", protect, getAllocation);
router.get("/performance", protect, getPerformance);

export default router;

import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  getUserLiabilities,
  createLiability,
  updateLiability,
  deleteLiability,
} from "../controllers/liability.controller.js";

// Mounted at /api/liabilities
const router = express.Router();

router.get("/", protect, getUserLiabilities);
router.post("/", protect, createLiability);
router.patch("/:liabilityId", protect, updateLiability);
router.delete("/:liabilityId", protect, deleteLiability);

export default router;

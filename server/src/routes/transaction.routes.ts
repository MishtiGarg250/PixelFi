import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  createTransaction,
  getUserTransactions,
  getAccountTransactions,
} from "../controllers/transaction.controller.js";

// Mounted at /api/transactions
const router = express.Router();

router.post("/", protect, createTransaction);
router.get("/", protect, getUserTransactions);
router.get("/account/:accountId", protect, getAccountTransactions);

export default router;

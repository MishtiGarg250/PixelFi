import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  createAccount,
  getUserAccounts,
  deleteAccount,
} from "../controllers/account.controller.js";

// Mounted at /api/accounts
const router = express.Router();

router.post("/", protect, createAccount);
router.get("/", protect, getUserAccounts);
router.delete("/:accountId", protect, deleteAccount);

export default router;
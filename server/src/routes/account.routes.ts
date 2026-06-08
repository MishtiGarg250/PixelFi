import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  createAccount,
  getUserAccounts,
  deleteAccount,
  updateAccount,
} from "../controllers/account.controller.js";

// Mounted at /api/accounts
const router = express.Router();

router.post("/", protect, createAccount);
router.get("/", protect, getUserAccounts);
router.patch("/:accountId", protect, updateAccount);
router.delete("/:accountId", protect, deleteAccount);

export default router;
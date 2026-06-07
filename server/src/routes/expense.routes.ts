import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
    createExpense,
    getUserExpenses,
    updateExpense,
    deleteExpense
} from "../controllers/expense.controller.js";

const router = express.Router();

router.post("/", protect, createExpense);
router.get("/", protect, getUserExpenses);
router.put("/:id", protect, updateExpense);
router.delete("/:id", protect, deleteExpense);
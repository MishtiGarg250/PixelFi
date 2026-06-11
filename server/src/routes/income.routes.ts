import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
    createIncome,
    getUserIncomes,
    updateIncome,
    deleteIncome,
} from "../controllers/income.controller.js";

const router = express.Router();

router.post("/", protect, createIncome);
router.get("/", protect, getUserIncomes);
router.put("/:id", protect, updateIncome);
router.delete("/:id", protect, deleteIncome);

export default router;

import express from "express";
import { protect } from "../middleware/auth.middleware.js";

import {
    createGoal,
    getUserGoals,
    updateGoal,
    deleteGoal
} from "../controllers/goal.controller.js";

const router = express.Router();
router.post("/", protect, createGoal);
router.get("/", protect, getUserGoals);
router.put("/:id", protect, updateGoal);
router.delete("/:id", protect, deleteGoal); 
export default router;
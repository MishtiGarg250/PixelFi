import express from "express";
import { protect } from "../middleware/auth.middleware.js";

import {
    createGoal,
    getUserGoals,
    updateGoal,
    deleteGoal,
    addGoalContribution
} from "../controllers/goal.controller.js";

const router = express.Router();
router.post("/", protect, createGoal);
router.get("/", protect, getUserGoals);
router.put("/:id", protect, updateGoal);
router.delete("/:id", protect, deleteGoal);
router.post("/:id/contributions", protect, addGoalContribution);
export default router;
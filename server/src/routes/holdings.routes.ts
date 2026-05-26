import express from "express";
import {protect} from "../middleware/auth.middleware.js";
import { getUserHoldings } from "../controllers/holdings.controller.js";

const router = express.Router();

router.get("/", protect, getUserHoldings);

export default router;
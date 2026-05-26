import express from "express";
import {protect} from "../middleware/auth.middleware.js";
import { createAccount, getUserAccounts } from "../controllers/account.controller.js";

const router = express.Router();

router.post("/", protect, createAccount);
router.get("/", protect, getUserAccounts);  

export default router;
import express from "express";
import {getQuote} from "../controllers/market.controller.js";

const router = express.Router();

router.get("/quote/:symbol", getQuote);

export default router;
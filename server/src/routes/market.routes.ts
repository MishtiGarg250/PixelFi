import express from "express";
import {
  getCompanyProfile,
  getQuote,
  searchSymbols,
} from "../controllers/market.controller.js";

const router = express.Router();

router.get("/search", searchSymbols);
router.get("/quote/:symbol", getQuote);
router.get("/profile/:symbol", getCompanyProfile);

export default router;

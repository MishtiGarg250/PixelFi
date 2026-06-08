import express from "express";

import { protect } from "../middleware/auth.middleware.js";

import {
  getCurrentUser,
  updateCurrentUser,
} from "../controllers/user.controller.js";

const router = express.Router();

router.get(
  "/me",
  protect,
  getCurrentUser
);

router.patch(
  "/me",
  protect,
  updateCurrentUser
);

export default router;
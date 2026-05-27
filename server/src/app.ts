import express from "express";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";

import userRoutes from "./routes/user.routes.js";
import portfolioRoutes from "./routes/portfolio.routes.js";
import marketRoutes from "./routes/market.routes.js";
import { marketAssetRouter } from "./routes/asset.routes.js";

const app = express();

// Global middleware
app.use(cors());
app.use(express.json());

// Clerk middleware for authentication
app.use(clerkMiddleware());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/portfolios", portfolioRoutes);
app.use("/api/market", marketRoutes);
app.use("/api/assets/market", marketAssetRouter);

export default app;
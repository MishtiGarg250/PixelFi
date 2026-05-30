import express from "express";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";

import userRoutes from "./routes/user.routes.js";
import accountRoutes from "./routes/account.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import holdingsRoutes from "./routes/holdings.routes.js";
import marketRoutes from "./routes/market.routes.js";
import portfolioRoutes from "./routes/portfolio.routes.js";
import transactionRoutes from "./routes/transaction.routes.js";

console.log("🔥 APP.TS IS RUNNING");

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URI || "http://localhost:3005",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

app.use(clerkMiddleware());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/users", userRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/holdings", holdingsRoutes);
app.use("/api/market", marketRoutes);
app.use("/api/portfolios", portfolioRoutes);
app.use("/api/transactions", transactionRoutes);

export default app;
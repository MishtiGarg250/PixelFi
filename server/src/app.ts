import express from "express";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";

import userRoutes from "./routes/user.routes.js";
import accountRoutes from "./routes/account.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import marketRoutes from "./routes/market.routes.js";
import portfolioRoutes from "./routes/portfolio.routes.js";
import transactionRoutes from "./routes/transaction.routes.js";
import liabilityRoutes from "./routes/liability.routes.js";
import expenseRoutes from "./routes/expense.routes.js";
import goalRoutes from "./routes/goal.routes.js";
import incomeRoutes from "./routes/income.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import router from "./routes/insights.js";
import { marketAssetRouter, customAssetRouter } from "./routes/asset.routes.js";

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URI ,
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
app.use('/api',router);

app.use("/api/users", userRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/market", marketRoutes);
app.use("/api/portfolios", portfolioRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/liabilities", liabilityRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/incomes", incomeRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/assets/market", marketAssetRouter);
app.use("/api/assets/custom", customAssetRouter);

export default app;

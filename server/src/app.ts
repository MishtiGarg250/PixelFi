import express from "express";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import userRoutes from "./routes/user.routes.js";

const app = express();

// Global middleware
app.use(cors());
app.use(express.json());

// Clerk middleware for authentication
app.use(clerkMiddleware());

// Routes
app.use("/api/users",userRoutes);

export default app;
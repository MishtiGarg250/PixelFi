import { getAuth } from "@clerk/express";
import type { Request, Response, NextFunction } from "express";
import { getCurrentUserService } from "../service/user.service.js";

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    // Auto-sync Clerk user to DB
    await getCurrentUserService(userId);

    next();
  } catch (error) {
    next(error);
  }
};
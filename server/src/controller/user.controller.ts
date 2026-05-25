import type { Request, Response } from "express";

interface AuthenticatedRequest extends Request {
  auth?: {
    userId?: string;
  };
}

export const getProfile = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.auth?.userId;

    res.status(200).json({
      message: "Protected route accessed",
      userId,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
    });
  }
};
import type { Request, Response } from "express";

import { getAuth } from "@clerk/express";

import { getCurrentUserService } from "../service/user.service.js";

export const getCurrentUser = async (
  req: Request,
  res: Response
) => {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const user =
      await getCurrentUserService(userId);

    return res.status(200).json({
      success: true,
      user,
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
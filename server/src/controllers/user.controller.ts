import type { Request, Response } from "express";

import { getAuth } from "@clerk/express";

import { getCurrentUserService, updateUserService } from "../service/user.service.js";

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

export const updateCurrentUser = async (
  req: Request,
  res: Response
) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { firstName, lastName, username, baseCurrency } = req.body;

    const user = await updateUserService(userId, { firstName, lastName, username, baseCurrency });

    return res.status(200).json({ success: true, user });
  } catch (error: any) {
    console.error(error);
    const msg = error?.message === "Username already taken" ? "Username already taken" : "Internal Server Error";
    return res.status(error?.message === "Username already taken" ? 409 : 500).json({ success: false, message: msg });
  }
};
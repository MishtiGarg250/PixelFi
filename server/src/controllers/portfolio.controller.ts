import type { Request, Response } from "express";

import { getAuth } from "@clerk/express";

import {
  createPortfolioService,
  getUserPortfoliosService,
} from "../service/portfolio.service.js";

import {
  createPortfolioSchema,
} from "../validators/portfolio.validator.js";

export const createPortfolio = async (
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

    const validatedData =
      createPortfolioSchema.parse(req.body);

    const portfolio =
      await createPortfolioService(
        userId,
        validatedData
      );

    return res.status(201).json({
      success: true,
      portfolio,
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to create portfolio",
    });
  }
};

export const getUserPortfolios = async (
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

    const portfolios =
      await getUserPortfoliosService(userId);

    return res.status(200).json({
      success: true,
      portfolios,
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch portfolios",
    });
  }
};
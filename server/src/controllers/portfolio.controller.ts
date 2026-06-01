import type { Request, Response } from "express";

import { getAuth } from "@clerk/express";

import {
  createPortfolioService,
  getUserPortfoliosService,
  getPortfolioByIdService,
  updatePortfolioService,
  deletePortfolioService,
} from "../service/portfolio.service.js";

import {
  createPortfolioSchema,updatePortfolioSchema
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

export const getPortfolioById = async (
  req: Request,
  res: Response
) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const portfolioId = req.params.portfolioId as string;
    const portfolio = await getPortfolioByIdService(userId, portfolioId);

    return res.status(200).json({ success: true, portfolio });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to fetch portfolio" });
  }
};

export const updatePortfolio = async (
  req: Request,
  res: Response
) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const portfolioId = req.params.portfolioId as string;
    const validatedData = updatePortfolioSchema.parse(req.body);

    const portfolio = await updatePortfolioService(userId, portfolioId, validatedData);

    return res.status(200).json({ success: true, portfolio });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to update portfolio" });
  }
};

export const deletePortfolio = async (
  req: Request,
  res: Response
) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const portfolioId = req.params.portfolioId as string;
    await deletePortfolioService(userId, portfolioId);

    return res.status(200).json({ success: true, message: "Portfolio deleted" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to delete portfolio" });
  }
};
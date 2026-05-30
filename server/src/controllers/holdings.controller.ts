import type { Request, Response } from "express";
import { getAuth } from "@clerk/express";
import { getPortfolioHoldingsService } from "../service/holdings.service.js";

export const getPortfolioHoldings = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const  portfolioId = req.params.portfolioId as string;
    const holdings = await getPortfolioHoldingsService(userId, portfolioId);

    return res.status(200).json({ success: true, holdings });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to fetch holdings" });
  }
};
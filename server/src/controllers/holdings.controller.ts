import type { Request, Response } from "express";
import { getAuth } from "@clerk/express";
import {
  getUserMarketAssetsService,
  upsertUserMarketAssetService,
  deleteUserMarketAssetService,
  addMarketAssetToPortfolioService,
  getPortfolioMarketAssetsService,
  removeMarketAssetFromPortfolioService,
} from "../service/holdings.service.js";

// ─────────────────────────────────────────────
// USER MARKET ASSETS (Holdings)
// ─────────────────────────────────────────────

export const getUserMarketAssets = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const holdings = await getUserMarketAssetsService(userId);

    return res.status(200).json({ success: true, holdings });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to fetch holdings" });
  }
};

export const upsertUserMarketAsset = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { marketAssetId, quantity, averageCost } = req.body;
    const holding = await upsertUserMarketAssetService(userId, {
      marketAssetId,
      quantity,
      averageCost,
    });

    return res.status(200).json({ success: true, holding });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to upsert holding" });
  }
};

export const deleteUserMarketAsset = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const userMarketAssetId = req.params.userMarketAssetId as string;
    await deleteUserMarketAssetService(userId, userMarketAssetId);

    return res.status(200).json({ success: true, message: "Holding deleted" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to delete holding" });
  }
};

// ─────────────────────────────────────────────
// PORTFOLIO ↔ MARKET ASSET LINKS
// ─────────────────────────────────────────────

export const getPortfolioMarketAssets = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const portfolioId = req.params.portfolioId as string;
    const assets = await getPortfolioMarketAssetsService(userId, portfolioId);

    return res.status(200).json({ success: true, assets });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to fetch portfolio market assets" });
  }
};

export const addMarketAssetToPortfolio = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const portfolioId = req.params.portfolioId as string;
    const { userMarketAssetId } = req.body;
    const link = await addMarketAssetToPortfolioService(userId, portfolioId, userMarketAssetId);

    return res.status(201).json({ success: true, link });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to add market asset to portfolio" });
  }
};

export const removeMarketAssetFromPortfolio = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const portfolioId = req.params.portfolioId as string;
    const userMarketAssetId = req.params.userMarketAssetId as string;
    await removeMarketAssetFromPortfolioService(userId, portfolioId, userMarketAssetId);

    return res.status(200).json({ success: true, message: "Market asset removed from portfolio" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to remove market asset from portfolio" });
  }
};
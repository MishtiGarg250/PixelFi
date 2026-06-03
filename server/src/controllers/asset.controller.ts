import type { Request, Response } from "express";
import { getAuth } from "@clerk/express";
import {
  searchMarketAssetsService,
  createMarketAssetService,
  getCustomAssetsService,
  createCustomAssetService,
  updateCustomAssetService,
  deleteCustomAssetService,
} from "../service/asset.service.js";
import {
  createMarketAssetSchema,
  createCustomAssetSchema,
  updateCustomAssetSchema,
} from "../validators/asset.validator.js";

// ─────────────────────────────────────────────
// MARKET ASSET CONTROLLERS
// ─────────────────────────────────────────────

export const searchMarketAssets = async (req: Request, res: Response) => {
  try {
    const query = (req.query.q as string) ?? "";
    const assets = await searchMarketAssetsService(query);
    return res.status(200).json({ success: true, assets });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to search market assets" });
  }
};

export const createMarketAsset = async (req: Request, res: Response) => {
  try {
    const validatedData = createMarketAssetSchema.parse(req.body);
    const asset = await createMarketAssetService(validatedData);
    return res.status(201).json({ success: true, asset });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to create market asset" });
  }
};

// ─────────────────────────────────────────────
// CUSTOM ASSET CONTROLLERS
// ─────────────────────────────────────────────

export const getCustomAssets = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    // Optional filter by portfolioId from query param
    const portfolioId = req.query.portfolioId as string | undefined;
    const assets = await getCustomAssetsService(userId, portfolioId);
    return res.status(200).json({ success: true, assets });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to fetch custom assets" });
  }
};

export const createCustomAsset = async (req: Request, res: Response) => {
  try {
    const userId = getAuth(req).userId as string;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const validatedData = createCustomAssetSchema.parse(req.body);
    const asset = await createCustomAssetService(userId, validatedData);
    return res.status(201).json({ success: true, asset });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to create custom asset" });
  }
};

export const updateCustomAsset = async (req: Request, res: Response) => {
  try {
    const userId = getAuth(req).userId as string;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const assetId = req.params.assetId as string;
    const validatedData = updateCustomAssetSchema.parse(req.body);
    const asset = await updateCustomAssetService(userId, assetId, validatedData);
    return res.status(200).json({ success: true, asset });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to update custom asset" });
  }
};

export const deleteCustomAsset = async (req: Request, res: Response) => {
  try {
    const userId = getAuth(req).userId as string;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const assetId = req.params.assetId as string;
    await deleteCustomAssetService(userId, assetId);
    return res.status(200).json({ success: true, message: "Custom asset deleted" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to delete custom asset" });
  }
};

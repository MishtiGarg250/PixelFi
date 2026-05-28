import { z } from "zod";

export const createMarketAssetSchema = z.object({
  symbol: z.string().min(1).max(20).toUpperCase(),
  name: z.string().min(1).max(255),
  assetType: z.enum(["STOCK", "ETF", "CRYPTO", "BOND", "MUTUAL_FUND"]),
  exchange: z.string().max(100).optional(),
  sector: z.string().max(100).optional(),
  currency: z.string().min(3).max(5),
});

export const createCustomAssetSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  category: z.enum([
    "REAL_ESTATE",
    "VEHICLE",
    "LUXURY_ITEM",
    "ART",
    "COLLECTIBLE",
    "OTHER",
  ]),
  currentValue: z.number().positive(),
  purchasePrice: z.number().positive().optional(),
  purchaseDate: z.string().datetime().optional(),
  currency: z.string().min(3).max(5),
});

export const updateCustomAssetSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional(),
  category: z
    .enum([
      "REAL_ESTATE",
      "VEHICLE",
      "LUXURY_ITEM",
      "ART",
      "COLLECTIBLE",
      "OTHER",
    ])
    .optional(),
  currentValue: z.number().positive().optional(),
  purchasePrice: z.number().positive().optional(),
  purchaseDate: z.string().datetime().optional(),
  currency: z.string().min(3).max(5).optional(),
});

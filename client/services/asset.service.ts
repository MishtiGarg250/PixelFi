import { AxiosInstance } from "axios";

export interface MarketAsset {
  id: string;
  symbol: string;
  name: string;
  assetType: string;
  exchange?: string | null;
  sector?: string | null;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export type CustomAssetCategory =
  | "REAL_ESTATE"
  | "VEHICLE"
  | "LUXURY_ITEM"
  | "ART"
  | "COLLECTIBLE"
  | "OTHER";

export interface CustomAsset {
  id: string;
  name: string;
  description: string | null;
  category: CustomAssetCategory;
  currentValue: number;
  purchasePrice: number | null;
  purchaseDate: string | null;
  currency: string;
  portfolioId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMarketAssetInput {
  symbol: string;
  name: string;
  assetType: "STOCK" | "ETF" | "CRYPTO" | "BOND" | "MUTUAL_FUND";
  exchange?: string;
  sector?: string;
  currency: string;
}

export interface CreateCustomAssetInput {
  name: string;
  description?: string;
  category: CustomAssetCategory;
  currentValue: number;
  purchasePrice?: number;
  purchaseDate?: string;
  currency: string;
  portfolioId?: string;
}

export interface UpdateCustomAssetInput {
  name?: string;
  description?: string;
  category?: CustomAssetCategory;
  currentValue?: number;
  purchasePrice?: number;
  purchaseDate?: string;
  currency?: string;
  portfolioId?: string | null;
}

export const searchMarketAssets = async (
  api: AxiosInstance,
  query: string
): Promise<MarketAsset[]> => {
  const res = await api.get(`/assets/market`, {
    params: { q: query },
  });
  return res.data.assets as MarketAsset[];
};

export const createMarketAsset = async (
  api: AxiosInstance,
  data: CreateMarketAssetInput
): Promise<MarketAsset> => {
  const res = await api.post(`/assets/market`, data);
  return res.data.asset as MarketAsset;
};

export const getCustomAssets = async (
  api: AxiosInstance,
  portfolioId?: string
): Promise<CustomAsset[]> => {
  const res = await api.get(`/assets/custom`, {
    params: portfolioId ? { portfolioId } : {},
  });
  return res.data.assets as CustomAsset[];
};

export const createCustomAsset = async (
  api: AxiosInstance,
  data: CreateCustomAssetInput
): Promise<CustomAsset> => {
  const res = await api.post(`/assets/custom`, data);
  return res.data.asset as CustomAsset;
};

export const updateCustomAsset = async (
  api: AxiosInstance,
  assetId: string,
  data: UpdateCustomAssetInput
): Promise<CustomAsset> => {
  const res = await api.patch(`/assets/custom/${assetId}`, data);
  return res.data.asset as CustomAsset;
};

export const deleteCustomAsset = async (
  api: AxiosInstance,
  assetId: string
): Promise<void> => {
  await api.delete(`/assets/custom/${assetId}`);
};

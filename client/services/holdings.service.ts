import { AxiosInstance } from "axios";

export interface Holding {
  marketAssetId: string;
  symbol: string;
  assetName: string;
  quantity: number;
  averageCost: number;
}

export const getPortfolioHoldings = async (
  api: AxiosInstance,
  portfolioId: string
): Promise<Holding[]> => {
  const res = await api.get(`/portfolios/${portfolioId}/holdings`);
  return res.data.holdings as Holding[];
};

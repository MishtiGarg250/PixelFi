import { AxiosInstance } from "axios";

export interface Portfolio {
  id: string;
  name: string;
  description?: string | null;
  visibility: "PRIVATE" | "PUBLIC";
  createdAt: string;
  updatedAt: string;
  _count?: {
    accounts: number;
    holdings: number;
  };
}

export const getPortfolios = async (api: AxiosInstance): Promise<Portfolio[]> => {
  const res = await api.get("/portfolios/");
  return res.data.portfolios as Portfolio[];
};

export const getPortfolioById = async (api: AxiosInstance, portfolioId: string): Promise<Portfolio> => {
  const res = await api.get(`/portfolios/${portfolioId}`);
  return res.data.portfolio as Portfolio;
};

export const createPortfolio = async (
  api: AxiosInstance,
  data: { name: string; description?: string }
): Promise<Portfolio> => {
  const res = await api.post("/portfolios/", data);
  return res.data.portfolio as Portfolio;
};

export const updatePortfolio = async (
  api: AxiosInstance,
  portfolioId: string,
  data: { name?: string; description?: string | null }
): Promise<Portfolio> => {
  const res = await api.patch(`/portfolios/${portfolioId}`, data);
  return res.data.portfolio as Portfolio;
};

export const deletePortfolio = async (
  api: AxiosInstance,
  portfolioId: string
): Promise<void> => {
  await api.delete(`/portfolios/${portfolioId}`);
};
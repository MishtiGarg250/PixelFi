import { AxiosInstance } from "axios";

export type TransactionType = "BUY" | "SELL" | "DIVIDEND" | "DEPOSIT" | "WITHDRAWAL";

export interface MarketAsset {
  id: string;
  symbol: string;
  name: string;
  assetType: string;
  currency: string;
}

export interface Transaction {
  id: string;
  accountId: string;
  marketAssetId: string;
  type: TransactionType;
  quantity: string;
  price: string;
  fees: string;
  currency: string;
  executedAt: string;
  createdAt: string;
  marketAsset: MarketAsset;
  account: {
    id: string;
    name: string;
    brokerName: string;
  };
}

export const getPortfolioTransactions = async (
  api: AxiosInstance,
  portfolioId: string
): Promise<Transaction[]> => {
  const res = await api.get(`/portfolios/${portfolioId}/transactions`);
  return res.data.data as Transaction[];
};

export const createTransaction = async (
  api: AxiosInstance,
  portfolioId: string,
  data: {
    accountId: string;
    marketAssetId: string;
    type: TransactionType;
    quantity: number;
    price: number;
    fees?: number;
    currency: string;
    executedAt: string;
  }
): Promise<Transaction> => {
  const res = await api.post(`/portfolios/${portfolioId}/transactions`, data);
  return res.data.data as Transaction;
};

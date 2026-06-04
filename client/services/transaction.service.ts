import { AxiosInstance } from "axios";

export type TransactionType =
  | "BUY"
  | "SELL"
  | "DIVIDEND"
  | "DEPOSIT"
  | "WITHDRAWAL"
  | "INTEREST"
  | "TRANSFER";

export interface MarketAsset {
  id: string;
  symbol: string;
  name: string;
  assetType: string;
  currency: string;
}

export interface TransactionAccount {
  id: string;
  name: string;
  brokerName: string;
}

export interface Transaction {
  id: string;
  accountId: string;
  marketAssetId: string | null;
  type: TransactionType;
  quantity: number | null;
  price: number | null;
  amount: number | null;
  fees: number;
  currency: string;
  executedAt: string;
  createdAt: string;
  marketAsset: MarketAsset | null;
  account: TransactionAccount;
}

export const getTransactions = async (
  api: AxiosInstance
): Promise<Transaction[]> => {
  const res = await api.get("/transactions");
  return res.data.data as Transaction[];
};

export const getAccountTransactions = async (
  api: AxiosInstance,
  accountId: string
): Promise<Transaction[]> => {
  const res = await api.get(`/transactions/account/${accountId}`);
  return res.data.data as Transaction[];
};

export const createTransaction = async (
  api: AxiosInstance,
  data: {
    accountId: string;
    marketAssetId?: string;
    type: TransactionType;
    quantity?: number;
    price?: number;
    amount?: number;
    fees?: number;
    currency: string;
    executedAt: string;
  }
): Promise<Transaction> => {
  const res = await api.post("/transactions", data);
  return res.data.data as Transaction;
};

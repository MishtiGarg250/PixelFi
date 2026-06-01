import { AxiosInstance } from "axios";

export type AccountType = "BROKERAGE" | "BANK" | "CRYPTO";

export interface Account {
  id: string;
  portfolioId: string;
  name: string;
  brokerName: string;
  accountType: AccountType;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export const getPortfolioAccounts = async (
  api: AxiosInstance,
  portfolioId: string
): Promise<Account[]> => {
  const res = await api.get(`/portfolios/${portfolioId}/accounts`);
  return res.data.accounts as Account[];
};

export const createAccount = async (
  api: AxiosInstance,
  portfolioId: string,
  data: {
    name: string;
    brokerName: string;
    accountType: AccountType;
    currency: string;
  }
): Promise<Account> => {
  const res = await api.post(`/portfolios/${portfolioId}/accounts`, data);
  return res.data.account as Account;
};

export const deleteAccount = async (
  api: AxiosInstance,
  portfolioId: string,
  accountId: string
): Promise<void> => {
  await api.delete(`/portfolios/${portfolioId}/accounts/${accountId}`);
};

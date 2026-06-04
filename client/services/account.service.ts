import { AxiosInstance } from "axios";

export type AccountType = "BROKERAGE" | "BANK" | "CRYPTO";

export interface Account {
  id: string;
  name: string;
  brokerName: string | null;
  accountType: AccountType;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export const getAccounts = async (
  api: AxiosInstance
): Promise<Account[]> => {
  const res = await api.get("/accounts");
  return res.data.accounts as Account[];
};

export const createAccount = async (
  api: AxiosInstance,
  data: {
    name: string;
    brokerName: string;
    accountType: AccountType;
    currency: string;
  }
): Promise<Account> => {
  const res = await api.post("/accounts", data);
  return res.data.account as Account;
};

export const deleteAccount = async (
  api: AxiosInstance,
  accountId: string
): Promise<void> => {
  await api.delete(`/accounts/${accountId}`);
};

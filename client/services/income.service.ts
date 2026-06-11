import { AxiosInstance } from "axios";

export type IncomeSource =
  | "SALARY"
  | "BONUS"
  | "FREELANCE"
  | "DIVIDEND"
  | "INTEREST"
  | "RENTAL"
  | "OTHER";

export interface Income {
  id: string;
  userId: string;
  accountId: string | null;
  amount: number;
  currency: string;
  source: IncomeSource;
  receivedAt: string;
  createdAt: string;
  account: { id: string; name: string; brokerName: string | null } | null;
}

export interface CreateIncomeInput {
  source: IncomeSource;
  amount: number;
  currency: string;
  receivedAt: string;
  accountId?: string;
}

export const getIncomes = async (api: AxiosInstance): Promise<Income[]> => {
  const res = await api.get("/incomes");
  return res.data as Income[];
};

export const createIncome = async (
  api: AxiosInstance,
  data: CreateIncomeInput
): Promise<Income> => {
  const res = await api.post("/incomes", data);
  return res.data as Income;
};

export const deleteIncome = async (
  api: AxiosInstance,
  id: string
): Promise<void> => {
  await api.delete(`/incomes/${id}`);
};

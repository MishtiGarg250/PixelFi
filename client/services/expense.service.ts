import { AxiosInstance } from "axios";

export type ExpenseCategory =
  | "FOOD"
  | "RENT"
  | "TRAVEL"
  | "SHOPPING"
  | "UTILITIES"
  | "HEALTHCARE"
  | "OTHER";

export interface Expense {
  id: string;
  userId: string;
  accountId: string | null;
  title: string | null;
  amount: number;
  currency: string;
  category: ExpenseCategory;
  occurredAt: string;
  createdAt: string;
  account: { id: string; name: string; brokerName: string | null } | null;
}

export interface CreateExpenseInput {
  category: ExpenseCategory;
  title?: string;
  amount: number;
  currency: string;
  occurredAt: string;
  accountId?: string;
}

export interface UpdateExpenseInput {
  category?: ExpenseCategory;
  title?: string;
  amount?: number;
  currency?: string;
  occurredAt?: string;
  accountId?: string | null;
}

export const getExpenses = async (api: AxiosInstance): Promise<Expense[]> => {
  const res = await api.get("/expenses");
  return res.data as Expense[];
};

export const createExpense = async (
  api: AxiosInstance,
  data: CreateExpenseInput
): Promise<Expense> => {
  const res = await api.post("/expenses", data);
  return res.data as Expense;
};

export const updateExpense = async (
  api: AxiosInstance,
  id: string,
  data: UpdateExpenseInput
): Promise<Expense> => {
  const res = await api.put(`/expenses/${id}`, data);
  return res.data.data as Expense;
};

export const deleteExpense = async (
  api: AxiosInstance,
  id: string
): Promise<void> => {
  await api.delete(`/expenses/${id}`);
};

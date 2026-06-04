import { AxiosInstance } from "axios";

export type LiabilityType =
  | "MORTGAGE"
  | "CAR_LOAN"
  | "PERSONAL_LOAN"
  | "CREDIT_CARD"
  | "OTHER";

export interface Liability {
  id: string;
  name: string;
  type: LiabilityType;
  originalAmount: number;
  outstanding: number;
  interestRate: number | null;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLiabilityInput {
  name: string;
  type: LiabilityType;
  originalAmount: number;
  outstanding: number;
  interestRate?: number;
  currency: string;
}

export interface UpdateLiabilityInput {
  name?: string;
  type?: LiabilityType;
  originalAmount?: number;
  outstanding?: number;
  interestRate?: number | null;
  currency?: string;
}

export const getLiabilities = async (
  api: AxiosInstance
): Promise<Liability[]> => {
  const res = await api.get("/liabilities");
  return res.data.liabilities as Liability[];
};

export const createLiability = async (
  api: AxiosInstance,
  data: CreateLiabilityInput
): Promise<Liability> => {
  const res = await api.post("/liabilities", data);
  return res.data.liability as Liability;
};

export const updateLiability = async (
  api: AxiosInstance,
  liabilityId: string,
  data: UpdateLiabilityInput
): Promise<Liability> => {
  const res = await api.patch(`/liabilities/${liabilityId}`, data);
  return res.data.liability as Liability;
};

export const deleteLiability = async (
  api: AxiosInstance,
  liabilityId: string
): Promise<void> => {
  await api.delete(`/liabilities/${liabilityId}`);
};

import { AxiosInstance } from "axios";

export interface GoalContribution {
  id: string;
  goalId: string;
  amount: number;
  contributedAt: string;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string | null;
  createdAt: string;
  updatedAt: string;
  progressPercent: number;
  status: "ACTIVE" | "COMPLETED";
  contributions: GoalContribution[];
}

export interface CreateGoalInput {
  title: string;
  targetAmount: number;
  targetDate?: string;
}

export interface UpdateGoalInput {
  title?: string;
  targetAmount?: number;
  targetDate?: string;
}

export const getGoals = async (api: AxiosInstance): Promise<Goal[]> => {
  const res = await api.get("/goals");
  return res.data.data as Goal[];
};

export const createGoal = async (
  api: AxiosInstance,
  data: CreateGoalInput
): Promise<Goal> => {
  const res = await api.post("/goals", data);
  return res.data.data as Goal;
};

export const updateGoal = async (
  api: AxiosInstance,
  id: string,
  data: UpdateGoalInput
): Promise<Goal> => {
  const res = await api.put(`/goals/${id}`, data);
  return res.data.data as Goal;
};

export const deleteGoal = async (
  api: AxiosInstance,
  id: string
): Promise<void> => {
  await api.delete(`/goals/${id}`);
};

export const addGoalContribution = async (
  api: AxiosInstance,
  goalId: string,
  amount: number
): Promise<Goal> => {
  const res = await api.post(`/goals/${goalId}/contributions`, { amount });
  return res.data.data as Goal;
};

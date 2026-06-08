import { AxiosInstance } from "axios";

export interface User {
  id: string;
  clerkUserId: string;
  email: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
  baseCurrency: string;
  createdAt: string;
  updatedAt: string;
}

export const getCurrentUser = async (
  api: AxiosInstance
): Promise<User> => {
  const res = await api.get("/users/me");
  return res.data.user as User;
};

export const updateUser = async (
  api: AxiosInstance,
  data: { firstName?: string; lastName?: string; username?: string; baseCurrency?: string }
): Promise<User> => {
  const res = await api.patch("/users/me", data);
  return res.data.user as User;
};

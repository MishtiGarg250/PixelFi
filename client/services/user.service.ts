import { AxiosInstance } from "axios";

export interface User {
  id: string;
  clerkUserId: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export const getCurrentUser = async (
  api: AxiosInstance
): Promise<User> => {
  const res = await api.get("/users/me");
  return res.data.user as User;
};

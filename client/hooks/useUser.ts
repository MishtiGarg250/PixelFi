"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "./useApi";
import { getCurrentUser, updateUser, type User } from "@/services/user.service";
import { queryKeys } from "@/lib/queryKeys";

export function useUser() {
  const { getApi } = useApi();
  const queryClient = useQueryClient();

  const user = useQuery<User>({
    queryKey: queryKeys.user,
    queryFn: async () => {
      const api = await getApi();
      return getCurrentUser(api);
    },
  });

  const syncUser = useMutation<User>({
    mutationFn: async () => {
      const api = await getApi();
      return getCurrentUser(api);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.user, data);
    },
  });

  const update = useMutation<
    User,
    Error,
    { firstName?: string; lastName?: string; username?: string; baseCurrency?: string }
  >({
    mutationFn: async (data) => {
      const api = await getApi();
      return updateUser(api, data);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.user, data);
      queryClient.invalidateQueries({ queryKey: queryKeys.user });
    },
  });

  return { user, syncUser, update };
}

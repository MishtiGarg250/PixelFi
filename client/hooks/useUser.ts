"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "./useApi";
import { getCurrentUser, updateUser, type User } from "@/services/user.service";
import { queryKeys } from "@/lib/queryKeys";

export let globalBaseCurrency = "USD";

export function useUser() {
  const { getApi } = useApi();
  const queryClient = useQueryClient();

  const user = useQuery<User>({
    queryKey: queryKeys.user,
    queryFn: async () => {
      const api = await getApi();
      const userData = await getCurrentUser(api);
      if (userData?.baseCurrency) {
        globalBaseCurrency = userData.baseCurrency;
      }
      return userData;
    },
  });

  if (user.data?.baseCurrency) {
    globalBaseCurrency = user.data.baseCurrency;
  }

  const syncUser = useMutation<User>({
    mutationFn: async () => {
      const api = await getApi();
      const userData = await getCurrentUser(api);
      if (userData?.baseCurrency) {
        globalBaseCurrency = userData.baseCurrency;
      }
      return userData;
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
      if (data?.baseCurrency) {
        globalBaseCurrency = data.baseCurrency;
      }
      queryClient.setQueryData(queryKeys.user, data);
      queryClient.invalidateQueries({ queryKey: queryKeys.user });
    },
  });

  return { user, syncUser, update };
}

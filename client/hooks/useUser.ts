"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "./useApi";
import { getCurrentUser, type User } from "@/services/user.service";
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

  return { user, syncUser };
}

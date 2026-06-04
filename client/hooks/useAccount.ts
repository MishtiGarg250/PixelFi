"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "./useApi";
import {
  getAccounts,
  createAccount,
  deleteAccount,
  type AccountType,
} from "@/services/account.service";
import { queryKeys } from "@/lib/queryKeys";

export function useAccounts(portfolioId?: string) {
  const { getApi } = useApi();
  const queryClient = useQueryClient();

  const accounts = useQuery({
    queryKey: queryKeys.accounts,
    queryFn: async () => {
      const api = await getApi();
      return getAccounts(api);
    },
    enabled: true,
  });

  const create = useMutation({
    mutationFn: async (data: {
      name: string;
      brokerName: string;
      accountType: AccountType;
      currency: string;
    }) => {
      const api = await getApi();
      return createAccount(api, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts });
    },
  });

  const remove = useMutation({
    mutationFn: async (accountId: string) => {
      const api = await getApi();
      return deleteAccount(api, accountId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts });
    },
  });

  return { accounts, create, remove };
}

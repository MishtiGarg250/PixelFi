"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "./useApi";
import {
  getPortfolioAccounts,
  createAccount,
  deleteAccount,
  type AccountType,
} from "@/services/account.service";

export function useAccounts(portfolioId: string) {
  const { getApi } = useApi();
  const queryClient = useQueryClient();

  const accounts = useQuery({
    queryKey: ["accounts", portfolioId],
    queryFn: async () => {
      const api = await getApi();
      return getPortfolioAccounts(api, portfolioId);
    },
    enabled: !!portfolioId,
  });

  const create = useMutation({
    mutationFn: async (data: {
      name: string;
      brokerName: string;
      accountType: AccountType;
      currency: string;
    }) => {
      const api = await getApi();
      return createAccount(api, portfolioId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts", portfolioId] });
    },
  });

  const remove = useMutation({
    mutationFn: async (accountId: string) => {
      const api = await getApi();
      return deleteAccount(api, portfolioId, accountId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts", portfolioId] });
    },
  });

  return { accounts, create, remove };
}

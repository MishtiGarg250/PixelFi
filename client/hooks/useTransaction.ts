"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "./useApi";
import {
  getTransactions,
  getAccountTransactions,
  createTransaction,
  type TransactionType,
} from "@/services/transaction.service";
import { queryKeys } from "@/lib/queryKeys";

export function useTransactions(accountId?: string) {
  const { getApi } = useApi();
  const queryClient = useQueryClient();

  const transactions = useQuery({
    queryKey: accountId ? queryKeys.accountTransactions(accountId) : queryKeys.transactions,
    queryFn: async () => {
      const api = await getApi();
      return accountId ? getAccountTransactions(api, accountId) : getTransactions(api);
    },
    enabled: true,
  });

  const create = useMutation({
    mutationFn: async (data: {
      accountId: string;
      marketAssetId?: string;
      type: TransactionType;
      quantity?: number;
      price?: number;
      amount?: number;
      fees?: number;
      currency: string;
      executedAt: string;
    }) => {
      const api = await getApi();
      return createTransaction(api, data);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
      queryClient.invalidateQueries({ queryKey: queryKeys.holdingsList });
      queryClient.invalidateQueries({ queryKey: queryKeys.accountTransactions(variables.accountId) });
    },
  });

  return { transactions, create };
}

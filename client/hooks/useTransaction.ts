"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "./useApi";
import {
  getPortfolioTransactions,
  createTransaction,
  type TransactionType,
} from "@/services/transaction.service";

export function useTransactions(portfolioId: string) {
  const { getApi } = useApi();
  const queryClient = useQueryClient();

  const transactions = useQuery({
    queryKey: ["transactions", portfolioId],
    queryFn: async () => {
      const api = await getApi();
      return getPortfolioTransactions(api, portfolioId);
    },
    enabled: !!portfolioId,
  });

  const create = useMutation({
    mutationFn: async (data: {
      accountId: string;
      marketAssetId: string;
      type: TransactionType;
      quantity: number;
      price: number;
      fees?: number;
      currency: string;
      executedAt: string;
    }) => {
      const api = await getApi();
      return createTransaction(api, portfolioId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions", portfolioId] });
      queryClient.invalidateQueries({ queryKey: ["holdings", portfolioId] });
    },
  });

  return { transactions, create };
}

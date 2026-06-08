"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "./useApi";
import {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  type CreateExpenseInput,
  type UpdateExpenseInput,
} from "@/services/expense.service";
import { queryKeys } from "@/lib/queryKeys";

export function useExpenses() {
  const { getApi } = useApi();
  const queryClient = useQueryClient();

  const expenses = useQuery({
    queryKey: queryKeys.expenses,
    queryFn: async () => {
      const api = await getApi();
      return getExpenses(api);
    },
  });

  const create = useMutation({
    mutationFn: async (data: CreateExpenseInput) => {
      const api = await getApi();
      return createExpense(api, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses });
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts });
    },
  });

  const update = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateExpenseInput }) => {
      const api = await getApi();
      return updateExpense(api, id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses });
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const api = await getApi();
      return deleteExpense(api, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses });
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts });
    },
  });

  return { expenses, create, update, remove };
}

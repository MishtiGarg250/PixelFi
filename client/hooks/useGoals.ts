"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "./useApi";
import {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  addGoalContribution,
  type CreateGoalInput,
  type UpdateGoalInput,
} from "@/services/goal.service";
import { queryKeys } from "@/lib/queryKeys";

export function useGoals() {
  const { getApi } = useApi();
  const queryClient = useQueryClient();

  const goals = useQuery({
    queryKey: queryKeys.goals,
    queryFn: async () => {
      const api = await getApi();
      return getGoals(api);
    },
  });

  const create = useMutation({
    mutationFn: async (data: CreateGoalInput) => {
      const api = await getApi();
      return createGoal(api, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.goals });
    },
  });

  const update = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateGoalInput }) => {
      const api = await getApi();
      return updateGoal(api, id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.goals });
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const api = await getApi();
      return deleteGoal(api, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.goals });
    },
  });

  const contribute = useMutation({
    mutationFn: async ({ goalId, amount }: { goalId: string; amount: number }) => {
      const api = await getApi();
      return addGoalContribution(api, goalId, amount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.goals });
    },
  });

  return { goals, create, update, remove, contribute };
}

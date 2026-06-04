"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "./useApi";
import {
  getLiabilities,
  createLiability,
  updateLiability,
  deleteLiability,
  type CreateLiabilityInput,
  type UpdateLiabilityInput,
} from "@/services/liability.service";
import { queryKeys } from "@/lib/queryKeys";

export function useLiabilities() {
  const { getApi } = useApi();
  const queryClient = useQueryClient();

  const liabilities = useQuery({
    queryKey: queryKeys.liabilities,
    queryFn: async () => {
      const api = await getApi();
      return getLiabilities(api);
    },
  });

  const create = useMutation({
    mutationFn: async (data: CreateLiabilityInput) => {
      const api = await getApi();
      return createLiability(api, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.liabilities });
    },
  });

  const update = useMutation({
    mutationFn: async ({ liabilityId, data }: { liabilityId: string; data: UpdateLiabilityInput }) => {
      const api = await getApi();
      return updateLiability(api, liabilityId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.liabilities });
    },
  });

  const remove = useMutation({
    mutationFn: async (liabilityId: string) => {
      const api = await getApi();
      return deleteLiability(api, liabilityId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.liabilities });
    },
  });

  return { liabilities, create, update, remove };
}

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "./useApi";
import {
  getPortfolios,
  getPortfolioById,
  createPortfolio,
  updatePortfolio,
  deletePortfolio,
} from "@/services/portfolio.service";
import { queryKeys } from "@/lib/queryKeys";

export function usePortfolios() {
  const { getApi } = useApi();
  const queryClient = useQueryClient();

  const portfolios = useQuery({
    queryKey: queryKeys.portfolios,
    queryFn: async () => {
      const api = await getApi();
      return getPortfolios(api);
    },
  });

  const create = useMutation({
    mutationFn: async (data: { name: string; description?: string }) => {
      const api = await getApi();
      return createPortfolio(api, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.portfolios });
    },
  });

  const update = useMutation({
    mutationFn: async ({
      portfolioId,
      data,
    }: {
      portfolioId: string;
      data: { name?: string; description?: string | null; visibility?: "PRIVATE" | "PUBLIC" };
    }) => {
      const api = await getApi();
      return updatePortfolio(api, portfolioId, data);
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.portfolios });
      queryClient.invalidateQueries({ queryKey: queryKeys.portfolio(vars.portfolioId) });
    },
  });

  const remove = useMutation({
    mutationFn: async (portfolioId: string) => {
      const api = await getApi();
      return deletePortfolio(api, portfolioId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.portfolios });
    },
  });

  return { portfolios, create, update, remove };
}

export function usePortfolio(portfolioId: string) {
  const { getApi } = useApi();

  return useQuery({
    queryKey: queryKeys.portfolio(portfolioId),
    queryFn: async () => {
      const api = await getApi();
      return getPortfolioById(api, portfolioId);
    },
    enabled: !!portfolioId,
  });
}
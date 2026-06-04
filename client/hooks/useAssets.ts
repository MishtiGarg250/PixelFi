"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "./useApi";
import {
  searchMarketAssets,
  createMarketAsset,
  getCustomAssets,
  createCustomAsset,
  updateCustomAsset,
  deleteCustomAsset,
  type CreateMarketAssetInput,
  type CreateCustomAssetInput,
  type UpdateCustomAssetInput,
} from "@/services/asset.service";
import { queryKeys } from "@/lib/queryKeys";

export function useMarketAssets(query: string) {
  const { getApi } = useApi();
  const queryClient = useQueryClient();

  const marketAssets = useQuery({
    queryKey: queryKeys.marketAssets(query),
    queryFn: async () => {
      const api = await getApi();
      return searchMarketAssets(api, query);
    },
    enabled: query.length > 0,
  });

  const create = useMutation({
    mutationFn: async (data: CreateMarketAssetInput) => {
      const api = await getApi();
      return createMarketAsset(api, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.marketAssets(query) });
    },
  });

  return { marketAssets, create };
}

export function useCustomAssets(portfolioId?: string) {
  const { getApi } = useApi();
  const queryClient = useQueryClient();

  const customAssets = useQuery({
    queryKey: queryKeys.customAssets(portfolioId),
    queryFn: async () => {
      const api = await getApi();
      return getCustomAssets(api, portfolioId);
    },
    enabled: true,
  });

  const create = useMutation({
    mutationFn: async (data: CreateCustomAssetInput) => {
      const api = await getApi();
      return createCustomAsset(api, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customAssets(portfolioId) });
    },
  });

  const update = useMutation({
    mutationFn: async ({ assetId, data }: { assetId: string; data: UpdateCustomAssetInput }) => {
      const api = await getApi();
      return updateCustomAsset(api, assetId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customAssets(portfolioId) });
    },
  });

  const remove = useMutation({
    mutationFn: async (assetId: string) => {
      const api = await getApi();
      return deleteCustomAsset(api, assetId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customAssets(portfolioId) });
    },
  });

  return { customAssets, create, update, remove };
}

"use client";

import { useQuery } from "@tanstack/react-query";
import { useApi } from "./useApi";
import { getHoldingById, type Holding } from "@/services/holdings.service";
import { queryKeys } from "@/lib/queryKeys";

export function useHolding(userMarketAssetId: string) {
  const { getApi } = useApi();

  return useQuery<Holding>({
    queryKey: queryKeys.holding(userMarketAssetId),
    queryFn: async () => {
      const api = await getApi();
      return getHoldingById(api, userMarketAssetId);
    },
    enabled: !!userMarketAssetId,
  });
}

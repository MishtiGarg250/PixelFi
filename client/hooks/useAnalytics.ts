"use client";

import { useQuery } from "@tanstack/react-query";
import { useApi } from "./useApi";
import { getNetWorth, getAllocation, getPerformance, type NetWorthPayload, type AllocationItem, type PerformanceItem } from "@/services/analytics.service";
import { queryKeys } from "@/lib/queryKeys";

export function useNetWorth() {
  const { getApi } = useApi();
  return useQuery<NetWorthPayload>({
    queryKey: queryKeys.analytics.netWorth,
    queryFn: async () => {
      const api = await getApi();
      return getNetWorth(api);
    },
  });
}

export function useAllocation() {
  const { getApi } = useApi();
  return useQuery<AllocationItem[]>({
    queryKey: queryKeys.analytics.allocation,
    queryFn: async () => {
      const api = await getApi();
      return getAllocation(api);
    },
  });
}

export function usePerformance() {
  const { getApi } = useApi();
  return useQuery<PerformanceItem[]>({
    queryKey: queryKeys.analytics.performance,
    queryFn: async () => {
      const api = await getApi();
      return getPerformance(api);
    },
  });
}

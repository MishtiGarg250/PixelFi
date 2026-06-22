"use client";

import { useQuery } from "@tanstack/react-query";
import { useApi } from "./useApi";
import {
  getAnalyticsOverview,
  getLatestMonthlyReport,
  getNetWorth,
  getAllocation,
  getPerformance,
  getSnapshotSeries,
  runMonthlyAnalysis,
  type NetWorthPayload,
  type AllocationItem,
  type PerformanceItem,
  type AnalyticsOverviewPayload,
  type MonthlyReportPayload,
  type SnapshotSeriesItem,
  type MLPredictionPayload,
  getLatestPrediction,
} from "@/services/analytics.service";
import { queryKeys } from "@/lib/queryKeys";
import { useMutation, useQueryClient } from "@tanstack/react-query";

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

export function useAnalyticsOverview() {
  const { getApi } = useApi();
  return useQuery<AnalyticsOverviewPayload>({
    queryKey: queryKeys.analytics.overview,
    queryFn: async () => {
      const api = await getApi();
      return getAnalyticsOverview(api);
    },
  });
}

export function useSnapshotSeries(
  type: "DAILY" | "MONTHLY" = "DAILY",
  range = 90
) {
  const { getApi } = useApi();
  return useQuery<SnapshotSeriesItem[]>({
    queryKey: queryKeys.analytics.snapshots(type, range),
    queryFn: async () => {
      const api = await getApi();
      return getSnapshotSeries(api, type, range);
    },
  });
}

export function useLatestMonthlyReport() {
  const { getApi } = useApi();
  return useQuery<MonthlyReportPayload | null>({
    queryKey: queryKeys.analytics.monthlyReport,
    queryFn: async () => {
      const api = await getApi();
      return getLatestMonthlyReport(api);
    },
  });
}

export function useRunMonthlyAnalysis() {
  const { getApi } = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const api = await getApi();
      return runMonthlyAnalysis(api);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.analytics.overview,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.analytics.monthlyReport,
      });
    },
  });
}

export function useLatestPrediction() {
  const { getApi } = useApi();
  return useQuery<MLPredictionPayload | null>({
    queryKey: ["analytics", "prediction"],
    queryFn: async () => {
      const api = await getApi();
      return getLatestPrediction(api);
    },
  });
}

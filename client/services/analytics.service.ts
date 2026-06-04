import { AxiosInstance } from "axios";

export interface NetWorthHolding {
  marketAssetId: string;
  symbol: string;
  assetName: string;
  quantity: number;
  averageCost: number;
  currentPrice: number;
  currentValue: number;
}

export interface NetWorthPayload {
  totalNetWorth: number;
  holdings: NetWorthHolding[];
}

export interface AllocationItem {
  symbol: string;
  currentValue: number;
  allocationPercent: number;
}

export interface PerformanceItem {
  symbol: string;
  investedAmount: number;
  currentValue: number;
  pnl: number;
  pnlPercent: number;
}

export const getNetWorth = async (
  api: AxiosInstance
): Promise<NetWorthPayload> => {
  const res = await api.get("/analytics/net-worth");
  return res.data.analytics as NetWorthPayload;
};

export const getAllocation = async (
  api: AxiosInstance
): Promise<AllocationItem[]> => {
  const res = await api.get("/analytics/allocation");
  return res.data.allocation as AllocationItem[];
};

export const getPerformance = async (
  api: AxiosInstance
): Promise<PerformanceItem[]> => {
  const res = await api.get("/analytics/performance");
  return res.data.performance as PerformanceItem[];
};

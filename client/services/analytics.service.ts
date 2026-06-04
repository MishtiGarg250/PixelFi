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

export interface NetWorthCustomAsset {
  id: string;
  name: string;
  category: string;
  currentValue: number;
}

export interface NetWorthPayload {
  totalAssets: number;
  totalLiabilities: number;
  totalNetWorth: number;
  holdings: NetWorthHolding[];
  customAssets: NetWorthCustomAsset[];
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

export interface DashboardPayload {
  netWorth: NetWorthPayload;
  allocation: AllocationItem[];
  performance: PerformanceItem[];
  liabilities: {
    id: string;
    name: string;
    outstanding: number;
    currency: string;
  }[];
  recentTransactions: unknown[];
}

export interface RiskScorePayload {
  score: number;
  level: "LOW" | "MEDIUM" | "HIGH";
}


export interface DiversificationPayload {
  score: number;
  totalAssets: number;
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

export const getDashboard = async (
  api: AxiosInstance
): Promise<DashboardPayload> => {
  const res = await api.get("/analytics/dashboard");

  return res.data.dashboard as DashboardPayload;
};

export const getRiskScore = async (
  api: AxiosInstance
): Promise<RiskScorePayload> => {
  const res = await api.get("/analytics/risk-score");

  return res.data.risk as RiskScorePayload;
};

export const getDiversification = async (
  api: AxiosInstance
): Promise<DiversificationPayload> => {
  const res = await api.get(
    "/analytics/diversification"
  );

  return res.data
    .diversification as DiversificationPayload;
};
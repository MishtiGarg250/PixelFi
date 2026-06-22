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

export interface SnapshotSeriesItem {
  id: string;
  snapshotDate: string;
  snapshotType: "DAILY" | "MONTHLY";
  netWorth: number;
  totalAssets: number;
  totalLiabilities: number;
  portfolioValue: number;
  cashValue: number;
  monthlyExpenses: number;
  monthlyIncome: number;
  savingsRate: number;
  riskScore: number;
  diversificationScore: number;
  healthScore: number;
  portfolioReturnPercent: number;
  emergencyFundMonths: number;
  debtToAssetRatio: number;
  summary?: string | null;
}

export interface MonthlyInsight {
  id: string;
  type: string;
  severity: "LOW" | "MEDIUM" | "HIGH";
  title: string;
  description: string;
  createdAt: string;
}

export interface MonthlyReportPayload {
  snapshot: SnapshotSeriesItem;
  insights: MonthlyInsight[];
}

export interface AnalyticsOverviewPayload {
  dashboard: DashboardPayload;
  risk: RiskScorePayload;
  diversification: DiversificationPayload;
  latestReport: MonthlyReportPayload | null;
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

export const getAnalyticsOverview = async (
  api: AxiosInstance
): Promise<AnalyticsOverviewPayload> => {
  const res = await api.get("/analytics/overview");

  return res.data.overview as AnalyticsOverviewPayload;
};

export const getSnapshotSeries = async (
  api: AxiosInstance,
  type: "DAILY" | "MONTHLY" = "DAILY",
  range = 90
): Promise<SnapshotSeriesItem[]> => {
  const res = await api.get("/analytics/snapshots", {
    params: {
      type,
      range,
    },
  });

  return res.data.snapshots as SnapshotSeriesItem[];
};

export const getLatestMonthlyReport = async (
  api: AxiosInstance
): Promise<MonthlyReportPayload | null> => {
  const res = await api.get(
    "/analytics/monthly-analysis/latest"
  );

  return res.data.report as MonthlyReportPayload | null;
};

export const runMonthlyAnalysis = async (
  api: AxiosInstance
): Promise<unknown> => {
  const res = await api.post("/analytics/monthly-analysis/run");

  return res.data.report;
};

export interface MLPredictionPayload {
  id: string;
  userId: string;
  modelType: string;
  predictionDate: string;
  inputSnapshotId: string;
  resultJson: {
    projections: { date: string; expectedNetWorth: number }[];
    incomeGrowthRate: number;
    expenseGrowthRate: number;
  };
  confidence: number | null;
  createdAt: string;
}

export const getLatestPrediction = async (
  api: AxiosInstance
): Promise<MLPredictionPayload | null> => {
  const res = await api.get("/analytics/prediction/latest");
  return res.data.prediction as MLPredictionPayload | null;
};

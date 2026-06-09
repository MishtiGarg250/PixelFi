import axios from "axios";

import type { AnalyticsSnapshotData } from "./analytics-builder.service.js";

const ML_SERVICE_URL = process.env.ML_SERVICE_URL ?? "http://localhost:8000";

export interface MonthlyMlInput {
  latestSnapshot: AnalyticsSnapshotData;
  history: AnalyticsSnapshotData[];
  goals: {
    title: string;
    targetAmount: number;
    currentAmount: number;
    targetDate: string | null;
  }[];
  expensesByCategory: Record<string, number>;
}

export interface MonthlyMlOutput {
  modelVersion: string;
  risk: {
    risk_score: number;
    category: "LOW" | "MEDIUM" | "HIGH";
  };
  health: {
    health_score: number;
    label: "STRONG" | "STABLE" | "WATCH" | "AT_RISK";
    components: Record<string, number>;
  };
  expenseAnomalies: {
    category: string;
    amount: number;
    severity: "LOW" | "MEDIUM" | "HIGH";
    message: string;
  }[];
  netWorthForecast: {
    month: string;
    projectedNetWorth: number;
  }[];
  goalProbabilities: {
    title: string;
    probability: number;
    message: string;
  }[];
}

async function postMl<T>(path: string, data: unknown) {
  const response = await axios.post<T>(
    `${ML_SERVICE_URL}${path}`,
    data,
    {
      timeout: 15000,
    }
  );

  return response.data;
}

function fallbackMl(input: MonthlyMlInput): MonthlyMlOutput {
  const snapshot = input.latestSnapshot;
  const healthLabel =
    snapshot.healthScore >= 80
      ? "STRONG"
      : snapshot.healthScore >= 60
        ? "STABLE"
        : snapshot.healthScore >= 40
          ? "WATCH"
          : "AT_RISK";

  return {
    modelVersion: "fallback-rules-v1",
    risk: {
      risk_score: snapshot.riskScore,
      category:
        snapshot.riskScore > 60
          ? "HIGH"
          : snapshot.riskScore > 30
            ? "MEDIUM"
            : "LOW",
    },
    health: {
      health_score: snapshot.healthScore,
      label: healthLabel,
      components: {
        diversificationScore: snapshot.diversificationScore,
        riskScore: snapshot.riskScore,
        emergencyFundMonths: snapshot.emergencyFundMonths,
        debtToAssetRatio: snapshot.debtToAssetRatio,
      },
    },
    expenseAnomalies: [],
    netWorthForecast: Array.from({ length: 6 }).map((_, index) => {
      const month = new Date();
      month.setMonth(month.getMonth() + index + 1);

      return {
        month: month.toISOString().slice(0, 7),
        projectedNetWorth: Number(
          (snapshot.netWorth * (1 + 0.01 * (index + 1))).toFixed(2)
        ),
      };
    }),
    goalProbabilities: input.goals.map((goal) => {
      const progress =
        goal.targetAmount === 0
          ? 0
          : goal.currentAmount / goal.targetAmount;

      return {
        title: goal.title,
        probability: Math.min(95, Math.round(progress * 100)),
        message: `${Math.round(progress * 100)}% funded`,
      };
    }),
  };
}

export async function getMonthlyMlAnalysis(
  input: MonthlyMlInput
): Promise<MonthlyMlOutput> {
  try {
    return await postMl<MonthlyMlOutput>(
      "/predict/monthly-analysis",
      input
    );
  } catch (error) {
    console.warn(
      "ML service unavailable; using fallback monthly analysis",
      error instanceof Error ? error.message : "unknown error"
    );

    return fallbackMl(input);
  }
}

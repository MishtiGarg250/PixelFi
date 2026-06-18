import prisma from "../lib/prisma.js";
import { buildAnalyticsForUser } from "./analytics-builder.service.js";
import { sendDailySnapshotEmail } from "./email.service.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Compute the 10 ML-derived ratio fields by looking at the user's last 3
 * monthly snapshots. Returns partial — all fields are nullable so it is safe
 * to spread into a Prisma create/update data object even when history is thin.
 */
async function computeMlRatioFields(
  userId: string,
  current: {
    netWorth: number;
    totalAssets: number;
    totalLiabilities: number;
    monthlyExpenses: number;
    monthlyIncome: number;
    cashValue: number;
  }
): Promise<{
  netWorthMoM: number | null;
  netWorthVelocity: number | null;
  expenseGrowthRate: number | null;
  incomeGrowthRate: number | null;
  liquidityRatio: number | null;
  burnRate: number | null;
  investmentRate: number | null;
  liabilityGrowthRate: number | null;
  expenseVolatility: number | null;
  cashFlowNetPositive: boolean | null;
}> {
  const history = await prisma.financialSnapshot.findMany({
    where: { userId, snapshotType: "MONTHLY" },
    orderBy: { snapshotDate: "desc" },
    take: 3,
    select: {
      netWorth: true,
      totalLiabilities: true,
      monthlyExpenses: true,
      monthlyIncome: true,
    },
  });

  const prev = history[0]; // previous month
  const prev2 = history[1]; // 2 months ago
  const prev3 = history[2]; // 3 months ago

  // -- Simple MoM and growth rates --
  const netWorthMoM = prev
    ? Number(prev.netWorth) !== 0
      ? Number(
          (
            ((current.netWorth - Number(prev.netWorth)) /
              Math.abs(Number(prev.netWorth))) *
            100
          ).toFixed(4)
        )
      : null
    : null;

  // 3-month rolling velocity: avg MoM change across up to 3 periods
  let netWorthVelocity: number | null = null;
  if (prev && prev2) {
    const deltas = [current.netWorth - Number(prev.netWorth)];
    deltas.push(Number(prev.netWorth) - Number(prev2.netWorth));
    if (prev3) {
      deltas.push(Number(prev2.netWorth) - Number(prev3.netWorth));
    }
    netWorthVelocity = Number(
      (deltas.reduce((a, b) => a + b, 0) / deltas.length).toFixed(4)
    );
  }

  const expenseGrowthRate = prev
    ? Number(prev.monthlyExpenses) !== 0
      ? Number(
          (
            ((current.monthlyExpenses - Number(prev.monthlyExpenses)) /
              Math.abs(Number(prev.monthlyExpenses))) *
            100
          ).toFixed(4)
        )
      : null
    : null;

  const incomeGrowthRate = prev
    ? Number(prev.monthlyIncome) !== 0
      ? Number(
          (
            ((current.monthlyIncome - Number(prev.monthlyIncome)) /
              Math.abs(Number(prev.monthlyIncome))) *
            100
          ).toFixed(4)
        )
      : null
    : null;

  const liabilityGrowthRate = prev
    ? Number(prev.totalLiabilities) !== 0
      ? Number(
          (
            ((current.totalLiabilities - Number(prev.totalLiabilities)) /
              Math.abs(Number(prev.totalLiabilities))) *
            100
          ).toFixed(4)
        )
      : null
    : null;

  // -- Ratios computable from current snapshot alone --
  const liquidityRatio =
    current.monthlyExpenses !== 0
      ? Number((current.cashValue / current.monthlyExpenses).toFixed(4))
      : null;

  const burnRate =
    current.totalAssets !== 0
      ? Number((current.monthlyExpenses / current.totalAssets).toFixed(4))
      : null;

  const investmentRate =
    current.monthlyIncome !== 0
      ? Number(
          (
            ((current.monthlyIncome - current.monthlyExpenses) /
              current.monthlyIncome) *
            100
          ).toFixed(4)
        )
      : null;

  // -- Expense volatility: std dev of last 3 monthly expense amounts --
  let expenseVolatility: number | null = null;
  const expenseValues = [current.monthlyExpenses];
  if (prev) expenseValues.push(Number(prev.monthlyExpenses));
  if (prev2) expenseValues.push(Number(prev2.monthlyExpenses));
  if (expenseValues.length >= 2) {
    const mean = expenseValues.reduce((a, b) => a + b, 0) / expenseValues.length;
    const variance =
      expenseValues.reduce((a, b) => a + Math.pow(b - mean, 2), 0) /
      expenseValues.length;
    expenseVolatility = Number(Math.sqrt(variance).toFixed(4));
  }

  const cashFlowNetPositive =
    current.monthlyIncome !== null && current.monthlyExpenses !== null
      ? current.monthlyIncome > current.monthlyExpenses
      : null;

  return {
    netWorthMoM,
    netWorthVelocity,
    expenseGrowthRate,
    incomeGrowthRate,
    liquidityRatio,
    burnRate,
    investmentRate,
    liabilityGrowthRate,
    expenseVolatility,
    cashFlowNetPositive,
  };
}

// ---------------------------------------------------------------------------
// Snapshot generators
// ---------------------------------------------------------------------------

export async function generateDailySnapshot(
  clerkUserId: string
) {
  const user = await prisma.user.findUnique({
    where: {
      clerkUserId,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const today = new Date();

  const startOfDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const endOfDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + 1
  );

  const existing =
    await prisma.financialSnapshot.findFirst({
      where: {
        userId: user.id,
        snapshotType: "DAILY",
        snapshotDate: {
          gte: startOfDay,
          lt: endOfDay,
        },
      },
    });

  if (existing) {
    return existing;
  }

  const analytics =
    await buildAnalyticsForUser(clerkUserId);

  const mlRatios = await computeMlRatioFields(user.id, {
    netWorth: analytics.netWorth,
    totalAssets: analytics.totalAssets,
    totalLiabilities: analytics.totalLiabilities,
    monthlyExpenses: analytics.monthlyExpenses,
    monthlyIncome: analytics.monthlyIncome,
    cashValue: analytics.cashValue,
  });

  const snapshot = await prisma.financialSnapshot.create({
    data: {
      userId: user.id,
      snapshotType: "DAILY",
      snapshotDate: startOfDay,
      netWorth: analytics.netWorth,
      totalAssets: analytics.totalAssets,
      totalLiabilities: analytics.totalLiabilities,
      portfolioValue: analytics.portfolioValue,
      cashValue: analytics.cashValue,
      monthlyExpenses: analytics.monthlyExpenses,
      monthlyIncome: analytics.monthlyIncome,
      savingsRate: analytics.savingsRate,
      riskScore: analytics.riskScore,
      diversificationScore: analytics.diversificationScore,
      healthScore: analytics.healthScore,
      activeGoals: analytics.activeGoals,
      goalTargetAmount: analytics.goalTargetAmount,
      goalCurrentAmount: analytics.goalCurrentAmount,
      totalInvested: analytics.totalInvested,
      unrealizedPnL: analytics.unrealizedPnL,
      portfolioReturnPercent: analytics.portfolioReturnPercent,
      emergencyFundMonths: analytics.emergencyFundMonths,
      debtToAssetRatio: analytics.debtToAssetRatio,
      largestHoldingPercent: analytics.largestHoldingPercent,
      holdingCount: analytics.holdingCount,
      // ML ratio fields
      ...mlRatios,
    },
  });

  // --- Notification + Email (fire-and-forget) ---
  const dateLabel = startOfDay.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  prisma.notification
    .create({
      data: {
        userId: user.id,
        title: "Daily Snapshot Ready",
        message: `Your financial snapshot for ${dateLabel} is ready. Net Worth: ₹${analytics.netWorth.toLocaleString("en-IN", { maximumFractionDigits: 2 })}, Health Score: ${analytics.healthScore}/100.`,
        type: "DAILY_SNAPSHOT",
      },
    })
    .catch((err) =>
      console.error("[Snapshot] Failed to create daily notification:", err)
    );

  sendDailySnapshotEmail(user.email, user.firstName || user.username || "User", {
    netWorth: analytics.netWorth,
    healthScore: analytics.healthScore,
    totalAssets: analytics.totalAssets,
    totalLiabilities: analytics.totalLiabilities,
    date: dateLabel,
  });

  return snapshot;
}

export async function generateMonthlySnapshot(
  clerkUserId: string
) {
  const user = await prisma.user.findUnique({
    where: {
      clerkUserId,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const now = new Date();

  const startOfMonth = new Date(
    now.getFullYear(),
    now.getMonth(),
    1
  );

  const existing =
    await prisma.financialSnapshot.findFirst({
      where: {
        userId: user.id,
        snapshotType: "MONTHLY",
        snapshotDate: startOfMonth,
      },
    });

  if (existing) {
    return existing;
  }

  const analytics =
    await buildAnalyticsForUser(clerkUserId);

  const mlRatios = await computeMlRatioFields(user.id, {
    netWorth: analytics.netWorth,
    totalAssets: analytics.totalAssets,
    totalLiabilities: analytics.totalLiabilities,
    monthlyExpenses: analytics.monthlyExpenses,
    monthlyIncome: analytics.monthlyIncome,
    cashValue: analytics.cashValue,
  });

  return prisma.financialSnapshot.create({
    data: {
      userId: user.id,
      snapshotType: "MONTHLY",
      snapshotDate: startOfMonth,
      netWorth: analytics.netWorth,
      totalAssets: analytics.totalAssets,
      totalLiabilities: analytics.totalLiabilities,
      portfolioValue: analytics.portfolioValue,
      cashValue: analytics.cashValue,
      monthlyExpenses: analytics.monthlyExpenses,
      monthlyIncome: analytics.monthlyIncome,
      savingsRate: analytics.savingsRate,
      riskScore: analytics.riskScore,
      diversificationScore: analytics.diversificationScore,
      healthScore: analytics.healthScore,
      activeGoals: analytics.activeGoals,
      goalTargetAmount: analytics.goalTargetAmount,
      goalCurrentAmount: analytics.goalCurrentAmount,
      totalInvested: analytics.totalInvested,
      unrealizedPnL: analytics.unrealizedPnL,
      portfolioReturnPercent: analytics.portfolioReturnPercent,
      emergencyFundMonths: analytics.emergencyFundMonths,
      debtToAssetRatio: analytics.debtToAssetRatio,
      largestHoldingPercent: analytics.largestHoldingPercent,
      holdingCount: analytics.holdingCount,
      summary: null,
      // ML ratio fields
      ...mlRatios,
    },
  });
}


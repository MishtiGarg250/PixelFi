import prisma from "../lib/prisma.js";
import { buildAnalyticsForUser } from "./analytics-builder.service.js";

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

  return prisma.financialSnapshot.create({
    data: {
      userId: user.id,

      snapshotType: "DAILY",

      snapshotDate: startOfDay,

      netWorth: analytics.netWorth,

      totalAssets: analytics.totalAssets,

      totalLiabilities:
        analytics.totalLiabilities,

      portfolioValue:
        analytics.portfolioValue,

      cashValue:
        analytics.cashValue,

      monthlyExpenses:
        analytics.monthlyExpenses,

      monthlyIncome:
        analytics.monthlyIncome,

      savingsRate:
        analytics.savingsRate,

      riskScore:
        analytics.riskScore,

      diversificationScore:
        analytics.diversificationScore,

      healthScore:
        analytics.healthScore,

      activeGoals:
        analytics.activeGoals,

      goalTargetAmount:
        analytics.goalTargetAmount,

      goalCurrentAmount:
        analytics.goalCurrentAmount,

      totalInvested:
        analytics.totalInvested,

      unrealizedPnL:
        analytics.unrealizedPnL,

      portfolioReturnPercent:
        analytics.portfolioReturnPercent,

      emergencyFundMonths:
        analytics.emergencyFundMonths,

      debtToAssetRatio:
        analytics.debtToAssetRatio,

      largestHoldingPercent:
        analytics.largestHoldingPercent,

      holdingCount:
        analytics.holdingCount,
    },
  });
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

  return prisma.financialSnapshot.create({
    data: {
      userId: user.id,

      snapshotType: "MONTHLY",

      snapshotDate: startOfMonth,

      netWorth: analytics.netWorth,

      totalAssets: analytics.totalAssets,

      totalLiabilities:
        analytics.totalLiabilities,

      portfolioValue:
        analytics.portfolioValue,

      cashValue:
        analytics.cashValue,

      monthlyExpenses:
        analytics.monthlyExpenses,

      monthlyIncome:
        analytics.monthlyIncome,

      savingsRate:
        analytics.savingsRate,

      riskScore:
        analytics.riskScore,

      diversificationScore:
        analytics.diversificationScore,

      healthScore:
        analytics.healthScore,

      activeGoals:
        analytics.activeGoals,

      goalTargetAmount:
        analytics.goalTargetAmount,

      goalCurrentAmount:
        analytics.goalCurrentAmount,

      totalInvested:
        analytics.totalInvested,

      unrealizedPnL:
        analytics.unrealizedPnL,

      portfolioReturnPercent:
        analytics.portfolioReturnPercent,

      emergencyFundMonths:
        analytics.emergencyFundMonths,

      debtToAssetRatio:
        analytics.debtToAssetRatio,

      largestHoldingPercent:
        analytics.largestHoldingPercent,

      holdingCount:
        analytics.holdingCount,

      summary: null,
    },
  });
}
import prisma from "../lib/prisma.js";
import { buildAnalyticsForUser } from "./analytics-builder.service.js";
import {generateMonthlySnapshot} from "./snapshot.service.js";
import {getMonthlyMlAnalysis,type MonthlyMlInput} from "./ml-client.service.js";
import { generateMonthlyLlmAnalysis} from "./llm-analysis.service.js";

function toSnapshotData(snapshot: {
  netWorth: unknown;
  totalAssets: unknown;
  totalLiabilities: unknown;
  portfolioValue: unknown;
  cashValue: unknown;
  monthlyIncome: unknown;
  monthlyExpenses: unknown;
  savingsRate: unknown;
  riskScore: number;
  diversificationScore: number;
  healthScore: number;
  activeGoals: number;
  goalTargetAmount: unknown;
  goalCurrentAmount: unknown;
  totalInvested: unknown;
  unrealizedPnL: unknown;
  portfolioReturnPercent: unknown;
  emergencyFundMonths: unknown;
  debtToAssetRatio: unknown;
  largestHoldingPercent: unknown;
  holdingCount: number;
}) {
  return {
    netWorth: Number(snapshot.netWorth),
    totalAssets: Number(snapshot.totalAssets),
    totalLiabilities: Number(snapshot.totalLiabilities),
    portfolioValue: Number(snapshot.portfolioValue),
    cashValue: Number(snapshot.cashValue),
    monthlyIncome: Number(snapshot.monthlyIncome),
    monthlyExpenses: Number(snapshot.monthlyExpenses),
    savingsRate: Number(snapshot.savingsRate),
    riskScore: snapshot.riskScore,
    diversificationScore: snapshot.diversificationScore,
    healthScore: snapshot.healthScore,
    activeGoals: snapshot.activeGoals,
    goalTargetAmount: Number(snapshot.goalTargetAmount),
    goalCurrentAmount: Number(snapshot.goalCurrentAmount),
    totalInvested: Number(snapshot.totalInvested),
    unrealizedPnL: Number(snapshot.unrealizedPnL),
    portfolioReturnPercent: Number(
      snapshot.portfolioReturnPercent
    ),
    emergencyFundMonths: Number(snapshot.emergencyFundMonths),
    debtToAssetRatio: Number(snapshot.debtToAssetRatio),
    largestHoldingPercent: Number(
      snapshot.largestHoldingPercent
    ),
    holdingCount: snapshot.holdingCount,
  };
}

function periodStart(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export async function buildMonthlyFactPack(
  clerkUserId: string,
  latestSnapshotData = buildAnalyticsForUser(clerkUserId)
): Promise<MonthlyMlInput> {
  const user = await prisma.user.findUnique({
    where: {
      clerkUserId,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const [latestSnapshot, snapshots, goals, expenses] =
    await Promise.all([
      latestSnapshotData,
      prisma.financialSnapshot.findMany({
        where: {
          userId: user.id,
          snapshotType: "MONTHLY",
        },
        orderBy: {
          snapshotDate: "desc",
        },
        take: 12,
      }),
      prisma.goal.findMany({
        where: {
          userId: user.id,
        },
      }),
      prisma.expense.findMany({
        where: {
          userId: user.id,
          occurredAt: {
            gte: periodStart(),
          },
        },
      }),
    ]);

  const expensesByCategory = expenses.reduce<
    Record<string, number>
  >((acc, expense) => {
    acc[expense.category] =
      (acc[expense.category] ?? 0) + Number(expense.amount);
    return acc;
  }, {});

  return {
    latestSnapshot: await latestSnapshot,
    history: snapshots.reverse().map(toSnapshotData),
    goals: goals.map((goal) => ({
      title: goal.title,
      targetAmount: Number(goal.targetAmount),
      currentAmount: Number(goal.currentAmount),
      targetDate: goal.targetDate?.toISOString() ?? null,
    })),
    expensesByCategory,
  };
}

export async function runMonthlyAnalysis(clerkUserId: string) {
  const user = await prisma.user.findUnique({
    where: {
      clerkUserId,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const snapshot = await generateMonthlySnapshot(clerkUserId);
  const snapshotData = toSnapshotData(snapshot);
  const factPack = await buildMonthlyFactPack(
    clerkUserId,
    Promise.resolve(snapshotData)
  );
  const mlOutput = await getMonthlyMlAnalysis(factPack);
  const llmOutput = await generateMonthlyLlmAnalysis(
    factPack,
    mlOutput
  );

  await prisma.financialSnapshot.update({
    where: {
      id: snapshot.id,
    },
    data: {
      summary: llmOutput.summary,
    },
  });

  await prisma.aIInsight.deleteMany({
    where: {
      userId: user.id,
      createdAt: {
        gte: periodStart(snapshot.snapshotDate),
      },
    },
  });

  await prisma.aIInsight.createMany({
    data: llmOutput.recommendations.map((recommendation) => ({
      userId: user.id,
      title: recommendation.title,
      description: `${recommendation.description}\n\nAction: ${recommendation.action}\nEvidence: ${recommendation.evidence.join("; ")}`,
      severity: recommendation.priority,
      type: recommendation.category,
    })),
  });

  return {
    snapshot: {
      ...snapshot,
      summary: llmOutput.summary,
    },
    ml: mlOutput,
    analysis: llmOutput,
  };
}

export async function getLatestMonthlyReport(
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

  const snapshot = await prisma.financialSnapshot.findFirst({
    where: {
      userId: user.id,
      snapshotType: "MONTHLY",
    },
    orderBy: {
      snapshotDate: "desc",
    },
  });

  if (!snapshot) {
    return null;
  }

  const insights = await prisma.aIInsight.findMany({
    where: {
      userId: user.id,
      createdAt: {
        gte: periodStart(snapshot.snapshotDate),
      },
    },
    orderBy: [
      {
        severity: "desc",
      },
      {
        createdAt: "desc",
      },
    ],
  });

  return {
    snapshot,
    insights,
  };
}

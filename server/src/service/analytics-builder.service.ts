import prisma from "../lib/prisma.js";

import {
    getNetWorthService,
    getAllocationService,
    getPerformanceService,
    getRiskScoreService,
    getDiversificationService,
} from "./analytics.service.js";

export interface AnalyticsSnapshotData {
    netWorth: number;
    totalAssets: number;
    totalLiabilities: number;
    portfolioValue: number;
    cashValue: number;
    monthlyIncome: number;
    monthlyExpenses: number;
    savingsRate: number;
    riskScore: number;
    diversificationScore: number;
    healthScore: number;
    activeGoals: number;
    goalTargetAmount: number;
    goalCurrentAmount: number;
    totalInvested: number;
    unrealizedPnL: number;
    portfolioReturnPercent: number;
    emergencyFundMonths: number;
    debtToAssetRatio: number;
    largestHoldingPercent: number;
    holdingCount: number;
}

function calculateHealthScore(params: {
    riskScore: number;
    diversificationScore: number;
    debtToAssetRatio: number;
    emergencyFundMonths: number;
}) {
    const {
        riskScore,
        diversificationScore,
        debtToAssetRatio,
        emergencyFundMonths,
    } = params;

    let debtScore = 100;

    if (debtToAssetRatio > 0.6) {
        debtScore = 30;
    } else if (debtToAssetRatio > 0.4) {
        debtScore = 60;
    } else if (debtToAssetRatio > 0.2) {
        debtScore = 80;
    }

    let emergencyScore = 30;

    if (emergencyFundMonths >= 6) {
        emergencyScore = 100;
    } else if (emergencyFundMonths >= 3) {
        emergencyScore = 70;
    }

    const score =
        diversificationScore * 0.3 +
        riskScore * 0.3 +
        debtScore * 0.2 +
        emergencyScore * 0.2;

    return Math.round(score);
}

export async function buildAnalyticsForUser(
    clerkUserId: string
): Promise<AnalyticsSnapshotData> {
    const user = await prisma.user.findUnique({
        where: {
            clerkUserId,
        },
    });

    if (!user) {
        throw new Error("User not found");
    }

    const [
        netWorth,
        allocation,
        performance,
        risk,
        diversification,
        goals,
        expenses,
        accounts,
        incomes,
    ] = await Promise.all([
        getNetWorthService(clerkUserId),
        getAllocationService(clerkUserId),
        getPerformanceService(clerkUserId),
        getRiskScoreService(clerkUserId),
        getDiversificationService(clerkUserId),

        prisma.goal.findMany({
            where: {
                userId: user.id,
            },
        }),

        prisma.expense.findMany({
            where: {
                userId: user.id,
            },
        }),

        prisma.account.findMany({
            where: {
                userId: user.id,
            },
            select: {
                currentBalance: true,
                accountType: true,
            },
        }),

        prisma.income.findMany({
            where: {
                userId: user.id,
            },
        }),
    ]);

    const now = new Date();

    const startOfMonth = new Date(
        now.getFullYear(),
        now.getMonth(),
        1
    );

    const monthlyExpenses = expenses
        .filter(
            (expense) =>
                expense.occurredAt >= startOfMonth
        )
        .reduce(
            (sum, expense) =>
                sum + Number(expense.amount),
            0
        );




    const activeGoals = goals.length;

    const goalTargetAmount = goals.reduce(
        (sum, goal) =>
            sum + Number(goal.targetAmount),
        0
    );

    const goalCurrentAmount = goals.reduce(
        (sum, goal) =>
            sum + Number(goal.currentAmount),
        0
    );


    const totalInvested = performance.reduce(
        (sum, asset) =>
            sum + asset.investedAmount,
        0
    );

    const portfolioValue = performance.reduce(
        (sum, asset) =>
            sum + asset.currentValue,
        0
    );

    const unrealizedPnL = performance.reduce(
        (sum, asset) =>
            sum + asset.pnl,
        0
    );

    const portfolioReturnPercent =
        totalInvested === 0
            ? 0
            : Number(
                (
                    (unrealizedPnL /
                        totalInvested) *
                    100
                ).toFixed(2)
            );


    const largestHoldingPercent =
        allocation.length > 0
            ? Math.max(
                ...allocation.map(
                    (item) =>
                        item.allocationPercent
                )
            )
            : 0;

    const holdingCount =
        allocation.length;

    const debtToAssetRatio =
        netWorth.totalAssets === 0
            ? 0
            : Number(
                (
                    netWorth.totalLiabilities /
                    netWorth.totalAssets
                ).toFixed(4)
            );


    // Aggregate cash value from all bank/checking accounts
    const cashValue = accounts.reduce(
        (sum, account) =>
            sum + Number(account.currentBalance ?? 0),
        0
    );

    // Sum current-month income records
    const monthlyIncome = incomes
        .filter(
            (income) =>
                income.receivedAt >= startOfMonth
        )
        .reduce(
            (sum, income) =>
                sum + Number(income.amount),
            0
        );

    const savingsRate =
        monthlyIncome === 0
            ? 0
            : Number(
                (
                    ((monthlyIncome -
                        monthlyExpenses) /
                        monthlyIncome) *
                    100
                ).toFixed(2)
            );

    const emergencyFundMonths =
        monthlyExpenses === 0
            ? 0
            : Number(
                (
                    cashValue /
                    monthlyExpenses
                ).toFixed(2)
            );



    const healthScore =
        calculateHealthScore({
            riskScore: risk.score,
            diversificationScore:
                diversification.score,
            debtToAssetRatio,
            emergencyFundMonths,
        });

    return {
        netWorth:
            netWorth.totalNetWorth,

        totalAssets:
            netWorth.totalAssets,

        totalLiabilities:
            netWorth.totalLiabilities,

        portfolioValue,

        cashValue,

        monthlyIncome,

        monthlyExpenses,

        savingsRate,

        riskScore: risk.score,

        diversificationScore:
            diversification.score,

        healthScore,

        activeGoals,
        goalTargetAmount,
        goalCurrentAmount,
        totalInvested,

        unrealizedPnL,
        portfolioReturnPercent,
        emergencyFundMonths,
        debtToAssetRatio,
        largestHoldingPercent,
        holdingCount,
    };
}
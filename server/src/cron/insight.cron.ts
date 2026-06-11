import cron from "node-cron";
import prisma from "../lib/prisma.js";

/**
 * Updates ExpenseCategoryBaseline for every user.
 * Computes a 3-month rolling average and standard deviation of expense amounts
 * per ExpenseCategory. This data is consumed by the Expense Anomaly ML model.
 */
async function updateExpenseCategoryBaselines() {
  const users = await prisma.user.findMany({
    select: { id: true },
  });

  const now = new Date();
  // Look back 3 full months
  const threeMonthsAgo = new Date(
    now.getFullYear(),
    now.getMonth() - 3,
    1
  );

  for (const user of users) {
    try {
      const expenses = await prisma.expense.findMany({
        where: {
          userId: user.id,
          occurredAt: { gte: threeMonthsAgo },
        },
        select: { category: true, amount: true, occurredAt: true },
      });

      // Group amounts by category
      const byCategory: Record<string, number[]> = {};
      for (const expense of expenses) {
        const key = expense.category;
        if (!byCategory[key]) byCategory[key] = [];
        byCategory[key].push(Number(expense.amount));
      }

      for (const [category, amounts] of Object.entries(byCategory)) {
        if (amounts.length === 0) continue;

        const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length;
        const variance =
          amounts.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / amounts.length;
        const stdDev = Math.sqrt(variance);

        await prisma.expenseCategoryBaseline.upsert({
          where: {
            userId_category: {
              userId: user.id,
              category: category as any,
            },
          },
          create: {
            userId: user.id,
            category: category as any,
            avgAmount: avg,
            stdDevAmount: stdDev,
          },
          update: {
            avgAmount: avg,
            stdDevAmount: stdDev,
          },
        });
      }
    } catch (error) {
      console.error(
        `[CRON] Baseline update failed for user ${user.id}`,
        error
      );
    }
  }
}

export function startInsightCron() {
  // Runs at 00:30 on the 1st of every month — after monthly snapshot (02:15)
  // so we schedule it slightly earlier just for baseline pre-computation.
  // Adjust if needed.
  cron.schedule(
    "30 0 1 * *",
    async () => {
      console.log("[CRON] Expense category baseline update started");
      try {
        await updateExpenseCategoryBaselines();
        console.log("[CRON] Expense category baseline update completed");
      } catch (error) {
        console.error("[CRON] Expense category baseline update failed", error);
      }
    },
    {
      timezone: "UTC",
    }
  );
}
import cron from "node-cron";
import prisma from "../lib/prisma.js";
import { runMonthlyAnalysis } from "../service/monthly-analysis.service.js";

export function startMonthlySnapshotCron() {
  cron.schedule(
    "15 2 1 * *",
    async () => {
      console.log("[CRON] Monthly snapshot started");

      try {
        const users = await prisma.user.findMany({
          select: {
            clerkUserId: true,
          },
        });

        for (const user of users) {
          await runMonthlyAnalysis(user.clerkUserId);
        }

        console.log("[CRON] Monthly analysis completed");
      } catch (error) {
        console.error("[CRON] Monthly analysis failed", error);
      }
    },
    {
      timezone: "UTC",
    }
  );
}

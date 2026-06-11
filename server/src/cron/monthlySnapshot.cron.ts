import cron from "node-cron";
import prisma from "../lib/prisma.js";
import { runMonthlyAnalysis } from "../service/monthly-analysis.service.js";

export function startMonthlySnapshotCron() {
  cron.schedule(
    "15 2 1 * *",
    async () => {
      console.log("[CRON] Monthly snapshot started");

      const users = await prisma.user.findMany({
        select: {
          clerkUserId: true,
        },
      });

      let success = 0;
      let failed = 0;

      for (const user of users) {
        try {
          await runMonthlyAnalysis(user.clerkUserId);
          success++;
        } catch (error) {
          failed++;
          console.error(
            `[CRON] Monthly analysis failed for user ${user.clerkUserId}`,
            error
          );
        }
      }

      console.log(
        `[CRON] Monthly analysis completed — success: ${success}, failed: ${failed}`
      );
    },
    {
      timezone: "UTC",
    }
  );
}


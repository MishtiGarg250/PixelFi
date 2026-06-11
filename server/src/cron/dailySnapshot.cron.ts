import cron from "node-cron";
import prisma from "../lib/prisma.js";
import { generateDailySnapshot } from "../service/snapshot.service.js";

export function startDailySnapshotCron() {
  cron.schedule(
    "0 2 * * *",
    async () => {
      console.log("[CRON] Daily snapshot started");

      const users = await prisma.user.findMany({
        select: {
          clerkUserId: true,
        },
      });

      let success = 0;
      let failed = 0;

      for (const user of users) {
        try {
          await generateDailySnapshot(user.clerkUserId);
          success++;
        } catch (error) {
          failed++;
          console.error(
            `[CRON] Daily snapshot failed for user ${user.clerkUserId}`,
            error
          );
        }
      }

      console.log(
        `[CRON] Daily snapshot completed — success: ${success}, failed: ${failed}`
      );
    },
    {
      timezone: "UTC",
    }
  );
}


import cron from "node-cron";
import prisma from "../lib/prisma.js";
// import { generateInsights } from "../services/insight.service.js";

export function startInsightCron() {
  cron.schedule(
    "30 0 1 * *",
    async () => {
      console.log(
        "[CRON] AI insight generation started"
      );
      try {
        const users = await prisma.user.findMany({
          select: {
            id: true,
          },
        });

        for (const user of users) {
        //   await generateInsights(user.id);
        console.log("insights is in progress");
        }

        console.log(
          "[CRON] AI insight generation completed"
        );
      } catch (error) {
        console.error(error);
      }
    },
    {
      timezone: "UTC",
    }
  );
}
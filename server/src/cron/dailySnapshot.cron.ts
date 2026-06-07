import cron from "node-cron";
import prisma from "../lib/prisma.js";
import { generateDailySnapshot } from "../service/snapshot.service.js";

export function startDailySnapshotCron() {
    cron.schedule(
        "0 2 * * *",
        async () => {
            console.log("cron daily snapshot started");

            try {
                const users = await prisma.user.findMany({
                    select: {
                        id: true,
                    },
                });

                for (const user of users) {
                    await generateDailySnapshot(user.id);
                }
                console.log("[CRON] Daily snapshot completed");
            } catch (error) {
                console.error(error);
            }
        },
        {
            timezone: "UTC"
        }
        
)}

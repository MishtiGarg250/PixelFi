import { startDailySnapshotCron } from "./dailySnapShot.cron..js";
import { startMonthlySnapshotCron } from "./monthlySnapshot.cron.js";
import { startInsightCron } from "./insight.cron.js";

export function startCronJobs() {
  startDailySnapshotCron();

  startMonthlySnapshotCron();

  startInsightCron();

  console.log("Cron jobs initialized");
}
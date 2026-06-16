import dotenv from "dotenv";
import prisma from "./lib/prisma.js"
import app from "./app.js";
import { startCronJobs } from "./cron/index.js";
import { connectKafka } from "./config/kafka.js";
import { startFinancialInsightsConsumer } from "./workers/kafkaworker.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  try {
  console.log("Connecting to database...");
  await prisma.$connect();
  console.log("Connected!");
} catch (err) {
  console.error("Connection failed:", err);
}
  startCronJobs();
  
  // Initialize communication channels
  await connectKafka();
  await startFinancialInsightsConsumer();
});

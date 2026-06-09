import dotenv from "dotenv";

import app from "./app.js";
import { startCronJobs } from "./cron/index.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  startCronJobs();
});

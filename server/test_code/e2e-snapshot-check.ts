import prisma from "../src/lib/prisma.js";
import {generateDailySnapshot,generateMonthlySnapshot} from "../src/service/snapshot.service.js";

const user = await prisma.user.findFirst({
  select: {
    clerkUserId: true,
    email: true,
  },
});

if (!user) {
  console.log("No users found; skipping snapshot generation check.");
  await prisma.$disconnect();
  process.exit(0);
}

const daily = await generateDailySnapshot(user.clerkUserId);
const monthly = await generateMonthlySnapshot(user.clerkUserId);

console.log(
  JSON.stringify({
    user: user.email,
    dailySnapshotId: daily.id,
    monthlySnapshotId: monthly.id,
    dailyType: daily.snapshotType,
    monthlyType: monthly.snapshotType,
  })
);

await prisma.$disconnect();

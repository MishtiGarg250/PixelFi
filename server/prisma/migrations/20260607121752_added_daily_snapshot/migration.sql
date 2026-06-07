-- AlterEnum
ALTER TYPE "SnapshotType" ADD VALUE 'DAILY';

-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "currentBalance" DECIMAL(18,2);

-- CreateTable
CREATE TABLE "Income" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "currency" TEXT NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Income_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Income_userId_idx" ON "Income"("userId");

-- CreateIndex
CREATE INDEX "Income_receivedAt_idx" ON "Income"("receivedAt");

-- AddForeignKey
ALTER TABLE "Income" ADD CONSTRAINT "Income_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

/*
  Warnings:

  - A unique constraint covering the columns `[userId,snapshotDate,snapshotType]` on the table `FinancialSnapshot` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `source` on the `Income` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "IncomeSource" AS ENUM ('SALARY', 'BONUS', 'FREELANCE', 'DIVIDEND', 'INTEREST', 'RENTAL', 'OTHER');

-- DropIndex
DROP INDEX "FinancialSnapshot_userId_snapshotDate_key";

-- AlterTable
ALTER TABLE "Income" ADD COLUMN     "accountId" TEXT,
DROP COLUMN "source",
ADD COLUMN     "source" "IncomeSource" NOT NULL;

-- CreateTable
CREATE TABLE "LiabilitySnapshot" (
    "id" TEXT NOT NULL,
    "liabilityId" TEXT NOT NULL,
    "outstanding" DECIMAL(18,2) NOT NULL,
    "snapshotDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LiabilitySnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomAssetValuation" (
    "id" TEXT NOT NULL,
    "customAssetId" TEXT NOT NULL,
    "value" DECIMAL(18,2) NOT NULL,
    "valuationDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomAssetValuation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GoalContribution" (
    "id" TEXT NOT NULL,
    "goalId" TEXT NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "contributedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GoalContribution_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LiabilitySnapshot_liabilityId_snapshotDate_idx" ON "LiabilitySnapshot"("liabilityId", "snapshotDate");

-- CreateIndex
CREATE INDEX "CustomAssetValuation_customAssetId_valuationDate_idx" ON "CustomAssetValuation"("customAssetId", "valuationDate");

-- CreateIndex
CREATE INDEX "GoalContribution_goalId_contributedAt_idx" ON "GoalContribution"("goalId", "contributedAt");

-- CreateIndex
CREATE UNIQUE INDEX "FinancialSnapshot_userId_snapshotDate_snapshotType_key" ON "FinancialSnapshot"("userId", "snapshotDate", "snapshotType");

-- AddForeignKey
ALTER TABLE "Income" ADD CONSTRAINT "Income_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiabilitySnapshot" ADD CONSTRAINT "LiabilitySnapshot_liabilityId_fkey" FOREIGN KEY ("liabilityId") REFERENCES "Liability"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomAssetValuation" ADD CONSTRAINT "CustomAssetValuation_customAssetId_fkey" FOREIGN KEY ("customAssetId") REFERENCES "CustomAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoalContribution" ADD CONSTRAINT "GoalContribution_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "Goal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

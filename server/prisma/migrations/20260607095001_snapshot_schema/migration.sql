-- CreateEnum
CREATE TYPE "SnapshotType" AS ENUM ('WEEKLY', 'MONTHLY', 'QUARTERLY');

-- CreateEnum
CREATE TYPE "ExpenseCategory" AS ENUM ('FOOD', 'RENT', 'TRAVEL', 'SHOPPING', 'UTILITIES', 'HEALTHCARE', 'OTHER');

-- CreateTable
CREATE TABLE "FinancialSnapshot" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "snapshotDate" TIMESTAMP(3) NOT NULL,
    "snapshotType" "SnapshotType" NOT NULL DEFAULT 'MONTHLY',
    "netWorth" DECIMAL(18,2) NOT NULL,
    "totalAssets" DECIMAL(18,2) NOT NULL,
    "totalLiabilities" DECIMAL(18,2) NOT NULL,
    "portfolioValue" DECIMAL(18,2) NOT NULL,
    "cashValue" DECIMAL(18,2) NOT NULL,
    "monthlyExpenses" DECIMAL(18,2) NOT NULL,
    "monthlyIncome" DECIMAL(18,2) NOT NULL,
    "savingsRate" DECIMAL(5,2) NOT NULL,
    "riskScore" INTEGER NOT NULL,
    "diversificationScore" INTEGER NOT NULL,
    "healthScore" INTEGER NOT NULL,
    "activeGoals" INTEGER NOT NULL,
    "goalTargetAmount" DECIMAL(18,2) NOT NULL,
    "goalCurrentAmount" DECIMAL(18,2) NOT NULL,
    "totalInvested" DECIMAL(18,2) NOT NULL,
    "unrealizedPnL" DECIMAL(18,2) NOT NULL,
    "portfolioReturnPercent" DECIMAL(8,2) NOT NULL,
    "emergencyFundMonths" DECIMAL(5,2) NOT NULL,
    "debtToAssetRatio" DECIMAL(8,4) NOT NULL,
    "largestHoldingPercent" DECIMAL(5,2) NOT NULL,
    "holdingCount" INTEGER NOT NULL,
    "summary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FinancialSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExpenseCategorySnapshot" (
    "id" TEXT NOT NULL,
    "snapshotId" TEXT NOT NULL,
    "category" "ExpenseCategory" NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,

    CONSTRAINT "ExpenseCategorySnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetAllocationSnapshot" (
    "id" TEXT NOT NULL,
    "snapshotId" TEXT NOT NULL,
    "assetType" "MarketAssetType" NOT NULL,
    "percentage" DECIMAL(5,2) NOT NULL,
    "value" DECIMAL(18,2) NOT NULL,

    CONSTRAINT "AssetAllocationSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FinancialSnapshot_userId_snapshotDate_idx" ON "FinancialSnapshot"("userId", "snapshotDate");

-- CreateIndex
CREATE UNIQUE INDEX "FinancialSnapshot_userId_snapshotDate_key" ON "FinancialSnapshot"("userId", "snapshotDate");

-- CreateIndex
CREATE INDEX "ExpenseCategorySnapshot_snapshotId_idx" ON "ExpenseCategorySnapshot"("snapshotId");

-- CreateIndex
CREATE INDEX "AssetAllocationSnapshot_snapshotId_idx" ON "AssetAllocationSnapshot"("snapshotId");

-- AddForeignKey
ALTER TABLE "FinancialSnapshot" ADD CONSTRAINT "FinancialSnapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpenseCategorySnapshot" ADD CONSTRAINT "ExpenseCategorySnapshot_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "FinancialSnapshot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetAllocationSnapshot" ADD CONSTRAINT "AssetAllocationSnapshot_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "FinancialSnapshot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

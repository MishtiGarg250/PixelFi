-- CreateEnum
CREATE TYPE "MLModelType" AS ENUM ('NET_WORTH_FORECAST', 'EXPENSE_ANOMALY', 'LIFESTYLE_CREEP', 'CASH_FLOW_FORECAST');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "InsightType" ADD VALUE 'ANOMALY';
ALTER TYPE "InsightType" ADD VALUE 'LIFESTYLE_CREEP';
ALTER TYPE "InsightType" ADD VALUE 'CASH_FLOW';
ALTER TYPE "InsightType" ADD VALUE 'FORECAST';

-- AlterTable
ALTER TABLE "FinancialSnapshot" ADD COLUMN     "burnRate" DECIMAL(10,4),
ADD COLUMN     "cashFlowNetPositive" BOOLEAN,
ADD COLUMN     "expenseGrowthRate" DECIMAL(10,4),
ADD COLUMN     "expenseVolatility" DECIMAL(10,4),
ADD COLUMN     "incomeGrowthRate" DECIMAL(10,4),
ADD COLUMN     "investmentRate" DECIMAL(10,4),
ADD COLUMN     "liabilityGrowthRate" DECIMAL(10,4),
ADD COLUMN     "liquidityRatio" DECIMAL(10,4),
ADD COLUMN     "netWorthMoM" DECIMAL(10,4),
ADD COLUMN     "netWorthVelocity" DECIMAL(10,4);

-- CreateTable
CREATE TABLE "ExpenseCategoryBaseline" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "category" "ExpenseCategory" NOT NULL,
    "avgAmount" DECIMAL(18,2) NOT NULL,
    "stdDevAmount" DECIMAL(18,2) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExpenseCategoryBaseline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MLPrediction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "modelType" "MLModelType" NOT NULL,
    "predictionDate" TIMESTAMP(3) NOT NULL,
    "inputSnapshotId" TEXT,
    "resultJson" JSONB NOT NULL,
    "confidence" DECIMAL(5,4),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MLPrediction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ExpenseCategoryBaseline_userId_idx" ON "ExpenseCategoryBaseline"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ExpenseCategoryBaseline_userId_category_key" ON "ExpenseCategoryBaseline"("userId", "category");

-- CreateIndex
CREATE INDEX "MLPrediction_userId_modelType_predictionDate_idx" ON "MLPrediction"("userId", "modelType", "predictionDate");

-- AddForeignKey
ALTER TABLE "ExpenseCategoryBaseline" ADD CONSTRAINT "ExpenseCategoryBaseline_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MLPrediction" ADD CONSTRAINT "MLPrediction_inputSnapshotId_fkey" FOREIGN KEY ("inputSnapshotId") REFERENCES "FinancialSnapshot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MLPrediction" ADD CONSTRAINT "MLPrediction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

/*
  Warnings:

  - You are about to drop the column `portfolioId` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the `Holding` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MarketData` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `userId` to the `Account` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "LiabilityType" AS ENUM ('MORTGAGE', 'CAR_LOAN', 'PERSONAL_LOAN', 'CREDIT_CARD', 'OTHER');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TransactionType" ADD VALUE 'INTEREST';
ALTER TYPE "TransactionType" ADD VALUE 'TRANSFER';

-- DropForeignKey
ALTER TABLE "Account" DROP CONSTRAINT "Account_portfolioId_fkey";

-- DropForeignKey
ALTER TABLE "CustomAsset" DROP CONSTRAINT "CustomAsset_portfolioId_fkey";

-- DropForeignKey
ALTER TABLE "Holding" DROP CONSTRAINT "Holding_marketAssetId_fkey";

-- DropForeignKey
ALTER TABLE "Holding" DROP CONSTRAINT "Holding_portfolioId_fkey";

-- DropForeignKey
ALTER TABLE "MarketData" DROP CONSTRAINT "MarketData_marketAssetId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_marketAssetId_fkey";

-- DropIndex
DROP INDEX "Account_portfolioId_idx";

-- AlterTable
ALTER TABLE "Account" DROP COLUMN "portfolioId",
ADD COLUMN     "userId" TEXT NOT NULL,
ALTER COLUMN "brokerName" DROP NOT NULL;

-- AlterTable
ALTER TABLE "CustomAsset" ALTER COLUMN "portfolioId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "amount" DECIMAL(18,2),
ADD COLUMN     "userId" TEXT NOT NULL,
ALTER COLUMN "quantity" DROP NOT NULL,
ALTER COLUMN "price" DROP NOT NULL,
ALTER COLUMN "marketAssetId" DROP NOT NULL;

-- DropTable
DROP TABLE "Holding";

-- DropTable
DROP TABLE "MarketData";

-- CreateTable
CREATE TABLE "UserMarketAsset" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "marketAssetId" TEXT NOT NULL,
    "quantity" DECIMAL(18,4) NOT NULL,
    "averageCost" DECIMAL(18,4) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserMarketAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Liability" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "LiabilityType" NOT NULL,
    "originalAmount" DECIMAL(18,2) NOT NULL,
    "outstanding" DECIMAL(18,2) NOT NULL,
    "interestRate" DECIMAL(5,2),
    "currency" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Liability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortfolioMarketAsset" (
    "portfolioId" TEXT NOT NULL,
    "userMarketAssetId" TEXT NOT NULL,

    CONSTRAINT "PortfolioMarketAsset_pkey" PRIMARY KEY ("portfolioId","userMarketAssetId")
);

-- CreateIndex
CREATE INDEX "UserMarketAsset_userId_idx" ON "UserMarketAsset"("userId");

-- CreateIndex
CREATE INDEX "UserMarketAsset_marketAssetId_idx" ON "UserMarketAsset"("marketAssetId");

-- CreateIndex
CREATE UNIQUE INDEX "UserMarketAsset_userId_marketAssetId_key" ON "UserMarketAsset"("userId", "marketAssetId");

-- CreateIndex
CREATE INDEX "Liability_userId_idx" ON "Liability"("userId");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE INDEX "Transaction_userId_idx" ON "Transaction"("userId");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMarketAsset" ADD CONSTRAINT "UserMarketAsset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMarketAsset" ADD CONSTRAINT "UserMarketAsset_marketAssetId_fkey" FOREIGN KEY ("marketAssetId") REFERENCES "MarketAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomAsset" ADD CONSTRAINT "CustomAsset_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "Portfolio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_marketAssetId_fkey" FOREIGN KEY ("marketAssetId") REFERENCES "MarketAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Liability" ADD CONSTRAINT "Liability_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortfolioMarketAsset" ADD CONSTRAINT "PortfolioMarketAsset_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "Portfolio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortfolioMarketAsset" ADD CONSTRAINT "PortfolioMarketAsset_userMarketAssetId_fkey" FOREIGN KEY ("userMarketAssetId") REFERENCES "UserMarketAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

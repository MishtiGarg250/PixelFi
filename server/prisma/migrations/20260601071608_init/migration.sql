/*
  Warnings:

  - You are about to drop the column `userId` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `assetId` on the `Holding` table. All the data in the column will be lost.
  - You are about to drop the column `assetId` on the `MarketData` table. All the data in the column will be lost.
  - You are about to drop the column `assetId` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the `Asset` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[portfolioId,marketAssetId]` on the table `Holding` will be added. If there are existing duplicate values, this will fail.
  - Made the column `portfolioId` on table `Account` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `marketAssetId` to the `Holding` table without a default value. This is not possible if the table is not empty.
  - Added the required column `marketAssetId` to the `MarketData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `marketAssetId` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MarketAssetType" AS ENUM ('STOCK', 'ETF', 'CRYPTO', 'BOND', 'MUTUAL_FUND');

-- CreateEnum
CREATE TYPE "CustomAssetCategory" AS ENUM ('REAL_ESTATE', 'VEHICLE', 'LUXURY_ITEM', 'ART', 'COLLECTIBLE', 'OTHER');

-- DropForeignKey
ALTER TABLE "Account" DROP CONSTRAINT "Account_portfolioId_fkey";

-- DropForeignKey
ALTER TABLE "Account" DROP CONSTRAINT "Account_userId_fkey";

-- DropForeignKey
ALTER TABLE "Holding" DROP CONSTRAINT "Holding_assetId_fkey";

-- DropForeignKey
ALTER TABLE "MarketData" DROP CONSTRAINT "MarketData_assetId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_assetId_fkey";

-- DropIndex
DROP INDEX "Account_userId_idx";

-- DropIndex
DROP INDEX "Holding_assetId_idx";

-- DropIndex
DROP INDEX "Holding_portfolioId_assetId_key";

-- DropIndex
DROP INDEX "MarketData_assetId_fetchedAt_idx";

-- DropIndex
DROP INDEX "Transaction_assetId_idx";

-- AlterTable
ALTER TABLE "Account" DROP COLUMN "userId",
ALTER COLUMN "portfolioId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Holding" DROP COLUMN "assetId",
ADD COLUMN     "marketAssetId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "MarketData" DROP COLUMN "assetId",
ADD COLUMN     "marketAssetId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "assetId",
ADD COLUMN     "marketAssetId" TEXT NOT NULL;

-- DropTable
DROP TABLE "Asset";

-- DropEnum
DROP TYPE "AssetType";

-- CreateTable
CREATE TABLE "MarketAsset" (
    "id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "assetType" "MarketAssetType" NOT NULL,
    "exchange" TEXT,
    "sector" TEXT,
    "currency" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomAsset" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "portfolioId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" "CustomAssetCategory" NOT NULL,
    "currentValue" DECIMAL(18,2) NOT NULL,
    "purchasePrice" DECIMAL(18,2),
    "purchaseDate" TIMESTAMP(3),
    "currency" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomAsset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MarketAsset_symbol_key" ON "MarketAsset"("symbol");

-- CreateIndex
CREATE INDEX "MarketAsset_symbol_idx" ON "MarketAsset"("symbol");

-- CreateIndex
CREATE INDEX "CustomAsset_userId_idx" ON "CustomAsset"("userId");

-- CreateIndex
CREATE INDEX "CustomAsset_portfolioId_idx" ON "CustomAsset"("portfolioId");

-- CreateIndex
CREATE INDEX "Holding_marketAssetId_idx" ON "Holding"("marketAssetId");

-- CreateIndex
CREATE UNIQUE INDEX "Holding_portfolioId_marketAssetId_key" ON "Holding"("portfolioId", "marketAssetId");

-- CreateIndex
CREATE INDEX "MarketData_marketAssetId_fetchedAt_idx" ON "MarketData"("marketAssetId", "fetchedAt");

-- CreateIndex
CREATE INDEX "Transaction_marketAssetId_idx" ON "Transaction"("marketAssetId");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "Portfolio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomAsset" ADD CONSTRAINT "CustomAsset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomAsset" ADD CONSTRAINT "CustomAsset_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "Portfolio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_marketAssetId_fkey" FOREIGN KEY ("marketAssetId") REFERENCES "MarketAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Holding" ADD CONSTRAINT "Holding_marketAssetId_fkey" FOREIGN KEY ("marketAssetId") REFERENCES "MarketAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketData" ADD CONSTRAINT "MarketData_marketAssetId_fkey" FOREIGN KEY ("marketAssetId") REFERENCES "MarketAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

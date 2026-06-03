import prisma from "../lib/prisma.js";

// ─────────────────────────────────────────────
// UserMarketAsset (replaces old Holding model)
// ─────────────────────────────────────────────

interface UpsertUserMarketAssetInput {
  marketAssetId: string;
  quantity: number;
  averageCost: number;
}

/**
 * Upsert a UserMarketAsset record for a user.
 * If one already exists for this (userId, marketAssetId) pair, it updates it.
 */
export const upsertUserMarketAssetService = async (
  clerkUserId: string,
  data: UpsertUserMarketAssetInput
) => {
  const user = await prisma.user.findUnique({ where: { clerkUserId } });
  if (!user) throw new Error("User not found");

  // Verify the market asset exists
  const marketAsset = await prisma.marketAsset.findUnique({
    where: { id: data.marketAssetId },
  });
  if (!marketAsset) throw new Error("Market asset not found");

  const existing = await prisma.userMarketAsset.findUnique({
    where: {
      userId_marketAssetId: {
        userId: user.id,
        marketAssetId: data.marketAssetId,
      },
    },
  });

  if (existing) {
    return prisma.userMarketAsset.update({
      where: { id: existing.id },
      data: {
        quantity: data.quantity,
        averageCost: data.averageCost,
      },
      include: { marketAsset: true },
    });
  }

  return prisma.userMarketAsset.create({
    data: {
      userId: user.id,
      marketAssetId: data.marketAssetId,
      quantity: data.quantity,
      averageCost: data.averageCost,
    },
    include: { marketAsset: true },
  });
};

/**
 * Get all UserMarketAssets (holdings) for a user.
 */
export const getUserMarketAssetsService = async (clerkUserId: string) => {
  const user = await prisma.user.findUnique({ where: { clerkUserId } });
  if (!user) throw new Error("User not found");

  return prisma.userMarketAsset.findMany({
    where: { userId: user.id },
    include: { marketAsset: true },
    orderBy: { createdAt: "desc" },
  });
};

/**
 * Delete a UserMarketAsset for a user.
 */
export const deleteUserMarketAssetService = async (
  clerkUserId: string,
  userMarketAssetId: string
) => {
  const user = await prisma.user.findUnique({ where: { clerkUserId } });
  if (!user) throw new Error("User not found");

  const record = await prisma.userMarketAsset.findFirst({
    where: { id: userMarketAssetId, userId: user.id },
  });
  if (!record) throw new Error("User market asset not found or does not belong to user");

  // Remove from all portfolio join records first
  await prisma.portfolioMarketAsset.deleteMany({
    where: { userMarketAssetId },
  });

  await prisma.userMarketAsset.delete({ where: { id: userMarketAssetId } });
};

// ─────────────────────────────────────────────
// Portfolio ↔ UserMarketAsset link management
// ─────────────────────────────────────────────

/**
 * Add a UserMarketAsset to a portfolio.
 */
export const addMarketAssetToPortfolioService = async (
  clerkUserId: string,
  portfolioId: string,
  userMarketAssetId: string
) => {
  const user = await prisma.user.findUnique({ where: { clerkUserId } });
  if (!user) throw new Error("User not found");

  // Verify portfolio belongs to user
  const portfolio = await prisma.portfolio.findFirst({
    where: { id: portfolioId, userId: user.id },
  });
  if (!portfolio) throw new Error("Portfolio not found or does not belong to user");

  // Verify UserMarketAsset belongs to user
  const userMarketAsset = await prisma.userMarketAsset.findFirst({
    where: { id: userMarketAssetId, userId: user.id },
  });
  if (!userMarketAsset) throw new Error("User market asset not found or does not belong to user");

  return prisma.portfolioMarketAsset.create({
    data: { portfolioId, userMarketAssetId },
  });
};

/**
 * Get all market assets linked to a portfolio.
 */
export const getPortfolioMarketAssetsService = async (
  clerkUserId: string,
  portfolioId: string
) => {
  const user = await prisma.user.findUnique({ where: { clerkUserId } });
  if (!user) throw new Error("User not found");

  const portfolio = await prisma.portfolio.findFirst({
    where: { id: portfolioId, userId: user.id },
  });
  if (!portfolio) throw new Error("Portfolio not found or does not belong to user");

  return prisma.portfolioMarketAsset.findMany({
    where: { portfolioId },
    include: {
      userMarketAsset: {
        include: { marketAsset: true },
      },
    },
  });
};

/**
 * Remove a market asset from a portfolio (does not delete the UserMarketAsset itself).
 */
export const removeMarketAssetFromPortfolioService = async (
  clerkUserId: string,
  portfolioId: string,
  userMarketAssetId: string
) => {
  const user = await prisma.user.findUnique({ where: { clerkUserId } });
  if (!user) throw new Error("User not found");

  const portfolio = await prisma.portfolio.findFirst({
    where: { id: portfolioId, userId: user.id },
  });
  if (!portfolio) throw new Error("Portfolio not found or does not belong to user");

  await prisma.portfolioMarketAsset.delete({
    where: {
      portfolioId_userMarketAssetId: { portfolioId, userMarketAssetId },
    },
  });
};
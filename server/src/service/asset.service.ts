import prisma from "../lib/prisma.js";

// ─────────────────────────────────────────────
// MARKET ASSET SERVICES
// ─────────────────────────────────────────────

interface CreateMarketAssetInput {
  symbol: string;
  name: string;
  assetType: "STOCK" | "ETF" | "CRYPTO" | "BOND" | "MUTUAL_FUND";
  exchange?: string;
  sector?: string;
  currency: string;
}

export const searchMarketAssetsService = async (query: string) => {
  const marketAssets = await prisma.marketAsset.findMany({
    where: {
      OR: [
        { symbol: { contains: query, mode: "insensitive" } },
        { name: { contains: query, mode: "insensitive" } },
      ],
    },
    take: 20,
    orderBy: { symbol: "asc" },
  });
  return marketAssets;
};

export const createMarketAssetService = async (
  data: CreateMarketAssetInput
) => {
  const marketAsset = await prisma.marketAsset.create({
    data: {
      symbol: data.symbol.toUpperCase(),
      name: data.name,
      assetType: data.assetType,
      exchange: data.exchange,
      sector: data.sector,
      currency: data.currency,
    },
  });
  return marketAsset;
};

// ─────────────────────────────────────────────
// CUSTOM ASSET SERVICES
// ─────────────────────────────────────────────

interface CreateCustomAssetInput {
  name: string;
  description?: string;
  category:
    | "REAL_ESTATE"
    | "VEHICLE"
    | "LUXURY_ITEM"
    | "ART"
    | "COLLECTIBLE"
    | "OTHER";
  currentValue: number;
  purchasePrice?: number;
  purchaseDate?: string;
  currency: string;
}

interface UpdateCustomAssetInput {
  name?: string;
  description?: string;
  category?:
    | "REAL_ESTATE"
    | "VEHICLE"
    | "LUXURY_ITEM"
    | "ART"
    | "COLLECTIBLE"
    | "OTHER";
  currentValue?: number;
  purchasePrice?: number;
  purchaseDate?: string;
  currency?: string;
}

async function resolveUserAndPortfolio(
  clerkUserId: string,
  portfolioId: string
) {
  const user = await prisma.user.findUnique({ where: { clerkUserId } });
  if (!user) throw new Error("User not found");

  const portfolio = await prisma.portfolio.findFirst({
    where: { id: portfolioId, userId: user.id },
  });
  if (!portfolio)
    throw new Error("Portfolio not found or does not belong to user");

  return { user, portfolio };
}

export const getCustomAssetsService = async (
  clerkUserId: string,
  portfolioId: string
) => {
  await resolveUserAndPortfolio(clerkUserId, portfolioId);

  return prisma.customAsset.findMany({
    where: { portfolioId },
    orderBy: { createdAt: "desc" },
  });
};

export const createCustomAssetService = async (
  clerkUserId: string,
  portfolioId: string,
  data: CreateCustomAssetInput
) => {
  const { user } = await resolveUserAndPortfolio(clerkUserId, portfolioId);

  return prisma.customAsset.create({
    data: {
      userId: user.id,
      portfolioId,
      name: data.name,
      description: data.description,
      category: data.category,
      currentValue: data.currentValue,
      purchasePrice: data.purchasePrice,
      purchaseDate: data.purchaseDate
        ? new Date(data.purchaseDate)
        : undefined,
      currency: data.currency,
    },
  });
};

export const updateCustomAssetService = async (
  clerkUserId: string,
  portfolioId: string,
  assetId: string,
  data: UpdateCustomAssetInput
) => {
  const { user } = await resolveUserAndPortfolio(clerkUserId, portfolioId);

  // Verify ownership
  const existing = await prisma.customAsset.findFirst({
    where: { id: assetId, portfolioId, userId: user.id },
  });
  if (!existing)
    throw new Error("Custom asset not found or does not belong to this portfolio");

  return prisma.customAsset.update({
    where: { id: assetId },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.category !== undefined && { category: data.category }),
      ...(data.currentValue !== undefined && { currentValue: data.currentValue }),
      ...(data.purchasePrice !== undefined && { purchasePrice: data.purchasePrice }),
      ...(data.purchaseDate !== undefined && {
        purchaseDate: new Date(data.purchaseDate),
      }),
      ...(data.currency !== undefined && { currency: data.currency }),
    },
  });
};

export const deleteCustomAssetService = async (
  clerkUserId: string,
  portfolioId: string,
  assetId: string
) => {
  const { user } = await resolveUserAndPortfolio(clerkUserId, portfolioId);

  const existing = await prisma.customAsset.findFirst({
    where: { id: assetId, portfolioId, userId: user.id },
  });
  if (!existing)
    throw new Error("Custom asset not found or does not belong to this portfolio");

  await prisma.customAsset.delete({ where: { id: assetId } });
};

import prisma from "../lib/prisma.js";

// ─────────────────────────────────────────────
// MARKET ASSET SERVICES
// ─────────────────────────────────────────────

interface CreateMarketAssetInput {
  symbol: string;
  name: string;
  assetType: "STOCK" | "ETF" | "CRYPTO" | "BOND" | "MUTUAL_FUND";
  exchange?: string | undefined;
  sector?: string | undefined;
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
      exchange: data.exchange ?? null,
      sector: data.sector ?? null,
      currency: data.currency,
    }
  });
  return marketAsset;
};

// ─────────────────────────────────────────────
// CUSTOM ASSET SERVICES
// ─────────────────────────────────────────────

interface CreateCustomAssetInput {
  name: string;
  description?: string | undefined;
  category:
  | "REAL_ESTATE"
  | "VEHICLE"
  | "LUXURY_ITEM"
  | "ART"
  | "COLLECTIBLE"
  | "OTHER";
  currentValue: number;
  purchasePrice?: number | undefined;
  purchaseDate?: string | undefined;
  currency: string;
  portfolioId?: string | undefined;
}

interface UpdateCustomAssetInput {
  name?: string | undefined;
  description?: string | undefined;
  category?:
  | "REAL_ESTATE"
  | "VEHICLE"
  | "LUXURY_ITEM"
  | "ART"
  | "COLLECTIBLE"
  | "OTHER"
  | undefined;
  currentValue?: number | undefined;
  purchasePrice?: number | undefined;
  purchaseDate?: string | undefined;
  currency?: string | undefined;
  portfolioId?: string | null | undefined;
}

async function resolveUser(clerkUserId: string) {
  const user = await prisma.user.findUnique({ where: { clerkUserId } });
  if (!user) throw new Error("User not found");
  return user;
}

export const getCustomAssetsService = async (
  clerkUserId: string,
  portfolioId?: string
) => {
  const user = await resolveUser(clerkUserId);

  return prisma.customAsset.findMany({
    where: {
      userId: user.id,
      ...(portfolioId !== undefined && { portfolioId }),
    },
    orderBy: { createdAt: "desc" },
  });
};

export const createCustomAssetService = async (
  clerkUserId: string,
  data: CreateCustomAssetInput
) => {
  const user = await resolveUser(clerkUserId);

  // Optionally validate that portfolioId belongs to user
  if (data.portfolioId) {
    const portfolio = await prisma.portfolio.findFirst({
      where: { id: data.portfolioId, userId: user.id },
    });
    if (!portfolio)
      throw new Error("Portfolio not found or does not belong to user");
  }

  return prisma.customAsset.create({
    data: {
      userId: user.id,
      portfolioId: data.portfolioId ?? null,

      name: data.name,
      category: data.category,
      currentValue: data.currentValue,
      currency: data.currency,

      description: data.description ?? null,
      purchasePrice: data.purchasePrice ?? null,
      purchaseDate: data.purchaseDate
        ? new Date(data.purchaseDate)
        : null,
    },
  });
};

export const updateCustomAssetService = async (
  clerkUserId: string,
  assetId: string,
  data: UpdateCustomAssetInput
) => {
  const user = await resolveUser(clerkUserId);

  // Verify ownership
  const existing = await prisma.customAsset.findFirst({
    where: { id: assetId, userId: user.id },
  });
  if (!existing)
    throw new Error("Custom asset not found or does not belong to user");

  // Optionally validate new portfolioId
  if (data.portfolioId) {
    const portfolio = await prisma.portfolio.findFirst({
      where: { id: data.portfolioId, userId: user.id },
    });
    if (!portfolio)
      throw new Error("Portfolio not found or does not belong to user");
  }

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
      ...(data.portfolioId !== undefined && { portfolioId: data.portfolioId }),
    },
  });
};

export const deleteCustomAssetService = async (
  clerkUserId: string,
  assetId: string
) => {
  const user = await resolveUser(clerkUserId);

  const existing = await prisma.customAsset.findFirst({
    where: { id: assetId, userId: user.id },
  });
  if (!existing)
    throw new Error("Custom asset not found or does not belong to user");

  await prisma.customAsset.delete({ where: { id: assetId } });
};

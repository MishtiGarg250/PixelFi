import prisma from "../lib/prisma.js";
import {
  getCompanyProfileService,
  getQuoteService,
  searchFinnhubSymbolsService,
} from "./market.service.js";

type FinnhubMarketAssetSearchResult = Awaited<
  ReturnType<typeof searchFinnhubSymbolsService>
>[number];

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

interface AddUserMarketAssetInput {
  symbol: string;
  quantity?: number | undefined;
  averageCost?: number | undefined;
  portfolioId?: string | undefined;
}

export const searchMarketAssetsService = async (query: string) => {
  const trimmedQuery = query.trim();

  const marketAssets = await prisma.marketAsset.findMany({
    where: {
      OR: [
        { symbol: { contains: trimmedQuery, mode: "insensitive" } },
        { name: { contains: trimmedQuery, mode: "insensitive" } },
      ],
    },
    take: 20,
    orderBy: { symbol: "asc" },
  });

  const assetsBySymbol = new Map<string, Record<string, unknown>>(
    marketAssets.map((asset) => [
      asset.symbol,
      {
        ...asset,
        source: "DATABASE",
        isPersisted: true,
      },
    ])
  );

  const finnhubAssets = await searchFinnhubSymbolsService(trimmedQuery);
  for (const asset of finnhubAssets) {
    if (assetsBySymbol.has(asset.symbol)) continue;

    assetsBySymbol.set(asset.symbol, {
      id: `finnhub:${asset.symbol}`,
      symbol: asset.symbol,
      name: asset.name,
      assetType: asset.assetType as CreateMarketAssetInput["assetType"],
      exchange: asset.exchange,
      sector: asset.sector,
      currency: asset.currency,
      createdAt: null,
      updatedAt: null,
      source: "FINNHUB",
      isPersisted: false,
    });
  }

  return Array.from(assetsBySymbol.values()).slice(0, 20);
};

export const createMarketAssetService = async (
  data: CreateMarketAssetInput
) => {
  const marketAsset = await prisma.marketAsset.upsert({
    where: { symbol: data.symbol.toUpperCase() },
    update: {
      name: data.name,
      assetType: data.assetType,
      exchange: data.exchange ?? null,
      sector: data.sector ?? null,
      currency: data.currency,
    },
    create: {
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

async function resolveMarketAssetFromFinnhub(symbol: string) {
  const normalizedSymbol = symbol.toUpperCase();

  const existing = await prisma.marketAsset.findUnique({
    where: { symbol: normalizedSymbol },
  });
  if (existing) return existing;

  const [profile, searchResults] = await Promise.all([
    getCompanyProfileService(normalizedSymbol).catch(() => null),
    searchFinnhubSymbolsService(normalizedSymbol).catch(
      (): FinnhubMarketAssetSearchResult[] => []
    ),
  ]);

  const searchResult = (searchResults as FinnhubMarketAssetSearchResult[]).find(
    (result: FinnhubMarketAssetSearchResult) =>
      result.symbol === normalizedSymbol
  );

  const name =
    profile?.name ??
    profile?.ticker ??
    searchResult?.name ??
    normalizedSymbol;

  return prisma.marketAsset.create({
    data: {
      symbol: normalizedSymbol,
      name,
      assetType:
        searchResult?.assetType === "ETF"
          ? "ETF"
          : "STOCK",
      exchange: profile?.exchange ?? searchResult?.exchange ?? null,
      sector: profile?.finnhubIndustry ?? null,
      currency: profile?.currency ?? searchResult?.currency ?? "USD",
    },
  });
}

export const addUserMarketAssetService = async (
  clerkUserId: string,
  data: AddUserMarketAssetInput
) => {
  const user = await resolveUser(clerkUserId);

  if (data.portfolioId) {
    const portfolio = await prisma.portfolio.findFirst({
      where: { id: data.portfolioId, userId: user.id },
    });
    if (!portfolio)
      throw new Error("Portfolio not found or does not belong to user");
  }

  const marketAsset = await resolveMarketAssetFromFinnhub(data.symbol);
  const quote = data.averageCost === undefined
    ? await getQuoteService(marketAsset.symbol).catch(() => null)
    : null;

  const existing = await prisma.userMarketAsset.findUnique({
    where: {
      userId_marketAssetId: {
        userId: user.id,
        marketAssetId: marketAsset.id,
      },
    },
  });

  const userMarketAsset = existing
    ? await prisma.userMarketAsset.update({
        where: { id: existing.id },
        data: {
          ...(data.quantity !== undefined && { quantity: data.quantity }),
          ...(data.averageCost !== undefined && {
            averageCost: data.averageCost,
          }),
        },
        include: { marketAsset: true },
      })
    : await prisma.userMarketAsset.create({
        data: {
          userId: user.id,
          marketAssetId: marketAsset.id,
          quantity: data.quantity ?? 0,
          averageCost: data.averageCost ?? quote?.price ?? 0,
        },
        include: { marketAsset: true },
      });

  if (data.portfolioId) {
    await prisma.portfolioMarketAsset.upsert({
      where: {
        portfolioId_userMarketAssetId: {
          portfolioId: data.portfolioId,
          userMarketAssetId: userMarketAsset.id,
        },
      },
      update: {},
      create: {
        portfolioId: data.portfolioId,
        userMarketAssetId: userMarketAsset.id,
      },
    });
  }

  return userMarketAsset;
};

export const getUserMarketAssetsService = async (clerkUserId: string) => {
  const user = await resolveUser(clerkUserId);
  return prisma.userMarketAsset.findMany({
    where: { userId: user.id },
    include: {
      marketAsset: true,
      portfolios: true,
    },
    orderBy: { marketAsset: { symbol: "asc" } },
  });
};

export const deleteUserMarketAssetService = async (
  clerkUserId: string,
  userMarketAssetId: string
) => {
  const user = await resolveUser(clerkUserId);
  const existing = await prisma.userMarketAsset.findFirst({
    where: { id: userMarketAssetId, userId: user.id },
  });
  if (!existing) {
    throw new Error("Tracked asset not found or does not belong to user");
  }

  // Delete associated PortfolioMarketAsset links if any
  await prisma.portfolioMarketAsset.deleteMany({
    where: { userMarketAssetId },
  });

  await prisma.userMarketAsset.delete({
    where: { id: userMarketAssetId },
  });
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

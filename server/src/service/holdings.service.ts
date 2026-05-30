import prisma from "../lib/prisma.js";

export const getPortfolioHoldingsService = async (
  clerkUserId: string,
  portfolioId: string
) => {
  const user = await prisma.user.findUnique({ where: { clerkUserId } });
  if (!user) throw new Error("User not found");

  // Verify the portfolio belongs to this user
  const portfolio = await prisma.portfolio.findFirst({
    where: { id: portfolioId, userId: user.id },
  });
  if (!portfolio)
    throw new Error("Portfolio not found or does not belong to user");

  // Fetch all transactions for accounts in this portfolio
  const transactions = await prisma.transaction.findMany({
    where: {
      account: { portfolioId },
    },
    include: {
      marketAsset: true,
    },
    orderBy: { executedAt: "asc" },
  });

  // Compute holdings in-memory
  const holdingsMap = new Map<
    string,
    {
      marketAssetId: string;
      symbol: string;
      assetName: string;
      quantity: number;
      totalCost: number;
    }
  >();

  for (const tx of transactions) {
    const { marketAssetId } = tx;

    if (!holdingsMap.has(marketAssetId)) {
      holdingsMap.set(marketAssetId, {
        marketAssetId,
        symbol: tx.marketAsset.symbol,
        assetName: tx.marketAsset.name,
        quantity: 0,
        totalCost: 0,
      });
    }

    const holding = holdingsMap.get(marketAssetId)!;

    if (tx.type === "BUY") {
      holding.quantity += Number(tx.quantity);
      holding.totalCost += Number(tx.quantity) * Number(tx.price);
    }

    if (tx.type === "SELL") {
      holding.quantity -= Number(tx.quantity);
    }
  }

  // Filter out zero/negative holdings and compute averageCost
  const finalHoldings = Array.from(holdingsMap.values())
    .filter((h) => h.quantity > 0)
    .map((h) => ({
      marketAssetId: h.marketAssetId,
      symbol: h.symbol,
      assetName: h.assetName,
      quantity: h.quantity,
      averageCost: h.totalCost / h.quantity,
    }));

  return finalHoldings;
};

export const getUserHoldingsService = async (
  clerkUserId: string
) => {
  const user = await prisma.user.findUnique({
    where: { clerkUserId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const portfolios = await prisma.portfolio.findMany({
    where: {
      userId: user.id,
    },
  });

  const holdings = [];

  for (const portfolio of portfolios) {
    const portfolioHoldings =
      await getPortfolioHoldingsService(
        clerkUserId,
        portfolio.id
      );

    holdings.push(...portfolioHoldings);
  }

  return holdings;
};
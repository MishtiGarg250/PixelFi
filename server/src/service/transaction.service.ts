import prisma from "../lib/prisma.js";

interface CreateTransactionInput {
  accountId: string;
  marketAssetId: string;
  type: "BUY" | "SELL" | "DEPOSIT" | "WITHDRAWAL" | "DIVIDEND";
  quantity: number;
  price: number;
  fees?: number;
  currency: string;
  executedAt: string;
}

export const createTransactionService = async (
  clerkUserId: string,
  portfolioId: string,
  data: CreateTransactionInput
) => {
  // Resolve user
  const user = await prisma.user.findUnique({ where: { clerkUserId } });
  if (!user) throw new Error("User not found");

  // Verify portfolio belongs to user
  const portfolio = await prisma.portfolio.findFirst({
    where: { id: portfolioId, userId: user.id },
  });
  if (!portfolio)
    throw new Error("Portfolio not found or does not belong to user");

  // Verify account belongs to this portfolio
  const account = await prisma.account.findFirst({
    where: { id: data.accountId, portfolioId },
  });
  if (!account)
    throw new Error("Account not found or does not belong to this portfolio");

  // Verify market asset exists
  const marketAsset = await prisma.marketAsset.findUnique({
    where: { id: data.marketAssetId },
  });
  if (!marketAsset) throw new Error("Market asset not found");

  // Create transaction
  const transaction = await prisma.transaction.create({
    data: {
      accountId: data.accountId,
      marketAssetId: data.marketAssetId,
      type: data.type,
      quantity: data.quantity,
      price: data.price,
      fees: data.fees ?? 0,
      currency: data.currency,
      executedAt: new Date(data.executedAt),
    },
    include: {
      marketAsset: true,
      account: true,
    },
  });

  return transaction;
};

export const getPortfolioTransactionsService = async (
  clerkUserId: string,
  portfolioId: string
) => {
  const user = await prisma.user.findUnique({ where: { clerkUserId } });
  if (!user) throw new Error("User not found");

  // Verify portfolio belongs to user
  const portfolio = await prisma.portfolio.findFirst({
    where: { id: portfolioId, userId: user.id },
  });
  if (!portfolio)
    throw new Error("Portfolio not found or does not belong to user");

  const transactions = await prisma.transaction.findMany({
    where: {
      account: { portfolioId },
    },
    include: {
      marketAsset: true,
      account: true,
    },
    orderBy: { executedAt: "desc" },
  });

  return transactions;
};
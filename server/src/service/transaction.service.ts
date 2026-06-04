import prisma from "../lib/prisma.js";

interface CreateTransactionInput {
  accountId: string;
  marketAssetId?: string |  undefined;
  type: "BUY" | "SELL" | "DEPOSIT" | "WITHDRAWAL" | "DIVIDEND" | "INTEREST" | "TRANSFER";
  quantity?: number | undefined;
  price?: number | undefined;
  amount?: number | undefined;
  fees?: number | undefined;
  currency: string;
  executedAt: string;
}

export const createTransactionService = async (
  clerkUserId: string,
  data: CreateTransactionInput
) => {
  // Resolve user
  const user = await prisma.user.findUnique({ where: { clerkUserId } });
  if (!user) throw new Error("User not found");

  // Verify account belongs to this user
  const account = await prisma.account.findFirst({
    where: { id: data.accountId, userId: user.id },
  });
  if (!account)
    throw new Error("Account not found or does not belong to user");

  // If marketAssetId provided, verify it exists
  if (data.marketAssetId) {
    const marketAsset = await prisma.marketAsset.findUnique({
      where: { id: data.marketAssetId },
    });
    if (!marketAsset) throw new Error("Market asset not found");
  }

  // Create transaction
  const transaction = await prisma.transaction.create({
    data: {
      userId: user.id,
      accountId: data.accountId,
      marketAssetId: data.marketAssetId ?? null,
      type: data.type,
      quantity: data.quantity ?? null,
      price: data.price ?? null,
      amount: data.amount ?? null,
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

export const getUserTransactionsService = async (clerkUserId: string) => {
  const user = await prisma.user.findUnique({ where: { clerkUserId } });
  if (!user) throw new Error("User not found");

  const transactions = await prisma.transaction.findMany({
    where: { userId: user.id },
    include: {
      marketAsset: true,
      account: true,
    },
    orderBy: { executedAt: "desc" },
  });

  return transactions;
};

export const getAccountTransactionsService = async (
  clerkUserId: string,
  accountId: string
) => {
  const user = await prisma.user.findUnique({ where: { clerkUserId } });
  if (!user) throw new Error("User not found");

  // Verify account belongs to user
  const account = await prisma.account.findFirst({
    where: { id: accountId, userId: user.id },
  });
  if (!account)
    throw new Error("Account not found or does not belong to user");

  const transactions = await prisma.transaction.findMany({
    where: { accountId },
    include: {
      marketAsset: true,
      account: true,
    },
    orderBy: { executedAt: "desc" },
  });

  return transactions;
};
import prisma from "../lib/prisma.js";

interface CreateAccountInput {
  name: string;
  brokerName: string;
  accountType: "BROKERAGE" | "BANK" | "CRYPTO";
  currency: string;
}

/**
 * Resolve clerkUserId → internal user, and validate the portfolio belongs to them.
 */
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

export const createAccountService = async (
  clerkUserId: string,
  portfolioId: string,
  data: CreateAccountInput
) => {
  await resolveUserAndPortfolio(clerkUserId, portfolioId);

  const account = await prisma.account.create({
    data: {
      name: data.name,
      brokerName: data.brokerName,
      accountType: data.accountType,
      currency: data.currency,
      portfolioId,
    },
  });

  return account;
};

export const getPortfolioAccountsService = async (
  clerkUserId: string,
  portfolioId: string
) => {
  await resolveUserAndPortfolio(clerkUserId, portfolioId);

  const accounts = await prisma.account.findMany({
    where: { portfolioId },
    orderBy: { createdAt: "desc" },
  });

  return accounts;
};

export const deleteAccountService = async (
  clerkUserId: string,
  portfolioId: string,
  accountId: string
) => {
  await resolveUserAndPortfolio(clerkUserId, portfolioId);

  const account = await prisma.account.findFirst({
    where: { id: accountId, portfolioId },
  });
  if (!account)
    throw new Error("Account not found or does not belong to this portfolio");

  await prisma.account.delete({ where: { id: accountId } });
};
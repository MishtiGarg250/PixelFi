import prisma from "../lib/prisma.js";

interface CreateAccountInput {
  name: string;
  brokerName?: string;
  accountType: "BROKERAGE" | "BANK" | "CRYPTO";
  currency: string;
}

/**
 * Resolve clerkUserId → internal user.
 */
async function resolveUser(clerkUserId: string) {
  const user = await prisma.user.findUnique({ where: { clerkUserId } });
  if (!user) throw new Error("User not found");
  return user;
}

export const createAccountService = async (
  clerkUserId: string,
  data: CreateAccountInput
) => {
  const user = await resolveUser(clerkUserId);

  const account = await prisma.account.create({
    data: {
      userId: user.id,
      name: data.name,
      brokerName: data.brokerName ?? null,
      accountType: data.accountType,
      currency: data.currency,
    },
  });

  return account;
};

export const getUserAccountsService = async (clerkUserId: string) => {
  const user = await resolveUser(clerkUserId);

  const accounts = await prisma.account.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return accounts;
};

export const deleteAccountService = async (
  clerkUserId: string,
  accountId: string
) => {
  const user = await resolveUser(clerkUserId);

  const account = await prisma.account.findFirst({
    where: { id: accountId, userId: user.id },
  });
  if (!account)
    throw new Error("Account not found or does not belong to user");

  await prisma.account.delete({ where: { id: accountId } });
};
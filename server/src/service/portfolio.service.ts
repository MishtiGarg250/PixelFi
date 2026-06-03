import prisma from "../lib/prisma.js";

interface CreatePortfolioInput {
  name: string;
  description?: string | undefined;
}

interface UpdatePortfolioInput {
  name?: string | undefined;
  description?: string | null | undefined;
}

export const createPortfolioService = async (
  userId: string,
  data: CreatePortfolioInput
) => {
  const portfolio = await prisma.portfolio.create({
    data: {
      name: data.name,
      description: data.description ?? null,

      user: {
        connect: {
          clerkUserId: userId,
        },
      },
    },
  });

  return portfolio;
};

export const getUserPortfoliosService = async (userId: string) => {
  const portfolios = await prisma.portfolio.findMany({
    where: {
      user: {
        clerkUserId: userId,
      },
    },

    orderBy: {
      createdAt: "desc",
    },

    include: {
      _count: {
        select: {
          customAssets: true,
          marketAssets: true,
        },
      },
    },
  });

  return portfolios;
};

export const getPortfolioByIdService = async (
  userId: string,
  portfolioId: string
) => {
  const user = await prisma.user.findUnique({ where: { clerkUserId: userId } });
  if (!user) throw new Error("User not found");

  const portfolio = await prisma.portfolio.findFirst({
    where: { id: portfolioId, userId: user.id },
    include: {
      _count: {
        select: {
          customAssets: true,
          marketAssets: true,
        },
      },
    },
  });

  if (!portfolio) throw new Error("Portfolio not found");
  return portfolio;
};

export const updatePortfolioService = async (
  userId: string,
  portfolioId: string,
  data: UpdatePortfolioInput
) => {
  const user = await prisma.user.findUnique({ where: { clerkUserId: userId } });
  if (!user) throw new Error("User not found");

  const portfolio = await prisma.portfolio.findFirst({
    where: { id: portfolioId, userId: user.id },
  });
  if (!portfolio) throw new Error("Portfolio not found or does not belong to user");

  const updated = await prisma.portfolio.update({
    where: { id: portfolioId },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
    },
  });

  return updated;
};

export const deletePortfolioService = async (
  userId: string,
  portfolioId: string
) => {
  const user = await prisma.user.findUnique({ where: { clerkUserId: userId } });
  if (!user) throw new Error("User not found");

  const portfolio = await prisma.portfolio.findFirst({
    where: { id: portfolioId, userId: user.id },
  });
  if (!portfolio) throw new Error("Portfolio not found or does not belong to user");

  // Cascade: remove portfolio-market-asset join records
  await prisma.portfolioMarketAsset.deleteMany({ where: { portfolioId } });
  await prisma.customAsset.deleteMany({ where: { portfolioId } });
  await prisma.portfolio.delete({ where: { id: portfolioId } });
};
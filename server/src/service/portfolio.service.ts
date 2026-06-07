import prisma from "../lib/prisma.js";

interface CreatePortfolioInput {
  name: string;
  description?: string | undefined;
  visibility?: "PRIVATE" | "PUBLIC";
}

interface UpdatePortfolioInput {
  name?: string | undefined;
  description?: string | null | undefined;
  visibility?: "PRIVATE" | "PUBLIC";
}

export const createPortfolioService = async (
  userId: string,
  data: CreatePortfolioInput
) => {
  const portfolio = await prisma.portfolio.create({
    data: {
      name: data.name,
      description: data.description ?? null,
      visibility: data.visibility ?? "PRIVATE",

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

      customAssets: true,
      marketAssets: {
        include: {
          userMarketAsset: {
            include: {
              marketAsset: true,
            },
          },
        },
      },
    }

  });
  if (!portfolio) throw new Error("Portfolio not found");
  const customAssetValue = portfolio.customAssets.reduce(
    (sum, asset) =>
      sum + Number(asset.currentValue),
    0
  );

  const marketAssetValue = portfolio.marketAssets.reduce((sum, item) => {
    const holding =
      item.userMarketAsset;

    return (
      sum + Number(holding.quantity) * Number(holding.averageCost)
    );
  },
    0
  );

  const totalValue = customAssetValue + marketAssetValue;


  return {
    ...portfolio,
    totalValue,
  };
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
      ...(data.visibility !== undefined && { visibility: data.visibility, })
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

  await prisma.$transaction(async (tx) => {
    await tx.portfolioMarketAsset.deleteMany({
      where: {
        portfolioId,
      }
    });

    await tx.customAsset.updateMany({
      where: {
        portfolioId,
      },
      data: {
        portfolioId: null,
      }
    });

    await tx.portfolio.delete({
      where: {
        id: portfolioId,
      }
    })
  });
};
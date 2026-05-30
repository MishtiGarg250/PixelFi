import prisma from "../lib/prisma.js";

interface CreatePortfolioInput {
  name: string;
  description?: string | undefined;
}

export const createPortfolioService = async (
  userId: string,
  data: CreatePortfolioInput
) => {
  const portfolio =
    await prisma.portfolio.create({
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

export const getUserPortfoliosService =
  async (userId: string) => {
    const portfolios =
      await prisma.portfolio.findMany({
        where: {
          user: {
            clerkUserId: userId,
          },
        },

        orderBy: {
          createdAt: "desc",
        },
      });

    return portfolios;
  };
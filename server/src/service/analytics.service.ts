import prisma from "../lib/prisma.js";
import { getCurrentPrice } from "../utils/finhub.helper.js";

const MARKET_PRICES: Record<string, number> = {
  AAPL: 220,
  TSLA: 310,
  BTC: 65000,
  ETH: 3500,
};

async function resolveUser(clerkUserId: string) {
  const user = await prisma.user.findUnique({
    where: {
      clerkUserId,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
}

export const getNetWorthService = async (
  clerkUserId: string
) => {
  const user = await resolveUser(clerkUserId);

  const marketAssets =
    await prisma.userMarketAsset.findMany({
      where: {
        userId: user.id,
      },
      include: {
        marketAsset: true,
      },
    });

  const customAssets = await prisma.customAsset.findMany({
    where: {
      userId: user.id,
    },
  });

  const liabilities = await prisma.liability.findMany({
    where: {
      userId: user.id,
    },
  });

  const holdings = await Promise.all(
    marketAssets.map(async (asset) => {
      const quantity = Number(asset.quantity);
      const averageCost = Number(asset.averageCost);
      const symbol = asset.marketAsset.symbol;

      let currentPrice = averageCost;

      try {
        currentPrice = await getCurrentPrice(symbol);
      } catch (error) {
        console.error(
          `Failed to fetch price for ${symbol}`,
          error
        );
      }

      const currentValue = quantity * currentPrice;

      return {
        marketAssetId: asset.marketAsset.id,
        symbol,
        assetName: asset.marketAsset.name,
        quantity,
        averageCost,
        currentPrice,
        currentValue,
      };
    })
  );

  const marketAssetsValue = holdings.reduce(
    (sum, holding) =>
      sum + holding.currentValue,
    0
  );

  const customAssetsValue = customAssets.reduce(
    (sum, asset) =>
      sum +
      Number(asset.currentValue),
    0
  );

  const totalAssets = marketAssetsValue + customAssetsValue;

  const totalLiabilities =
    liabilities.reduce(
      (sum, liability) =>
        sum +
        Number(liability.outstanding),
      0
    );

  const totalNetWorth = totalAssets - totalLiabilities;

  return {
    totalAssets,
    totalLiabilities,
    totalNetWorth,
    holdings,
    customAssets: customAssets.map(
      (asset) => ({
        id: asset.id,
        name: asset.name,
        category: asset.category,
        currentValue:
          Number(asset.currentValue),
      })
    ),
  };
};



export const getAllocationService = async (
  clerkUserId: string
) => {
  const user = await resolveUser(clerkUserId);

  const marketAssets =
    await prisma.userMarketAsset.findMany({
      where: {
        userId: user.id,
      },
      include: {
        marketAsset: true,
      },
    });

  const customAssets =
    await prisma.customAsset.findMany({
      where: {
        userId: user.id,
      },
    });

  const marketAllocations = await Promise.all(
    marketAssets.map(async (asset) => {
      const symbol = asset.marketAsset.symbol;

      let currentPrice = Number(
        asset.averageCost
      );

      try {
        currentPrice =
          await getCurrentPrice(symbol);
      } catch (error) {
        console.error(
          `Failed to fetch price for ${symbol}`,
          error
        );
      }

      return {
        symbol,
        currentValue:
          Number(asset.quantity) *
          currentPrice,
      };
    })
  );

  const customAllocations =
    customAssets.map((asset) => ({
      symbol: asset.name,
      currentValue: Number(
        asset.currentValue
      ),
    }));

  const allocations = [
    ...marketAllocations,
    ...customAllocations,
  ];

  const totalValue = allocations.reduce(
    (sum, item) =>
      sum + item.currentValue,
    0
  );

  return allocations.map(
    (allocation) => ({
      symbol: allocation.symbol,
      currentValue:
        allocation.currentValue,
      allocationPercent:
        totalValue === 0
          ? 0
          : Number(
              (
                (allocation.currentValue /
                  totalValue) *
                100
              ).toFixed(2)
            ),
    })
  );
};



export const getPerformanceService =
  async (clerkUserId: string) => {
    const user = await resolveUser(clerkUserId);

    const marketAssets = await prisma.userMarketAsset.findMany({
      where: {
        userId: user.id,
      },
      include: {
        marketAsset: true,
      },
    });

    return Promise.all(
      marketAssets.map(async (asset) => {
        const quantity = Number(asset.quantity);

        const averageCost =
          Number(asset.averageCost);

        const investedAmount =
          quantity * averageCost;

        const symbol =
          asset.marketAsset.symbol;

        let currentPrice = averageCost;

        try {
          currentPrice =
            await getCurrentPrice(symbol);
        } catch (error) {
          console.error(
            `Failed to fetch price for ${symbol}`,
            error
          );
        }

        const currentValue =
          quantity * currentPrice;

        const pnl =
          currentValue - investedAmount;

        const pnlPercent =
          investedAmount === 0
            ? 0
            : Number(
              (
                (pnl / investedAmount) *
                100
              ).toFixed(2)
            );

        return {
          symbol,
          investedAmount,
          currentValue,
          pnl,
          pnlPercent,
        };
      })
    );
  };



export const getDashboardService =
  async (clerkUserId: string) => {
    const user =
      await resolveUser(clerkUserId);

    const [
      netWorth,
      allocation,
      performance,
      liabilities,
      recentTransactions,
    ] = await Promise.all([
      getNetWorthService(
        clerkUserId
      ),
      getAllocationService(
        clerkUserId
      ),
      getPerformanceService(
        clerkUserId
      ),
      prisma.liability.findMany({
        where: {
          userId: user.id,
        },
      }),
      prisma.transaction.findMany({
        where: {
          userId: user.id,
        },
        orderBy: {
          executedAt: "desc",
        },
        take: 10,
        include: {
          marketAsset: true,
          account: true,
        },
      }),
    ]);

    return {
      netWorth,
      allocation,
      performance,
      liabilities,
      recentTransactions,
    };
  };


export const getRiskScoreService =
  async (clerkUserId: string) => {
    const allocation =
      await getAllocationService(
        clerkUserId
      );

    let score = 0;

    const largestPosition =
      Math.max(
        ...allocation.map(
          (item) =>
            item.allocationPercent
        ),
        0
      );

    if (largestPosition > 50) {
      score += 40;
    }

    if (largestPosition > 30) {
      score += 20;
    }

    return {
      score,
      level:
        score > 60
          ? "HIGH"
          : score > 30
            ? "MEDIUM"
            : "LOW",
    };
  };


export const getDiversificationService =
  async (clerkUserId: string) => {
    const user = await resolveUser(clerkUserId);

    const marketAssets = await prisma.userMarketAsset.count({
      where: {
        userId: user.id,
      },
    });

    const customAssets = await prisma.customAsset.count({
      where: {
        userId: user.id,
      },
    });

    const totalAssets = marketAssets + customAssets;

    const score =
      Math.min(
        totalAssets * 10,
        100
      );

    return {
      score,
      totalAssets,
    };
  };
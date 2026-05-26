import prisma from "../lib/prisma.js";

export const getUserHoldingsService =
  async (clerkUserId: string) => {

    const user =
      await prisma.user.findUnique({
        where: {
          clerkUserId,
        },
      });

    if (!user) {
      throw new Error("User not found");
    }

    const transactions =
      await prisma.transaction.findMany({

        where: {
          account: {
            userId: user.id,
          },
        },

        include: {
          asset: true,
        },

        orderBy: {
          executedAt: "asc",
        },
      });


    const holdingsMap =
      new Map();

    for (const tx of transactions) {

      const assetId = tx.assetId;

      if (!holdingsMap.has(assetId)) {

        holdingsMap.set(assetId, {
          assetId,

          symbol: tx.asset.symbol,

          assetName: tx.asset.name,

          quantity: 0,

          totalCost: 0,
        });
      }

      const holding =
        holdingsMap.get(assetId);

      // BUY

      if (tx.type === "BUY") {

        holding.quantity +=
          Number(tx.quantity);

        holding.totalCost +=
          Number(tx.quantity) *
          Number(tx.price);
      }

      // SELL
      
      if (tx.type === "SELL") {

        holding.quantity -=
          Number(tx.quantity);
      }
    }


    // Convert map to array

    const holdings =
      Array.from(
        holdingsMap.values()
      );


    // Remove zero holdings
    
    const filteredHoldings =
      holdings.filter(
        (holding) =>
          holding.quantity > 0
      );


    // Calculate average cost

    const finalHoldings =
      filteredHoldings.map(
        (holding) => {

          const averageCost =
            holding.totalCost /
            holding.quantity;

          return {
            ...holding,

            averageCost,
          };
        }
      );

    return finalHoldings;
  };
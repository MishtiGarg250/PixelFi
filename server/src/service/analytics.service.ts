import {
  getUserHoldingsService,
} from "./holdings.service.js";

// Temporary mock prices

const MARKET_PRICES: Record<
  string,
  number
> = {

  AAPL: 220,

  TSLA: 310,

  BTC: 65000,

  ETH: 3500,
};

export const getNetWorthService =
  async (clerkUserId: string) => {

    const holdings =
      await getUserHoldingsService(
        clerkUserId
      );

    let totalNetWorth = 0;

    const enrichedHoldings =
      holdings.map((holding) => {

        const currentPrice =
          MARKET_PRICES[
            holding.symbol
          ] || 0;

        const currentValue =
          holding.quantity *
          currentPrice;

        totalNetWorth += currentValue;

        return {
          ...holding,

          currentPrice,

          currentValue,
        };
      });

    return {
      totalNetWorth,
      holdings: enrichedHoldings,
    };
  };

export const getAllocationService =
  async (clerkUserId: string) => {

    const portfolio =
      await getNetWorthService(
        clerkUserId
      );

    const allocations =
      portfolio.holdings.map(
        (holding) => {

          const allocationPercent =
            (
              holding.currentValue /
              portfolio.totalNetWorth
            ) * 100;

          return {
            symbol:
              holding.symbol,

            currentValue:
              holding.currentValue,

            allocationPercent,
          };
        }
      );

    return allocations;
  };

export const getPerformanceService =
  async (clerkUserId: string) => {

    const portfolio =
      await getNetWorthService(
        clerkUserId
      );

    const performance =
      portfolio.holdings.map(
        (holding) => {

          const investedAmount =
            holding.quantity *
            holding.averageCost;

          const pnl =
            holding.currentValue -
            investedAmount;

          const pnlPercent =
            (
              pnl /
              investedAmount
            ) * 100;

          return {
            symbol:
              holding.symbol,

            investedAmount,
            currentValue:
              holding.currentValue,

            pnl,

            pnlPercent,
          };
        }
      );

    return performance;
  };
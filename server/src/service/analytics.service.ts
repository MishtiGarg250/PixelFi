import { getUserMarketAssetsService } from "./holdings.service.js";

// Temporary mock prices — replace with real market data integration
const MARKET_PRICES: Record<string, number> = {
  AAPL: 220,
  TSLA: 310,
  BTC: 65000,
  ETH: 3500,
};

export const getNetWorthService = async (clerkUserId: string) => {
  const userAssets = await getUserMarketAssetsService(clerkUserId);

  let totalNetWorth = 0;

  const enrichedHoldings = userAssets.map((asset) => {
    const symbol = asset.marketAsset.symbol;
    const currentPrice = MARKET_PRICES[symbol] || 0;
    const currentValue = Number(asset.quantity) * currentPrice;

    totalNetWorth += currentValue;

    return {
      marketAssetId: asset.marketAssetId,
      symbol,
      assetName: asset.marketAsset.name,
      quantity: Number(asset.quantity),
      averageCost: Number(asset.averageCost),
      currentPrice,
      currentValue,
    };
  });

  return {
    totalNetWorth,
    holdings: enrichedHoldings,
  };
};

export const getAllocationService = async (clerkUserId: string) => {
  const portfolio = await getNetWorthService(clerkUserId);

  const allocations = portfolio.holdings.map((holding) => {
    const allocationPercent =
      portfolio.totalNetWorth > 0
        ? (holding.currentValue / portfolio.totalNetWorth) * 100
        : 0;

    return {
      symbol: holding.symbol,
      currentValue: holding.currentValue,
      allocationPercent,
    };
  });

  return allocations;
};

export const getPerformanceService = async (clerkUserId: string) => {
  const portfolio = await getNetWorthService(clerkUserId);

  const performance = portfolio.holdings.map((holding) => {
    const investedAmount = holding.quantity * holding.averageCost;
    const pnl = holding.currentValue - investedAmount;
    const pnlPercent = investedAmount > 0 ? (pnl / investedAmount) * 100 : 0;

    return {
      symbol: holding.symbol,
      investedAmount,
      currentValue: holding.currentValue,
      pnl,
      pnlPercent,
    };
  });

  return performance;
};
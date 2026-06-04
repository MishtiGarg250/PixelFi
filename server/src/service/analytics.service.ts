

// Temporary mock prices — replace with real market data integration
const MARKET_PRICES: Record<string, number> = {
  AAPL: 220,
  TSLA: 310,
  BTC: 65000,
  ETH: 3500,
};

export const getNetWorthService = async (clerkUserId: string) => {
  return {
    totalNetWorth: 100000,
    holdings: [],}
};

export const getAllocationService = async (clerkUserId: string) => {
   return {
    totalNetWorth: 100000,
    holdings: [],}
};

export const getPerformanceService = async (clerkUserId: string) => {
   return {
    totalNetWorth: 100000,
    holdings: [],}
};
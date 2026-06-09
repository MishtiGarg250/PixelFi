export const queryKeys = {
  user: ["user"] as const,
  portfolios: ["portfolios"] as const,
  portfolio: (id: string) => ["portfolio", id] as const,
  accounts: ["accounts"] as const,
  holdings: (portfolioId?: string) => (portfolioId ? ["holdings", portfolioId] : ["holdings"]) ,
  holdingsList: ["holdings"] as const,
  holding: (id: string) => ["holding", id] as const,
  transactions: ["transactions"] as const,
  accountTransactions: (accountId: string) => ["transactions", "account", accountId] as const,
  marketAssets: (query: string) => ["marketAssets", query] as const,
  userMarketAssets: ["userMarketAssets"] as const,
  customAssets: (portfolioId?: string) => ["customAssets", portfolioId ?? "all"] as const,
  liabilities: ["liabilities"] as const,
  expenses: ["expenses"] as const,
  goals: ["goals"] as const,
  analytics: {
    netWorth: ["analytics", "netWorth"] as const,
    allocation: ["analytics", "allocation"] as const,
    performance: ["analytics", "performance"] as const,
  },
};


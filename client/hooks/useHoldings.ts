"use client";

import { useQuery } from "@tanstack/react-query";
import { useApi } from "./useApi";
import { getPortfolioHoldings } from "@/services/holdings.service";

export function useHoldings(portfolioId: string) {
  const { getApi } = useApi();

  const holdings = useQuery({
    queryKey: ["holdings", portfolioId],
    queryFn: async () => {
      const api = await getApi();
      return getPortfolioHoldings(api, portfolioId);
    },
    enabled: !!portfolioId,
  });

  return { holdings };
}

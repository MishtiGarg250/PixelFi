"use client";

import { useQuery } from "@tanstack/react-query";
import { useApi } from "./useApi";
import { getAccounts } from "@/services/account.service";

/**
 * Determines if the current user has completed onboarding.
 * Onboarding is considered complete once the user has at least one account.
 */
export function useOnboardingStatus() {
  const { getApi } = useApi();

  const { data: accounts, isLoading } = useQuery({
    queryKey: ["onboarding-status"],
    queryFn: async () => {
      const api = await getApi();
      return getAccounts(api);
    },
    staleTime: 60_000, // 1 min — don't re-fetch on every render
    retry: false,
  });

  const isOnboardingComplete = !isLoading && Array.isArray(accounts) && accounts.length > 0;
  const isOnboardingIncomplete = !isLoading && Array.isArray(accounts) && accounts.length === 0;

  return { isOnboardingComplete, isOnboardingIncomplete, isLoading };
}

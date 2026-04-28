import { useQuery } from "@tanstack/react-query";
import { LoyaltyPointsStats, UserLoyaltyStats } from "@/types/loyalty-stats";

async function fetchLoyaltyStats(period?: string): Promise<LoyaltyPointsStats> {
  const url = `/api/stats/loyalty${period ? `?period=${period}` : ""}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch loyalty statistics");
  }

  const data = await response.json();
  return data.data;
}

async function fetchUserLoyaltyStats(): Promise<UserLoyaltyStats> {
  const response = await fetch("/api/stats/loyalty/user");

  if (!response.ok) {
    throw new Error("Failed to fetch user loyalty statistics");
  }

  const data = await response.json();
  return data.data;
}

export function useLoyaltyStats(period?: string) {
  return useQuery({
    queryKey: ["loyalty-stats", period],
    queryFn: () => fetchLoyaltyStats(period),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useUserLoyaltyStats() {
  return useQuery({
    queryKey: ["user-loyalty-stats"],
    queryFn: fetchUserLoyaltyStats,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

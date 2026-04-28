import { LeaderboardResponse } from "@/types/loyalty-stats";
import { useQuery } from "@tanstack/react-query";

async function fetchLeaderboard(
  period: "week" | "month" | "year" | "all" = "all",
  page: number = 1,
  limit: number = 20,
): Promise<LeaderboardResponse> {
  const response = await fetch(
    `/api/stats/loyalty/leaderboard?period=${period}&page=${page}&limit=${limit}`,
  );

  if (!response.ok) {
    throw new Error("Failed to fetch leaderboard");
  }

  return response.json();
}

export function useLoyaltyLeaderboard(
  period: "week" | "month" | "year" | "all" = "all",
  page: number = 1,
  limit: number = 20,
) {
  return useQuery({
    queryKey: ["loyalty-leaderboard", period, page, limit],
    queryFn: () => fetchLeaderboard(period, page, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    placeholderData: (previousData) => previousData,
  });
}

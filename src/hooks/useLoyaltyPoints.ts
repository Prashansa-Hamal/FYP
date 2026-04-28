import { useQuery } from "@tanstack/react-query";

interface LoyaltyTransaction {
  id: string;
  points: number;
  type: "EARNED" | "REDEEMED";
  description: string;
  createdAt: string;
  order?: {
    orderNumber: string;
  };
}

interface LoyaltyPointsResponse {
  success: boolean;
  data: {
    points: number;
    transactions: LoyaltyTransaction[];
  };
}

async function fetchLoyaltyPoints(): Promise<LoyaltyPointsResponse> {
  const response = await fetch("/api/users/points");

  if (!response.ok) {
    throw new Error("Failed to fetch loyalty points");
  }

  return response.json();
}

export function useLoyaltyPoints() {
  return useQuery({
    queryKey: ["loyaltyPoints"],
    queryFn: fetchLoyaltyPoints,
    staleTime: 60 * 1000, // 1 minute
    refetchOnWindowFocus: false,
  });
}

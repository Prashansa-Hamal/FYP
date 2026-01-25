import { useQuery } from "@tanstack/react-query";
import { StationOrdersResponse } from "@/types/station-orders";
import { PreparationStation } from "@/types/enums";

// Fetch station orders
export function useStationOrders(station: PreparationStation) {
  return useQuery<StationOrdersResponse, Error>({
    queryKey: ["station-orders", station],
    queryFn: async () => {
      const response = await fetch(`/api/orders/station/${station}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch station orders");
      }

      return response.json();
    },
    // Auto-refresh every 15 seconds
    refetchInterval: 15000,
    // Keep data fresh for 5 seconds
    staleTime: 5000,
    // Retry failed requests 3 times
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    // Only fetch when station is provided
    enabled: !!station,
  });
}

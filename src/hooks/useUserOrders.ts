import { OrderFilters, OrdersResponse } from "@/types/orders";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";

// API function to fetch orders
async function fetchUserOrders(
  filters?: OrderFilters,
): Promise<OrdersResponse> {
  // Build query parameters
  const params = new URLSearchParams();

  if (filters?.page) params.append("page", filters.page.toString());
  if (filters?.limit) params.append("limit", filters.limit.toString());

  // Handle status array properly
  if (filters?.status) {
    const statuses = Array.isArray(filters.status)
      ? filters.status
      : [filters.status];
    // Join multiple statuses with comma
    if (statuses.length > 0) {
      params.append("status", statuses.join(","));
    }
  }

  if (filters?.paymentStatus) {
    const paymentStatuses = Array.isArray(filters.paymentStatus)
      ? filters.paymentStatus
      : [filters.paymentStatus];
    if (paymentStatuses.length > 0) {
      params.append("paymentStatus", paymentStatuses.join(","));
    }
  }

  if (filters?.orderType) {
    const types = Array.isArray(filters.orderType)
      ? filters.orderType
      : [filters.orderType];
    if (types.length > 0) {
      params.append("orderType", types.join(","));
    }
  }

  if (filters?.startDate) params.append("startDate", filters.startDate);
  if (filters?.endDate) params.append("endDate", filters.endDate);
  if (filters?.search) params.append("search", filters.search);

  const queryString = params.toString();
  const url = `/api/orders/my-orders${queryString ? `?${queryString}` : ""}`;

  // Log the request for debugging
  console.log("Fetching orders with URL:", url);
  console.log("Filters:", filters);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Error response:", errorData);
    throw new Error(errorData.error || "Failed to fetch orders");
  }

  const data = await response.json();
  console.log("Response data:", data);
  return data;
}

// Hook with options for customization
export function useUserOrders(
  filters?: OrderFilters,
  options?: Omit<
    UseQueryOptions<OrdersResponse, Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery<OrdersResponse, Error>({
    queryKey: ["userOrders", filters],
    queryFn: () => fetchUserOrders(filters),
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    ...options,
  });
}

// Hook for active orders only (not completed or cancelled)
export function useActiveOrders(limit: number = 10) {
  return useUserOrders({
    limit,
    status: ["PENDING", "CONFIRMED", "PREPARING", "READY", "SERVED"],
  });
}

// Hook for order history (completed orders)
export function useOrderHistory(page: number = 1, limit: number = 10) {
  return useUserOrders({
    page,
    limit,
    status: ["COMPLETED", "CANCELLED"],
  });
}

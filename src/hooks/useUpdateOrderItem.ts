// hooks/useUpdateOrderItem.ts

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface UpdateOrderItemRequest {
  id: string;
}

export interface UpdateOrderItemResponse {
  success: boolean;
  message: string;
}

export function useUpdateOrderItem() {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateOrderItemResponse, // response type
    Error, // error type
    UpdateOrderItemRequest // variables type
  >({
    mutationFn: async (data) => {
      const res = await fetch("/api/orders/orderItem", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result: UpdateOrderItemResponse = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message);
      }

      return result;
    },

    onSuccess: () => {
      toast.success("Order item status updated successfully");
      // Refetch tables/orders automatically
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["station-orders"] });
      queryClient.invalidateQueries({ queryKey: ["orderDetails"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update order item status");
    },
  });
}

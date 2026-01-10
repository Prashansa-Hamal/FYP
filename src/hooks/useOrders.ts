// types/order.ts
export interface PlaceOrderRequest {
  orderType?: "DINE_IN" | "TAKEAWAY" | "DELIVERY";
  tableNumber?: number;
  deliveryAddressId?: string;
  specialInstructions?: string;
  paymentMethod?: "CASH" | "CARD" | "ONLINE" | "WALLET";
}

export interface OrderItemSummary {
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface PlaceOrderResponse {
  success: boolean;
  message: string;
  order?: {
    id: string;
    orderNumber: string;
    status: string;
    paymentStatus: string;
    orderType: string;
    tableNumber?: number;
    finalAmount: number;
    estimatedReadyTime: string;
    itemCount: number;
    items: OrderItemSummary[];
    createdAt: string;
  };
  nextSteps?: string[];
  unavailableItems?: string[];
  error?: string;
}

// hooks/usePlaceOrder.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const usePlaceOrder = () => {
  const queryClient = useQueryClient();

  const placeOrder = async (
    orderData: PlaceOrderRequest
  ): Promise<PlaceOrderResponse> => {
    const response = await fetch("/api/orders/place", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to place order");
    }

    return response.json();
  };

  return useMutation<PlaceOrderResponse, Error, PlaceOrderRequest>({
    mutationFn: placeOrder,
    onSuccess: (data) => {
      // Show success toast
      toast.success(data.message || "Order placed successfully!", {
        description: `Order #${data.order?.orderNumber}`,
        duration: 5000,
      });

      // Show next steps toast after a delay
      if (data.nextSteps && data.nextSteps.length > 0) {
        setTimeout(() => {
          toast.info("Next Steps", {
            description: data.nextSteps?.join(" • "),
            duration: 8000,
          });
        }, 1000);
      }

      // Invalidate cart queries to clear cache
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.removeQueries({ queryKey: ["cart"] });

      // You can handle redirection here if needed
      console.log("Order placed successfully:", data.order?.id);
    },
    onError: (error) => {
      // Show error toast
      toast.error(error.message || "Failed to place order", {
        duration: 5000,
      });

      // Log error for debugging
      console.error("Order placement error:", error);
    },
  });
};

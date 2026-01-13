// hooks/usePlaceOrder.ts
import { ordersApis } from "@/lib/api/orders";
import {
  OrderFilters,
  OrderResponse,
  PlaceOrderRequest,
  PlaceOrderResponse,
  UpdateOrderStatusParams,
} from "@/types/orders";
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { toast } from "sonner";

export const usePlaceOrder = () => {
  const queryClient = useQueryClient();

  return useMutation<PlaceOrderResponse, Error, PlaceOrderRequest>({
    mutationFn: ordersApis.placeOrder,
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
      queryClient.cancelQueries({ queryKey: ["cart"] });
      queryClient.setQueryData(["cart"], null);

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

export const useOrders = (params: OrderFilters = {}) => {
  return useQuery({
    queryKey: ["orders", params],
    queryFn: () => ordersApis.getOrders(params),
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });
};

export const useOrderDetail = (id: string) => {
  return useQuery({
    queryKey: ["orderDetails", id],
    queryFn: async () => {
      const res = await ordersApis.getOrdersById(id);
      return res.data;
    },
    enabled: !!id, // Only run if id exists
    retry: (failureCount, error) => {
      // Don't retry on 404 errors
      if (
        error.message.includes("404") ||
        error.message.includes("Order not found")
      ) {
        return false;
      }
      return failureCount < 2;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation<OrderResponse, Error, UpdateOrderStatusParams>({
    mutationFn: ordersApis.updateOrderStatus,

    onMutate: async (variables) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({
        queryKey: ["orderDetails", variables.id],
      });
      await queryClient.cancelQueries({ queryKey: ["orders"] });

      // Snapshot previous values
      const previousOrder = queryClient.getQueryData([
        "orderDetails",
        variables.id,
      ]);
      const previousOrders = queryClient.getQueryData(["orders"]);

      // Optimistically update ONLY the status (not timestamps)
      if (previousOrder) {
        queryClient.setQueryData(
          ["orderDetails", variables.id],
          (old: any) => ({
            ...old,
            order: {
              ...old.order,
              status: variables.status,
              ...(variables.cancellationReason && {
                cancellationReason: variables.cancellationReason,
              }),
              // Only update paymentStatus if we know the server will update it
              // ...(variables.status === "COMPLETED" &&
              //   old.order.paymentStatus === "PENDING" && {
              //     paymentStatus: "PAID",
              //   }),
              // ...(variables.status === "CANCELLED" &&
              //   old.order.paymentStatus === "PAID" && {
              //     paymentStatus: "REFUNDED",
              //   }),
            },
          })
        );
      }

      // Optimistically update in orders list
      if (previousOrders) {
        queryClient.setQueryData(["orders"], (old: any) =>
          Array.isArray(old)
            ? old.map((order: any) =>
                order.id === variables.id
                  ? {
                      ...order,
                      status: variables.status,
                      // Optional: Update paymentStatus for list view too
                      // ...(variables.status === "COMPLETED" &&
                      //   order.paymentStatus === "PENDING" && {
                      //     paymentStatus: "PAID",
                      //   }),
                      // ...(variables.status === "CANCELLED" &&
                      //   order.paymentStatus === "PAID" && {
                      //     paymentStatus: "REFUNDED",
                      //   }),
                    }
                  : order
              )
            : old
        );
      }

      return { previousOrder, previousOrders };
    },

    onError: (error, variables, context: any) => {
      if (context?.previousOrder) {
        queryClient.setQueryData(
          ["orderDetails", variables.id],
          context.previousOrder
        );
      }
      if (context?.previousOrders) {
        queryClient.setQueryData(["orders"], context.previousOrders);
      }
    },

    onSettled: (data, error, variables) => {
      // Invalidate queries to refetch fresh data from server
      queryClient.invalidateQueries({
        queryKey: ["orderDetails", variables.id],
      });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },

    onSuccess: (data) => {
      console.log("Order status updated:", data.message);
    },
  });
};

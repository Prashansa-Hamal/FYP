import { OrderDetail } from "@/types/orderDetails";
import {
  OrderFilters,
  OrderResponse,
  OrdersResponse,
  PlaceOrderRequest,
  PlaceOrderResponse,
  UpdateOrderPaymentStatusParams,
  UpdateOrderStatusParams,
} from "@/types/orders";
import { ApiResponse } from "@/types/response";

export const ordersApis = {
  async getOrders({
    page = 1,
    limit = 10,
    search,
    status,
    paymentStatus,
    orderType,
    startDate,
    endDate,
    userId,
  }: OrderFilters): Promise<OrdersResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (search) params.set("search", search);

    // Handle array parameters
    if (status) {
      if (Array.isArray(status)) {
        if (status.length > 0) params.set("status", status.join(","));
      } else {
        params.set("status", status);
      }
    }

    if (paymentStatus) {
      if (Array.isArray(paymentStatus)) {
        if (paymentStatus.length > 0)
          params.set("paymentStatus", paymentStatus.join(","));
      } else {
        params.set("paymentStatus", paymentStatus);
      }
    }

    if (orderType) {
      if (Array.isArray(orderType)) {
        if (orderType.length > 0) params.set("orderType", orderType.join(","));
      } else {
        params.set("orderType", orderType);
      }
    }

    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    if (userId) params.set("userId", userId);

    const response = await fetch(`/api/orders?${params.toString()}`);

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: "Failed to fetch orders",
      }));
      throw new Error(
        error.message || `HTTP ${response.status}: Failed to fetch orders`
      );
    }

    return response.json();
  },

  async getOrdersById(id: string): Promise<ApiResponse<OrderDetail>> {
    const response = await fetch(`/api/orders/${id}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: "Failed to fetch order details",
      }));
      throw new Error(
        errorData.message ||
          `HTTP ${response.status}: Failed to fetch order details`
      );
    }

    return response.json();
  },

  async placeOrder(orderData: PlaceOrderRequest): Promise<PlaceOrderResponse> {
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
  },

  async updateOrderStatus({
    id,
    status,
    cancellationReason,
  }: UpdateOrderStatusParams): Promise<OrderResponse> {
    const response = await fetch("/api/orders/status", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, status, cancellationReason }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update order status");
    }

    return response.json();
  },
  async updateOrderPaymentStatus({
    id,
    paymentMethod,
  }: UpdateOrderPaymentStatusParams): Promise<OrderResponse> {
    const response = await fetch("/api/orders/payment", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, paymentMethod }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update order status");
    }

    return response.json();
  },
};

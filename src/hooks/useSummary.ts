interface CartItemSummary {
  id: string;
  cartItemId: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string | null;
  category?: string | null;
  total: number;
  isAvailable: boolean;
}

interface UnavailableCartItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  reason: string;
}

interface DeliveryAddress {
  id: string;
  name: string;
  phone: string;
  city: string;
  street: string;
  state: string;
  country: string;
  postalCode: string;
}

interface CartSummary {
  deliveryAddress: DeliveryAddress;
  specialInstruction?: string | null;
  itemCount: number;
  subtotal: number;
  vatAmount: number;
  discountAmount: number;
  totalAmount: number;
  items: CartItemSummary[];
  unavailableItems: UnavailableCartItem[];
}

interface Cart {
  id: string;
  userId?: string | null;
  sessionId?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface CartSummaryResponse {
  success: boolean;
  message: string;
  cart: Cart | null;
  summary: CartSummary;
}

interface CartSummaryError {
  success: false;
  message: string;
  error?: string;
}

import { OrderType } from "@/types/enums";
import { useQuery } from "@tanstack/react-query";

const CART_QUERY_KEY = "cart";

interface FetchCartSummaryPayload {
  addressId?: string;
  specialInstruction?: string;
  orderType: OrderType;
}

export const fetchCartSummary = async (
  data: FetchCartSummaryPayload,
): Promise<CartSummaryResponse> => {
  const response = await fetch("/api/cart/summary", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData: CartSummaryError = await response.json();
    throw new Error(errorData.message || "Failed to fetch cart summary");
  }

  return response.json();
};

// Just this one hook is enough to start
export const useCartSummary = (data: FetchCartSummaryPayload) => {
  return useQuery<CartSummaryResponse, Error>({
    queryKey: [CART_QUERY_KEY, "summary"],
    queryFn: () => fetchCartSummary(data),
  });
};

// interface CartItemSummary {
//   id: string;
//   cartItemId: string;
//   menuItemId: string;
//   name: string;
//   price: number;
//   quantity: number;
//   imageUrl?: string | null;
//   category?: string | null;
//   total: number;
//   isAvailable: boolean;
// }

// interface UnavailableCartItem {
//   id: string;
//   menuItemId: string;
//   name: string;
//   price: number;
//   quantity: number;
//   reason: string;
// }

// interface DeliveryAddress {
//   id: string;
//   name: string;
//   phone: string;
//   city: string;
//   street: string;
//   state: string;
//   country: string;
//   postalCode: string;
// }

// interface CartSummary {
//   deliveryAddress: DeliveryAddress;
//   specialInstruction?: string | null;
//   itemCount: number;
//   subtotal: number;
//   vatAmount: number;
//   discountAmount: number;
//   loyaltyDiscountAmount: number;
//   totalAmount: number;
//   items: CartItemSummary[];
//   unavailableItems: UnavailableCartItem[];
// }

// interface Cart {
//   id: string;
//   userId?: string | null;
//   sessionId?: string | null;
//   createdAt: string;
//   updatedAt: string;
// }

// interface CartSummaryResponse {
//   success: boolean;
//   message: string;
//   cart: Cart | null;
//   summary: CartSummary;
// }

// interface CartSummaryError {
//   success: false;
//   message: string;
//   error?: string;
// }

// import { OrderType } from "@/types/enums";
// import { useQuery } from "@tanstack/react-query";

// const CART_QUERY_KEY = "cart";

// interface FetchCartSummaryPayload {
//   addressId?: string;
//   specialInstruction?: string;
//   orderType: OrderType;
// }

// export const fetchCartSummary = async (
//   data: FetchCartSummaryPayload,
// ): Promise<CartSummaryResponse> => {
//   const response = await fetch("/api/cart/summary", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     credentials: "include",
//     body: JSON.stringify(data),
//   });

//   if (!response.ok) {
//     const errorData: CartSummaryError = await response.json();
//     throw new Error(errorData.message || "Failed to fetch cart summary");
//   }

//   return response.json();
// };

// // Just this one hook is enough to start
// export const useCartSummary = (data: FetchCartSummaryPayload) => {
//   return useQuery<CartSummaryResponse, Error>({
//     queryKey: [CART_QUERY_KEY, "summary"],
//     queryFn: () => fetchCartSummary(data),
//   });
// };

// types/cart.types.ts
export interface CartItemSummary {
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

export interface UnavailableCartItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  reason: string;
}

export interface DeliveryAddress {
  id: string;
  name: string;
  phone: string;
  city: string;
  street: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface CartSummary {
  deliveryAddress: DeliveryAddress | null;
  specialInstruction?: string | null;
  itemCount: number;
  subtotal: number;
  vatAmount: number;
  discountAmount: number;
  loyaltyDiscountAmount: number;
  totalAmount: number;
  // Loyalty points info
  loyaltyPointsUsed: number;
  loyaltyPointsRemaining: number;
  pointsEarned: number;
  items: CartItemSummary[];
  unavailableItems: UnavailableCartItem[];
}

export interface Cart {
  id: string;
  userId?: string | null;
  sessionId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CartSummaryResponse {
  success: boolean;
  message: string;
  cart: Cart | null;
  summary: CartSummary;
}

export interface CartSummaryError {
  success: false;
  message: string;
  error?: string;
}

// hooks/useCartSummary.ts
import { OrderType } from "@/types/enums";
import { useQuery } from "@tanstack/react-query";

const CART_QUERY_KEY = "cart";

export interface FetchCartSummaryPayload {
  addressId?: string;
  specialInstruction?: string;
  orderType: OrderType;
  isPointsApplied?: boolean; //  Added loyalty points flag
  tableNumber?: number; //  For dine-in orders
  paymentMethod?: string; // For payment method tracking
}

/**
 * Fetch cart summary with loyalty points discount
 */
export const fetchCartSummary = async (
  data: FetchCartSummaryPayload,
): Promise<CartSummaryResponse> => {
  const response = await fetch("/api/cart/summary", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      addressId: data.addressId,
      orderType: data.orderType,
      specialInstruction: data.specialInstruction,
      isPointsApplied: data.isPointsApplied ?? false, // Default to false
      tableNumber: data.tableNumber,
      paymentMethod: data.paymentMethod,
    }),
  });

  if (!response.ok) {
    const errorData: CartSummaryError = await response.json();
    throw new Error(errorData.message || "Failed to fetch cart summary");
  }

  return response.json();
};

/**
 * Hook to get cart summary with loyalty points integration
 *
 * @example
 * const { data, isLoading, error, refetch } = useCartSummary({
 *   orderType: "DINE_IN",
 *   isPointsApplied: true,
 * });
 *
 * // Access loyalty info
 * const discount = data?.summary.loyaltyDiscountAmount;
 * const pointsUsed = data?.summary.loyaltyPointsUsed;
 * const pointsRemaining = data?.summary.loyaltyPointsRemaining;
 * const pointsEarned = data?.summary.pointsEarned;
 */
export const useCartSummary = (data: FetchCartSummaryPayload) => {
  return useQuery<CartSummaryResponse, Error>({
    queryKey: [
      CART_QUERY_KEY,
      "summary",
      data.orderType,
      data.isPointsApplied,
      data.addressId,
    ],
    queryFn: () => fetchCartSummary(data),
    // Only run if orderType is provided
    enabled: !!data.orderType,
    // Cache for 5 minutes
    staleTime: 5 * 60 * 1000,
    // Refetch when window refocuses (optional)
    refetchOnWindowFocus: false,
  });
};

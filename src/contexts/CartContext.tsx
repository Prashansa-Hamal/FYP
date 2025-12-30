import React, { createContext, useContext, useCallback } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  UseMutationResult,
} from "@tanstack/react-query";
import { cartApi } from "@/lib/api/cart";
import { Cart, CartItem, CartApiResponse } from "@/types/cart";
import { toast } from "sonner";

interface CartContextType {
  cart: Cart | null;
  cartItems: CartItem[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  addItem: UseMutationResult<
    CartApiResponse<Cart | null>,
    Error,
    { menuItemId: string; quantity?: number }
  >;
  updateQuantity: UseMutationResult<
    CartApiResponse<Cart | null>,
    Error,
    { menuItemId: string; quantity: number }
  >;
  removeItem: UseMutationResult<
    CartApiResponse<{ message: string }>,
    Error,
    string
  >;
  clearCart: UseMutationResult<
    CartApiResponse<{ message: string }>,
    Error,
    void
  >;
  refetchCart: () => void;
  getItemQuantity: (menuItemId: string) => number;
  getCartTotal: () => number;
  getItemCount: () => number;
  isItemInCart: (menuItemId: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

interface CartProviderProps {
  children: React.ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const queryClient = useQueryClient();

  const {
    data: cartResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const response = await cartApi.getCart();
      if (!response.success) {
        throw new Error(response.message || "Failed to fetch cart");
      }
      return response.data;
    },
    staleTime: 1000 * 60,
  });

  const cart = cartResponse || null;
  const cartItems = cart?.items || [];

  // Helper functions (keep the same)
  const getItemQuantity = useCallback(
    (menuItemId: string): number => {
      const item = cartItems.find((item) => item.menuItemId === menuItemId);
      return item ? item.quantity : 0;
    },
    [cartItems]
  );

  const isItemInCart = useCallback(
    (menuItemId: string): boolean => {
      return getItemQuantity(menuItemId) > 0;
    },
    [getItemQuantity]
  );

  const getCartTotal = useCallback((): number => {
    return cartItems.reduce((total, item) => {
      const price = item.menuItem?.price || 0;
      return total + price * item.quantity;
    }, 0);
  }, [cartItems]);

  const getItemCount = useCallback((): number => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cartItems]);

  //  Return full response, handle success/error in onSuccess
  const addItemMutation = useMutation({
    mutationFn: async (data: { menuItemId: string; quantity?: number }) => {
      const response = await cartApi.addItem(data);
      return response; // Return full response
    },
    onSuccess: (response, variables) => {
      if (response.success) {
        queryClient.setQueryData(["cart"], response.data);
        // Use server message or fallback
        toast.success(response.message || "Item added to cart");
      } else {
        //  Server returned success: false
        toast.error(response.message || "Failed to add item");
      }
    },
    onError: (error: Error) => {
      // Network or fetch error
      toast.error(error.message || "Failed to add item to cart");
    },
  });

  //  Return full response
  const updateQuantityMutation = useMutation({
    mutationFn: async (data: { menuItemId: string; quantity: number }) => {
      const response = await cartApi.updateQuantity(data);
      return response; // Return full response
    },
    onSuccess: (response, variables) => {
      if (response.success) {
        queryClient.setQueryData(["cart"], response.data);
        //  Use server message or fallback
        toast.success(
          response.message ||
            (variables.quantity === 0
              ? "Item removed from cart"
              : "Quantity updated")
        );
      } else {
        //  Server returned success: false
        toast.error(response.message || "Failed to update quantity");
      }
    },
    onError: (error: Error) => {
      // Network or fetch error
      toast.error(error.message || "Failed to update quantity");
    },
  });

  //  Return full response
  const removeItemMutation = useMutation({
    mutationFn: async (menuItemId: string) => {
      const response = await cartApi.removeItem(menuItemId);
      return response; // Return full response
    },
    onSuccess: (response, menuItemId) => {
      if (response.success) {
        // Update cache manually for better UX
        queryClient.setQueryData(["cart"], (oldData: Cart | null) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            items: oldData.items.filter(
              (item) => item.menuItemId !== menuItemId
            ),
          };
        });
        //  Use server message or fallback
        toast.success(response.message || "Item removed from cart");
      } else {
        //  Server returned success: false
        toast.error(response.message || "Failed to remove item");
      }
    },
    onError: (error: Error) => {
      // Network or fetch error
      toast.error(error.message || "Failed to remove item");
    },
  });

  //  Return full response
  const clearCartMutation = useMutation({
    mutationFn: async () => {
      const response = await cartApi.clearCart();
      return response; // Return full response
    },
    onSuccess: (response) => {
      if (response.success) {
        queryClient.setQueryData(["cart"], null);
        //  Use server message or fallback
        toast.success(response.message || "Cart cleared");
      } else {
        //  Server returned success: false
        toast.error(response.message || "Failed to clear cart");
      }
    },
    onError: (error: Error) => {
      // Network or fetch error
      toast.error(error.message || "Failed to clear cart");
    },
  });

  const value: CartContextType = {
    cart,
    cartItems,
    isLoading,
    isError,
    error,
    addItem: addItemMutation,
    updateQuantity: updateQuantityMutation,
    removeItem: removeItemMutation,
    clearCart: clearCartMutation,
    refetchCart: refetch,
    getItemQuantity,
    getCartTotal,
    getItemCount,
    isItemInCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

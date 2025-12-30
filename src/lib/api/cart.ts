import { Cart, CartApiResponse } from "@/types/cart";

export const cartApi = {
  async getCart(): Promise<CartApiResponse<Cart | null>> {
    const res = await fetch("/api/cart", {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch cart: ${res.status}`);
    }

    return res.json();
  },

  async addItem(data: {
    menuItemId: string;
    quantity?: number;
  }): Promise<CartApiResponse<Cart | null>> {
    const res = await fetch("/api/cart", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        menuItemId: data.menuItemId,
        quantity: data.quantity || 1,
      }),
    });

    if (!res.ok) {
      throw new Error(`Failed to add item: ${res.status}`);
    }

    return res.json();
  },

  async updateQuantity(data: {
    menuItemId: string;
    quantity: number;
  }): Promise<CartApiResponse<Cart | null>> {
    const res = await fetch("/api/cart", {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error(`Failed to update quantity: ${res.status}`);
    }

    return res.json();
  },

  async removeItem(
    menuItemId: string
  ): Promise<CartApiResponse<{ message: string }>> {
    const res = await fetch("/api/cart", {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ menuItemId }),
    });

    if (!res.ok) {
      throw new Error(`Failed to remove item: ${res.status}`);
    }

    return res.json();
  },

  async clearCart(): Promise<CartApiResponse<{ message: string }>> {
    const res = await fetch("/api/cart", {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to clear cart: ${res.status}`);
    }

    return res.json();
  },
};

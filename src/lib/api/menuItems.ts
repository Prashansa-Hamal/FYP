// File: /lib/api/menuItems.ts

import { MenuItem } from "@/generated/client";
import {
  CreateMenuItemInput,
  MenuItemApiResponse,
  MenuItemFilters,
  PaginatedResponse,
  UpdateMenuItemInput,
} from "@/types/menuItems";

// API functions
export const menuItemsApi = {
  // Get all menu items
  async getAll(
    filters: MenuItemFilters = {},
  ): Promise<PaginatedResponse<MenuItem>> {
    const queryParams = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, String(value));
      }
    });

    const response = await fetch(`/api/menu-items?${queryParams.toString()}`);

    if (!response.ok) {
      throw new Error("Failed to fetch menu items");
    }

    return response.json();
  },

  // Get single menu item
  async getById(id: string): Promise<MenuItemApiResponse<MenuItem>> {
    const response = await fetch(`/api/menu-items/${id}`);

    if (!response.ok) {
      throw new Error("Failed to fetch menu item");
    }

    return response.json();
  },

  // Create menu item
  async create(
    data: CreateMenuItemInput,
  ): Promise<MenuItemApiResponse<MenuItem>> {
    const response = await fetch("/api/menu-items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to create menu item");
    }

    return response.json();
  },

  // Update menu item
  async update(
    id: string,
    data: UpdateMenuItemInput,
  ): Promise<MenuItemApiResponse<MenuItem>> {
    const response = await fetch(`/api/menu-items/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to update menu item");
    }

    return response.json();
  },

  // Delete menu item
  async delete(id: string): Promise<MenuItemApiResponse<void>> {
    const response = await fetch(`/api/menu-items`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    if (!response.ok) {
      throw new Error("Failed to delete menu item");
    }

    return response.json();
  },

  // Toggle availability
  async toggleAvailability(
    id: string,
    isAvailable: boolean,
  ): Promise<MenuItemApiResponse<MenuItem>> {
    const response = await fetch(`/api/menu-items`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isAvailable }),
    });

    if (!response.ok) {
      throw new Error("Failed to update availability");
    }

    return response.json();
  },
};

// File: /lib/hooks/useMenuItems.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  menuItemsApi,
  type MenuItemFilters,
  type UpdateMenuItemInput,
} from "@/lib/api/menuItems";

// Query keys
export const menuItemKeys = {
  all: ["menuItems"] as const,
  lists: () => [...menuItemKeys.all, "list"] as const,
  list: (filters: MenuItemFilters) =>
    [...menuItemKeys.lists(), filters] as const,
  details: () => [...menuItemKeys.all, "detail"] as const,
  detail: (id: string) => [...menuItemKeys.details(), id] as const,
};

// Query hooks
export function useMenuItems(filters: MenuItemFilters = {}) {
  return useQuery({
    queryKey: menuItemKeys.list(filters),
    queryFn: () => menuItemsApi.getAll(filters),
  });
}

export function useMenuItem(id: string) {
  return useQuery({
    queryKey: menuItemKeys.detail(id),
    queryFn: () => menuItemsApi.getById(id),
    enabled: !!id,
  });
}

// Mutation hooks
export function useCreateMenuItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: menuItemsApi.create,
    onSuccess: () => {
      // Invalidate all menu item lists
      queryClient.invalidateQueries({ queryKey: menuItemKeys.lists() });
    },
  });
}

export function useUpdateMenuItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMenuItemInput }) =>
      menuItemsApi.update(id, data),
    onSuccess: (data, variables) => {
      // Invalidate the specific item
      queryClient.invalidateQueries({
        queryKey: menuItemKeys.detail(variables.id),
      });
      // Invalidate all lists
      queryClient.invalidateQueries({ queryKey: menuItemKeys.lists() });
    },
  });
}

export function useDeleteMenuItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => menuItemsApi.delete(id),
    onSuccess: (_, id) => {
      // Remove the item from cache
      queryClient.removeQueries({ queryKey: menuItemKeys.detail(id) });
      // Invalidate all lists
      queryClient.invalidateQueries({ queryKey: menuItemKeys.lists() });
    },
  });
}

export function useToggleMenuItemAvailability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isAvailable }: { id: string; isAvailable: boolean }) =>
      menuItemsApi.toggleAvailability(id, isAvailable),
    onSuccess: (data, variables) => {
      // Invalidate the specific item
      queryClient.invalidateQueries({
        queryKey: menuItemKeys.detail(variables.id),
      });
      // Invalidate all lists
      queryClient.invalidateQueries({ queryKey: menuItemKeys.lists() });
    },
  });
}

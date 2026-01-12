// File: /lib/hooks/useMenuItems.ts
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { menuItemsApi } from "@/lib/api/menuItems";
import { toast } from "sonner";
import {
  type MenuItemFilters,
  type UpdateMenuItemInput,
} from "@/types/menuItems";

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
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });
}

export function useMenuItemDetail(id: string) {
  return useQuery({
    queryKey: menuItemKeys.detail(id),
    queryFn: async () => {
      const res = await menuItemsApi.getById(id);
      return res.data;
    },
    enabled: !!id,
  });
}

// Mutation hooks
export function useCreateMenuItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: menuItemsApi.create,
    onSuccess: (response) => {
      // Invalidate all menu item lists
      queryClient.invalidateQueries({ queryKey: menuItemKeys.lists() });
      toast.success("Menu item created succesfully");
    },
    onError: () => {
      toast.error("Failed to create menu item");
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
      toast.success("Menu item updated succesfully");
    },
    onError: () => {
      toast.error("Failed to update menu item");
    },
  });
}

export function useDeleteMenuItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => menuItemsApi.delete(id),
    onSuccess: (_, id, response) => {
      // Remove the item from cache
      queryClient.removeQueries({ queryKey: menuItemKeys.detail(id) });
      // Invalidate all lists
      queryClient.invalidateQueries({ queryKey: menuItemKeys.lists() });
      toast.success("Menu item deleted succesfully");
    },
    onError: () => {
      toast.error("Failed to delete Menu item");
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
      toast.success("Menu item availability toggled succesfully");
    },
    onError: () => {
      toast.error("Failed to toggle Availability");
    },
  });
}

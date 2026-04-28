import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  NotificationsResponse,
  MarkAsReadResponse,
  Notification,
} from "@/types/notification";

// Fetch notifications
async function fetchNotifications(params?: {
  page?: number;
  limit?: number;
  type?: string;
  unreadOnly?: boolean;
}): Promise<NotificationsResponse> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.limit) searchParams.append("limit", params.limit.toString());
  if (params?.type) searchParams.append("type", params.type);
  if (params?.unreadOnly) searchParams.append("unreadOnly", "true");

  const response = await fetch(`/api/notifications?${searchParams.toString()}`);

  if (!response.ok) {
    throw new Error("Failed to fetch notifications");
  }

  return response.json();
}

// Mark notification as read
async function markAsRead(notificationId: string): Promise<MarkAsReadResponse> {
  const response = await fetch(`/api/notifications/${notificationId}/read`, {
    method: "PATCH",
  });

  if (!response.ok) {
    throw new Error("Failed to mark notification as read");
  }

  return response.json();
}

// Mark all as read
async function markAllAsRead(): Promise<MarkAsReadResponse> {
  const response = await fetch("/api/notifications/read-all", {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Failed to mark all notifications as read");
  }

  return response.json();
}

// React Query Hooks
export function useNotifications(params?: {
  page?: number;
  limit?: number;
  type?: string;
  unreadOnly?: boolean;
}) {
  return useQuery({
    queryKey: ["notifications", params],
    queryFn: () => fetchNotifications(params),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ["notifications", "unread"],
    queryFn: () => fetchNotifications({ unreadOnly: true, limit: 1 }),
    staleTime: 10 * 1000,
    refetchInterval: 30 * 1000,
    select: (data) => data.data.unreadCount,
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Notification marked as read");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("All notifications marked as read");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

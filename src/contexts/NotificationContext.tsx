"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

import {
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
} from "@/hooks/useNotifications";

import { Notification } from "@/types/notification";
import { toast } from "sonner";

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refetch: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export function useNotificationContext() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error(
      "useNotificationContext must be used within a NotificationProvider",
    );
  }

  return context;
}

interface NotificationProviderProps {
  children: React.ReactNode;
}

/* -------------------------------------------------------------------------- */
/*                            LOCAL STORAGE HELPERS                           */
/* -------------------------------------------------------------------------- */

const TOASTED_STORAGE_KEY = "toasted-notification-ids";

const getToastedIds = (): Set<string> => {
  if (typeof window === "undefined") {
    return new Set();
  }

  try {
    const stored = localStorage.getItem(TOASTED_STORAGE_KEY);

    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch {
    return new Set();
  }
};

const saveToastedIds = (ids: Set<string>) => {
  if (typeof window === "undefined") return;

  localStorage.setItem(TOASTED_STORAGE_KEY, JSON.stringify(Array.from(ids)));
};

/* -------------------------------------------------------------------------- */
/*                               TOAST HELPERS                                */
/* -------------------------------------------------------------------------- */

const showNotificationToast = (
  title: string,
  message: string,
  type: string,
  icon: string,
) => {
  const toastOptions = {
    description: message,
    duration: 5000,
    icon,
  };

  switch (type) {
    case "ORDER_PLACED":
    case "ORDER_CONFIRMED":
    case "PAYMENT_RECEIVED":
    case "LOYALTY_POINTS_EARNED":
    case "RESERVATION_CONFIRMED":
      toast.success(title, toastOptions);
      break;

    case "ORDER_CANCELLED":
    case "PAYMENT_FAILED":
    case "RESERVATION_CANCELLED":
      toast.error(title, {
        ...toastOptions,
        duration: 6000,
      });
      break;

    case "ORDER_READY":
    case "ORDER_SERVED":
      toast.info(title, {
        ...toastOptions,
        duration: 8000,
      });
      break;

    default:
      toast.info(title, toastOptions);
  }
};

const getToastIcon = (type: string): string => {
  switch (type) {
    case "ORDER_PLACED":
      return "🛒";

    case "ORDER_READY":
      return "✅";

    case "ORDER_CANCELLED":
      return "❌";

    case "PAYMENT_RECEIVED":
      return "💰";

    case "PAYMENT_FAILED":
      return "⚠️";

    case "LOYALTY_POINTS_EARNED":
      return "⭐";

    case "LOYALTY_POINTS_REDEEMED":
      return "🎁";

    case "RESERVATION_CONFIRMED":
      return "📅";

    case "RESERVATION_CANCELLED":
      return "❌";

    default:
      return "🔔";
  }
};

/* -------------------------------------------------------------------------- */
/*                            NOTIFICATION PROVIDER                           */
/* -------------------------------------------------------------------------- */

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const { data, isLoading, refetch } = useNotifications({
    limit: 50,
  });

  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();

  /* ------------------------------- POLLING -------------------------------- */

  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 10000);

    return () => clearInterval(interval);
  }, [refetch]);

  /* ------------------------- HANDLE NEW NOTIFICATIONS ---------------------- */

  useEffect(() => {
    if (!data?.data?.notifications) return;

    const fetchedNotifications = data.data.notifications;

    setNotifications(fetchedNotifications);

    const toastedIds = getToastedIds();

    // Only show toast for unread notifications
    // that have NOT already been toasted
    const newUnreadNotifications = fetchedNotifications.filter(
      (notification) =>
        !notification.isRead && !toastedIds.has(notification.id),
    );

    newUnreadNotifications.forEach((notification: Notification) => {
      toastedIds.add(notification.id);

      const icon = getToastIcon(notification.type);

      showNotificationToast(
        notification.title,
        notification.message,
        notification.type,
        icon,
      );
    });

    saveToastedIds(toastedIds);
  }, [data]);

  /* ----------------------------- UNREAD COUNT ------------------------------ */

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead,
  ).length;

  /* ----------------------------- MARK AS READ ------------------------------ */

  const handleMarkAsRead = useCallback(
    async (id: string) => {
      await markAsReadMutation.mutateAsync(id);

      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id
            ? {
                ...notification,
                isRead: true,
              }
            : notification,
        ),
      );
    },
    [markAsReadMutation],
  );

  /* --------------------------- MARK ALL AS READ ---------------------------- */

  const handleMarkAllAsRead = useCallback(async () => {
    await markAllAsReadMutation.mutateAsync();

    setNotifications((prev) =>
      prev.map((notification) => ({
        ...notification,
        isRead: true,
      })),
    );

    // Clear stored toasted notifications
    localStorage.removeItem(TOASTED_STORAGE_KEY);
  }, [markAllAsReadMutation]);

  /* -------------------------------- VALUE --------------------------------- */

  const value = {
    notifications,
    unreadCount,
    isLoading,
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
    refetch,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

"use client";

import { useState } from "react";
import { Bell, CheckCheck, X } from "lucide-react";
import { useNotificationContext } from "@/contexts/NotificationContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { unreadCount, notifications, markAsRead, markAllAsRead, isLoading } =
    useNotificationContext();

  const totalUnread = unreadCount || 0;

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const getNotificationIcon = (type: string) => {
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
      default:
        return "🔔";
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label="Go back to categories"
          className=" bg-white/40 hover:bg-white backdrop-blur-sm  rounded-full h-10 w-10 shadow-lg transition-all duration-200 sticky top-3 ml-3 z-50 left-3"
        >
          {" "}
          <Bell className="w-5 h-5 text-gray-700" />
          {totalUnread > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-amber-500 text-white text-xs rounded-full">
              {totalUnread > 9 ? "9+" : totalUnread}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-96 p-0 flex flex-col relative"
      >
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="font-semibold text-gray-900">Notifications</h3>
          {totalUnread > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="text-xs text-amber-600 hover:text-amber-700"
            >
              <CheckCheck className="w-3 h-3 mr-1" />
              Mark all as read
            </Button>
          )}
        </div>

        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">
              No notifications
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  "p-3 border-b hover:bg-gray-50 transition-colors cursor-pointer",
                  !notification.isRead && "bg-amber-50/30",
                )}
                onClick={() =>
                  !notification.isRead && handleMarkAsRead(notification.id)
                }
              >
                <div className="flex items-start gap-3">
                  <div className="text-xl">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-gray-900">
                        {notification.title}
                      </p>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-amber-500 rounded-full flex-shrink-0 mt-1" />
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {format(
                        new Date(notification.createdAt),
                        "MMM dd, hh:mm a",
                      )}
                    </p>
                    {notification.order && (
                      <p className="text-xs text-amber-600 mt-1">
                        Order #{notification.order.orderNumber}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </ScrollArea>

        {notifications.length > 0 && (
          <div className="p-2 border-t text-center fixed bottom-0 bg-white w-full">
            <a
              href="/notifications"
              className="text-xs text-amber-600 hover:text-amber-700"
            >
              View all notifications
            </a>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

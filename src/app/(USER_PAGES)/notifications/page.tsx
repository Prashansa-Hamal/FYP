"use client";

import { useState } from "react";
import {
  MapPin,
  Phone,
  Wifi,
  Bell,
  CheckCheck,
  Trash2,
  Filter,
  Calendar,
  Clock,
  Package,
  CreditCard,
  Award,
  Calendar as CalendarIcon,
  XCircle,
  CheckCircle,
  AlertCircle,
  Info,
  ShoppingBag,
  Utensils,
  Truck,
  Star,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import Link from "next/link";
import {
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
} from "@/hooks/useNotifications";
import { NotificationType, Notification } from "@/types/notification";

// Notification icon mapping
const getNotificationIcon = (type: NotificationType) => {
  const iconMap: Record<NotificationType, any> = {
    ORDER_PLACED: ShoppingBag,
    ORDER_CONFIRMED: CheckCircle,
    ORDER_PREPARING: Utensils,
    ORDER_READY: Package,
    ORDER_SERVED: CheckCircle,
    ORDER_COMPLETED: CheckCircle,
    ORDER_CANCELLED: XCircle,
    PAYMENT_RECEIVED: CreditCard,
    PAYMENT_FAILED: AlertCircle,
    RESERVATION_CONFIRMED: CalendarIcon,
    RESERVATION_CANCELLED: XCircle,
    LOYALTY_POINTS_EARNED: Star,
    LOYALTY_POINTS_REDEEMED: Award,
    GENERAL_ANNOUNCEMENT: Info,
    TABLE_STATUS_UPDATE: Info,
    STAFF_ASSIGNMENT: Info,
    KITCHEN_ORDER: Utensils,
    BAR_ORDER: Coffee,
  };
  const Icon = iconMap[type] || Bell;
  return Icon;
};

const getNotificationColor = (type: NotificationType) => {
  const colorMap: Record<NotificationType, string> = {
    ORDER_PLACED: "text-blue-500 bg-blue-50",
    ORDER_CONFIRMED: "text-green-500 bg-green-50",
    ORDER_PREPARING: "text-orange-500 bg-orange-50",
    ORDER_READY: "text-green-500 bg-green-50",
    ORDER_SERVED: "text-purple-500 bg-purple-50",
    ORDER_COMPLETED: "text-gray-500 bg-gray-50",
    ORDER_CANCELLED: "text-red-500 bg-red-50",
    PAYMENT_RECEIVED: "text-green-500 bg-green-50",
    PAYMENT_FAILED: "text-red-500 bg-red-50",
    RESERVATION_CONFIRMED: "text-blue-500 bg-blue-50",
    RESERVATION_CANCELLED: "text-red-500 bg-red-50",
    LOYALTY_POINTS_EARNED: "text-amber-500 bg-amber-50",
    LOYALTY_POINTS_REDEEMED: "text-amber-500 bg-amber-50",
    GENERAL_ANNOUNCEMENT: "text-gray-500 bg-gray-50",
    TABLE_STATUS_UPDATE: "text-blue-500 bg-blue-50",
    STAFF_ASSIGNMENT: "text-purple-500 bg-purple-50",
    KITCHEN_ORDER: "text-orange-500 bg-orange-50",
    BAR_ORDER: "text-amber-500 bg-amber-50",
  };
  return colorMap[type] || "text-gray-500 bg-gray-50";
};

const getNotificationTitle = (type: NotificationType): string => {
  const titleMap: Record<NotificationType, string> = {
    ORDER_PLACED: "Order Placed",
    ORDER_CONFIRMED: "Order Confirmed",
    ORDER_PREPARING: "Order Being Prepared",
    ORDER_READY: "Order Ready",
    ORDER_SERVED: "Order Served",
    ORDER_COMPLETED: "Order Completed",
    ORDER_CANCELLED: "Order Cancelled",
    PAYMENT_RECEIVED: "Payment Received",
    PAYMENT_FAILED: "Payment Failed",
    RESERVATION_CONFIRMED: "Reservation Confirmed",
    RESERVATION_CANCELLED: "Reservation Cancelled",
    LOYALTY_POINTS_EARNED: "Loyalty Points Earned",
    LOYALTY_POINTS_REDEEMED: "Points Redeemed",
    GENERAL_ANNOUNCEMENT: "Announcement",
    TABLE_STATUS_UPDATE: "Table Update",
    STAFF_ASSIGNMENT: "Staff Assignment",
    KITCHEN_ORDER: "Kitchen Order",
    BAR_ORDER: "Bar Order",
  };
  return titleMap[type] || "Notification";
};

import { Coffee } from "lucide-react";

export default function NotificationsPage() {
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const limit = 20;

  const { data, isLoading, refetch } = useNotifications({
    page,
    limit,
    type: typeFilter !== "all" ? typeFilter : undefined,
    unreadOnly: unreadOnly || undefined,
  });

  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();

  const notifications = data?.data.notifications || [];
  const unreadCount = data?.data.unreadCount || 0;
  const pagination = data?.pagination;

  const handleMarkAsRead = async (id: string) => {
    await markAsRead.mutateAsync(id);
    refetch();
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead.mutateAsync();
    refetch();
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f1ed] to-[#e8e3dd] p-2 sm:p-4">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Hero Header */}
          <div className="relative bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Bell className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Notifications</h1>
                  <p className="text-white/90 text-sm">
                    Stay updated with your orders and activities
                  </p>
                </div>
              </div>
              {unreadCount > 0 && (
                <Button
                  onClick={handleMarkAllAsRead}
                  disabled={markAllAsRead.isPending}
                  variant="outline"
                  className="bg-white/20 hover:bg-white/30 text-white border-0"
                >
                  <CheckCheck className="w-4 h-4 mr-2" />
                  Mark all as read ({unreadCount})
                </Button>
              )}
            </div>
          </div>

          {/* Restaurant Info Bar */}
          <div className="bg-gray-50 border-b border-gray-100 px-4 py-3">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-500" />
                <span className="hidden sm:inline">
                  123 Main Street, Kathmandu
                </span>
                <span className="sm:hidden">Kathmandu</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-500" />
                <span>+977 9801234567</span>
              </div>
              <div className="flex items-center gap-2">
                <Wifi className="w-4 h-4 text-amber-500" />
                <span className="hidden sm:inline">WiFi: DineEase</span>
                <span className="sm:hidden">WiFi</span>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full sm:w-48 rounded-xl border-gray-200">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Notifications</SelectItem>
                    <SelectItem value="ORDER_PLACED">Orders</SelectItem>
                    <SelectItem value="PAYMENT_RECEIVED">Payments</SelectItem>
                    <SelectItem value="RESERVATION_CONFIRMED">
                      Reservations
                    </SelectItem>
                    <SelectItem value="LOYALTY_POINTS_EARNED">
                      Loyalty Points
                    </SelectItem>
                    <SelectItem value="GENERAL_ANNOUNCEMENT">
                      Announcements
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant={unreadOnly ? "default" : "outline"}
                onClick={() => setUnreadOnly(!unreadOnly)}
                className={cn(
                  "rounded-xl",
                  unreadOnly && "bg-amber-500 hover:bg-amber-600 text-white",
                )}
              >
                <Bell className="w-4 h-4 mr-2" />
                Unread only
              </Button>
            </div>

            {/* Notifications List */}
            {isLoading ? (
              <NotificationSkeleton />
            ) : notifications.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No notifications yet
                </h3>
                <p className="text-gray-500">
                  {unreadOnly
                    ? "You've read all your notifications!"
                    : "When you receive notifications, they'll appear here."}
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {notifications.map((notification: Notification) => {
                    const Icon = getNotificationIcon(notification.type);
                    const colorClass = getNotificationColor(notification.type);
                    const title = getNotificationTitle(notification.type);

                    return (
                      <div
                        key={notification.id}
                        className={cn(
                          "group relative rounded-xl border transition-all duration-200 hover:shadow-md",
                          !notification.isRead
                            ? "border-l-4 border-l-amber-500 bg-amber-50/30"
                            : "border-gray-100 bg-white",
                        )}
                      >
                        <div className="p-4 flex items-start gap-4">
                          {/* Icon */}
                          <div
                            className={cn(
                              "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                              colorClass.split(" ").slice(1).join(" "),
                            )}
                          >
                            <Icon
                              className={cn(
                                "w-5 h-5",
                                colorClass.split(" ")[0],
                              )}
                            />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 flex-wrap">
                              <div>
                                <h4 className="font-semibold text-gray-900">
                                  {notification.title || title}
                                </h4>
                                <p className="text-sm text-gray-600 mt-0.5">
                                  {notification.message}
                                </p>
                              </div>
                              {!notification.isRead && (
                                <Badge className="bg-amber-100 text-amber-700 border-0">
                                  New
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {format(
                                  new Date(notification.createdAt),
                                  "MMM dd, yyyy",
                                )}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {format(
                                  new Date(notification.createdAt),
                                  "hh:mm a",
                                )}
                              </span>
                            </div>
                          </div>

                          {/* Actions */}
                          {!notification.isRead && (
                            <button
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-amber-600"
                              title="Mark as read"
                            >
                              <CheckCheck className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {pagination && pagination.pages > 1 && (
                  <div className="flex items-center justify-between gap-2 mt-6 pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 1}
                      className="rounded-xl"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Previous
                    </Button>
                    <span className="text-sm text-gray-600">
                      Page {pagination.page} of {pagination.pages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page === pagination.pages}
                      className="rounded-xl"
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="text-center py-4 border-t border-gray-100 bg-gray-50/50">
            <p className="text-xs text-gray-400">Powered by QR Menu System</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function NotificationSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="rounded-xl border border-gray-100 p-4">
          <div className="flex items-start gap-4">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-5 w-48 mb-2" />
              <Skeleton className="h-4 w-full max-w-md mb-2" />
              <div className="flex gap-4">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

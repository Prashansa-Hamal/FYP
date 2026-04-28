export enum NotificationType {
  ORDER_PLACED = "ORDER_PLACED",
  ORDER_CONFIRMED = "ORDER_CONFIRMED",
  ORDER_PREPARING = "ORDER_PREPARING",
  ORDER_READY = "ORDER_READY",
  ORDER_SERVED = "ORDER_SERVED",
  ORDER_COMPLETED = "ORDER_COMPLETED",
  ORDER_CANCELLED = "ORDER_CANCELLED",
  PAYMENT_RECEIVED = "PAYMENT_RECEIVED",
  PAYMENT_FAILED = "PAYMENT_FAILED",
  RESERVATION_CONFIRMED = "RESERVATION_CONFIRMED",
  RESERVATION_CANCELLED = "RESERVATION_CANCELLED",
  LOYALTY_POINTS_EARNED = "LOYALTY_POINTS_EARNED",
  LOYALTY_POINTS_REDEEMED = "LOYALTY_POINTS_REDEEMED",
  GENERAL_ANNOUNCEMENT = "GENERAL_ANNOUNCEMENT",
  TABLE_STATUS_UPDATE = "TABLE_STATUS_UPDATE",
  STAFF_ASSIGNMENT = "STAFF_ASSIGNMENT",
  KITCHEN_ORDER = "KITCHEN_ORDER",
  BAR_ORDER = "BAR_ORDER",
}

export interface Notification {
  id: string;
  userId: string;
  orderId?: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  order?: {
    orderNumber: string;
    status: string;
  };
}

export interface NotificationsResponse {
  success: boolean;
  data: {
    notifications: Notification[];
    unreadCount: number;
    totalCount: number;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface MarkAsReadResponse {
  success: boolean;
  message: string;
}

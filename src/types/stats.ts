import {
  ItemCategory,
  OrderStatus,
  OrderType,
  PaymentMethod,
  UserRole,
} from "./enums";

//  Dashboard Overview

export interface DashboardOverview {
  revenue: {
    today: number;
    week: number;
    month: number;
    trend: number;
  };
  orders: {
    total: number;
    pending: number;
    preparing: number;
    ready: number;
    completed: number;
    cancelled: number;
  };
  customers: {
    total: number;
    newToday: number;
    active: number;
  };
  staff: {
    active: number;
    onShift: number;
    total: number;
  };
}

// Revenue

export interface DailyRevenueItem {
  date: string;
  revenue: number;
  orders: number;
  averageOrderValue: number;
}

export interface DailyRevenueResponse {
  data: DailyRevenueItem[];
  summary: {
    totalRevenue: number;
    totalOrders: number;
    avgDailyRevenue: number;
    bestDay: { date: string; revenue: number } | null;
  };
}

export interface MonthlyRevenueItem {
  month: string;
  revenue: number;
  orders: number;
  growth: number;
}

export interface MonthlyRevenueResponse {
  data: MonthlyRevenueItem[];
  summary: {
    totalYearRevenue: number;
    avgMonthlyRevenue: number;
    bestMonth: { month: string; revenue: number };
  };
}

export interface HourlyRevenueItem {
  hour: string;
  revenue: number;
  orders: number;
}

export interface HourlyRevenueResponse {
  data: HourlyRevenueItem[];
  peakHours: HourlyRevenueItem[];
}

//  Orders

export interface OrderStatusItem {
  status: OrderStatus;
  count: number;
  percentage: number;
  value: number;
}

export interface OrderTypeItem {
  type: OrderType;
  count: number;
  percentage: number;
  revenue: number;
}

export interface OrderTypeResponse {
  data: OrderTypeItem[];
  summary: {
    mostPopular: OrderType;
    leastPopular: OrderType;
  };
}

export interface OrdersTimelineItem {
  date: string;
  dineIn: number;
  takeaway: number;
  delivery: number;
  total: number;
}

//  Menu

export interface TopSellingItem {
  id: string;
  name: string;
  category: ItemCategory;
  quantity: number;
  revenue: number;
  percentageOfSales: number;
  trend: number;
}

export interface CategoryPerformanceItem {
  category: ItemCategory;
  itemsSold: number;
  revenue: number;
  percentageOfSales: number;
  averageOrderValue: number;
}

//   Customers

export interface CustomerAcquisitionItem {
  date: string;
  newCustomers: number;
  returningCustomers: number;
  totalActive: number;
}

//   Payments

export interface PaymentMethodItem {
  method: PaymentMethod;
  count: number;
  totalAmount: number;
  percentage: number;
  successRate: number;
}

//   Staff

export interface StaffPerformanceItem {
  userId: string;
  name: string;
  role: UserRole;
  ordersProcessed: number;
  averageTimeMinutes: number;
  completedOnTime: number;
  lateCompletions: number;
}

//   Realtime

export interface RealtimeStats {
  timestamp: string;
  activeOrders: number;
  preparingOrders: number;
  readyOrders: number;
  todayStats: {
    ordersCompleted: number;
    revenue: number;
    averageWaitTime: number;
    customerCount: number;
  };
  kitchen: {
    itemsPreparing: number;
    itemsReady: number;
    estimatedWaitMinutes: number;
  };
  bar: {
    itemsPreparing: number;
    itemsReady: number;
    estimatedWaitMinutes: number;
  };
  tables: {
    occupied: number;
    available: number;
    reserved: number;
  };
}

//   Query Parameters

export interface DateRangeParams {
  startDate?: string;
  endDate?: string;
}

export interface TopItemsParams {
  period?: "today" | "week" | "month" | "quarter" | "year";
  limit?: number;
  page?: number;
  category?: ItemCategory;
}

"Use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  DashboardOverview,
  DailyRevenueResponse,
  MonthlyRevenueResponse,
  HourlyRevenueResponse,
  OrderStatusItem,
  OrderTypeResponse,
  OrdersTimelineItem,
  TopSellingItem,
  CategoryPerformanceItem,
  CustomerAcquisitionItem,
  PaymentMethodItem,
  StaffPerformanceItem,
  StockLevelItem,
  RealtimeStats,
  DateRangeParams,
  TopItemsParams,
} from "@/types/stats";

//   Query Keys
export const statsKeys = {
  all: ["stats"] as const,

  dashboardOverview: () => [...statsKeys.all, "dashboard-overview"] as const,

  revenueDaily: (params?: DateRangeParams) =>
    [...statsKeys.all, "revenue-daily", params] as const,

  revenueMonthly: (year?: number) =>
    [...statsKeys.all, "revenue-monthly", year] as const,

  revenueHourly: (date?: string) =>
    [...statsKeys.all, "revenue-hourly", date] as const,

  ordersStatus: () => [...statsKeys.all, "orders-status"] as const,

  ordersType: () => [...statsKeys.all, "orders-type"] as const,

  ordersTimeline: (period?: string) =>
    [...statsKeys.all, "orders-timeline", period] as const,

  menuTopItems: (params?: TopItemsParams) =>
    [...statsKeys.all, "menu-top-items", params] as const,

  menuCategoryPerformance: () =>
    [...statsKeys.all, "menu-category-performance"] as const,

  customersAcquisition: (period?: string) =>
    [...statsKeys.all, "customers-acquisition", period] as const,

  paymentsMethod: () => [...statsKeys.all, "payments-method"] as const,

  staffPerformance: () => [...statsKeys.all, "staff-performance"] as const,

  inventoryStock: () => [...statsKeys.all, "inventory-stock"] as const,

  realtimeCurrent: () => [...statsKeys.all, "realtime-current"] as const,
};

//   Dashboard
export const useDashboardOverview = () =>
  useQuery({
    queryKey: statsKeys.dashboardOverview(),
    queryFn: async (): Promise<DashboardOverview> => {
      const res = await fetch("/api/stats/dashboard/overview");
      if (!res.ok) throw new Error("Failed to fetch dashboard overview");
      return res.json();
    },
    refetchInterval: 30000,
  });

//   Revenue
export const useDailyRevenue = (params?: DateRangeParams) => {
  const query = new URLSearchParams();
  if (params?.startDate) query.set("startDate", params.startDate);
  if (params?.endDate) query.set("endDate", params.endDate);

  return useQuery({
    queryKey: statsKeys.revenueDaily(params),
    queryFn: async (): Promise<DailyRevenueResponse> => {
      const res = await fetch(`/api/stats/revenue/daily?${query}`);
      if (!res.ok) throw new Error("Failed to fetch daily revenue");
      return res.json();
    },
  });
};

export const useMonthlyRevenue = (year?: number) => {
  const query = new URLSearchParams();
  if (year) query.set("year", year.toString());

  return useQuery({
    queryKey: statsKeys.revenueMonthly(year),
    queryFn: async (): Promise<MonthlyRevenueResponse> => {
      const res = await fetch(`/api/stats/revenue/monthly?${query}`);
      if (!res.ok) throw new Error("Failed to fetch monthly revenue");
      return res.json();
    },
  });
};

export const useHourlyRevenue = (date?: string) => {
  const query = new URLSearchParams();
  if (date) query.set("date", date);

  return useQuery({
    queryKey: statsKeys.revenueHourly(date),
    queryFn: async (): Promise<HourlyRevenueResponse> => {
      const res = await fetch(`/api/stats/revenue/hourly?${query}`);
      if (!res.ok) throw new Error("Failed to fetch hourly revenue");
      return res.json();
    },
  });
};

//   Orders
export const useOrderStatusDistribution = () =>
  useQuery({
    queryKey: statsKeys.ordersStatus(),
    queryFn: async (): Promise<OrderStatusItem[]> => {
      const res = await fetch("/api/stats/orders/status-distribution");
      if (!res.ok) throw new Error("Failed to fetch order status distribution");
      const data = await res.json();
      return data.data;
    },
  });

export const useOrderTypeDistribution = () =>
  useQuery({
    queryKey: statsKeys.ordersType(),
    queryFn: async (): Promise<OrderTypeResponse> => {
      const res = await fetch("/api/stats/orders/type-distribution");
      if (!res.ok) throw new Error("Failed to fetch order type distribution");
      return res.json();
    },
  });

export const useOrdersTimeline = (period?: string) => {
  const query = new URLSearchParams();
  if (period) query.set("period", period);

  return useQuery({
    queryKey: statsKeys.ordersTimeline(period),
    queryFn: async (): Promise<OrdersTimelineItem[]> => {
      const res = await fetch(`/api/stats/orders/timeline?${query}`);
      if (!res.ok) throw new Error("Failed to fetch orders timeline");
      const data = await res.json();
      return data.data;
    },
  });
};

//   Menu
export const useTopSellingItems = (params?: TopItemsParams) => {
  const query = new URLSearchParams();
  if (params?.limit) query.set("limit", params.limit.toString());
  if (params?.period) query.set("period", params.period);
  if (params?.category) query.set("category", params.category);

  return useQuery({
    queryKey: statsKeys.menuTopItems(params),
    queryFn: async (): Promise<TopSellingItem[]> => {
      const res = await fetch(`/api/stats/menu/top-items?${query}`);
      if (!res.ok) throw new Error("Failed to fetch top selling items");
      const data = await res.json();
      return data.data;
    },
  });
};

export const useCategoryPerformance = () =>
  useQuery({
    queryKey: statsKeys.menuCategoryPerformance(),
    queryFn: async (): Promise<CategoryPerformanceItem[]> => {
      const res = await fetch("/api/stats/menu/category-performance");
      if (!res.ok) throw new Error("Failed to fetch category performance");
      const data = await res.json();
      return data.data;
    },
  });

//   Customers
export const useCustomerAcquisition = (period?: string) => {
  const query = new URLSearchParams();
  if (period) query.set("period", period);

  return useQuery({
    queryKey: statsKeys.customersAcquisition(period),
    queryFn: async (): Promise<CustomerAcquisitionItem[]> => {
      const res = await fetch(`/api/stats/customers/acquisition?${query}`);
      if (!res.ok) throw new Error("Failed to fetch customer acquisition");
      const data = await res.json();
      return data.data;
    },
  });
};

//   Payments
export const usePaymentMethodDistribution = () =>
  useQuery({
    queryKey: statsKeys.paymentsMethod(),
    queryFn: async (): Promise<PaymentMethodItem[]> => {
      const res = await fetch("/api/stats/payments/method-distribution");
      if (!res.ok)
        throw new Error("Failed to fetch payment method distribution");
      const data = await res.json();
      return data.data;
    },
  });

//   Staff
export const useStaffPerformance = () =>
  useQuery({
    queryKey: statsKeys.staffPerformance(),
    queryFn: async (): Promise<StaffPerformanceItem[]> => {
      const res = await fetch("/api/stats/staff/performance");
      if (!res.ok) throw new Error("Failed to fetch staff performance");
      const data = await res.json();
      return data.data;
    },
  });

//   Inventory
export const useStockLevels = () =>
  useQuery({
    queryKey: statsKeys.inventoryStock(),
    queryFn: async (): Promise<StockLevelItem[]> => {
      const res = await fetch("/api/stats/inventory/stock-levels");
      if (!res.ok) throw new Error("Failed to fetch stock levels");
      const data = await res.json();
      return data.data;
    },
    refetchInterval: 60000,
  });

//   Realtime
export const useRealtimeStats = () =>
  useQuery({
    queryKey: statsKeys.realtimeCurrent(),
    queryFn: async (): Promise<RealtimeStats> => {
      const res = await fetch("/api/stats/realtime/current");
      if (!res.ok) throw new Error("Failed to fetch realtime stats");
      return res.json();
    },
    refetchInterval: 5000,
  });

//   Prefetch Utilities
export const usePrefetchStats = () => {
  const queryClient = useQueryClient();

  const prefetchDashboard = () =>
    queryClient.prefetchQuery({
      queryKey: statsKeys.dashboardOverview(),
      queryFn: async () => {
        const res = await fetch("/api/stats/dashboard/overview");
        return res.json();
      },
    });

  const prefetchRevenueDaily = (params?: DateRangeParams) => {
    const query = new URLSearchParams();
    if (params?.startDate) query.set("startDate", params.startDate);
    if (params?.endDate) query.set("endDate", params.endDate);

    return queryClient.prefetchQuery({
      queryKey: statsKeys.revenueDaily(params),
      queryFn: async () => {
        const res = await fetch(`/api/stats/revenue/daily?${query}`);
        return res.json();
      },
    });
  };

  const prefetchTopItems = (params?: TopItemsParams) => {
    const query = new URLSearchParams();
    if (params?.limit) query.set("limit", params.limit.toString());
    if (params?.period) query.set("period", params.period);

    return queryClient.prefetchQuery({
      queryKey: statsKeys.menuTopItems(params),
      queryFn: async () => {
        const res = await fetch(`/api/stats/menu/top-items?${query}`);
        return res.json();
      },
    });
  };

  return {
    prefetchDashboard,
    prefetchRevenueDaily,
    prefetchTopItems,
  };
};

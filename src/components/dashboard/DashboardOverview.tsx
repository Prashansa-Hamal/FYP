"use client";

import { useDashboardOverview } from "@/hooks/useStats";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { StatsCards } from "./StatsCards";
import { RevenueCharts } from "./RevenueCharts";
import { RealtimeMonitor } from "./RealtimeMonitor";
import { OrderAnalytics } from "./OrderAnalytics";
import { MenuPerformance } from "./MenuPerformance";
import { CustomerInsights } from "./CustomerInsights";
import { PaymentAnalytics } from "./PaymentAnalytics";
import { LoyaltyLeaderboard } from "./LoyaltyLeaderboard";

export function DashboardOverview() {
  const { data: overview, isLoading, error } = useDashboardOverview();

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load dashboard data. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Real-time Monitor Section */}
      <RealtimeMonitor />

      {/* Stats Cards */}
      <StatsCards overview={overview} isLoading={isLoading} />

      {/* Revenue and Orders Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <RevenueCharts />
        </div>
        <div className="col-span-3">
          <OrderAnalytics />
        </div>
      </div>

      {/* Menu Performance and Customer Insights */}
      <div className="grid gap-4 md:grid-cols-2">
        <MenuPerformance />
        <CustomerInsights />
      </div>

      {/* Tables and Payments Section */}
      {/* <div className="grid gap-4 md:grid-cols-2"> */}
      <PaymentAnalytics />
      {/* </div> */}

      <LoyaltyLeaderboard />
    </div>
  );
}

"use client";

import { RealtimeMonitor } from "@/components/dashboard/RealtimeMonitor";
import { RevenueCharts } from "@/components/dashboard/RevenueCharts";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { DashboardSkeleton } from "@/components/skeletons/DashboardSkeleton";
import { useDashboardOverview } from "@/hooks/useStats";
import { Suspense } from "react";

const CashierPage = () => {
  const { data: overview, isLoading, error } = useDashboardOverview();

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <div className="space-y-6">
        <RealtimeMonitor />

        <StatsCards overview={overview} isLoading={isLoading} />

        <RevenueCharts />
      </div>
    </Suspense>
  );
};

export default CashierPage;

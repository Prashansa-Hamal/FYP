import { Suspense } from "react";
import { Metadata } from "next";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { DashboardSkeleton } from "@/components/skeletons/DashboardSkeleton";

export const metadata: Metadata = {
  title: "Dashboard | Restaurant Management",
  description: "Real-time restaurant dashboard with analytics and insights",
};

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardOverview />
    </Suspense>
  );
}

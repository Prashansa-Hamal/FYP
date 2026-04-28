"use client";

import {
  useOrderStatusDistribution,
  useOrderTypeDistribution,
  useOrdersTimeline,
} from "@/hooks/useStats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Clock, CheckCircle2, XCircle, Package } from "lucide-react";

const COLORS = {
  PENDING: "#fbbf24",
  CONFIRMED: "#60a5fa",
  PREPARING: "#f97316",
  READY: "#10b981",
  COMPLETED: "#22c55e",
  CANCELLED: "#ef4444",
  SERVED: "#000000",
};

export function OrderAnalytics() {
  const { data: statusData, isLoading: statusLoading } =
    useOrderStatusDistribution();
  const { data: typeData, isLoading: typeLoading } = useOrderTypeDistribution();
  const { data: timelineData, isLoading: timelineLoading } =
    useOrdersTimeline("week");

  if (statusLoading || typeLoading || timelineLoading) {
    return (
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Order Analytics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-[200px] w-full" />
          <Skeleton className="h-[100px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const totalOrders =
    statusData?.reduce((sum, item) => sum + item.count, 0) || 0;
  const completedOrders =
    statusData?.find((s) => s.status === "COMPLETED")?.count || 0;
  const cancelledOrders =
    statusData?.find((s) => s.status === "CANCELLED")?.count || 0;
  const completionRate = totalOrders
    ? ((completedOrders / totalOrders) * 100).toFixed(1)
    : 0;

  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Order Analytics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Distribution */}
        <div>
          <h3 className="text-sm font-medium mb-3">Order Status</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={1}
                    dataKey="count"
                    nameKey="status"
                  >
                    {statusData?.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[entry.status as keyof typeof COLORS]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              {statusData?.map((status) => (
                <div
                  key={status.status}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor:
                          COLORS[status.status as keyof typeof COLORS],
                      }}
                    />
                    <span className="text-sm">{status.status}</span>
                  </div>
                  <span className="text-sm font-medium">{status.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Type Distribution */}
        <div>
          <h3 className="text-sm font-medium mb-3">Order Types</h3>
          <div className="space-y-3">
            {typeData?.data.map((type) => (
              <div key={type.type}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{type.type}</span>
                  <span className="font-medium">{type.count} orders</span>
                </div>
                <Progress value={type.percentage} className="h-2" />
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="flex justify-center mb-2">
              <Package className="h-5 w-5 text-blue-500" />
            </div>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <div className="text-xs text-muted-foreground">Total Orders</div>
          </div>
          <div className="text-center">
            <div className="flex justify-center mb-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
            <div className="text-2xl font-bold">{completionRate}%</div>
            <div className="text-xs text-muted-foreground">Completion Rate</div>
          </div>
          <div className="text-center">
            <div className="flex justify-center mb-2">
              <Clock className="h-5 w-5 text-orange-500" />
            </div>
            <div className="text-2xl font-bold">
              {typeData?.data.find((t) => t.type === "DINE_IN")?.count || 0}
            </div>
            <div className="text-xs text-muted-foreground">Dine-in Today</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

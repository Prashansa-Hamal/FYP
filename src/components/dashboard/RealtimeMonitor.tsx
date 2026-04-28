"use client";

import { useRealtimeStats } from "@/hooks/useStats";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, Clock, ChefHat, Wine, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/formatters";

export function RealtimeMonitor() {
  const { data: stats, isLoading } = useRealtimeStats();
  const [timeAgo, setTimeAgo] = useState<string>("just now");

  useEffect(() => {
    if (stats?.timestamp) {
      const updateTimeAgo = () => {
        const seconds = Math.floor(
          (new Date().getTime() - new Date(stats.timestamp).getTime()) / 1000,
        );
        if (seconds < 5) setTimeAgo("just now");
        else if (seconds < 60) setTimeAgo(`${seconds}s ago`);
        else setTimeAgo(`${Math.floor(seconds / 60)}m ago`);
      };

      updateTimeAgo();
      const interval = setInterval(updateTimeAgo, 1000);
      return () => clearInterval(interval);
    }
  }, [stats?.timestamp]);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const monitors = [
    {
      title: "Active Orders",
      value: stats?.activeOrders || 0,
      icon: Activity,
      color: "text-blue-500",
      bg: "bg-blue-50",
      subValue: `${stats?.preparingOrders} preparing, ${stats?.readyOrders} ready`,
    },
    {
      title: "Today's Revenue",
      value: `${formatCurrency(stats?.todayStats.revenue || 0)}`,
      icon: Clock,
      color: "text-green-500",
      bg: "bg-green-50",
      subValue: `${stats?.todayStats.ordersCompleted} orders completed`,
    },
    {
      title: "Kitchen",
      value: `${stats?.kitchen.itemsPreparing || 0}/${stats?.kitchen.itemsReady || 0}`,
      icon: ChefHat,
      color: "text-orange-500",
      bg: "bg-orange-50",
      subValue: `${stats?.kitchen.estimatedWaitMinutes}min wait`,
    },
    {
      title: "Tables",
      value: `${stats?.tables.occupied || 0}/${stats?.tables.available || 0}`,
      icon: Users,
      color: "text-purple-500",
      bg: "bg-purple-50",
      subValue: `${stats?.tables.reserved} reserved`,
    },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">
          Live Updates
        </h3>
        <Badge variant="outline" className="text-xs">
          Updated {timeAgo}
        </Badge>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {monitors.map((monitor) => {
          const Icon = monitor.icon;
          return (
            <Card key={monitor.title} className="relative overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {monitor.title}
                    </p>
                    <p className="text-2xl font-bold mt-1">{monitor.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {monitor.subValue}
                    </p>
                  </div>
                  <div className={`rounded-full ${monitor.bg} p-3`}>
                    <Icon className={`h-5 w-5 ${monitor.color}`} />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-20" />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

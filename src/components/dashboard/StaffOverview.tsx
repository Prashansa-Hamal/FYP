"use client";

import { useStaffPerformance } from "@/hooks/useStats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Clock, CheckCircle2, AlertCircle, Users } from "lucide-react";

export function StaffOverview() {
  const { data: performanceData, isLoading: performanceLoading } =
    useStaffPerformance();

  if (performanceLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Staff Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-[100px] w-full" />
          <Skeleton className="h-[150px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 90) return "text-green-600";
    if (efficiency >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Staff Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Top Performers */}
        <div>
          <h3 className="text-sm font-medium mb-3">Top Performers</h3>
          <ScrollArea className="h-[200px]">
            <div className="space-y-3">
              {performanceData
                ?.sort((a, b) => b.ordersProcessed - a.ordersProcessed)
                .slice(0, 5)
                .map((staff) => (
                  <div
                    key={staff.userId}
                    className="flex items-center justify-between p-2 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {getInitials(staff.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{staff.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {staff.role}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">
                        {staff.ordersProcessed}
                      </p>
                      <p className="text-xs text-muted-foreground">orders</p>
                    </div>
                  </div>
                ))}
            </div>
          </ScrollArea>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <div>
              <div className="text-sm font-bold">
                {performanceData?.reduce(
                  (sum, s) => sum + s.completedOnTime,
                  0,
                )}
              </div>
              <div className="text-xs">On Time</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <div>
              <div className="text-sm font-bold">
                {performanceData?.reduce(
                  (sum, s) => sum + s.lateCompletions,
                  0,
                )}
              </div>
              <div className="text-xs">Late</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-500" />
            <div>
              <div className="text-sm font-bold">
                {(
                  (performanceData?.reduce(
                    (sum, s) => sum + s.averageTimeMinutes,
                    0,
                  ) || 0) / (performanceData?.length || 1)
                ).toFixed(0)}
                m
              </div>
              <div className="text-xs">Avg Time</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

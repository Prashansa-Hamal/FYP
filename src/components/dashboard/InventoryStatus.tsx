"use client";

import { useStockLevels } from "@/hooks/useStats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Package, TrendingDown, Calendar } from "lucide-react";

export function InventoryStatus() {
  const { data: stockData, isLoading: stockLoading } = useStockLevels();

  if (stockLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Inventory Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-[100px] w-full" />
          <Skeleton className="h-[150px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "critical":
        return "destructive";
      case "low":
        return "warning";
      default:
        return "success";
    }
  };

  const criticalItems =
    stockData?.flatMap((cat) =>
      cat.items.filter((item) => item.status === "critical"),
    ).length || 0;
  const lowItems =
    stockData?.flatMap((cat) =>
      cat.items.filter((item) => item.status === "low"),
    ).length || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stock Alerts */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <AlertTriangle className="h-6 w-6 mx-auto mb-2 text-red-600" />
            <div className="text-2xl font-bold text-red-600">
              {criticalItems}
            </div>
            <div className="text-sm text-red-600">Critical</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <Package className="h-6 w-6 mx-auto mb-2 text-yellow-600" />
            <div className="text-2xl font-bold text-yellow-600">{lowItems}</div>
            <div className="text-sm text-yellow-600">Low Stock</div>
          </div>
        </div>

        {/* Stock Levels by Category */}
        <div>
          <h3 className="text-sm font-medium mb-3">Stock Levels</h3>
          <div className="space-y-4 max-h-[200px] overflow-y-auto">
            {stockData?.map((category) => (
              <div key={category.category} className="space-y-2">
                <h4 className="text-xs font-medium text-muted-foreground">
                  {category.category}
                </h4>
                {category.items.slice(0, 3).map((item) => (
                  <div key={item.name} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="truncate max-w-[150px]">
                        {item.name}
                      </span>
                      {/* <Badge variant={getStatusColor(item.status)}> */}
                      <Badge>{item.status}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={(item.currentStock / item.minThreshold) * 100}
                        className="h-2 flex-1"
                      />
                      <span className="text-xs">
                        {item.currentStock}/{item.minThreshold}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-orange-500" />
            <span className="text-sm">Usage Rate</span>
          </div>
          <span className="text-sm font-medium">
            {stockData
              ?.flatMap((c) => c.items)
              .reduce((sum, i) => sum + i.usageRate, 0)
              .toFixed(1)}{" "}
            units/day
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

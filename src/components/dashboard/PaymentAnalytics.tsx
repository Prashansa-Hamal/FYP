"use client";

import { usePaymentMethodDistribution } from "@/hooks/useStats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { CreditCard, Wallet, TrendingUp, AlertCircle } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";

const PAYMENT_COLORS = {
  COD: "#22c55e",
  ESEWA: "#3b82f6",
  KHALTI: "#f97316",
};

const PAYMENT_ICONS = {
  COD: Wallet,
  ESEWA: CreditCard,
  KHALTI: CreditCard,
};

export function PaymentAnalytics() {
  const { data: methodData, isLoading: methodLoading } =
    usePaymentMethodDistribution();

  if (methodLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment Analytics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-[200px] w-full" />
          <Skeleton className="h-[100px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const totalAmount =
    methodData?.reduce((sum, method) => sum + method.totalAmount, 0) || 0;
  const averageSuccessRate =
    methodData?.reduce((sum, method) => sum + method.successRate, 0)! /
      (methodData?.length || 1) || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Analytics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Payment Methods Chart */}
        <div className="grid grid-cols-2 gap-4">
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={methodData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={60}
                  paddingAngle={5}
                  dataKey="totalAmount"
                  nameKey="method"
                >
                  {methodData?.map((entry) => (
                    <Cell
                      key={entry.method}
                      fill={
                        PAYMENT_COLORS[
                          entry.method as keyof typeof PAYMENT_COLORS
                        ]
                      }
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => `$${value.toLocaleString()}`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2">
            {methodData?.map((method) => {
              const Icon =
                PAYMENT_ICONS[method.method as keyof typeof PAYMENT_ICONS];
              return (
                <div key={method.method} className="flex items-center gap-2">
                  <Icon
                    className="h-4 w-4"
                    style={{
                      color:
                        PAYMENT_COLORS[
                          method.method as keyof typeof PAYMENT_COLORS
                        ],
                    }}
                  />
                  <div className="flex-1">
                    <div className="flex justify-between text-sm">
                      <span>{method.method}</span>
                      <span className="font-medium">
                        {formatCurrency(method.totalAmount)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Progress
                        value={method.percentage}
                        className="h-1.5 flex-1"
                      />
                      <span className="text-xs text-muted-foreground">
                        {method.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Success Rates */}
        <div>
          <h3 className="text-sm font-medium mb-3">Success Rates</h3>
          <div className="space-y-2">
            {methodData?.map((method) => (
              <div
                key={method.method}
                className="flex items-center justify-between"
              >
                <span className="text-sm">{method.method}</span>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      method.successRate > 95 ? "default" : "destructive"
                    }
                  >
                    {method.successRate.toFixed(1)}%
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {method.count} txns
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div>
            <p className="text-xs text-muted-foreground">Total Volume</p>
            <p className="text-xl font-bold">{formatCurrency(totalAmount)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Avg Success Rate</p>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-xl font-bold">
                {averageSuccessRate.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Failed Transactions Alert */}
        {methodData?.some((m) => m.successRate < 90) && (
          <div className="bg-red-50 p-3 rounded-lg flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <p className="text-sm text-red-600">
              Some payment methods have low success rates
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

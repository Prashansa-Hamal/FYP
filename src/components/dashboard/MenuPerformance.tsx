"use client";

import { useState } from "react";
import { useTopSellingItems, useCategoryPerformance } from "@/hooks/useStats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";

const categoryColors = {
  APPETIZER: "#f97316",
  MAIN_COURSE: "#3b82f6",
  DESSERT: "#ec4899",
  BEVERAGE: "#10b981",
  ALCOHOLIC: "#8b5cf6",
  SNACK: "#f59e0b",
  SIDE_DISH: "#6b7280",
};

export function MenuPerformance() {
  const [period, setPeriod] = useState<"week" | "month" | "year">("month");

  const { data: topItems, isLoading: topItemsLoading } = useTopSellingItems({
    limit: 10,
    period,
  });

  const { data: categoryData, isLoading: categoryLoading } =
    useCategoryPerformance();

  const getTrendIcon = (trend: number) => {
    if (trend > 5) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend < -5) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Menu Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="top-items">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="top-items">Top Items</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>

          <TabsContent value="top-items" className="space-y-4">
            <div className="flex justify-end space-x-2">
              {["week", "month", "year"].map((p) => (
                <Badge
                  key={p}
                  variant={period === p ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setPeriod(p as typeof period)}
                >
                  {p}
                </Badge>
              ))}
            </div>

            {topItemsLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead className="text-right">Trend</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topItems?.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.category}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {item.quantity}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.revenue)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {getTrendIcon(item.trend)}
                          <span
                            className={
                              item.trend > 0
                                ? "text-green-600"
                                : item.trend < 0
                                  ? "text-red-600"
                                  : ""
                            }
                          >
                            {item.trend > 0 ? "+" : ""}
                            {item.trend.toFixed(1)}%
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>

          <TabsContent value="categories">
            {categoryLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Bar
                    yAxisId="left"
                    dataKey="revenue"
                    fill="#8884d8"
                    name="Revenue"
                  >
                    {categoryData?.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          categoryColors[
                            entry.category as keyof typeof categoryColors
                          ] || "#8884d8"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

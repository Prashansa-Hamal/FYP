import { DashboardOverview } from "@/types/stats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  TrendingUp,
  TrendingDown,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { formatCurrency } from "@/lib/formatters";

interface StatsCardsProps {
  overview?: DashboardOverview;
  isLoading: boolean;
}

export function StatsCards({ overview, isLoading }: StatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20 mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const stats = [
    {
      title: "Total Revenue",
      value: `${formatCurrency(overview?.revenue.today!)}`,
      description: `+${overview?.revenue.trend.toFixed(1)}% from last week`,
      icon: DollarSign,
      trend: overview?.revenue.trend || 0,
      iconColor: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Orders Today",
      value: overview?.orders.total.toString() || "0",
      description: `${overview?.orders.pending} pending, ${overview?.orders.preparing} preparing`,
      icon: ShoppingCart,
      trend: 0,
      iconColor: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Active Customers",
      value: overview?.customers.active.toString() || "0",
      description: `${overview?.customers.newToday} new today`,
      icon: Users,
      trend: 0,
      iconColor: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Low Stock Items",
      value: overview?.inventory.lowStock.toString() || "0",
      description: `${overview?.inventory.outOfStock} out of stock`,
      icon: Package,
      trend: 0,
      iconColor: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div className={`rounded-full ${stat.bgColor} p-2`}>
              <stat.icon className={`h-4 w-4 ${stat.iconColor}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              {stat.trend > 0 ? (
                <TrendingUp className="h-3 w-3 text-green-600" />
              ) : stat.trend < 0 ? (
                <TrendingDown className="h-3 w-3 text-red-600" />
              ) : null}
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

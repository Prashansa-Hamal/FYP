"use client";

import { TableStats } from "@/types/tables";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table as TableIcon,
  CheckCircle,
  Users,
  Clock,
  AlertCircle,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TableStatsCardsProps {
  stats?: TableStats;
  isLoading: boolean;
}

export function TableStatsCards({ stats, isLoading }: TableStatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="border-0 shadow-md">
            <CardContent className="p-4">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const cards = [
    {
      title: "Total Tables",
      value: stats.summary.totalTables,
      icon: TableIcon,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Available",
      value: stats.summary.availableTables,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Occupied",
      value: stats.summary.occupiedTables,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Reserved",
      value: stats.summary.reservedTables,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      title: "Out of Service",
      value: stats.summary.outOfServiceTables,
      icon: AlertCircle,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card) => (
        <Card
          key={card.title}
          className="border-0 shadow-md hover:shadow-lg transition-all duration-200"
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                {card.title}
              </span>
              <div className={cn("p-2 rounded-lg", card.bgColor)}>
                <card.icon className={cn("w-4 h-4", card.color)} />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{card.value}</div>
            <div className="text-xs text-gray-500 mt-1">
              {card.title === "Total Tables" &&
                `${stats.capacity.totalCapacity} total seats`}
              {card.title === "Available" &&
                `${stats.capacity.availableCapacity} seats available`}
              {card.title === "Reserved" && `${stats.todaysReservations} today`}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

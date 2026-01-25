"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChefHat, Clock, AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PreparationStation } from "@/types/enums";
import { useStationOrders } from "@/hooks/useStationOrders";
import { StationOrdersTable } from "./stationsOrdetListTable";

interface StationDashboardTableProps {
  station: PreparationStation;
  staffId: string;
  staffName: string;
}

const STATION_NAMES = {
  KITCHEN: "Main Kitchen",
  BAR: "Bar Station",
  DESSERT_STATION: "Dessert Station",
  FRY_STATION: "Fry Station",
  GRILL_STATION: "Grill Station",
};

export function StationDashboardTable({
  station,
  staffId,
  staffName,
}: StationDashboardTableProps) {
  const { data, isLoading, error, refetch } = useStationOrders(station);

  const stationName = STATION_NAMES[station] || station.replace("_", " ");

  if (error) {
    return (
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Connection Error
          </CardTitle>
          <CardDescription>Failed to load {stationName} orders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">{error.message}</p>
            <Button onClick={() => refetch()} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry Connection
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <ChefHat className="h-6 w-6 text-blue-700" />
                </div>
                {stationName}
              </CardTitle>
              <CardDescription>
                Staff: {staffName} • Station ID: {station}
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Last Updated</div>
              <div className="text-lg font-bold">
                {isLoading ? (
                  <Clock className="h-5 w-5 animate-spin text-blue-500" />
                ) : (
                  new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {data?.summary && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <div className="text-sm text-gray-500">Total Orders</div>
                <div className="text-2xl font-bold">
                  {data.summary.totalOrders}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-gray-500">Pending Items</div>
                <div className="text-2xl font-bold text-amber-600">
                  {data.summary.pendingItems}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-gray-500">In Progress</div>
                <div className="text-2xl font-bold text-blue-600">
                  {data.summary.inProgressItems}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-gray-500">Ready Items</div>
                <div className="text-2xl font-bold text-green-600">
                  {data.summary.readyItems}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Active Orders</CardTitle>
          <CardDescription>
            Real-time order tracking for {stationName.toLowerCase()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StationOrdersTable
            station={station}
            staffId={staffId}
            staffName={staffName}
          />
        </CardContent>
      </Card>
    </div>
  );
}

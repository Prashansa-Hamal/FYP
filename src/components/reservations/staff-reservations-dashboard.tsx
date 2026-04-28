"use client";

import { useStaffReservationsDashboard } from "@/hooks/useReservations";
import { ReservationsDataTable } from "./reservations-data-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function StaffReservationsDashboard() {
  const { stats, isLoading } = useStaffReservationsDashboard();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl">---</CardTitle>
                <CardDescription>Loading...</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Reservations</CardTitle>
            <CardDescription>Loading reservations...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{stats.total}</CardTitle>
            <CardDescription>Total Reservations</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl text-green-600">
              {stats.confirmed}
            </CardTitle>
            <CardDescription>Confirmed</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl text-blue-600">
              {stats.completed}
            </CardTitle>
            <CardDescription>Completed</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl text-red-600">
              {stats.cancelled}
            </CardTitle>
            <CardDescription>Cancelled</CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Reservations Management</CardTitle>
          <CardDescription>
            View and manage all reservations. Click on any reservation to see
            details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ReservationsDataTable />
        </CardContent>
      </Card>
    </div>
  );
}

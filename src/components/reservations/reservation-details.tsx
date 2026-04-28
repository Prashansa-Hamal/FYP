"use client";

import { format } from "date-fns";
import {
  CalendarIcon,
  Clock,
  Users,
  MapPin,
  MessageSquare,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  getReservationStatusColor,
  getReservationStatusText,
} from "@/lib/api/reservations-utils";
import { useCancelReservation, useReservation } from "@/hooks/useReservations";

interface ReservationDetailsProps {
  id: string;
}

export function ReservationDetails({ id }: ReservationDetailsProps) {
  const { data, isLoading, error } = useReservation(id);
  const cancelReservation = useCancelReservation();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error || !data?.data) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-red-500">Error loading reservation details</p>
        </CardContent>
      </Card>
    );
  }

  const reservation = data.data;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Reservation Details</CardTitle>
            <CardDescription>ID: {reservation.id}</CardDescription>
          </div>
          <Badge variant={getReservationStatusColor(reservation.status) as any}>
            {getReservationStatusText(reservation.status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Date and Time */}
        <div className="space-y-2">
          <h3 className="font-semibold">Date & Time</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              <span>
                {format(
                  new Date(reservation.reservationDate),
                  "EEEE, MMMM d, yyyy",
                )}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>
                {format(new Date(reservation.reservationDate), "h:mm a")}
              </span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Party Details */}
        <div className="space-y-2">
          <h3 className="font-semibold">Party Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>
                {reservation.partySize}{" "}
                {reservation.partySize === 1 ? "person" : "people"}
              </span>
            </div>
            {reservation.tables && reservation.tables.length > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>
                  Table(s):{" "}
                  {reservation.tables.map((t: any) => t.tableNumber).join(", ")}
                </span>
              </div>
            )}
          </div>
        </div>

        {reservation.specialRequests && (
          <>
            <Separator />
            <div className="space-y-2">
              <h3 className="font-semibold">Special Requests</h3>
              <div className="flex items-start gap-2 text-sm">
                <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
                <p className="text-muted-foreground">
                  {reservation.specialRequests}
                </p>
              </div>
            </div>
          </>
        )}

        {reservation.status === "CONFIRMED" && (
          <>
            <Separator />
            <div className="flex justify-end">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">Cancel Reservation</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel Reservation</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to cancel your reservation for{" "}
                      {format(
                        new Date(reservation.reservationDate),
                        "MMMM d, yyyy 'at' h:mm a",
                      )}
                      ? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>No, keep it</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => cancelReservation.mutate(reservation.id)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Yes, cancel reservation
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

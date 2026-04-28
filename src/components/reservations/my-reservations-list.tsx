"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  CalendarIcon,
  Clock,
  Users,
  Edit,
  XCircle,
  MapPin,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { UpdateReservationDialog } from "./update-reservation-dialog";
import {
  useCancelReservation,
  useMyReservations,
} from "@/hooks/useReservations";
import {
  canCancelReservation,
  getReservationStatusColor,
  getReservationStatusText,
} from "@/lib/api/reservations-utils";
import { cn } from "@/lib/utils";

export function MyReservationsList() {
  const [selectedReservationId, setSelectedReservationId] = useState<
    string | null
  >(null);
  const { data, isLoading, error, refetch } = useMyReservations({
    upcoming: true,
  });
  const cancelReservation = useCancelReservation({
    onSuccess: () => {
      refetch();
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="rounded-xl">
            <CardContent className="p-5">
              <div className="flex justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-9 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="rounded-xl border-red-200 bg-red-50">
        <CardContent className="p-6 text-center">
          <p className="text-red-600">
            Error loading reservations: {error.message}
          </p>
        </CardContent>
      </Card>
    );
  }

  const reservations = data?.data || [];

  if (reservations.length === 0) {
    return (
      <Card className="rounded-xl border-dashed border-gray-200">
        <CardContent className="py-12 text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CalendarIcon className="w-8 h-8 text-amber-500" />
          </div>
          <p className="text-gray-600">No upcoming reservations found</p>
          <p className="text-sm text-gray-400 mt-1">
            Book a table to enjoy your meal with us
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {reservations.map((reservation) => {
        const canCancel = canCancelReservation(reservation.reservationDate);

        return (
          <Card
            key={reservation.id}
            className="relative overflow-hidden rounded-xl border-gray-100 hover:shadow-md transition-all duration-200"
          >
            <div
              className={`absolute top-0 left-0 w-1 h-full bg-${getReservationStatusColor(reservation.status)}-500`}
            />
            <CardContent className="p-5">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge
                      className={cn(
                        "px-3 py-1 rounded-full",
                        reservation.status === "CONFIRMED" &&
                          "bg-green-100 text-green-700",
                        reservation.status === "CANCELLED" &&
                          "bg-red-100 text-red-700",
                        reservation.status === "COMPLETED" &&
                          "bg-gray-100 text-gray-700",
                      )}
                    >
                      {getReservationStatusText(reservation.status)}
                    </Badge>
                    {reservation.tables && reservation.tables.length > 0 && (
                      <Badge
                        variant="outline"
                        className="border-gray-200 text-gray-600"
                      >
                        Table{" "}
                        {reservation.tables
                          .map((t) => t.tableNumber)
                          .join(", ")}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CalendarIcon className="h-4 w-4 text-amber-500" />
                    <span>
                      {format(
                        new Date(reservation.reservationDate),
                        "EEEE, MMMM d, yyyy",
                      )}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4 text-amber-500" />
                    <span>
                      {format(new Date(reservation.reservationDate), "h:mm a")}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="h-4 w-4 text-amber-500" />
                    <span>
                      {reservation.partySize}{" "}
                      {reservation.partySize === 1 ? "person" : "people"}
                    </span>
                  </div>

                  {reservation.specialRequests && (
                    <div className="bg-amber-50 rounded-lg p-3 mt-2">
                      <p className="text-sm text-amber-800">
                        <span className="font-medium">Special requests:</span>{" "}
                        {reservation.specialRequests}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  {reservation.status === "CONFIRMED" && (
                    <>
                      <UpdateReservationDialog
                        id={reservation.id}
                        trigger={
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-gray-200 hover:border-amber-300 hover:bg-amber-50"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        }
                      />
                      {canCancel && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Cancel
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="rounded-2xl">
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Cancel Reservation
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to cancel your reservation
                                for{" "}
                                {format(
                                  new Date(reservation.reservationDate),
                                  "MMMM d, yyyy 'at' h:mm a",
                                )}
                                ? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="rounded-lg">
                                No, keep it
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  cancelReservation.mutate(reservation.id)
                                }
                                className="bg-red-600 hover:bg-red-700 rounded-lg"
                              >
                                Yes, cancel reservation
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

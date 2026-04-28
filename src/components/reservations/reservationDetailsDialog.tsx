import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCheckInReservation } from "@/hooks/useReservations";
import {
  CheckCircle,
  XCircle,
  Calendar,
  Users,
  MapPin,
  CalendarCheck,
  Phone,
  Mail,
  MessageSquare,
  Clock,
} from "lucide-react";
import { ReservationRow, statusConfig } from "./reservations-data-table";
import { format } from "date-fns";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

export const ReservationDetailsDialog = ({
  reservation,
  open,
  onOpenChange,
}: {
  reservation: ReservationRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  if (!reservation) return null;
  const checkInReservation = useCheckInReservation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-2xl font-bold">
            Reservation Details
          </DialogTitle>
          <DialogDescription>
            Complete information about this reservation
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Information Card */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-6 w-1 bg-primary rounded-full" />
              <h3 className="font-semibold text-lg">Customer Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/30 rounded-lg p-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  Full Name
                </p>
                <p className="font-medium">{reservation.userName}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  Email Address
                </p>
                <p className="font-mono text-sm">{reservation.userEmail}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  Phone Number
                </p>
                <p className="font-medium">
                  {reservation.userPhone || (
                    <span className="text-muted-foreground italic">
                      Not provided
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Reservation Details Card */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-6 w-1 bg-primary rounded-full" />
              <h3 className="font-semibold text-lg">Reservation Details</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/30 rounded-lg p-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Date & Time
                </p>
                <div className="space-y-1">
                  <p className="font-medium">
                    {format(
                      new Date(reservation.reservationDate),
                      "EEEE, MMMM d, yyyy",
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(reservation.reservationDate), "h:mm a")}
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  Party Size
                </p>
                <p className="font-medium">
                  {reservation.partySize}{" "}
                  {reservation.partySize === 1 ? "person" : "people"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  Tables Assigned
                </p>
                <div className="flex flex-wrap gap-2">
                  {reservation.tables?.length > 0 ? (
                    reservation.tables.map((table) => (
                      <Badge
                        key={table.tableNumber}
                        variant="outline"
                        className="gap-1"
                      >
                        <MapPin className="h-3 w-3" />
                        Table {table.tableNumber} (Cap: {table.capacity})
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground">Not assigned</span>
                  )}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Reservation Status
                </p>
                <Badge
                  variant={statusConfig[reservation.status]?.variant as any}
                  className="gap-1 w-fit"
                >
                  {statusConfig[reservation.status]?.icon}
                  {statusConfig[reservation.status]?.label}
                </Badge>
              </div>
            </div>
          </div>

          {/* Special Requests */}
          {reservation.specialRequests && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-6 w-1 bg-primary rounded-full" />
                <h3 className="font-semibold text-lg">Special Requests</h3>
              </div>
              <div className="bg-muted/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <MessageSquare className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <p className="text-muted-foreground">
                    {reservation.specialRequests}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Timeline */}
          {(reservation.createdAt ||
            reservation.checkedInAt ||
            reservation.cancelledAt) && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-6 w-1 bg-primary rounded-full" />
                <h3 className="font-semibold text-lg">Timeline</h3>
              </div>
              <div className="bg-muted/30 rounded-lg p-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                      <Clock className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Created</p>
                      <p className="text-sm text-muted-foreground">
                        {format(
                          new Date(reservation.createdAt),
                          "EEEE, MMMM d, yyyy 'at' h:mm a",
                        )}
                      </p>
                    </div>
                  </div>

                  {reservation.checkedInAt && (
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mt-0.5">
                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-green-600 dark:text-green-400">
                          Checked In
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(
                            new Date(reservation.checkedInAt),
                            "EEEE, MMMM d, yyyy 'at' h:mm a",
                          )}
                        </p>
                      </div>
                    </div>
                  )}

                  {reservation.completedAt && (
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mt-0.5">
                        <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-blue-600 dark:text-blue-400">
                          Completed
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(
                            new Date(reservation.completedAt),
                            "EEEE, MMMM d, yyyy 'at' h:mm a",
                          )}
                        </p>
                      </div>
                    </div>
                  )}

                  {reservation.cancelledAt && (
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mt-0.5">
                        <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-red-600 dark:text-red-400">
                          Cancelled
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(
                            new Date(reservation.cancelledAt),
                            "EEEE, MMMM d, yyyy 'at' h:mm a",
                          )}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            {reservation.status === "CONFIRMED" && (
              <Button
                disabled={checkInReservation.isPending}
                onClick={() => {
                  checkInReservation.mutate(reservation.id, {
                    onSuccess: () => {
                      onOpenChange(false);
                    },
                  });
                }}
              >
                <CalendarCheck className="h-4 w-4 mr-2" />
                Check In Now
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import {
  useAvailableTables,
  useReservation,
  useUpdateReservation,
} from "@/hooks/useReservations";
import { UpdateReservationInput, updateReservationSchema } from "@/schemas";

const timeSlots = [
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
  "19:30",
  "20:00",
];

interface UpdateReservationDialogProps {
  id: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

interface TableCapacity {
  tableNumber: number;
  capacity: number;
}

export function UpdateReservationDialog({
  id,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  trigger,
}: UpdateReservationDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [capacityError, setCapacityError] = useState<string | null>(null);
  const [availabilityError, setAvailabilityError] = useState<string | null>(
    null,
  );
  const [currentTables, setCurrentTables] = useState<TableCapacity[]>([]);
  const [checkingTableAvailability, setCheckingTableAvailability] =
    useState(false);

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const onOpenChange = controlledOnOpenChange || setInternalOpen;

  const { data, isLoading: loadingReservation } = useReservation(id);

  const updateReservation = useUpdateReservation({
    onSuccess: () => {
      onOpenChange(false);
      setCapacityError(null);
      setAvailabilityError(null);
    },
    onError: (error) => {
      // Handle capacity/availability error from backend
      if (error.message.includes("accommodate")) {
        setCapacityError(error.message);
      } else if (error.message.includes("available")) {
        setAvailabilityError(error.message);
      }
    },
  });

  const form = useForm<UpdateReservationInput>({
    resolver: zodResolver(updateReservationSchema),
    defaultValues: {
      status: "CONFIRMED",
    },
  });

  const reservationDate = form.watch("reservationDate");
  const timeSlot = form.watch("timeSlot");
  const partySize = form.watch("partySize");
  const selectedStatus = form.watch("status");

  // Get current tables info when reservation loads
  useEffect(() => {
    if (data?.data?.tables) {
      const tables = data.data.tables.map((t) => ({
        tableNumber: t.tableNumber,
        capacity: t.capacity,
      }));
      setCurrentTables(tables);
    }
  }, [data]);

  // Check availability for the new date/time
  const { data: availability, isLoading: checkingAvailability } =
    useAvailableTables(
      {
        date: reservationDate || "",
        timeSlot: timeSlot || "",
        partySize: partySize || 2,
      },
      {
        enabled: !!(reservationDate && timeSlot && partySize && open),
      },
    );

  // Check if current tables are available for the new time
  useEffect(() => {
    const checkCurrentTablesAvailability = async () => {
      if (!reservationDate || !timeSlot || !currentTables.length) return;

      setCheckingTableAvailability(true);
      try {
        // Check if current tables are available at the new time
        const tableNumbers = currentTables.map((t) => t.tableNumber);

        // This would be an API call to check specific tables
        // For now, we'll use the availability data to check
        if (availability?.data.availableTables) {
          const availableTableNumbers = availability.data.availableTables.map(
            (t) => t.tableNumber,
          );
          const unavailableTables = tableNumbers.filter(
            (tn) => !availableTableNumbers.includes(tn),
          );

          if (unavailableTables.length > 0) {
            setAvailabilityError(
              `Table(s) ${unavailableTables.join(", ")} are not available at the selected time. ` +
                `Please choose a different time or contact staff to change tables.`,
            );
          } else {
            setAvailabilityError(null);
          }
        }
      } catch (error) {
        console.log("Error checking table availability:", error);
      } finally {
        setCheckingTableAvailability(false);
      }
    };

    if (hasDateTimeChanged()) {
      checkCurrentTablesAvailability();
    } else {
      setAvailabilityError(null);
    }
  }, [reservationDate, timeSlot, currentTables, availability]);

  // Calculate current capacity
  const currentCapacity = currentTables.reduce(
    (sum, table) => sum + table.capacity,
    0,
  );
  const isPartySizeValid = partySize && partySize <= currentCapacity;

  // Check if party size exceeds current table capacity
  useEffect(() => {
    if (partySize && currentCapacity > 0 && partySize > currentCapacity) {
      setCapacityError(
        `Current tables can only accommodate ${currentCapacity} people. Please reduce party size to ${currentCapacity} or add more tables.`,
      );
    } else {
      setCapacityError(null);
    }
  }, [partySize, currentCapacity]);

  // Populate form when reservation data loads
  useEffect(() => {
    if (data?.data && !form.getValues("reservationDate")) {
      const reservation = data.data;
      const date = format(new Date(reservation.reservationDate), "yyyy-MM-dd");
      const timeSlotFormatted = format(
        new Date(reservation.reservationDate),
        "HH:mm",
      );

      form.reset({
        reservationDate: date,
        timeSlot: timeSlotFormatted,
        partySize: reservation.partySize,
        specialRequests: reservation.specialRequests || "",
        status: reservation.status,
      });
      setSelectedDate(new Date(reservation.reservationDate));
    }
  }, [data, form]);

  const onSubmit = (formData: UpdateReservationInput) => {
    // Clear previous errors
    setCapacityError(null);
    setAvailabilityError(null);

    // Validate party size against current tables before submitting
    if (
      currentCapacity > 0 &&
      formData.partySize &&
      formData.partySize > currentCapacity
    ) {
      setCapacityError(
        `Current tables can only accommodate ${currentCapacity} people. Please reduce party size to ${currentCapacity} or contact staff to add more tables.`,
      );
      return;
    }

    // Validate tables are available for new time
    if (hasDateTimeChanged() && availabilityError) {
      return;
    }

    const updateData: any = { ...formData };

    if (formData.reservationDate && formData.timeSlot) {
      updateData.reservationDate = `${formData.reservationDate}T${formData.timeSlot}:00`;
      delete updateData.timeSlot;
    }

    updateReservation.mutate({ id, data: updateData });
  };

  const hasDateTimeChanged = () => {
    if (!data?.data) return false;
    const originalDate = format(
      new Date(data.data.reservationDate),
      "yyyy-MM-dd",
    );
    const originalTime = format(new Date(data.data.reservationDate), "HH:mm");
    return (
      originalDate !== form.watch("reservationDate") ||
      originalTime !== form.watch("timeSlot")
    );
  };

  const hasPartySizeChanged = () => {
    if (!data?.data) return false;
    return data.data.partySize !== form.watch("partySize");
  };

  const isSubmitDisabled = () => {
    if (updateReservation.isPending) return true;
    if (capacityError) return true;
    if (hasDateTimeChanged() && availabilityError) return true;
    if (
      hasDateTimeChanged() &&
      !checkingAvailability &&
      availability?.data.totalAvailable === 0
    )
      return true;
    if (
      hasPartySizeChanged() &&
      partySize &&
      currentCapacity > 0 &&
      partySize > currentCapacity
    )
      return true;
    return false;
  };

  const getSubmitButtonText = () => {
    if (updateReservation.isPending) return "Updating...";
    if (hasDateTimeChanged() && checkingAvailability)
      return "Checking Availability...";
    if (hasDateTimeChanged() && !availability?.data.totalAvailable)
      return "No Tables Available";
    if (capacityError) return "Fix Capacity Issue";
    if (availabilityError) return "Fix Availability Issue";
    return "Update Reservation";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Update Reservation</DialogTitle>
          <DialogDescription>
            Make changes to your reservation here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>

        {loadingReservation ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Current Reservation Info */}
              {data?.data && (
                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                  <p className="text-sm font-medium">
                    Current Reservation Details:
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-muted-foreground">Date:</span>
                    <span>
                      {format(new Date(data.data.reservationDate), "PPP")}
                    </span>
                    <span className="text-muted-foreground">Time:</span>
                    <span>
                      {format(new Date(data.data.reservationDate), "h:mm a")}
                    </span>
                    <span className="text-muted-foreground">Party Size:</span>
                    <span>{data.data.partySize}</span>
                    <span className="text-muted-foreground">Tables:</span>
                    <span>
                      {data.data.tables && data.data.tables.length > 0 ? (
                        <div className="space-y-1">
                          {data.data.tables.map((t) => (
                            <div
                              key={t.tableNumber}
                              className="flex items-center gap-2"
                            >
                              <Badge variant="outline">
                                Table {t.tableNumber}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                (Capacity: {t.capacity})
                              </span>
                            </div>
                          ))}
                          <p className="text-xs text-muted-foreground mt-1">
                            Total Capacity: {currentCapacity} people
                          </p>
                        </div>
                      ) : (
                        "-"
                      )}
                    </span>
                  </div>
                </div>
              )}

              {/* Party Size Field with Capacity Indicator */}
              <FormField
                control={form.control}
                name="partySize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Party Size</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          field.onChange(value);
                          // Real-time capacity validation
                          if (value > currentCapacity && currentCapacity > 0) {
                            setCapacityError(
                              `Maximum capacity for current tables is ${currentCapacity} people`,
                            );
                          } else {
                            setCapacityError(null);
                          }
                        }}
                        min={1}
                        max={currentCapacity > 0 ? currentCapacity : 50}
                      />
                    </FormControl>
                    {currentCapacity > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Maximum for current tables: {currentCapacity} people
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Capacity Warning */}
              {capacityError && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="font-medium">
                    {capacityError}
                  </AlertDescription>
                </Alert>
              )}

              {/* Date Field */}
              <FormField
                control={form.control}
                name="reservationDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>New Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            {field.value ? (
                              format(new Date(field.value), "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={
                            field.value ? new Date(field.value) : undefined
                          }
                          onSelect={(date) => {
                            if (date) {
                              field.onChange(format(date, "yyyy-MM-dd"));
                              setSelectedDate(date);
                            }
                          }}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Time Slot Field */}
              <FormField
                control={form.control}
                name="timeSlot"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Time Slot</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a time slot" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {timeSlots.map((slot) => (
                          <SelectItem key={slot} value={slot}>
                            {new Date(
                              `2000-01-01T${slot}:00`,
                            ).toLocaleTimeString([], {
                              hour: "numeric",
                              minute: "2-digit",
                              hour12: true,
                            })}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Availability Check for New Time */}
              {reservationDate &&
                timeSlot &&
                partySize &&
                hasDateTimeChanged() && (
                  <>
                    {checkingAvailability || checkingTableAvailability ? (
                      <Alert>
                        <AlertDescription className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Checking availability for{" "}
                          {format(
                            new Date(`${reservationDate}T${timeSlot}`),
                            "PPP 'at' h:mm a",
                          )}
                          ...
                        </AlertDescription>
                      </Alert>
                    ) : availability?.data.totalAvailable! > 0 ? (
                      <>
                        <Alert
                          variant="default"
                          className="border-green-500 bg-green-50 dark:bg-green-950"
                        >
                          <AlertDescription>
                            <div className="space-y-2">
                              <p className="font-semibold text-green-700 dark:text-green-300">
                                ✓ {availability?.data.totalAvailable} table(s)
                                available for {partySize} people
                              </p>
                              {currentTables.length > 0 && (
                                <div className="text-sm">
                                  <p className="font-medium mb-1">
                                    Your current tables at this time:
                                  </p>
                                  {availability?.data.availableTables.some(
                                    (t) =>
                                      currentTables.some(
                                        (ct) =>
                                          ct.tableNumber === t.tableNumber,
                                      ),
                                  ) ? (
                                    <div className="space-y-1">
                                      {currentTables.map((table) => {
                                        const isAvailable =
                                          availability.data.availableTables.some(
                                            (t) =>
                                              t.tableNumber ===
                                              table.tableNumber,
                                          );
                                        return (
                                          <div
                                            key={table.tableNumber}
                                            className="flex items-center gap-2"
                                          >
                                            <Badge
                                              variant={
                                                isAvailable
                                                  ? "default"
                                                  : "destructive"
                                              }
                                            >
                                              Table {table.tableNumber}
                                            </Badge>
                                            <span className="text-xs">
                                              {isAvailable
                                                ? "✓ Available"
                                                : "✗ Not Available"}
                                            </span>
                                          </div>
                                        );
                                      })}
                                      {!availabilityError &&
                                        currentTables.every((t) =>
                                          availability.data.availableTables.some(
                                            (at) =>
                                              at.tableNumber === t.tableNumber,
                                          ),
                                        ) && (
                                          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                            All your current tables are
                                            available at this time!
                                          </p>
                                        )}
                                    </div>
                                  ) : (
                                    <p className="text-sm text-yellow-600 dark:text-yellow-400">
                                      Your current tables are not available.
                                      Please choose different tables or time.
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          </AlertDescription>
                        </Alert>

                        {/* Suggested Tables if current tables aren't available */}
                        {currentTables.length > 0 &&
                          !availability?.data.availableTables.some((t) =>
                            currentTables.some(
                              (ct) => ct.tableNumber === t.tableNumber,
                            ),
                          ) &&
                          availability?.data.combinations &&
                          availability.data.combinations.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-sm font-medium">
                                Suggested table combinations for {partySize}{" "}
                                people:
                              </p>
                              <ScrollArea className="h-[200px]">
                                <div className="space-y-2">
                                  {availability.data.combinations
                                    .slice(0, 5)
                                    .map((combo, idx) => (
                                      <Card key={idx} className="p-3">
                                        <div className="flex justify-between items-center">
                                          <div>
                                            <p className="text-sm font-medium">
                                              Tables:{" "}
                                              {combo.tables
                                                .map((t) => t.tableNumber)
                                                .join(", ")}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                              Total Capacity:{" "}
                                              {combo.totalCapacity} people
                                            </p>
                                          </div>
                                          <Badge variant="outline">
                                            {combo.numberOfTables} table(s)
                                          </Badge>
                                        </div>
                                      </Card>
                                    ))}
                                </div>
                              </ScrollArea>
                              <p className="text-xs text-muted-foreground">
                                Note: Changing tables will require staff
                                assistance. Please contact the host.
                              </p>
                            </div>
                          )}
                      </>
                    ) : (
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <div className="space-y-2">
                            <p className="font-semibold">
                              No tables available for {partySize} people at{" "}
                              {format(
                                new Date(`${reservationDate}T${timeSlot}`),
                                "h:mm a",
                              )}
                            </p>
                            <p className="text-sm">
                              Please try a different time or date.
                            </p>
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}
                  </>
                )}

              {/* Availability Error */}
              {availabilityError && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{availabilityError}</AlertDescription>
                </Alert>
              )}

              {/* Status Field (Admin/Staff only) */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Special Requests Field */}
              <FormField
                control={form.control}
                name="specialRequests"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Special Requests</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any special requests? (e.g., window seat, allergies, etc.)"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitDisabled()}
                  className={
                    isSubmitDisabled() &&
                    hasDateTimeChanged() &&
                    !availability?.data.totalAvailable
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }
                >
                  {updateReservation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    getSubmitButtonText()
                  )}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}

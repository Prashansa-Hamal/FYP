"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import {
  CalendarIcon,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  MessageSquare,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormDescription,
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CreateReservationInput, createReservationSchema } from "@/schemas";
import {
  useAvailableTables,
  useCreateReservation,
} from "@/hooks/useReservations";

const timeSlots = [
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
  "19:30",
  "20:00",
  "20:30",
];

export function ReservationForm() {
  const [date, setDate] = useState<Date>();
  const [showAvailabilityDetails, setShowAvailabilityDetails] = useState(false);

  const form = useForm<CreateReservationInput>({
    resolver: zodResolver(createReservationSchema),
    defaultValues: {
      partySize: 2,
      specialRequests: "",
    },
  });

  const selectedDate = form.watch("reservationDate");
  const selectedTimeSlot = form.watch("timeSlot");
  const partySize = form.watch("partySize");

  const { data: availability, isLoading: checkingAvailability } =
    useAvailableTables(
      {
        date: selectedDate || "",
        timeSlot: selectedTimeSlot,
        partySize,
      },
      {
        enabled: !!(selectedDate && selectedTimeSlot && partySize),
      },
    );

  const createReservation = useCreateReservation();

  const onSubmit = (data: CreateReservationInput) => {
    const reservationDateTime = `${data.reservationDate}T${data.timeSlot}:00`;
    createReservation.mutate({
      reservationDate: reservationDateTime,
      partySize: data.partySize,
      specialRequests: data.specialRequests,
    });
    form.reset();
    setDate(undefined);
    setShowAvailabilityDetails(false);
  };

  const isAvailable = availability?.data.totalAvailable ?? 0 > 0;

  return (
    <Card className="rounded-xl border-gray-100 shadow-sm">
      <CardHeader className="border-b border-gray-100">
        <CardTitle className="text-xl font-semibold text-gray-900">
          Make a Reservation
        </CardTitle>
        <CardDescription className="text-gray-500">
          Reserve your table for an unforgettable dining experience
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Date Field */}
            <FormField
              control={form.control}
              name="reservationDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Select Date <span className="text-red-500">*</span>
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal rounded-xl border-gray-200",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 text-amber-500" />
                          {field.value ? (
                            format(new Date(field.value), "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto p-0 rounded-xl"
                      align="start"
                    >
                      <Calendar
                        mode="single"
                        selected={
                          field.value ? new Date(field.value) : undefined
                        }
                        onSelect={(date) => {
                          if (date) {
                            field.onChange(format(date, "yyyy-MM-dd"));
                            setDate(date);
                            setShowAvailabilityDetails(false);
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
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Time Slot <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      setShowAvailabilityDetails(false);
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="rounded-xl border-gray-200">
                        <SelectValue placeholder="Select a time slot" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {timeSlots.map((slot) => (
                        <SelectItem key={slot} value={slot}>
                          {new Date(`2000-01-01T${slot}:00`).toLocaleTimeString(
                            [],
                            {
                              hour: "numeric",
                              minute: "2-digit",
                              hour12: true,
                            },
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Party Size Field */}
            <FormField
              control={form.control}
              name="partySize"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Party Size <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="number"
                        placeholder="Number of guests"
                        className="pl-10 rounded-xl border-gray-200"
                        {...field}
                        onChange={(e) => {
                          field.onChange(parseInt(e.target.value));
                          setShowAvailabilityDetails(false);
                        }}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Availability Check */}
            {selectedDate && selectedTimeSlot && partySize && (
              <>
                {checkingAvailability ? (
                  <Alert className="bg-amber-50 border-amber-100 rounded-xl">
                    <AlertDescription className="flex items-center gap-2 text-amber-700">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Checking availability for{" "}
                      {format(
                        new Date(`${selectedDate}T${selectedTimeSlot}`),
                        "PPP 'at' h:mm a",
                      )}
                      ...
                    </AlertDescription>
                  </Alert>
                ) : isAvailable ? (
                  <>
                    <Alert
                      className="border-green-200 bg-green-50 rounded-xl cursor-pointer"
                      onClick={() =>
                        setShowAvailabilityDetails(!showAvailabilityDetails)
                      }
                    >
                      <AlertDescription>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="font-medium text-green-700">
                              ✓ {availability?.data.totalAvailable} table(s)
                              available for {partySize} people
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs text-green-700"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setShowAvailabilityDetails(
                                !showAvailabilityDetails,
                              );
                            }}
                          >
                            {showAvailabilityDetails ? "Hide" : "Show"} details
                          </Button>
                        </div>
                      </AlertDescription>
                    </Alert>

                    {/* Availability Details */}
                    {showAvailabilityDetails &&
                      availability?.data.combinations && (
                        <div className="space-y-3 animate-in slide-in-from-top-2 duration-200">
                          <p className="text-sm font-medium text-gray-700">
                            Available table combinations:
                          </p>
                          <ScrollArea className="h-[280px] sm:h-[320px]">
                            <div className="space-y-3 pr-4">
                              {availability.data.combinations
                                .slice(0, 5)
                                .map((combo, idx) => (
                                  <div
                                    key={idx}
                                    className="group relative bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-lg hover:border-amber-200 transition-all duration-300"
                                  >
                                    <div className="p-4">
                                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                                        {/* Left Section - Table Details */}
                                        <div className="flex-1 space-y-3">
                                          {/* Header with Table Numbers */}
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center">
                                              <MapPin className="w-3.5 h-3.5 text-amber-600" />
                                            </div>
                                            <span className="text-sm font-medium text-gray-700">
                                              Tables:
                                            </span>
                                            <div className="flex flex-wrap gap-1.5">
                                              {combo.tables.map((table) => (
                                                <span
                                                  key={table.tableNumber}
                                                  className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 text-xs font-medium border border-amber-100"
                                                >
                                                  #{table.tableNumber}
                                                </span>
                                              ))}
                                            </div>
                                          </div>

                                          {/* Table Capacity Details */}
                                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-8">
                                            {combo.tables.map((table) => (
                                              <div
                                                key={table.tableNumber}
                                                className="flex items-center justify-between bg-gray-50/80 rounded-lg px-3 py-2 group-hover:bg-amber-50/50 transition-colors duration-200"
                                              >
                                                <div className="flex items-center gap-2">
                                                  <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm">
                                                    <span className="text-xs font-semibold text-gray-600">
                                                      {table.tableNumber}
                                                    </span>
                                                  </div>
                                                  <span className="text-xs text-gray-600">
                                                    Table
                                                  </span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                  <Users className="w-3 h-3 text-amber-500" />
                                                  <span className="text-sm font-medium text-gray-700">
                                                    {table.capacity} seats
                                                  </span>
                                                </div>
                                              </div>
                                            ))}
                                          </div>

                                          {/* Total Capacity Summary */}
                                          <div className="flex items-center gap-3 pt-1 pl-8">
                                            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
                                            <div className="flex items-center gap-2 bg-gradient-to-r from-amber-50 to-orange-50 px-3 py-1.5 rounded-full">
                                              <Users className="w-3.5 h-3.5 text-amber-500" />
                                              <span className="text-xs font-medium text-gray-600">
                                                Total Capacity:
                                              </span>
                                              <span className="text-sm font-bold text-amber-600">
                                                {combo.totalCapacity}
                                              </span>
                                              <span className="text-xs text-gray-500">
                                                people
                                              </span>
                                            </div>
                                            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
                                          </div>
                                        </div>

                                        {/* Right Section - Badge */}
                                        <div className="flex items-center justify-start sm:justify-end">
                                          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 shadow-sm group-hover:shadow-md transition-all duration-200">
                                            <Users className="w-4 h-4 text-white" />
                                            <span className="text-sm font-semibold text-white">
                                              {combo.numberOfTables}{" "}
                                              {combo.numberOfTables === 1
                                                ? "Table"
                                                : "Tables"}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Animated Border on Hover */}
                                    <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                                  </div>
                                ))}
                            </div>
                          </ScrollArea>
                        </div>
                      )}
                  </>
                ) : (
                  <Alert variant="destructive" className="rounded-xl">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-2">
                        <p className="font-semibold">
                          No tables available for {partySize} people at{" "}
                          {format(
                            new Date(`${selectedDate}T${selectedTimeSlot}`),
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

            {/* Special Requests Field */}
            <FormField
              control={form.control}
              name="specialRequests"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Special Requests
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Textarea
                        placeholder="Any special requests? (e.g., window seat, allergies, etc.)"
                        className="pl-10 resize-none rounded-xl border-gray-200"
                        rows={3}
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormDescription className="text-xs text-gray-500">
                    We'll do our best to accommodate your requests
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-600 text-white h-12 rounded-xl transition-all duration-200"
              disabled={
                createReservation.isPending ||
                ((selectedDate &&
                  selectedTimeSlot &&
                  partySize &&
                  !isAvailable) as boolean)
              }
            >
              {createReservation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Reservation...
                </>
              ) : (
                "Reserve Table"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

"use client";

import { useState } from "react";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CalendarIcon,
  Loader2,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckAvailabilityInput, checkAvailabilitySchema } from "@/schemas";
import { useAvailableTables } from "@/hooks/useReservations";

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

export function CheckAvailability() {
  const [selectedDate, setSelectedDate] = useState<Date>();

  const form = useForm<CheckAvailabilityInput>({
    resolver: zodResolver(checkAvailabilitySchema),
    defaultValues: {
      partySize: 2,
    },
  });

  const date = form.watch("date");
  const timeSlot = form.watch("timeSlot");
  const partySize = form.watch("partySize");

  const { data, isLoading } = useAvailableTables({
    date,
    timeSlot,
    partySize,
  });

  const isAvailable = data?.data.totalAvailable ?? 0 > 0;

  return (
    <Card className="rounded-xl border-gray-100 shadow-sm">
      <CardHeader className="border-b border-gray-100">
        <CardTitle className="text-xl font-semibold text-gray-900">
          Check Table Availability
        </CardTitle>
        <CardDescription className="text-gray-500">
          Find available tables for your preferred date and time
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <Form {...form}>
          <form className="space-y-5">
            {/* Date Field */}
            <FormField
              control={form.control}
              name="date"
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
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Time Slot <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
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
                      <input
                        type="number"
                        className="w-full pl-10 h-11 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value))
                        }
                        min={1}
                        max={20}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Results */}
            {date && timeSlot && partySize && (
              <div className="space-y-4 mt-6">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
                  </div>
                ) : (
                  <>
                    <div
                      className={cn(
                        "rounded-xl p-4 text-center",
                        isAvailable
                          ? "bg-green-50 border border-green-200"
                          : "bg-red-50 border border-red-200",
                      )}
                    >
                      <div className="flex items-center justify-center gap-2">
                        {isAvailable ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                        <p
                          className={cn(
                            "font-semibold",
                            isAvailable ? "text-green-700" : "text-red-700",
                          )}
                        >
                          {isAvailable
                            ? `${data?.data.totalAvailable} table(s) available`
                            : "No tables available for this time slot"}
                        </p>
                      </div>
                    </div>

                    {isAvailable &&
                      data?.data.combinations &&
                      data.data.combinations.length > 0 && (
                        <div className="space-y-3">
                          <h3 className="font-medium text-gray-900">
                            Suggested Table Combinations:
                          </h3>
                          <ScrollArea className="h-[300px]">
                            <div className="space-y-2">
                              {data.data.combinations
                                .slice(0, 5)
                                .map((combo, index) => (
                                  <div
                                    key={index}
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
                )}
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

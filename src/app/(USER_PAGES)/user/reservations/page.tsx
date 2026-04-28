"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReservationForm } from "@/components/reservations/reservation-form";
import { MyReservationsList } from "@/components/reservations/my-reservations-list";
import { CheckAvailability } from "@/components/reservations/check-availability";
import {
  MapPin,
  Phone,
  Wifi,
  Calendar,
  Clock,
  Users,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ReservationsPage() {
  const [activeTab, setActiveTab] = useState("upcoming");

  const tabs = [
    {
      value: "upcoming",
      label: "Upcoming",
      icon: Clock,
      mobileLabel: "Upcoming",
    },
    {
      value: "new",
      label: "New Reservation",
      icon: Calendar,
      mobileLabel: "New",
    },
    {
      value: "availability",
      label: "Check Availability",
      icon: Users,
      mobileLabel: "Availability",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f1ed] to-[#e8e3dd] p-2 sm:p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Hero Header */}
          <div className="relative bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
                <Calendar className="w-8 h-8" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                Reservations
              </h1>
              <p className="text-white/90 text-sm">
                Book your table for an unforgettable dining experience
              </p>
            </div>
          </div>

          {/* Restaurant Info Bar */}
          <div className="bg-gray-50 border-b border-gray-100 px-4 py-3">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-500" />
                <span className="hidden sm:inline">
                  123 Main Street, Kathmandu
                </span>
                <span className="sm:hidden">Kathmandu</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-500" />
                <span>+977 9801234567</span>
              </div>
              <div className="flex items-center gap-2">
                <Wifi className="w-4 h-4 text-amber-500" />
                <span className="hidden sm:inline">WiFi: DineEase</span>
                <span className="sm:hidden">WiFi</span>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {/* Desktop Tabs */}
            <div className="hidden sm:block">
              <Tabs defaultValue="upcoming" className="space-y-6">
                <TabsList className="grid w-full max-w-lg grid-cols-3 bg-gray-100 p-1 rounded-xl mx-auto">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <TabsTrigger
                        key={tab.value}
                        value={tab.value}
                        className="data-[state=active]:bg-white data-[state=active]:text-amber-600 rounded-lg transition-all"
                      >
                        <Icon className="w-4 h-4 mr-2" />
                        {tab.label}
                      </TabsTrigger>
                    );
                  })}
                </TabsList>

                <TabsContent value="upcoming">
                  <MyReservationsList />
                </TabsContent>
                <TabsContent value="new">
                  <ReservationForm />
                </TabsContent>
                <TabsContent value="availability">
                  <CheckAvailability />
                </TabsContent>
              </Tabs>
            </div>

            {/* Mobile Dropdown */}
            <div className="sm:hidden">
              <Select value={activeTab} onValueChange={setActiveTab}>
                <SelectTrigger className="w-full bg-gray-100 border-0 rounded-xl h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <SelectItem key={tab.value} value={tab.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-amber-500" />
                          <span>{tab.label}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>

              <div className="mt-6">
                {activeTab === "upcoming" && <MyReservationsList />}
                {activeTab === "new" && <ReservationForm />}
                {activeTab === "availability" && <CheckAvailability />}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center py-4 border-t border-gray-100 bg-gray-50/50">
            <p className="text-xs text-gray-400">Powered by QR Menu System</p>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";
import {
  Users,
  Phone,
  Mail,
  Clock,
  Calendar,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useState } from "react";

type ReservationStatus =
  | "confirmed"
  | "seated"
  | "completed"
  | "cancelled"
  | "no-show";

interface Reservation {
  id: string;
  customerName: string;
  phone: string;
  email: string;
  date: string;
  time: string;
  guests: number;
  table?: string;
  status: ReservationStatus;
  specialRequests?: string;
}

export default function ReservationsView() {
  const [filter, setFilter] = useState<"today" | "upcoming" | "all">("today");

  const [reservations] = useState<Reservation[]>([
    {
      id: "RES-001",
      customerName: "Sarah Johnson",
      phone: "(555) 123-4567",
      email: "sarah.j@email.com",
      date: "2026-02-04",
      time: "12:30 PM",
      guests: 4,
      table: "Table 15",
      status: "confirmed",
      specialRequests: "Window seat preferred",
    },
    {
      id: "RES-002",
      customerName: "Michael Chen",
      phone: "(555) 234-5678",
      email: "m.chen@email.com",
      date: "2026-02-04",
      time: "1:00 PM",
      guests: 2,
      table: "Table 7",
      status: "confirmed",
    },
    {
      id: "RES-003",
      customerName: "Emily Brown",
      phone: "(555) 345-6789",
      email: "emily.b@email.com",
      date: "2026-02-04",
      time: "1:30 PM",
      guests: 6,
      table: "Table 10",
      status: "confirmed",
      specialRequests: "Birthday celebration",
    },
    {
      id: "RES-004",
      customerName: "David Martinez",
      phone: "(555) 456-7890",
      email: "d.martinez@email.com",
      date: "2026-02-04",
      time: "6:00 PM",
      guests: 3,
      status: "confirmed",
    },
    {
      id: "RES-005",
      customerName: "Jennifer Lee",
      phone: "(555) 567-8901",
      email: "j.lee@email.com",
      date: "2026-02-04",
      time: "7:30 PM",
      guests: 2,
      status: "confirmed",
      specialRequests: "Vegetarian options needed",
    },
    {
      id: "RES-006",
      customerName: "Robert Wilson",
      phone: "(555) 678-9012",
      email: "r.wilson@email.com",
      date: "2026-02-05",
      time: "12:00 PM",
      guests: 4,
      status: "confirmed",
    },
    {
      id: "RES-007",
      customerName: "Amanda Taylor",
      phone: "(555) 789-0123",
      email: "a.taylor@email.com",
      date: "2026-02-05",
      time: "6:30 PM",
      guests: 5,
      status: "confirmed",
    },
    {
      id: "RES-008",
      customerName: "James Anderson",
      phone: "(555) 890-1234",
      email: "j.anderson@email.com",
      date: "2026-02-04",
      time: "11:30 AM",
      guests: 2,
      table: "Table 3",
      status: "seated",
    },
  ]);

  const statusConfig = {
    confirmed: {
      label: "Confirmed",
      color: "bg-blue-100 text-blue-700 border-blue-300",
      icon: CheckCircle,
    },
    seated: {
      label: "Seated",
      color: "bg-green-100 text-green-700 border-green-300",
      icon: CheckCircle,
    },
    completed: {
      label: "Completed",
      color: "bg-gray-100 text-gray-700 border-gray-300",
      icon: CheckCircle,
    },
    cancelled: {
      label: "Cancelled",
      color: "bg-red-100 text-red-700 border-red-300",
      icon: XCircle,
    },
    "no-show": {
      label: "No Show",
      color: "bg-orange-100 text-orange-700 border-orange-300",
      icon: XCircle,
    },
  };

  const today = "2026-02-04";

  const filteredReservations = reservations.filter((res) => {
    if (filter === "today") return res.date === today;
    if (filter === "upcoming") return res.date > today;
    return true;
  });

  const todayStats = {
    total: reservations.filter((r) => r.date === today).length,
    confirmed: reservations.filter(
      (r) => r.date === today && r.status === "confirmed",
    ).length,
    seated: reservations.filter(
      (r) => r.date === today && r.status === "seated",
    ).length,
    guests: reservations
      .filter((r) => r.date === today)
      .reduce((sum, r) => sum + r.guests, 0),
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <p className="text-sm text-gray-500 mb-1">Today's Reservations</p>
          <p className="text-3xl font-semibold text-gray-900">
            {todayStats.total}
          </p>
        </div>
        <div className="bg-blue-50 rounded-lg shadow-sm p-6 border border-blue-200">
          <p className="text-sm text-blue-700 mb-1">Confirmed</p>
          <p className="text-3xl font-semibold text-blue-700">
            {todayStats.confirmed}
          </p>
        </div>
        <div className="bg-green-50 rounded-lg shadow-sm p-6 border border-green-200">
          <p className="text-sm text-green-700 mb-1">Seated</p>
          <p className="text-3xl font-semibold text-green-700">
            {todayStats.seated}
          </p>
        </div>
        <div className="bg-purple-50 rounded-lg shadow-sm p-6 border border-purple-200">
          <p className="text-sm text-purple-700 mb-1">Expected Guests</p>
          <p className="text-3xl font-semibold text-purple-700">
            {todayStats.guests}
          </p>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter("today")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === "today"
                ? "bg-orange-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setFilter("upcoming")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === "upcoming"
                ? "bg-orange-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === "all"
                ? "bg-orange-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All
          </button>
        </div>
      </div>

      {/* Reservations List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredReservations.map((reservation) => {
          const StatusIcon = statusConfig[reservation.status].icon;

          return (
            <div
              key={reservation.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Users className="w-6 h-6 text-orange-600" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {reservation.customerName}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusConfig[reservation.status].color}`}
                        >
                          <div className="flex items-center gap-1">
                            <StatusIcon className="w-3 h-3" />
                            {statusConfig[reservation.status].label}
                          </div>
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600 mb-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(reservation.date).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{reservation.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span>{reservation.guests} guests</span>
                        </div>
                        {reservation.table && (
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-orange-600">
                              {reservation.table}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          <span>{reservation.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          <span>{reservation.email}</span>
                        </div>
                      </div>

                      {reservation.specialRequests && (
                        <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                          <p className="text-sm text-yellow-800">
                            <span className="font-medium">
                              Special Request:{" "}
                            </span>
                            {reservation.specialRequests}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex lg:flex-col gap-2">
                  {reservation.status === "confirmed" && (
                    <>
                      <button className="flex-1 lg:flex-none px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors whitespace-nowrap">
                        Mark as Seated
                      </button>
                      <button className="flex-1 lg:flex-none px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                        Edit
                      </button>
                    </>
                  )}
                  {reservation.status === "seated" && (
                    <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors whitespace-nowrap">
                      Complete
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredReservations.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-500">No reservations found.</p>
        </div>
      )}
    </div>
  );
}

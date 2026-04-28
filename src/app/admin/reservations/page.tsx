import { StaffReservationsDashboard } from "@/components/reservations/staff-reservations-dashboard";

export default function ReservationsPage() {
  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-6">Reservations Management</h1>
      <StaffReservationsDashboard />
    </div>
  );
}

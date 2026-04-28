import { UserRole } from "@/generated/enums";
import db from "@/lib/db";
import { addDays, addMinutes, setHours, setMinutes } from "date-fns";

export async function createReservations() {
  console.log("Creating reservations...");

  const users = await db.user.findMany({
    where: { role: UserRole.USER },
  });
  const tables = await db.table.findMany();

  // Create reservations for the next 30 days
  const startDate = new Date();
  const endDate = addDays(startDate, 30);

  for (let day = 0; day < 30; day++) {
    const currentDate = addDays(startDate, day);

    // More reservations on weekends
    const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;
    const numReservations = isWeekend ? 15 : 8;

    for (let i = 0; i < numReservations; i++) {
      // Random time between 11 AM and 10 PM
      const hour = 11 + Math.floor(Math.random() * 11);
      const minute = [0, 15, 30, 45][Math.floor(Math.random() * 4)];

      const reservationDate = setMinutes(setHours(currentDate, hour), minute);
      const partySize = [2, 4, 6][Math.floor(Math.random() * 3)];

      // Find available table (simplified - just assign random)
      const table = tables[Math.floor(Math.random() * tables.length)];
      const user = users[Math.floor(Math.random() * users.length)];

      // Random status based on date
      let status;
      const now = new Date();

      if (reservationDate < now) {
        // Past reservations
        const statusRoll = Math.random();
        if (statusRoll < 0.7) status = "COMPLETED";
        else if (statusRoll < 0.9) status = "CANCELLED";
        else status = "CONFIRMED";
      } else {
        // Future reservations
        status = Math.random() > 0.2 ? "CONFIRMED" : "PENDING";
      }

      await db.reservation.create({
        data: {
          userId: user.id,
          reservationDate,
          partySize,
          tableNumber: table.tableNumber,
          specialRequests: Math.random() > 0.7 ? "Prefer window table" : null,
          status,
          checkedInAt:
            status === "COMPLETED" ? addMinutes(reservationDate, -5) : null,
          completedAt:
            status === "COMPLETED" ? addMinutes(reservationDate, 90) : null,
          cancelledAt:
            status === "CANCELLED" ? addMinutes(reservationDate, -30) : null,
          tables: {
            connect: { id: table.id },
          },
        },
      });
    }
  }

  console.log("Created reservations");
}

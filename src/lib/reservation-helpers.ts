import db from "@/lib/db";

export async function getAvailableTables(dateTime: Date, partySize: number) {
  const startTime = new Date(dateTime);
  const endTime = new Date(dateTime);
  endTime.setHours(endTime.getHours() + 2); // Assume 2-hour reservation window

  // Get all tables
  const allTables = await db.table.findMany();

  // Get reservations in the time window
  const reservations = await db.reservation.findMany({
    where: {
      reservationDate: {
        gte: startTime,
        lt: endTime,
      },
      status: { not: "CANCELLED" },
    },
    include: {
      tables: true,
    },
  });

  // Get booked table numbers
  const bookedTableNumbers = new Set();
  reservations.forEach((res) => {
    res.tables.forEach((table) => {
      bookedTableNumbers.add(table.tableNumber);
    });
  });

  // Return available tables that can accommodate party size
  return allTables.filter(
    (table) =>
      !bookedTableNumbers.has(table.tableNumber) && table.capacity >= partySize,
  );
}

export async function checkTablesAvailability(
  tableNumbers: number[],
  dateTime: Date,
  excludeReservationId?: string,
) {
  const startTime = new Date(dateTime);
  const endTime = new Date(dateTime);
  endTime.setHours(endTime.getHours() + 2); // Assume 2-hour reservation window

  // Build where clause for conflicting reservations
  let whereClause: any = {
    reservationDate: {
      gte: startTime,
      lt: endTime,
    },
    status: { not: "CANCELLED" },
    tables: {
      some: {
        tableNumber: { in: tableNumbers },
      },
    },
  };

  if (excludeReservationId) {
    whereClause.id = { not: excludeReservationId };
  }

  const conflictingReservations = await db.reservation.findMany({
    where: whereClause,
    include: {
      tables: true,
    },
  });

  // Check if any of the tables are booked
  const conflictingTableNumbers = new Set();
  conflictingReservations.forEach((res) => {
    res.tables.forEach((table) => {
      conflictingTableNumbers.add(table.tableNumber);
    });
  });

  for (const tableNum of tableNumbers) {
    if (conflictingTableNumbers.has(tableNum)) {
      return false;
    }
  }

  return true;
}

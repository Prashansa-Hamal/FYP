import { PreparationStation, UserRole } from "@/generated/enums";
import db from "@/lib/db";
import { addDays, setHours, subDays } from "date-fns";

export async function createStaffShifts() {
  console.log("Creating staff shifts...");

  const staff = await db.user.findMany({
    where: {
      role: {
        in: [
          UserRole.CHEF,
          UserRole.BARTENDER,
          UserRole.WAITER,
          UserRole.MANAGER,
        ],
      },
    },
  });

  // Create shifts for the last 30 days and next 7 days
  const startDate = subDays(new Date(), 30);
  const endDate = addDays(new Date(), 7);

  for (let day = 0; day <= 37; day++) {
    const currentDate = addDays(startDate, day);
    const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;

    // Different shift patterns for different roles
    for (const staffMember of staff) {
      // Not everyone works every day
      const workProbability = isWeekend ? 0.6 : 0.8;
      if (Math.random() > workProbability) continue;

      // Determine shift time based on role
      let startHour, endHour;

      if (staffMember.role === UserRole.CHEF) {
        // Chefs come early
        startHour = 8 + Math.floor(Math.random() * 2);
        endHour = 16 + Math.floor(Math.random() * 2);
      } else if (staffMember.role === UserRole.BARTENDER) {
        // Bartenders come later
        startHour = 16 + Math.floor(Math.random() * 2);
        endHour = 24 + Math.floor(Math.random() * 2);
      } else {
        // Waiters and managers have split shifts
        const shiftType = Math.random();
        if (shiftType < 0.4) {
          // Morning shift
          startHour = 10 + Math.floor(Math.random() * 2);
          endHour = 18 + Math.floor(Math.random() * 2);
        } else if (shiftType < 0.8) {
          // Evening shift
          startHour = 16 + Math.floor(Math.random() * 2);
          endHour = 24 + Math.floor(Math.random() * 2);
        } else {
          // Double shift (long day)
          startHour = 10 + Math.floor(Math.random() * 2);
          endHour = 22 + Math.floor(Math.random() * 2);
        }
      }

      const startTime = setHours(currentDate, startHour);
      const endTime = setHours(currentDate, endHour);

      // Determine if shift is active (checked in/out)
      const now = new Date();
      let checkedInAt = null;
      let checkedOutAt = null;

      if (currentDate.toDateString() === now.toDateString()) {
        // Today's shift
        if (startTime <= now) {
          checkedInAt = startTime;
          if (endTime <= now) {
            checkedOutAt = endTime;
          }
        }
      } else if (currentDate < now) {
        // Past shift
        checkedInAt = startTime;
        checkedOutAt = endTime;
      }

      await db.staffShift.create({
        data: {
          userId: staffMember.id,
          shiftDate: currentDate,
          startTime,
          endTime,
          station:
            staffMember.role === UserRole.CHEF
              ? [
                  PreparationStation.KITCHEN,
                  PreparationStation.GRILL_STATION,
                  PreparationStation.FRY_STATION,
                ][Math.floor(Math.random() * 3)]
              : staffMember.role === UserRole.BARTENDER
                ? PreparationStation.BAR
                : null,
          checkedInAt,
          checkedOutAt,
        },
      });
    }
  }

  console.log("Created staff shifts");
}

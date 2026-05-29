import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const staff = await db.user.findMany({
    where: {
      role: {
        in: ["CHEF", "BARTENDER", "WAITER", "MANAGER"],
      },
    },
    select: {
      id: true,
      name: true,
      role: true,
    },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const performance = await Promise.all(
    staff.map(async (user) => {
      const assignments = await db.orderStationAssignment.findMany({
        where: {
          assignedTo: user.id,
          createdAt: { gte: today },
        },
      });

      const completed = assignments.filter((a) => a.status === "COMPLETED");
      const onTime = completed.filter(
        (c) =>
          c.completedAt &&
          c.estimatedCompletionTime &&
          c.completedAt <= c.estimatedCompletionTime,
      );

      const averageTime =
        completed.length > 0
          ? completed.reduce((sum, c) => {
              if (c.startedAt && c.completedAt) {
                return (
                  sum +
                  (c.completedAt.getTime() - c.startedAt.getTime()) /
                    (1000 * 60)
                );
              }
              return sum;
            }, 0) / completed.length
          : 0;

      return {
        userId: user.id,
        name: user.name,
        role: user.role,
        ordersProcessed: assignments.length,
        averageTimeMinutes: Math.round(averageTime),
        completedOnTime: onTime.length,
        lateCompletions: completed.length - onTime.length,
      };
    }),
  );

  return NextResponse.json({ data: performance });
}

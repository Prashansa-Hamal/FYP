import { TableCombination } from "@/types/reservations";
import { reservationApis } from "./reservations";

// Utility function to check if reservation can be cancelled
export function canCancelReservation(reservationDate: string): boolean {
  const reservationTime = new Date(reservationDate);
  const now = new Date();
  const hoursUntilReservation =
    (reservationTime.getTime() - now.getTime()) / (1000 * 60 * 60);

  // Can cancel if more than 2 hours before reservation
  return hoursUntilReservation > 2;
}

// Utility function to format reservation date for display
export function formatReservationDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getReservationStatusColor(
  status: string,
): "default" | "success" | "warning" | "danger" | "info" {
  switch (status) {
    case "CONFIRMED":
      return "success";
    case "CANCELLED":
      return "danger";
    case "COMPLETED":
      return "info";
    default:
      return "default";
  }
}

export function getReservationStatusText(status: string): string {
  switch (status) {
    case "CONFIRMED":
      return "Confirmed";
    case "CANCELLED":
      return "Cancelled";
    case "COMPLETED":
      return "Completed";
    default:
      return status;
  }
}

// Batch operations
export const reservationBatchApis = {
  // Cancel multiple reservations (admin only)
  async cancelMultipleReservations(
    ids: string[],
  ): Promise<{ success: boolean; message: string; failed?: string[] }> {
    const response = await fetch("/api/reservations/batch/cancel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ ids }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to cancel reservations");
    }

    return result;
  },

  // Get reservations for date range
  async getReservationsByDateRange(
    startDate: string,
    endDate: string,
  ): Promise<{ success: boolean; data: any[]; message: string }> {
    const response = await fetch(
      `/api/reservations/range?startDate=${startDate}&endDate=${endDate}`,
      {
        credentials: "include",
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch reservations by date range");
    }

    return response.json();
  },
};

// Hook-friendly functions for React components
export const reservationHooks = {
  // Check if a time slot is available
  async isTimeSlotAvailable(
    date: string,
    timeSlot: string,
    partySize: number,
  ): Promise<boolean> {
    try {
      const result = await reservationApis.getAvailableTables({
        date,
        timeSlot,
        partySize,
      });
      return result.data.totalAvailable > 0;
    } catch (error) {
      console.log("Error checking availability:", error);
      return false;
    }
  },

  // Get suggested table combinations
  async getSuggestedTables(
    date: string,
    partySize: number,
  ): Promise<TableCombination[] | null> {
    try {
      const result = await reservationApis.getAvailableTables({
        date,
        partySize,
      });
      return result.data.combinations;
    } catch (error) {
      console.log("Error getting table suggestions:", error);
      return null;
    }
  },
};

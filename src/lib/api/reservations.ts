import {
  ReservationListResponse,
  SingleReservationResponse,
  CreateReservationRequest,
  UpdateReservationRequest,
  AvailableTablesResponse,
  CheckInReservationResponse,
  CancelReservationResponse,
  ReservationFilters,
  MyReservationsFilters,
} from "@/types/reservations";

export const reservationApis = {
  // Fetch all reservations with filters and pagination
  async getReservations(
    filters?: ReservationFilters,
  ): Promise<ReservationListResponse> {
    const params = new URLSearchParams();

    // Pagination
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());

    // Search
    if (filters?.search) params.append("search", filters.search);

    // Status filter (supports array)
    if (filters?.status) {
      const statusValue = Array.isArray(filters.status)
        ? filters.status.join(",")
        : filters.status;
      params.append("status", statusValue);
    }

    // Party size filter (supports array)
    if (filters?.partySize) {
      const partySizeValue = Array.isArray(filters.partySize)
        ? filters.partySize.join(",")
        : filters.partySize.toString();
      params.append("partySize", partySizeValue);
    }

    // Date range
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);

    // User filter (admin only)
    if (filters?.userId) params.append("userId", filters.userId);

    const queryString = params.toString();
    const url = `/api/reservations${queryString ? `?${queryString}` : ""}`;

    const response = await fetch(url, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch reservations");
    }

    return response.json();
  },

  // Get current user's reservations
  async getMyReservations(
    filters?: MyReservationsFilters,
  ): Promise<ReservationListResponse> {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.upcoming !== undefined)
      params.append("upcoming", filters.upcoming.toString());

    const queryString = params.toString();
    const url = `/api/reservations/my-reservations${
      queryString ? `?${queryString}` : ""
    }`;

    const response = await fetch(url, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch your reservations");
    }

    return response.json();
  },

  // Get single reservation by ID
  async getReservationById(id: string): Promise<SingleReservationResponse> {
    const response = await fetch(`/api/reservations/${id}`, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch reservation");
    }

    return response.json();
  },

  // Create a new reservation
  async createReservation(
    data: CreateReservationRequest,
  ): Promise<SingleReservationResponse> {
    const response = await fetch("/api/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to create reservation");
    }

    return result;
  },

  // Update a reservation
  async updateReservation({
    id,
    data,
  }: {
    id: string;
    data: UpdateReservationRequest;
  }): Promise<SingleReservationResponse> {
    const response = await fetch(`/api/reservations/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to update reservation");
    }

    return result;
  },

  // Cancel a reservation
  async cancelReservation(id: string): Promise<CancelReservationResponse> {
    const response = await fetch(`/api/reservations/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to cancel reservation");
    }

    return result;
  },

  // Check-in a reservation (staff only)
  async checkInReservation(id: string): Promise<CheckInReservationResponse> {
    const response = await fetch(`/api/reservations/${id}/check-in`, {
      method: "PATCH",
      credentials: "include",
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to check in reservation");
    }

    return result;
  },

  // Check available tables
  async getAvailableTables({
    date,
    timeSlot,
    partySize,
  }: {
    date: string;
    timeSlot?: string;
    partySize?: number;
  }): Promise<AvailableTablesResponse> {
    const params = new URLSearchParams();
    params.append("date", date);
    if (timeSlot) params.append("timeSlot", timeSlot);
    if (partySize) params.append("partySize", partySize.toString());

    const response = await fetch(
      `/api/reservations/available-tables?${params.toString()}`,
      {
        credentials: "include",
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch available tables");
    }

    return response.json();
  },
};

export interface Table {
  id: string;
  tableNumber: number;
  capacity: number;
  isAvailable: boolean;
  status: "AVAILABLE" | "OCCUPIED" | "RESERVED" | "OUT_OF_SERVICE";
  location: string | null;
}

export interface ReservationUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
}

export interface Reservation {
  id: string;
  userId: string;
  reservationDate: string;
  partySize: number;
  tableNumber: number | null;
  specialRequests: string | null;
  status: "CONFIRMED" | "CANCELLED" | "COMPLETED";
  cancelledAt: string | null;
  checkedInAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user?: ReservationUser;
  tables?: Table[];
}

export interface AvailableTable {
  id: string;
  tableNumber: number;
  capacity: number;
  status: string;
  location: string | null;
}

export interface TableCombination {
  tables: AvailableTable[];
  totalCapacity: number;
  numberOfTables: number;
}

export interface AvailableTablesResponse {
  success: boolean;
  data: {
    availableTables: AvailableTable[];
    combinations: TableCombination[];
    totalAvailable: number;
    requestedPartySize: number;
    timeSlot: string;
  };
  message: string;
}

export interface CreateReservationRequest {
  reservationDate: string; // ISO date string
  partySize: number;
  tableNumbers?: number[];
  specialRequests?: string;
}

export interface UpdateReservationRequest {
  reservationDate?: string;
  partySize?: number;
  tableNumbers?: number[];
  specialRequests?: string;
  status?: "CONFIRMED" | "CANCELLED" | "COMPLETED";
}

export interface ReservationListResponse {
  success: boolean;
  data: Reservation[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  message: string;
}

export interface SingleReservationResponse {
  success: boolean;
  data: Reservation;
  message: string;
}

export interface CheckInReservationResponse {
  success: boolean;
  data: Reservation;
  message: string;
}

export interface CancelReservationResponse {
  success: boolean;
  data: Reservation;
  message: string;
}

export interface ReservationFilters {
  // Pagination
  page?: number;
  limit?: number;

  // Search
  search?: string;

  // Filters (can be single value or array)
  status?: string | string[];
  partySize?: number | number[];

  // Date range
  startDate?: string;
  endDate?: string;

  // User filter (admin only)
  userId?: string;
}

export interface MyReservationsFilters {
  status?: string;
  upcoming?: boolean;
}

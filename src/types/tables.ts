export type TableStatus = "available" | "occupied" | "reserved";

export interface Table {
  id: string;
  tableNumber: number;
  capacity: number;
  isAvailable: boolean;
  status: "AVAILABLE" | "OCCUPIED" | "RESERVED" | "OUT_OF_SERVICE";
  location: string | null;
  createdAt: string;
  updatedAt: string;
  reservations?: Reservation[];
}

export interface Reservation {
  id: string;
  reservationDate: string;
  partySize: number;
  status: string;
  specialRequests?: string;
}

export interface TableWithOrders extends Table {
  orders: Order[];
  totalItems: number;
  totalAmount: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: string;
  finalAmount: number;
  createdAt: string;
  user: {
    name: string;
  };
  items: Array<{
    id: string;
    quantity: number;
    menuItem: {
      name: string;
    };
  }>;
}

export interface TableAvailabilityRequest {
  date: string;
  timeSlot: string;
  partySize: number;
}

export interface TableCombination {
  tables: Table[];
  numberOfTables: number;
  totalCapacity: number;
  canAccommodate: boolean;
}

export interface TableAvailabilityResponse {
  totalAvailable: number;
  availableTables: Table[];
  combinations: TableCombination[];
  requestedPartySize: number;
}

export interface TableStats {
  summary: {
    totalTables: number;
    availableTables: number;
    occupiedTables: number;
    reservedTables: number;
    outOfServiceTables: number;
    utilizationRate: number;
  };
  capacity: {
    totalCapacity: number;
    availableCapacity: number;
    averageCapacity: number;
  };
  tablesByLocation: Record<string, Table[]>;
  todaysReservations: number;
}

export interface CreateTableRequest {
  tableNumber: number;
  capacity: number;
  location?: string;
  status?: Table["status"];
}

export interface UpdateTableRequest {
  tableNumber?: number;
  capacity?: number;
  location?: string;
  status?: Table["status"];
  isAvailable?: boolean;
}

export interface UpdateTableStatusRequest {
  status: Table["status"];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  count?: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  count: number;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

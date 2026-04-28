import {
  ApiResponse,
  Table,
  TableAvailabilityRequest,
  TableAvailabilityResponse,
  TableStats,
  TableWithOrders,
  CreateTableRequest,
  UpdateTableRequest,
  UpdateTableStatusRequest,
} from "@/types/tables";

const API_BASE = "/api/tables";

export const tableApi = {
  // Get all tables
  getTables: async (params?: {
    status?: string;
    isAvailable?: boolean;
    location?: string;
  }): Promise<ApiResponse<Table[]>> => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append("status", params.status);
    if (params?.isAvailable !== undefined)
      searchParams.append("isAvailable", String(params.isAvailable));
    if (params?.location) searchParams.append("location", params.location);

    const url = `${API_BASE}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
    const response = await fetch(url);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch tables");
    }

    return response.json();
  },

  // Get single table
  getTableById: async (id: string): Promise<ApiResponse<Table>> => {
    const response = await fetch(`${API_BASE}/${id}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch table");
    }

    return response.json();
  },

  // Create table
  createTable: async (
    data: CreateTableRequest,
  ): Promise<ApiResponse<Table>> => {
    const response = await fetch(API_BASE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create table");
    }

    return response.json();
  },

  // Update table
  updateTable: async (
    id: string,
    data: UpdateTableRequest,
  ): Promise<ApiResponse<Table>> => {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to update table");
    }

    return response.json();
  },

  // Delete table
  deleteTable: async (id: string): Promise<ApiResponse<null>> => {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to delete table");
    }

    return response.json();
  },

  // Update table status
  updateTableStatus: async (
    id: string,
    data: UpdateTableStatusRequest,
  ): Promise<ApiResponse<Table>> => {
    const response = await fetch(`${API_BASE}/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to update table status");
    }

    return response.json();
  },

  // Check table availability
  checkAvailability: async (
    params: TableAvailabilityRequest,
  ): Promise<ApiResponse<TableAvailabilityResponse>> => {
    const searchParams = new URLSearchParams({
      date: params.date,
      timeSlot: params.timeSlot,
      partySize: String(params.partySize),
    });

    const response = await fetch(
      `${API_BASE}/availability?${searchParams.toString()}`,
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to check availability");
    }

    return response.json();
  },

  // Get table statistics
  getTableStats: async (): Promise<ApiResponse<TableStats>> => {
    const response = await fetch(`${API_BASE}/stats`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch table statistics");
    }

    return response.json();
  },

  // Get tables with active orders
  getTablesWithOrders: async (): Promise<ApiResponse<TableWithOrders[]>> => {
    const response = await fetch(`${API_BASE}/with-orders`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch tables with orders");
    }

    return response.json();
  },
};

export type Table = {
  id: string;
  tableNumber: number;
  capacity: number;
  isAvailable: boolean;
  location: string | null;
  createdAt: string;
  updatedAt: string;
  _count: {
    reservations: number;
  };
};

export type TablesResponse = {
  success: boolean;
  data: Table[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

export type TablesQueryParams = {
  page?: number;
  limit?: number;
  sortBy?: "tableNumber" | "capacity" | "createdAt";
  sortOrder?: "asc" | "desc";
  isAvailable?: boolean;
  location?: string;
};

export async function fetchTables(
  params: TablesQueryParams,
): Promise<TablesResponse> {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      query.set(key, String(value));
    }
  });

  const res = await fetch(`/api/tables?${query.toString()}`);

  if (!res.ok) {
    throw new Error("Failed to fetch tables");
  }

  return res.json();
}

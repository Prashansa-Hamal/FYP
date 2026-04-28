import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import { tableApi } from "@/lib/api/tables";
import {
  Table,
  TableAvailabilityResponse,
  TableStats,
  TableWithOrders,
  CreateTableRequest,
  UpdateTableRequest,
  UpdateTableStatusRequest,
  ApiResponse,
} from "@/types/tables";

// Query Keys
export const tableKeys = {
  all: ["tables"] as const,
  lists: () => [...tableKeys.all, "list"] as const,
  list: (filters?: any) => [...tableKeys.lists(), { filters }] as const,
  details: () => [...tableKeys.all, "detail"] as const,
  detail: (id: string) => [...tableKeys.details(), id] as const,
  availability: () => [...tableKeys.all, "availability"] as const,
  stats: () => [...tableKeys.all, "stats"] as const,
  withOrders: () => [...tableKeys.all, "with-orders"] as const,
};

// Hooks

// Get all tables
export function useTables(
  params?: {
    status?: string;
    isAvailable?: boolean;
    location?: string;
  },
  options?: Omit<UseQueryOptions<ApiResponse<Table[]>>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: tableKeys.list(params),
    queryFn: () => tableApi.getTables(params),
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

// Get single table
export function useTable(
  id: string,
  options?: Omit<UseQueryOptions<ApiResponse<Table>>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: tableKeys.detail(id),
    queryFn: () => tableApi.getTableById(id),
    enabled: !!id,
    staleTime: 60 * 1000,
    ...options,
  });
}

// Create table
export function useCreateTable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTableRequest) => tableApi.createTable(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tableKeys.lists() });
      queryClient.invalidateQueries({ queryKey: tableKeys.stats() });
    },
  });
}

// Update table
export function useUpdateTable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTableRequest }) =>
      tableApi.updateTable(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: tableKeys.lists() });
      queryClient.invalidateQueries({ queryKey: tableKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: tableKeys.stats() });
    },
  });
}

// Delete table
export function useDeleteTable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tableApi.deleteTable(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tableKeys.lists() });
      queryClient.invalidateQueries({ queryKey: tableKeys.stats() });
    },
  });
}

// Update table status
export function useUpdateTableStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateTableStatusRequest;
    }) => tableApi.updateTableStatus(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: tableKeys.lists() });
      queryClient.invalidateQueries({ queryKey: tableKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: tableKeys.withOrders() });
      queryClient.invalidateQueries({ queryKey: tableKeys.stats() });
    },
  });
}

// Check table availability
export function useTableAvailability(
  params: { date?: string; timeSlot?: string; partySize?: number },
  options?: Omit<
    UseQueryOptions<ApiResponse<TableAvailabilityResponse>>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: [...tableKeys.availability(), params],
    queryFn: () => {
      if (!params.date || !params.timeSlot || !params.partySize) {
        throw new Error("Missing required parameters");
      }
      return tableApi.checkAvailability({
        date: params.date,
        timeSlot: params.timeSlot,
        partySize: params.partySize,
      });
    },
    enabled: !!(params.date && params.timeSlot && params.partySize),
    staleTime: 30 * 1000, // 30 seconds - availability changes frequently
    ...options,
  });
}

// Get table statistics
export function useTableStats(
  options?: Omit<
    UseQueryOptions<ApiResponse<TableStats>>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: tableKeys.stats(),
    queryFn: () => tableApi.getTableStats(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    ...options,
  });
}

// Get tables with active orders
export function useTablesWithOrders(
  options?: Omit<
    UseQueryOptions<ApiResponse<TableWithOrders[]>>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: tableKeys.withOrders(),
    queryFn: () => tableApi.getTablesWithOrders(),
    staleTime: 30 * 1000, // 30 seconds - orders change frequently
    refetchInterval: 60 * 1000, // Refetch every minute
    ...options,
  });
}

import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
} from "@tanstack/react-query";
import {
  ReservationListResponse,
  SingleReservationResponse,
  CreateReservationRequest,
  UpdateReservationRequest,
  AvailableTablesResponse,
  ReservationFilters,
  MyReservationsFilters,
} from "@/types/reservations";
import { toast } from "sonner";
import { reservationApis } from "@/lib/api/reservations";
import { reservationBatchApis } from "@/lib/api/reservations-utils";

// Query Keys
export const reservationKeys = {
  all: ["reservations"] as const,
  lists: () => [...reservationKeys.all, "list"] as const,
  list: (filters: ReservationFilters | MyReservationsFilters) =>
    [...reservationKeys.lists(), filters] as const,
  details: () => [...reservationKeys.all, "detail"] as const,
  detail: (id: string) => [...reservationKeys.details(), id] as const,
  myReservations: () => [...reservationKeys.all, "my"] as const,
  availableTables: () => [...reservationKeys.all, "available-tables"] as const,
};

// Query Hooks

// Get all reservations (admin/staff only)
export function useReservations(
  filters?: ReservationFilters,
  options?: Omit<
    UseQueryOptions<ReservationListResponse>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: reservationKeys.list(filters || {}),
    queryFn: () => reservationApis.getReservations(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
    // Keep previous data while fetching new data
    placeholderData: (previousData) => previousData,
    // Refetch when window gains focus
    refetchOnWindowFocus: true,
    // Refetch when network reconnects
    refetchOnReconnect: true,
    ...options,
  });
}

// Get current user's reservations
export function useMyReservations(
  filters?: MyReservationsFilters,
  options?: Omit<
    UseQueryOptions<ReservationListResponse>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: [...reservationKeys.myReservations(), filters],
    queryFn: () => reservationApis.getMyReservations(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes
    placeholderData: (previousData) => previousData,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    ...options,
  });
}

// Get single reservation by ID
export function useReservation(
  id: string | null,
  options?: Omit<
    UseQueryOptions<SingleReservationResponse>,
    "queryKey" | "queryFn" | "enabled"
  >,
) {
  return useQuery({
    queryKey: reservationKeys.detail(id || ""),
    queryFn: () => reservationApis.getReservationById(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
    placeholderData: (previousData) => previousData,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    ...options,
  });
}

// Get available tables
export function useAvailableTables(
  params: {
    date: string;
    timeSlot?: string;
    partySize?: number;
  },
  options?: Omit<
    UseQueryOptions<AvailableTablesResponse>,
    "queryKey" | "queryFn"
  >,
) {
  const { date, timeSlot, partySize } = params;

  return useQuery({
    queryKey: [
      ...reservationKeys.availableTables(),
      { date, timeSlot, partySize },
    ],
    queryFn: () =>
      reservationApis.getAvailableTables({ date, timeSlot, partySize }),
    enabled: !!(date && timeSlot && partySize),
    staleTime: 1000 * 60, // 1 minute
    placeholderData: (previousData) => previousData,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    ...options,
  });
}

// Mutation Hooks with proper revalidation
export function useCreateReservation(
  options?: UseMutationOptions<
    SingleReservationResponse,
    Error,
    CreateReservationRequest
  >,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateReservationRequest) =>
      reservationApis.createReservation(data),
    onSuccess: (data, variables, context) => {
      // Invalidate all reservation lists
      queryClient.invalidateQueries({ queryKey: reservationKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: reservationKeys.myReservations(),
      });
      queryClient.invalidateQueries({
        queryKey: reservationKeys.availableTables(),
      });

      // Also refetch to ensure fresh data
      queryClient.refetchQueries({ queryKey: reservationKeys.lists() });

      toast.success("Reservation created successfully!", {
        description: `Your reservation for ${data.data.partySize} people has been confirmed.`,
      });
    },
    onError: (error, variables, context) => {
      toast.error("Failed to create reservation", {
        description: error.message,
      });
    },
    ...options,
  });
}

export function useUpdateReservation(
  options?: UseMutationOptions<
    SingleReservationResponse,
    Error,
    { id: string; data: UpdateReservationRequest }
  >,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) =>
      reservationApis.updateReservation({ id, data }),
    onSuccess: (data, variables, context) => {
      // Invalidate specific reservation
      queryClient.invalidateQueries({
        queryKey: reservationKeys.detail(variables.id),
      });
      // Invalidate all lists
      queryClient.invalidateQueries({ queryKey: reservationKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: reservationKeys.myReservations(),
      });
      queryClient.invalidateQueries({
        queryKey: reservationKeys.availableTables(),
      });

      // Refetch to ensure fresh data
      queryClient.refetchQueries({ queryKey: reservationKeys.lists() });
      queryClient.refetchQueries({
        queryKey: reservationKeys.detail(variables.id),
      });

      toast.success("Reservation updated successfully!");
    },
    onError: (error, variables, context) => {
      toast.error("Failed to update reservation", {
        description: error.message,
      });
    },
    ...options,
  });
}

export function useCancelReservation(
  options?: UseMutationOptions<SingleReservationResponse, Error, string>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => reservationApis.cancelReservation(id),
    onSuccess: (data, variables, context) => {
      // Update cache immediately for better UX
      queryClient.setQueryData(
        reservationKeys.detail(variables),
        (oldData: SingleReservationResponse | undefined) => {
          if (oldData) {
            return {
              ...oldData,
              data: {
                ...oldData.data,
                status: "CANCELLED" as const,
                cancelledAt: new Date().toISOString(),
              },
            };
          }
          return oldData;
        },
      );

      // Invalidate queries
      queryClient.invalidateQueries({
        queryKey: reservationKeys.detail(variables),
      });
      queryClient.invalidateQueries({ queryKey: reservationKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: reservationKeys.myReservations(),
      });
      queryClient.invalidateQueries({
        queryKey: reservationKeys.availableTables(),
      });

      // Refetch to sync with server
      queryClient.refetchQueries({ queryKey: reservationKeys.lists() });

      toast.success("Reservation cancelled successfully!");
    },
    onError: (error, variables, context) => {
      toast.error("Failed to cancel reservation", {
        description: error.message,
      });
    },
    ...options,
  });
}

export function useCheckInReservation(
  options?: UseMutationOptions<SingleReservationResponse, Error, string>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => reservationApis.checkInReservation(id),
    onSuccess: (data, variables, context) => {
      // Update cache immediately for better UX
      queryClient.setQueryData(
        reservationKeys.detail(variables),
        (oldData: SingleReservationResponse | undefined) => {
          if (oldData) {
            return {
              ...oldData,
              data: {
                ...oldData.data,
                status: "COMPLETED" as const,
                checkedInAt: new Date().toISOString(),
              },
            };
          }
          return oldData;
        },
      );

      // Invalidate queries
      queryClient.invalidateQueries({
        queryKey: reservationKeys.detail(variables),
      });
      queryClient.invalidateQueries({ queryKey: reservationKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: reservationKeys.myReservations(),
      });
      queryClient.invalidateQueries({
        queryKey: reservationKeys.availableTables(),
      });

      // Refetch to sync with server
      queryClient.refetchQueries({ queryKey: reservationKeys.lists() });

      toast.success("Reservation checked in successfully!");
    },
    onError: (error, variables, context) => {
      toast.error("Failed to check in reservation", {
        description: error.message,
      });
    },
    ...options,
  });
}

export function useCancelMultipleReservations(
  options?: UseMutationOptions<
    { success: boolean; message: string; failed?: string[] },
    Error,
    string[]
  >,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) =>
      reservationBatchApis.cancelMultipleReservations(ids),
    onSuccess: (data, variables, context) => {
      // Update cache for each cancelled reservation
      variables.forEach((id) => {
        queryClient.setQueryData(
          reservationKeys.detail(id),
          (oldData: SingleReservationResponse | undefined) => {
            if (oldData) {
              return {
                ...oldData,
                data: {
                  ...oldData.data,
                  status: "CANCELLED" as const,
                  cancelledAt: new Date().toISOString(),
                },
              };
            }
            return oldData;
          },
        );
      });

      // Invalidate all queries
      queryClient.invalidateQueries({ queryKey: reservationKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: reservationKeys.myReservations(),
      });
      queryClient.invalidateQueries({
        queryKey: reservationKeys.availableTables(),
      });

      // Refetch to sync with server
      queryClient.refetchQueries({ queryKey: reservationKeys.lists() });

      if (data.success) {
        toast.success(data.message);
      } else {
        toast.warning(data.message);
      }
    },
    onError: (error, variables, context) => {
      toast.error("Failed to cancel reservations", {
        description: error.message,
      });
    },
    ...options,
  });
}

// Combined Hook
export function useReservationManagement() {
  const createReservation = useCreateReservation();
  const updateReservation = useUpdateReservation();
  const cancelReservation = useCancelReservation();
  const checkInReservation = useCheckInReservation();

  return {
    createReservation,
    updateReservation,
    cancelReservation,
    checkInReservation,
  };
}

// Utility hooks
export function useTimeSlotAvailability(
  date: string,
  timeSlot: string,
  partySize: number,
) {
  const { data, isLoading, error } = useAvailableTables({
    date,
    timeSlot,
    partySize,
  });

  const isAvailable = data?.data.totalAvailable ?? 0 > 0;
  const availableTables = data?.data.availableTables ?? [];
  const suggestedCombinations = data?.data.combinations ?? [];

  return {
    isAvailable,
    availableTables,
    suggestedCombinations,
    isLoading,
    error,
  };
}

export function useUpcomingReservations(
  options?: Omit<
    UseQueryOptions<ReservationListResponse>,
    "queryKey" | "queryFn"
  >,
) {
  return useMyReservations(
    { upcoming: true },
    {
      refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
      placeholderData: (previousData) => previousData,
      ...options,
    },
  );
}

export function useReservationWithUpdates(id: string | null) {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useReservation(id);

  const updateReservation = useUpdateReservation({
    onSuccess: (data) => {
      if (id) {
        queryClient.setQueryData(reservationKeys.detail(id), data);
        // Refetch to ensure sync
        queryClient.refetchQueries({ queryKey: reservationKeys.detail(id) });
      }
    },
  });

  const cancelReservation = useCancelReservation({
    onSuccess: () => {
      if (id) {
        queryClient.setQueryData(
          reservationKeys.detail(id),
          (oldData: SingleReservationResponse | undefined) => {
            if (oldData) {
              return {
                ...oldData,
                data: {
                  ...oldData.data,
                  status: "CANCELLED" as const,
                  cancelledAt: new Date().toISOString(),
                },
              };
            }
            return oldData;
          },
        );
        // Refetch to sync with server
        queryClient.refetchQueries({ queryKey: reservationKeys.detail(id) });
      }
    },
  });

  return {
    reservation: data?.data,
    isLoading,
    error,
    updateReservation,
    cancelReservation,
  };
}

export function useStaffReservationsDashboard(
  filters?: ReservationFilters,
  options?: Omit<
    UseQueryOptions<ReservationListResponse>,
    "queryKey" | "queryFn"
  >,
) {
  const { data, isLoading, error, refetch } = useReservations(filters, {
    refetchInterval: 30000, // Refetch every 30 seconds
    placeholderData: (previousData) => previousData,
    ...options,
  });

  const checkInReservation = useCheckInReservation();
  const cancelReservation = useCancelReservation();

  const reservations = data?.data ?? [];

  const stats = {
    total: data?.pagination?.total || reservations.length,
    confirmed: reservations.filter((r) => r.status === "CONFIRMED").length,
    completed: reservations.filter((r) => r.status === "COMPLETED").length,
    cancelled: reservations.filter((r) => r.status === "CANCELLED").length,
  };

  return {
    reservations,
    stats,
    isLoading,
    error,
    refetch,
    checkInReservation,
    cancelReservation,
  };
}

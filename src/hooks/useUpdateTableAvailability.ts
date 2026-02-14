"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface UpdateTableAvailabilityRequest {
  id: string;
  isAvailable: boolean;
}

export interface UpdateTableAvailabilityResponse {
  success: boolean;
  message: string;
}

export function useUpdateTableAvailability() {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateTableAvailabilityResponse,
    Error,
    UpdateTableAvailabilityRequest
  >({
    mutationFn: async (data) => {
      const res = await fetch("/api/tables/availability", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result: UpdateTableAvailabilityResponse = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message);
      }

      return result;
    },

    onSuccess: (res) => {
      toast.success(res.message);
      // Refetch tables automatically
      queryClient.invalidateQueries({ queryKey: ["tablesData"] });
    },
    onError: (error) => {
      toast.error(`${error.message}`);
    },
  });
}

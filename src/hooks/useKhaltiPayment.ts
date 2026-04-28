import { useMutation, UseMutationOptions } from "@tanstack/react-query";

interface KhaltiInitiateResponse {
  success: boolean;
  pidx: string;
  payment_url: string;
  expires_at: string;
  expires_in: number;
  order_id: string;
  order_number: string;
}

interface KhaltiInitiateError {
  success: false;
  error_key: string;
  detail: string;
}

const initiateKhaltiPayment = async (
  orderId: string,
): Promise<KhaltiInitiateResponse> => {
  const response = await fetch("/api/khalti/initiate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ orderId }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw {
      message: data.detail || data.message || "Payment initiation failed",
      error_key: data.error_key,
      status: response.status,
    };
  }

  if (!data.success) {
    throw {
      message: data.detail || "Payment initiation failed",
      error_key: data.error_key,
    };
  }

  return data;
};

interface UseKhaltiPaymentOptions {
  onSuccessRedirect?: boolean;
  onSuccess?: (data: KhaltiInitiateResponse) => void;
  onError?: (error: any) => void;
}

import { useQueryClient } from "@tanstack/react-query";

export const useKhaltiPayment = (options?: UseKhaltiPaymentOptions) => {
  const queryClient = useQueryClient();

  return useMutation<KhaltiInitiateResponse, any, string>({
    mutationFn: initiateKhaltiPayment,

    onMutate: async (orderId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["order", orderId] });

      // Snapshot previous value
      const previousOrder = queryClient.getQueryData(["order", orderId]);

      // Return context with snapshot
      return { previousOrder, orderId };
    },

    onSuccess: (data, orderId, context) => {
      // Update order payment status in cache
      queryClient.setQueryData(["order", orderId], (old: any) => ({
        ...old,
        paymentStatus: "PROCESSING",
        khaltiData: data,
      }));

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      queryClient.invalidateQueries({ queryKey: ["payments"] });

      if (options?.onSuccess) {
        options.onSuccess(data);
      }

      if (options?.onSuccessRedirect !== false && data.payment_url) {
        window.location.href = data.payment_url;
      }
    },

    onError: (error, orderId, context) => {
      // Rollback on error
      if (context) {
        queryClient.setQueryData(["order", orderId], context);
      }

      if (options?.onError) {
        options.onError(error);
      }
    },

    onSettled: (data, error, orderId) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
    },

    retry: (failureCount, error) => {
      if (error.status >= 400 && error.status < 500) return false;
      return failureCount < 2;
    },

    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

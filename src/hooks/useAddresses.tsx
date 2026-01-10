// hooks/useAddresses.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  CreateAddressRequest,
  UpdateAddressRequest,
  AddressListResponse,
  SingleAddressResponse,
} from "@/types/addresses";

const ADDRESS_QUERY_KEY = "addresses";

// Fetch all addresses
export const fetchAddresses = async (): Promise<AddressListResponse> => {
  const response = await fetch("/api/addresses", {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch addresses");
  }

  return response.json();
};

// Fetch single address
export const fetchAddress = async (
  id: string
): Promise<SingleAddressResponse> => {
  const response = await fetch(`/api/addresses/${id}`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch address");
  }

  return response.json();
};

// Create address
export const createAddress = async (
  data: CreateAddressRequest
): Promise<SingleAddressResponse> => {
  const response = await fetch("/api/addresses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to create address");
  }

  return result;
};

// Update address
export const updateAddress = async ({
  id,
  data,
}: {
  id: string;
  data: UpdateAddressRequest;
}): Promise<SingleAddressResponse> => {
  const response = await fetch(`/api/addresses/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to update address");
  }

  return result;
};

// Delete address
export const deleteAddress = async (
  id: string
): Promise<{ success: boolean; message: string }> => {
  const response = await fetch(`/api/addresses/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to delete address");
  }

  return result;
};

// Set address as default
export const setDefaultAddress = async (
  id: string
): Promise<SingleAddressResponse> => {
  const response = await fetch(`/api/addresses/${id}/default`, {
    method: "PATCH",
    credentials: "include",
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to set address as default");
  }

  return result;
};

// React Query Hooks
export const useAddresses = () => {
  return useQuery<AddressListResponse, Error>({
    queryKey: [ADDRESS_QUERY_KEY],
    queryFn: fetchAddresses,
  });
};

export const useAddress = (id: string) => {
  return useQuery<SingleAddressResponse, Error>({
    queryKey: [ADDRESS_QUERY_KEY, id],
    queryFn: () => fetchAddress(id),
    enabled: !!id,
  });
};

export const useCreateAddress = () => {
  const queryClient = useQueryClient();

  return useMutation<SingleAddressResponse, Error, CreateAddressRequest>({
    mutationFn: createAddress,
    onSuccess: (data) => {
      toast.success(data.message || "Address created successfully");
      queryClient.invalidateQueries({ queryKey: [ADDRESS_QUERY_KEY] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create address");
    },
  });
};

export const useUpdateAddress = () => {
  const queryClient = useQueryClient();

  return useMutation<
    SingleAddressResponse,
    Error,
    { id: string; data: UpdateAddressRequest }
  >({
    mutationFn: updateAddress,
    onSuccess: (data) => {
      toast.success(data.message || "Address updated successfully");
      queryClient.invalidateQueries({ queryKey: [ADDRESS_QUERY_KEY] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update address");
    },
  });
};

export const useDeleteAddress = () => {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean; message: string }, Error, string>({
    mutationFn: deleteAddress,
    onSuccess: (data) => {
      toast.success(data.message || "Address deleted successfully");
      queryClient.invalidateQueries({ queryKey: [ADDRESS_QUERY_KEY] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete address");
    },
  });
};

export const useSetDefaultAddress = () => {
  const queryClient = useQueryClient();

  return useMutation<SingleAddressResponse, Error, string>({
    mutationFn: setDefaultAddress,
    onSuccess: (data) => {
      toast.success(data.message || "Address set as default");
      queryClient.invalidateQueries({ queryKey: [ADDRESS_QUERY_KEY] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to set address as default");
    },
  });
};

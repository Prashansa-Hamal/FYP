// hooks/useAddresses.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  CreateAddressRequest,
  UpdateAddressRequest,
  AddressListResponse,
  SingleAddressResponse,
} from "@/types/addresses";
import { addressApis } from "@/lib/api/addresses";

const ADDRESS_QUERY_KEY = "addresses";

// React Query Hooks
export const useAddresses = () => {
  return useQuery<AddressListResponse, Error>({
    queryKey: [ADDRESS_QUERY_KEY],
    queryFn: addressApis.getAddresses,
  });
};

export const useAddress = (id: string) => {
  return useQuery<SingleAddressResponse, Error>({
    queryKey: [ADDRESS_QUERY_KEY, id],
    queryFn: () => addressApis.getAddressById(id),
    enabled: !!id,
  });
};

export const useCreateAddress = () => {
  const queryClient = useQueryClient();

  return useMutation<SingleAddressResponse, Error, CreateAddressRequest>({
    mutationFn: addressApis.createAddress,
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
    mutationFn: addressApis.updateAddress,
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
    mutationFn: addressApis.deleteAddress,
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
    mutationFn: addressApis.setDefaultAddress,
    onSuccess: (data) => {
      toast.success(data.message || "Address set as default");
      queryClient.invalidateQueries({ queryKey: [ADDRESS_QUERY_KEY] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to set address as default");
    },
  });
};

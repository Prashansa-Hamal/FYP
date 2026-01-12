import {
  AddressListResponse,
  CreateAddressRequest,
  SingleAddressResponse,
  UpdateAddressRequest,
} from "@/types/addresses";

export const addressApis = {
  // Fetch all addresses
  async getAddresses(): Promise<AddressListResponse> {
    const response = await fetch("/api/addresses", {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch addresses");
    }

    return response.json();
  },
  // Fetch single address
  async getAddressById(id: string): Promise<SingleAddressResponse> {
    const response = await fetch(`/api/addresses/${id}`, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch address");
    }

    return response.json();
  },

  // Create address
  async createAddress(
    data: CreateAddressRequest
  ): Promise<SingleAddressResponse> {
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
  },

  // Update address
  async updateAddress({
    id,
    data,
  }: {
    id: string;
    data: UpdateAddressRequest;
  }): Promise<SingleAddressResponse> {
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
  },

  // Delete address
  async deleteAddress(
    id: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`/api/addresses/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to delete address");
    }

    return result;
  },

  // Set address as default
  async setDefaultAddress(id: string): Promise<SingleAddressResponse> {
    const response = await fetch(`/api/addresses/${id}/default`, {
      method: "PATCH",
      credentials: "include",
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to set address as default");
    }

    return result;
  },
};

// types/address.ts
export interface CreateAddressRequest {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
  isDefault?: boolean;
}

export interface UpdateAddressRequest {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  isDefault?: boolean;
}

export interface AddressResponse {
  id: string;
  userId: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isArchived: boolean;
  isDefault: boolean;
  createdAt: any;
  updatedAt: any;
}

export interface AddressListResponse {
  success: boolean;
  message: string;
  addresses: AddressResponse[];
}

export interface SingleAddressResponse {
  success: boolean;
  message: string;
  address: AddressResponse | null;
}

export interface AddressErrorResponse {
  success: boolean;
  message: string;
  error?: string;
}

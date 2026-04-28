"use client";

import {
  MapPin,
  Edit2,
  Trash2,
  Home,
  Building,
  Navigation,
  Phone,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddressResponse } from "@/types/addresses";
import { AddressDialog } from "./AddressDialog";
import { useDeleteAddress, useSetDefaultAddress } from "@/hooks/useAddresses";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AddressCardProps {
  address: AddressResponse;
  onUpdate?: () => void;
}

// Get address icon based on address type
const getAddressIcon = (address: AddressResponse) => {
  const streetLower = address.street.toLowerCase();
  if (streetLower.includes("home") || streetLower.includes("house")) {
    return Home;
  }
  if (streetLower.includes("office") || streetLower.includes("work")) {
    return Building;
  }
  return MapPin;
};

export function AddressCard({ address, onUpdate }: AddressCardProps) {
  const deleteAddress = useDeleteAddress();
  const setDefaultAddress = useSetDefaultAddress();
  const Icon = getAddressIcon(address);

  const handleDelete = async () => {
    try {
      await deleteAddress.mutateAsync(address.id);
      toast.success("Address deleted successfully");
      onUpdate?.();
    } catch (error) {
      toast.error("Failed to delete address");
    }
  };

  const handleSetDefault = async () => {
    try {
      await setDefaultAddress.mutateAsync(address.id);
      toast.success("Default address updated");
      onUpdate?.();
    } catch (error) {
      toast.error("Failed to set default address");
    }
  };

  return (
    <div
      className={cn(
        "group rounded-xl border transition-all duration-200 hover:shadow-md",
        address.isDefault
          ? "border-amber-200 bg-gradient-to-r from-amber-50/50 to-white"
          : "border-gray-100 bg-white hover:border-amber-200",
      )}
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                address.isDefault
                  ? "bg-amber-100"
                  : "bg-gray-100 group-hover:bg-amber-50",
              )}
            >
              <Icon
                className={cn(
                  "w-5 h-5",
                  address.isDefault
                    ? "text-amber-600"
                    : "text-gray-500 group-hover:text-amber-600",
                )}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium text-gray-900">{address.name}</p>
                {address.isDefault && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                    <Star className="w-3 h-3" />
                    Default
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <Phone className="w-3 h-3 text-gray-400" />
                <p className="text-xs text-gray-500">{address.phone}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Address Details */}
        <div className="space-y-1 mb-4 pl-1">
          <p className="text-sm text-gray-700 leading-relaxed">
            {address.street}
          </p>
          <p className="text-sm text-gray-600">
            {address.city}, {address.state} {address.postalCode}
          </p>
          <p className="text-sm text-gray-500">{address.country}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t border-gray-100">
          {!address.isDefault && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSetDefault}
              disabled={setDefaultAddress.isPending}
              className="flex-1 h-9 text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg text-sm"
            >
              {setDefaultAddress.isPending ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-amber-600 border-t-transparent" />
              ) : (
                "Set as Default"
              )}
            </Button>
          )}
          <AddressDialog address={address} onSuccess={onUpdate}>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-9 text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg text-sm",
                !address.isDefault && "flex-1",
              )}
            >
              <Edit2 className="mr-1 h-3.5 w-3.5" />
              Edit
            </Button>
          </AddressDialog>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={deleteAddress.isPending}
            className="h-9 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg text-sm"
          >
            {deleteAddress.isPending ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
            ) : (
              <>
                <Trash2 className="mr-1 h-3.5 w-3.5" />
                Delete
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

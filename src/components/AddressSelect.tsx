"use client";

import { useEffect, useState } from "react";
import { useAddresses } from "@/hooks/useAddresses";
import { MapPin, Plus, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { AddressDialog } from "./AddressDialog";
import { Address } from "@/generated/client";

interface AddressSelectProps {
  value?: string;
  onChange: (addressId: string) => void;
  className?: string;
}

function AddressDisplay({ address }: { address: Address }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="font-medium text-gray-900">
          {address.street.split(",")[0]}
        </span>
        {address.isDefault && (
          <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-600 border border-blue-200">
            Default
          </span>
        )}
      </div>
      <p className="text-sm text-gray-600">
        <span className="capitalize">{address.street}</span>,{" "}
        <span className="capitalize">{address.state}</span>,{" "}
        <span className="capitalize">{address.postalCode}</span>
      </p>
      <p className="text-sm text-gray-500">{address.country}</p>
    </div>
  );
}

function AddressSelectDialog({
  addresses,
  selectedAddressId,
  onSelect,
  children,
  openAddressDialog,
}: {
  addresses: Address[];
  selectedAddressId?: string;
  onSelect: (addressId: string) => void;
  children: React.ReactNode;
  openAddressDialog: () => void;
}) {
  const hasAddresses = addresses.length > 0;

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900">
            Select Delivery Address
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            Choose an address or add a new one
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Existing addresses list */}
          {hasAddresses ? (
            <RadioGroup
              value={selectedAddressId}
              onValueChange={onSelect}
              className="space-y-3 max-h-[300px] overflow-y-auto pr-2"
            >
              {addresses.map((address) => (
                <div key={address.id} className="relative">
                  <RadioGroupItem
                    value={address.id}
                    id={`dialog-address-${address.id}`}
                    className="sr-only"
                  />
                  <Label
                    htmlFor={`dialog-address-${address.id}`}
                    className={cn(
                      "flex cursor-pointer items-start space-x-3 rounded-xl border-2 p-4 transition-all hover:border-blue-400",
                      selectedAddressId === address.id
                        ? "border-blue-500 bg-blue-50/50"
                        : "border-gray-200",
                    )}
                  >
                    <div className="flex-1">
                      <AddressDisplay address={address} />
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          ) : (
            <div className="py-8 text-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50">
              <MapPin className="h-10 w-10 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No addresses saved yet</p>
            </div>
          )}

          {/* Add new address button */}
          <div className="pt-4 border-t border-gray-200">
            <AddressDialog onSuccess={() => openAddressDialog}>
              <Button
                variant="outline"
                className="w-full h-12 justify-between rounded-xl border-gray-300 hover:border-blue-400 hover:bg-white"
              >
                <div className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  <span className="font-medium">Add New Address</span>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </Button>
            </AddressDialog>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function AddressSelect({
  value,
  onChange,
  className,
}: AddressSelectProps) {
  const { data, isLoading } = useAddresses();
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(value);

  const addresses = data?.addresses || [];
  const defaultAddress = addresses.find((addr) => addr.isDefault);
  const selectedAddressObj = addresses.find(
    (addr) => addr.id === selectedAddress,
  );
  const hasAddresses = addresses.length > 0;

  useEffect(() => {
    if (!selectedAddress && defaultAddress && value === undefined) {
      setSelectedAddress(defaultAddress.id);
      onChange(defaultAddress.id);
    }
  }, [defaultAddress, selectedAddress, onChange, value]);

  const handleChange = (addressId: string) => {
    setSelectedAddress(addressId);
    onChange(addressId);
  };

  const handleNewAddressAdded = () => {
    setIsAddressDialogOpen(false);
  };

  if (isLoading) {
    return (
      <div className={className}>
        <Skeleton className="h-10 w-32 mb-4" />
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold flex items-center text-gray-900">
          <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 mr-2">
            <MapPin className="h-4 w-4 text-blue-600" />
          </div>
          Delivery Address
        </h3>
      </div>

      {/* Main address display */}
      <div className="space-y-6">
        {selectedAddressObj ? (
          <>
            {/* Address info */}
            <div
              className={cn(
                "flex items-start p-5 rounded-xl border-2 justify-between",
                "bg-gradient-to-r from-blue-50/50 to-white",
                "border-blue-500",
              )}
            >
              <div className="flex-1">
                <AddressDisplay address={selectedAddressObj} />
              </div>
            </div>

            {/* Change address button - ALWAYS SHOWN */}
            <AddressSelectDialog
              addresses={addresses}
              selectedAddressId={selectedAddress || defaultAddress?.id}
              onSelect={handleChange}
              openAddressDialog={() => setIsAddressDialogOpen(true)}
            >
              <Button
                variant="outline"
                className="w-full h-12 justify-between rounded-xl border-gray-300 hover:border-blue-400 hover:bg-white"
              >
                <span className="font-medium">Change Address</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </AddressSelectDialog>
          </>
        ) : hasAddresses ? (
          // Has addresses but none selected
          <div className="text-center py-8 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-medium mb-4">
              No address selected
            </p>
            <AddressSelectDialog
              addresses={addresses}
              selectedAddressId={selectedAddress}
              onSelect={handleChange}
              openAddressDialog={() => setIsAddressDialogOpen(true)}
            >
              <Button
                variant="outline"
                className="w-full h-12 justify-between rounded-xl border-gray-300 hover:border-blue-400 hover:bg-white"
              >
                <span className="font-medium">Select Address</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </AddressSelectDialog>
          </div>
        ) : (
          // No addresses at all
          <div className="text-center py-8 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-medium mb-4">No addresses saved</p>
            <AddressDialog onSuccess={handleNewAddressAdded}>
              <Button className="w-full h-12 rounded-xl font-medium">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Address
              </Button>
            </AddressDialog>
          </div>
        )}
      </div>
    </div>
  );
}

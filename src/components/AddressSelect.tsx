"use client";

import { useEffect, useState } from "react";
import { useAddresses } from "@/hooks/useAddresses";
import {
  MapPin,
  Plus,
  ChevronRight,
  Home,
  Building,
  Navigation,
  Check,
  Edit2,
} from "lucide-react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
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
  // Get address type icon based on street name or tags
  const getAddressIcon = () => {
    const streetLower = address.street.toLowerCase();
    if (streetLower.includes("home") || streetLower.includes("house")) {
      return <Home className="h-4 w-4 text-amber-600" />;
    }
    if (streetLower.includes("office") || streetLower.includes("work")) {
      return <Building className="h-4 w-4 text-amber-600" />;
    }
    return <MapPin className="h-4 w-4 text-amber-600" />;
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getAddressIcon()}
          <span className="font-medium text-gray-900">
            {address.street.split(",")[0]}
          </span>
        </div>
        {address.isDefault && (
          <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 border border-amber-200">
            Default
          </span>
        )}
      </div>
      <p className="text-sm text-gray-600 pl-6">
        <span className="capitalize">{address.street}</span>,{" "}
        <span className="capitalize">{address.city}</span>,{" "}
        <span className="capitalize">{address.state}</span>{" "}
        <span>{address.postalCode}</span>
      </p>
      <p className="text-sm text-gray-500 pl-6">{address.country}</p>
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
      <DialogContent className="sm:max-w-md max-h-[90vh] p-0">
        <ScrollArea className="max-h-[90vh]">
          <div className="p-6">
            <DialogHeader>
              <div className="mx-auto w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-amber-600" />
              </div>
              <DialogTitle className="text-center text-xl font-bold text-gray-900">
                Select Delivery Address
              </DialogTitle>
              <DialogDescription className="text-center text-gray-500">
                Choose an address or add a new one
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-6">
              {/* Existing addresses list */}
              {hasAddresses ? (
                <RadioGroup
                  value={selectedAddressId}
                  onValueChange={onSelect}
                  className="space-y-0"
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
                          "flex cursor-pointer items-start space-x-3 rounded-xl border-2 p-4 transition-all duration-200",
                          selectedAddressId === address.id
                            ? "border-amber-500 bg-amber-50/50 shadow-sm"
                            : "border-gray-200 hover:border-amber-300 hover:bg-amber-50/30",
                        )}
                      >
                        <div className="flex-1">
                          <AddressDisplay address={address} />
                        </div>
                        {selectedAddressId === address.id && (
                          <div className="flex-shrink-0">
                            <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          </div>
                        )}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              ) : (
                <div className="py-8 text-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50">
                  <MapPin className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">
                    No addresses saved yet
                  </p>
                </div>
              )}

              {/* Add new address button */}
              <div className="pt-4 border-t border-gray-100">
                <AddressDialog onSuccess={() => openAddressDialog()}>
                  <Button
                    variant="outline"
                    className="w-full h-12 justify-between rounded-xl border-gray-200 hover:border-amber-400 hover:bg-amber-50/30 transition-all duration-200"
                  >
                    <div className="flex items-center gap-2">
                      <Plus className="h-4 w-4 text-amber-500" />
                      <span className="font-medium text-gray-700">
                        Add New Address
                      </span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </Button>
                </AddressDialog>
              </div>
            </div>
          </div>
        </ScrollArea>
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
    // Refetch addresses or just trigger a re-render
  };

  if (isLoading) {
    return (
      <div className={cn("space-y-3", className)}>
        <div className="flex items-center gap-2 mb-2">
          <Skeleton className="h-5 w-32" />
        </div>
        <Skeleton className="h-28 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Address Section Header */}
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center">
          <MapPin className="w-3 h-3 text-amber-600" />
        </div>
        <h3 className="text-sm font-medium text-gray-700">Delivery Address</h3>
      </div>

      {/* Main address display */}
      <div className="space-y-3">
        {selectedAddressObj ? (
          <>
            {/* Address Card */}
            <div
              className={cn(
                "relative p-4 rounded-xl border-2 transition-all duration-200",
                "bg-gradient-to-r from-amber-50/30 to-white",
                "border-amber-200 shadow-sm",
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <AddressDisplay address={selectedAddressObj} />
                </div>
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                    <Navigation className="w-4 h-4 text-amber-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Change address button */}
            <AddressSelectDialog
              addresses={addresses}
              selectedAddressId={selectedAddress || defaultAddress?.id}
              onSelect={handleChange}
              openAddressDialog={() => setIsAddressDialogOpen(true)}
            >
              <Button
                variant="outline"
                className="w-full h-11 justify-between rounded-xl border-gray-200 hover:border-amber-400 hover:bg-amber-50/30 transition-all duration-200 text-gray-700"
              >
                <div className="flex items-center gap-2">
                  <Edit2 className="h-4 w-4 text-amber-500" />
                  <span className="font-medium">Change Address</span>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </Button>
            </AddressSelectDialog>
          </>
        ) : hasAddresses ? (
          // Has addresses but none selected
          <div className="text-center py-6 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50">
            <MapPin className="h-10 w-10 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 font-medium text-sm mb-3">
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
                className="w-full h-11 justify-between rounded-xl border-gray-200 hover:border-amber-400 hover:bg-amber-50/30 transition-all duration-200"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-amber-500" />
                  <span className="font-medium">Select Address</span>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </Button>
            </AddressSelectDialog>
          </div>
        ) : (
          // No addresses at all
          <div className="text-center py-8 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <MapPin className="h-6 w-6 text-amber-600" />
            </div>
            <p className="text-gray-600 font-medium mb-2">No addresses saved</p>
            <p className="text-sm text-gray-500 mb-4">
              Add your first address to continue
            </p>
            <AddressDialog onSuccess={handleNewAddressAdded}>
              <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition-all duration-200">
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

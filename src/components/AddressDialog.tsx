"use client";

import { useState } from "react";
import { Plus, Edit2, MapPin, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AddressResponse } from "@/types/addresses";
import { AddressForm } from "./AddressForm";

interface AddressDialogProps {
  address?: AddressResponse;
  children?: React.ReactNode;
  onSuccess?: () => void;
}

export function AddressDialog({
  address,
  children,
  onSuccess,
}: AddressDialogProps) {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
    onSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button
            variant={address ? "outline" : "default"}
            className={
              address
                ? "border-gray-200 hover:border-amber-400 hover:bg-amber-50/30 text-gray-700"
                : "bg-amber-500 hover:bg-amber-600 text-white"
            }
          >
            {address ? (
              <>
                <Edit2 className="mr-2 h-4 w-4" />
                Edit Address
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Add New Address
              </>
            )}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] p-0">
        <ScrollArea className="max-h-[90vh]">
          <div className="p-6">
            <DialogHeader>
              <div className="mx-auto w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-amber-600" />
              </div>
              <DialogTitle className="text-center text-xl font-bold text-gray-900">
                {address ? "Edit Address" : "Add New Address"}
              </DialogTitle>
              <DialogDescription className="text-center text-gray-500">
                {address
                  ? "Update your delivery address information."
                  : "Add a new delivery address to your account."}
              </DialogDescription>
            </DialogHeader>
            <div className="mt-6">
              <AddressForm initialData={address} onSuccess={handleSuccess} />
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

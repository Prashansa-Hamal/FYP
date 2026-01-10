"use client";

import { useState } from "react";
import { Plus, Edit2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
          <Button variant={address ? "default" : "ghost"} size="sm">
            {address ? (
              <>
                <Edit2 className="mr-2 h-4 w-4" />
                Edit
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {address ? "Edit Address" : "Add New Address"}
          </DialogTitle>
          <DialogDescription>
            {address
              ? "Update your delivery address information."
              : "Add a new delivery address to your account."}
          </DialogDescription>
        </DialogHeader>
        <AddressForm initialData={address} onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}

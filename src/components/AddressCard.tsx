"use client";

import { MapPin, Star, Trash2, Edit2, Home, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";
import { AddressResponse } from "@/types/addresses";
import { AddressDialog } from "./AddressDialog";
import { useDeleteAddress, useSetDefaultAddress } from "@/hooks/useAddresses";

interface AddressCardProps {
  address: AddressResponse;
}

export function AddressCard({ address }: AddressCardProps) {
  const deleteAddress = useDeleteAddress();
  const setAsDefault = useSetDefaultAddress();

  return (
    <Card className={`relative ${address.isDefault ? "border-primary" : ""}`}>
      {address.isDefault && (
        <div className="absolute -top-2 -right-2">
          <Badge className="bg-primary">
            <Star className="h-3 w-3 mr-1 fill-current" />
            Default
          </Badge>
        </div>
      )}

      <CardHeader className="">
        <CardTitle className="flex items-center text-lg">
          {address.isDefault ? (
            <Home className="mr-2 h-5 w-5 text-primary" />
          ) : (
            <Building className="mr-2 h-5 w-5 text-muted-foreground" />
          )}
          {address.isDefault ? "Primary Address" : "Address"}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-0 sm:space-x-2 ">
          <div className="flex items-start">
            <MapPin className="h-4 w-4 text-muted-foreground mt-1 mr-2 flex-shrink-0" />
            <div>
              <p className="font-medium">{address.street}</p>
              <p className="text-sm text-muted-foreground">
                {address.city}, {address.state} {address.postalCode}
              </p>
              <p className="text-sm text-muted-foreground">{address.country}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-4">
            {!address.isDefault && (
              <Button
                variant="outline"
                size="sm"
                onClick={async () => await setAsDefault.mutateAsync(address.id)}
                className="text-xs"
              >
                {setAsDefault.isPending ? (
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                ) : (
                  <Star className="mr-1 h-3 w-3" />
                )}
                Set as Default
              </Button>
            )}

            <AddressDialog address={address}>
              <Button variant="ghost" size="sm" className="text-xs">
                <Edit2 className="mr-1 h-3 w-3" />
                Edit
              </Button>
            </AddressDialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                  disabled={deleteAddress.isPending}
                >
                  {deleteAddress.isPending ? (
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  ) : (
                    <Trash2 className="mr-1 h-3 w-3" />
                  )}
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Address</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this address? This action
                    cannot be undone. If this is your default address, another
                    address will be set as default.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={async () => await deleteAddress.mutate(address.id)}
                    className="bg-destructive text-white hover:bg-destructive/90"
                  >
                    {deleteAddress.isPending ? "Deleting..." : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

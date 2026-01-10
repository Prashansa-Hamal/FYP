"use client";

import { useAddresses } from "@/hooks/useAddresses";
import { MapPin, Plus, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

import { AddressCard } from "@/components/AddressCard";
import { AddressDialog } from "@/components/AddressDialog";

export default function AddressesPage() {
  const { data, isLoading, error, refetch } = useAddresses();

  /* -----------------------------
   * LOADING STATE
   * ----------------------------- */
  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-7xl px-3 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-5 space-y-3">
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-2/3" />
                <div className="flex gap-2 pt-4">
                  <Skeleton className="h-9 flex-1" />
                  <Skeleton className="h-9 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  /* -----------------------------
   * ERROR STATE
   * ----------------------------- */
  if (error) {
    return (
      <div className="mx-auto w-full max-w-xl px-4 py-10">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load addresses. Please try again.
          </AlertDescription>
        </Alert>

        <Button
          onClick={() => refetch()}
          variant="outline"
          className="w-full sm:w-auto"
        >
          Try again
        </Button>
      </div>
    );
  }

  const addresses = data?.addresses ?? [];

  return (
    <div className="mx-auto w-full max-w-7xl px-3 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* -----------------------------
       * HEADER
       * ----------------------------- */}
      <div className="mb-6 sm:mb-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold">
              My Addresses
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              {addresses.length} saved{" "}
              {addresses.length === 1 ? "address" : "addresses"}
            </p>
          </div>

          <AddressDialog>
            <Button className="w-full sm:w-auto h-10">
              <Plus className="mr-2 h-4 w-4" />
              Add Address
            </Button>
          </AddressDialog>
        </div>
      </div>

      {/* -----------------------------
       * EMPTY STATE
       * ----------------------------- */}
      {addresses.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-14 px-6 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <MapPin className="h-7 w-7 text-muted-foreground" />
            </div>

            <h3 className="text-lg font-medium">No addresses yet</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-xs mx-auto">
              Save your delivery addresses to make checkout faster.
            </p>

            <div className="mt-6">
              <AddressDialog>
                <Button size="sm">Add your first address</Button>
              </AddressDialog>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* -----------------------------
         * ADDRESSES GRID
         * ----------------------------- */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {addresses.map((address) => (
            <AddressCard key={address.id} address={address} />
          ))}

          {/* ADD NEW ADDRESS CARD */}
          <Card className="group cursor-pointer border-dashed transition hover:border-primary/60 hover:bg-muted/40">
            <AddressDialog>
              <CardContent className="flex h-full min-h-[200px] flex-col items-center justify-center p-6 text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 transition group-hover:bg-primary/20">
                  <Plus className="h-5 w-5 text-primary" />
                </div>

                <p className="font-medium">Add New Address</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Save another location
                </p>
              </CardContent>
            </AddressDialog>
          </Card>
        </div>
      )}
    </div>
  );
}

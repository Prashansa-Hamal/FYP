"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { AddressFormValues, addressSchema } from "@/schemas";
import { useCreateAddress, useUpdateAddress } from "@/hooks/useAddresses";
import { Loader2 } from "lucide-react";

interface InitialDataProps extends AddressFormValues {
  id: string;
}

interface AddressFormProps {
  initialData?: InitialDataProps;
  isLoading?: boolean;
  onSuccess: () => void;
}

export function AddressForm({
  initialData,
  isLoading,
  onSuccess,
}: AddressFormProps) {
  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "US",
      isDefault: false,
      ...initialData,
    },
  });

  const createAddress = useCreateAddress();
  const updateAddress = useUpdateAddress();

  const onSubmit = async (values: AddressFormValues) => {
    console.log(values);

    if (initialData) {
      await updateAddress.mutateAsync({ id: initialData.id, data: values });
      onSuccess();
    } else {
      await createAddress.mutateAsync(values);
      onSuccess();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Street */}
        <FormField
          control={form.control}
          name="street"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Street</FormLabel>
              <FormControl>
                <Input placeholder="123 Main St" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* City */}
        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>City</FormLabel>
              <FormControl>
                <Input placeholder="New York" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* State */}
        <FormField
          control={form.control}
          name="state"
          render={({ field }) => (
            <FormItem>
              <FormLabel>State</FormLabel>
              <FormControl>
                <Input placeholder="NY" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Postal Code */}
        <FormField
          control={form.control}
          name="postalCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Postal Code</FormLabel>
              <FormControl>
                <Input placeholder="10001" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Country */}
        <FormField
          control={form.control}
          name="country"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Country</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Default Address */}
        <FormField
          control={form.control}
          name="isDefault"
          render={({ field }) => (
            <FormItem className="flex items-center gap-3">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel className="cursor-pointer">
                Set as default address
              </FormLabel>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading} className="w-full">
          {initialData ? (
            <>
              {updateAddress.isPending ? (
                <>
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                "Update"
              )}
            </>
          ) : (
            <>
              {createAddress.isPending ? (
                <>
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                "Save Address"
              )}
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}

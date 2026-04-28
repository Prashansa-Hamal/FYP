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
import {
  Loader2,
  MapPin,
  Phone,
  Home,
  Building,
  Navigation,
  User,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface InitialDataProps extends AddressFormValues {
  id: string;
}

interface AddressFormProps {
  initialData?: InitialDataProps;
  isLoading?: boolean;
  onSuccess: () => void;
}

// Address type presets for quick selection
const addressPresets = [
  { label: "Home", icon: Home, placeholder: "e.g., 123 Residential Colony" },
  { label: "Office", icon: Building, placeholder: "e.g., 456 Business Park" },
  { label: "Other", icon: MapPin, placeholder: "e.g., 789 Anywhere St" },
];

export function AddressForm({
  initialData,
  isLoading,
  onSuccess,
}: AddressFormProps) {
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      name: "",
      phone: "",
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "Nepal",
      isDefault: false,
      ...initialData,
    },
  });

  const createAddress = useCreateAddress();
  const updateAddress = useUpdateAddress();

  const onSubmit = async (values: AddressFormValues) => {
    if (initialData) {
      await updateAddress.mutateAsync({ id: initialData.id, data: values });
      onSuccess();
    } else {
      await createAddress.mutateAsync(values);
      onSuccess();
    }
  };

  const isPending = initialData
    ? updateAddress.isPending
    : createAddress.isPending;

  const handlePresetClick = (preset: string) => {
    setSelectedPreset(preset);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {/* Address Type Presets */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Address Type
          </label>
          <div className="grid grid-cols-3 gap-2">
            {addressPresets.map((preset) => {
              const Icon = preset.icon;
              const isSelected = selectedPreset === preset.label;
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => handlePresetClick(preset.label)}
                  className={cn(
                    "p-3 rounded-xl border text-center transition-all duration-200",
                    isSelected
                      ? "border-amber-500 bg-amber-50 shadow-sm"
                      : "border-gray-200 hover:border-amber-300 hover:bg-amber-50/30",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5 mx-auto mb-1",
                      isSelected ? "text-amber-600" : "text-gray-400",
                    )}
                  />
                  <p
                    className={cn(
                      "text-xs font-medium",
                      isSelected ? "text-amber-700" : "text-gray-600",
                    )}
                  >
                    {preset.label}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Recipient Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700">
                Recipient Name <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="John Doe"
                    className="pl-10 border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Phone Number */}
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700">
                Phone Number <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="9800000000"
                    className="pl-10 border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Street Address */}
        <FormField
          control={form.control}
          name="street"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700">
                Street Address <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder={
                      selectedPreset
                        ? addressPresets.find((p) => p.label === selectedPreset)
                            ?.placeholder
                        : "123 Main Street"
                    }
                    className="pl-10 border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* City and State Row */}
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">
                  City <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Kathmandu"
                    className="border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">
                  State <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Bagmati"
                    className="border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Postal Code and Country Row */}
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="postalCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">
                  Postal Code <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="44600"
                    className="border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">
                  Country <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Nepal"
                    className="border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Default Address Checkbox */}
        <FormField
          control={form.control}
          name="isDefault"
          render={({ field }) => (
            <FormItem className="flex items-center gap-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="border-gray-300 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                />
              </FormControl>
              <FormLabel className="cursor-pointer text-sm text-gray-700 font-normal">
                Set as default address
              </FormLabel>
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isPending}
          className="w-full bg-amber-500 hover:bg-amber-600 text-white h-12 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
        >
          {isPending ? (
            <span className="flex items-center gap-2 justify-center">
              <Loader2 className="h-4 w-4 animate-spin" />
              {initialData ? "Updating..." : "Saving..."}
            </span>
          ) : (
            <span className="flex items-center gap-2 justify-center">
              <MapPin className="h-4 w-4" />
              {initialData ? "Update Address" : "Save Address"}
            </span>
          )}
        </Button>
      </form>
    </Form>
  );
}

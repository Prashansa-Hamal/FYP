"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useCreateTable, useUpdateTable } from "@/hooks/useTables";
import { TableFormValues, tableSchema } from "@/schemas";

interface Props {
  defaultValues?: Partial<TableFormValues>;
  tableId?: string;
}

export default function TableForm({ defaultValues, tableId }: Props) {
  const form = useForm<TableFormValues>({
    resolver: zodResolver(tableSchema),
    defaultValues: {
      tableNumber: defaultValues?.tableNumber ?? 0,
      capacity: defaultValues?.capacity ?? 1,
      isAvailable: defaultValues?.isAvailable ?? true,
      location: defaultValues?.location ?? "",
    },
  });

  const createMutation = useCreateTable();
  const updateMutation = useUpdateTable(tableId ?? "");

  const onSubmit = (data: TableFormValues) => {
    if (tableId) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="tableNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Table Number</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="capacity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Capacity</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input placeholder="Window / Patio / Main Hall" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isAvailable"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between">
              <FormLabel>Available</FormLabel>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={createMutation.isPending || updateMutation.isPending}
          className="w-full"
        >
          {tableId ? "Update Table" : "Create Table"}
        </Button>
      </form>
    </Form>
  );
}

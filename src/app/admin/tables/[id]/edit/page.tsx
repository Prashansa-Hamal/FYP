"use client";

import { useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useTable } from "@/hooks/useTables";
import { Loader2 } from "lucide-react";
import TableForm from "../../add/_components/tableForm";

export default function EditTablePage() {
  const params = useParams();
  const id = params.id as string;

  const { data: table, isLoading, isError } = useTable(id);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin h-6 w-6" />
      </div>
    );
  }

  if (isError || !table) {
    return (
      <div className="text-center text-red-500 mt-10">
        Failed to load table.
      </div>
    );
  }

  return (
    <div className="flex justify-center py-10 px-4">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">
            Edit Table #{table.tableNumber}
          </CardTitle>
          <CardDescription>
            Update table information and availability.
          </CardDescription>
        </CardHeader>

        <Separator />

        <CardContent className="pt-6">
          <TableForm
            tableId={table.id}
            defaultValues={{
              tableNumber: table.tableNumber,
              capacity: table.capacity,
              isAvailable: table.isAvailable,
              location: table.location ?? "",
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}

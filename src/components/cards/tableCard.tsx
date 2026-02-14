import { useUpdateTableAvailability } from "@/hooks/useUpdateTableAvailability";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuTrigger,
} from "../ui/context-menu";
import { Loader2, Users } from "lucide-react";
import { TableStatus } from "@/types/tables";
import { Separator } from "../ui/separator";
import Link from "next/link";
import { useDeleteTable } from "@/hooks/useTables";

interface TableCardProps {
  id: string;
  tableNumber: number;
  status: TableStatus;
  seats: number;
  isAvailable: boolean;
  setSelectedTable: (table: { id: string; tableNumber: number } | null) => void;
  admin?: boolean;
}

export function TableCard({
  id,
  tableNumber,
  status,
  seats,
  setSelectedTable,
  admin = false,
}: TableCardProps) {
  const { mutate, isPending } = useUpdateTableAvailability();
  const deleteTable = useDeleteTable();

  const handleToggleAvailability = (id: string, current: boolean) => {
    mutate({
      id,
      isAvailable: !current,
    });
  };

  const statusColors: Record<TableStatus, string> = {
    available: "bg-green-100 border-green-300 text-green-700",
    occupied: "bg-orange-100 border-orange-300 text-orange-700",
    reserved: "bg-blue-100 border-blue-300 text-blue-700",
  };
  const statusLabels: Record<TableStatus, string> = {
    available: "Available",
    occupied: "Occupied",
    reserved: "Reserved",
  };
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          onClick={() =>
            setSelectedTable({
              id: id,
              tableNumber: tableNumber,
            })
          }
          className={`relative p-4 rounded-lg border-2 ${
            statusColors[status]
          } transition-all hover:shadow-md cursor-pointer`}
        >
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center justify-center w-12 h-12 bg-white rounded-full border-2 border-current">
              <span className="font-bold text-lg">{tableNumber}</span>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium">{seats} seats</span>
              </div>

              <span className="text-xs font-semibold uppercase">
                {isPending ? (
                  <Loader2 className="animate-spin h-4 w-4" />
                ) : (
                  statusLabels[status]
                )}
              </span>
            </div>
          </div>
        </div>
        <span className="hidden pointer-coarse:inline-block">
          Long press here
        </span>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48 space-y-1">
        <ContextMenuGroup>
          <ContextMenuItem onClick={() => handleToggleAvailability(id, true)}>
            Mark Seated
          </ContextMenuItem>
          <ContextMenuItem
            variant="destructive"
            onClick={() => handleToggleAvailability(id, false)}
          >
            Vacate Table
          </ContextMenuItem>
        </ContextMenuGroup>
        {admin && (
          <>
            <Separator />
            <ContextMenuGroup>
              <ContextMenuItem asChild>
                <Link href={`/admin/tables/${id}/edit`}>Edit Table</Link>
              </ContextMenuItem>
              <ContextMenuItem
                variant="destructive"
                disabled={deleteTable.isPending}
                onClick={() => deleteTable.mutate(id)}
              >
                {deleteTable.isPending ? "Deleting..." : "Delete Table"}
              </ContextMenuItem>
            </ContextMenuGroup>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}

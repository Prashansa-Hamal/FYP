"use client";

import { Table } from "@/types/tables";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit2, Trash2, MapPin, Users, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface TableGridViewProps {
  tables: Table[];
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => React.ReactNode;
  onEdit: (table: Table) => void;
  onStatusChange: (table: Table) => void;
  onDelete: (table: Table) => void;
}

export function TableGridView({
  tables,
  getStatusColor,
  getStatusIcon,
  onEdit,
  onStatusChange,
  onDelete,
}: TableGridViewProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {tables.map((table) => (
        <Card
          key={table.id}
          className="group hover:shadow-lg transition-all duration-200 border-0 shadow-md"
        >
          <CardContent className="p-5">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                  <span className="text-lg font-bold text-amber-600">
                    {table.tableNumber}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    Table {table.tableNumber}
                  </p>
                  <p className="text-xs text-gray-500">
                    Capacity: {table.capacity} seats
                  </p>
                </div>
              </div>
              <Badge
                className={cn("gap-1 px-2 py-1", getStatusColor(table.status))}
              >
                {getStatusIcon(table.status)}
                <span>{table.status.replace("_", " ")}</span>
              </Badge>
            </div>

            {/* Details */}
            <div className="space-y-2 mb-4">
              {table.location && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>{table.location}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="w-4 h-4 text-gray-400" />
                <span>Seats {table.capacity} people</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2 border-t border-gray-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onStatusChange(table)}
                className="flex-1 text-xs"
              >
                Change Status
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(table)}>
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit Table
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDelete(table)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Table
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

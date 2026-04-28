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

interface TableListViewProps {
  tables: Table[];
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => React.ReactNode;
  onEdit: (table: Table) => void;
  onStatusChange: (table: Table) => void;
  onDelete: (table: Table) => void;
}

export function TableListView({
  tables,
  getStatusColor,
  getStatusIcon,
  onEdit,
  onStatusChange,
  onDelete,
}: TableListViewProps) {
  return (
    <div className="space-y-3">
      {tables.map((table) => (
        <Card
          key={table.id}
          className="group hover:shadow-md transition-all duration-200 border-0 shadow-sm"
        >
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              {/* Left Section */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl font-bold text-amber-600">
                    {table.tableNumber}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900">
                      Table {table.tableNumber}
                    </h3>
                    <Badge
                      className={cn("gap-1", getStatusColor(table.status))}
                    >
                      {getStatusIcon(table.status)}
                      <span>{table.status.replace("_", " ")}</span>
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>Capacity: {table.capacity} seats</span>
                    </div>
                    {table.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{table.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onStatusChange(table)}
                  className="text-xs"
                >
                  Change Status
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(table)}
                  className="h-8 w-8"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(table)}
                  className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

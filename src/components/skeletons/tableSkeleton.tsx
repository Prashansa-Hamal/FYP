// components/ui/animated-skeleton-data-table.tsx
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface AnimatedSkeletonDataTableProps {
  columnCount?: number;
  rowCount?: number;
  showToolbar?: boolean;
  showPagination?: boolean;
  variant?: "default" | "compact" | "detailed";
  className?: string;
}

export function AnimatedSkeletonDataTable({
  columnCount = 5,
  rowCount = 8,
  showToolbar = true,
  showPagination = true,
  variant = "default",
  className,
}: AnimatedSkeletonDataTableProps) {
  const getRowCount = () => {
    switch (variant) {
      case "compact":
        return 5;
      case "detailed":
        return 12;
      default:
        return rowCount;
    }
  };

  const getColumnCount = () => {
    switch (variant) {
      case "compact":
        return 4;
      case "detailed":
        return 7;
      default:
        return columnCount;
    }
  };

  return (
    <div className={cn("space-y-4 w-full", className)}>
      {/* Toolbar Section */}
      {showToolbar && (
        <div className="flex flex-wrap items-center justify-between gap-3 animate-pulse">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Bar */}
            <div className="relative">
              <Skeleton className="h-9 w-64" />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-28 rounded-md" />
              <Skeleton className="h-9 w-20 rounded-md" />
              <Skeleton className="h-9 w-24 rounded-md" />
            </div>
          </div>

          {/* Add Button */}
          <Skeleton className="h-9 w-36 rounded-md" />
        </div>
      )}

      {/* Table Section */}
      <div className="overflow-hidden rounded-lg border animate-pulse">
        <Table>
          <TableHeader>
            <TableRow>
              {Array.from({ length: getColumnCount() }).map((_, i) => (
                <TableHead key={i} className="h-11">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-3 w-3 rounded-full ml-2" />
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: getRowCount() }).map((_, rowIndex) => (
              <TableRow key={rowIndex} className="hover:bg-transparent">
                {Array.from({ length: getColumnCount() }).map(
                  (_, cellIndex) => (
                    <TableCell key={cellIndex}>
                      <Skeleton
                        className={cn(
                          "h-4 transition-all duration-300",
                          rowIndex % 3 === 0 && "w-32",
                          rowIndex % 3 === 1 && "w-24",
                          rowIndex % 3 === 2 && "w-40"
                        )}
                      />
                    </TableCell>
                  )
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Section */}
      {showPagination && (
        <div className="flex items-center justify-between gap-8 animate-pulse">
          {/* Page Size Selector */}
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-28 rounded-md" />
          </div>

          {/* Page Info */}
          <div className="flex grow justify-center">
            <Skeleton className="h-4 w-48" />
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-9 rounded-md" />
            <Skeleton className="h-9 w-9 rounded-md" />
            <div className="flex items-center gap-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-9 w-9 rounded-md" />
              ))}
            </div>
            <Skeleton className="h-9 w-9 rounded-md" />
            <Skeleton className="h-9 w-9 rounded-md" />
          </div>
        </div>
      )}
    </div>
  );
}

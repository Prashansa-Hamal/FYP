"use client";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { UserRole } from "@/generated/prisma/enums";
// import { Order, Roles } from "@prisma/client";
import { ColumnDef, FilterFn, Row } from "@tanstack/react-table";
import { Ellipsis, Filter } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

export interface UserRow {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  createdAt: Date;
  // Order: Order[];
}

interface UsersDataTableProps {
  data: UserRow[];
}

// Custom filter functions
const multiColumnFilterFn: FilterFn<UserRow> = (row, columnId, filterValue) => {
  const searchableContent =
    `${row.original.name}  ${row.original.email}`.toLowerCase();
  return searchableContent.includes(filterValue.toLowerCase());
};

const genericFilterFn: FilterFn<UserRow> = (
  row,
  columnId,
  filterValue: (boolean | string)[]
) => {
  if (!filterValue?.length) return true;
  return filterValue.includes(row.getValue(columnId));
};

const userColumns: ColumnDef<UserRow>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    size: 28,
    enableSorting: false,
    enableHiding: false,
  },
  {
    header: "Name",
    accessorKey: "name",
    cell: ({ row }) => (
      <div className="font-medium">
        <Link
          href={`/admin/products/${row.original.id}`}
          className="line-clamp-1 flex items-center gap-1"
        >
          {row.getValue("name")}
        </Link>
      </div>
    ),
    size: 220,
    filterFn: multiColumnFilterFn,
    enableHiding: false,
  },
  {
    header: "Email",
    accessorKey: "email",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("email")}</div>
    ),
    size: 220,
    filterFn: multiColumnFilterFn,
    enableHiding: false,
  },
  // {
  //   header: "Orders",
  //   accessorKey: "orders",
  //   cell: ({ row }) => (
  //     <div className="font-medium">{`${row.original.Order.length} Orders`}</div>
  //   ),
  //   size: 120,
  // },

  {
    header: "Role",
    accessorKey: "role",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("role")}</div>
    ),
    size: 120,
  },
  {
    header: "Created At",
    accessorKey: "createdAt",
    cell: ({ row }) => (
      <div className="font-medium">
        {new Date(row.getValue("createdAt")).toLocaleDateString()}
      </div>
    ),
    size: 180,
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => <RowActions row={row} />,
    size: 60,
    enableHiding: false,
  },
];

const UsersDataTable = ({ data }: UsersDataTableProps) => {
  return (
    <DataTable
      data={data}
      columns={userColumns}
      renderToolbar={renderToolbar}
      addButton={{
        href: "/admin/products/new",
        label: "Add Product",
      }}
    />
  );
};

export default UsersDataTable;

const RowActions = ({ row }: { row: Row<UserRow> }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <Ellipsis className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <Link href={`/admin/products/${row.original.id}`}>
          <DropdownMenuItem>Edit Product</DropdownMenuItem>
        </Link>
        <DropdownMenuItem>Duplicate Product</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="hover:!bg-destructive">
          {/* <DeleteItem
              id={row.original.id}
              className="h-5 w-[120px] justify-start font-normal text-destructive hover:text-white"
            /> */}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const renderToolbar = (table: any) => {
  //User role filetr values
  const userRoleValues = useMemo(() => ["ADMIN", "USER"], []);
  const selectedUserRole = useMemo(
    () => (table.getColumn("role")?.getFilterValue() as string[]) ?? [],
    [table.getColumn("role")?.getFilterValue()]
  );

  const handleFilterChange = (
    columnId: string,
    checked: boolean,
    value: string | boolean
  ) => {
    const currentFilter = table.getColumn(columnId)?.getFilterValue() as Array<
      string | boolean
    >;
    const newFilter = currentFilter ? [...currentFilter] : [];

    if (checked) {
      newFilter.push(value);
    } else {
      const index = newFilter.indexOf(value);
      if (index > -1) newFilter.splice(index, 1);
    }

    table
      .getColumn(columnId)
      ?.setFilterValue(newFilter.length ? newFilter : undefined);
  };
  return (
    <div className="flex flex-wrap">
      {/* User Role Filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4 capitalize" />
            User Role
            {selectedUserRole.length > 0 && (
              <span className="ml-2 h-5 rounded bg-muted px-1.5 text-xs font-medium">
                {selectedUserRole.length}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-2">
          <div className="space-y-2">
            {userRoleValues.map((role) => (
              <div key={role} className="flex items-center space-x-2">
                <Checkbox
                  id={`role-${role}`}
                  checked={selectedUserRole.includes(role)}
                  onCheckedChange={(checked) =>
                    handleFilterChange("role", checked as boolean, role)
                  }
                />
                <Label htmlFor={`role-${role}`} className="text-sm">
                  {role}
                </Label>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

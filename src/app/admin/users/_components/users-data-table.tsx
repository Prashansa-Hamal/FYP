"use client";
import { DataTable } from "@/components/data-table";
import { AnimatedSkeletonDataTable } from "@/components/skeletons/tableSkeleton";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useUsers } from "@/hooks/useUsers";
import { UserRole } from "@/types/enums";
import { ColumnDef, FilterFn, Row } from "@tanstack/react-table";
import { Edit, Eye, Filter, MoreVertical, Trash2 } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";

export type UserTableRow = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
};

// Custom filter functions
const multiColumnFilterFn: FilterFn<UserTableRow> = (row, filterValue) => {
  const searchableContent =
    `${row.original.name}  ${row.original.email}`.toLowerCase();
  return searchableContent.includes(filterValue.toLowerCase());
};

const userColumns: ColumnDef<UserTableRow>[] = [
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
      <div className="font-medium">{row.getValue("name")}</div>
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

const UsersDataTable = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get("page") || "1");
  const limit = Number(searchParams.get("limit") || "10");
  const search = searchParams.get("search") || "";

  // Get role filter from URL
  const roleParam = searchParams.get("role");
  const roles = roleParam ? roleParam.split(",") : [];

  const { data: UsersData, isLoading } = useUsers({
    page,
    limit,
    search,
    role: roles.length > 0 ? roles.join(",") : undefined,
  });

  const totalCount = UsersData?.pagination.total || 0;
  const totalPages = UsersData?.pagination.pages || 1;

  // Handle pagination change
  const handlePaginationChange = ({
    pageIndex,
    pageSize,
  }: {
    pageIndex: number;
    pageSize: number;
  }) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", (pageIndex + 1).toString());
    params.set("limit", pageSize.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  // Handle search change
  const handleSearchChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }

    // Reset to page 1 when searching
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  // Handle role filter change
  const handleRoleFilterChange = (selectedRoles: string[]) => {
    const params = new URLSearchParams(searchParams.toString());

    if (selectedRoles.length > 0) {
      params.set("role", selectedRoles.join(","));
    } else {
      params.delete("role");
    }

    // Reset to page 1 when changing filters
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const tableData: UserTableRow[] = useMemo(() => {
    return (UsersData?.data ?? []).map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as UserRole,
      createdAt: new Date(user.createdAt),
    }));
  }, [UsersData]);

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <AnimatedSkeletonDataTable
          columnCount={5}
          rowCount={8}
          showToolbar={true}
          showPagination={true}
        />
      </div>
    );
  }

  return (
    <DataTable<UserTableRow>
      data={tableData}
      columns={userColumns}
      manualPagination
      pageCount={totalPages}
      totalCount={totalCount}
      onPaginationChange={handlePaginationChange}
      manualFiltering
      searchValue={search}
      onSearchChange={handleSearchChange}
      searchDebounceDelay={500}
      initialState={{
        pagination: {
          pageIndex: page - 1,
          pageSize: limit,
        },
      }}
      defaultSortColumn="name"
      renderToolbar={() => renderToolbar(roles, handleRoleFilterChange)}
    />
  );
};

export default UsersDataTable;

const RowActions = ({ row }: { row: Row<UserTableRow> }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" type="button">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>
          <Edit className="h-4 w-4 mr-2" />
          Edit User
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Eye className="h-4 w-4 mr-2" />
          Blacklist User
        </DropdownMenuItem>

        <Separator className="my-1" />
        <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50">
          <Trash2 className="h-4 w-4 mr-2" color="red" />
          Delete User
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Updated renderToolbar to use API filtering
const renderToolbar = (
  selectedRoles: string[],
  onRoleFilterChange: (roles: string[]) => void,
) => {
  const userRoleValues = useMemo(
    () => ["ADMIN", "USER", "CHEF", "BARTENDER", "WAITER", "MANAGER"],
    [],
  );

  const handleRoleCheckboxChange = (role: string, checked: boolean) => {
    let newSelectedRoles: string[];

    if (checked) {
      // Add role to selection
      newSelectedRoles = [...selectedRoles, role];
    } else {
      // Remove role from selection
      newSelectedRoles = selectedRoles.filter((r) => r !== role);
    }

    // Update URL via parent handler
    onRoleFilterChange(newSelectedRoles);
  };

  return (
    <div className="flex flex-wrap">
      {/* User Role Filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4 capitalize" />
            User Role
            {selectedRoles.length > 0 && (
              <span className="ml-2 h-5 rounded bg-muted px-1.5 text-xs font-medium">
                {selectedRoles.length}
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
                  checked={selectedRoles.includes(role)}
                  onCheckedChange={(checked) =>
                    handleRoleCheckboxChange(role, checked as boolean)
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

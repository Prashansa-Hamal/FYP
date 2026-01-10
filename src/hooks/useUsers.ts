// hooks/useUsers.ts - Enhanced version
import { useQuery, keepPreviousData } from "@tanstack/react-query";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  addresses: any[];
  orders: any[];
  createdAt: string;
  updatedAt: string;
}

interface UsersResponse {
  success: boolean;
  data: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface UseUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  enabled?: boolean;
}

const fetchUsers = async ({
  page = 1,
  limit = 10,
  search,
  role,
}: UseUsersParams): Promise<UsersResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (search) params.set("search", search);
  if (role) params.set("role", role);

  const response = await fetch(`/api/users?${params.toString()}`);

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: "Failed to fetch users",
    }));
    throw new Error(error.message || "Failed to fetch users");
  }

  return response.json();
};

export const useUsers = ({
  page = 1,
  limit = 10,
  search,
  role,
  enabled = true,
}: UseUsersParams) => {
  return useQuery<UsersResponse, Error>({
    queryKey: ["users", { page, limit, search, role }],
    queryFn: () => fetchUsers({ page, limit, search, role }),
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
    retry: (failureCount, error) => {
      // Don't retry on 404 or 401 errors
      if (error.message.includes("404") || error.message.includes("401")) {
        return false;
      }
      return failureCount < 2;
    },
    enabled,
  });
};

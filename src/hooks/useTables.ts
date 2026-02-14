"use client";

import { useQuery } from "@tanstack/react-query";
import {
  fetchTables,
  TablesQueryParams,
  TablesResponse,
} from "@/lib/api/tables";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useTables(params: TablesQueryParams) {
  return useQuery<TablesResponse>({
    queryKey: ["tablesData", params],
    queryFn: () => fetchTables(params),
  });
}

export const useTable = (id: string) => {
  return useQuery({
    queryKey: ["table", id],
    queryFn: async () => {
      const res = await fetch(`/api/tables/${id}`);
      if (!res.ok) throw new Error("Failed to fetch table");
      return res.json();
    },
    enabled: !!id,
  });
};

export const useCreateTable = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/tables", {
        method: "POST",
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to create table");

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tablesData"] });
      toast.success("Table created successfully");
    },
    onError: () => {
      toast.error("Failed to create table");
    },
  });
};

export const useUpdateTable = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`/api/tables/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to update table");

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tablesData"] });
      toast.success("Table updated successfully");
    },
    onError: () => {
      toast.error("Failed to update table");
    },
  });
};

export const useDeleteTable = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/tables/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to delete table");
      }

      return data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tablesData"] });
      toast.success("Table deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to delete table");
    },
  });
};

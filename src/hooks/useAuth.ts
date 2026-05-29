"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";

interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
  avatar?: string;
  collegeId?: string;
}

interface AuthResponse {
  isAuthenticated: boolean;
  user: User | null;
}

const fetchAuthStatus = async (): Promise<AuthResponse> => {
  const response = await fetch("/api/auth/check", {
    credentials: "include",
  });

  const data = await response.json();
  console.log("Auth status response:", data);
  return data;
};

export function useAuth() {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["auth", "status"],
    queryFn: fetchAuthStatus,
    retry: 1,
    refetchOnWindowFocus: true, // Refetch when window gets focus
    refetchOnMount: true, // Refetch when component mounts
  });
}

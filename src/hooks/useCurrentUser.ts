import { useQuery } from "@tanstack/react-query";

interface CurrentUser {
  id: string;
  role: string;
}

const fetchCurrentUser = async (): Promise<CurrentUser | null> => {
  const res = await fetch("/api/auth/me");
  const data = await res.json();
  return data.user ?? null;
};

export const useCurrentUser = () => {
  return useQuery<CurrentUser | null>({
    queryKey: ["currentUser"],
    queryFn: fetchCurrentUser,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
  });
};

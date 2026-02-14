const fetchLatestOrder = async (tableNumber: string | number) => {
  const res = await fetch("/api/tables/order", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ tableNumber }),
  });

  if (!res.ok) {
    throw new Error("Failed to fetch table order");
  }

  return res.json();
};

import { useQuery } from "@tanstack/react-query";

export const useLatestTableOrder = (tableNumber?: string | number) => {
  return useQuery({
    queryKey: ["latest-table-order", tableNumber],
    queryFn: () => fetchLatestOrder(tableNumber!),
    enabled: !!tableNumber,
    refetchInterval: 5000,
  });
};

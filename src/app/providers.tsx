"use client";

import { CartProvider } from "@/contexts/CartContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { EdgeStoreProvider } from "@/lib/edgestore";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            gcTime: 5 * 60 * 1000, // 5 minutes
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <EdgeStoreProvider>
        <NotificationProvider>
          <CartProvider>{children}</CartProvider>
        </NotificationProvider>
        <Toaster position="bottom-right" richColors />
      </EdgeStoreProvider>
    </QueryClientProvider>
  );
}

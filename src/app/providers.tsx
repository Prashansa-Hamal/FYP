"use client";

import { CartProvider } from "@/contexts/CartContext";
import { EdgeStoreProvider } from "@/lib/edgestore";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";
import { Toaster } from "sonner";

/**
 * Root providers component that wraps the application with necessary context providers
 * Includes React Query, EdgeStore, Cart context, and toast notifications
 */
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
        <CartProvider>{children}</CartProvider>
      </EdgeStoreProvider>
      <Toaster position="bottom-right" richColors />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

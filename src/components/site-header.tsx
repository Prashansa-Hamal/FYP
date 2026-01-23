"use client";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

export function SiteHeader() {
  const pathname = usePathname();

  // Get the proper title based on pathname
  const title = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);

    // If there's no segment, show "Dashboard"
    // if (segments.length === 0) return "Dashboard";
    if (segments.length === 1 && segments[0] === "admin") {
      return "Dashboard";
    }

    // Get the last segment
    const lastSegment = segments[segments.length - 1];

    // Check if it looks like an ID (UUID or cuid format)
    const isLikelyId =
      // Check for UUID format
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        lastSegment,
      ) ||
      // Check for cuid format (starts with 'c' and has 25 chars)
      /^c[0-9a-z]{24,}$/i.test(lastSegment) ||
      // Check for ObjectId format (24 hex chars)
      /^[0-9a-f]{24}$/i.test(lastSegment);

    if (isLikelyId) {
      // Return the parent segment (e.g., "menu-items" instead of ID)
      return segments.length >= 2 ? segments[segments.length - 2] : lastSegment;
    }

    return lastSegment;
  }, [pathname]);

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium capitalize">
          {title.replace(/-/g, " ")}
        </h1>
      </div>
    </header>
  );
}

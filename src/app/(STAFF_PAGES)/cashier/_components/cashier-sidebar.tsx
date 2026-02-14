"use client";

import * as React from "react";
import { IconInnerShadowTop } from "@tabler/icons-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import {
  Calendar,
  LayoutDashboard,
  Receipt,
  ShoppingCart,
  Table2,
  TrendingUp,
} from "lucide-react";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
  },
  navMain: [
    {
      title: "Overview",
      url: "/cashier",
      icon: LayoutDashboard,
    },
    {
      title: "Tables",
      url: "/cashier/tables",
      icon: Table2,
    },
    {
      title: "Orders",
      url: "/cashier/orders",
      icon: ShoppingCart,
    },
    {
      title: "Reservations",
      url: "/cashier/reservations",
      icon: Calendar,
    },
    {
      title: "Billing",
      url: "/cashier/billing",
      icon: Receipt,
    },
    {
      title: "Revenue",
      url: "/cashier/revenue",
      icon: TrendingUp,
    },
  ],
};

export function CashierSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">
                  Cashier Dashboard
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}

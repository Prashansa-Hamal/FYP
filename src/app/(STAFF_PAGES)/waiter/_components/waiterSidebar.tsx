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
      title: "Menu Items",
      url: "/waiter",
      icon: LayoutDashboard,
    },
    {
      title: "Tables",
      url: "/waiter/tables",
      icon: Table2,
    },

    {
      title: "Reservations",
      url: "/waiter/reservations",
      icon: Calendar,
    },
  ],
};

export function WaiterSidebar({
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
                  Waiter Dashboard
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

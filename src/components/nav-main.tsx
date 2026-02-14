"use client";

import type { ComponentType, SVGProps } from "react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconCirclePlusFilled } from "@tabler/icons-react";

export function NavMain({
  items,
  quickCreate = false,
}: {
  items: {
    title: string;
    url: string;
    icon?: ComponentType<SVGProps<SVGSVGElement>>;
  }[];
  quickCreate?: boolean;
}) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        {quickCreate && (
          <SidebarMenu>
            <SidebarMenuItem className="flex items-center gap-2">
              <Link href="/admin/menu-items/new" className="w-full">
                <SidebarMenuButton
                  tooltip="Quick Create"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
                >
                  <IconCirclePlusFilled />
                  <span>Quick Add Mennu Item</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
        <SidebarMenu>
          {items.map((item) => {
            const isActive = pathname === item.url;
            return (
              <Link
                key={item.title}
                href={item.url}
                className={`flex items-center gap-3 rounded-md transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted text-muted-foreground"
                }`}
              >
                <SidebarMenuItem>
                  <SidebarMenuButton
                    tooltip={item.title}
                    className="hover:bg-transparent cursor-pointer"
                  >
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </Link>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

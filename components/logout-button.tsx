"use client";

import { logOut } from "@/app/(auth)/_actions/logout";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

interface ButtonProps {
  className?: string;
  children: React.ReactNode;
}

export const LogoutButton = ({ className, children }: ButtonProps) => {
  return (
    <Button className={cn("cursor-pointer", className)} onClick={logOut}>
      {children}
    </Button>
  );
};
"use client";

import { toast } from "sonner";
import { Button } from "./ui/button";
import { toggleUserRole } from "@/app/(auth)/_actions/toggle-user-role";

interface ButtonProps {
  className?: string;
}

export const UserroleToggleButton = ({ className }: ButtonProps) => {
  const handleClick = () => {
    toggleUserRole().then((data) => {
      if (data.success) {
        toast.success(data.success);
      }
    });
  };
  return (
    <Button className={className} onClick={handleClick}>
      Toggle Role
    </Button>
  );
};
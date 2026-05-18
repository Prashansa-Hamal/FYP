"use server";

import db from "@/lib/db";
import { getCurrentUser } from "@/data/current-user";
import { cookies } from "next/headers";
import { updateUserSessionData } from "@/cores/session";

/**
 * SECURITY: This function is for DEVELOPMENT/TESTING ONLY
 * In production, role changes should ONLY be done by super admins
 * through a secure admin panel with proper authorization checks.
 * 
 * TODO: Remove this function before production deployment
 * TODO: Implement proper role management with audit logging
 */
export const toggleUserRole = async () => {
  // SECURITY CHECK: Only allow in development environment
  if (process.env.NODE_ENV === "production") {
    return { 
      error: "Role toggle is disabled in production for security reasons. Please contact an administrator." 
    };
  }

  const user = await getCurrentUser({ redirectIfNotFound: true });

  // SECURITY: Only allow toggling between USER and ADMIN
  // Other roles (CHEF, WAITER, BARTENDER, MANAGER) should be set by admins only
  if (user?.role !== "USER" && user?.role !== "ADMIN") {
    return { 
      error: "Cannot toggle role for staff members. Contact administrator." 
    };
  }

  const newRole = user?.role === "ADMIN" ? "USER" : "ADMIN";

  const updatedUser = await db.user.update({
    where: { id: user?.id },
    data: {
      role: newRole,
    },
  });

  await updateUserSessionData(updatedUser, await cookies());

  // Log role change for security audit
  console.warn(`[SECURITY AUDIT] User ${user.id} changed role from ${user.role} to ${newRole}`);

  return { success: `User role Updated to ${newRole}` };
};

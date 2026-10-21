import type { User } from "@/types/auth.types";

/** SuperAdmin or SYSTEM staff with `view_overview` (external types are denied by API). */
export function canViewDashboardOverview(user: User | null | undefined): boolean {
  if (!user) return false;
  if (user.is_super_admin) return true;
  if (user.account_type !== "SYSTEM") return false;
  return user.permissions.includes("view_overview");
}

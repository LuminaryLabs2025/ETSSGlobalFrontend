import { useAuthStore } from "@/store/auth.store";
import type { Permission } from "@/types/permissions";

export function useUserPermissions() {
  const permissions = useAuthStore((s) => s.user?.permissions ?? []);

  const hasPermission = (perm: Permission) => permissions.includes(perm);

  const hasAnyPermission = (perms: Permission[]) =>
    perms.some((p) => permissions.includes(p));

  const hasAllPermissions = (perms: Permission[]) =>
    perms.every((p) => permissions.includes(p));

  return { permissions, hasPermission, hasAnyPermission, hasAllPermissions };
}

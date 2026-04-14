"use client";

import { useUserPermissions } from "@/hooks/useUserPermissions";
import type { Permission } from "@/types/permissions";

interface CanProps {
  /** Single permission check */
  permission?: Permission;
  /** User must have at least one of these (OR) */
  anyOf?: Permission[];
  /** User must have all of these (AND) */
  allOf?: Permission[];
  /** Rendered when permission check fails */
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function Can({ permission, anyOf, allOf, fallback = null, children }: CanProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = useUserPermissions();

  let allowed = true;

  if (permission) allowed = hasPermission(permission);
  if (anyOf) allowed = allowed && hasAnyPermission(anyOf);
  if (allOf) allowed = allowed && hasAllPermissions(allOf);

  return allowed ? <>{children}</> : <>{fallback}</>;
}





// example usage:

// <Can permission="user.create">
//   <button>Create User</button>
// </Can>

// <Can anyOf={['user.create', 'user.manage']}>
//   <button>Manage Users</button>
// </Can>

// <Can allOf={['user.view', 'user.edit']}>
//   <button>Edit User</button>
// </Can>


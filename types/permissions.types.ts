// ─── Permission ───
export interface Permission {
  id: string;
  module_id: string;
  name: string;
  description: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// ─── Permission Module ───
export interface PermissionModule {
  id: string;
  key: string;
  name: string;
  description: string;
  sort_order: number;
  nav_section: string | null;
  permissions: Permission[];
  created_at: string;
  updated_at: string;
}

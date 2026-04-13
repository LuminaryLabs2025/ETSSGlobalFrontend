// ─── User Type (role category) ───
export interface UserTypeDetail {
  id: string;
  name: string;
  slug: string;
  category: string;
  metadata: unknown;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ─── Platform User ───
export interface PlatformUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  is_super_admin: boolean;
  account_type: string;
  status: string;
  user_type_id: string;
  user_type: UserTypeDetail;
  company_id: string | null;
  company: unknown;
  extra_fields: unknown;
  invited_by: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Users List Response ───
export interface UsersListResponse {
  data: PlatformUser[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

// ─── Users List Filters ───
export interface UsersListParams {
  page?: number;
  limit?: number;
  user_type_id?: string;
  account_type?: string;
  status?: string;
  company_id?: string;
  search?: string;
  date_from?: string;
  date_to?: string;
  sort_by?: string;
}

// ─── Users Summary ───
export interface UserTypeSummary {
  user_type: string;
  category: string;
  count: number;
}

export interface UsersSummaryResponse {
  total: number;
  active: number;
  inactive: number;
  awaiting_activation: number;
  archived: number;
  by_user_type: UserTypeSummary[];
}

// ─── User Action Response ───
export interface UserActionResponse {
  message: string;
}

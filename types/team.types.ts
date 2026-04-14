// ─── Team Member User Type ───
export interface TeamMemberUserType {
  id: string;
  name: string;
}

// ─── Team Member ───
export interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  user_type: TeamMemberUserType;
  status: string;
  account_type: string;
  company: unknown;
  department: string | null;
  created_at: string;
}

// ─── Team Members List Response ───
export interface TeamListResponse {
  data: TeamMember[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

// ─── Team Members List Filters ───
export interface TeamListParams {
  page?: number;
  limit?: number;
  user_type_id?: string;
  status?: string;
  company_id?: string;
  search?: string;
  date_from?: string;
  date_to?: string;
}

// ─── Team Members Summary ───
export interface TeamSummaryResponse {
  total: number;
  active: number;
  inactive: number;
  awaiting_activation: number;
  archived: number;
  by_user_type: { user_type: string; category: string; count: number }[];
}

// ─── Create Team Member Payload ───
export interface CreateTeamMemberPayload {
  name: string;
  email: string;
  phone: string;
  user_type_id: string;
  permission_ids: string[];
  department: string;
}

// ─── Team Action Response ───
export interface TeamActionResponse {
  message: string;
}

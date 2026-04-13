import type { PlatformUser, UserTypeSummary } from "./users.types";

// ─── Team Members List Response ───
export interface TeamListResponse {
  data: PlatformUser[];
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
  by_user_type: UserTypeSummary[];
}

// ─── Team Action Response ───
export interface TeamActionResponse {
  message: string;
}

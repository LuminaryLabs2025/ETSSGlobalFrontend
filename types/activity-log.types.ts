// ─── Activity Log Entry ───
export interface ActivityLogEntry {
  serial_no: number;
  id: string;
  timestamp: string;
  user_name: string | null;
  user_email: string | null;
  user_type_name: string | null;
  linked_company_name: string | null;
  action_performed: string;
  module_feature: string;
  action: string;
  entity: string;
  entity_id: string | null;
  ip_address: string;
  user_agent: string;
  status: string;
  http_status_code: number | null;
  error_message: string | null;
  metadata: {
    url: string;
    body: unknown;
    method: string;
  };
  user_id: string | null;
}

// ─── Activity Log Detail (by ID) ───
export interface ActivityLogDetail extends ActivityLogEntry {
  full_activity_description: string;
  affected_record: string;
  performed_by: string;
}

// ─── Activity Log List Response ───
export interface ActivityLogListResponse {
  data: ActivityLogEntry[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

// ─── Activity Log List Params ───
export interface ActivityLogListParams {
  page?: number;
  limit?: number;
  user_name?: string;
  user_email?: string;
  user_type_id?: string;
  company_id?: string;
  module?: string;
  action_type?: string;
  search?: string;
  date_from?: string;
  date_to?: string;
  status?: string;
  since?: string;
  performed_by_user_id?: string;
  format?: string;
}

// ─── Activity Log Summary ───
export interface ActivityLogSummaryResponse {
  total_activities: number;
  by_user_type: { user_type: string; count: number }[];
  by_module: { module: string; count: number }[];
  by_status: {
    successful: number;
    failed: number;
  };
}

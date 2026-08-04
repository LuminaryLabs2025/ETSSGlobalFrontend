// ─── Enumerations ───
export type TEPClassification =
  | "EMPTY_TDO"
  | "IMPORT_TDO"
  | "EXPORT_TDO"
  | "GATEPASS_PORT"
  | "GATEPASS_NON_PORT";

export type TEPSource =
  | "SHIPPING_LINE"
  | "PORT_TERMINAL"
  | "NON_PORT_TERMINAL"
  | "EPT";

export type TEPMatchStatus = "MATCHED" | "UNMATCHED";

export type TEPStatus = "ACTIVE" | "EXPIRED" | "REVOKED";

export type TEPActivityType =
  | "CREATED"
  | "UPDATED"
  | "VALIDATED"
  | "MATCHED"
  | "UNMATCHED"
  | "REVOKED"
  | "EXPIRED";

// ─── Sub-models ───
export interface TEPMatchedTruck {
  plate_number: string;
  driver_name: string;
  driver_id: string;
  match_timestamp: string;
}

export interface TEPActivityEvent {
  event_type: TEPActivityType;
  performed_by: string;
  timestamp: string;
  details: string;
}

// ─── Core TEP Record ───
export interface TEP {
  id: string;
  reference_number: string;
  classification: TEPClassification;
  source: TEPSource;
  facility_name: string;
  company_name: string;
  user_account: string;
  truck_plate_number?: string;
  match_status: TEPMatchStatus;
  created_at: string;
  expiry_date?: string;
  status: TEPStatus;
  matched_trucks?: TEPMatchedTruck[];
  activity_log: TEPActivityEvent[];
}

// ─── Summary ───
export interface TEPsSummary {
  total: number;
  active: number;
  expired: number;
  revoked: number;
  matched: number;
  unmatched: number;
  by_classification: Partial<Record<TEPClassification, number>>;
  by_source: Partial<Record<TEPSource, number>>;
}

export type TEPsSummaryResponse = TEPsSummary;

// ─── List Params ───
export interface TEPsListParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  classification?: TEPClassification | string;
  source?: TEPSource | string;
  status?: TEPStatus | string;
  match_status?: TEPMatchStatus | string;
}

// ─── List Response ───
export interface TEPsListResponse {
  data: TEP[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

// ─── Action Response ───
export interface TEPActionResponse {
  message: string;
}

export interface TEPReasonPayload {
  reason: string;
}

// ─── Create Payloads ───
export interface CreateTEPPayload {
  reference_number: string;
  classification: TEPClassification;
  facility_name: string;
  company_name: string;
  truck_plate_number: string;
  expiry_date: string;
  terminal_id?: string;
}

export interface BulkCreateTEPsPayload {
  teps: CreateTEPPayload[];
}

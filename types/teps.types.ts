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
  by_classification: Record<TEPClassification, number>;
  by_source: Record<TEPSource, number>;
}

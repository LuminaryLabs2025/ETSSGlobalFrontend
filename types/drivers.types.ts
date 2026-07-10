// ─── Enumerations ───
export type DriverVerificationStatus =
  | "VERIFIED"
  | "UNVERIFIED"
  | "VERIFICATION_IN_PROGRESS"
  | "FLAGGED"
  | "DISABLED"
  | "ARCHIVED";

export type DriverOperationalStatus =
  | "AVAILABLE"
  | "ON_TRIP"
  | "IN_FACILITY"
  | "IN_PREGATE"
  | "IN_TERMINAL"
  | "OFF_DUTY"
  | "SUSPENDED";

export type DriverSex = "MALE" | "FEMALE";

export type DriverVisibility = "PRIVATE" | "PUBLIC";

export type FlagType =
  | "TRAFFIC_VIOLATION"
  | "MISCONDUCT"
  | "ACCIDENT"
  | "UNAUTHORIZED_ROUTE"
  | "EXPIRED_LICENSE"
  | "CUSTOMER_COMPLAINT";

export type FlagStatus = "ACTIVE" | "CLEARED" | "UNDER_REVIEW";

// ─── Sub-models ───
export interface DriverCompanyInfo {
  company_name: string;
  user_account: string;
}

export interface DriverFlag {
  flag_id: string;
  flag_type: FlagType;
  flag_details: string;
  flagged_by: string;
  flagged_at: string;
  flag_status: FlagStatus;
}

export interface DriverDisableInfo {
  disabled_by: string;
  disable_reason: string;
  disable_timestamp: string;
}

// ─── Core Driver Record ───
export interface Driver {
  id: string;
  first_name: string;
  last_name: string;
  mobile_number: string;
  license_number: string;
  license_expiry_date: string;
  date_of_birth: string;
  sex: DriverSex;
  created_at: string;
  verification_status: DriverVerificationStatus;
  registered_by: DriverCompanyInfo;
  visibility: DriverVisibility;
  // Verified only
  verification_timestamp?: string;
  operational_status?: DriverOperationalStatus;
  // Flagged only
  flag?: DriverFlag;
  // Disabled only
  disable_info?: DriverDisableInfo;
}

// ─── Summary ───
export interface DriversSummary {
  total: number;
  verified: number;
  unverified: number;
  verification_in_progress: number;
  flagged: number;
  disabled: number;
  archived: number;
  available: number;
  on_trip: number;
}

export type DriversSummaryResponse = DriversSummary;

// ─── List Params ───
export interface DriversListParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  verification_status?: DriverVerificationStatus | string;
  operational_status?: DriverOperationalStatus | string;
  visibility?: DriverVisibility | string;
  flag_type?: FlagType | string;
  flag_status?: FlagStatus | string;
}

// ─── List Response ───
export interface DriversListResponse {
  data: Driver[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

// ─── Action Response ───
export interface DriverActionResponse {
  message: string;
}

export interface DriverReasonPayload {
  reason: string;
}

// ─── Create Payload ───
export interface CreateDriverPayload {
  first_name: string;
  last_name: string;
  mobile_number: string;
  license_number: string;
  license_expiry_date: string;
  date_of_birth: string;
  sex: DriverSex;
  transporter_company_id: string;
  visibility: DriverVisibility;
}

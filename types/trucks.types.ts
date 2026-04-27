// ─── Enumerations ───
export type TruckType =
  | "20-FOOTER"
  | "40-FOOTER"
  | "FLATBED"
  | "LOW_LOADER"
  | "TANKER"
  | "CURTAINSIDER";

export type RegistrationStatus =
  | "MSS_VERIFIED"
  | "UNVERIFIED"
  | "VERIFICATION_REQUESTED"
  | "FLAGGED"
  | "DISABLED"
  | "ARCHIVED";

export type TruckStatus =
  | "AVAILABLE"
  | "ON_TRIP"
  | "IN_FACILITY"
  | "MATCHED"
  | "GTG_FACILITY"
  | "LEFT_FACILITY"
  | "IN_PREGATE"
  | "GTG_PREGATE"
  | "LEFT_PREGATE"
  | "IN_TERMINAL"
  | "LEFT_TERMINAL";

export type Visibility = "PRIVATE" | "PUBLIC";

export type PenaltyType =
  | "OVERSTAY"
  | "ROUTE_VIOLATION"
  | "UNAUTHORIZED_PARKING"
  | "OVERWEIGHT"
  | "CONTRABAND";

export type PaymentStatus = "UNPAID" | "PAID" | "OVERRIDDEN" | "DISPUTED";

// ─── Sub-Models ───
export interface TruckCompanyInfo {
  company_name: string;
  user_account: string;
}

export interface TruckPenalty {
  penalty_id: string;
  penalty_type: PenaltyType;
  amount: number;
  date_issued: string;
  issued_by: string;
  payment_status: PaymentStatus;
  booked_by: TruckCompanyInfo;
}

export interface TruckDisableInfo {
  disabled_by: string;
  disable_reason: string;
  disable_timestamp: string;
}

// ─── Core Truck Record ───
export interface Truck {
  id: string;
  plate_number: string;
  truck_type: TruckType;
  color: string;
  chassis_number: string;
  brand: string;
  model: string;
  truck_length: string;
  truck_capacity: string;
  created_at: string;
  registration_status: RegistrationStatus;
  registered_by: TruckCompanyInfo;
  visibility: Visibility;
  // Verified only
  truck_status?: TruckStatus;
  mss_verification_number?: string;
  verification_timestamp?: string;
  rfid_tag_number?: string;
  // Flagged only
  penalty?: TruckPenalty;
  // Disabled only
  disable_info?: TruckDisableInfo;
}

// ─── Summary ───
export interface TrucksSummary {
  total: number;
  mss_verified: number;
  unverified: number;
  verification_requested: number;
  flagged: number;
  disabled: number;
  archived: number;
  available: number;
  on_trip: number;
}

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
export interface TruckTypeRef {
  id: string;
  name: string;
}

export interface TruckLengthRef {
  id: string;
  length_value: string;
}

export interface TruckCapacityRef {
  id: string;
  capacity_value: string;
}

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
  truck_type_id?: string;
  truck_type: TruckType | TruckTypeRef;
  color: string;
  chassis_number: string;
  brand: string;
  model: string;
  truck_length_id?: string | null;
  truck_length?: TruckLengthRef | string | null;
  truck_capacity_id?: string | null;
  truck_capacity?: TruckCapacityRef | string | null;
  created_at: string;
  registration_status: RegistrationStatus;
  registered_by: TruckCompanyInfo;
  visibility: Visibility;
  // Verified only
  truck_status?: TruckStatus;
  mss_verification_number?: string;
  mss_expiry_date?: string;
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
  mss_expired: number;
  unverified: number;
  verification_requested: number;
  flagged: number;
  disabled: number;
  archived: number;
  available: number;
  on_trip: number;
}

export type TrucksSummaryResponse = TrucksSummary;

// ─── List Params ───
export interface TrucksListParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  registration_status?: RegistrationStatus | string;
  truck_status?: TruckStatus | string;
  truck_type?: TruckType | string;
  visibility?: Visibility | string;
  penalty_type?: PenaltyType | string;
  payment_status?: PaymentStatus | string;
}

// ─── List Response ───
export interface TrucksListResponse {
  data: Truck[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

// ─── Action Response ───
export interface TruckActionResponse {
  message: string;
}

export interface TruckReasonPayload {
  reason: string;
}

// ─── Create Payloads ───
export interface CreateTruckPayload {
  plate_number: string;
  truck_type: TruckType;
  color: string;
  chassis_number: string;
  brand: string;
  model: string;
  truck_length: string;
  truck_capacity: string;
  transporter_company_id: string;
  visibility: Visibility;
}

export interface BulkCreateTruckItem {
  plate_number: string;
  truck_type: TruckType;
  color: string;
  chassis_number: string;
  brand: string;
  model: string;
  truck_length: string;
  truck_capacity: string;
  visibility: Visibility;
}

export interface BulkCreateTrucksPayload {
  transporter_company_id: string;
  trucks: BulkCreateTruckItem[];
}

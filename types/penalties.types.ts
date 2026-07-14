// ─── Enumerations ───
export type PenaltyStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED";

export type IssuedFineStatus = "ACCEPTED" | "DISPUTED";

export type BookingCategory = "IMPORT" | "EXPORT" | "EMPTY";

export type TruckBookingStatus =
  | "AVAILABLE" | "ON_TRIP" | "IN_FACILITY" | "MATCHED"
  | "IN_PREGATE" | "IN_TERMINAL" | "LEFT_TERMINAL" | "FLAGGED" | "LIVE";

export type DisputeStatus =
  | "PENDING_REVIEW"
  | "UNDER_NPA_REVIEW"
  | "RESOLVED"
  | "REJECTED";

export type ResolutionOutcome =
  | "FINE_UPHELD"
  | "FINE_WAIVED"
  | "FINE_ADJUSTED";

// ─── Penalty Definition (master list) ───
export interface PenaltyDefinition {
  id: string;
  penalty_code: string;
  name: string;
  description: string;
  fine_amount: number;
  status: PenaltyStatus;
  created_by: string;
  created_at: string;
  updated_by?: string;
  updated_at?: string;
}

// ─── Supporting sub-models ───
export interface TransporterInfo {
  company_name: string;
  user_account: string;
  contact_person: string;
  contact_number: string;
  email: string;
}

export interface BookingInfo {
  booking_reference: string;
  terminal_destination: string;
  booking_date: string;
  category: BookingCategory;
  truck_booking_status: TruckBookingStatus;
}

// ─── Issued Fine ───
export interface IssuedFine {
  id: string;
  issued_fine_id: string;
  penalty_code: string;
  penalty_name: string;
  fine_amount: number;
  booking: BookingInfo;
  truck_plate_number: string;
  driver_name: string;
  transporter: TransporterInfo;
  date_issued: string;
  issued_by: string;
  status: IssuedFineStatus;
}

// ─── Resolution Event ───
export interface ResolutionEvent {
  action: string;
  performed_by: string;
  timestamp: string;
  notes: string;
}

// ─── Fine Dispute ───
export interface FineDispute {
  id: string;
  dispute_id: string;
  issued_fine_id: string;
  penalty_code: string;
  penalty_name: string;
  fine_amount: number;
  booking: BookingInfo;
  truck_plate_number: string;
  driver_name: string;
  transporter: TransporterInfo;
  date_issued: string;
  date_disputed: string;
  dispute_reason: string;
  dispute_status: DisputeStatus;
  resolution_outcome?: ResolutionOutcome;
  managed_by?: string;
  resolution_date?: string;
  adjusted_amount?: number;
  resolution_history: ResolutionEvent[];
}

// ─── Summaries ───
export interface PenaltiesSummary {
  total: number;
  active: number;
  inactive: number;
  archived: number;
  avg_fine_amount: number;
}

export interface IssuedFinesSummary {
  total: number;
  accepted: number;
  disputed: number;
  total_amount: number;
  accepted_amount: number;
  disputed_amount: number;
}

export interface DisputesSummary {
  total: number;
  pending_review: number;
  under_npa_review: number;
  resolved: number;
  rejected: number;
  fine_upheld: number;
  fine_waived: number;
  fine_adjusted: number;
  total_amount_in_dispute: number;
  total_amount_waived_adjusted: number;
}

export type PenaltiesSummaryResponse = PenaltiesSummary;
export type IssuedFinesSummaryResponse = IssuedFinesSummary;
export type DisputesSummaryResponse = DisputesSummary;

export interface PenaltiesListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: PenaltyStatus | string;
  sort?: string;
}

export interface IssuedFinesListParams {
  page?: number;
  limit?: number;
  penalty_name?: string;
  terminal?: string;
}

export interface DisputesListParams {
  page?: number;
  limit?: number;
  search?: string;
  dispute_status?: DisputeStatus | string;
  resolution_outcome?: ResolutionOutcome | string;
}

export interface PaginatedListMeta {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface PenaltiesListResponse {
  data: PenaltyDefinition[];
  meta: PaginatedListMeta;
}

export interface IssuedFinesListResponse {
  data: IssuedFine[];
  meta: PaginatedListMeta;
}

export interface DisputesListResponse {
  data: FineDispute[];
  meta: PaginatedListMeta;
}

export interface PenaltyPayload {
  name: string;
  description: string;
  fine_amount: number;
  status: PenaltyStatus;
}

export interface ResolveDisputePayload {
  dispute_status: DisputeStatus;
  resolution_outcome?: ResolutionOutcome;
  adjusted_amount?: number;
  notes?: string;
}

export interface PenaltyActionResponse {
  message: string;
  data?: PenaltyDefinition;
}

export interface IssuedFineActionResponse {
  message: string;
  data?: IssuedFine;
}

export interface DisputeActionResponse {
  message: string;
  data?: FineDispute;
}

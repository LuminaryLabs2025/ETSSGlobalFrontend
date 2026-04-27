// ─── Facility Sub-Type ───
export type FacilitySubType = "FACILITY" | "FACILITY_PREGATE";

// ─── Facility Category (drives the tab) ───
export type FacilityCategory = "BONDED_TERMINAL" | "TRUCK_PARK" | "FISH_VAN_PARK";

// ─── Operational Status ───
export type FacilityStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED";

// ─── Facility Record ───
export interface Facility {
  id: string;
  name: string;
  facility_id: string;
  category: FacilityCategory;
  facility_type: FacilitySubType;
  address: string;
  hourly_handling_capacity: number;
  approved_capacity: number;
  daily_evacuation_limit: number;
  operational_status: FacilityStatus;
  created_at: string;
  updated_at: string;
}

// ─── Summary Stats (per tab) ───
export interface FacilitySummary {
  total: number;
  enabled: number;
  disabled: number;
  avg_hourly_handling_capacity: number;
  total_daily_evacuation_limit: number;
}

// ─── List Params (for future API) ───
export interface FacilitiesListParams {
  page?: number;
  limit?: number;
  search?: string;
  facility_type?: FacilitySubType | "All";
  operational_status?: FacilityStatus | "All";
  sort_by?: string;
  sort_dir?: "asc" | "desc";
}

// ─── Facility Type ───
export type FacilityType = "PREGATE" | "EPT";

// ─── Operational Status ───
export type FacilityStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED";

// ─── Transit Facility (Pregate or EPT) ───
export interface TransitFacility {
  id: string;
  name: string;
  facility_type: FacilityType;
  code: string;
  address: string;
  hourly_truck_handling_capacity: number;
  approved_bays: number;
  operational_status: FacilityStatus;
  created_at: string;
  updated_at: string;
}

// ─── Summary Stats (per-tab) ───
export interface TransitFacilitySummary {
  total: number;
  enabled: number;
  disabled: number;
  avg_hourly_handling_capacity: number;
  total_bay_capacity: number;
}

// ─── Chart Data Point ───
export interface FacilityChartDataPoint {
  name: string;
  approved_capacity: number;
  live_booking_count: number;
}

// ─── List Params (for future API) ───
export interface TransitFacilitiesListParams {
  page?: number;
  limit?: number;
  search?: string;
  operational_status?: FacilityStatus | "All";
  sort_by?: string;
  sort_dir?: "asc" | "desc";
}

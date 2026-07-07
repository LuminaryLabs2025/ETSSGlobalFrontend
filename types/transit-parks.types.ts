// ─── Transit Park Type ───
export type TransitParkType = "PREGATE" | "EPT";

// ─── Operational Status ───
export type TransitParkStatus = "ACTIVE" | "INACTIVE";

// ─── Location ───
export type TransitParkLocation = "APAPA" | "TINCAN" | string;

// ─── Transit Park Record ───
export interface TransitPark {
  id: string;
  name: string;
  transit_park_type: TransitParkType;
  transit_park_code: string;
  location: TransitParkLocation;
  address: string;
  approved_truck_capacity: number;
  approved_truck_exits_per_hour: number;
  bay_capacity: number;
  status: TransitParkStatus;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Display status (includes archived) ───
export type TransitParkDisplayStatus = TransitParkStatus | "ARCHIVED";

export function getTransitParkDisplayStatus(park: TransitPark): TransitParkDisplayStatus {
  if (park.archived_at) return "ARCHIVED";
  return park.status;
}

// ─── Summary Stats ───
export interface TransitParksSummaryResponse {
  total: number;
  enabled: number;
  disabled: number;
  avg_truck_exits_per_hour: number;
  total_bay_capacity: number;
  pregates: number;
  export_processing_terminals: number;
}

// ─── Chart Data Point ───
export interface FacilityChartDataPoint {
  name: string;
  approved_capacity: number;
  live_booking_count: number;
}

// ─── List Params ───
export interface TransitParksListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  type?: TransitParkType;
  location?: string;
  include_archived?: boolean;
}

// ─── List Response ───
export interface TransitParksListResponse {
  data: TransitPark[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

// ─── Update Payload ───
export interface UpdateTransitParkPayload {
  name: string;
  transit_park_type: TransitParkType;
  location: TransitParkLocation;
  address: string;
  approved_truck_capacity: number;
  approved_truck_exits_per_hour: number;
  bay_capacity: number;
  status: TransitParkStatus;
}

// ─── Action Response ───
export interface TransitParkActionResponse {
  message: string;
}

export function toUpdatePayload(
  park: TransitPark,
  overrides: Partial<UpdateTransitParkPayload> = {}
): UpdateTransitParkPayload {
  return {
    name: park.name,
    transit_park_type: park.transit_park_type,
    location: park.location,
    address: park.address,
    approved_truck_capacity: park.approved_truck_capacity,
    approved_truck_exits_per_hour: park.approved_truck_exits_per_hour,
    bay_capacity: park.bay_capacity,
    status: park.status,
    ...overrides,
  };
}

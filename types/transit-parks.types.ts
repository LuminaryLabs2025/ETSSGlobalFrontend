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

// ─── Transit Park Detail (extended view) ───
export interface TransitParkPrimaryAccountUser {
  name?: string | null;
  email?: string | null;
}

export interface TransitParkOperationalHours {
  all_day?: boolean;
  opens_at?: string | null;
  closes_at?: string | null;
}

export type TransitParkBarrierStatus = "ONLINE" | "OFFLINE";

export interface TransitParkBarrier {
  id: string;
  barrier_id_number?: string;
  operational_status?: TransitParkBarrierStatus;
  /** @deprecated use operational_status */
  status?: TransitParkBarrierStatus;
}

export interface TransitParkMovementTime {
  booking_category: string;
  terminal?: string | null;
  from_time?: string | null;
  to_time?: string | null;
}

export interface TransitParkSubAccount {
  id: string;
  name: string;
  email?: string | null;
  user_type?: string | null;
  status?: string | null;
}

export interface TransitParkDetail extends TransitPark {
  primary_account_user?: TransitParkPrimaryAccountUser | null;
  operational_hours?: TransitParkOperationalHours | null;
  linked_booking_categories?: string[];
  linked_facilities?: string[];
  linked_terminal_operators?: string[];
  entry_barriers?: TransitParkBarrier[];
  exit_barriers?: TransitParkBarrier[];
  movement_times?: TransitParkMovementTime[];
  sub_accounts?: TransitParkSubAccount[];
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

// ─── Write Payload (create / update) ───
export interface TransitParkWritePayload {
  name: string;
  transit_park_type: TransitParkType;
  location: TransitParkLocation;
  address: string;
  approved_truck_capacity: number;
  approved_truck_exits_per_hour: number;
  bay_capacity: number;
  status: TransitParkStatus;
  entry_barrier_ids: string[];
  exit_barrier_ids: string[];
}

export type CreateTransitParkPayload = TransitParkWritePayload;
export type UpdateTransitParkPayload = TransitParkWritePayload;

/** @deprecated use TransitParkWritePayload */
export type EditTransitParkInformationPayload = TransitParkWritePayload;

export function extractTransitParkBarrierIds(barriers?: TransitParkBarrier[]): string[] {
  return (barriers ?? []).map((barrier) => barrier.id);
}

export function resolveTransitParkBarrierNumber(barrier: TransitParkBarrier): string {
  return barrier.barrier_id_number?.trim() || barrier.id;
}

export function resolveTransitParkBarrierOperationalStatus(
  barrier: TransitParkBarrier,
): TransitParkBarrierStatus {
  return barrier.operational_status ?? barrier.status ?? "OFFLINE";
}

export function toUpdatePayload(
  park: TransitPark,
  overrides: Partial<TransitParkWritePayload> = {},
): TransitParkWritePayload {
  return {
    name: park.name,
    transit_park_type: park.transit_park_type,
    location: park.location,
    address: park.address,
    approved_truck_capacity: park.approved_truck_capacity,
    approved_truck_exits_per_hour: park.approved_truck_exits_per_hour,
    bay_capacity: park.bay_capacity,
    status: park.status,
    entry_barrier_ids: [],
    exit_barrier_ids: [],
    ...overrides,
  };
}

// ─── Action Response ───
export interface TransitParkActionResponse {
  message: string;
}

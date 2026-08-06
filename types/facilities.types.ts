// ─── Park Type (drives the tab) ───
export type FacilityParkType = "BONDED_TERMINAL" | "TRUCK_PARK" | "FISH_VAN_PARK";

// ─── Facility Sub-Type ───
export type FacilitySubType = "FACILITY" | "FACILITY_PREGATE";

// ─── Operational Status ───
export type FacilityStatus = "ACTIVE" | "INACTIVE";

// ─── Location ───
export type FacilityLocation = "APAPA" | "TINCAN" | string;

// ─── Facility Record ───
export interface Facility {
  id: string;
  name: string;
  park_type: FacilityParkType;
  facility_type: FacilitySubType;
  facility_code: string;
  location: FacilityLocation;
  address: string;
  approved_truck_capacity: number | null;
  approved_truck_exits_per_hour: number | null;
  bay_capacity: number | null;
  daily_empty_evacuation_limit: number | null;
  status: FacilityStatus;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Facility Detail (extended view) ───
export interface FacilityPrimaryAccountUser {
  name?: string | null;
  email?: string | null;
}

export interface FacilityOperationalHours {
  all_day?: boolean;
  opens_at?: string | null;
  closes_at?: string | null;
}

export type FacilityBarrierStatus = "ONLINE" | "OFFLINE";

export interface FacilityBarrier {
  id: string;
  barrier_id_number?: string;
  barrier_type?: "ENTRY" | "EXIT";
  operational_status?: FacilityBarrierStatus;
  /** @deprecated use operational_status */
  status?: FacilityBarrierStatus;
}

export interface FacilityMovementTime {
  booking_category: string;
  transit_park?: string | null;
  from_time?: string | null;
  to_time?: string | null;
}

export interface FacilitySubAccount {
  id: string;
  name: string;
  email?: string | null;
  user_type?: string | null;
  status?: string | null;
}

export interface FacilityDetail extends Facility {
  primary_account_user?: FacilityPrimaryAccountUser | null;
  operational_hours?: FacilityOperationalHours | null;
  linked_booking_categories?: string[];
  linked_transit_parks?: string[];
  linked_terminal_operators?: string[];
  entry_barriers?: FacilityBarrier[];
  exit_barriers?: FacilityBarrier[];
  movement_times?: FacilityMovementTime[];
  sub_accounts?: FacilitySubAccount[];
}

// ─── Display status (includes archived) ───
export type FacilityDisplayStatus = FacilityStatus | "ARCHIVED";

export function getFacilityDisplayStatus(facility: Facility): FacilityDisplayStatus {
  if (facility.archived_at) return "ARCHIVED";
  return facility.status;
}

// ─── Summary Stats ───
export interface FacilitiesSummaryResponse {
  total: number;
  enabled: number;
  disabled: number;
  avg_truck_exits_per_hour: number;
  total_daily_empty_evacuation_limit: number;
  bonded_terminals: number;
  truck_parks: number;
  fish_van_parks: number;
}

// ─── List Params ───
export interface FacilitiesListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  park_type?: FacilityParkType;
  facility_type?: FacilitySubType;
  location?: string;
}

// ─── List Response ───
export interface FacilitiesListResponse {
  data: Facility[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

// ─── Update Payload ───
export interface UpdateFacilityPayload {
  name: string;
  park_type: FacilityParkType;
  facility_type: FacilitySubType;
  location: FacilityLocation;
  address: string;
  approved_truck_capacity: number;
  approved_truck_exits_per_hour: number;
  bay_capacity: number;
  daily_empty_evacuation_limit: number;
  status: FacilityStatus;
  entry_barrier_ids: string[];
  exit_barrier_ids: string[];
}

// ─── Write Payload (create / update) ───
export type CreateFacilityPayload = UpdateFacilityPayload;
export type FacilityWritePayload = UpdateFacilityPayload;

// ─── Action Response ───
export interface FacilityActionResponse {
  message: string;
}

export function toUpdatePayload(
  facility: Facility,
  overrides: Partial<UpdateFacilityPayload> = {}
): UpdateFacilityPayload {
  return {
    name: facility.name,
    park_type: facility.park_type,
    facility_type: facility.facility_type,
    location: facility.location,
    address: facility.address,
    approved_truck_capacity: facility.approved_truck_capacity ?? 0,
    approved_truck_exits_per_hour: facility.approved_truck_exits_per_hour ?? 0,
    bay_capacity: facility.bay_capacity ?? 0,
    daily_empty_evacuation_limit: facility.daily_empty_evacuation_limit ?? 0,
    status: facility.status,
    entry_barrier_ids: [],
    exit_barrier_ids: [],
    ...overrides,
  };
}

// ─── Edit Facility Information ───
export type FacilityHoursMode = "ALL_DAY" | "CUSTOM";

export interface EditFacilityInformationPayload {
  approved_truck_exits_per_hour: number;
  entry_barrier_ids: string[];
  exit_barrier_ids: string[];
}

export function extractFacilityBarrierIds(barriers?: FacilityBarrier[]): string[] {
  return (barriers ?? []).map((barrier) => barrier.id);
}

export function buildFacilityEditPayload(
  facility: Facility,
  edits: EditFacilityInformationPayload,
): UpdateFacilityPayload {
  return {
    ...toUpdatePayload(facility, {
      approved_truck_exits_per_hour: edits.approved_truck_exits_per_hour,
    }),
    entry_barrier_ids: edits.entry_barrier_ids,
    exit_barrier_ids: edits.exit_barrier_ids,
  };
}

export function resolveFacilityBarrierNumber(barrier: FacilityBarrier): string {
  return barrier.barrier_id_number?.trim() || barrier.id;
}

export function resolveFacilityBarrierOperationalStatus(
  barrier: FacilityBarrier,
): FacilityBarrierStatus {
  return barrier.operational_status ?? barrier.status ?? "OFFLINE";
}

// ─── Timeslot Assignment ───
export interface FacilityTimeslot {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  status: FacilityStatus;
}

export interface FacilityTimeslotAssignment {
  id: string;
  facility_id: string;
  timeslot_id: string;
  is_active: boolean;
  timeslot: FacilityTimeslot;
}

export interface FacilityTimeslotsListParams {
  page?: number;
  limit?: number;
}

export interface FacilityTimeslotsListResponse {
  data: FacilityTimeslotAssignment[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

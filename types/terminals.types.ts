// ─── Terminal Type ───
export type TerminalType = "PORT_TERMINAL" | "NON_PORT_TERMINAL";

// ─── Operational Status ───
export type TerminalStatus = "ACTIVE" | "INACTIVE";

// ─── Booking Status ───
export type TerminalBookingStatus = "OPEN" | "CLOSED";

// ─── Location ───
export type TerminalLocation = "APAPA" | "TINCAN" | string;

// ─── Terminal Record ───
export interface Terminal {
  id: string;
  name: string;
  terminal_type: TerminalType;
  terminal_code: string;
  location: TerminalLocation;
  address: string;
  approved_daily_truck_capacity: number;
  approved_trucks_per_hour: number;
  hourly_truck_tat_minutes: number;
  status: TerminalStatus;
  booking_status: TerminalBookingStatus;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Terminal Detail (extended view) ───
export interface TerminalPrimaryAccountUser {
  name?: string | null;
  email?: string | null;
}

export interface TerminalOperationalHours {
  all_day?: boolean;
  opens_at?: string | null;
  closes_at?: string | null;
}

export type TerminalBarrierStatus = "ONLINE" | "OFFLINE";

export interface TerminalBarrier {
  id: string;
  barrier_id_number?: string;
  operational_status?: TerminalBarrierStatus;
  /** @deprecated use operational_status */
  status?: TerminalBarrierStatus;
}

export interface TerminalMovementTime {
  booking_category: string;
  transit_park?: string | null;
  from_time?: string | null;
  to_time?: string | null;
}

export interface TerminalSubAccount {
  id: string;
  name: string;
  email?: string | null;
  user_type?: string | null;
  status?: string | null;
}

export interface TerminalManifestByCategory {
  booking_category: string;
  count: number;
}

export interface TerminalDetail extends Terminal {
  primary_account_user?: TerminalPrimaryAccountUser | null;
  operational_hours?: TerminalOperationalHours | null;
  linked_booking_categories?: string[];
  linked_transit_parks?: string[];
  entry_barriers?: TerminalBarrier[];
  exit_barriers?: TerminalBarrier[];
  movement_times?: TerminalMovementTime[];
  sub_accounts?: TerminalSubAccount[];
  trucks_in_manifest?: TerminalManifestByCategory[];
}

// ─── Display status (includes archived) ───
export type TerminalDisplayStatus = TerminalStatus | "ARCHIVED";

export function getTerminalDisplayStatus(terminal: Terminal): TerminalDisplayStatus {
  if (terminal.archived_at) return "ARCHIVED";
  return terminal.status;
}

// ─── Summary Stats ───
export interface TerminalsSummaryResponse {
  total: number;
  enabled: number;
  disabled: number;
  avg_trucks_per_hour: number;
  port_terminals: number;
  non_port_terminals: number;
  apapa_port_terminals: number;
  apapa_non_port_terminals: number;
  tincan_port_terminals: number;
  tincan_non_port_terminals: number;
}

// ─── Chart Data Point ───
export interface TerminalCapacityDataPoint {
  terminal: string;
  approved_daily_capacity: number;
  dttr: number;
  live_booking_count: number;
}

// ─── List Params ───
export interface TerminalsListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  type?: TerminalType;
  location?: string;
  booking_status?: TerminalBookingStatus;
}

// ─── List Response ───
export interface TerminalsListResponse {
  data: Terminal[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

// ─── Write Payload (create / update) ───
export interface TerminalWritePayload {
  name: string;
  terminal_type: TerminalType;
  location: TerminalLocation;
  address: string;
  approved_daily_truck_capacity: number;
  approved_trucks_per_hour: number;
  hourly_truck_tat_minutes: number;
  status: TerminalStatus;
  booking_status: TerminalBookingStatus;
  entry_barrier_ids: string[];
  exit_barrier_ids: string[];
}

export type CreateTerminalPayload = TerminalWritePayload;
export type UpdateTerminalPayload = TerminalWritePayload;

/** @deprecated use TerminalWritePayload */
export type EditTerminalInformationPayload = TerminalWritePayload;

export function extractTerminalBarrierIds(barriers?: TerminalBarrier[]): string[] {
  return (barriers ?? []).map((barrier) => barrier.id);
}

export function resolveTerminalBarrierNumber(barrier: TerminalBarrier): string {
  return barrier.barrier_id_number?.trim() || barrier.id;
}

export function resolveTerminalBarrierOperationalStatus(
  barrier: TerminalBarrier,
): TerminalBarrierStatus {
  return barrier.operational_status ?? barrier.status ?? "OFFLINE";
}

export function toUpdatePayload(
  terminal: Terminal,
  overrides: Partial<TerminalWritePayload> = {},
): TerminalWritePayload {
  return {
    name: terminal.name,
    terminal_type: terminal.terminal_type,
    location: terminal.location,
    address: terminal.address,
    approved_daily_truck_capacity: terminal.approved_daily_truck_capacity,
    approved_trucks_per_hour: terminal.approved_trucks_per_hour,
    hourly_truck_tat_minutes: terminal.hourly_truck_tat_minutes,
    status: terminal.status,
    booking_status: terminal.booking_status,
    entry_barrier_ids: [],
    exit_barrier_ids: [],
    ...overrides,
  };
}

// ─── Action Response ───
export interface TerminalActionResponse {
  message: string;
}

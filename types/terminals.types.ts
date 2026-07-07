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

// ─── Update Payload ───
export interface UpdateTerminalPayload {
  name: string;
  terminal_type: TerminalType;
  location: TerminalLocation;
  address: string;
  approved_daily_truck_capacity: number;
  approved_trucks_per_hour: number;
  hourly_truck_tat_minutes: number;
  status: TerminalStatus;
  booking_status: TerminalBookingStatus;
}

// ─── Action Response ───
export interface TerminalActionResponse {
  message: string;
}

export function toUpdatePayload(
  terminal: Terminal,
  overrides: Partial<UpdateTerminalPayload> = {}
): UpdateTerminalPayload {
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
    ...overrides,
  };
}

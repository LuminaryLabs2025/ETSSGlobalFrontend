// ─── Terminal Type ───
export type TerminalType = "PORT_TERMINAL" | "NON_PORT_TERMINAL";

// ─── Operational Status ───
export type TerminalStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED";

// ─── Port Zone ───
export type PortZone = "APAPA" | "TINCAN" | "OTHER";

// ─── Terminal Record ───
export interface Terminal {
  id: string;
  terminal_name: string;
  terminal_type: TerminalType;
  terminal_code: string;
  location: string;
  port_zone?: PortZone;
  approved_daily_truck_capacity: number;
  hourly_truck_handling_capacity: number;
  operational_status: TerminalStatus;
  created_at: string;
  updated_at: string;
}

// ─── Summary Stats ───
export interface TerminalsSummary {
  total: number;
  port_terminals: number;
  non_port_terminals: number;
  enabled: number;
  disabled: number;
  avg_hourly_handling_capacity: number;
}

// ─── Chart Data Point ───
export interface TerminalCapacityDataPoint {
  terminal: string;
  approved_daily_capacity: number;
  dttr: number;
  live_booking_count: number;
}

// ─── List Params (for future API integration) ───
export interface TerminalsListParams {
  page?: number;
  limit?: number;
  search?: string;
  terminal_type?: TerminalType | "All";
  operational_status?: TerminalStatus | "All";
  sort_by?: string;
  sort_dir?: "asc" | "desc";
}

// ─── Action Response ───
export interface TerminalActionResponse {
  message: string;
}

export type UtilityTerminalType = "PORT" | "NON_PORT";

export type UtilityTicketStatus = "PENDING" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

export type UtilityRequestType =
  | "POWER"
  | "WATER"
  | "MAINTENANCE"
  | "WASTE_MANAGEMENT"
  | "SECURITY"
  | "FUEL"
  | "OTHER";

export type UtilityBookingPriority = "PRIORITY" | "STANDARD";

export interface UtilityTicketRaisedBy {
  user_id: string;
  user_name: string;
}

export interface UtilityTicketTerminal {
  id: string;
  name: string;
  code: string;
  type: UtilityTerminalType;
  location: string;
}

export interface UtilityTicketHistoryEntry {
  id: string;
  status: UtilityTicketStatus;
  timestamp: string;
  performed_by: string;
  notes: string;
}

export interface UtilityAssignedPersonnel {
  id: string;
  name: string;
  role: string;
  assigned_at: string;
}

export interface UtilityTicket {
  id: string;
  ticket_id: string;
  terminal: UtilityTicketTerminal;
  request_type: UtilityRequestType;
  description: string;
  full_description: string;
  status: UtilityTicketStatus;
  booking_priority: UtilityBookingPriority;
  delivery_company_name: string;
  truck_plate_number?: string;
  date_raised: string;
  last_updated_at: string;
  raised_by: UtilityTicketRaisedBy;
  super_admin_approved: boolean;
  approved_by?: string;
  approved_at?: string;
  assigned_personnel?: UtilityAssignedPersonnel[];
  request_history: UtilityTicketHistoryEntry[];
  e_ticket_available: boolean;
}

export interface UtilityTicketsSummary {
  total: number;
  pending: number;
  in_progress: number;
  resolved: number;
  closed: number;
  port_terminals: number;
  non_port_terminals: number;
}

export interface UtilityTicketAuditEntry {
  id: string;
  action: string;
  details: string;
  performed_by: string;
  performed_at: string;
}

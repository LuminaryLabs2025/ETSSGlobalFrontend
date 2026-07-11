export type BookingStatus = "LIVE" | "COMPLETED" | "CANCELLED" | "EXPIRED";

export type TransferType =
  | "INBOUND"
  | "OUTBOUND"
  | "INTER_TERMINAL"
  | "EMPTY_RETURN"
  | "LOCAL";

export type BookingCategory = "IMPORT" | "EXPORT" | "EMPTY" | "DOMESTIC";

export type ManifestStatus = "IN_MANIFEST" | "LEFT_MANIFEST" | null;

export interface BookingTimelineEntry {
  id: string;
  status: string;
  timestamp: string;
  performed_by?: string;
  notes?: string;
}

export interface BookingException {
  id: string;
  type: "PENALTY" | "DELAY" | "EXCEPTION";
  description: string;
  timestamp: string;
}

export interface TowTruckRequest {
  requested_at: string;
  reason: string;
  requested_by: string;
  tow_company?: string;
  status: "PENDING" | "ASSIGNED" | "COMPLETED";
}

export interface Booking {
  id: string;
  booking_id: string;
  journey_code: string;
  truck_plate_number: string;
  truck_color: string;
  driver_name: string;
  driver_id: string;
  transporter_company: string;
  terminal_name: string;
  terminal_destination: string;
  transfer_type: TransferType;
  booking_category: BookingCategory;
  status: BookingStatus;
  created_at: string;
  last_updated_at: string;
  completed_at?: string;
  truck_booked_by: string;
  truck_owned_by: string;
  left_pregate_at?: string;
  left_manifest_at?: string;
  manifest_status: ManifestStatus;
  tow_truck_request?: TowTruckRequest;
  timeline: BookingTimelineEntry[];
  exceptions: BookingException[];
}

export interface BookingsSummary {
  total: number;
  live: number;
  completed: number;
  cancelled: number;
  expired: number;
}

export interface BookingAuditEntry {
  id: string;
  action: string;
  details: string;
  performed_by: string;
  performed_at: string;
}

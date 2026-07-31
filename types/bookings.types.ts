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
  from_status?: string;
  location?: string;
  tat_duration?: string;
  is_latest?: boolean;
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

export interface BookingTruckPreview {
  truck_type?: string;
  brand?: string;
  model?: string;
  mss_verification_number?: string;
  mss_expiry_date?: string;
  truck_status?: string;
  image_url?: string;
}

export interface Booking {
  id: string;
  booking_id: string;
  journey_code: string;
  truck_plate_number: string;
  truck_color: string;
  truck?: BookingTruckPreview;
  driver_name: string;
  driver_id: string;
  driver_phone?: string;
  transporter_company: string;
  terminal_name: string;
  terminal_destination: string;
  tep_code?: string;
  booking_fee?: number;
  arrival_date?: string;
  time_slot?: string;
  facility_name?: string;
  facility_code?: string;
  transit_park_name?: string;
  transit_park_code?: string;
  current_truck_status?: string;
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
  flagged: number;
}

export function isFlaggedBooking(booking: Booking): boolean {
  return (
    (booking.exceptions?.length ?? 0) > 0
    || booking.current_truck_status === "FLAGGED"
  );
}

export type BookingsSummaryResponse = BookingsSummary;

export interface BookingsListParams {
  page?: number;
  limit?: number;
  search?: string;
  booking_id?: string;
  journey_code?: string;
  truck_plate_number?: string;
  driver_name?: string;
  status?: BookingStatus | string;
  flagged?: boolean;
  terminal_name?: string;
  transfer_type?: TransferType | string;
  transporter_company?: string;
  date_field?: "created" | "completed";
  date_from?: string;
  date_to?: string;
}

export interface BookingsManifestParams {
  page?: number;
  limit?: number;
  search?: string;
  tab?: "in" | "left";
  date?: string;
}

export interface BookingsListResponse {
  data: Booking[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export type BookingsManifestResponse = BookingsListResponse;

export interface BookingActionResponse {
  message: string;
  data?: Booking;
}

export interface BookingAuditEntry {
  id: string;
  action: string;
  details: string;
  performed_by: string;
  performed_at: string;
}

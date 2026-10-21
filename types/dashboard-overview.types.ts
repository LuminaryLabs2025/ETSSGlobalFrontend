export type DashboardTrendDirection = "UP" | "DOWN" | "FLAT";

export type DashboardDatePreset = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY" | "CUSTOM";

export interface DashboardPeriodFilter {
  date_preset?: DashboardDatePreset;
  date_from?: string;
  date_to?: string;
}

export interface DashboardTrendMetric {
  value: number | string | null;
  previous?: number | null;
  trend_percentage: number | null;
  trend_direction: DashboardTrendDirection;
  higher_is_better: boolean;
  display?: string | null;
  minutes?: number | null;
  unit?: string;
}

export interface DashboardOverviewRevenueCard {
  source: string;
  label: string;
  amount: number;
  last_7_days?: number;
  previous_7_days?: number;
  trend_percentage: number | null;
  trend_direction: DashboardTrendDirection;
}

export interface DashboardOverviewRevenueResponse {
  currency: string;
  total_amount: number;
  cards: DashboardOverviewRevenueCard[];
}

export interface DashboardActiveSites {
  total: number;
  terminals: number;
  facilities: number;
  transit_parks: number;
}

export interface DashboardCongestion {
  index: number;
  threshold: number;
  level: "NORMAL" | "ELEVATED" | "RED_ZONE";
  in_red_zone: boolean;
  red_zone_site_count: number;
}

export interface DashboardOverviewCorridorResponse {
  live_movements: number;
  live_bookings: number;
  active_sites: DashboardActiveSites;
  verified_trucks_on_corridor: number;
  verified_drivers_on_corridor: number;
  congestion: DashboardCongestion;
  last_updated: string;
}

export interface DashboardRedZoneSite {
  site_type: string;
  id: string;
  name: string;
  code?: string;
  kind?: string;
  kind_label?: string;
  park_type_label?: string;
  capacity: number;
  occupied: number;
  utilisation_percentage: number;
  in_red_zone: boolean;
}

export interface DashboardOverviewRedZoneResponse {
  index: number;
  threshold: number;
  level: string;
  in_red_zone: boolean;
  total_capacity: number;
  total_occupied: number;
  red_zone_site_count: number;
  sites: DashboardRedZoneSite[];
}

export interface DashboardOverviewExecutiveResponse {
  live_bookings: DashboardTrendMetric;
  verified_trucks: DashboardTrendMetric;
  verified_drivers: DashboardTrendMetric;
  avg_tat_apapa: DashboardTrendMetric;
  avg_tat_tincan: DashboardTrendMetric;
  exceptions: DashboardTrendMetric;
}

export interface DashboardLifecycleItem {
  key: string;
  label: string;
  description: string;
  count: number;
}

export interface DashboardLifecycleGroup {
  key: string;
  label: string;
  items: DashboardLifecycleItem[];
}

export interface DashboardOverviewLifecycleResponse {
  total_live: number;
  groups: DashboardLifecycleGroup[];
}

export interface DashboardBookingsByTerminalRow {
  terminal_id: string;
  terminal: string;
  live: number;
  completed: number;
  cancelled: number;
  expired: number;
  total: number;
}

export interface DashboardBookingsByTerminalResponse {
  period?: { from: string | null; to: string | null };
  data: DashboardBookingsByTerminalRow[];
}

export interface DashboardMatchingsByFacilityRow {
  facility: string;
  truck_entry_permits: number;
  matched: number;
  unmatched: number;
}

export interface DashboardMatchingsByFacilityResponse {
  period?: { from: string | null; to: string | null };
  data: DashboardMatchingsByFacilityRow[];
}

export interface DashboardRecentBookingActivity {
  kind: "BOOKING" | "UTILITY_TICKET";
  id: string;
  reference: string;
  title: string;
  plate_number: string;
  party: string;
  destination: string;
  status: string;
  status_label: string;
  occurred_at: string;
}

export interface DashboardRecentMatchingActivity {
  id: string;
  booking_id: string;
  facility: string;
  plate_number: string;
  category: string;
  destination: string;
  booked_by: string;
  matched_at: string;
}

export interface DashboardRecentActivityResponse {
  type: "bookings" | "matchings";
  data: DashboardRecentBookingActivity[] | DashboardRecentMatchingActivity[];
}

export interface DashboardBookingsByCategoryRow {
  category_id: string | null;
  name: string;
  count: number;
  percentage: number;
}

export interface DashboardBookingsByCategoryResponse {
  total: number;
  data: DashboardBookingsByCategoryRow[];
}

export interface DashboardIncidentBoardItem {
  id: string;
  reference_id: string;
  title: string;
  type: string;
  type_label: string;
  location_name: string;
  severity: string;
  severity_label: string;
  status: string;
  status_label: string;
  reported_at: string;
  reported_by: string;
}

export interface DashboardIncidentBoardResponse {
  open_total: number;
  data: DashboardIncidentBoardItem[];
  tow_requests: { pending_left_manifest: number };
}

export type DashboardOpsActionType =
  | "SUSPEND_RED_ZONE_DISPATCH"
  | "REROUTE_CORRIDOR_TRAFFIC"
  | "ACTIVATE_OVERFLOW_HOLDING"
  | "BROADCAST_DIVERSION_ADVISORY"
  | "PRIORITY_MOVEMENT";

export interface DashboardOpsTarget {
  type: string;
  id: string;
  name: string;
}

export interface DashboardOpsActiveOrder {
  id: string;
  reference_id: string;
  action: DashboardOpsActionType;
  title: string;
  status: "ACTIVE" | "LIFTED";
}

export interface DashboardOpsAction {
  action: DashboardOpsActionType;
  title: string;
  description: string;
  recommended: boolean;
  reason?: string;
  targets: DashboardOpsTarget[];
  active_orders: DashboardOpsActiveOrder[];
}

export interface DashboardOpsCommandResponse {
  congestion: DashboardCongestion;
  actions: DashboardOpsAction[];
  notification: { source: "CONFIGURED" | "SUPER_ADMINS"; recipient_count: number };
}

export interface DashboardCreateOpsOrderPayload {
  action: DashboardOpsActionType;
  targets: DashboardOpsTarget[];
  notes: string;
}

export interface DashboardOpsOrder {
  id: string;
  reference_id: string;
  action: DashboardOpsActionType;
  title: string;
  status: "ACTIVE" | "LIFTED";
  targets: DashboardOpsTarget[];
  notes?: string;
  was_recommended?: boolean;
  recommendation_reason?: string;
  congestion_index?: number;
  authorised_by?: { id: string; name: string };
  authorised_at?: string;
  notified_recipients?: string[];
  notified_at?: string;
  notification_error?: string | null;
  lifted_at?: string | null;
  lifted_by?: { id: string; name: string } | null;
  lift_reason?: string | null;
}

export interface DashboardLiftOpsOrderPayload {
  reason: string;
}

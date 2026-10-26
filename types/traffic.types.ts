export type TrafficStatusCardKey = "ON_TRIP" | "LEFT_FACILITY" | "LEFT_PREGATE" | "IN_TERMINAL";

export interface TrafficStatusCardConfig {
  key: TrafficStatusCardKey;
  label: string;
  shortLabel: string;
  color: string;
  bg: string;
  border: string;
  baseCount: number;
}

export interface TrafficStatusCount {
  key: TrafficStatusCardKey;
  label: string;
  shortLabel: string;
  count: number;
}

export type LiveTruckStageGroup =
  | "TO_FACILITY"
  | "IN_FACILITY"
  | "FACILITY_TO_PREGATE"
  | "IN_PREGATE"
  | "PREGATE_TO_TERMINAL"
  | "IN_TERMINAL";

export interface LiveTruckMovement {
  id: string;
  bookingId?: string;
  plateNumber: string;
  driverName: string;
  currentLocation: string;
  destination: string;
  /** Human-readable stage label (`stage_label` from API). */
  status: string;
  stage: string;
  stageGroup: LiveTruckStageGroup | string;
  stageGroupLabel: string;
  stageGroupOrder: number;
}

export interface LiveTrucksListMeta {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface LiveTrucksParams {
  page?: number;
  limit?: number;
}

export interface LiveTrucksResponse {
  statusCounts: TrafficStatusCount[];
  movements: LiveTruckMovement[];
  listedTruckCount: number;
  meta?: LiveTrucksListMeta;
}

export interface LiveTrucksSummaryResponse {
  totalBookings: number;
  onTrip: number;
  leftFacility: number;
  leftPregate: number;
  inTerminal: number;
  statusCounts: TrafficStatusCount[];
  byStage: OccTrucksStageCount[];
  lastUpdated?: string;
}

/** Site `kind` from traffic-command locations API */
export type LocationKind =
  | "FACILITY"
  | "FACILITY_PREGATE"
  | "PREGATE"
  | "EPT"
  | "TERMINAL"
  | "TRANSIT_PARK";

export type MapFacilityKind = LocationKind;

/** Display label from API (`park_type_label`) */
export type MapParkType = string;

export interface MapBarrierInfo {
  id: string;
  status: "OPEN" | "CLOSED" | "INACTIVE";
  taggedPerHour: number;
}

export interface TrafficMapLocation {
  id: string;
  name: string;
  parkId: string;
  parkType: MapParkType;
  parkTypeCode?: string;
  facilityKind: MapFacilityKind;
  kindLabel?: string;
  address?: string;
  mapX: number;
  mapY: number;
  hourlyTatMinutes: number | null;
  hourlyTatLabel?: string | null;
  online: boolean;
  capacity?: number;
  trucksOnSite?: number;
  hasCoordinates?: boolean;
  entryBarrier: MapBarrierInfo;
  exitBarrier: MapBarrierInfo;
}

export interface TrafficLocationsParams {
  kind?: LocationKind | "ALL";
  /** API `park_type` enum e.g. BONDED_TERMINAL */
  park_type?: string | "ALL";
  /** @deprecated use `kind` — kept for callers migrating */
  facility_kind?: LocationKind | "ALL";
}

export interface TrafficLocationsSummary {
  totalLocations: number;
  visibleCount: number;
  onlineCount: number;
  offlineCount: number;
  facilitiesCount: number;
  facilityPregatesCount: number;
  pregatesCount: number;
  eptCount: number;
  terminalsCount: number;
  transitParksCount: number;
  avgHourlyTatMinutes: number | null;
  lastUpdated?: string;
}

export interface TrafficLocationsResponse {
  locations: TrafficMapLocation[];
  summary: TrafficLocationsSummary;
}

export interface OccCapacityRow {
  name: string;
  capacity: number;
  occupied: number;
}

export interface OccTatByCategory {
  category: string;
  minutes: number;
  label?: string;
  trucks?: number;
}

export interface OccTrucksStageCount {
  stage: string;
  label: string;
  count: number;
}

export interface OccTrucksSummary {
  totalBookings: number;
  onTrip: number;
  leftFacility: number;
  leftPregate: number;
  inTerminal: number;
  byStage: OccTrucksStageCount[];
  lastUpdated?: string;
}

export interface OccEmergenciesSummary {
  total: number;
  active: number;
  byType: Record<EmergencyType, number>;
}

export interface OccTerminalRow {
  id: string;
  name: string;
  code: string;
  approvedDailyTruckCapacity: number;
  trucksArrived: number;
  trucksInTerminal: number;
  atatMinutes: number | null;
  atatLabel: string | null;
}

export interface OccOverviewPeriod {
  from: string;
  to: string;
}

export interface OccNamedValue {
  name: string;
  value: number;
}

export interface OccTerminalHourlyTat {
  hour: string;
  apapa: number;
  tincan: number;
  lekki: number;
}

export interface OccTerminalEvacuation {
  terminal: string;
  evacuated: number;
  delivered: number;
}

export interface OccTerminalDowntime {
  terminal: string;
  minutes: number;
  reason: string;
}

export type EmergencyType = "TOW_TRUCK" | "BREAKDOWN" | "ACCIDENT";

export interface EmergencyTruckRequest {
  id: string;
  driverName: string;
  driverId: string;
  plateNumber: string;
  emergencyType: EmergencyType;
  timestamp: string;
  currentLocation: string;
  active: boolean;
}

export interface CancelledBookingRecord {
  id: string;
  bookingId: string;
  plateNumber: string;
  driverName: string;
  category: string;
  reason: string;
  cancelledAt: string;
}

export interface OccAiCommandAction {
  title: string;
  description: string;
  accent: string;
}

export interface OccDashboardResponse {
  period?: OccOverviewPeriod;
  lastUpdated?: string;
  trucksSummary?: OccTrucksSummary;
  emergenciesSummary?: OccEmergenciesSummary;
  cancelledBookingsTotal: number;
  terminals: OccTerminalRow[];
  aiCommandActions: OccAiCommandAction[];
  facilityCapacity: OccCapacityRow[];
  facilityTatByCategory: OccTatByCategory[];
  truckDestinations: OccNamedValue[];
  transitParkCapacity: OccCapacityRow[];
  terminalHourlyTat: OccTerminalHourlyTat[];
  terminalHourlyArrivals: OccTerminalHourlyTat[];
  terminalEvacuation: OccTerminalEvacuation[];
  terminalDowntime: OccTerminalDowntime[];
  emergencyRequests: EmergencyTruckRequest[];
  cancelledBookings: CancelledBookingRecord[];
}

/** Presets sent as `date_preset`; custom range uses only `date_from` + `date_to`. */
export type OccDatePreset = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";

export interface OccDashboardParams {
  date_preset?: OccDatePreset;
  date_from?: string;
  date_to?: string;
}

export interface OccEmergenciesParams {
  date_preset?: OccDatePreset;
  date_from?: string;
  date_to?: string;
  emergency_type?: EmergencyType | "ALL";
  page?: number;
  limit?: number;
}

export interface OccEmergenciesResponse {
  summary?: OccEmergenciesSummary;
  data: EmergencyTruckRequest[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export interface OccCancelledBookingsParams {
  date_preset?: OccDatePreset;
  date_from?: string;
  date_to?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface OccCancelledBookingsResponse {
  data: CancelledBookingRecord[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

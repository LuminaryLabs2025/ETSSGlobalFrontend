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

export const TRAFFIC_STATUS_CARDS: TrafficStatusCardConfig[] = [
  {
    key: "ON_TRIP",
    label: "Total Trucks (On-Trip)",
    shortLabel: "On-Trip",
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
    baseCount: 54,
  },
  {
    key: "LEFT_FACILITY",
    label: "Total Trucks (Left-Facility)",
    shortLabel: "Left-Facility",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    baseCount: 73,
  },
  {
    key: "LEFT_PREGATE",
    label: "Total Trucks (Left-Pregate)",
    shortLabel: "Left-Pregate",
    color: "text-orange-700",
    bg: "bg-orange-50",
    border: "border-orange-200",
    baseCount: 31,
  },
  {
    key: "IN_TERMINAL",
    label: "Total Trucks (In-Terminal)",
    shortLabel: "In-Terminal",
    color: "text-gray-700",
    bg: "bg-gray-100",
    border: "border-gray-300",
    baseCount: 96,
  },
];

export type TruckMovementRoute =
  | "FACILITY_TO_TRANSIT_PARK"
  | "TRANSIT_PARK_TO_TERMINAL"
  | "IN_FACILITY"
  | "IN_TRANSIT"
  | "IN_TERMINAL";

export interface LiveTruckMovement {
  id: string;
  plateNumber: string;
  driverName: string;
  currentLocation: string;
  destination: string;
  status: string;
  routeLabel: string;
  routeGroup: TruckMovementRoute;
}

export const LIVE_TRUCK_MOVEMENTS: LiveTruckMovement[] = [
  {
    id: "lt-1",
    plateNumber: "LAG-441-KJA",
    driverName: "Emeka Okafor",
    currentLocation: "Mile 2 Corridor",
    destination: "Tincan Island Terminal",
    status: "On-Trip",
    routeLabel: "Transit Park → Port Terminal",
    routeGroup: "TRANSIT_PARK_TO_TERMINAL",
  },
  {
    id: "lt-2",
    plateNumber: "LAG-882-APP",
    driverName: "Amina Suleiman",
    currentLocation: "Apapa-Oshodi Expressway",
    destination: "APM Terminals Apapa",
    status: "On-Trip",
    routeLabel: "Transit Park → Port Terminal",
    routeGroup: "TRANSIT_PARK_TO_TERMINAL",
  },
  {
    id: "lt-3",
    plateNumber: "KAN-204-BND",
    driverName: "Ibrahim Musa",
    currentLocation: "Bonded Terminal Gate A",
    destination: "Orile Transit Park",
    status: "On-Trip",
    routeLabel: "Facility → Transit Park",
    routeGroup: "FACILITY_TO_TRANSIT_PARK",
  },
  {
    id: "lt-4",
    plateNumber: "ABJ-551-XYZ",
    driverName: "Chinedu Eze",
    currentLocation: "Kirikiri Bonded Facility",
    destination: "—",
    status: "In-Facility",
    routeLabel: "At Facility",
    routeGroup: "IN_FACILITY",
  },
  {
    id: "lt-5",
    plateNumber: "LAG-119-FRT",
    driverName: "Fatima Bello",
    currentLocation: "Lekki-Epe Expressway",
    destination: "Lekki Deep Sea Port",
    status: "In-Transit",
    routeLabel: "Transit Park → Port Terminal",
    routeGroup: "IN_TRANSIT",
  },
  {
    id: "lt-6",
    plateNumber: "RIV-330-TNK",
    driverName: "James Okon",
    currentLocation: "Tincan Island Terminal Gate 3",
    destination: "—",
    status: "In-Terminal",
    routeLabel: "At Terminal",
    routeGroup: "IN_TERMINAL",
  },
  {
    id: "lt-7",
    plateNumber: "LAG-667-TRK",
    driverName: "Yusuf Ahmed",
    currentLocation: "Mile 2 Pregate",
    destination: "Grimaldi Apapa",
    status: "On-Trip",
    routeLabel: "Facility → Transit Park",
    routeGroup: "FACILITY_TO_TRANSIT_PARK",
  },
  {
    id: "lt-8",
    plateNumber: "EDO-902-LGS",
    driverName: "Grace Nwankwo",
    currentLocation: "Tincan Truck Park",
    destination: "Tincan Island Terminal",
    status: "In-Transit",
    routeLabel: "Transit Park → Port Terminal",
    routeGroup: "IN_TRANSIT",
  },
];

export type MapFacilityKind = "FACILITY" | "FACILITY_PREGATE" | "TRANSIT_PARK";

export type MapParkType =
  | "Bonded Terminal"
  | "Truck Park"
  | "EPT"
  | "Pregate-Empty"
  | "Pregate-Mixed";

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
  facilityKind: MapFacilityKind;
  mapX: number;
  mapY: number;
  hourlyTatMinutes: number;
  online: boolean;
  entryBarrier: MapBarrierInfo;
  exitBarrier: MapBarrierInfo;
}

export const TRAFFIC_MAP_LOCATIONS: TrafficMapLocation[] = [
  {
    id: "loc-1",
    name: "Apapa Bonded Terminal Complex",
    parkId: "FAC-AP-001",
    parkType: "Bonded Terminal",
    facilityKind: "FACILITY",
    mapX: 28,
    mapY: 62,
    hourlyTatMinutes: 47,
    online: true,
    entryBarrier: { id: "BR-IN-101", status: "OPEN", taggedPerHour: 12 },
    exitBarrier: { id: "BR-OUT-101", status: "OPEN", taggedPerHour: 11 },
  },
  {
    id: "loc-2",
    name: "Kirikiri Facility Pregate",
    parkId: "FPG-KR-014",
    parkType: "Pregate-Mixed",
    facilityKind: "FACILITY_PREGATE",
    mapX: 42,
    mapY: 55,
    hourlyTatMinutes: 38,
    online: true,
    entryBarrier: { id: "BR-IN-204", status: "OPEN", taggedPerHour: 18 },
    exitBarrier: { id: "BR-OUT-204", status: "CLOSED", taggedPerHour: 6 },
  },
  {
    id: "loc-3",
    name: "Mile 2 Transit Park",
    parkId: "TP-M2-008",
    parkType: "Truck Park",
    facilityKind: "TRANSIT_PARK",
    mapX: 55,
    mapY: 48,
    hourlyTatMinutes: 52,
    online: true,
    entryBarrier: { id: "BR-IN-308", status: "OPEN", taggedPerHour: 22 },
    exitBarrier: { id: "BR-OUT-308", status: "OPEN", taggedPerHour: 20 },
  },
  {
    id: "loc-4",
    name: "Orile EPT Processing Yard",
    parkId: "EPT-OR-003",
    parkType: "EPT",
    facilityKind: "FACILITY",
    mapX: 35,
    mapY: 70,
    hourlyTatMinutes: 61,
    online: true,
    entryBarrier: { id: "BR-IN-412", status: "OPEN", taggedPerHour: 9 },
    exitBarrier: { id: "BR-OUT-412", status: "OPEN", taggedPerHour: 8 },
  },
  {
    id: "loc-5",
    name: "Tincan Pregate (Empty)",
    parkId: "FPG-TC-022",
    parkType: "Pregate-Empty",
    facilityKind: "FACILITY_PREGATE",
    mapX: 68,
    mapY: 35,
    hourlyTatMinutes: 44,
    online: false,
    entryBarrier: { id: "BR-IN-519", status: "INACTIVE", taggedPerHour: 0 },
    exitBarrier: { id: "BR-OUT-519", status: "INACTIVE", taggedPerHour: 0 },
  },
  {
    id: "loc-6",
    name: "Tincan Island Truck Park",
    parkId: "TP-TI-011",
    parkType: "Truck Park",
    facilityKind: "TRANSIT_PARK",
    mapX: 72,
    mapY: 42,
    hourlyTatMinutes: 49,
    online: true,
    entryBarrier: { id: "BR-IN-601", status: "OPEN", taggedPerHour: 15 },
    exitBarrier: { id: "BR-OUT-601", status: "OPEN", taggedPerHour: 14 },
  },
  {
    id: "loc-7",
    name: "Lekki Fish Van Park",
    parkId: "FAC-LK-007",
    parkType: "Truck Park",
    facilityKind: "FACILITY",
    mapX: 82,
    mapY: 28,
    hourlyTatMinutes: 33,
    online: true,
    entryBarrier: { id: "BR-IN-702", status: "CLOSED", taggedPerHour: 3 },
    exitBarrier: { id: "BR-OUT-702", status: "OPEN", taggedPerHour: 5 },
  },
];

export const OCC_FACILITY_CAPACITY = [
  { name: "Apapa Bonded", capacity: 120, occupied: 93 },
  { name: "Kirikiri Yard", capacity: 80, occupied: 61 },
  { name: "Orile EPT", capacity: 60, occupied: 48 },
  { name: "Lekki Fish Park", capacity: 45, occupied: 22 },
];

export const OCC_FACILITY_TAT_BY_CATEGORY = [
  { category: "Import Container", minutes: 52 },
  { category: "Import Non-Cont.", minutes: 48 },
  { category: "Export Container", minutes: 55 },
  { category: "Export Non-Cont.", minutes: 50 },
  { category: "Empty Container", minutes: 41 },
  { category: "FMCG", minutes: 38 },
];

export const OCC_TRUCK_DESTINATIONS = [
  { name: "Apapa Port", value: 42 },
  { name: "Tincan Island", value: 38 },
  { name: "Lekki Deep Sea", value: 14 },
  { name: "Other", value: 6 },
];

export const OCC_TRANSIT_PARK_CAPACITY = [
  { name: "Mile 2", capacity: 200, occupied: 164 },
  { name: "Tincan Park", capacity: 150, occupied: 118 },
  { name: "Oshodi Holding", capacity: 90, occupied: 52 },
];

export const OCC_TERMINAL_HOURLY_TAT = [
  { hour: "08:00", apapa: 58, tincan: 62, lekki: 48 },
  { hour: "09:00", apapa: 54, tincan: 59, lekki: 45 },
  { hour: "10:00", apapa: 51, tincan: 55, lekki: 42 },
  { hour: "11:00", apapa: 49, tincan: 52, lekki: 40 },
  { hour: "12:00", apapa: 53, tincan: 57, lekki: 44 },
];

export const OCC_TERMINAL_EVACUATION = [
  { terminal: "APM Apapa", evacuated: 28, delivered: 24 },
  { terminal: "Tincan Island", evacuated: 22, delivered: 19 },
  { terminal: "Lekki Port", evacuated: 11, delivered: 10 },
];

export const OCC_TERMINAL_DOWNTIME = [
  { terminal: "APM Apapa", minutes: 12, reason: "Congestion" },
  { terminal: "Tincan Island", minutes: 28, reason: "System outage" },
  { terminal: "Lekki Port", minutes: 5, reason: "Gate maintenance" },
];

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

export const OCC_EMERGENCY_REQUESTS: EmergencyTruckRequest[] = [
  {
    id: "em-1",
    driverName: "Amina Suleiman",
    driverId: "DRV-009012",
    plateNumber: "LAG-442-BND",
    emergencyType: "BREAKDOWN",
    timestamp: new Date(Date.now() - 25 * 60_000).toISOString(),
    currentLocation: "Mile 2 Corridor (Left-Pregate)",
    active: true,
  },
  {
    id: "em-2",
    driverName: "James Okon",
    driverId: "DRV-004881",
    plateNumber: "RIV-330-TNK",
    emergencyType: "TOW_TRUCK",
    timestamp: new Date(Date.now() - 55 * 60_000).toISOString(),
    currentLocation: "Apapa-Oshodi Expressway",
    active: true,
  },
  {
    id: "em-3",
    driverName: "Fatima Bello",
    driverId: "DRV-011204",
    plateNumber: "LAG-119-FRT",
    emergencyType: "ACCIDENT",
    timestamp: new Date(Date.now() - 3 * 60 * 60_000).toISOString(),
    currentLocation: "Lekki-Epe Expressway",
    active: false,
  },
];

export interface CancelledBookingRecord {
  id: string;
  bookingId: string;
  plateNumber: string;
  driverName: string;
  category: string;
  reason: string;
  cancelledAt: string;
}

export const OCC_CANCELLED_BOOKINGS: CancelledBookingRecord[] = [
  {
    id: "cb-1",
    bookingId: "BKG-2026-010441",
    plateNumber: "LAG-551-TRK",
    driverName: "Emeka Okafor",
    category: "Import Container",
    reason: "Transporter requested cancellation — truck unavailable",
    cancelledAt: "2026-10-05T14:22:00.000Z",
  },
  {
    id: "cb-2",
    bookingId: "BKG-2026-010398",
    plateNumber: "ABJ-902-KAN",
    driverName: "Ibrahim Musa",
    category: "Empty Container",
    reason: "Payment timeout",
    cancelledAt: "2026-10-04T09:15:00.000Z",
  },
  {
    id: "cb-3",
    bookingId: "BKG-2026-010355",
    plateNumber: "KAN-204-BND",
    driverName: "Grace Nwankwo",
    category: "Export Container",
    reason: "Gate pass mismatch",
    cancelledAt: "2026-09-28T16:40:00.000Z",
  },
  {
    id: "cb-4",
    bookingId: "BKG-2026-010301",
    plateNumber: "EDO-667-LGS",
    driverName: "Yusuf Ahmed",
    category: "FMCG",
    reason: "Ops override — facility at capacity",
    cancelledAt: "2026-09-15T11:05:00.000Z",
  },
];

export const OCC_AI_COMMAND_ACTIONS = [
  {
    title: "Suspend dispatch into Red Zone",
    description: "Halt new releases toward the congested corridor",
    accent: "border-red-200 bg-red-50/40",
  },
  {
    title: "Reroute corridor traffic",
    description: "Divert onto the alternate managed corridor",
    accent: "border-gray-200 bg-white",
  },
  {
    title: "Activate overflow holding",
    description: "Open overflow bays to stage waiting trucks",
    accent: "border-gray-200 bg-white",
  },
  {
    title: "Broadcast diversion advisory",
    description: "Push advisory to drivers & transporters",
    accent: "border-gray-200 bg-white",
  },
  {
    title: "Priority movement",
    description: "Grant priority passage to a flagged convoy",
    accent: "border-emerald-200 bg-emerald-50/40",
  },
];

export function jitterCount(base: number, spread = 4): number {
  const delta = Math.floor(Math.random() * (spread * 2 + 1)) - spread;
  return Math.max(0, base + delta);
}

export function formatEmergencyType(type: EmergencyType): string {
  const map: Record<EmergencyType, string> = {
    TOW_TRUCK: "Tow Truck",
    BREAKDOWN: "Breakdown",
    ACCIDENT: "Accident",
  };
  return map[type];
}

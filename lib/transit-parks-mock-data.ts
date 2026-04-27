import type {
  TransitFacility,
  TransitFacilitySummary,
  FacilityChartDataPoint,
} from "@/types/transit-parks.types";

// ─── Pregates ───
export const MOCK_PREGATES: TransitFacility[] = [
  {
    id: "pg-001",
    name: "Apapa Pregate A",
    facility_type: "PREGATE",
    code: "TPK-APG-001",
    address: "Creek Road, Apapa, Lagos",
    hourly_truck_handling_capacity: 45,
    approved_bays: 50,
    operational_status: "ACTIVE",
    created_at: "2024-01-10T08:00:00Z",
    updated_at: "2026-04-01T09:30:00Z",
  },
  {
    id: "pg-002",
    name: "Apapa Pregate B",
    facility_type: "PREGATE",
    code: "TPK-APG-002",
    address: "Warehouse Road, Apapa, Lagos",
    hourly_truck_handling_capacity: 35,
    approved_bays: 40,
    operational_status: "ACTIVE",
    created_at: "2024-01-18T09:00:00Z",
    updated_at: "2026-03-28T14:00:00Z",
  },
  {
    id: "pg-003",
    name: "Tincan Pregate A",
    facility_type: "PREGATE",
    code: "TPK-TPG-001",
    address: "Tincan Island Port Approach, Lagos",
    hourly_truck_handling_capacity: 55,
    approved_bays: 60,
    operational_status: "ACTIVE",
    created_at: "2024-02-05T08:30:00Z",
    updated_at: "2026-04-12T10:00:00Z",
  },
  {
    id: "pg-004",
    name: "Tincan Pregate B",
    facility_type: "PREGATE",
    code: "TPK-TPG-002",
    address: "Tincan Island, Apapa, Lagos",
    hourly_truck_handling_capacity: 40,
    approved_bays: 45,
    operational_status: "ACTIVE",
    created_at: "2024-02-20T10:00:00Z",
    updated_at: "2026-04-05T11:30:00Z",
  },
  {
    id: "pg-005",
    name: "Mile 2 Pregate",
    facility_type: "PREGATE",
    code: "TPK-MLG-001",
    address: "Mile 2 Interchange, Amuwo-Odofin, Lagos",
    hourly_truck_handling_capacity: 30,
    approved_bays: 35,
    operational_status: "ACTIVE",
    created_at: "2024-03-10T09:00:00Z",
    updated_at: "2026-03-15T16:45:00Z",
  },
  {
    id: "pg-006",
    name: "Kirikiri Pregate",
    facility_type: "PREGATE",
    code: "TPK-KKG-001",
    address: "Kirikiri Road, Amuwo-Odofin, Lagos",
    hourly_truck_handling_capacity: 25,
    approved_bays: 30,
    operational_status: "INACTIVE",
    created_at: "2024-04-01T08:00:00Z",
    updated_at: "2026-01-20T12:00:00Z",
  },
  {
    id: "pg-007",
    name: "Maza Maza Pregate",
    facility_type: "PREGATE",
    code: "TPK-MMG-001",
    address: "Maza Maza, Ajeromi-Ifelodun, Lagos",
    hourly_truck_handling_capacity: 20,
    approved_bays: 25,
    operational_status: "ACTIVE",
    created_at: "2024-05-01T09:00:00Z",
    updated_at: "2026-04-20T13:15:00Z",
  },
  {
    id: "pg-008",
    name: "Orile Pregate",
    facility_type: "PREGATE",
    code: "TPK-OPG-001",
    address: "Orile-Iganmu Industrial Area, Lagos",
    hourly_truck_handling_capacity: 18,
    approved_bays: 20,
    operational_status: "ARCHIVED",
    created_at: "2024-06-15T08:00:00Z",
    updated_at: "2025-10-01T10:00:00Z",
  },
];

// ─── EPTs ───
export const MOCK_EPTS: TransitFacility[] = [
  {
    id: "ept-001",
    name: "Apapa EPT 1",
    facility_type: "EPT",
    code: "TPK-APE-001",
    address: "Marine Road, Apapa, Lagos",
    hourly_truck_handling_capacity: 60,
    approved_bays: 80,
    operational_status: "ACTIVE",
    created_at: "2024-01-12T08:00:00Z",
    updated_at: "2026-04-10T09:00:00Z",
  },
  {
    id: "ept-002",
    name: "Apapa EPT 2",
    facility_type: "EPT",
    code: "TPK-APE-002",
    address: "Kirikiri Industrial Estate, Apapa, Lagos",
    hourly_truck_handling_capacity: 48,
    approved_bays: 60,
    operational_status: "ACTIVE",
    created_at: "2024-01-25T09:00:00Z",
    updated_at: "2026-04-18T11:00:00Z",
  },
  {
    id: "ept-003",
    name: "Tincan EPT 1",
    facility_type: "EPT",
    code: "TPK-TPE-001",
    address: "Tincan Island Port Complex, Lagos",
    hourly_truck_handling_capacity: 55,
    approved_bays: 70,
    operational_status: "ACTIVE",
    created_at: "2024-02-10T10:00:00Z",
    updated_at: "2026-04-14T15:00:00Z",
  },
  {
    id: "ept-004",
    name: "Tincan EPT 2",
    facility_type: "EPT",
    code: "TPK-TPE-002",
    address: "Tincan Island, Apapa, Lagos",
    hourly_truck_handling_capacity: 38,
    approved_bays: 50,
    operational_status: "INACTIVE",
    created_at: "2024-03-05T08:30:00Z",
    updated_at: "2026-02-01T10:00:00Z",
  },
  {
    id: "ept-005",
    name: "Mile 2 EPT",
    facility_type: "EPT",
    code: "TPK-MLE-001",
    address: "Mile 2, Amuwo-Odofin, Lagos",
    hourly_truck_handling_capacity: 35,
    approved_bays: 45,
    operational_status: "ACTIVE",
    created_at: "2024-03-20T09:00:00Z",
    updated_at: "2026-03-25T14:30:00Z",
  },
  {
    id: "ept-006",
    name: "Kirikiri EPT",
    facility_type: "EPT",
    code: "TPK-KKE-001",
    address: "Kirikiri Road, Amuwo-Odofin, Lagos",
    hourly_truck_handling_capacity: 42,
    approved_bays: 55,
    operational_status: "ACTIVE",
    created_at: "2024-04-10T09:00:00Z",
    updated_at: "2026-04-22T16:00:00Z",
  },
  {
    id: "ept-007",
    name: "Orile EPT",
    facility_type: "EPT",
    code: "TPK-OEP-001",
    address: "Orile-Iganmu Industrial Area, Lagos",
    hourly_truck_handling_capacity: 28,
    approved_bays: 35,
    operational_status: "ACTIVE",
    created_at: "2024-05-15T09:00:00Z",
    updated_at: "2026-04-25T10:30:00Z",
  },
];

// ─── Derived Summaries ───
function buildSummary(list: TransitFacility[]): TransitFacilitySummary {
  const active = list.filter((f) => f.operational_status === "ACTIVE").length;
  const inactive = list.filter((f) => f.operational_status === "INACTIVE").length;
  const total = list.length;
  const avgHourly =
    total > 0
      ? Math.round(list.reduce((s, f) => s + f.hourly_truck_handling_capacity, 0) / total)
      : 0;
  const totalBays = list.reduce((s, f) => s + f.approved_bays, 0);
  return { total, enabled: active, disabled: inactive, avg_hourly_handling_capacity: avgHourly, total_bay_capacity: totalBays };
}

export const pregatesSummary: TransitFacilitySummary = buildSummary(MOCK_PREGATES);
export const eptsSummary: TransitFacilitySummary = buildSummary(MOCK_EPTS);

// ─── Pregates Chart Data (Bay Capacity vs Live Bookings) ───
export const pregatesChartData: FacilityChartDataPoint[] = [
  { name: "Apapa PG-A",  approved_capacity: 50, live_booking_count: 43 },
  { name: "Apapa PG-B",  approved_capacity: 40, live_booking_count: 35 },
  { name: "Tincan PG-A", approved_capacity: 60, live_booking_count: 52 },
  { name: "Tincan PG-B", approved_capacity: 45, live_booking_count: 39 },
  { name: "Mile 2 PG",   approved_capacity: 35, live_booking_count: 28 },
  { name: "Kirikiri PG", approved_capacity: 30, live_booking_count: 0  },
  { name: "Maza Maza",   approved_capacity: 25, live_booking_count: 20 },
  { name: "Orile PG",    approved_capacity: 20, live_booking_count: 0  },
];

// ─── EPTs Chart Data (Truck Handling Capacity vs Live Bookings) ───
export const eptsChartData: FacilityChartDataPoint[] = [
  { name: "Apapa EPT-1",  approved_capacity: 60, live_booking_count: 55 },
  { name: "Apapa EPT-2",  approved_capacity: 48, live_booking_count: 44 },
  { name: "Tincan EPT-1", approved_capacity: 55, live_booking_count: 50 },
  { name: "Tincan EPT-2", approved_capacity: 38, live_booking_count: 0  },
  { name: "Mile 2 EPT",   approved_capacity: 35, live_booking_count: 30 },
  { name: "Kirikiri EPT", approved_capacity: 42, live_booking_count: 38 },
  { name: "Orile EPT",    approved_capacity: 28, live_booking_count: 24 },
];

import type { FacilityChartDataPoint } from "@/types/transit-parks.types";

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

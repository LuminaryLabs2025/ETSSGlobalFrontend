import type { TerminalCapacityDataPoint } from "@/types/terminals.types";

// ─── Port Terminals Chart Data (Apapa then Tincan axis) ───
export const portTerminalChartData: TerminalCapacityDataPoint[] = [
  { terminal: "APM Apapa",   approved_daily_capacity: 800, dttr: 672, live_booking_count: 745 },
  { terminal: "PTML Apapa",  approved_daily_capacity: 600, dttr: 498, live_booking_count: 560 },
  { terminal: "Grimaldi",    approved_daily_capacity: 450, dttr: 391, live_booking_count: 418 },
  { terminal: "ENL",         approved_daily_capacity: 350, dttr: 304, live_booking_count: 325 },
  { terminal: "Five Star",   approved_daily_capacity: 280, dttr: 241, live_booking_count: 260 },
  { terminal: "LPC",         approved_daily_capacity: 320, dttr: 278, live_booking_count: 295 },
  { terminal: "Tincan Port", approved_daily_capacity: 700, dttr: 588, live_booking_count: 650 },
  { terminal: "Greenview",   approved_daily_capacity: 400, dttr: 345, live_booking_count: 370 },
  { terminal: "P&C Ltd",     approved_daily_capacity: 380, dttr: 320, live_booking_count: 350 },
];

// ─── Non-Port Terminals Chart Data ───
export const nonPortTerminalChartData: TerminalCapacityDataPoint[] = [
  { terminal: "Apapa NPT-A",  approved_daily_capacity: 500, dttr: 420, live_booking_count: 460 },
  { terminal: "Apapa NPT-B",  approved_daily_capacity: 350, dttr: 290, live_booking_count: 310 },
  { terminal: "Mile 2",       approved_daily_capacity: 250, dttr: 0,   live_booking_count: 0 },
  { terminal: "Tincan NPT-A", approved_daily_capacity: 420, dttr: 360, live_booking_count: 390 },
  { terminal: "Tincan NPT-B", approved_daily_capacity: 280, dttr: 0,   live_booking_count: 0 },
];

import type {
  DTTRTerminalRequest,
  DTTRSubmissionRecord,
  DTTREditAuditEntry,
  DTTRSummary,
} from "@/types/dttr.types";
import { sumBreakdown } from "@/types/dttr.types";

export const MOCK_DTTR_TERMINALS: DTTRTerminalRequest[] = [
  {
    id: "dttr-001",
    terminal_name: "Apapa Port Terminal A",
    terminal_code: "APT-A",
    approved_daily_capacity: 120,
    requested: { exports: 35, imports: 42, empties: 18, gatepass: 12 },
    last_updated_at: "2026-07-11T06:30:00.000Z",
    request_mode: "MANUAL",
  },
  {
    id: "dttr-002",
    terminal_name: "Tincan Island Terminal",
    terminal_code: "TIC-01",
    approved_daily_capacity: 95,
    requested: { exports: 22, imports: 30, empties: 15, gatepass: 8 },
    last_updated_at: "2026-07-11T05:15:00.000Z",
    request_mode: "AUTOMATED",
    automated_template: { exports: 22, imports: 30, empties: 15, gatepass: 8 },
  },
  {
    id: "dttr-003",
    terminal_name: "Lekki Deep Sea Terminal",
    terminal_code: "LDS-01",
    approved_daily_capacity: 80,
    requested: { exports: 18, imports: 25, empties: 10, gatepass: 5 },
    last_updated_at: "2026-07-10T18:45:00.000Z",
    request_mode: "MANUAL",
  },
  {
    id: "dttr-004",
    terminal_name: "Onne Port Terminal",
    terminal_code: "ONN-02",
    approved_daily_capacity: 110,
    requested: { exports: 28, imports: 38, empties: 20, gatepass: 14 },
    last_updated_at: "2026-07-11T07:00:00.000Z",
    request_mode: "AUTOMATED",
    automated_template: { exports: 28, imports: 38, empties: 20, gatepass: 14 },
  },
  {
    id: "dttr-005",
    terminal_name: "Calabar Non-Port Terminal",
    terminal_code: "CBR-NPT",
    approved_daily_capacity: 60,
    requested: { exports: 10, imports: 15, empties: 8, gatepass: 4 },
    last_updated_at: "2026-07-11T04:20:00.000Z",
    request_mode: "MANUAL",
  },
  {
    id: "dttr-006",
    terminal_name: "Warri Bonded Terminal",
    terminal_code: "WRI-BT",
    approved_daily_capacity: 75,
    requested: { exports: 0, imports: 0, empties: 0, gatepass: 0 },
    last_updated_at: "2026-07-09T12:00:00.000Z",
    request_mode: "MANUAL",
  },
];

export const MOCK_DTTR_SUBMISSIONS: DTTRSubmissionRecord[] = [
  {
    id: "sub-001",
    terminal_id: "dttr-001",
    terminal_name: "Apapa Port Terminal A",
    submitted_at: "2026-07-11T06:30:00.000Z",
    submitted_by: "Emeka Okafor",
    submitted_by_id: "usr-101",
    breakdown: { exports: 35, imports: 42, empties: 18, gatepass: 12 },
    total_requested: 107,
    approved_capacity: 120,
    request_mode: "MANUAL",
  },
  {
    id: "sub-002",
    terminal_id: "dttr-001",
    terminal_name: "Apapa Port Terminal A",
    submitted_at: "2026-07-10T06:45:00.000Z",
    submitted_by: "Emeka Okafor",
    submitted_by_id: "usr-101",
    breakdown: { exports: 32, imports: 40, empties: 16, gatepass: 10 },
    total_requested: 98,
    approved_capacity: 120,
    request_mode: "MANUAL",
  },
  {
    id: "sub-003",
    terminal_id: "dttr-002",
    terminal_name: "Tincan Island Terminal",
    submitted_at: "2026-07-11T05:15:00.000Z",
    submitted_by: "System (Automated)",
    submitted_by_id: "system",
    breakdown: { exports: 22, imports: 30, empties: 15, gatepass: 8 },
    total_requested: 75,
    approved_capacity: 95,
    request_mode: "AUTOMATED",
  },
  {
    id: "sub-004",
    terminal_id: "dttr-004",
    terminal_name: "Onne Port Terminal",
    submitted_at: "2026-07-11T07:00:00.000Z",
    submitted_by: "System (Automated)",
    submitted_by_id: "system",
    breakdown: { exports: 28, imports: 38, empties: 20, gatepass: 14 },
    total_requested: 100,
    approved_capacity: 110,
    request_mode: "AUTOMATED",
  },
];

export const MOCK_DTTR_EDIT_LOG: DTTREditAuditEntry[] = [
  {
    id: "edit-001",
    terminal_id: "dttr-001",
    terminal_name: "Apapa Port Terminal A",
    edited_fields: ["imports", "exports"],
    edited_at: "2026-07-10T14:22:00.000Z",
    performed_by: "Femi Okunlola",
    performed_by_id: "usr-sa-01",
    justification: "NPA directive to increase import allocation due to vessel backlog at berth 3.",
    approval_reference: "NPA/APT/2026/0710",
    approval_document_name: "NPA_Approval_APT_July10.pdf",
    previous_values: { exports: 30, imports: 35 },
    new_values: { exports: 35, imports: 42 },
  },
  {
    id: "edit-002",
    terminal_id: "dttr-003",
    terminal_name: "Lekki Deep Sea Terminal",
    edited_fields: ["approved_daily_capacity"],
    edited_at: "2026-07-09T09:00:00.000Z",
    performed_by: "Femi Okunlola",
    performed_by_id: "usr-sa-01",
    justification: "Capacity revision following infrastructure upgrade completion.",
    approval_reference: "NPA/LDS/CAP/2026/0709",
    previous_values: { approved_daily_capacity: 70 },
    new_values: { approved_daily_capacity: 80 },
  },
];

export function buildDTTRSummary(terminals: DTTRTerminalRequest[]): DTTRSummary {
  let total_requested_today = 0;
  let at_capacity = 0;
  let under_capacity = 0;
  let manual_terminals = 0;
  let automated_terminals = 0;

  for (const t of terminals) {
    const total = sumBreakdown(t.requested);
    total_requested_today += total;
    if (total >= t.approved_daily_capacity) at_capacity += 1;
    else under_capacity += 1;
    if (t.request_mode === "MANUAL") manual_terminals += 1;
    else automated_terminals += 1;
  }

  return {
    total_terminals: terminals.length,
    total_capacity: terminals.reduce((s, t) => s + t.approved_daily_capacity, 0),
    total_requested_today,
    manual_terminals,
    automated_terminals,
    at_capacity,
    under_capacity,
  };
}

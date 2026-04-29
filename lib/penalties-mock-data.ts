import type {
  PenaltyDefinition, IssuedFine, FineDispute,
  PenaltiesSummary, IssuedFinesSummary, DisputesSummary,
} from "@/types/penalties.types";

// ─── Penalty Definitions ───
export const MOCK_PENALTIES: PenaltyDefinition[] = [
  {
    id: "pdef-001", penalty_code: "PEN-001",
    name: "Overstay",
    description: "Truck remaining beyond its allocated time window within the terminal or facility, causing congestion and disruption to scheduling.",
    fine_amount: 50000, status: "ACTIVE",
    created_by: "SuperAdmin — Adewale Peters (SA-001)", created_at: "2024-01-10T08:00:00Z",
    updated_by: "SuperAdmin — Adewale Peters (SA-001)", updated_at: "2024-06-15T10:00:00Z",
  },
  {
    id: "pdef-002", penalty_code: "PEN-002",
    name: "Route Violation",
    description: "Truck deviating from the approved and designated dispatch route without prior authorization from the scheduling authority.",
    fine_amount: 30000, status: "ACTIVE",
    created_by: "SuperAdmin — Adewale Peters (SA-001)", created_at: "2024-01-10T08:00:00Z",
  },
  {
    id: "pdef-003", penalty_code: "PEN-003",
    name: "Unauthorized Parking",
    description: "Truck parked in a restricted, unauthorized, or non-designated area within the port complex or terminal environs.",
    fine_amount: 20000, status: "ACTIVE",
    created_by: "SuperAdmin — Adewale Peters (SA-001)", created_at: "2024-01-10T08:00:00Z",
  },
  {
    id: "pdef-004", penalty_code: "PEN-004",
    name: "Overweight",
    description: "Truck carrying cargo that exceeds the approved weight limit as specified in the truck's certification and port authority guidelines.",
    fine_amount: 75000, status: "ACTIVE",
    created_by: "SuperAdmin — Adewale Peters (SA-001)", created_at: "2024-01-10T08:00:00Z",
    updated_by: "SuperAdmin — Adewale Peters (SA-001)", updated_at: "2025-03-01T09:00:00Z",
  },
  {
    id: "pdef-005", penalty_code: "PEN-005",
    name: "Contraband Transport",
    description: "Truck found transporting unauthorized, prohibited, or undeclared goods contrary to NPA and customs regulations.",
    fine_amount: 200000, status: "ACTIVE",
    created_by: "SuperAdmin — Adewale Peters (SA-001)", created_at: "2024-01-10T08:00:00Z",
  },
  {
    id: "pdef-006", penalty_code: "PEN-006",
    name: "Late Arrival at Terminal",
    description: "Truck arriving at the terminal outside of the scheduled dispatch time window without prior notification or approved rescheduling.",
    fine_amount: 15000, status: "ACTIVE",
    created_by: "SuperAdmin — Adewale Peters (SA-001)", created_at: "2024-02-20T09:00:00Z",
  },
  {
    id: "pdef-007", penalty_code: "PEN-007",
    name: "No Valid TEP",
    description: "Truck operating within the port or terminal complex without a valid and current Truck Entry Permit (TEP) as required by NPA regulations.",
    fine_amount: 40000, status: "ACTIVE",
    created_by: "SuperAdmin — Adewale Peters (SA-001)", created_at: "2024-02-20T09:00:00Z",
    updated_by: "SuperAdmin — Adewale Peters (SA-001)", updated_at: "2025-01-10T11:00:00Z",
  },
  {
    id: "pdef-008", penalty_code: "PEN-008",
    name: "Unregistered Driver",
    description: "Truck being operated by a driver who is not registered, verified, or authorized on the ETSS-Nigeria platform.",
    fine_amount: 25000, status: "ACTIVE",
    created_by: "SuperAdmin — Adewale Peters (SA-001)", created_at: "2024-03-15T10:00:00Z",
  },
  {
    id: "pdef-009", penalty_code: "PEN-009",
    name: "Equipment Non-Compliance",
    description: "Truck operating with non-compliant, defective, or substandard equipment that does not meet port authority safety standards.",
    fine_amount: 35000, status: "INACTIVE",
    created_by: "SuperAdmin — Adewale Peters (SA-001)", created_at: "2024-03-15T10:00:00Z",
    updated_by: "SuperAdmin — Adewale Peters (SA-001)", updated_at: "2025-06-01T09:00:00Z",
  },
  {
    id: "pdef-010", penalty_code: "PEN-010",
    name: "Documentation Discrepancy",
    description: "Incorrect, missing, or falsified shipping documentation submitted at the terminal gate or during inspection.",
    fine_amount: 10000, status: "ACTIVE",
    created_by: "SuperAdmin — Adewale Peters (SA-001)", created_at: "2024-04-01T08:00:00Z",
  },
];

// ─── Common transporter info ───
const transporters = {
  abc:      { company_name: "ABC Logistics Ltd",          user_account: "Emeka Okafor",    contact_person: "Emeka Okafor",    contact_number: "+234 803 451 2290", email: "emeka@abclogistics.ng" },
  dangote:  { company_name: "Dangote Transport Services", user_account: "Sule Musa",       contact_person: "Sule Musa",       contact_number: "+234 812 334 5671", email: "sule@dangote.ng" },
  bua:      { company_name: "BUA Transport Services",     user_account: "Amina Suleiman",  contact_person: "Amina Suleiman",  contact_number: "+234 706 228 9911", email: "amina@buatransport.ng" },
  mikano:   { company_name: "Mikano Logistics",           user_account: "Chukwudi Nwosu",  contact_person: "Chukwudi Nwosu",  contact_number: "+234 905 667 3322", email: "chukwudi@mikano.ng" },
  spedag:   { company_name: "Spedag Intermodal Nigeria",  user_account: "Ngozi Eze",       contact_person: "Ngozi Eze",       contact_number: "+234 701 556 8832", email: "ngozi@spedag.ng" },
  coscharis:{ company_name: "Coscharis Transport",        user_account: "Folake Adeyemi",  contact_person: "Folake Adeyemi",  contact_number: "+234 817 789 4410", email: "folake@coscharis.ng" },
};

// ─── Issued Fines ───
export const MOCK_ISSUED_FINES: IssuedFine[] = [
  {
    id: "if-001", issued_fine_id: "PNL-2026-001001",
    penalty_code: "PEN-001", penalty_name: "Overstay",
    fine_amount: 50000,
    booking: { booking_reference: "BKG-2026-010001", terminal_destination: "APM Terminals Apapa", booking_date: "2026-04-10T06:00:00Z", category: "IMPORT", truck_booking_status: "FLAGGED" },
    truck_plate_number: "TRP-221-LG", driver_name: "Yakubu Hassan",
    transporter: transporters.abc,
    date_issued: "2026-04-10T14:30:00Z", issued_by: "Okonkwo Samuel (EO-001)", status: "DISPUTED",
  },
  {
    id: "if-002", issued_fine_id: "PNL-2026-001002",
    penalty_code: "PEN-002", penalty_name: "Route Violation",
    fine_amount: 30000,
    booking: { booking_reference: "BKG-2026-010002", terminal_destination: "Tin-Can Island Terminal", booking_date: "2026-04-15T07:00:00Z", category: "EXPORT", truck_booking_status: "FLAGGED" },
    truck_plate_number: "BDG-335-KJ", driver_name: "Sule Musa",
    transporter: transporters.dangote,
    date_issued: "2026-04-15T09:15:00Z", issued_by: "Adeyemi Fatima (EO-002)", status: "DISPUTED",
  },
  {
    id: "if-003", issued_fine_id: "PNL-2026-001003",
    penalty_code: "PEN-003", penalty_name: "Unauthorized Parking",
    fine_amount: 20000,
    booking: { booking_reference: "BKG-2026-010003", terminal_destination: "APM Terminals Apapa", booking_date: "2026-04-18T08:00:00Z", category: "EMPTY", truck_booking_status: "FLAGGED" },
    truck_plate_number: "APT-119-AB", driver_name: "Abdullahi Musa",
    transporter: transporters.bua,
    date_issued: "2026-04-18T16:00:00Z", issued_by: "Okonkwo Samuel (EO-001)", status: "ACCEPTED",
  },
  {
    id: "if-004", issued_fine_id: "PNL-2026-001004",
    penalty_code: "PEN-004", penalty_name: "Overweight",
    fine_amount: 75000,
    booking: { booking_reference: "BKG-2026-010004", terminal_destination: "Tin-Can Island Terminal", booking_date: "2026-04-20T06:30:00Z", category: "IMPORT", truck_booking_status: "FLAGGED" },
    truck_plate_number: "NKK-782-OG", driver_name: "Chukwudi Eze",
    transporter: transporters.mikano,
    date_issued: "2026-04-20T11:00:00Z", issued_by: "Ibrahim Musa (EO-003)", status: "DISPUTED",
  },
  {
    id: "if-005", issued_fine_id: "PNL-2026-001005",
    penalty_code: "PEN-001", penalty_name: "Overstay",
    fine_amount: 50000,
    booking: { booking_reference: "BKG-2026-010005", terminal_destination: "APM Terminals Apapa", booking_date: "2026-04-22T07:00:00Z", category: "EXPORT", truck_booking_status: "LEFT_TERMINAL" },
    truck_plate_number: "CAD-448-IM", driver_name: "Oluwaseun Adeyemi",
    transporter: transporters.coscharis,
    date_issued: "2026-04-22T13:45:00Z", issued_by: "Adeyemi Fatima (EO-002)", status: "ACCEPTED",
  },
  {
    id: "if-006", issued_fine_id: "PNL-2026-001006",
    penalty_code: "PEN-007", penalty_name: "No Valid TEP",
    fine_amount: 40000,
    booking: { booking_reference: "BKG-2026-010006", terminal_destination: "Tin-Can Island Terminal", booking_date: "2026-04-23T08:00:00Z", category: "IMPORT", truck_booking_status: "FLAGGED" },
    truck_plate_number: "AAA-423-WA", driver_name: "Emeka Okafor",
    transporter: transporters.abc,
    date_issued: "2026-04-23T10:30:00Z", issued_by: "Okonkwo Samuel (EO-001)", status: "ACCEPTED",
  },
  {
    id: "if-007", issued_fine_id: "PNL-2026-001007",
    penalty_code: "PEN-006", penalty_name: "Late Arrival at Terminal",
    fine_amount: 15000,
    booking: { booking_reference: "BKG-2026-010007", terminal_destination: "APM Terminals Apapa", booking_date: "2026-04-24T06:00:00Z", category: "EMPTY", truck_booking_status: "IN_TERMINAL" },
    truck_plate_number: "MN-144-OD", driver_name: "Sule Musa",
    transporter: transporters.dangote,
    date_issued: "2026-04-24T09:00:00Z", issued_by: "Ibrahim Musa (EO-003)", status: "ACCEPTED",
  },
  {
    id: "if-008", issued_fine_id: "PNL-2026-001008",
    penalty_code: "PEN-008", penalty_name: "Unregistered Driver",
    fine_amount: 25000,
    booking: { booking_reference: "BKG-2026-010008", terminal_destination: "Dangote Logistics Corridor", booking_date: "2026-04-25T07:30:00Z", category: "EXPORT", truck_booking_status: "FLAGGED" },
    truck_plate_number: "LND-501-KJ", driver_name: "Amina Bello",
    transporter: transporters.bua,
    date_issued: "2026-04-25T11:15:00Z", issued_by: "Adeyemi Fatima (EO-002)", status: "DISPUTED",
  },
  {
    id: "if-009", issued_fine_id: "PNL-2026-001009",
    penalty_code: "PEN-010", penalty_name: "Documentation Discrepancy",
    fine_amount: 10000,
    booking: { booking_reference: "BKG-2026-010009", terminal_destination: "Tin-Can Island Terminal", booking_date: "2026-04-25T08:00:00Z", category: "IMPORT", truck_booking_status: "LEFT_TERMINAL" },
    truck_plate_number: "ABJ-872-FG", driver_name: "Chukwudi Eze",
    transporter: transporters.mikano,
    date_issued: "2026-04-25T14:00:00Z", issued_by: "Okonkwo Samuel (EO-001)", status: "ACCEPTED",
  },
  {
    id: "if-010", issued_fine_id: "PNL-2026-001010",
    penalty_code: "PEN-002", penalty_name: "Route Violation",
    fine_amount: 30000,
    booking: { booking_reference: "BKG-2026-010010", terminal_destination: "APM Terminals Apapa", booking_date: "2026-04-26T06:30:00Z", category: "EXPORT", truck_booking_status: "FLAGGED" },
    truck_plate_number: "KAN-256-NA", driver_name: "Usman Bello",
    transporter: transporters.spedag,
    date_issued: "2026-04-26T10:00:00Z", issued_by: "Ibrahim Musa (EO-003)", status: "ACCEPTED",
  },
  {
    id: "if-011", issued_fine_id: "PNL-2026-001011",
    penalty_code: "PEN-004", penalty_name: "Overweight",
    fine_amount: 75000,
    booking: { booking_reference: "BKG-2026-010011", terminal_destination: "Tin-Can Island Terminal", booking_date: "2026-04-26T07:00:00Z", category: "IMPORT", truck_booking_status: "FLAGGED" },
    truck_plate_number: "RIV-944-PH", driver_name: "Ngozi Okonkwo",
    transporter: transporters.spedag,
    date_issued: "2026-04-26T12:30:00Z", issued_by: "Adeyemi Fatima (EO-002)", status: "DISPUTED",
  },
  {
    id: "if-012", issued_fine_id: "PNL-2026-001012",
    penalty_code: "PEN-003", penalty_name: "Unauthorized Parking",
    fine_amount: 20000,
    booking: { booking_reference: "BKG-2026-010012", terminal_destination: "APM Terminals Apapa", booking_date: "2026-04-27T07:30:00Z", category: "EMPTY", truck_booking_status: "IN_FACILITY" },
    truck_plate_number: "LAG-777-AA", driver_name: "Adewale Peters",
    transporter: transporters.abc,
    date_issued: "2026-04-27T09:45:00Z", issued_by: "Okonkwo Samuel (EO-001)", status: "ACCEPTED",
  },
];

// ─── Fine Disputes ───
export const MOCK_DISPUTES: FineDispute[] = [
  {
    id: "disp-001", dispute_id: "DSP-2026-001",
    issued_fine_id: "PNL-2026-001001",
    penalty_code: "PEN-001", penalty_name: "Overstay",
    fine_amount: 50000,
    booking: { booking_reference: "BKG-2026-010001", terminal_destination: "APM Terminals Apapa", booking_date: "2026-04-10T06:00:00Z", category: "IMPORT", truck_booking_status: "FLAGGED" },
    truck_plate_number: "TRP-221-LG", driver_name: "Yakubu Hassan",
    transporter: transporters.abc,
    date_issued: "2026-04-10T14:30:00Z",
    date_disputed: "2026-04-11T10:00:00Z",
    dispute_reason: "Truck was delayed at the weighbridge due to a malfunction outside our control. We have the weighbridge logs as evidence.",
    dispute_status: "UNDER_NPA_REVIEW",
    managed_by: "NPA — Uche Obi (NPA-022)",
    resolution_outcome: undefined,
    resolution_history: [
      { action: "Dispute Submitted", performed_by: "Emeka Okafor (ABC Logistics)", timestamp: "2026-04-11T10:00:00Z", notes: "Dispute submitted with weighbridge malfunction evidence" },
      { action: "Assigned to NPA Review", performed_by: "SuperAdmin — Adewale Peters (SA-001)", timestamp: "2026-04-12T09:00:00Z", notes: "Escalated to NPA for technical review" },
      { action: "NPA Review In Progress", performed_by: "NPA — Uche Obi (NPA-022)", timestamp: "2026-04-13T11:00:00Z", notes: "NPA reviewing weighbridge maintenance records" },
    ],
  },
  {
    id: "disp-002", dispute_id: "DSP-2026-002",
    issued_fine_id: "PNL-2026-001002",
    penalty_code: "PEN-002", penalty_name: "Route Violation",
    fine_amount: 30000,
    booking: { booking_reference: "BKG-2026-010002", terminal_destination: "Tin-Can Island Terminal", booking_date: "2026-04-15T07:00:00Z", category: "EXPORT", truck_booking_status: "FLAGGED" },
    truck_plate_number: "BDG-335-KJ", driver_name: "Sule Musa",
    transporter: transporters.dangote,
    date_issued: "2026-04-15T09:15:00Z",
    date_disputed: "2026-04-16T14:30:00Z",
    dispute_reason: "Driver followed GPS navigation which re-routed due to an accident on the approved route. The alternate route used is a standard NPA-approved secondary route.",
    dispute_status: "RESOLVED",
    managed_by: "NPA — Fatima Yusuf (NPA-045)",
    resolution_outcome: "FINE_WAIVED",
    resolution_date: "2026-04-20T10:00:00Z",
    resolution_history: [
      { action: "Dispute Submitted", performed_by: "Sule Musa (Dangote Transport)", timestamp: "2026-04-16T14:30:00Z", notes: "Dispute submitted with GPS route evidence and accident report" },
      { action: "Assigned to NPA Review", performed_by: "SuperAdmin", timestamp: "2026-04-17T09:00:00Z", notes: "Forwarded to NPA for review" },
      { action: "NPA Decision: Fine Waived", performed_by: "NPA — Fatima Yusuf (NPA-045)", timestamp: "2026-04-20T10:00:00Z", notes: "Alternate route confirmed as NPA-approved secondary route. Fine waived." },
    ],
  },
  {
    id: "disp-003", dispute_id: "DSP-2026-003",
    issued_fine_id: "PNL-2026-001004",
    penalty_code: "PEN-004", penalty_name: "Overweight",
    fine_amount: 75000,
    booking: { booking_reference: "BKG-2026-010004", terminal_destination: "Tin-Can Island Terminal", booking_date: "2026-04-20T06:30:00Z", category: "IMPORT", truck_booking_status: "FLAGGED" },
    truck_plate_number: "NKK-782-OG", driver_name: "Chukwudi Eze",
    transporter: transporters.mikano,
    date_issued: "2026-04-20T11:00:00Z",
    date_disputed: "2026-04-21T09:00:00Z",
    dispute_reason: "Our certified weighbridge reading was within approved limits. The enforcement officer's scale was not calibrated. We request a re-measurement.",
    dispute_status: "RESOLVED",
    managed_by: "NPA — Uche Obi (NPA-022)",
    resolution_outcome: "FINE_ADJUSTED",
    resolution_date: "2026-04-25T14:00:00Z",
    adjusted_amount: 25000,
    resolution_history: [
      { action: "Dispute Submitted", performed_by: "Chukwudi Nwosu (Mikano)", timestamp: "2026-04-21T09:00:00Z", notes: "Dispute with certified weighbridge documentation attached" },
      { action: "NPA Calibration Check Ordered", performed_by: "NPA — Uche Obi (NPA-022)", timestamp: "2026-04-22T10:00:00Z", notes: "NPA ordered calibration verification of enforcement scale" },
      { action: "Fine Adjusted", performed_by: "NPA — Uche Obi (NPA-022)", timestamp: "2026-04-25T14:00:00Z", notes: "Scale calibration discrepancy confirmed. Fine adjusted to ₦25,000 based on actual overweight variance." },
    ],
  },
  {
    id: "disp-004", dispute_id: "DSP-2026-004",
    issued_fine_id: "PNL-2026-001008",
    penalty_code: "PEN-008", penalty_name: "Unregistered Driver",
    fine_amount: 25000,
    booking: { booking_reference: "BKG-2026-010008", terminal_destination: "Dangote Logistics Corridor", booking_date: "2026-04-25T07:30:00Z", category: "EXPORT", truck_booking_status: "FLAGGED" },
    truck_plate_number: "LND-501-KJ", driver_name: "Amina Bello",
    transporter: transporters.bua,
    date_issued: "2026-04-25T11:15:00Z",
    date_disputed: "2026-04-25T16:00:00Z",
    dispute_reason: "Driver Amina Bello is registered on the ETSS platform. The enforcement officer's handheld device could not connect to the database at the time of inspection due to a network issue.",
    dispute_status: "PENDING_REVIEW",
    resolution_history: [
      { action: "Dispute Submitted", performed_by: "Amina Suleiman (BUA Transport)", timestamp: "2026-04-25T16:00:00Z", notes: "Dispute submitted with ETSS registration screenshots and network outage report" },
    ],
  },
  {
    id: "disp-005", dispute_id: "DSP-2026-005",
    issued_fine_id: "PNL-2026-001011",
    penalty_code: "PEN-004", penalty_name: "Overweight",
    fine_amount: 75000,
    booking: { booking_reference: "BKG-2026-010011", terminal_destination: "Tin-Can Island Terminal", booking_date: "2026-04-26T07:00:00Z", category: "IMPORT", truck_booking_status: "FLAGGED" },
    truck_plate_number: "RIV-944-PH", driver_name: "Ngozi Okonkwo",
    transporter: transporters.spedag,
    date_issued: "2026-04-26T12:30:00Z",
    date_disputed: "2026-04-26T17:00:00Z",
    dispute_reason: "Container weight declared on shipping manifest and verified at origin. Any overweight is a shipper declaration error, not transporter negligence.",
    dispute_status: "REJECTED",
    managed_by: "NPA — Fatima Yusuf (NPA-045)",
    resolution_outcome: "FINE_UPHELD",
    resolution_date: "2026-04-28T09:00:00Z",
    resolution_history: [
      { action: "Dispute Submitted", performed_by: "Ngozi Eze (Spedag)", timestamp: "2026-04-26T17:00:00Z", notes: "Dispute submitted citing shipper manifest" },
      { action: "NPA Review", performed_by: "NPA — Fatima Yusuf (NPA-045)", timestamp: "2026-04-27T10:00:00Z", notes: "NPA reviewed manifest and weighbridge records" },
      { action: "Dispute Rejected — Fine Upheld", performed_by: "NPA — Fatima Yusuf (NPA-045)", timestamp: "2026-04-28T09:00:00Z", notes: "Transporter is responsible for verifying cargo weight before accepting. Fine upheld in full." },
    ],
  },
  {
    id: "disp-006", dispute_id: "DSP-2026-006",
    issued_fine_id: "PNL-2026-001001",
    penalty_code: "PEN-001", penalty_name: "Overstay",
    fine_amount: 50000,
    booking: { booking_reference: "BKG-2026-009901", terminal_destination: "APM Terminals Apapa", booking_date: "2026-03-28T06:00:00Z", category: "IMPORT", truck_booking_status: "LEFT_TERMINAL" },
    truck_plate_number: "EKO-555-BK", driver_name: "Ibrahim Aliyu",
    transporter: transporters.dangote,
    date_issued: "2026-03-28T15:00:00Z",
    date_disputed: "2026-03-29T08:30:00Z",
    dispute_reason: "Truck was held at gate pending document verification by terminal staff. Delay was caused by the terminal, not the transporter.",
    dispute_status: "RESOLVED",
    managed_by: "NPA — Uche Obi (NPA-022)",
    resolution_outcome: "FINE_WAIVED",
    resolution_date: "2026-04-02T11:00:00Z",
    resolution_history: [
      { action: "Dispute Submitted", performed_by: "Sule Musa (Dangote)", timestamp: "2026-03-29T08:30:00Z", notes: "Dispute with terminal gate log evidence attached" },
      { action: "NPA Review", performed_by: "NPA — Uche Obi (NPA-022)", timestamp: "2026-03-30T10:00:00Z", notes: "Reviewing terminal gate logs" },
      { action: "Fine Waived", performed_by: "NPA — Uche Obi (NPA-022)", timestamp: "2026-04-02T11:00:00Z", notes: "Terminal gate logs confirm delay was caused by terminal staff. Fine waived." },
    ],
  },
];

// ─── Summary builders ───
export function buildPenaltiesSummary(penalties: PenaltyDefinition[]): PenaltiesSummary {
  const active = penalties.filter((p) => p.status === "ACTIVE").length;
  const inactive = penalties.filter((p) => p.status === "INACTIVE").length;
  const archived = penalties.filter((p) => p.status === "ARCHIVED").length;
  const avg = penalties.length > 0 ? Math.round(penalties.reduce((s, p) => s + p.fine_amount, 0) / penalties.length) : 0;
  return { total: penalties.length, active, inactive, archived, avg_fine_amount: avg };
}

export function buildIssuedFinesSummary(fines: IssuedFine[]): IssuedFinesSummary {
  const accepted = fines.filter((f) => f.status === "ACCEPTED");
  const disputed = fines.filter((f) => f.status === "DISPUTED");
  return {
    total: fines.length,
    accepted: accepted.length,
    disputed: disputed.length,
    total_amount: fines.reduce((s, f) => s + f.fine_amount, 0),
    accepted_amount: accepted.reduce((s, f) => s + f.fine_amount, 0),
    disputed_amount: disputed.reduce((s, f) => s + f.fine_amount, 0),
  };
}

export function buildDisputesSummary(disputes: FineDispute[]): DisputesSummary {
  const resolved = disputes.filter((d) => d.dispute_status === "RESOLVED");
  const waived   = resolved.filter((d) => d.resolution_outcome === "FINE_WAIVED");
  const adjusted = resolved.filter((d) => d.resolution_outcome === "FINE_ADJUSTED");
  const waivedAmt   = waived.reduce((s, d) => s + d.fine_amount, 0);
  const adjustedAmt = adjusted.reduce((s, d) => s + (d.fine_amount - (d.adjusted_amount ?? 0)), 0);
  return {
    total: disputes.length,
    pending_review:   disputes.filter((d) => d.dispute_status === "PENDING_REVIEW").length,
    under_npa_review: disputes.filter((d) => d.dispute_status === "UNDER_NPA_REVIEW").length,
    resolved:         resolved.length,
    rejected:         disputes.filter((d) => d.dispute_status === "REJECTED").length,
    fine_upheld:  resolved.filter((d) => d.resolution_outcome === "FINE_UPHELD").length,
    fine_waived:  waived.length,
    fine_adjusted: adjusted.length,
    total_amount_in_dispute:      disputes.filter((d) => d.dispute_status !== "RESOLVED" && d.dispute_status !== "REJECTED").reduce((s, d) => s + d.fine_amount, 0),
    total_amount_waived_adjusted: waivedAmt + adjustedAmt,
  };
}

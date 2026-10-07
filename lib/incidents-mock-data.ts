import type {
  IncidentLocationKind,
  IncidentReport,
  IncidentSeverity,
  IncidentStatus,
  IncidentType,
} from "@/types/incidents.types";

export const INCIDENT_TYPE_OPTIONS: { value: IncidentType; label: string }[] = [
  { value: "TRUCK_BREAKDOWN", label: "Truck Breakdown" },
  { value: "CARGO_DAMAGE", label: "Cargo Damage" },
  { value: "ACCIDENT_INJURY", label: "Accident / Injury" },
  { value: "GATE_CONGESTION", label: "Gate Congestion" },
  { value: "SECURITY_BREACH", label: "Security Breach" },
  { value: "PAYMENT_DISPUTE", label: "Payment Dispute" },
  { value: "SYSTEM_DOWNTIME", label: "System / Access Control Downtime" },
];

export const INCIDENT_SEVERITY_OPTIONS: IncidentSeverity[] = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL",
];

export const INCIDENT_STATUS_OPTIONS: { value: IncidentStatus; label: string }[] = [
  { value: "OPEN", label: "Open" },
  { value: "ASSIGNED", label: "Assigned" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "PENDING_SUPERADMIN_APPROVAL", label: "Pending SuperAdmin Approval" },
  { value: "CLOSED", label: "Closed" },
  { value: "REJECTED_BY_SUPERADMIN", label: "Rejected by SuperAdmin" },
  { value: "REOPENED", label: "Reopened" },
];

export const INCIDENT_LOCATION_OPTIONS: { value: IncidentLocationKind; label: string }[] = [
  { value: "FACILITY", label: "Facility" },
  { value: "TRANSIT_PARK", label: "Transit Park" },
  { value: "PORT_TERMINAL", label: "Port / Terminal" },
];

export const INCIDENT_ASSIGNTEAMS = [
  "HarbourGate Security",
  "NPA Ops Control",
  "LASTMA Patrol",
  "Terminal Operator",
  "ETSS Ops Desk",
  "Facility Maintenance",
];

export function formatIncidentType(type: IncidentType): string {
  return INCIDENT_TYPE_OPTIONS.find((o) => o.value === type)?.label ?? type;
}

export function formatIncidentStatus(status: IncidentStatus): string {
  return INCIDENT_STATUS_OPTIONS.find((o) => o.value === status)?.label ?? status;
}

export function formatIncidentSeverity(severity: IncidentSeverity): string {
  return severity.charAt(0) + severity.slice(1).toLowerCase();
}

export function formatLocationKind(kind: IncidentLocationKind): string {
  return INCIDENT_LOCATION_OPTIONS.find((o) => o.value === kind)?.label ?? kind;
}

export const MOCK_INCIDENT_REPORTS: IncidentReport[] = [
  {
    id: "inc-1",
    referenceId: "INC-2026-09052",
    type: "SECURITY_BREACH",
    description:
      "Unauthorized personnel attempted access at Mile 2 pregate checkpoint. Security detained individual; barrier logs show failed RFID scan sequence.",
    severity: "CRITICAL",
    locationKind: "TRANSIT_PARK",
    locationName: "Mile 2 Transit Park — Pregate Lane 2",
    reportedAt: "2026-10-07T10:15:00.000Z",
    status: "IN_PROGRESS",
    assignedTeam: "HarbourGate Security",
    assignedUser: "Cmdr. Adeyemi",
    reporter: {
      id: "usr-p-1",
      name: "Ngozi Adebayo",
      email: "ngozi.adebayo@harbourgates.com",
      company: "HarbourGate Security Ltd",
      isPrimaryAccountUser: true,
    },
    evidence: [
      { id: "ev-1", label: "CCTV still — gate lane 2", type: "photo" },
      { id: "ev-2", label: "RFID access log export", type: "file" },
    ],
    timeline: [
      {
        id: "tl-1",
        timestamp: "2026-10-07T10:15:00.000Z",
        title: "Incident reported",
        actor: "Ngozi Adebayo",
      },
      {
        id: "tl-2",
        timestamp: "2026-10-07T10:22:00.000Z",
        title: "Assigned to HarbourGate Security",
        actor: "System",
      },
      {
        id: "tl-3",
        timestamp: "2026-10-07T11:05:00.000Z",
        title: "Status → In Progress",
        actor: "Cmdr. Adeyemi",
      },
    ],
    notes: [
      {
        id: "n-1",
        author: "Cmdr. Adeyemi",
        team: "HarbourGate Security",
        timestamp: "2026-10-07T11:10:00.000Z",
        body: "Patrol dispatched. Awaiting NPA liaison confirmation.",
      },
    ],
    actionsTaken: ["Barrier lane 2 closed temporarily", "Incident logged with NPA hotline"],
  },
  {
    id: "inc-2",
    referenceId: "INC-2026-09044",
    type: "GATE_CONGESTION",
    description:
      "Queue exceeded 2km at Tincan Island terminal gate. Average wait time 3h+. Multiple trucks reporting missed slots.",
    severity: "LOW",
    locationKind: "PORT_TERMINAL",
    locationName: "Tincan Island Terminal — Main Gate",
    reportedAt: "2026-10-06T08:30:00.000Z",
    status: "ASSIGNED",
    assignedTeam: "NPA Ops Control",
    assignedUser: "Ops Desk B",
    reporter: {
      id: "usr-p-2",
      name: "Emeka Okafor",
      email: "emeka@abclogistics.ng",
      company: "ABC Logistics Ltd",
      isPrimaryAccountUser: true,
    },
    evidence: [{ id: "ev-3", label: "Queue photo — main gate", type: "photo" }],
    timeline: [
      {
        id: "tl-4",
        timestamp: "2026-10-06T08:30:00.000Z",
        title: "Incident reported",
        actor: "Emeka Okafor",
      },
      {
        id: "tl-5",
        timestamp: "2026-10-06T09:00:00.000Z",
        title: "Assigned to NPA Ops Control",
        actor: "ETSS Ops Desk",
      },
    ],
    notes: [],
    actionsTaken: ["Traffic advisory drafted"],
    priorityDeadline: "2026-10-07T18:00:00.000Z",
  },
  {
    id: "inc-3",
    referenceId: "INC-2026-09031",
    type: "TRUCK_BREAKDOWN",
    description:
      "Engine failure on Apapa corridor after leaving pregate. Driver requests tow to APM Terminals Apapa. Cargo: import containers.",
    severity: "HIGH",
    locationKind: "TRANSIT_PARK",
    locationName: "Apapa-Oshodi Expressway (post Mile 2)",
    reportedAt: "2026-10-04T14:20:00.000Z",
    status: "PENDING_SUPERADMIN_APPROVAL",
    assignedTeam: "LASTMA Patrol",
    assignedUser: "Sgt. Ibrahim",
    reporter: {
      id: "usr-p-3",
      name: "Amina Suleiman",
      email: "amina@buatransport.ng",
      company: "BUA Transport Services",
      isPrimaryAccountUser: true,
    },
    related: {
      truckPlate: "LAG-442-BND",
      driverName: "Amina Suleiman",
      driverId: "DRV-009012",
      bookingId: "BKG-2026-008415",
    },
    evidence: [
      { id: "ev-4", label: "Breakdown site photo", type: "photo" },
      { id: "ev-5", label: "Driver statement PDF", type: "file" },
    ],
    timeline: [
      {
        id: "tl-6",
        timestamp: "2026-10-04T14:20:00.000Z",
        title: "Incident reported",
        actor: "Amina Suleiman",
      },
      {
        id: "tl-7",
        timestamp: "2026-10-04T16:45:00.000Z",
        title: "Tow truck dispatched",
        actor: "LASTMA Patrol",
      },
      {
        id: "tl-8",
        timestamp: "2026-10-05T09:30:00.000Z",
        title: "Marked Resolved — pending SuperAdmin approval",
        actor: "Sgt. Ibrahim",
      },
    ],
    notes: [
      {
        id: "n-2",
        author: "Sgt. Ibrahim",
        team: "LASTMA Patrol",
        timestamp: "2026-10-05T09:00:00.000Z",
        body: "Truck towed to holding bay. Driver uninjured.",
      },
    ],
    actionsTaken: ["Tow truck RapidTow NG dispatched", "Corridor lane cleared"],
    resolution: {
      rootCause: "Fuel system failure — corroded line",
      correctiveAction: "Truck towed to workshop; booking rescheduled",
      resolutionNotes: "Driver confirmed safe. Cargo seals intact.",
      resolvedAt: "2026-10-05T09:30:00.000Z",
      slaMet: true,
      postResolutionEvidence: [{ id: "ev-6", label: "Workshop intake receipt", type: "file" }],
    },
  },
  {
    id: "inc-4",
    referenceId: "INC-2026-09019",
    type: "CARGO_DAMAGE",
    description: "Visible container door seal damage noted at facility exit inspection.",
    severity: "MEDIUM",
    locationKind: "FACILITY",
    locationName: "Apapa Bonded Terminal Complex",
    reportedAt: "2026-09-29T11:00:00.000Z",
    status: "CLOSED",
    assignedTeam: "Facility Maintenance",
    reporter: {
      id: "usr-p-4",
      name: "Chidi Okafor",
      email: "chidi@tsllogistics.ng",
      company: "TSL Logistics",
      isPrimaryAccountUser: true,
    },
    evidence: [{ id: "ev-7", label: "Seal damage photo", type: "photo" }],
    timeline: [
      {
        id: "tl-9",
        timestamp: "2026-09-29T11:00:00.000Z",
        title: "Incident reported",
        actor: "Chidi Okafor",
      },
      {
        id: "tl-10",
        timestamp: "2026-09-30T15:00:00.000Z",
        title: "SuperAdmin approved resolution — Closed",
        actor: "SuperAdmin",
      },
    ],
    notes: [],
    actionsTaken: ["Insurance claim initiated", "Container held for survey"],
    resolution: {
      rootCause: "Forklift contact during loading",
      correctiveAction: "Re-sealed after survey; loader retrained",
      resolutionNotes: "Approved by SuperAdmin.",
      resolvedAt: "2026-09-30T12:00:00.000Z",
      slaMet: true,
    },
  },
  {
    id: "inc-5",
    referenceId: "INC-2026-09008",
    type: "PAYMENT_DISPUTE",
    description:
      "Transporter disputes double charge on booking fee. Payment reference shows two successful captures.",
    severity: "MEDIUM",
    locationKind: "FACILITY",
    locationName: "Kirikiri Bonded Facility",
    reportedAt: "2026-10-01T07:45:00.000Z",
    status: "OPEN",
    assignedTeam: "ETSS Ops Desk",
    reporter: {
      id: "usr-p-5",
      name: "Fatima Bello",
      email: "fatima@mikano.ng",
      company: "Mikano Logistics",
      isPrimaryAccountUser: true,
    },
    evidence: [{ id: "ev-8", label: "Paystack receipt screenshots", type: "photo" }],
    timeline: [
      {
        id: "tl-11",
        timestamp: "2026-10-01T07:45:00.000Z",
        title: "Incident reported",
        actor: "Fatima Bello",
      },
    ],
    notes: [],
    actionsTaken: [],
    paymentReference: "PAY-PSK-8849210",
  },
  {
    id: "inc-6",
    referenceId: "INC-2026-08991",
    type: "SYSTEM_DOWNTIME",
    description: "Barrier access control offline at Tincan pregate — trucks queuing manually.",
    severity: "HIGH",
    locationKind: "PORT_TERMINAL",
    locationName: "Tincan Island — Pregate Barrier 519",
    reportedAt: "2026-09-28T06:10:00.000Z",
    status: "REOPENED",
    assignedTeam: "Terminal Operator",
    assignedUser: "IT On-call",
    reporter: {
      id: "usr-p-6",
      name: "James Okon",
      email: "james@terminalops.ng",
      company: "Tincan Terminal Operator",
      isPrimaryAccountUser: true,
    },
    evidence: [{ id: "ev-9", label: "System error screenshot", type: "photo" }],
    timeline: [
      {
        id: "tl-12",
        timestamp: "2026-09-28T06:10:00.000Z",
        title: "Incident reported",
        actor: "James Okon",
      },
      {
        id: "tl-13",
        timestamp: "2026-09-28T14:00:00.000Z",
        title: "Marked Resolved",
        actor: "IT On-call",
      },
      {
        id: "tl-14",
        timestamp: "2026-09-29T09:00:00.000Z",
        title: "Resolution rejected by SuperAdmin — Reopened",
        detail: "Intermittent failures recurred; root cause analysis incomplete.",
        actor: "SuperAdmin",
      },
    ],
    notes: [
      {
        id: "n-3",
        author: "SuperAdmin",
        team: "MARITIME-ETSS",
        timestamp: "2026-09-29T09:00:00.000Z",
        body: "Please provide full RCA and vendor ticket before re-submitting resolution.",
      },
    ],
    actionsTaken: ["Manual gate procedure activated"],
    resolution: {
      rootCause: "Network switch reboot (initial)",
      correctiveAction: "Switch replaced — pending verification",
      resolutionNotes: "Rejected — recurrence observed",
      resolvedAt: "2026-09-28T14:00:00.000Z",
      slaMet: false,
    },
  },
];

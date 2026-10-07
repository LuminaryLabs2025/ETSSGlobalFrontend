export type IncidentType =
  | "TRUCK_BREAKDOWN"
  | "CARGO_DAMAGE"
  | "ACCIDENT_INJURY"
  | "GATE_CONGESTION"
  | "SECURITY_BREACH"
  | "PAYMENT_DISPUTE"
  | "SYSTEM_DOWNTIME";

export type IncidentSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type IncidentLocationKind = "FACILITY" | "TRANSIT_PARK" | "PORT_TERMINAL";

export type IncidentStatus =
  | "OPEN"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "PENDING_SUPERADMIN_APPROVAL"
  | "CLOSED"
  | "REJECTED_BY_SUPERADMIN"
  | "REOPENED";

export interface IncidentReporter {
  id: string;
  name: string;
  email: string;
  company: string;
  isPrimaryAccountUser: true;
}

export interface IncidentRelatedEntities {
  truckPlate?: string;
  driverName?: string;
  driverId?: string;
  bookingId?: string;
}

export interface IncidentEvidence {
  id: string;
  label: string;
  type: "photo" | "file";
  url?: string;
}

export interface IncidentTimelineEntry {
  id: string;
  timestamp: string;
  title: string;
  detail?: string;
  actor?: string;
}

export interface IncidentNote {
  id: string;
  author: string;
  team: string;
  timestamp: string;
  body: string;
}

export interface IncidentResolution {
  rootCause?: string;
  correctiveAction?: string;
  resolutionNotes?: string;
  resolvedAt?: string;
  slaMet?: boolean;
  postResolutionEvidence?: IncidentEvidence[];
}

export interface IncidentReport {
  id: string;
  referenceId: string;
  type: IncidentType;
  description: string;
  severity: IncidentSeverity;
  locationKind: IncidentLocationKind;
  locationName: string;
  reportedAt: string;
  status: IncidentStatus;
  assignedTeam: string;
  assignedUser?: string;
  reporter: IncidentReporter;
  related?: IncidentRelatedEntities;
  evidence: IncidentEvidence[];
  timeline: IncidentTimelineEntry[];
  notes: IncidentNote[];
  actionsTaken: string[];
  resolution?: IncidentResolution;
  priorityDeadline?: string;
  paymentReference?: string;
}

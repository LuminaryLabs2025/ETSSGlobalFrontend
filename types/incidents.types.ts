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

export type IncidentCommentKind = "COMMENT" | "INSTRUCTION";

export type IncidentEscalateLevel = "MANAGEMENT" | "NPA";

export type IncidentEmergencyAction = "DISPATCH_TOW_TRUCK";

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
  assignedCompanyId?: string;
  assignedUserId?: string;
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

export interface IncidentsListParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: IncidentType | "All";
  severity?: IncidentSeverity | "All";
  status?: IncidentStatus | "All";
  location_kind?: IncidentLocationKind | "All";
}

export interface IncidentsListResponse {
  data: IncidentReport[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export interface IncidentSummaryStatusCount {
  status: IncidentStatus;
  label: string;
  count: number;
}

export interface IncidentSummarySeverityCount {
  severity: IncidentSeverity;
  count: number;
}

export interface IncidentsSummaryResponse {
  open: number;
  pendingApproval: number;
  resolved: number;
  total: number;
  overdue: number;
  byStatus: IncidentSummaryStatusCount[];
  openBySeverity: IncidentSummarySeverityCount[];
}

export interface IncidentAssigneeCompany {
  id: string;
  name: string;
  userType: string | null;
}

export interface IncidentAssigneeUser {
  id: string;
  name: string;
  email: string;
  accountType: string;
}

export interface IncidentAssignPayload {
  assigned_company_id: string;
  assigned_user_id: string;
  note?: string;
}

export interface IncidentSeverityPayload {
  severity: IncidentSeverity;
  reason: string;
}

export interface IncidentDeadlinePayload {
  priority_deadline: string;
}

export interface IncidentCommentPayload {
  kind: IncidentCommentKind;
  body: string;
}

export interface IncidentEscalatePayload {
  level: IncidentEscalateLevel;
  notes?: string;
}

export interface IncidentRequestEvidencePayload {
  message: string;
}

export interface IncidentEmergencyResponsePayload {
  action: IncidentEmergencyAction;
  notes?: string;
}

export interface IncidentApproveResolutionPayload {
  notes?: string;
}

export interface IncidentRejectPayload {
  reason: string;
}

export interface IncidentResolvePayload {
  root_cause: string;
  corrective_action: string;
  resolution_notes: string;
}

export interface IncidentReopenPayload {
  reason: string;
}

export interface IncidentActionResponse {
  message?: string;
  data: IncidentReport;
}

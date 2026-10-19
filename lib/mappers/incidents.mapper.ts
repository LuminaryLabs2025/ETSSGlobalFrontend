import type {
  IncidentAssigneeCompany,
  IncidentAssigneeUser,
  IncidentEvidence,
  IncidentNote,
  IncidentReport,
  IncidentRelatedEntities,
  IncidentReporter,
  IncidentResolution,
  IncidentSummarySeverityCount,
  IncidentSummaryStatusCount,
  IncidentTimelineEntry,
  IncidentsSummaryResponse,
} from "@/types/incidents.types";

type Raw = Record<string, unknown>;

function str(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

function mapReporter(raw: unknown): IncidentReporter {
  const r = (raw ?? {}) as Raw;
  return {
    id: str(r.id),
    name: str(r.name),
    email: str(r.email),
    company: str(r.company),
    isPrimaryAccountUser: true,
  };
}

function mapTimeline(raw: unknown): IncidentTimelineEntry[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    const t = item as Raw;
    return {
      id: str(t.id),
      timestamp: str(t.timestamp),
      title: str(t.title),
      detail: str(t.detail) || undefined,
      actor: str(t.actor) || undefined,
    };
  });
}

function mapEvidence(raw: unknown): IncidentEvidence[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    const e = item as Raw;
    return {
      id: str(e.id),
      label: str(e.label),
      type: (e.type === "file" ? "file" : "photo") as "photo" | "file",
      url: str(e.url) || undefined,
    };
  });
}

function mapNotes(raw: unknown): IncidentNote[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    const n = item as Raw;
    return {
      id: str(n.id),
      author: str(n.author),
      team: str(n.team),
      timestamp: str(n.timestamp),
      body: str(n.body),
    };
  });
}

function mapRelated(raw: unknown): IncidentRelatedEntities | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const r = raw as Raw;
  return {
    truckPlate: str(r.truck_plate ?? r.truckPlate) || undefined,
    driverName: str(r.driver_name ?? r.driverName) || undefined,
    driverId: str(r.driver_id ?? r.driverId) || undefined,
    bookingId: str(r.booking_id ?? r.bookingId) || undefined,
  };
}

function mapResolution(raw: unknown): IncidentResolution | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const r = raw as Raw;
  return {
    rootCause: str(r.root_cause ?? r.rootCause) || undefined,
    correctiveAction: str(r.corrective_action ?? r.correctiveAction) || undefined,
    resolutionNotes: str(r.resolution_notes ?? r.resolutionNotes) || undefined,
    resolvedAt: str(r.resolved_at ?? r.resolvedAt) || undefined,
    slaMet: r.sla_met === true || r.slaMet === true,
    postResolutionEvidence: mapEvidence(r.post_resolution_evidence ?? r.postResolutionEvidence),
  };
}

export function mapIncidentReport(raw: Raw): IncidentReport {
  return {
    id: str(raw.id),
    referenceId: str(raw.reference_id ?? raw.referenceId),
    type: raw.type as IncidentReport["type"],
    description: str(raw.description),
    severity: raw.severity as IncidentReport["severity"],
    locationKind: (raw.location_kind ?? raw.locationKind) as IncidentReport["locationKind"],
    locationName: str(raw.location_name ?? raw.locationName),
    reportedAt: str(raw.reported_at ?? raw.reportedAt),
    status: raw.status as IncidentReport["status"],
    assignedTeam: str(raw.assigned_team ?? raw.assignedTeam ?? raw.assigned_company_name),
    assignedUser: str(raw.assigned_user ?? raw.assignedUser ?? raw.assigned_user_name) || undefined,
    assignedCompanyId: str(raw.assigned_company_id ?? raw.assignedCompanyId) || undefined,
    assignedUserId: str(raw.assigned_user_id ?? raw.assignedUserId) || undefined,
    reporter: mapReporter(raw.reporter),
    related: mapRelated(raw.related),
    evidence: mapEvidence(raw.evidence),
    timeline: mapTimeline(raw.timeline),
    notes: mapNotes(raw.notes),
    actionsTaken: Array.isArray(raw.actions_taken ?? raw.actionsTaken)
      ? (raw.actions_taken ?? raw.actionsTaken) as string[]
      : [],
    resolution: mapResolution(raw.resolution),
    priorityDeadline: str(raw.priority_deadline ?? raw.priorityDeadline) || undefined,
    paymentReference: str(raw.payment_reference ?? raw.paymentReference) || undefined,
  };
}

function mapByStatus(raw: unknown): IncidentSummaryStatusCount[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    const row = item as Raw;
    return {
      status: row.status as IncidentSummaryStatusCount["status"],
      label: str(row.label),
      count: Number(row.count ?? 0),
    };
  });
}

function mapOpenBySeverity(raw: unknown): IncidentSummarySeverityCount[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    const row = item as Raw;
    return {
      severity: row.severity as IncidentSummarySeverityCount["severity"],
      count: Number(row.count ?? 0),
    };
  });
}

export function mapIncidentsSummary(raw: Raw): IncidentsSummaryResponse {
  return {
    open: Number(raw.open ?? raw.open_like ?? raw.openLike ?? 0),
    pendingApproval: Number(
      raw.pending_approval ?? raw.pendingApproval ?? raw.pending ?? 0,
    ),
    resolved: Number(raw.resolved ?? 0),
    total: Number(raw.total ?? 0),
    overdue: Number(raw.overdue ?? 0),
    byStatus: mapByStatus(raw.by_status ?? raw.byStatus),
    openBySeverity: mapOpenBySeverity(raw.open_by_severity ?? raw.openBySeverity),
  };
}

export function mapAssigneeCompany(raw: Raw): IncidentAssigneeCompany {
  return {
    id: str(raw.id),
    name: str(raw.name),
    userType: raw.user_type != null ? str(raw.user_type) : null,
  };
}

export function mapAssigneeUser(raw: Raw): IncidentAssigneeUser {
  return {
    id: str(raw.id),
    name: str(raw.name),
    email: str(raw.email),
    accountType: str(raw.account_type ?? raw.accountType),
  };
}

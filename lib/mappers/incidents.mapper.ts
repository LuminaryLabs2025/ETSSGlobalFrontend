import type {
  IncidentEvidence,
  IncidentNote,
  IncidentReport,
  IncidentRelatedEntities,
  IncidentReporter,
  IncidentResolution,
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
    assignedTeam: str(raw.assigned_team ?? raw.assignedTeam),
    assignedUser: str(raw.assigned_user ?? raw.assignedUser) || undefined,
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

export function mapIncidentsSummary(raw: Raw): IncidentsSummaryResponse {
  return {
    openLike: Number(raw.open_like ?? raw.openLike ?? 0),
    pending: Number(raw.pending ?? 0),
    resolved: Number(raw.resolved ?? 0),
    closed: Number(raw.closed ?? 0),
    total: Number(raw.total ?? 0),
  };
}

"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  FileText,
  Filter,
  MessageSquare,
  Search,
  Shield,
  Siren,
  User,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth.store";
import { SuperAdminGate } from "@/components/dashboard/book-assist/BookAssistUi";
import {
  formatIncidentSeverity,
  formatIncidentStatus,
  formatIncidentType,
  formatLocationKind,
  INCIDENT_ASSIGNTEAMS,
  INCIDENT_LOCATION_OPTIONS,
  INCIDENT_SEVERITY_OPTIONS,
  INCIDENT_STATUS_OPTIONS,
  INCIDENT_TYPE_OPTIONS,
  MOCK_INCIDENT_REPORTS,
} from "@/lib/incidents-mock-data";
import type {
  IncidentReport,
  IncidentSeverity,
  IncidentStatus,
  IncidentType,
} from "@/types/incidents.types";

function formatTimestamp(ts: string) {
  return new Date(ts).toLocaleString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function SeverityBadge({ severity }: { severity: IncidentSeverity }) {
  const map: Record<IncidentSeverity, string> = {
    LOW: "bg-gray-100 text-gray-600 border-gray-200",
    MEDIUM: "bg-amber-50 text-amber-800 border-amber-200",
    HIGH: "bg-red-50 text-red-700 border-red-200",
    CRITICAL: "bg-red-700 text-white border-red-800",
  };
  return (
    <span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium ${map[severity]}`}>
      {formatIncidentSeverity(severity)}
    </span>
  );
}

function StatusBadge({ status }: { status: IncidentStatus }) {
  const map: Partial<Record<IncidentStatus, string>> = {
    OPEN: "bg-red-50 text-red-700 border-red-200",
    ASSIGNED: "bg-blue-50 text-blue-700 border-blue-200",
    IN_PROGRESS: "bg-amber-50 text-amber-800 border-amber-200",
    RESOLVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
    PENDING_SUPERADMIN_APPROVAL: "bg-violet-50 text-violet-800 border-violet-200",
    CLOSED: "bg-gray-100 text-gray-600 border-gray-200",
    REJECTED_BY_SUPERADMIN: "bg-orange-50 text-orange-800 border-orange-200",
    REOPENED: "bg-rose-50 text-rose-800 border-rose-200",
  };
  return (
    <span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium ${map[status] ?? "bg-gray-50 text-gray-600"}`}>
      {formatIncidentStatus(status)}
    </span>
  );
}

function IncidentDetailDrawer({
  incident,
  onClose,
  onUpdate,
}: {
  incident: IncidentReport;
  onClose: () => void;
  onUpdate: (next: IncidentReport) => void;
}) {
  const [severity, setSeverity] = useState(incident.severity);
  const [assignTeam, setAssignTeam] = useState(incident.assignedTeam);
  const [comment, setComment] = useState("");
  const [deadline, setDeadline] = useState(
    incident.priorityDeadline?.slice(0, 16) ?? "",
  );
  const [rejectComment, setRejectComment] = useState("");

  const showResolutionReview =
    incident.status === "PENDING_SUPERADMIN_APPROVAL"
    || incident.status === "RESOLVED"
    || Boolean(incident.resolution);

  const showFinalDecision = incident.status === "PENDING_SUPERADMIN_APPROVAL";

  function addTimeline(title: string, detail?: string) {
    const entry = {
      id: `tl-${Date.now()}`,
      timestamp: new Date().toISOString(),
      title,
      detail,
      actor: "SuperAdmin",
    };
    onUpdate({
      ...incident,
      severity,
      assignedTeam: assignTeam,
      priorityDeadline: deadline ? new Date(deadline).toISOString() : incident.priorityDeadline,
      timeline: [entry, ...incident.timeline],
    });
  }

  function handleApproveClose() {
    onUpdate({
      ...incident,
      status: "CLOSED",
      severity,
      assignedTeam: assignTeam,
      timeline: [
        {
          id: `tl-${Date.now()}`,
          timestamp: new Date().toISOString(),
          title: "SuperAdmin approved resolution — Closed",
          actor: "SuperAdmin",
        },
        ...incident.timeline,
      ],
    });
    toast.success("Resolution approved. Incident closed.");
    onClose();
  }

  function handleReject() {
    if (!rejectComment.trim()) {
      toast.error("Add rejection comments before reopening.");
      return;
    }
    onUpdate({
      ...incident,
      status: "REOPENED",
      notes: [
        {
          id: `n-${Date.now()}`,
          author: "SuperAdmin",
          team: "MARITIME-ETSS",
          timestamp: new Date().toISOString(),
          body: rejectComment.trim(),
        },
        ...incident.notes,
      ],
      timeline: [
        {
          id: `tl-${Date.now()}`,
          timestamp: new Date().toISOString(),
          title: "Resolution rejected — Reopened",
          detail: rejectComment.trim(),
          actor: "SuperAdmin",
        },
        ...incident.timeline,
      ],
    });
    toast.success("Resolution rejected. Incident reopened.");
    onClose();
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[520px] flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 bg-[#0f1e2e] px-5 py-4">
          <div className="min-w-0">
            <p className="font-mono text-sm font-bold text-white">{incident.referenceId}</p>
            <p className="truncate text-[11px] text-gray-400">{formatIncidentType(incident.type)}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-white/10">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={incident.status} />
            <SeverityBadge severity={severity} />
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Description</p>
            <p className="mt-1 text-sm leading-relaxed text-gray-800">{incident.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-gray-500">Location</p>
              <p className="font-medium text-gray-900">{formatLocationKind(incident.locationKind)}</p>
              <p className="text-[11px] text-gray-600">{incident.locationName}</p>
            </div>
            <div>
              <p className="text-gray-500">Time reported</p>
              <p className="font-medium text-gray-900">{formatTimestamp(incident.reportedAt)}</p>
            </div>
            <div>
              <p className="text-gray-500">Assigned team</p>
              <p className="font-medium text-gray-900">{incident.assignedTeam}</p>
              {incident.assignedUser && (
                <p className="text-[11px] text-gray-600">{incident.assignedUser}</p>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-gray-100 bg-gray-50/80 p-3">
            <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase text-gray-400">
              <User className="h-3 w-3" />
              Reporter (Primary account user)
            </p>
            <p className="mt-1 text-sm font-semibold text-gray-900">{incident.reporter.name}</p>
            <p className="text-xs text-gray-600">{incident.reporter.email}</p>
            <p className="text-xs text-gray-500">{incident.reporter.company}</p>
          </div>

          {incident.type === "TRUCK_BREAKDOWN" && incident.related && (
            <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-3 text-xs">
              <p className="font-semibold text-blue-900">Related truck / booking / driver</p>
              <p className="mt-1 text-gray-700">Plate: {incident.related.truckPlate ?? "—"}</p>
              <p className="text-gray-700">Driver: {incident.related.driverName} ({incident.related.driverId})</p>
              <p className="text-gray-700">Booking: {incident.related.bookingId ?? "—"}</p>
            </div>
          )}

          {incident.paymentReference && (
            <button
              type="button"
              onClick={() => toast.info(`Payment ref: ${incident.paymentReference}`)}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-100"
            >
              <FileText className="h-3.5 w-3.5" />
              View payment details
            </button>
          )}

          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Evidence</p>
            <div className="flex flex-wrap gap-2">
              {incident.evidence.map((ev) => (
                <span
                  key={ev.id}
                  className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-[11px] text-gray-700"
                >
                  {ev.type === "photo" ? "📷" : "📄"} {ev.label}
                </span>
              ))}
            </div>
          </div>

          {incident.actionsTaken.length > 0 && (
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Actions taken</p>
              <ul className="list-inside list-disc text-xs text-gray-700">
                {incident.actionsTaken.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Activity timeline</p>
            <div className="space-y-2">
              {incident.timeline.map((e) => (
                <div key={e.id} className="flex gap-2 text-xs">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                  <div>
                    <p className="font-medium text-gray-900">{e.title}</p>
                    {e.detail && <p className="text-gray-600">{e.detail}</p>}
                    <p className="text-[10px] text-gray-400">
                      {formatTimestamp(e.timestamp)}
                      {e.actor ? ` · ${e.actor}` : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {incident.notes.length > 0 && (
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Team notes</p>
              <div className="space-y-2">
                {incident.notes.map((n) => (
                  <div key={n.id} className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-xs">
                    <p className="font-semibold text-gray-800">
                      {n.author} · {n.team}
                    </p>
                    <p className="mt-1 text-gray-600">{n.body}</p>
                    <p className="mt-1 text-[10px] text-gray-400">{formatTimestamp(n.timestamp)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {showResolutionReview && incident.resolution && (
            <div className="rounded-xl border border-violet-200 bg-violet-50/40 p-4">
              <p className="text-xs font-bold text-violet-900">Resolution review</p>
              <dl className="mt-2 space-y-1.5 text-xs">
                <div>
                  <dt className="text-gray-500">Root cause</dt>
                  <dd className="text-gray-800">{incident.resolution.rootCause ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Corrective action</dt>
                  <dd className="text-gray-800">{incident.resolution.correctiveAction ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Resolution notes</dt>
                  <dd className="text-gray-800">{incident.resolution.resolutionNotes ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">SLA met</dt>
                  <dd className="font-medium text-gray-800">
                    {incident.resolution.slaMet == null ? "—" : incident.resolution.slaMet ? "Yes" : "No"}
                  </dd>
                </div>
                {incident.resolution.resolvedAt && (
                  <div>
                    <dt className="text-gray-500">Resolved at</dt>
                    <dd className="text-gray-800">{formatTimestamp(incident.resolution.resolvedAt)}</dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          <div className="rounded-xl border border-gray-200 p-4">
            <p className="text-xs font-bold text-gray-900">Oversight &amp; intervention</p>
            <div className="mt-3 space-y-3">
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase text-gray-400">Reassign team</label>
                <select
                  value={assignTeam}
                  onChange={(e) => setAssignTeam(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs"
                >
                  {INCIDENT_ASSIGNTEAMS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase text-gray-400">Severity</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as IncidentSeverity)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs"
                >
                  {INCIDENT_SEVERITY_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {formatIncidentSeverity(s)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase text-gray-400">Priority deadline</label>
                <input
                  type="datetime-local"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase text-gray-400">Instructions / comments</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs"
                  placeholder="Add guidance for assigned team…"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (comment.trim()) addTimeline("SuperAdmin instruction added", comment.trim());
                    toast.success("Updates saved.");
                  }}
                  className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                >
                  Save changes
                </button>
                <button
                  type="button"
                  onClick={() => {
                    addTimeline("Escalated to NPA / management");
                    toast.success("Escalated to regulatory agency (NPA).");
                  }}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Escalate (NPA)
                </button>
                <button
                  type="button"
                  onClick={() => toast.info("Evidence request sent to reporter.")}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Request evidence
                </button>
                <button
                  type="button"
                  onClick={() => toast.warning("Emergency response workflow triggered.")}
                  className="flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
                >
                  <Siren className="h-3.5 w-3.5" />
                  Emergency response
                </button>
              </div>
            </div>
          </div>

          {showFinalDecision && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/30 p-4">
              <p className="text-xs font-bold text-gray-900">Final decision</p>
              <textarea
                value={rejectComment}
                onChange={(e) => setRejectComment(e.target.value)}
                rows={2}
                placeholder="Rejection comments (required if rejecting)…"
                className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-xs"
              />
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={handleApproveClose}
                  className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-emerald-600 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Approve &amp; close
                </button>
                <button
                  type="button"
                  onClick={handleReject}
                  className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-orange-300 bg-orange-50 py-2 text-xs font-semibold text-orange-800 hover:bg-orange-100"
                >
                  Reject resolution
                </button>
                <button
                  type="button"
                  onClick={() => toast.info("Escalated to executive management.")}
                  className="flex flex-1 rounded-lg border border-gray-200 py-2 text-xs font-semibold text-gray-700 hover:bg-white"
                >
                  Escalate further
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export function IncidentReportsPage() {
  const isSuperAdmin = useAuthStore((s) => s.user?.is_super_admin ?? false);
  const [incidents, setIncidents] = useState(MOCK_INCIDENT_REPORTS);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<IncidentType | "All">("All");
  const [severityFilter, setSeverityFilter] = useState<IncidentSeverity | "All">("All");
  const [statusFilter, setStatusFilter] = useState<IncidentStatus | "All">("All");
  const [locationFilter, setLocationFilter] = useState<string>("All");
  const [showFilters, setShowFilters] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return incidents.filter((inc) => {
      if (q && !inc.referenceId.toLowerCase().includes(q)) return false;
      if (typeFilter !== "All" && inc.type !== typeFilter) return false;
      if (severityFilter !== "All" && inc.severity !== severityFilter) return false;
      if (statusFilter !== "All" && inc.status !== statusFilter) return false;
      if (locationFilter !== "All" && inc.locationKind !== locationFilter) return false;
      return true;
    });
  }, [incidents, search, typeFilter, severityFilter, statusFilter, locationFilter]);

  const stats = useMemo(() => {
    const openLike = incidents.filter((i) =>
      ["OPEN", "ASSIGNED", "IN_PROGRESS", "REOPENED"].includes(i.status),
    ).length;
    const pending = incidents.filter((i) => i.status === "PENDING_SUPERADMIN_APPROVAL").length;
    const resolved = incidents.filter((i) => i.status === "RESOLVED").length;
    const closed = incidents.filter((i) => i.status === "CLOSED").length;
    return { openLike, pending, resolved, closed, total: incidents.length };
  }, [incidents]);

  const detail = incidents.find((i) => i.id === detailId);

  if (!isSuperAdmin) {
    return <SuperAdminGate featureLabel="Incident Reports" />;
  }

  return (
    <div className="space-y-5 p-5 lg:p-6">
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0f1e2e]">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Incident Reports</h1>
              <p className="text-xs text-gray-500">
                Reported incidents from all accounts — review, direct, approve resolution, and close
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
            <Shield className="h-3 w-3" />
            SuperAdmin
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Open / active", value: stats.openLike, cls: "border-red-200 bg-red-50/50 text-red-800" },
          { label: "Pending your approval", value: stats.pending, cls: "border-violet-200 bg-violet-50/50 text-violet-800" },
          { label: "Resolved", value: stats.resolved, cls: "border-emerald-200 bg-emerald-50/50 text-emerald-800" },
          { label: "Closed", value: stats.closed, cls: "border-gray-200 bg-gray-50 text-gray-700" },
        ].map((c) => (
          <div key={c.label} className={`rounded-xl border p-4 ${c.cls}`}>
            <p className="text-2xl font-bold tabular-nums">{c.value}</p>
            <p className="mt-1 text-[11px] font-medium opacity-90">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-4 py-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[200px] flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by Incident Reference ID…"
                className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-emerald-300"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold ${
                showFilters ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-gray-200 text-gray-600"
              }`}
            >
              <Filter className="h-4 w-4" />
              Filters
            </button>
          </div>
          {showFilters && (
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as IncidentType | "All")}
                className="rounded-lg border border-gray-200 px-3 py-2 text-xs"
              >
                <option value="All">All incident types</option>
                {INCIDENT_TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value as IncidentSeverity | "All")}
                className="rounded-lg border border-gray-200 px-3 py-2 text-xs"
              >
                <option value="All">All severity levels</option>
                {INCIDENT_SEVERITY_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {formatIncidentSeverity(s)}
                  </option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as IncidentStatus | "All")}
                className="rounded-lg border border-gray-200 px-3 py-2 text-xs"
              >
                <option value="All">All statuses</option>
                {INCIDENT_STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="rounded-lg border border-gray-200 px-3 py-2 text-xs"
              >
                <option value="All">All locations</option>
                {INCIDENT_LOCATION_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                <th className="px-4 py-3">Reference</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Severity</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Reported</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Assigned</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-sm text-gray-400">
                    No incidents match your filters
                  </td>
                </tr>
              ) : (
                filtered.map((inc) => (
                  <tr key={inc.id} className="hover:bg-gray-50/80">
                    <td className="px-4 py-3 font-mono text-xs font-bold text-emerald-700">{inc.referenceId}</td>
                    <td className="px-4 py-3 text-xs text-gray-800">{formatIncidentType(inc.type)}</td>
                    <td className="px-4 py-3">
                      <SeverityBadge severity={inc.severity} />
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {formatLocationKind(inc.locationKind)}
                      <span className="block truncate text-[10px] text-gray-400">{inc.locationName}</span>
                    </td>
                    <td className="px-4 py-3 text-[11px] text-gray-500">{formatTimestamp(inc.reportedAt)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={inc.status} />
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-700">{inc.assignedTeam}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => setDetailId(inc.id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-[11px] font-semibold text-gray-700 hover:bg-gray-50"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Review
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <p className="flex items-center gap-1.5 border-t border-gray-100 px-4 py-3 text-[11px] text-gray-400">
          <MessageSquare className="h-3 w-3" />
          Showing {filtered.length} of {stats.total} reported incidents (sample database)
        </p>
      </div>

      {detail && (
        <IncidentDetailDrawer
          incident={detail}
          onClose={() => setDetailId(null)}
          onUpdate={(next) => {
            setIncidents((list) => list.map((i) => (i.id === next.id ? next : i)));
          }}
        />
      )}
    </div>
  );
}

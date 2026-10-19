"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  Clock,
  Eye,
  FileText,
  Filter,
  Gauge,
  Loader2,
  MessageSquare,
  RotateCcw,
  Search,
  Shield,
  Siren,
  TrendingUp,
  User,
  UserPlus,
  X,
  XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth.store";
import { SuperAdminGate } from "@/components/dashboard/book-assist/BookAssistUi";
import {
  TrafficSummaryPanel,
  type TrafficSummaryKpi,
} from "@/components/dashboard/traffic/TrafficSummaryPanel";
import {
  formatIncidentSeverity,
  formatIncidentStatus,
  formatIncidentStatusBadge,
  formatIncidentType,
  formatLocationKind,
  INCIDENT_LOCATION_OPTIONS,
  INCIDENT_SEVERITY_OPTIONS,
  INCIDENT_STATUS_OPTIONS,
  INCIDENT_TYPE_OPTIONS,
} from "@/lib/incidents-mock-data";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { useIncident } from "@/hooks/incidents/useIncident";
import {
  useIncidentAssigneeCompanies,
  useIncidentAssigneeUsers,
} from "@/hooks/incidents/useIncidentAssignees";
import { useIncidents } from "@/hooks/incidents/useIncidents";
import { useIncidentsSummary } from "@/hooks/incidents/useIncidentsSummary";
import {
  useAddIncidentComment,
  useApproveCloseIncident,
  useAssignIncident,
  useEscalateIncident,
  useIncidentEmergencyResponse,
  useRejectIncidentResolution,
  useReopenIncident,
  useRequestIncidentEvidence,
  useResolveIncident,
  useSetIncidentDeadline,
  useSetIncidentSeverity,
} from "@/hooks/incidents/useIncidentActions";
import type {
  IncidentCommentKind,
  IncidentEscalateLevel,
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
  const showSignOffIcon = status === "PENDING_SUPERADMIN_APPROVAL";
  const fullLabel = formatIncidentStatus(status);
  const badgeLabel = formatIncidentStatusBadge(status);

  return (
    <span
      title={badgeLabel !== fullLabel ? fullLabel : undefined}
      className={`inline-flex max-w-full items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-medium ${map[status] ?? "bg-gray-50 text-gray-600"}`}
    >
      {showSignOffIcon && (
        <Shield className="h-3 w-3 shrink-0 opacity-90" aria-hidden />
      )}
      {badgeLabel}
    </span>
  );
}

type DrawerView = "details" | "actions";

type IncidentDrawerAction =
  | "assign"
  | "severity"
  | "deadline"
  | "comment"
  | "escalate"
  | "evidence"
  | "emergency"
  | "resolve"
  | "reopen"
  | "approve"
  | "reject";

type ActionOption = {
  id: IncidentDrawerAction;
  label: string;
  description: string;
  icon: LucideIcon;
  tone: "default" | "primary" | "danger";
  available: (status: IncidentStatus) => boolean;
};

const INCIDENT_ACTION_OPTIONS: ActionOption[] = [
  {
    id: "approve",
    label: "Approve & close",
    description: "Accept the submitted resolution and close this incident.",
    icon: CheckCircle2,
    tone: "primary",
    available: (s) => s === "PENDING_SUPERADMIN_APPROVAL",
  },
  {
    id: "reject",
    label: "Reject resolution",
    description: "Send back to the team with a reason to rework.",
    icon: XCircle,
    tone: "danger",
    available: (s) => s === "PENDING_SUPERADMIN_APPROVAL",
  },
  {
    id: "assign",
    label: "Assign team",
    description: "Assign or reassign to a company and user.",
    icon: UserPlus,
    tone: "default",
    available: (s) => s !== "CLOSED",
  },
  {
    id: "severity",
    label: "Change severity",
    description: "Update severity with a documented reason.",
    icon: Gauge,
    tone: "default",
    available: (s) => !["CLOSED", "PENDING_SUPERADMIN_APPROVAL"].includes(s),
  },
  {
    id: "deadline",
    label: "Set deadline",
    description: "Set or update the priority response deadline.",
    icon: Clock,
    tone: "default",
    available: (s) => !["CLOSED", "PENDING_SUPERADMIN_APPROVAL"].includes(s),
  },
  {
    id: "comment",
    label: "Add comment",
    description: "Post a comment or instruction for the assigned team.",
    icon: MessageSquare,
    tone: "default",
    available: (s) => s !== "CLOSED",
  },
  {
    id: "resolve",
    label: "Submit resolution",
    description: "Record root cause, corrective action, and close-out notes.",
    icon: CheckCircle2,
    tone: "primary",
    available: (s) =>
      ["OPEN", "ASSIGNED", "IN_PROGRESS", "REOPENED", "REJECTED_BY_SUPERADMIN"].includes(s),
  },
  {
    id: "escalate",
    label: "Escalate",
    description: "Escalate to NPA or executive management.",
    icon: TrendingUp,
    tone: "default",
    available: (s) => !["CLOSED", "PENDING_SUPERADMIN_APPROVAL", "RESOLVED"].includes(s),
  },
  {
    id: "evidence",
    label: "Request evidence",
    description: "Ask the reporter to provide more photos or documents.",
    icon: FileText,
    tone: "default",
    available: (s) => !["CLOSED", "PENDING_SUPERADMIN_APPROVAL"].includes(s),
  },
  {
    id: "emergency",
    label: "Emergency dispatch",
    description: "Trigger tow truck or other emergency response.",
    icon: Siren,
    tone: "danger",
    available: (s) => !["CLOSED", "PENDING_SUPERADMIN_APPROVAL", "RESOLVED"].includes(s),
  },
  {
    id: "reopen",
    label: "Reopen incident",
    description: "Reopen a closed incident with a reason.",
    icon: RotateCcw,
    tone: "default",
    available: (s) => s === "CLOSED",
  },
];

function DrawerViewTabs({
  view,
  onChange,
  actionsPending,
}: {
  view: DrawerView;
  onChange: (view: DrawerView) => void;
  actionsPending: boolean;
}) {
  return (
    <div className="flex shrink-0 border-b border-gray-200 bg-white px-5">
      {(
        [
          { id: "details" as const, label: "Details" },
          { id: "actions" as const, label: "Take action" },
        ] as const
      ).map((tab) => {
        const active = view === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            disabled={actionsPending && tab.id === "details"}
            onClick={() => onChange(tab.id)}
            className={`-mb-px border-b-2 px-4 py-3 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
              active
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

function ActionChoiceCard({
  option,
  onSelect,
  disabled,
}: {
  option: ActionOption;
  onSelect: () => void;
  disabled: boolean;
}) {
  const Icon = option.icon;
  const toneRing =
    option.tone === "primary"
      ? "hover:border-emerald-300 hover:bg-emerald-50/50"
      : option.tone === "danger"
        ? "hover:border-red-300 hover:bg-red-50/40"
        : "hover:border-gray-300 hover:bg-gray-50";

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      className={`flex w-full items-start gap-3 rounded-xl border border-gray-200 bg-white p-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${toneRing}`}
    >
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
          option.tone === "primary"
            ? "bg-emerald-100 text-emerald-700"
            : option.tone === "danger"
              ? "bg-red-100 text-red-700"
              : "bg-gray-100 text-gray-600"
        }`}
      >
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0">
        <span className="block text-xs font-bold text-gray-900">{option.label}</span>
        <span className="mt-0.5 block text-[11px] leading-snug text-gray-500">
          {option.description}
        </span>
      </span>
    </button>
  );
}

function ActionFormShell({
  title,
  description,
  onBack,
  children,
  primaryLabel,
  onPrimary,
  primaryDisabled,
  primaryTone = "default",
}: {
  title: string;
  description: string;
  onBack: () => void;
  children: ReactNode;
  primaryLabel: string;
  onPrimary: () => void;
  primaryDisabled?: boolean;
  primaryTone?: "default" | "primary" | "danger";
}) {
  const primaryCls =
    primaryTone === "primary"
      ? "bg-emerald-600 text-white hover:bg-emerald-700"
      : primaryTone === "danger"
        ? "border border-red-300 bg-red-50 text-red-800 hover:bg-red-100"
        : "border border-gray-200 bg-white text-gray-800 hover:bg-gray-50";

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600 hover:text-gray-900"
      >
        <ChevronLeft className="h-4 w-4" />
        All actions
      </button>
      <div>
        <h3 className="text-sm font-bold text-gray-900">{title}</h3>
        <p className="mt-1 text-xs text-gray-500">{description}</p>
      </div>
      <div className="rounded-xl border border-gray-200 bg-gray-50/30 p-4">{children}</div>
      <button
        type="button"
        disabled={primaryDisabled}
        onClick={onPrimary}
        className={`w-full rounded-lg px-4 py-2.5 text-xs font-semibold disabled:opacity-50 ${primaryCls}`}
      >
        {primaryLabel}
      </button>
    </div>
  );
}

function IncidentDetailDrawer({
  incidentId,
  onClose,
}: {
  incidentId: string;
  onClose: () => void;
}) {
  const { data: incident, isLoading, refetch } = useIncident(incidentId);
  const { data: companies = [] } = useIncidentAssigneeCompanies();

  const assignIncident = useAssignIncident();
  const setSeverity = useSetIncidentSeverity();
  const setDeadline = useSetIncidentDeadline();
  const addComment = useAddIncidentComment();
  const approveClose = useApproveCloseIncident();
  const rejectResolution = useRejectIncidentResolution();
  const escalateIncident = useEscalateIncident();
  const requestEvidence = useRequestIncidentEvidence();
  const emergencyResponse = useIncidentEmergencyResponse();
  const resolveIncident = useResolveIncident();
  const reopenIncident = useReopenIncident();

  const [companyId, setCompanyId] = useState("");
  const { data: companyUsers = [] } = useIncidentAssigneeUsers(companyId || null);
  const [userId, setUserId] = useState("");
  const [assignNote, setAssignNote] = useState("");
  const [severity, setSeverityValue] = useState<IncidentSeverity>("MEDIUM");
  const [severityReason, setSeverityReason] = useState("");
  const [deadline, setDeadlineValue] = useState("");
  const [commentKind, setCommentKind] = useState<IncidentCommentKind>("COMMENT");
  const [comment, setComment] = useState("");
  const [escalateLevel, setEscalateLevel] = useState<IncidentEscalateLevel>("NPA");
  const [escalateNotes, setEscalateNotes] = useState("");
  const [evidenceMessage, setEvidenceMessage] = useState("");
  const [emergencyNotes, setEmergencyNotes] = useState("");
  const [approveNotes, setApproveNotes] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [rootCause, setRootCause] = useState("");
  const [correctiveAction, setCorrectiveAction] = useState("");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [reopenReason, setReopenReason] = useState("");
  const [drawerView, setDrawerView] = useState<DrawerView>("details");
  const [activeAction, setActiveAction] = useState<IncidentDrawerAction | null>(null);

  useEffect(() => {
    setDrawerView("details");
    setActiveAction(null);
  }, [incidentId]);

  useEffect(() => {
    if (!incident) return;
    setSeverityValue(incident.severity);
    setDeadlineValue(incident.priorityDeadline?.slice(0, 16) ?? "");
    setRootCause(incident.resolution?.rootCause ?? "");
    setCorrectiveAction(incident.resolution?.correctiveAction ?? "");
    setResolutionNotes(incident.resolution?.resolutionNotes ?? "");
    const matchedCompany =
      incident.assignedCompanyId
      ?? companies.find((c) => c.name === incident.assignedTeam)?.id
      ?? "";
    setCompanyId(matchedCompany);
    setUserId(incident.assignedUserId ?? "");
  }, [incident, companies]);

  useEffect(() => {
    if (!userId || companyUsers.some((u) => u.id === userId)) return;
    setUserId("");
  }, [companyId, companyUsers, userId]);

  if (isLoading || !incident) {
    return (
      <>
        <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
        <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[520px] items-center justify-center bg-white shadow-2xl">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      </>
    );
  }

  const activeIncident = incident;

  const showResolutionReview =
    activeIncident.status === "PENDING_SUPERADMIN_APPROVAL"
    || activeIncident.status === "RESOLVED"
    || Boolean(activeIncident.resolution);

  const showFinalDecision = activeIncident.status === "PENDING_SUPERADMIN_APPROVAL";
  const availableActions = INCIDENT_ACTION_OPTIONS.filter((option) =>
    option.available(activeIncident.status),
  );
  const isBusy =
    assignIncident.isPending
    || setSeverity.isPending
    || setDeadline.isPending
    || addComment.isPending
    || approveClose.isPending
    || rejectResolution.isPending
    || escalateIncident.isPending
    || requestEvidence.isPending
    || emergencyResponse.isPending
    || resolveIncident.isPending
    || reopenIncident.isPending;

  function refreshDetail() {
    refetch();
  }

  function handleAssign() {
    if (!companyId || !userId) {
      toast.error("Select a company and assignee user.");
      return;
    }
    assignIncident.mutate(
      {
        id: activeIncident.id,
        payload: {
          assigned_company_id: companyId,
          assigned_user_id: userId,
          note: assignNote.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success("Incident assigned.");
          setAssignNote("");
          setActiveAction(null);
          refreshDetail();
        },
      },
    );
  }

  function handleSeverityUpdate() {
    if (!severityReason.trim()) {
      toast.error("Add a reason for the severity change.");
      return;
    }
    setSeverity.mutate(
      {
        id: activeIncident.id,
        payload: { severity, reason: severityReason.trim() },
      },
      {
        onSuccess: () => {
          toast.success("Severity updated.");
          setSeverityReason("");
          setActiveAction(null);
          refreshDetail();
        },
      },
    );
  }

  function handleDeadlineUpdate() {
    if (!deadline) {
      toast.error("Choose a priority deadline.");
      return;
    }
    setDeadline.mutate(
      {
        id: activeIncident.id,
        payload: { priority_deadline: new Date(deadline).toISOString() },
      },
      {
        onSuccess: () => {
          toast.success("Deadline updated.");
          setActiveAction(null);
          refreshDetail();
        },
      },
    );
  }

  function handleAddComment() {
    if (!comment.trim()) {
      toast.error("Enter a comment or instruction.");
      return;
    }
    addComment.mutate(
      {
        id: activeIncident.id,
        payload: { kind: commentKind, body: comment.trim() },
      },
      {
        onSuccess: () => {
          toast.success(commentKind === "INSTRUCTION" ? "Instruction posted." : "Comment added.");
          setComment("");
          setActiveAction(null);
          refreshDetail();
        },
      },
    );
  }

  function handleApproveClose() {
    approveClose.mutate(
      {
        id: activeIncident.id,
        payload: approveNotes.trim() ? { notes: approveNotes.trim() } : undefined,
      },
      {
        onSuccess: () => {
          toast.success("Resolution approved. Incident closed.");
          onClose();
        },
      },
    );
  }

  function handleReject() {
    if (!rejectReason.trim()) {
      toast.error("Add a rejection reason before reopening.");
      return;
    }
    rejectResolution.mutate(
      { id: activeIncident.id, payload: { reason: rejectReason.trim() } },
      {
        onSuccess: () => {
          toast.success("Resolution rejected. Incident reopened.");
          onClose();
        },
      },
    );
  }

  function handleEscalate() {
    escalateIncident.mutate(
      {
        id: activeIncident.id,
        payload: {
          level: escalateLevel,
          notes: escalateNotes.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success(
            escalateLevel === "NPA" ? "Escalated to NPA." : "Escalated to management.",
          );
          setEscalateNotes("");
          setActiveAction(null);
          refreshDetail();
        },
      },
    );
  }

  function handleRequestEvidence() {
    if (!evidenceMessage.trim()) {
      toast.error("Enter a message for the evidence request.");
      return;
    }
    requestEvidence.mutate(
      { id: activeIncident.id, payload: { message: evidenceMessage.trim() } },
      {
        onSuccess: () => {
          toast.success("Evidence request sent.");
          setEvidenceMessage("");
          setActiveAction(null);
          refreshDetail();
        },
      },
    );
  }

  function handleEmergency() {
    emergencyResponse.mutate(
      {
        id: activeIncident.id,
        payload: {
          action: "DISPATCH_TOW_TRUCK",
          notes: emergencyNotes.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success("Emergency response dispatched.");
          setEmergencyNotes("");
          setActiveAction(null);
          refreshDetail();
        },
      },
    );
  }

  function handleResolve() {
    if (!rootCause.trim() || !correctiveAction.trim() || !resolutionNotes.trim()) {
      toast.error("Fill in root cause, corrective action, and resolution notes.");
      return;
    }
    resolveIncident.mutate(
      {
        id: activeIncident.id,
        payload: {
          root_cause: rootCause.trim(),
          corrective_action: correctiveAction.trim(),
          resolution_notes: resolutionNotes.trim(),
        },
      },
      {
        onSuccess: () => {
          toast.success("Incident marked resolved.");
          setActiveAction(null);
          refreshDetail();
        },
      },
    );
  }

  function handleReopen() {
    if (!reopenReason.trim()) {
      toast.error("Add a reason for reopening.");
      return;
    }
    reopenIncident.mutate(
      { id: activeIncident.id, payload: { reason: reopenReason.trim() } },
      {
        onSuccess: () => {
          toast.success("Incident reopened.");
          setReopenReason("");
          setActiveAction(null);
          refreshDetail();
        },
      },
    );
  }

  const fieldClass = "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs";

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[560px] flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 bg-[#0f1e2e] px-5 py-4">
          <div className="min-w-0">
            <p className="font-mono text-sm font-bold text-white">{incident.referenceId}</p>
            <p className="truncate text-[11px] text-gray-400">{formatIncidentType(incident.type)}</p>
          </div>
          <div className="flex items-center gap-2">
            {showFinalDecision && drawerView === "details" && (
              <button
                type="button"
                onClick={() => setDrawerView("actions")}
                className="hidden rounded-lg bg-violet-500 px-2.5 py-1 text-[10px] font-semibold text-white hover:bg-violet-600 sm:block"
              >
                Needs approval
              </button>
            )}
            <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-white/10">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <DrawerViewTabs
          view={drawerView}
          onChange={(view) => {
            if (isBusy) return;
            setDrawerView(view);
            if (view === "details") setActiveAction(null);
          }}
          actionsPending={isBusy}
        />

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-5">
          {drawerView === "details" ? (
          <div className="space-y-5">
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={incident.status} />
            <SeverityBadge severity={incident.severity} />
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

          {showFinalDecision && (
            <div className="rounded-xl border border-violet-200 bg-violet-50/60 p-4">
              <p className="text-xs font-bold text-violet-900">Your approval is required</p>
              <p className="mt-1 text-[11px] text-violet-800/90">
                Review the resolution above, then use the Take action tab to approve or reject — one step at a time.
              </p>
              <button
                type="button"
                onClick={() => setDrawerView("actions")}
                className="mt-3 w-full rounded-lg bg-violet-600 py-2 text-xs font-semibold text-white hover:bg-violet-700"
              >
                Go to approval actions
              </button>
            </div>
          )}
          </div>
          ) : activeAction === null ? (
          <div className="space-y-4">
            {isBusy && (
              <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Submitting… please wait before starting another action.
              </div>
            )}
            {showFinalDecision && (
              <div className="rounded-xl border border-violet-200 bg-violet-50 px-3 py-2.5 text-[11px] text-violet-900">
                <span className="font-semibold">Pending your sign-off.</span>{" "}
                Start with Approve or Reject — other actions are limited until decided.
              </div>
            )}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                Choose one action
              </p>
              <p className="mt-1 text-[11px] text-gray-500">
                Pick a single step below. You will only see the form for that action.
              </p>
            </div>
            <div className="space-y-2">
              {availableActions.map((option) => (
                <ActionChoiceCard
                  key={option.id}
                  option={option}
                  disabled={isBusy}
                  onSelect={() => setActiveAction(option.id)}
                />
              ))}
            </div>
            {availableActions.length === 0 && (
              <p className="text-center text-sm text-gray-500">No actions available for this status.</p>
            )}
          </div>
          ) : activeAction === "assign" ? (
            <ActionFormShell
              title="Assign team"
              description="Select a company and user. This only updates assignment — nothing else changes."
              onBack={() => setActiveAction(null)}
              primaryLabel="Confirm assignment"
              onPrimary={handleAssign}
              primaryDisabled={isBusy}
              primaryTone="primary"
            >
              <div className="space-y-2">
                <select
                  value={companyId}
                  onChange={(e) => {
                    setCompanyId(e.target.value);
                    setUserId("");
                  }}
                  className={fieldClass}
                >
                  <option value="">Select company…</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                      {c.userType ? ` (${c.userType})` : ""}
                    </option>
                  ))}
                </select>
                <select
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  disabled={!companyId}
                  className={`${fieldClass} disabled:bg-gray-100`}
                >
                  <option value="">Select user…</option>
                  {companyUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} · {u.email}
                    </option>
                  ))}
                </select>
                <input
                  value={assignNote}
                  onChange={(e) => setAssignNote(e.target.value)}
                  placeholder="Assignment note (optional)…"
                  className={fieldClass}
                />
              </div>
            </ActionFormShell>
          ) : activeAction === "severity" ? (
            <ActionFormShell
              title="Change severity"
              description="Severity updates require a reason for the audit trail."
              onBack={() => setActiveAction(null)}
              primaryLabel="Update severity"
              onPrimary={handleSeverityUpdate}
              primaryDisabled={isBusy}
            >
              <div className="space-y-2">
                <select
                  value={severity}
                  onChange={(e) => setSeverityValue(e.target.value as IncidentSeverity)}
                  className={fieldClass}
                >
                  {INCIDENT_SEVERITY_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {formatIncidentSeverity(s)}
                    </option>
                  ))}
                </select>
                <input
                  value={severityReason}
                  onChange={(e) => setSeverityReason(e.target.value)}
                  placeholder="Reason for change…"
                  className={fieldClass}
                />
              </div>
            </ActionFormShell>
          ) : activeAction === "deadline" ? (
            <ActionFormShell
              title="Set priority deadline"
              description="Set when this incident should be resolved by."
              onBack={() => setActiveAction(null)}
              primaryLabel="Save deadline"
              onPrimary={handleDeadlineUpdate}
              primaryDisabled={isBusy}
            >
              <input
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadlineValue(e.target.value)}
                className={fieldClass}
              />
            </ActionFormShell>
          ) : activeAction === "comment" ? (
            <ActionFormShell
              title="Add comment or instruction"
              description="Visible to the assigned team in the incident thread."
              onBack={() => setActiveAction(null)}
              primaryLabel="Post message"
              onPrimary={handleAddComment}
              primaryDisabled={isBusy}
              primaryTone="primary"
            >
              <div className="space-y-2">
                <select
                  value={commentKind}
                  onChange={(e) => setCommentKind(e.target.value as IncidentCommentKind)}
                  className={fieldClass}
                >
                  <option value="COMMENT">Comment</option>
                  <option value="INSTRUCTION">Instruction</option>
                </select>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  className={fieldClass}
                  placeholder="Write your message…"
                />
              </div>
            </ActionFormShell>
          ) : activeAction === "escalate" ? (
            <ActionFormShell
              title="Escalate incident"
              description="Notify NPA or internal management — use when standard handling is insufficient."
              onBack={() => setActiveAction(null)}
              primaryLabel="Confirm escalation"
              onPrimary={handleEscalate}
              primaryDisabled={isBusy}
            >
              <div className="space-y-2">
                <select
                  value={escalateLevel}
                  onChange={(e) => setEscalateLevel(e.target.value as IncidentEscalateLevel)}
                  className={fieldClass}
                >
                  <option value="NPA">NPA</option>
                  <option value="MANAGEMENT">Management</option>
                </select>
                <textarea
                  value={escalateNotes}
                  onChange={(e) => setEscalateNotes(e.target.value)}
                  rows={3}
                  placeholder="Escalation notes (optional)…"
                  className={fieldClass}
                />
              </div>
            </ActionFormShell>
          ) : activeAction === "evidence" ? (
            <ActionFormShell
              title="Request evidence"
              description="Send a message asking the reporter for additional proof."
              onBack={() => setActiveAction(null)}
              primaryLabel="Send request"
              onPrimary={handleRequestEvidence}
              primaryDisabled={isBusy}
            >
              <textarea
                value={evidenceMessage}
                onChange={(e) => setEvidenceMessage(e.target.value)}
                rows={4}
                placeholder="What do you need from the reporter?"
                className={fieldClass}
              />
            </ActionFormShell>
          ) : activeAction === "emergency" ? (
            <ActionFormShell
              title="Emergency dispatch"
              description="Triggers tow truck dispatch. Use only for urgent field response."
              onBack={() => setActiveAction(null)}
              primaryLabel="Dispatch tow truck"
              onPrimary={handleEmergency}
              primaryDisabled={isBusy}
              primaryTone="danger"
            >
              <textarea
                value={emergencyNotes}
                onChange={(e) => setEmergencyNotes(e.target.value)}
                rows={3}
                placeholder="Dispatch notes (optional)…"
                className={fieldClass}
              />
            </ActionFormShell>
          ) : activeAction === "resolve" ? (
            <ActionFormShell
              title="Submit resolution"
              description="Complete all fields before marking this incident resolved."
              onBack={() => setActiveAction(null)}
              primaryLabel="Submit resolution"
              onPrimary={handleResolve}
              primaryDisabled={isBusy}
              primaryTone="primary"
            >
              <div className="space-y-2">
                <textarea
                  value={rootCause}
                  onChange={(e) => setRootCause(e.target.value)}
                  rows={2}
                  placeholder="Root cause…"
                  className={fieldClass}
                />
                <textarea
                  value={correctiveAction}
                  onChange={(e) => setCorrectiveAction(e.target.value)}
                  rows={2}
                  placeholder="Corrective action…"
                  className={fieldClass}
                />
                <textarea
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  rows={2}
                  placeholder="Resolution notes…"
                  className={fieldClass}
                />
              </div>
            </ActionFormShell>
          ) : activeAction === "reopen" ? (
            <ActionFormShell
              title="Reopen incident"
              description="Reopens a closed incident so the team can continue work."
              onBack={() => setActiveAction(null)}
              primaryLabel="Reopen incident"
              onPrimary={handleReopen}
              primaryDisabled={isBusy}
            >
              <textarea
                value={reopenReason}
                onChange={(e) => setReopenReason(e.target.value)}
                rows={3}
                placeholder="Reason for reopening…"
                className={fieldClass}
              />
            </ActionFormShell>
          ) : activeAction === "approve" ? (
            <ActionFormShell
              title="Approve & close"
              description="Accept the submitted resolution. This closes the incident."
              onBack={() => setActiveAction(null)}
              primaryLabel="Approve and close"
              onPrimary={handleApproveClose}
              primaryDisabled={isBusy}
              primaryTone="primary"
            >
              <textarea
                value={approveNotes}
                onChange={(e) => setApproveNotes(e.target.value)}
                rows={3}
                placeholder="Approval notes (optional)…"
                className={fieldClass}
              />
            </ActionFormShell>
          ) : activeAction === "reject" ? (
            <ActionFormShell
              title="Reject resolution"
              description="Send back to the team. A reason is required."
              onBack={() => setActiveAction(null)}
              primaryLabel="Reject and reopen"
              onPrimary={handleReject}
              primaryDisabled={isBusy}
              primaryTone="danger"
            >
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
                placeholder="Explain what needs to be corrected…"
                className={fieldClass}
              />
            </ActionFormShell>
          ) : null}
        </div>
      </div>
    </>
  );
}

export function IncidentReportsPage() {
  const isSuperAdmin = useAuthStore((s) => s.user?.is_super_admin ?? false);
  const { search, debouncedSearch, setSearch } = useDebouncedSearch("");
  const [typeFilter, setTypeFilter] = useState<IncidentType | "All">("All");
  const [severityFilter, setSeverityFilter] = useState<IncidentSeverity | "All">("All");
  const [statusFilter, setStatusFilter] = useState<IncidentStatus | "All">("All");
  const [locationFilter, setLocationFilter] = useState<string>("All");
  const [showFilters, setShowFilters] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);

  const listParams = useMemo(
    () => ({
      search: debouncedSearch.trim() || undefined,
      type: typeFilter,
      severity: severityFilter,
      status: statusFilter,
      location_kind:
        locationFilter === "All"
          ? ("All" as const)
          : (locationFilter as IncidentReport["locationKind"]),
      limit: 100,
    }),
    [debouncedSearch, typeFilter, severityFilter, statusFilter, locationFilter],
  );

  const {
    data: listData,
    isLoading,
    isError,
    refetch,
  } = useIncidents(listParams, isSuperAdmin);
  const {
    data: summaryData,
    dataUpdatedAt,
    isFetching: summaryFetching,
  } = useIncidentsSummary(isSuperAdmin);

  const incidents = listData?.data ?? [];
  const filtered = incidents;

  const stats = summaryData ?? {
    open: 0,
    pendingApproval: 0,
    resolved: 0,
    total: listData?.meta.total ?? 0,
    overdue: 0,
    byStatus: [],
    openBySeverity: [],
  };

  const lastUpdated = useMemo(
    () => new Date(dataUpdatedAt || Date.now()),
    [dataUpdatedAt],
  );

  const summaryCards = useMemo((): TrafficSummaryKpi[] => {
    return [
      {
        label: "Open",
        value: stats.open,
        color: "text-red-400",
        bg: "bg-red-400/10",
        Icon: AlertCircle,
      },
      {
        label: "Pending approval",
        value: stats.pendingApproval,
        color: "text-violet-400",
        bg: "bg-violet-400/10",
        Icon: Shield,
      },
      {
        label: "Resolved",
        value: stats.resolved,
        color: "text-emerald-400",
        bg: "bg-emerald-400/10",
        Icon: CheckCircle2,
      },
      {
        label: "Overdue",
        value: stats.overdue,
        color: "text-amber-400",
        bg: "bg-amber-400/10",
        Icon: Clock,
      },
      {
        label: "Total reported",
        value: stats.total,
        color: "text-cyan-400",
        bg: "bg-cyan-400/10",
        Icon: FileText,
      },
    ];
  }, [stats]);

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
              <h1 className="text-xl font-bold text-gray-900">Incident Reports</h1>
              <p className="mt-0.5 max-w-2xl text-sm text-gray-500">
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

      {isError && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Failed to load incident reports.
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            className="rounded-lg border border-red-300 bg-white px-3 py-1 text-xs font-semibold"
          >
            Retry
          </button>
        </div>
      )}

      <TrafficSummaryPanel
        title="Incident reports — at a glance"
        subtitle={
          summaryFetching && !isLoading
            ? "Refreshing incident summary…"
            : "Counts from the incidents summary API"
        }
        lastUpdated={lastUpdated}
        cards={summaryCards}
        gridClassName="grid-cols-2 sm:grid-cols-3 xl:grid-cols-5"
        footer={
          summaryData && summaryData.openBySeverity.some((row) => row.count > 0) ? (
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                Open incidents by severity
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {summaryData.openBySeverity.map((row) => (
                  <div
                    key={row.severity}
                    className="rounded-xl bg-white/5 px-4 py-3 transition-colors hover:bg-white/10"
                  >
                    <p className="text-lg font-bold tabular-nums text-white">{row.count}</p>
                    <p className="truncate text-[10px] font-medium uppercase tracking-wider text-gray-500">
                      {formatIncidentSeverity(row.severity)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : undefined
        }
      />

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
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-emerald-500" />
                    <p className="mt-2 text-sm text-gray-400">Loading incident reports…</p>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
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
          Showing {filtered.length} of {stats.total} reported incidents
        </p>
      </div>

      {detailId && (
        <IncidentDetailDrawer
          incidentId={detailId}
          onClose={() => setDetailId(null)}
        />
      )}
    </div>
  );
}

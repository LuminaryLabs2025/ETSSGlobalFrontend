"use client";

import { useState, useMemo } from "react";
import {
  Gavel,
  Search,
  Download,
  Filter,
  ChevronDown,
  ChevronRight as Chevron,
  X,
  Clock,
  CheckCircle2,
  XCircle,
  Archive,
  Eye,
  AlertTriangle,
  FileText,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  RefreshCw,
  Plus,
  Edit2,
  Scale,
  ReceiptText,
  Shield,
  DollarSign,
  TrendingUp,
  Hash,
  CheckCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { usePenalties } from "@/hooks/penalties/usePenalties";
import { usePenaltiesSummary } from "@/hooks/penalties/usePenaltiesSummary";
import { useCreatePenalty, useEditPenalty, useArchivePenalty, useExportPenalties } from "@/hooks/penalties/usePenaltyActions";
import { useIssuedFines } from "@/hooks/issued-fines/useIssuedFines";
import { useIssuedFinesSummary } from "@/hooks/issued-fines/useIssuedFinesSummary";
import { useIssuedFine } from "@/hooks/issued-fines/useIssuedFine";
import { useExportIssuedFines } from "@/hooks/issued-fines/useIssuedFinesExport";
import { useDisputes } from "@/hooks/disputes/useDisputes";
import { useDisputesSummary } from "@/hooks/disputes/useDisputesSummary";
import { useDispute } from "@/hooks/disputes/useDispute";
import { useResolveDispute, useExportDisputes } from "@/hooks/disputes/useDisputeActions";
import { TableActionsDropdown } from "@/components/dashboard/TableActionsDropdown";
import type {
  PenaltyDefinition,
  PenaltyStatus,
  FineDispute,
  DisputeStatus,
  ResolutionOutcome,
  PenaltiesSummary,
  IssuedFinesSummary,
  DisputesSummary,
} from "@/types/penalties.types";

// ─── Constants ───
const PAGE_SIZE = 10;

type TabId = "penalties" | "issued" | "disputes";

const STATUS_FILTER_OPTIONS  = ["All", "ACTIVE", "INACTIVE", "ARCHIVED"];
const DISPUTE_STATUS_OPTIONS = ["All", "PENDING_REVIEW", "UNDER_NPA_REVIEW", "RESOLVED", "REJECTED"];
const OUTCOME_OPTIONS        = ["All", "FINE_UPHELD", "FINE_WAIVED", "FINE_ADJUSTED"];

// ─── Helpers ───
function formatTimestamp(ts: string) {
  return new Date(ts).toLocaleString("en-NG", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
}

function formatDate(ts: string) {
  return new Date(ts).toLocaleDateString("en-NG", { day: "2-digit", month: "short", year: "numeric" });
}

function naira(n: number) {
  return `₦${n.toLocaleString()}`;
}

function formatLabel(s: string) {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// ─── Badges ───
function PenaltyStatusBadge({ status }: { status: PenaltyStatus }) {
  const map: Record<PenaltyStatus, string> = {
    ACTIVE:   "bg-emerald-50 text-emerald-700 border-emerald-200",
    INACTIVE: "bg-gray-100 text-gray-500 border-gray-200",
    ARCHIVED: "bg-orange-50 text-orange-700 border-orange-200",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${map[status]}`}>
      {formatLabel(status)}
    </span>
  );
}

function FineBadge({ status }: { status: "ACCEPTED" | "DISPUTED" }) {
  if (status === "ACCEPTED")
    return <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700"><CheckCircle2 className="h-3 w-3" />Accepted</span>;
  return <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-700"><AlertTriangle className="h-3 w-3" />Disputed</span>;
}

function BookingStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    AVAILABLE:    "bg-emerald-50 text-emerald-700 border-emerald-200",
    ON_TRIP:      "bg-blue-50 text-blue-700 border-blue-200",
    IN_FACILITY:  "bg-indigo-50 text-indigo-700 border-indigo-200",
    MATCHED:      "bg-cyan-50 text-cyan-700 border-cyan-200",
    IN_PREGATE:   "bg-violet-50 text-violet-700 border-violet-200",
    IN_TERMINAL:  "bg-purple-50 text-purple-700 border-purple-200",
    LEFT_TERMINAL:"bg-teal-50 text-teal-700 border-teal-200",
    FLAGGED:      "bg-red-50 text-red-700 border-red-200",
    LIVE:         "bg-emerald-50 text-emerald-700 border-emerald-200",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap ${map[status] ?? "bg-gray-100 text-gray-500 border-gray-200"}`}>
      {formatLabel(status)}
    </span>
  );
}

function CategoryBadge({ cat }: { cat: string }) {
  const map: Record<string, string> = {
    IMPORT: "bg-blue-50 text-blue-700",
    EXPORT: "bg-emerald-50 text-emerald-700",
    EMPTY:  "bg-amber-50 text-amber-700",
  };
  return <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium ${map[cat] ?? "bg-gray-50 text-gray-500"}`}>{cat}</span>;
}

function DisputeStatusBadge({ status }: { status: DisputeStatus }) {
  const map: Record<DisputeStatus, string> = {
    PENDING_REVIEW:   "bg-amber-50 text-amber-700 border-amber-200",
    UNDER_NPA_REVIEW: "bg-blue-50 text-blue-700 border-blue-200",
    RESOLVED:         "bg-emerald-50 text-emerald-700 border-emerald-200",
    REJECTED:         "bg-red-50 text-red-700 border-red-200",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap ${map[status]}`}>
      {formatLabel(status)}
    </span>
  );
}

function ResolutionBadge({ outcome }: { outcome?: ResolutionOutcome }) {
  if (!outcome) return <span className="text-xs text-gray-400">—</span>;
  const map: Record<ResolutionOutcome, string> = {
    FINE_UPHELD:   "bg-red-50 text-red-700 border-red-200",
    FINE_WAIVED:   "bg-emerald-50 text-emerald-700 border-emerald-200",
    FINE_ADJUSTED: "bg-blue-50 text-blue-700 border-blue-200",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${map[outcome]}`}>
      {formatLabel(outcome)}
    </span>
  );
}

// ─── Sort Icon ───
function SortIcon({ field, sortField, sortDir }: { field: string; sortField: string | null; sortDir: "asc" | "desc" }) {
  if (sortField !== field) return <ArrowUpDown className="ml-1 h-3 w-3 text-gray-300" />;
  return sortDir === "asc" ? <ArrowUp className="ml-1 h-3 w-3 text-emerald-600" /> : <ArrowDown className="ml-1 h-3 w-3 text-emerald-600" />;
}

// ─── Confirm Dialog ───
function ConfirmDialog({ title, message, confirmLabel, danger, onConfirm, onCancel, isPending }: {
  title: string; message: string; confirmLabel: string; danger?: boolean;
  onConfirm: () => void; onCancel: () => void; isPending?: boolean;
}) {
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onCancel} />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl border border-gray-200 bg-white p-6 shadow-2xl">
        <h3 className="text-sm font-bold text-gray-900">{title}</h3>
        <p className="mt-2 text-sm text-gray-600">{message}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onCancel} disabled={isPending} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50">Cancel</button>
          <button onClick={onConfirm} disabled={isPending} className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50 ${danger ? "bg-red-600 hover:bg-red-700" : "bg-emerald-600 hover:bg-emerald-700"}`}>
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Penalty Form Modal ───
function PenaltyFormModal({ initialData, onSave, onCancel, isSaving }: {
  initialData?: PenaltyDefinition;
  onSave: (data: { name: string; description: string; fine_amount: number; status: PenaltyStatus }) => void;
  onCancel: () => void;
  isSaving?: boolean;
}) {
  const isEdit = Boolean(initialData);
  const [name, setName]             = useState(initialData?.name ?? "");
  const [description, setDesc]      = useState(initialData?.description ?? "");
  const [fineAmount, setFineAmount] = useState(initialData?.fine_amount?.toString() ?? "");
  const [status, setStatus]         = useState<PenaltyStatus>(initialData?.status ?? "ACTIVE");
  const [errors, setErrors]         = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!name.trim())        e.name        = "Penalty name is required.";
    if (!description.trim()) e.description = "Description is required.";
    if (!fineAmount || isNaN(Number(fineAmount)) || Number(fineAmount) <= 0) e.fine = "A valid fine amount (> 0) is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onCancel} />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-gray-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0f1e2e]">
              <Gavel className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">{isEdit ? "Edit Penalty" : "Add New Penalty"}</h2>
              <p className="text-xs text-gray-500">{isEdit ? "Update penalty details" : "Create a new penalty definition"}</p>
            </div>
          </div>
          <button onClick={onCancel} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"><X className="h-4 w-4" /></button>
        </div>
        <div className="space-y-4 px-6 py-5">
          <div>
            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-gray-500">Penalty Name <span className="text-red-500">*</span></label>
            <input value={name} onChange={(e) => setName(e.target.value)}
              className={`w-full rounded-lg border bg-gray-50 px-3 py-2 text-sm outline-none focus:border-emerald-300 focus:bg-white focus:ring-2 focus:ring-emerald-100 ${errors.name ? "border-red-300" : "border-gray-200"}`}
              placeholder="e.g. Overstay" />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-gray-500">Description <span className="text-red-500">*</span></label>
            <textarea value={description} onChange={(e) => setDesc(e.target.value)} rows={3}
              className={`w-full resize-none rounded-lg border bg-gray-50 px-3 py-2 text-sm outline-none focus:border-emerald-300 focus:bg-white focus:ring-2 focus:ring-emerald-100 ${errors.description ? "border-red-300" : "border-gray-200"}`}
              placeholder="Provide a clear description of this penalty..." />
            {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-gray-500">Fine Amount (₦) <span className="text-red-500">*</span></label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">₦</span>
                <input type="number" min={1} value={fineAmount} onChange={(e) => setFineAmount(e.target.value)}
                  className={`w-full rounded-lg border bg-gray-50 py-2 pl-7 pr-3 text-sm outline-none focus:border-emerald-300 focus:bg-white focus:ring-2 focus:ring-emerald-100 ${errors.fine ? "border-red-300" : "border-gray-200"}`}
                  placeholder="0" />
              </div>
              {errors.fine && <p className="mt-1 text-xs text-red-500">{errors.fine}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-gray-500">Status</label>
              <div className="relative">
                <select value={status} onChange={(e) => setStatus(e.target.value as PenaltyStatus)}
                  className="w-full appearance-none rounded-lg border border-gray-200 bg-gray-50 py-2 pl-3 pr-8 text-sm outline-none focus:border-emerald-300 focus:bg-white focus:ring-2 focus:ring-emerald-100">
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-gray-100 px-6 py-4">
          <button onClick={onCancel} disabled={isSaving} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50">Cancel</button>
          <button onClick={() => { if (validate()) onSave({ name: name.trim(), description: description.trim(), fine_amount: Number(fineAmount), status }); }} disabled={isSaving}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50">
            {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {isEdit ? <><Edit2 className="h-3.5 w-3.5" />Save Changes</> : <><Plus className="h-3.5 w-3.5" />Add Penalty</>}
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Summary Panels ───
function PenaltiesSummaryPanel({ summary, isLoading }: { summary?: PenaltiesSummary; isLoading?: boolean }) {
  const s = summary ?? { total: 0, active: 0, inactive: 0, archived: 0, avg_fine_amount: 0 };
  const cards = [
    { label: "Total Penalties", value: isLoading ? "—" : s.total,                    color: "text-blue-400",    bg: "bg-blue-400/10",    Icon: Gavel },
    { label: "Active",          value: isLoading ? "—" : s.active,                   color: "text-emerald-400", bg: "bg-emerald-400/10", Icon: CheckCircle2 },
    { label: "Inactive",        value: isLoading ? "—" : s.inactive,                 color: "text-gray-400",    bg: "bg-gray-400/10",    Icon: XCircle },
    { label: "Archived",        value: isLoading ? "—" : s.archived,                 color: "text-orange-400",  bg: "bg-orange-400/10",  Icon: Archive },
    { label: "Avg Fine Amount", value: isLoading ? "—" : naira(s.avg_fine_amount),   color: "text-amber-400",   bg: "bg-amber-400/10",   Icon: TrendingUp },
  ];
  return (
    <div className="rounded-2xl bg-[#0f1e2e] p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Penalties &amp; Fines Management</h1>
          <p className="text-xs text-gray-400">All registered penalty definitions on the ETSS-Nigeria platform</p>
        </div>
        <div className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">Live</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {cards.map((card) => (
          <div key={card.label} className="rounded-xl bg-white/5 p-4 transition-colors hover:bg-white/10">
            <div className="mb-2"><div className={`inline-flex rounded-lg p-1.5 ${card.bg}`}><card.Icon className={`h-4 w-4 ${card.color}`} /></div></div>
            <p className="text-2xl font-bold text-white">{card.value}</p>
            <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-gray-500">{card.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function IssuedFinesSummaryPanel({ summary, isLoading }: { summary?: IssuedFinesSummary; isLoading?: boolean }) {
  const s = summary ?? { total: 0, accepted: 0, disputed: 0, total_amount: 0, accepted_amount: 0, disputed_amount: 0 };
  const cards = [
    { label: "Total Issued Fines", value: isLoading ? "—" : s.total,                        color: "text-blue-400",    bg: "bg-blue-400/10",    Icon: ReceiptText },
    { label: "Accepted",           value: isLoading ? "—" : s.accepted,                     color: "text-emerald-400", bg: "bg-emerald-400/10", Icon: CheckCircle2 },
    { label: "Disputed",           value: isLoading ? "—" : s.disputed,                     color: "text-red-400",     bg: "bg-red-400/10",     Icon: AlertTriangle },
    { label: "Total Fine Value",   value: isLoading ? "—" : naira(s.total_amount),          color: "text-amber-400",   bg: "bg-amber-400/10",   Icon: DollarSign },
    { label: "Fines Paid",         value: isLoading ? "—" : naira(s.accepted_amount),       color: "text-emerald-400", bg: "bg-emerald-400/10", Icon: TrendingUp },
    { label: "Fines Disputed",     value: isLoading ? "—" : naira(s.disputed_amount),       color: "text-red-400",     bg: "bg-red-400/10",     Icon: Scale },
  ];
  return (
    <div className="rounded-2xl bg-[#0f1e2e] p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Issued Fines Overview</h1>
          <p className="text-xs text-gray-400">All fines issued to transporters on the ETSS-Nigeria platform</p>
        </div>
        <div className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">Live</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {cards.map((card) => (
          <div key={card.label} className="rounded-xl bg-white/5 p-4 transition-colors hover:bg-white/10">
            <div className="mb-2"><div className={`inline-flex rounded-lg p-1.5 ${card.bg}`}><card.Icon className={`h-4 w-4 ${card.color}`} /></div></div>
            <p className="text-2xl font-bold text-white">{card.value}</p>
            <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-gray-500">{card.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function DisputesSummaryPanel({ summary, isLoading }: { summary?: DisputesSummary; isLoading?: boolean }) {
  const s = summary ?? {
    total: 0, pending_review: 0, under_npa_review: 0, resolved: 0, rejected: 0,
    fine_upheld: 0, fine_waived: 0, fine_adjusted: 0,
    total_amount_in_dispute: 0, total_amount_waived_adjusted: 0,
  };
  const kpis = [
    { label: "Total Disputes",    value: isLoading ? "—" : s.total,                               color: "text-blue-400",    bg: "bg-blue-400/10",    Icon: Scale },
    { label: "Pending Review",    value: isLoading ? "—" : s.pending_review,                      color: "text-amber-400",   bg: "bg-amber-400/10",   Icon: Clock },
    { label: "Under NPA Review",  value: isLoading ? "—" : s.under_npa_review,                   color: "text-blue-400",    bg: "bg-blue-400/10",    Icon: Shield },
    { label: "Resolved",          value: isLoading ? "—" : s.resolved,                            color: "text-emerald-400", bg: "bg-emerald-400/10", Icon: CheckCircle2 },
    { label: "Rejected",          value: isLoading ? "—" : s.rejected,                            color: "text-red-400",     bg: "bg-red-400/10",     Icon: XCircle },
  ];
  const outcomeBars = [
    { label: "Fine Upheld",   value: s.fine_upheld,   barCls: "bg-red-500",     textCls: "text-red-300" },
    { label: "Fine Waived",   value: s.fine_waived,   barCls: "bg-emerald-500", textCls: "text-emerald-300" },
    { label: "Fine Adjusted", value: s.fine_adjusted, barCls: "bg-blue-500",    textCls: "text-blue-300" },
  ];
  const totalOutcomes = s.fine_upheld + s.fine_waived + s.fine_adjusted || 1;
  return (
    <div className="rounded-2xl bg-[#0f1e2e] p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Fine Disputes Management</h1>
          <p className="text-xs text-gray-400">Monitor and resolve transporter fine disputes on the ETSS-Nigeria platform</p>
        </div>
        <div className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">Live</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {kpis.map((card) => (
          <div key={card.label} className="rounded-xl bg-white/5 p-4 transition-colors hover:bg-white/10">
            <div className="mb-2"><div className={`inline-flex rounded-lg p-1.5 ${card.bg}`}><card.Icon className={`h-4 w-4 ${card.color}`} /></div></div>
            <p className="text-2xl font-bold text-white">{card.value}</p>
            <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-gray-500">{card.label}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Resolution outcomes */}
        <div className="rounded-xl bg-white/5 p-4">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Resolution Outcomes</p>
          <div className="space-y-2">
            {outcomeBars.map((o) => (
              <div key={o.label} className="flex items-center gap-2">
                <span className="flex-1 text-xs text-gray-300">{o.label}</span>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-24 overflow-hidden rounded-full bg-white/10">
                    <div className={`h-full rounded-full ${o.barCls}`} style={{ width: `${(o.value / totalOutcomes) * 100}%` }} />
                  </div>
                  <span className={`w-5 text-right text-xs font-bold ${o.textCls}`}>{o.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Amounts */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-white/5 p-4">
            <div className="mb-1 inline-flex rounded-lg bg-amber-400/10 p-1.5"><DollarSign className="h-4 w-4 text-amber-400" /></div>
            <p className="text-lg font-bold text-white">{isLoading ? "—" : naira(s.total_amount_in_dispute)}</p>
            <p className="text-[11px] font-medium uppercase tracking-wider text-gray-500">In Dispute</p>
          </div>
          <div className="rounded-xl bg-white/5 p-4">
            <div className="mb-1 inline-flex rounded-lg bg-emerald-400/10 p-1.5"><TrendingUp className="h-4 w-4 text-emerald-400" /></div>
            <p className="text-lg font-bold text-white">{isLoading ? "—" : naira(s.total_amount_waived_adjusted)}</p>
            <p className="text-[11px] font-medium uppercase tracking-wider text-gray-500">Waived / Adjusted</p>
          </div>
        </div>
      </div>
    </div>
  );
}

type PenSortField = "name" | "fine_amount" | "created_at";

function buildPenSortParam(field: PenSortField, dir: "asc" | "desc"): string {
  const prefix = dir === "desc" ? "-" : "";
  return `${prefix}${field}`;
}

// ─── Main Page ───
export default function PenaltiesPage() {
  const [activeTab, setActiveTab] = useState<TabId>("penalties");

  // Penalties tab state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPenalty, setEditingPenalty] = useState<PenaltyDefinition | null>(null);
  const [archivingPenalty, setArchivingPenalty] = useState<PenaltyDefinition | null>(null);
  const { search: penSearch, setSearch: setPenSearch, debouncedSearch: penDebouncedSearch, resetSearch: resetPenSearch } = useDebouncedSearch("", () => setPenPage(1));
  const [penStatusFilter, setPenStatusFilter] = useState("All");
  const [penShowFilters, setPenShowFilters] = useState(false);
  const [penSortField, setPenSortField] = useState<PenSortField>("created_at");
  const [penSortDir, setPenSortDir] = useState<"asc" | "desc">("desc");
  const [penSortActive, setPenSortActive] = useState(false);
  const [penPage, setPenPage] = useState(1);

  // Issued fines tab state
  const [selectedFineId, setSelectedFineId] = useState<string | null>(null);
  const [finePenaltyFilter, setFinePenaltyFilter] = useState("All");
  const [fineTerminalFilter, setFineTerminalFilter] = useState("All");
  const [fineShowFilters, setFineShowFilters] = useState(false);
  const [finePage, setFinePage] = useState(1);

  // Disputes tab state
  const [selectedDisputeId, setSelectedDisputeId] = useState<string | null>(null);
  const [resolvingDispute, setResolvingDispute] = useState<FineDispute | null>(null);
  const { search: dispSearch, setSearch: setDispSearch, debouncedSearch: dispDebouncedSearch, resetSearch: resetDispSearch } = useDebouncedSearch("", () => setDispPage(1));
  const [dispStatusFilter, setDispStatusFilter] = useState("All");
  const [dispOutcomeFilter, setDispOutcomeFilter] = useState("All");
  const [dispShowFilters, setDispShowFilters] = useState(false);
  const [dispPage, setDispPage] = useState(1);
  const [newDisputeStatus, setNewDisputeStatus] = useState<DisputeStatus>("PENDING_REVIEW");
  const [newOutcome, setNewOutcome] = useState<ResolutionOutcome | "">("");

  const penListParams = {
    page: penPage,
    limit: PAGE_SIZE,
    search: penDebouncedSearch || undefined,
    status: penStatusFilter !== "All" ? penStatusFilter : undefined,
    sort: penSortActive ? buildPenSortParam(penSortField, penSortDir) : undefined,
  };

  const fineListParams = {
    page: finePage,
    limit: PAGE_SIZE,
    penalty_name: finePenaltyFilter !== "All" ? finePenaltyFilter : undefined,
    terminal: fineTerminalFilter !== "All" ? fineTerminalFilter : undefined,
  };

  const dispListParams = {
    page: dispPage,
    limit: PAGE_SIZE,
    search: dispDebouncedSearch || undefined,
    dispute_status: dispStatusFilter !== "All" ? dispStatusFilter : undefined,
    resolution_outcome: dispOutcomeFilter !== "All" ? dispOutcomeFilter : undefined,
  };

  const { data: penaltiesSummary, isLoading: penSummaryLoading, dataUpdatedAt: penSummaryUpdatedAt } = usePenaltiesSummary();
  const { data: issuedSummary, isLoading: issuedSummaryLoading, dataUpdatedAt: issuedSummaryUpdatedAt } = useIssuedFinesSummary();
  const { data: disputesSummary, isLoading: dispSummaryLoading, dataUpdatedAt: dispSummaryUpdatedAt } = useDisputesSummary();

  const { data: penaltiesData, isLoading: penListLoading, isError: penListError, dataUpdatedAt: penListUpdatedAt } = usePenalties(penListParams, activeTab === "penalties");
  const { data: issuedData, isLoading: fineListLoading, isError: fineListError, dataUpdatedAt: fineListUpdatedAt } = useIssuedFines(fineListParams, activeTab === "issued");
  const { data: disputesData, isLoading: dispListLoading, isError: dispListError, dataUpdatedAt: dispListUpdatedAt } = useDisputes(dispListParams, activeTab === "disputes");

  const { data: issuedOptionsData } = useIssuedFines({ page: 1, limit: 100 }, activeTab === "issued");
  const { data: selectedFine, isLoading: fineDetailLoading } = useIssuedFine(selectedFineId, Boolean(selectedFineId));
  const { data: selectedDispute, isLoading: disputeDetailLoading } = useDispute(selectedDisputeId, Boolean(selectedDisputeId));

  const createPenalty = useCreatePenalty();
  const editPenalty = useEditPenalty();
  const archivePenalty = useArchivePenalty();
  const exportPenalties = useExportPenalties();
  const exportIssuedFines = useExportIssuedFines();
  const resolveDispute = useResolveDispute();
  const exportDisputes = useExportDisputes();

  const penPaged = penaltiesData?.data ?? [];
  const penMeta = penaltiesData?.meta;
  const penTotalPages = penMeta?.total_pages ?? 1;
  const penTotalCount = penMeta?.total ?? 0;
  const penHasFilters = Boolean(penDebouncedSearch || penStatusFilter !== "All");

  const finePaged = issuedData?.data ?? [];
  const fineMeta = issuedData?.meta;
  const fineTotalPages = fineMeta?.total_pages ?? 1;
  const fineTotalCount = fineMeta?.total ?? 0;
  const fineHasFilters = finePenaltyFilter !== "All" || fineTerminalFilter !== "All";

  const dispPaged = disputesData?.data ?? [];
  const dispMeta = disputesData?.meta;
  const dispTotalPages = dispMeta?.total_pages ?? 1;
  const dispTotalCount = dispMeta?.total ?? 0;
  const dispHasFilters = Boolean(dispDebouncedSearch || dispStatusFilter !== "All" || dispOutcomeFilter !== "All");

  const terminalOptions = useMemo(
    () => [...new Set((issuedOptionsData?.data ?? []).map((f) => f.booking.terminal_destination))],
    [issuedOptionsData],
  );
  const penaltyNameOptions = useMemo(
    () => [...new Set((issuedOptionsData?.data ?? []).map((f) => f.penalty_name))],
    [issuedOptionsData],
  );

  const lastRefresh = formatTimestamp(
    new Date(
      activeTab === "penalties"
        ? (penListUpdatedAt || penSummaryUpdatedAt || Date.now())
        : activeTab === "issued"
          ? (fineListUpdatedAt || issuedSummaryUpdatedAt || Date.now())
          : (dispListUpdatedAt || dispSummaryUpdatedAt || Date.now())
    ).toISOString()
  );

  function switchTab(tab: TabId) {
    setActiveTab(tab);
    resetPenSearch();
    resetDispSearch();
    setPenPage(1);
    setFinePage(1);
    setDispPage(1);
    setPenShowFilters(false);
    setFineShowFilters(false);
    setDispShowFilters(false);
  }

  function handleAddPenalty(data: { name: string; description: string; fine_amount: number; status: PenaltyStatus }) {
    createPenalty.mutate(data, { onSuccess: () => setShowAddModal(false) });
  }

  function handleEditPenalty(data: { name: string; description: string; fine_amount: number; status: PenaltyStatus }) {
    if (!editingPenalty) return;
    editPenalty.mutate({ id: editingPenalty.id, payload: data }, { onSuccess: () => setEditingPenalty(null) });
  }

  function handleArchivePenalty() {
    if (!archivingPenalty) return;
    archivePenalty.mutate(archivingPenalty.id, { onSuccess: () => setArchivingPenalty(null) });
  }

  function handlePenSort(field: PenSortField) {
    setPenSortActive(true);
    if (penSortField === field) setPenSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setPenSortField(field); setPenSortDir("asc"); }
    setPenPage(1);
  }

  function clearPenFilters() {
    resetPenSearch();
    setPenStatusFilter("All");
    setPenSortActive(false);
    setPenPage(1);
  }

  function clearFineFilters() {
    setFinePenaltyFilter("All");
    setFineTerminalFilter("All");
    setFinePage(1);
  }

  function clearDispFilters() {
    resetDispSearch();
    setDispStatusFilter("All");
    setDispOutcomeFilter("All");
    setDispPage(1);
  }

  function handleUpdateDisputeStatus() {
    if (!resolvingDispute) return;
    const outcome = (newDisputeStatus === "RESOLVED" || newDisputeStatus === "REJECTED") && newOutcome
      ? (newOutcome as ResolutionOutcome)
      : undefined;
    resolveDispute.mutate(
      {
        id: resolvingDispute.id,
        payload: {
          dispute_status: newDisputeStatus,
          resolution_outcome: outcome,
          adjusted_amount: outcome === "FINE_ADJUSTED" ? resolvingDispute.adjusted_amount ?? 0 : 0,
          notes: "Status updated by NPA user.",
        },
      },
      {
        onSuccess: () => {
          if (selectedDisputeId === resolvingDispute.id) setSelectedDisputeId(null);
          setResolvingDispute(null);
        },
      },
    );
  }

  function PenTH({ field, children }: { field: PenSortField; children: React.ReactNode }) {
    return (
      <th onClick={() => handlePenSort(field)} className="cursor-pointer select-none px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500 hover:text-gray-700">
        <span className="inline-flex items-center">{children}<SortIcon field={field} sortField={penSortActive ? penSortField : null} sortDir={penSortDir} /></span>
      </th>
    );
  }

  const staticTH = (label: string) => <th className="px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500 whitespace-nowrap">{label}</th>;

  function ActionsMenu({ options }: { options: { label: string; icon: React.ReactNode; onClick: () => void; danger?: boolean }[] }) {
    return (
      <TableActionsDropdown width={208}>
        {(close) => (
          <>
            {options.map((opt, i) => (
              <button key={i} onClick={() => { close(); opt.onClick(); }}
                className={`flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 ${opt.danger ? "text-red-600" : "text-gray-700"}`}>
                {opt.icon}{opt.label}
              </button>
            ))}
          </>
        )}
      </TableActionsDropdown>
    );
  }

  const TAB_CONFIG: Record<TabId, { label: string; dot: string; count: number; description: string }> = {
    penalties: { label: "All Penalties & Fines", dot: "bg-red-500", count: penaltiesSummary?.total ?? 0, description: "Master list of all penalty definitions and their associated fine amounts." },
    issued:    { label: "Issued Fines",           dot: "bg-amber-500", count: issuedSummary?.total ?? 0, description: "All fines issued to transporters across the ETSS-Nigeria platform." },
    disputes:  { label: "Manage Fine Disputes",   dot: "bg-blue-500",  count: disputesSummary?.total ?? 0, description: "Transporter-raised disputes against issued fines — review and resolve." },
  };
  const TABS = (["penalties", "issued", "disputes"] as TabId[]);

  // ─── Render ───
  return (
    <div className="space-y-5 p-6">
      {/* ─── Dialogs ─── */}
      {showAddModal && <PenaltyFormModal onSave={handleAddPenalty} onCancel={() => setShowAddModal(false)} isSaving={createPenalty.isPending} />}
      {editingPenalty && <PenaltyFormModal initialData={editingPenalty} onSave={handleEditPenalty} onCancel={() => setEditingPenalty(null)} isSaving={editPenalty.isPending} />}
      {archivingPenalty && (
        <ConfirmDialog title="Archive Penalty" danger
          message={`Are you sure you want to archive "${archivingPenalty.name}"? It will be hidden from all users except SuperAdmin.`}
          confirmLabel="Archive Penalty"
          onConfirm={handleArchivePenalty}
          onCancel={() => setArchivingPenalty(null)}
          isPending={archivePenalty.isPending}
        />
      )}
      {resolvingDispute && (
        <div>
          <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setResolvingDispute(null)} />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl border border-gray-200 bg-white p-6 shadow-2xl">
            <h3 className="text-sm font-bold text-gray-900">Update Dispute Status</h3>
            <p className="mt-1 text-xs text-gray-500">{resolvingDispute.dispute_id}</p>
            <div className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-gray-400">New Status</label>
                <div className="relative">
                  <select value={newDisputeStatus} onChange={(e) => setNewDisputeStatus(e.target.value as DisputeStatus)}
                    className="w-full appearance-none rounded-lg border border-gray-200 bg-gray-50 py-2 pl-3 pr-8 text-sm outline-none focus:border-emerald-300">
                    <option value="PENDING_REVIEW">Pending Review</option>
                    <option value="UNDER_NPA_REVIEW">Under NPA Review</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
              {(newDisputeStatus === "RESOLVED" || newDisputeStatus === "REJECTED") && (
                <div>
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-gray-400">Resolution Outcome</label>
                  <div className="relative">
                    <select value={newOutcome} onChange={(e) => setNewOutcome(e.target.value as ResolutionOutcome)}
                      className="w-full appearance-none rounded-lg border border-gray-200 bg-gray-50 py-2 pl-3 pr-8 text-sm outline-none focus:border-emerald-300">
                      <option value="">— Select Outcome —</option>
                      <option value="FINE_UPHELD">Fine Upheld</option>
                      <option value="FINE_WAIVED">Fine Waived</option>
                      <option value="FINE_ADJUSTED">Fine Adjusted</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
              )}
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setResolvingDispute(null)} disabled={resolveDispute.isPending} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50">Cancel</button>
              <button onClick={handleUpdateDisputeStatus} disabled={resolveDispute.isPending} className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50">
                {resolveDispute.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Issued Fine Drawer ─── */}
      {selectedFineId && (
        <>
          <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setSelectedFineId(null)} />
          <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[480px] flex-col bg-white shadow-2xl">
            {fineDetailLoading || !selectedFine ? (
              <div className="flex flex-1 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
              </div>
            ) : (
              <>
            <div className="flex items-center justify-between bg-[#0f1e2e] px-6 py-4">
              <div>
                <p className="font-mono text-sm font-bold text-white">{selectedFine.issued_fine_id}</p>
                <p className="text-[11px] text-gray-400">{selectedFine.penalty_name}</p>
              </div>
              <div className="flex items-center gap-2">
                <FineBadge status={selectedFine.status} />
                <button onClick={() => setSelectedFineId(null)} className="rounded-lg p-1.5 text-gray-400 hover:bg-white/10 hover:text-white"><X className="h-4 w-4" /></button>
              </div>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto p-6">
              <div className="flex flex-wrap gap-2">
                <BookingStatusBadge status={selectedFine.booking.truck_booking_status} />
                <CategoryBadge cat={selectedFine.booking.category} />
              </div>
              {/* Penalty details */}
              <div className="rounded-xl border border-gray-100 bg-white">
                <p className="border-b border-gray-100 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Penalty Details</p>
                <div className="divide-y divide-gray-50">
                  {[
                    ["Penalty Code", selectedFine.penalty_code],
                    ["Penalty Type", selectedFine.penalty_name],
                    ["Fine Amount", naira(selectedFine.fine_amount)],
                    ["Issued By", selectedFine.issued_by],
                    ["Date Issued", formatTimestamp(selectedFine.date_issued)],
                  ].map(([label, value]) => (
                    <div key={String(label)} className="flex items-start justify-between gap-4 px-4 py-2.5">
                      <p className="shrink-0 text-xs text-gray-500">{String(label)}</p>
                      <p className="text-right text-xs font-medium text-gray-800">{String(value)}</p>
                    </div>
                  ))}
                </div>
              </div>
              {/* Booking details */}
              <div className="rounded-xl border border-gray-100 bg-white">
                <p className="border-b border-gray-100 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Booking Details</p>
                <div className="divide-y divide-gray-50">
                  {[
                    ["Booking Reference", selectedFine.booking.booking_reference],
                    ["Terminal Destination", selectedFine.booking.terminal_destination],
                    ["Booking Date", formatTimestamp(selectedFine.booking.booking_date)],
                    ["Truck Plate Number", selectedFine.truck_plate_number],
                    ["Driver Name", selectedFine.driver_name],
                  ].map(([label, value]) => (
                    <div key={String(label)} className="flex items-start justify-between gap-4 px-4 py-2.5">
                      <p className="shrink-0 text-xs text-gray-500">{String(label)}</p>
                      <p className="text-right text-xs font-medium text-gray-800">{String(value)}</p>
                    </div>
                  ))}
                </div>
              </div>
              {/* Transporter details */}
              <div className="rounded-xl border border-gray-100 bg-white">
                <p className="border-b border-gray-100 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Transporter Details</p>
                <div className="divide-y divide-gray-50">
                  {[
                    ["Company Name", selectedFine.transporter.company_name],
                    ["User Account", selectedFine.transporter.user_account],
                    ["Contact Person", selectedFine.transporter.contact_person],
                    ["Contact Number", selectedFine.transporter.contact_number],
                    ["Email", selectedFine.transporter.email],
                  ].map(([label, value]) => (
                    <div key={String(label)} className="flex items-start justify-between gap-4 px-4 py-2.5">
                      <p className="shrink-0 text-xs text-gray-500">{String(label)}</p>
                      <p className="text-right text-xs font-medium text-gray-800">{String(value)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="border-t border-gray-100 px-6 py-3">
              <button onClick={() => setSelectedFineId(null)} className="w-full rounded-lg border border-gray-200 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50">Close</button>
            </div>
              </>
            )}
          </div>
        </>
      )}

      {/* ─── Dispute Detail Drawer ─── */}
      {selectedDisputeId && (
        <>
          <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setSelectedDisputeId(null)} />
          <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[520px] flex-col bg-white shadow-2xl">
            {disputeDetailLoading || !selectedDispute ? (
              <div className="flex flex-1 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
              </div>
            ) : (
              <>
            <div className="flex items-center justify-between bg-[#0f1e2e] px-6 py-4">
              <div>
                <p className="font-mono text-sm font-bold text-white">{selectedDispute.dispute_id}</p>
                <p className="text-[11px] text-gray-400">{selectedDispute.penalty_name} — {naira(selectedDispute.fine_amount)}</p>
              </div>
              <div className="flex items-center gap-2">
                <DisputeStatusBadge status={selectedDispute.dispute_status} />
                <button onClick={() => setSelectedDisputeId(null)} className="rounded-lg p-1.5 text-gray-400 hover:bg-white/10 hover:text-white"><X className="h-4 w-4" /></button>
              </div>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto p-6">
              <div className="flex flex-wrap gap-2">
                <ResolutionBadge outcome={selectedDispute.resolution_outcome} />
                <CategoryBadge cat={selectedDispute.booking.category} />
              </div>
              {/* Infraction details */}
              <div className="rounded-xl border border-gray-100">
                <p className="border-b border-gray-100 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Infraction Details</p>
                <div className="divide-y divide-gray-50">
                  {[
                    ["Infraction Code", selectedDispute.penalty_code],
                    ["Infraction Type", selectedDispute.penalty_name],
                    ["Fine Amount", naira(selectedDispute.fine_amount)],
                    ...(selectedDispute.adjusted_amount !== undefined ? [["Adjusted Amount", naira(selectedDispute.adjusted_amount)]] : []),
                    ["Date Issued", formatTimestamp(selectedDispute.date_issued)],
                  ].map(([label, value]) => (
                    <div key={String(label)} className="flex items-start justify-between gap-4 px-4 py-2.5">
                      <p className="shrink-0 text-xs text-gray-500">{String(label)}</p>
                      <p className="text-right text-xs font-medium text-gray-800">{String(value)}</p>
                    </div>
                  ))}
                </div>
              </div>
              {/* Dispute details */}
              <div className="rounded-xl border border-gray-100">
                <p className="border-b border-gray-100 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Dispute Details</p>
                <div className="divide-y divide-gray-50">
                  <div className="flex items-start justify-between gap-4 px-4 py-2.5">
                    <p className="shrink-0 text-xs text-gray-500">Date Disputed</p>
                    <p className="text-right text-xs font-medium text-gray-800">{formatTimestamp(selectedDispute.date_disputed)}</p>
                  </div>
                  <div className="flex items-start justify-between gap-4 px-4 py-2.5">
                    <p className="shrink-0 text-xs text-gray-500">Managed By</p>
                    <p className="text-right text-xs font-medium text-gray-800">{selectedDispute.managed_by ?? "—"}</p>
                  </div>
                  {selectedDispute.resolution_date && (
                    <div className="flex items-start justify-between gap-4 px-4 py-2.5">
                      <p className="shrink-0 text-xs text-gray-500">Resolution Date</p>
                      <p className="text-right text-xs font-medium text-gray-800">{formatTimestamp(selectedDispute.resolution_date)}</p>
                    </div>
                  )}
                </div>
                <div className="px-4 py-3">
                  <p className="mb-1 text-xs text-gray-500">Reason for Dispute</p>
                  <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800">{selectedDispute.dispute_reason}</p>
                </div>
              </div>
              {/* Transporter */}
              <div className="rounded-xl border border-gray-100">
                <p className="border-b border-gray-100 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Transporter Details</p>
                <div className="divide-y divide-gray-50">
                  {[
                    ["Company Name", selectedDispute.transporter.company_name],
                    ["Contact Person", selectedDispute.transporter.contact_person],
                    ["Contact Number", selectedDispute.transporter.contact_number],
                    ["Truck Plate", selectedDispute.truck_plate_number],
                    ["Driver Name", selectedDispute.driver_name],
                  ].map(([label, value]) => (
                    <div key={String(label)} className="flex items-start justify-between gap-4 px-4 py-2.5">
                      <p className="shrink-0 text-xs text-gray-500">{String(label)}</p>
                      <p className="text-right text-xs font-medium text-gray-800">{String(value)}</p>
                    </div>
                  ))}
                </div>
              </div>
              {/* Resolution history */}
              <div className="rounded-xl border border-gray-100">
                <p className="border-b border-gray-100 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Resolution History</p>
                <div className="divide-y divide-gray-50">
                  {selectedDispute.resolution_history.map((ev, i) => (
                    <div key={i} className="flex items-start gap-3 px-4 py-3">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-100 text-[10px] font-bold text-violet-700">{i + 1}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-gray-800">{ev.action}</p>
                        <p className="text-[11px] text-gray-500">{ev.performed_by}</p>
                        <p className="mt-0.5 text-[10px] text-gray-400">{formatTimestamp(ev.timestamp)}</p>
                        <p className="mt-1 text-[11px] text-gray-600">{ev.notes}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="border-t border-gray-100 px-6 py-3 flex gap-2">
              {selectedDispute.dispute_status !== "RESOLVED" && selectedDispute.dispute_status !== "REJECTED" && (
                <button onClick={() => { setSelectedDisputeId(null); setNewDisputeStatus(selectedDispute.dispute_status); setNewOutcome(""); setResolvingDispute(selectedDispute); }}
                  className="flex-1 rounded-lg bg-emerald-600 py-2 text-xs font-semibold text-white hover:bg-emerald-700">
                  Update Status
                </button>
              )}
              <button onClick={() => setSelectedDisputeId(null)} className="flex-1 rounded-lg border border-gray-200 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50">Close</button>
            </div>
              </>
            )}
          </div>
        </>
      )}

      {/* ─── Breadcrumb ─── */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-500">
        <span>Administration</span>
        <Chevron className="h-3 w-3" />
        <span>Penalties &amp; Fines</span>
        <Chevron className="h-3 w-3" />
        <span className="font-semibold text-gray-800">{TAB_CONFIG[activeTab].label}</span>
      </nav>

      {/* ─── Summary Panel ─── */}
      {activeTab === "penalties" && <PenaltiesSummaryPanel summary={penaltiesSummary} isLoading={penSummaryLoading} />}
      {activeTab === "issued"    && <IssuedFinesSummaryPanel summary={issuedSummary} isLoading={issuedSummaryLoading} />}
      {activeTab === "disputes"  && <DisputesSummaryPanel summary={disputesSummary} isLoading={dispSummaryLoading} />}

      {/* ─── Module Card with Tabs ─── */}
      <div className="rounded-xl border border-gray-200 bg-white">
        {/* Header */}
        <div className="border-b border-gray-100 px-6 pb-0 pt-4">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0f1e2e]">
              <Gavel className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900">Penalties &amp; Fines Registry</h1>
              <p className="text-xs text-gray-500">Manage penalty definitions, issued fines, and transporter disputes</p>
            </div>
          </div>
          {/* Tabs */}
          <div className="flex gap-0.5 overflow-x-auto">
            {TABS.map((tab) => {
              const tc = TAB_CONFIG[tab];
              const isActive = activeTab === tab;
              return (
                <button key={tab} onClick={() => switchTab(tab)}
                  className={`flex items-center gap-1.5 whitespace-nowrap rounded-t-lg border-b-2 px-4 py-3 text-xs font-semibold transition-colors ${
                    isActive ? "border-emerald-600 text-emerald-700" : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${tc.dot}`} />
                  {tc.label}
                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                    {tc.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        {/* Tab description + refresh */}
        <div className="flex items-center justify-between px-6 py-2.5">
          <p className="text-xs text-gray-500">{TAB_CONFIG[activeTab].description}</p>
          <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
            <RefreshCw className="h-3 w-3" />Last refresh: {lastRefresh}
          </div>
        </div>
      </div>

      {/* ─── Toolbar ─── */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        {/* ── PENALTIES toolbar ── */}
        {activeTab === "penalties" && (
          <>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-56 flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input type="text" value={penSearch} onChange={(e) => setPenSearch(e.target.value)}
                  placeholder="Search penalty name or code..."
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm placeholder-gray-400 outline-none focus:border-emerald-300 focus:bg-white focus:ring-2 focus:ring-emerald-100" />
              </div>
              <button onClick={() => setPenShowFilters(!penShowFilters)}
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${penShowFilters || penStatusFilter !== "All" ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                <Filter className="h-4 w-4" />Filters
              </button>
              <div className="relative group">
                <button className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
                  <Download className="h-4 w-4" />Export<ChevronDown className="h-3 w-3" />
                </button>
                <div className="absolute right-0 top-full z-20 mt-1 hidden w-36 rounded-lg border border-gray-200 bg-white py-1 shadow-lg group-hover:block">
                  <button onClick={() => exportPenalties.mutate(penListParams)} disabled={exportPenalties.isPending} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"><FileText className="h-3.5 w-3.5 text-gray-400" />CSV</button>
                </div>
              </div>
              <button onClick={() => setShowAddModal(true)}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
                <Plus className="h-4 w-4" />Add New Penalty
              </button>
            </div>
            {penShowFilters && (
              <div className="mt-3 flex flex-wrap items-end gap-4 border-t border-gray-100 pt-3">
                <div>
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-gray-400">Status</label>
                  <div className="relative">
                    <select value={penStatusFilter} onChange={(e) => { setPenStatusFilter(e.target.value); setPenPage(1); }}
                      className="appearance-none rounded-lg border border-gray-200 bg-white py-1.5 pl-3 pr-8 text-xs text-gray-700 outline-none focus:border-emerald-300">
                      {STATUS_FILTER_OPTIONS.map((s) => <option key={s} value={s}>{s === "All" ? "All Statuses" : formatLabel(s)}</option>)}
                    </select>
                    <ChevronDown className="pointer-events-none absolute bottom-2.5 right-2 h-3 w-3 text-gray-400" />
                  </div>
                </div>
                {penHasFilters && (
                  <button onClick={clearPenFilters}
                    className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50">
                    <X className="h-3 w-3" />Clear All
                  </button>
                )}
              </div>
            )}
          </>
        )}
        {/* ── ISSUED FINES toolbar ── */}
        {activeTab === "issued" && (
          <>
            <div className="flex flex-wrap items-center gap-3">
              <button onClick={() => setFineShowFilters(!fineShowFilters)}
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${fineShowFilters || fineHasFilters ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                <Filter className="h-4 w-4" />Filters
              </button>
              <div className="relative group">
                <button className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
                  <Download className="h-4 w-4" />Export<ChevronDown className="h-3 w-3" />
                </button>
                <div className="absolute right-0 top-full z-20 mt-1 hidden w-36 rounded-lg border border-gray-200 bg-white py-1 shadow-lg group-hover:block">
                  <button onClick={() => exportIssuedFines.mutate(fineListParams)} disabled={exportIssuedFines.isPending} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"><FileText className="h-3.5 w-3.5 text-gray-400" />CSV</button>
                </div>
              </div>
            </div>
            {fineShowFilters && (
              <div className="mt-3 flex flex-wrap items-end gap-4 border-t border-gray-100 pt-3">
                <div>
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-gray-400">Penalty Type</label>
                  <div className="relative">
                    <select value={finePenaltyFilter} onChange={(e) => { setFinePenaltyFilter(e.target.value); setFinePage(1); }}
                      className="appearance-none rounded-lg border border-gray-200 bg-white py-1.5 pl-3 pr-8 text-xs text-gray-700 outline-none focus:border-emerald-300">
                      <option value="All">All Types</option>
                      {penaltyNameOptions.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <ChevronDown className="pointer-events-none absolute bottom-2.5 right-2 h-3 w-3 text-gray-400" />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-gray-400">Terminal</label>
                  <div className="relative">
                    <select value={fineTerminalFilter} onChange={(e) => { setFineTerminalFilter(e.target.value); setFinePage(1); }}
                      className="appearance-none rounded-lg border border-gray-200 bg-white py-1.5 pl-3 pr-8 text-xs text-gray-700 outline-none focus:border-emerald-300">
                      <option value="All">All Terminals</option>
                      {terminalOptions.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <ChevronDown className="pointer-events-none absolute bottom-2.5 right-2 h-3 w-3 text-gray-400" />
                  </div>
                </div>
                {fineHasFilters && (
                  <button onClick={clearFineFilters}
                    className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50">
                    <X className="h-3 w-3" />Clear All
                  </button>
                )}
              </div>
            )}
          </>
        )}
        {/* ── DISPUTES toolbar ── */}
        {activeTab === "disputes" && (
          <>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-64 flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input type="text" value={dispSearch} onChange={(e) => setDispSearch(e.target.value)}
                  placeholder="Search by Dispute ID, booking, plate, company..."
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm placeholder-gray-400 outline-none focus:border-emerald-300 focus:bg-white focus:ring-2 focus:ring-emerald-100" />
              </div>
              <button onClick={() => setDispShowFilters(!dispShowFilters)}
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${dispShowFilters || dispHasFilters ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                <Filter className="h-4 w-4" />Filters
              </button>
              <div className="relative group">
                <button className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
                  <Download className="h-4 w-4" />Export<ChevronDown className="h-3 w-3" />
                </button>
                <div className="absolute right-0 top-full z-20 mt-1 hidden w-36 rounded-lg border border-gray-200 bg-white py-1 shadow-lg group-hover:block">
                  <button onClick={() => exportDisputes.mutate(dispListParams)} disabled={exportDisputes.isPending} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"><FileText className="h-3.5 w-3.5 text-gray-400" />CSV</button>
                </div>
              </div>
            </div>
            {dispShowFilters && (
              <div className="mt-3 flex flex-wrap items-end gap-4 border-t border-gray-100 pt-3">
                <div>
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-gray-400">Dispute Status</label>
                  <div className="relative">
                    <select value={dispStatusFilter} onChange={(e) => { setDispStatusFilter(e.target.value); setDispPage(1); }}
                      className="appearance-none rounded-lg border border-gray-200 bg-white py-1.5 pl-3 pr-8 text-xs text-gray-700 outline-none focus:border-emerald-300">
                      {DISPUTE_STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s === "All" ? "All Statuses" : formatLabel(s)}</option>)}
                    </select>
                    <ChevronDown className="pointer-events-none absolute bottom-2.5 right-2 h-3 w-3 text-gray-400" />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-gray-400">Resolution Outcome</label>
                  <div className="relative">
                    <select value={dispOutcomeFilter} onChange={(e) => { setDispOutcomeFilter(e.target.value); setDispPage(1); }}
                      className="appearance-none rounded-lg border border-gray-200 bg-white py-1.5 pl-3 pr-8 text-xs text-gray-700 outline-none focus:border-emerald-300">
                      {OUTCOME_OPTIONS.map((s) => <option key={s} value={s}>{s === "All" ? "All Outcomes" : formatLabel(s)}</option>)}
                    </select>
                    <ChevronDown className="pointer-events-none absolute bottom-2.5 right-2 h-3 w-3 text-gray-400" />
                  </div>
                </div>
                {dispHasFilters && (
                  <button onClick={clearDispFilters}
                    className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50">
                    <X className="h-3 w-3" />Clear All
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* ─── Results count ─── */}
      <div className="flex items-center justify-between">
        {activeTab === "penalties" && (
          <p className="text-xs text-gray-500">Showing <span className="font-semibold text-gray-800">{penTotalCount}</span> penalt{penTotalCount !== 1 ? "ies" : "y"}{penHasFilters ? " matching your filters" : ""}</p>
        )}
        {activeTab === "issued" && (
          <p className="text-xs text-gray-500">Showing <span className="font-semibold text-gray-800">{fineTotalCount}</span> issued fine{fineTotalCount !== 1 ? "s" : ""}{fineHasFilters ? " matching your filters" : ""}</p>
        )}
        {activeTab === "disputes" && (
          <p className="text-xs text-gray-500">Showing <span className="font-semibold text-gray-800">{dispTotalCount}</span> dispute{dispTotalCount !== 1 ? "s" : ""}{dispHasFilters ? " matching your filters" : ""}</p>
        )}
      </div>

      {/* ─── Tables ─── */}

      {/* ── ALL PENALTIES TABLE ── */}
      {activeTab === "penalties" && (
        <div className="min-w-0 rounded-xl border border-gray-200 bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-max w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  {staticTH("S/No.")}
                  <PenTH field="name">Penalty Name</PenTH>
                  {staticTH("Description")}
                  <PenTH field="fine_amount">Fine Amount (₦)</PenTH>
                  {staticTH("Status")}
                  {staticTH("Created By")}
                  <PenTH field="created_at">Date Created</PenTH>
                  {staticTH("Last Updated By")}
                  {staticTH("Last Updated")}
                  <th className="px-3 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {penListLoading ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-12 text-center">
                      <Loader2 className="mx-auto h-8 w-8 animate-spin text-emerald-600" />
                    </td>
                  </tr>
                ) : penListError ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-2 text-red-600">
                        <AlertCircle className="h-8 w-8" />
                        <p className="text-sm font-medium">Failed to load penalties</p>
                      </div>
                    </td>
                  </tr>
                ) : penPaged.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Gavel className="h-8 w-8 text-gray-300" />
                        <p className="text-sm font-medium text-gray-400">No penalties match your filters</p>
                        {penHasFilters && <button onClick={clearPenFilters} className="text-xs font-medium text-emerald-600 hover:underline">Clear all filters</button>}
                      </div>
                    </td>
                  </tr>
                ) : penPaged.map((p, idx) => (
                  <tr key={p.id} className="transition-colors hover:bg-gray-50/80">
                    <td className="px-3 py-3 text-xs font-medium text-gray-400">{(penPage - 1) * PAGE_SIZE + idx + 1}</td>
                    <td className="px-3 py-3">
                      <p className="font-semibold text-sm text-gray-900">{p.name}</p>
                      <p className="font-mono text-[11px] text-gray-400">{p.penalty_code}</p>
                    </td>
                    <td className="px-3 py-3 max-w-xs">
                      <p className="line-clamp-2 text-xs text-gray-600">{p.description}</p>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">{naira(p.fine_amount)}</td>
                    <td className="px-3 py-3 whitespace-nowrap"><PenaltyStatusBadge status={p.status} /></td>
                    <td className="px-3 py-3 max-w-36"><p className="truncate text-xs text-gray-600">{p.created_by}</p></td>
                    <td className="px-3 py-3 whitespace-nowrap text-xs text-gray-600">{formatDate(p.created_at)}</td>
                    <td className="px-3 py-3 max-w-36"><p className="truncate text-xs text-gray-600">{p.updated_by ?? "—"}</p></td>
                    <td className="px-3 py-3 whitespace-nowrap text-xs text-gray-600">{p.updated_at ? formatDate(p.updated_at) : "—"}</td>
                    <td className="px-3 py-3 text-center">
                      <ActionsMenu options={[
                        { label: "Edit Penalty", icon: <Edit2 className="h-3.5 w-3.5" />, onClick: () => setEditingPenalty(p) },
                        { label: "Archive Penalty", icon: <Archive className="h-3.5 w-3.5" />, danger: true, onClick: () => setArchivingPenalty(p) },
                      ]} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {penTotalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
              <p className="text-xs text-gray-500">Page {penPage} of {penTotalPages} · {penTotalCount} results</p>
              <div className="flex gap-1">
                <button onClick={() => setPenPage(Math.max(1, penPage - 1))} disabled={penPage === 1}
                  className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40">
                  <ChevronDown className="h-3 w-3 rotate-90" />Prev
                </button>
                <button onClick={() => setPenPage(Math.min(penTotalPages, penPage + 1))} disabled={penPage === penTotalPages}
                  className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40">
                  Next<ChevronDown className="h-3 w-3 -rotate-90" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── ISSUED FINES TABLE ── */}
      {activeTab === "issued" && (
        <div className="min-w-0 rounded-xl border border-gray-200 bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-max w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  {staticTH("S/No.")}
                  {staticTH("Penalty ID")}
                  {staticTH("Booking Ref")}
                  {staticTH("Truck Plate")}
                  {staticTH("Driver")}
                  {staticTH("Booked By")}
                  {staticTH("Penalty Name")}
                  {staticTH("Fine Amount")}
                  {staticTH("Date Issued")}
                  {staticTH("Issued By")}
                  {staticTH("Category")}
                  {staticTH("Booking Status")}
                  {staticTH("Terminal")}
                  {staticTH("Fine Status")}
                  <th className="px-3 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {fineListLoading ? (
                  <tr>
                    <td colSpan={15} className="px-4 py-12 text-center">
                      <Loader2 className="mx-auto h-8 w-8 animate-spin text-emerald-600" />
                    </td>
                  </tr>
                ) : fineListError ? (
                  <tr>
                    <td colSpan={15} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-2 text-red-600">
                        <AlertCircle className="h-8 w-8" />
                        <p className="text-sm font-medium">Failed to load issued fines</p>
                      </div>
                    </td>
                  </tr>
                ) : finePaged.length === 0 ? (
                  <tr>
                    <td colSpan={15} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <ReceiptText className="h-8 w-8 text-gray-300" />
                        <p className="text-sm font-medium text-gray-400">No issued fines match your filters</p>
                        {fineHasFilters && <button onClick={clearFineFilters} className="text-xs font-medium text-emerald-600 hover:underline">Clear all filters</button>}
                      </div>
                    </td>
                  </tr>
                ) : finePaged.map((f, idx) => (
                  <tr key={f.id} className="transition-colors hover:bg-gray-50/80">
                    <td className="px-3 py-3 text-xs font-medium text-gray-400">{(finePage - 1) * PAGE_SIZE + idx + 1}</td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <p className="font-mono text-xs font-bold text-gray-800">{f.issued_fine_id}</p>
                      <p className="font-mono text-[11px] text-gray-400">{f.penalty_code}</p>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-xs font-medium text-gray-700">{f.booking.booking_reference}</td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span className="rounded bg-gray-100 px-2 py-0.5 font-mono text-xs font-semibold text-gray-800">{f.truck_plate_number}</span>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-xs text-gray-700">{f.driver_name}</td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <p className="text-xs font-medium text-gray-800">{f.transporter.company_name}</p>
                      <p className="text-[11px] text-gray-400">{f.transporter.user_account}</p>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-xs text-gray-700">{f.penalty_name}</td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm font-semibold text-red-700">{naira(f.fine_amount)}</td>
                    <td className="px-3 py-3 whitespace-nowrap text-xs text-gray-600">{formatDate(f.date_issued)}</td>
                    <td className="px-3 py-3 max-w-36"><p className="truncate text-xs text-gray-600">{f.issued_by}</p></td>
                    <td className="px-3 py-3 whitespace-nowrap"><CategoryBadge cat={f.booking.category} /></td>
                    <td className="px-3 py-3 whitespace-nowrap"><BookingStatusBadge status={f.booking.truck_booking_status} /></td>
                    <td className="px-3 py-3 max-w-40"><p className="truncate text-xs text-gray-600">{f.booking.terminal_destination}</p></td>
                    <td className="px-3 py-3 whitespace-nowrap"><FineBadge status={f.status} /></td>
                    <td className="px-3 py-3 text-center">
                      <ActionsMenu options={[
                        { label: "View Booking Details", icon: <Eye className="h-3.5 w-3.5" />, onClick: () => setSelectedFineId(f.id) },
                      ]} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {fineTotalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
              <p className="text-xs text-gray-500">Page {finePage} of {fineTotalPages} · {fineTotalCount} results</p>
              <div className="flex gap-1">
                <button onClick={() => setFinePage(Math.max(1, finePage - 1))} disabled={finePage === 1}
                  className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40">
                  <ChevronDown className="h-3 w-3 rotate-90" />Prev
                </button>
                <button onClick={() => setFinePage(Math.min(fineTotalPages, finePage + 1))} disabled={finePage === fineTotalPages}
                  className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40">
                  Next<ChevronDown className="h-3 w-3 -rotate-90" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── DISPUTES TABLE ── */}
      {activeTab === "disputes" && (
        <div className="min-w-0 rounded-xl border border-gray-200 bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-max w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  {staticTH("S/No.")}
                  {staticTH("Dispute ID")}
                  {staticTH("Penalty ID")}
                  {staticTH("Booking Ref")}
                  {staticTH("Truck Plate")}
                  {staticTH("Driver")}
                  {staticTH("Transporter")}
                  {staticTH("Penalty Type")}
                  {staticTH("Fine Amount")}
                  {staticTH("Date Issued")}
                  {staticTH("Date Disputed")}
                  {staticTH("Dispute Status")}
                  {staticTH("Resolution")}
                  {staticTH("Managed By")}
                  <th className="px-3 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {dispListLoading ? (
                  <tr>
                    <td colSpan={15} className="px-4 py-12 text-center">
                      <Loader2 className="mx-auto h-8 w-8 animate-spin text-emerald-600" />
                    </td>
                  </tr>
                ) : dispListError ? (
                  <tr>
                    <td colSpan={15} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-2 text-red-600">
                        <AlertCircle className="h-8 w-8" />
                        <p className="text-sm font-medium">Failed to load disputes</p>
                      </div>
                    </td>
                  </tr>
                ) : dispPaged.length === 0 ? (
                  <tr>
                    <td colSpan={15} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Scale className="h-8 w-8 text-gray-300" />
                        <p className="text-sm font-medium text-gray-400">No disputes match your filters</p>
                        {dispHasFilters && <button onClick={clearDispFilters} className="text-xs font-medium text-emerald-600 hover:underline">Clear all filters</button>}
                      </div>
                    </td>
                  </tr>
                ) : dispPaged.map((d, idx) => (
                  <tr key={d.id} className="cursor-pointer transition-colors hover:bg-gray-50/80" onClick={() => setSelectedDisputeId(d.id)}>
                    <td className="px-3 py-3 text-xs font-medium text-gray-400">{(dispPage - 1) * PAGE_SIZE + idx + 1}</td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <button className="flex items-center gap-1 font-mono text-xs font-bold text-emerald-700 hover:underline"
                        onClick={(e) => { e.stopPropagation(); setSelectedDisputeId(d.id); }}>
                        <Hash className="h-3 w-3" />{d.dispute_id}
                      </button>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap font-mono text-xs text-gray-600">{d.penalty_code}</td>
                    <td className="px-3 py-3 whitespace-nowrap text-xs font-medium text-gray-700">{d.booking.booking_reference}</td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span className="rounded bg-gray-100 px-2 py-0.5 font-mono text-xs font-semibold text-gray-800">{d.truck_plate_number}</span>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-xs text-gray-700">{d.driver_name}</td>
                    <td className="px-3 py-3 whitespace-nowrap max-w-36"><p className="truncate text-xs font-medium text-gray-800">{d.transporter.company_name}</p></td>
                    <td className="px-3 py-3 whitespace-nowrap text-xs text-gray-700">{d.penalty_name}</td>
                    <td className="px-3 py-3 whitespace-nowrap font-semibold text-sm text-red-700">{naira(d.fine_amount)}</td>
                    <td className="px-3 py-3 whitespace-nowrap text-xs text-gray-600">{formatDate(d.date_issued)}</td>
                    <td className="px-3 py-3 whitespace-nowrap text-xs text-gray-600">{formatDate(d.date_disputed)}</td>
                    <td className="px-3 py-3 whitespace-nowrap"><DisputeStatusBadge status={d.dispute_status} /></td>
                    <td className="px-3 py-3 whitespace-nowrap"><ResolutionBadge outcome={d.resolution_outcome} /></td>
                    <td className="px-3 py-3 max-w-36"><p className="truncate text-xs text-gray-500">{d.managed_by ?? "—"}</p></td>
                    <td className="px-3 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <ActionsMenu options={[
                        { label: "View Dispute Details", icon: <Eye className="h-3.5 w-3.5" />, onClick: () => setSelectedDisputeId(d.id) },
                        ...(d.dispute_status !== "RESOLVED" && d.dispute_status !== "REJECTED"
                          ? [{ label: "Update Status", icon: <CheckCircle className="h-3.5 w-3.5" />, onClick: () => { setNewDisputeStatus(d.dispute_status); setNewOutcome(""); setResolvingDispute(d); } }]
                          : []),
                      ]} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {dispTotalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
              <p className="text-xs text-gray-500">Page {dispPage} of {dispTotalPages} · {dispTotalCount} results</p>
              <div className="flex gap-1">
                <button onClick={() => setDispPage(Math.max(1, dispPage - 1))} disabled={dispPage === 1}
                  className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40">
                  <ChevronDown className="h-3 w-3 rotate-90" />Prev
                </button>
                <button onClick={() => setDispPage(Math.min(dispTotalPages, dispPage + 1))} disabled={dispPage === dispTotalPages}
                  className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40">
                  Next<ChevronDown className="h-3 w-3 -rotate-90" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

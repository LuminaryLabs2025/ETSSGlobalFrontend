"use client";

import { useState } from "react";
import {
  ClipboardList,
  Search,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronRight as Chevron,
  X,
  Clock,
  AlertTriangle,
  Edit2,
  History,
  Settings2,
  Truck,
  Upload,
  Landmark,
  Zap,
  Hand,
  Shield,
  Calendar,
  Plus,
  Ban,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth.store";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { useDttr } from "@/hooks/dttr/useDttr";
import { useDttrSummary } from "@/hooks/dttr/useDttrSummary";
import { useDttrSubmissions } from "@/hooks/dttr/useDttrSubmissions";
import {
  useSubmitDttrRequest,
  useEditDttr,
  useConfigureDttrMode,
} from "@/hooks/dttr/useDttrActions";
import { TableActionsDropdown } from "@/components/dashboard/TableActionsDropdown";
import type {
  DTTRTerminalRequest,
  DTTRTransferBreakdown,
  DTTRRequestMode,
  DTTRSummaryResponse,
  EditDttrPayload,
  ConfigureModePayload,
  DTTRListParams,
} from "@/types/dttr.types";
import { sumBreakdown } from "@/types/dttr.types";

const PAGE_SIZE = 10;

const TRANSFER_LABELS: Record<keyof DTTRTransferBreakdown, string> = {
  exports: "Exports",
  imports: "Imports",
  empties: "Empties",
  gatepass: "GatePass",
};

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

function formatDate(ts: string) {
  return new Date(ts).toLocaleDateString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function ModeBadge({ mode }: { mode: DTTRRequestMode }) {
  const isAuto = mode === "AUTOMATED";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${
      isAuto
        ? "border-violet-200 bg-violet-50 text-violet-700"
        : "border-blue-200 bg-blue-50 text-blue-700"
    }`}>
      {isAuto ? <Zap className="h-3 w-3" /> : <Hand className="h-3 w-3" />}
      {isAuto ? "Automated" : "Manual"}
    </span>
  );
}

function BreakdownCell({ breakdown }: { breakdown: DTTRTransferBreakdown }) {
  const items: { key: keyof DTTRTransferBreakdown; color: string }[] = [
    { key: "exports", color: "text-indigo-700 bg-indigo-50" },
    { key: "imports", color: "text-violet-700 bg-violet-50" },
    { key: "empties", color: "text-sky-700 bg-sky-50" },
    { key: "gatepass", color: "text-emerald-700 bg-emerald-50" },
  ];
  return (
    <div className="flex flex-wrap gap-1">
      {items.map(({ key, color }) => (
        <span key={key} className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${color}`}>
          {TRANSFER_LABELS[key].slice(0, 3)}: {breakdown[key]}
        </span>
      ))}
    </div>
  );
}

function CapacityBar({ requested, capacity }: { requested: number; capacity: number }) {
  const pct = capacity > 0 ? Math.min(100, (requested / capacity) * 100) : 0;
  const atLimit = requested >= capacity;
  const nearLimit = !atLimit && pct >= 85;
  return (
    <div className="min-w-[100px]">
      <div className="mb-1 flex items-center justify-between text-[10px]">
        <span className={`font-bold ${atLimit ? "text-red-600" : nearLimit ? "text-amber-600" : "text-gray-700"}`}>
          {requested}/{capacity}
        </span>
        <span className="text-gray-400">{Math.round(pct)}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-full rounded-full transition-all ${atLimit ? "bg-red-500" : nearLimit ? "bg-amber-500" : "bg-emerald-500"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function SummaryPanel({
  summary,
  isLoading,
}: {
  summary?: DTTRSummaryResponse;
  isLoading?: boolean;
}) {
  const cards = [
    { label: "Total Terminals", value: summary?.total_terminals ?? 0, color: "text-blue-400", bg: "bg-blue-400/10", Icon: Landmark },
    { label: "Total Capacity", value: summary?.total_capacity ?? 0, color: "text-emerald-400", bg: "bg-emerald-400/10", Icon: Truck },
    { label: "Requested Today", value: summary?.total_requested_today ?? 0, color: "text-cyan-400", bg: "bg-cyan-400/10", Icon: ClipboardList },
    { label: "Manual Mode", value: summary?.manual_terminals ?? 0, color: "text-blue-400", bg: "bg-blue-400/10", Icon: Hand },
    { label: "Automated Mode", value: summary?.automated_terminals ?? 0, color: "text-violet-400", bg: "bg-violet-400/10", Icon: Zap },
    { label: "At Capacity", value: summary?.at_capacity ?? 0, color: "text-red-400", bg: "bg-red-400/10", Icon: AlertTriangle },
  ];

  return (
    <div className="rounded-2xl bg-[#0f1e2e] p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Daily Terminal Truck Requests</h1>
          <p className="text-xs text-gray-400">DTTR — monitor and manage daily truck request allocations across all terminals</p>
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
        {isLoading ? (
          <div className="col-span-full flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-400" />
          </div>
        ) : (
          cards.map((card) => (
            <div key={card.label} className="rounded-xl bg-white/5 p-4 transition-colors hover:bg-white/10">
              <div className="mb-2">
                <div className={`inline-flex rounded-lg p-1.5 ${card.bg}`}>
                  <card.Icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-white">{card.value}</p>
              <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-gray-500">{card.label}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function SubmitRequestModal({
  terminal,
  onSubmit,
  onClose,
  isSubmitting,
}: {
  terminal: DTTRTerminalRequest;
  onSubmit: (breakdown: DTTRTransferBreakdown) => void;
  onClose: () => void;
  isSubmitting?: boolean;
}) {
  const [values, setValues] = useState<DTTRTransferBreakdown>({ ...terminal.requested });
  const [errors, setErrors] = useState<Partial<Record<keyof DTTRTransferBreakdown, string>>>({});

  const total = sumBreakdown(values);
  const overCapacity = total > terminal.approved_daily_capacity;

  function validate(): boolean {
    const next: Partial<Record<keyof DTTRTransferBreakdown, string>> = {};
    (Object.keys(values) as (keyof DTTRTransferBreakdown)[]).forEach((key) => {
      const v = values[key];
      if (!Number.isInteger(v) || v < 0) {
        next[key] = "Enter a valid positive whole number";
      }
    });
    setErrors(next);
    return Object.keys(next).length === 0 && !overCapacity;
  }

  function handleSubmit() {
    if (!validate()) {
      if (overCapacity) toast.error("Total requested exceeds approved daily capacity.");
      return;
    }
    onSubmit(values);
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-full max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-gray-200 bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Truck Daily Request by Terminal</h3>
            <p className="mt-0.5 text-xs text-gray-500">{terminal.terminal_name}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100"><X className="h-4 w-4" /></button>
        </div>

        <div className="mb-4 rounded-lg border border-emerald-100 bg-emerald-50 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600">Approved Daily Truck Capacity</p>
          <p className="text-2xl font-bold text-emerald-800">{terminal.approved_daily_capacity}</p>
          <ModeBadge mode={terminal.request_mode} />
        </div>

        <div className="space-y-3">
          {(Object.keys(TRANSFER_LABELS) as (keyof DTTRTransferBreakdown)[]).map((key) => (
            <div key={key}>
              <label className="mb-1 block text-xs font-semibold text-gray-700">{TRANSFER_LABELS[key]}</label>
              <input
                type="number"
                min={0}
                step={1}
                value={values[key]}
                onChange={(e) => {
                  const n = parseInt(e.target.value, 10);
                  setValues((prev) => ({ ...prev, [key]: Number.isNaN(n) ? 0 : n }));
                  setErrors((prev) => ({ ...prev, [key]: undefined }));
                }}
                className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-100 ${
                  errors[key] ? "border-red-300 focus:border-red-300" : "border-gray-200 focus:border-emerald-300"
                }`}
              />
              {errors[key] && <p className="mt-1 text-[11px] text-red-500">{errors[key]}</p>}
            </div>
          ))}
        </div>

        <div className={`mt-4 rounded-lg border p-3 ${overCapacity ? "border-red-200 bg-red-50" : "border-gray-100 bg-gray-50"}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-600">Total Requested</span>
            <span className={`text-lg font-bold ${overCapacity ? "text-red-600" : "text-gray-900"}`}>{total}</span>
          </div>
          {overCapacity && (
            <p className="mt-1 flex items-center gap-1 text-[11px] text-red-600">
              <Ban className="h-3 w-3" />
              Exceeds approved capacity by {total - terminal.approved_daily_capacity} trucks
            </p>
          )}
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={overCapacity || isSubmitting}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Submit Daily Request
          </button>
        </div>
      </div>
    </>
  );
}

function SuperAdminEditModal({
  terminal,
  onSave,
  onClose,
  isSaving,
}: {
  terminal: DTTRTerminalRequest;
  onSave: (payload: EditDttrPayload) => void;
  onClose: () => void;
  isSaving?: boolean;
}) {
  const [values, setValues] = useState<DTTRTransferBreakdown>({ ...terminal.requested });
  const [justification, setJustification] = useState("");
  const [approvalRef, setApprovalRef] = useState("");
  const [docName, setDocName] = useState("");

  const total = sumBreakdown(values);
  const overCapacity = total > terminal.approved_daily_capacity;

  function handleSave() {
    if (!justification.trim()) {
      toast.error("Justification is required for SuperAdmin edits.");
      return;
    }
    if (!approvalRef.trim() && !docName.trim()) {
      toast.error("Provide an approval reference or upload a Port Authority approval document.");
      return;
    }
    if (overCapacity) {
      toast.error("Total requested exceeds approved daily capacity.");
      return;
    }

    const hasChanges = (Object.keys(values) as (keyof DTTRTransferBreakdown)[]).some(
      (key) => values[key] !== terminal.requested[key],
    );

    if (!hasChanges) {
      toast.info("No changes detected.");
      return;
    }

    onSave({
      breakdown: values,
      justification: justification.trim(),
      approval_reference: approvalRef.trim() || undefined,
      approval_document_name: docName.trim() || undefined,
    });
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-full max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-gray-200 bg-white p-6 shadow-2xl">
        <div className="mb-1 flex items-center gap-2">
          <Shield className="h-4 w-4 text-amber-600" />
          <h3 className="text-sm font-bold text-gray-900">SuperAdmin Edit — Daily Request</h3>
        </div>
        <p className="mb-4 text-xs text-gray-500">{terminal.terminal_name} · Capacity: {terminal.approved_daily_capacity}</p>

        <div className="space-y-3">
          {(Object.keys(TRANSFER_LABELS) as (keyof DTTRTransferBreakdown)[]).map((key) => (
            <div key={key}>
              <label className="mb-1 block text-xs font-semibold text-gray-700">{TRANSFER_LABELS[key]}</label>
              <input
                type="number"
                min={0}
                step={1}
                value={values[key]}
                onChange={(e) => {
                  const n = parseInt(e.target.value, 10);
                  setValues((prev) => ({ ...prev, [key]: Number.isNaN(n) ? 0 : n }));
                }}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
          ))}
        </div>

        {overCapacity && (
          <p className="mt-2 text-[11px] text-red-600">Total ({total}) exceeds capacity ({terminal.approved_daily_capacity})</p>
        )}

        <div className="mt-4 space-y-3 border-t border-gray-100 pt-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700">Justification <span className="text-red-500">*</span></label>
            <textarea
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              rows={2}
              placeholder="Reason for this SuperAdmin edit..."
              className="w-full rounded-lg border border-gray-200 p-3 text-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700">Port Authority Approval Reference</label>
            <input
              value={approvalRef}
              onChange={(e) => setApprovalRef(e.target.value)}
              placeholder="e.g. NPA/APT/2026/0711"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-emerald-300"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700">Upload Approval Document</label>
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-gray-300 px-3 py-3 text-xs text-gray-500 hover:border-emerald-300 hover:bg-emerald-50/50">
              <Upload className="h-4 w-4" />
              {docName || "Choose file (PDF, JPG, PNG)"}
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={(e) => setDocName(e.target.files?.[0]?.name ?? "")}
              />
            </label>
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
          >
            {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Changes
          </button>
        </div>
      </div>
    </>
  );
}

function ConfigureModeModal({
  terminal,
  onSave,
  onClose,
  isSaving,
}: {
  terminal: DTTRTerminalRequest;
  onSave: (payload: ConfigureModePayload) => void;
  onClose: () => void;
  isSaving?: boolean;
}) {
  const [mode, setMode] = useState<DTTRRequestMode>(terminal.request_mode);
  const [template, setTemplate] = useState<DTTRTransferBreakdown>(
    terminal.automated_template ?? { ...terminal.requested },
  );

  const templateTotal = sumBreakdown(template);
  const overCapacity = templateTotal > terminal.approved_daily_capacity;

  function handleSave() {
    if (mode === "AUTOMATED" && overCapacity) {
      toast.error("Automated template total exceeds approved capacity.");
      return;
    }
    onSave({
      request_mode: mode,
      automated_template: mode === "AUTOMATED" ? template : undefined,
    });
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-full max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-gray-200 bg-white p-6 shadow-2xl">
        <h3 className="text-sm font-bold text-gray-900">Configure Request Mode</h3>
        <p className="mt-0.5 text-xs text-gray-500">{terminal.terminal_name}</p>

        <div className="mt-4 grid grid-cols-2 gap-2">
          {(["MANUAL", "AUTOMATED"] as DTTRRequestMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex flex-col items-center gap-1 rounded-xl border p-4 text-xs font-semibold transition-colors ${
                mode === m
                  ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {m === "MANUAL" ? <Hand className="h-5 w-5" /> : <Zap className="h-5 w-5" />}
              {m === "MANUAL" ? "Manual Mode" : "Automated Mode"}
              <span className="text-[10px] font-normal text-gray-500">
                {m === "MANUAL" ? "Terminal submits daily" : "Auto-populated from template"}
              </span>
            </button>
          ))}
        </div>

        {mode === "AUTOMATED" && (
          <div className="mt-4 space-y-3 rounded-lg border border-violet-100 bg-violet-50/50 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-violet-600">Automated Template</p>
            {(Object.keys(TRANSFER_LABELS) as (keyof DTTRTransferBreakdown)[]).map((key) => (
              <div key={key}>
                <label className="mb-1 block text-xs font-semibold text-gray-700">{TRANSFER_LABELS[key]}</label>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={template[key]}
                  onChange={(e) => {
                    const n = parseInt(e.target.value, 10);
                    setTemplate((prev) => ({ ...prev, [key]: Number.isNaN(n) ? 0 : n }));
                  }}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-300"
                />
              </div>
            ))}
            <p className={`text-xs font-semibold ${overCapacity ? "text-red-600" : "text-gray-600"}`}>
              Template total: {templateTotal} / {terminal.approved_daily_capacity}
            </p>
          </div>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Configuration
          </button>
        </div>
      </div>
    </>
  );
}

function HistoryDrawer({
  terminal,
  onClose,
}: {
  terminal: DTTRTerminalRequest;
  onClose: () => void;
}) {
  const { data: history = [], isLoading, isError } = useDttrSubmissions(terminal.id);

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[480px] flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between bg-[#0f1e2e] px-6 py-4">
          <div>
            <p className="text-sm font-bold text-white">Submission History</p>
            <p className="text-[11px] text-gray-400">{terminal.terminal_name}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-white/10"><X className="h-4 w-4" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex flex-col items-center gap-2 py-8">
              <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
              <p className="text-sm text-gray-400">Loading submission history...</p>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center gap-2 py-8">
              <AlertCircle className="h-8 w-8 text-red-300" />
              <p className="text-sm text-gray-400">Failed to load submission history</p>
            </div>
          ) : history.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">No submission history for this terminal.</p>
          ) : (
            <div className="space-y-3">
              {history.map((s) => (
                <div key={s.id} className="rounded-xl border border-gray-100 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-800">{formatTimestamp(s.submitted_at)}</span>
                    <ModeBadge mode={s.request_mode} />
                  </div>
                  <p className="text-[11px] text-gray-500">Submitted by {s.submitted_by}</p>
                  <div className="mt-2"><BreakdownCell breakdown={s.breakdown} /></div>
                  <p className="mt-2 text-xs font-bold text-gray-700">Total: {s.total_requested} / {s.approved_capacity}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export function DTTRPage() {
  const user = useAuthStore((s) => s.user);
  const isSuperAdmin = user?.is_super_admin ?? false;

  const [page, setPage] = useState(1);
  const { search, setSearch, debouncedSearch, resetSearch } = useDebouncedSearch("", () => setPage(1));
  const [dateFilter, setDateFilter] = useState("");
  const [modeFilter, setModeFilter] = useState<"All" | DTTRRequestMode>("All");
  const [showFilters, setShowFilters] = useState(false);

  const [submitTarget, setSubmitTarget] = useState<DTTRTerminalRequest | null>(null);
  const [editTarget, setEditTarget] = useState<DTTRTerminalRequest | null>(null);
  const [configTarget, setConfigTarget] = useState<DTTRTerminalRequest | null>(null);
  const [historyTarget, setHistoryTarget] = useState<DTTRTerminalRequest | null>(null);

  const listParams: DTTRListParams = {
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
    date: dateFilter || undefined,
    request_mode: modeFilter !== "All" ? modeFilter : undefined,
  };

  const { data: summary, isLoading: summaryLoading } = useDttrSummary();
  const { data: dttrData, isLoading, isError } = useDttr(listParams);

  const submitRequest = useSubmitDttrRequest();
  const editDttr = useEditDttr();
  const configureMode = useConfigureDttrMode();

  const terminals = Array.isArray(dttrData?.data) ? dttrData.data : [];
  const meta = dttrData?.meta;
  const totalPages = meta?.total_pages ?? 1;
  const totalCount = meta?.total ?? 0;
  const hasActiveFilters = debouncedSearch || dateFilter || modeFilter !== "All";

  function clearFilters() {
    resetSearch();
    setDateFilter("");
    setModeFilter("All");
    setPage(1);
  }

  function handleSubmitRequest(terminal: DTTRTerminalRequest, breakdown: DTTRTransferBreakdown) {
    submitRequest.mutate(
      { id: terminal.id, payload: breakdown },
      {
        onSuccess: (res) => {
          toast.success(res.message ?? "Daily truck request successfully submitted.");
          setSubmitTarget(null);
        },
      },
    );
  }

  function handleSuperAdminSave(terminal: DTTRTerminalRequest, payload: EditDttrPayload) {
    editDttr.mutate(
      { id: terminal.id, payload },
      {
        onSuccess: (res) => {
          toast.success(res.message ?? "Terminal daily request updated successfully.");
          setEditTarget(null);
        },
      },
    );
  }

  function handleConfigureSave(terminal: DTTRTerminalRequest, payload: ConfigureModePayload) {
    configureMode.mutate(
      { id: terminal.id, payload },
      {
        onSuccess: (res) => {
          toast.success(
            res.message ??
              `Request mode updated to ${payload.request_mode === "AUTOMATED" ? "Automated" : "Manual"}.`,
          );
          setConfigTarget(null);
        },
      },
    );
  }

  function ActionsMenu({ terminal }: { terminal: DTTRTerminalRequest }) {
    return (
      <TableActionsDropdown>
        {(close) => (
          <>
            <button
              onClick={() => { close(); setSubmitTarget(terminal); }}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <Plus className="h-3.5 w-3.5" /> Submit Daily Request
            </button>
            <button
              onClick={() => { close(); setHistoryTarget(terminal); }}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <History className="h-3.5 w-3.5" /> Submission History
            </button>
            {isSuperAdmin && (
              <>
                <button
                  onClick={() => { close(); setEditTarget(terminal); }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-amber-700 hover:bg-gray-50"
                >
                  <Edit2 className="h-3.5 w-3.5" /> Edit Request (SuperAdmin)
                </button>
                <button
                  onClick={() => { close(); setConfigTarget(terminal); }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-violet-700 hover:bg-gray-50"
                >
                  <Settings2 className="h-3.5 w-3.5" /> Configure Mode
                </button>
              </>
            )}
          </>
        )}
      </TableActionsDropdown>
    );
  }

  const staticTH = (label: string) => (
    <th className="px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">{label}</th>
  );

  return (
    <div className="space-y-5 p-6">
      {submitTarget && (
        <SubmitRequestModal
          terminal={submitTarget}
          onSubmit={(b) => handleSubmitRequest(submitTarget, b)}
          onClose={() => setSubmitTarget(null)}
          isSubmitting={submitRequest.isPending}
        />
      )}
      {editTarget && isSuperAdmin && (
        <SuperAdminEditModal
          terminal={editTarget}
          onSave={(payload) => handleSuperAdminSave(editTarget, payload)}
          onClose={() => setEditTarget(null)}
          isSaving={editDttr.isPending}
        />
      )}
      {configTarget && isSuperAdmin && (
        <ConfigureModeModal
          terminal={configTarget}
          onSave={(payload) => handleConfigureSave(configTarget, payload)}
          onClose={() => setConfigTarget(null)}
          isSaving={configureMode.isPending}
        />
      )}
      {historyTarget && (
        <HistoryDrawer terminal={historyTarget} onClose={() => setHistoryTarget(null)} />
      )}

      <nav className="flex items-center gap-1.5 text-xs text-gray-500">
        <span>Operations</span>
        <Chevron className="h-3 w-3" />
        <span className="font-semibold text-gray-800">Daily Terminal Truck Requests</span>
      </nav>

      <SummaryPanel summary={summary} isLoading={summaryLoading} />

      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="flex items-center border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0f1e2e]">
              <ClipboardList className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900">DTTR Registry</h1>
              <p className="text-xs text-gray-500">Daily truck request records by terminal — exports, imports, empties &amp; gatepass</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-60 flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search terminal name or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-emerald-300 focus:bg-white focus:ring-2 focus:ring-emerald-100"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
              showFilters || hasActiveFilters ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Filter className="h-4 w-4" /> Filters
          </button>
        </div>

        {showFilters && (
          <div className="mt-3 flex flex-wrap items-end gap-4 border-t border-gray-100 pt-3">
            <div>
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-gray-400">Last Updated Date</label>
              <div className="relative">
                <Calendar className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => { setDateFilter(e.target.value); setPage(1); }}
                  className="rounded-lg border border-gray-200 py-1.5 pl-8 pr-3 text-xs text-gray-700 outline-none focus:border-emerald-300"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-gray-400">Request Mode</label>
              <div className="relative">
                <select
                  value={modeFilter}
                  onChange={(e) => { setModeFilter(e.target.value as "All" | DTTRRequestMode); setPage(1); }}
                  className="appearance-none rounded-lg border border-gray-200 bg-white py-1.5 pl-3 pr-8 text-xs text-gray-700 outline-none focus:border-emerald-300"
                >
                  <option value="All">All Modes</option>
                  <option value="MANUAL">Manual</option>
                  <option value="AUTOMATED">Automated</option>
                </select>
                <ChevronDown className="pointer-events-none absolute bottom-2.5 right-2 h-3 w-3 text-gray-400" />
              </div>
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50"
              >
                <X className="h-3 w-3" /> Clear All
              </button>
            )}
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500">
        Showing <span className="font-semibold text-gray-800">{totalCount}</span> terminal{totalCount !== 1 ? "s" : ""}
        {hasActiveFilters && " matching your filters"}
      </p>

      <div className="min-w-0 rounded-xl border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-max w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                {staticTH("S/No.")}
                {staticTH("Terminal Name")}
                {staticTH("Approved Capacity")}
                {staticTH("Total Requested")}
                {staticTH("Transfer Breakdown")}
                {staticTH("Last Updated")}
                {staticTH("Request Mode")}
                <th className="px-3 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
                      <p className="text-sm font-medium text-gray-400">Loading terminal requests...</p>
                    </div>
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <AlertCircle className="h-8 w-8 text-red-300" />
                      <p className="text-sm font-medium text-gray-400">Failed to load terminal requests</p>
                    </div>
                  </td>
                </tr>
              ) : terminals.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center">
                    <ClipboardList className="mx-auto h-8 w-8 text-gray-300" />
                    <p className="mt-2 text-sm font-medium text-gray-400">No terminals match your filters</p>
                    {hasActiveFilters && (
                      <button onClick={clearFilters} className="mt-2 text-xs font-medium text-emerald-600 hover:underline">
                        Clear all filters
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                terminals.map((t, idx) => {
                  const total = sumBreakdown(t.requested);
                  const noRequest = total === 0;
                  return (
                    <tr key={t.id} className="transition-colors hover:bg-gray-50/80">
                      <td className="px-3 py-3 text-xs font-medium text-gray-400">{(page - 1) * PAGE_SIZE + idx + 1}</td>
                      <td className="px-3 py-3">
                        <p className="text-sm font-semibold text-gray-900">{t.terminal_name}</p>
                        <p className="font-mono text-[10px] text-gray-400">{t.terminal_code}</p>
                      </td>
                      <td className="px-3 py-3">
                        <span className="text-sm font-bold text-gray-800">{t.approved_daily_capacity}</span>
                      </td>
                      <td className="px-3 py-3">
                        <CapacityBar requested={total} capacity={t.approved_daily_capacity} />
                        {noRequest && (
                          <span className="mt-1 inline-flex items-center gap-1 text-[10px] text-amber-600">
                            <AlertTriangle className="h-3 w-3" /> No request submitted
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-3"><BreakdownCell breakdown={t.requested} /></td>
                      <td className="px-3 py-3">
                        <span className="flex items-center gap-1 text-[11px] text-gray-500">
                          <Clock className="h-3 w-3" />{formatTimestamp(t.last_updated_at)}
                        </span>
                        <span className="text-[10px] text-gray-400">{formatDate(t.last_updated_at)}</span>
                      </td>
                      <td className="px-3 py-3"><ModeBadge mode={t.request_mode} /></td>
                      <td className="px-3 py-3 text-center"><ActionsMenu terminal={t} /></td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
          <p className="text-xs text-gray-500">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, totalCount)} of {totalCount}
          </p>
          <div className="flex items-center gap-1">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-lg border border-gray-200 p-1.5 disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)} className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium ${p === page ? "bg-emerald-600 text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>{p}</button>
            ))}
            <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="rounded-lg border border-gray-200 p-1.5 disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button>
          </div>
        </div>
      </div>
    </div>
  );
}

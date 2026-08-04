"use client";

import { useState } from "react";
import {
  FileCheck,
  Search,
  Download,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronRight as Chevron,
  X,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  AlertTriangle,
  FileText,
  Building2,
  RefreshCw,
  Truck,
  Link2,
  LinkIcon,
  Activity,
  Upload,
  Hash,
  Ban,
  Loader2,
  AlertCircle,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { DisplayOptionsMenu } from "@/components/dashboard/DisplayOptionsMenu";
import { TableActionsDropdown } from "@/components/dashboard/TableActionsDropdown";
import type {
  TEP,
  TEPClassification,
  TEPSource,
  TEPMatchStatus,
  TEPStatus,
  TEPActivityType,
  TEPsSummaryResponse,
  TEPsListParams,
} from "@/types/teps.types";
import { useTeps } from "@/hooks/teps/useTeps";
import { useTepsSummary } from "@/hooks/teps/useTepsSummary";
import { useRevokeTEP, useExportTeps } from "@/hooks/teps/useTepActions";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { BulkUploadTepsModal, CreateTepModal } from "@/components/dashboard/TepCreateModals";

// ─── Constants ───
const PAGE_SIZE = 10;

type TabId = "all" | "empty_tdo" | "import_tdo" | "export_tdo" | "gatepass_port" | "gatepass_non_port";

const ALL_CLASSIFICATIONS: TEPClassification[] = [
  "EMPTY_TDO", "IMPORT_TDO", "EXPORT_TDO", "GATEPASS_PORT", "GATEPASS_NON_PORT",
];

const ALL_SOURCES: TEPSource[] = [
  "SHIPPING_LINE", "PORT_TERMINAL", "NON_PORT_TERMINAL", "EPT",
];

const SOURCE_LABELS: Record<TEPSource, string> = {
  SHIPPING_LINE:     "Shipping Line",
  PORT_TERMINAL:     "Port Terminal",
  NON_PORT_TERMINAL: "Non-Port Terminal",
  EPT:               "EPT",
};

const CLASSIFICATION_LABELS: Record<TEPClassification, string> = {
  EMPTY_TDO:         "Empty TDO",
  IMPORT_TDO:        "Import TDO",
  EXPORT_TDO:        "Export TDO",
  GATEPASS_PORT:     "Gatepass (Port)",
  GATEPASS_NON_PORT: "Gatepass (Non-Port)",
};

const STATUS_OPTIONS  = ["All", "ACTIVE", "EXPIRED", "REVOKED"];
const MATCH_OPTIONS   = ["All", "MATCHED", "UNMATCHED"];
const SOURCE_OPTIONS  = ["All", "SHIPPING_LINE", "PORT_TERMINAL", "NON_PORT_TERMINAL", "EPT"];

// ─── Display Options ───
const TOGGLEABLE_COLUMNS = [
  { key: "source",       label: "Source of Upload" },
  { key: "facility",     label: "Facility" },
  { key: "company",      label: "Company" },
  { key: "user_account", label: "User Account" },
  { key: "truck_plate",  label: "Truck Plate No." },
  { key: "expiry_date",  label: "Expiry Date" },
] as const;

type ColumnKey = (typeof TOGGLEABLE_COLUMNS)[number]["key"];
const ALL_COLUMN_KEYS = TOGGLEABLE_COLUMNS.map((c) => c.key) as ColumnKey[];

// ─── Helpers ───
function formatTimestamp(ts: string) {
  return new Date(ts).toLocaleString("en-NG", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
}

function formatDateShort(ts: string) {
  return new Date(ts).toLocaleDateString("en-NG", { day: "2-digit", month: "short", year: "numeric" });
}

function isExpiredDate(ts: string) {
  return new Date(ts) < new Date();
}

// ─── Badges ───
function ClassificationBadge({ type }: { type: TEPClassification }) {
  const map: Record<TEPClassification, string> = {
    EMPTY_TDO:         "bg-sky-50 text-sky-700 border-sky-200",
    IMPORT_TDO:        "bg-indigo-50 text-indigo-700 border-indigo-200",
    EXPORT_TDO:        "bg-violet-50 text-violet-700 border-violet-200",
    GATEPASS_PORT:     "bg-emerald-50 text-emerald-700 border-emerald-200",
    GATEPASS_NON_PORT: "bg-teal-50 text-teal-700 border-teal-200",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap ${map[type]}`}>
      {CLASSIFICATION_LABELS[type]}
    </span>
  );
}

function SourceBadge({ source }: { source: TEPSource }) {
  const map: Record<TEPSource, string> = {
    SHIPPING_LINE:     "bg-blue-50 text-blue-700",
    PORT_TERMINAL:     "bg-orange-50 text-orange-700",
    NON_PORT_TERMINAL: "bg-amber-50 text-amber-700",
    EPT:               "bg-purple-50 text-purple-700",
  };
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium ${map[source]}`}>
      {SOURCE_LABELS[source]}
    </span>
  );
}

function StatusBadge({ status }: { status: TEPStatus }) {
  const map: Record<TEPStatus, string> = {
    ACTIVE:  "bg-emerald-50 text-emerald-700 border-emerald-200",
    EXPIRED: "bg-gray-100 text-gray-500 border-gray-200",
    REVOKED: "bg-red-50 text-red-700 border-red-200",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${map[status]}`}>
      {status}
    </span>
  );
}

function MatchBadge({ status }: { status: TEPMatchStatus }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${
      status === "MATCHED"
        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
        : "border-amber-200 bg-amber-50 text-amber-700"
    }`}>
      {status === "MATCHED" ? <Link2 className="h-3 w-3" /> : <LinkIcon className="h-3 w-3" />}
      {status === "MATCHED" ? "Matched" : "Unmatched"}
    </span>
  );
}

function ActivityIcon({ type }: { type: TEPActivityType }) {
  const map: Record<TEPActivityType, { cls: string; Icon: React.FC<{ className?: string }> }> = {
    CREATED:   { cls: "text-blue-500",    Icon: FileCheck },
    UPDATED:   { cls: "text-amber-500",   Icon: Activity },
    VALIDATED: { cls: "text-emerald-500", Icon: CheckCircle2 },
    MATCHED:   { cls: "text-emerald-600", Icon: Link2 },
    UNMATCHED: { cls: "text-orange-500",  Icon: LinkIcon },
    REVOKED:   { cls: "text-red-600",     Icon: Ban },
    EXPIRED:   { cls: "text-gray-400",    Icon: Clock },
  };
  const { cls, Icon } = map[type];
  return <Icon className={`h-3.5 w-3.5 ${cls}`} />;
}

// ─── Confirm + Reason dialogs ───
function ConfirmDialog({
  title, message, confirmLabel, danger, onConfirm, onCancel,
}: { title: string; message: string; confirmLabel: string; danger?: boolean; onConfirm: () => void; onCancel: () => void }) {
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onCancel} />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl border border-gray-200 bg-white p-6 shadow-2xl">
        <h3 className="text-sm font-bold text-gray-900">{title}</h3>
        <p className="mt-2 text-sm text-gray-600">{message}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onCancel} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={onConfirm} className={`rounded-lg px-4 py-2 text-sm font-medium text-white ${danger ? "bg-red-600 hover:bg-red-700" : "bg-emerald-600 hover:bg-emerald-700"}`}>{confirmLabel}</button>
        </div>
      </div>
    </>
  );
}

function ReasonDialog({
  title, description, confirmLabel, danger, onConfirm, onCancel,
}: { title: string; description: string; confirmLabel: string; danger?: boolean; onConfirm: (r: string) => void; onCancel: () => void }) {
  const [reason, setReason] = useState("");
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onCancel} />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-gray-200 bg-white p-6 shadow-2xl">
        <h3 className="text-sm font-bold text-gray-900">{title}</h3>
        <p className="mt-1.5 text-xs text-gray-500">{description}</p>
        <div className="mt-4">
          <label className="mb-1.5 block text-xs font-semibold text-gray-700">Reason <span className="text-red-500">*</span></label>
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} placeholder="Enter reason for revocation..." className="w-full rounded-lg border border-gray-200 p-3 text-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100" />
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onCancel} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
          <button disabled={!reason.trim()} onClick={() => reason.trim() && onConfirm(reason.trim())} className={`rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50 ${danger ? "bg-red-600 hover:bg-red-700" : "bg-emerald-600 hover:bg-emerald-700"}`}>{confirmLabel}</button>
        </div>
      </div>
    </>
  );
}

// ─── Summary Panel ───
function SummaryPanel({
  summary,
  isLoading,
}: {
  summary?: TEPsSummaryResponse;
  isLoading?: boolean;
}) {
  const kpis = [
    { label: "Total TEPs",   value: summary?.total ?? 0,    color: "text-blue-400",    bg: "bg-blue-400/10",    Icon: FileCheck },
    { label: "Active",       value: summary?.active ?? 0,   color: "text-emerald-400", bg: "bg-emerald-400/10", Icon: CheckCircle2 },
    { label: "Expired",      value: summary?.expired ?? 0,  color: "text-gray-400",    bg: "bg-gray-400/10",    Icon: Clock },
    { label: "Revoked",      value: summary?.revoked ?? 0,  color: "text-red-400",     bg: "bg-red-400/10",     Icon: XCircle },
    { label: "Matched",      value: summary?.matched ?? 0,  color: "text-cyan-400",    bg: "bg-cyan-400/10",    Icon: Link2 },
    { label: "Unmatched",    value: summary?.unmatched ?? 0,color: "text-amber-400",   bg: "bg-amber-400/10",   Icon: LinkIcon },
  ];

  const classColors: Record<TEPClassification, string> = {
    EMPTY_TDO:         "bg-sky-500",
    IMPORT_TDO:        "bg-indigo-500",
    EXPORT_TDO:        "bg-violet-500",
    GATEPASS_PORT:     "bg-emerald-500",
    GATEPASS_NON_PORT: "bg-teal-500",
  };
  const sourceColors: Record<TEPSource, string> = {
    SHIPPING_LINE:     "bg-blue-500",
    PORT_TERMINAL:     "bg-orange-500",
    NON_PORT_TERMINAL: "bg-amber-500",
    EPT:               "bg-purple-500",
  };

  return (
    <div className="rounded-2xl bg-[#0f1e2e] p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Truck Entry Permits (TEPs)</h1>
          <p className="text-xs text-gray-400">Full TEP database — ETSS-Nigeria logistics platform</p>
        </div>
        <div className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">Live</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {isLoading ? (
          <div className="col-span-full flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-400" />
          </div>
        ) : (
          kpis.map((card) => (
            <div key={card.label} className="rounded-xl bg-white/5 p-4 hover:bg-white/10 transition-colors">
              <div className="mb-2"><div className={`inline-flex rounded-lg p-1.5 ${card.bg}`}><card.Icon className={`h-4 w-4 ${card.color}`} /></div></div>
              <p className="text-2xl font-bold text-white">{card.value}</p>
              <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-gray-500">{card.label}</p>
            </div>
          ))
        )}
      </div>

      {/* Breakdown grid */}
      {!isLoading && (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* By Classification */}
        <div className="rounded-xl bg-white/5 p-4">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">By Classification Type</p>
          <div className="space-y-2">
            {ALL_CLASSIFICATIONS.map((k) => {
              const v = summary?.by_classification?.[k] ?? 0;
              const total = summary?.total ?? 0;
              return (
              <div key={k} className="flex items-center gap-2">
                <span className={`h-2 w-2 shrink-0 rounded-full ${classColors[k]}`} />
                <span className="flex-1 text-xs text-gray-300">{CLASSIFICATION_LABELS[k]}</span>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-20 overflow-hidden rounded-full bg-white/10">
                    <div className={`h-full rounded-full ${classColors[k]}`} style={{ width: total > 0 ? `${(v / total) * 100}%` : "0%" }} />
                  </div>
                  <span className="w-5 text-right text-xs font-bold text-white">{v}</span>
                </div>
              </div>
              );
            })}
          </div>
        </div>

        {/* By Source */}
        <div className="rounded-xl bg-white/5 p-4">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">By Source of Upload</p>
          <div className="space-y-2">
            {ALL_SOURCES.map((k) => {
              const v = summary?.by_source?.[k] ?? 0;
              const total = summary?.total ?? 0;
              return (
              <div key={k} className="flex items-center gap-2">
                <span className={`h-2 w-2 shrink-0 rounded-full ${sourceColors[k]}`} />
                <span className="flex-1 text-xs text-gray-300">{SOURCE_LABELS[k]}</span>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-20 overflow-hidden rounded-full bg-white/10">
                    <div className={`h-full rounded-full ${sourceColors[k]}`} style={{ width: total > 0 ? `${(v / total) * 100}%` : "0%" }} />
                  </div>
                  <span className="w-5 text-right text-xs font-bold text-white">{v}</span>
                </div>
              </div>
              );
            })}
          </div>
        </div>
      </div>
      )}
    </div>
  );
}

function buildListParams(
  activeTab: TabId,
  page: number,
  debouncedSearch: string,
  statusFilter: string,
  matchFilter: string,
  sourceFilter: string,
): TEPsListParams {
  const params: TEPsListParams = {
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
  };

  if (activeTab !== "all") {
    params.category = activeTab;
  }

  if (sourceFilter !== "All") params.source = sourceFilter;
  if (statusFilter !== "All") params.status = statusFilter;
  if (matchFilter !== "All") params.match_status = matchFilter;

  return params;
}

// ─── Main Page ───
export function TEPsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("all");
  const [page, setPage] = useState(1);
  const { search, setSearch, debouncedSearch, resetSearch } = useDebouncedSearch("", () => setPage(1));
  const [statusFilter, setStatusFilter] = useState("All");
  const [matchFilter, setMatchFilter] = useState("All");
  const [sourceFilter, setSourceFilter] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTEP, setSelectedTEP] = useState<TEP | null>(null);
  const [reasonDialog, setReasonDialog] = useState<{
    title: string; description: string; confirmLabel: string;
    onConfirm: (reason: string) => void;
  } | null>(null);
  const [visibleColumns, setVisibleColumns] = useState<Set<ColumnKey>>(new Set(ALL_COLUMN_KEYS));
  const [showCreateTep, setShowCreateTep] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);

  const col = (key: ColumnKey) => visibleColumns.has(key);

  const listParams = buildListParams(
    activeTab,
    page,
    debouncedSearch,
    statusFilter,
    matchFilter,
    sourceFilter,
  );

  const { data: summary, isLoading: summaryLoading } = useTepsSummary();
  const { data: tepsData, isLoading, isError } = useTeps(listParams);
  const revokeTEP = useRevokeTEP();
  const exportTeps = useExportTeps();

  const teps = Array.isArray(tepsData?.data) ? tepsData.data : [];
  const meta = tepsData?.meta;
  const totalPages = meta?.total_pages ?? 1;
  const totalCount = meta?.total ?? 0;

  const lastRefresh = new Date().toLocaleString("en-NG", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true,
  });

  function switchTab(tab: TabId) {
    setActiveTab(tab);
    setPage(1);
    resetSearch();
    setStatusFilter("All");
    setMatchFilter("All");
    setSourceFilter("All");
    setShowFilters(false);
  }

  const tabCounts: Record<TabId, number> = {
    all:               summary?.total ?? 0,
    empty_tdo:         summary?.by_classification?.EMPTY_TDO ?? 0,
    import_tdo:        summary?.by_classification?.IMPORT_TDO ?? 0,
    export_tdo:        summary?.by_classification?.EXPORT_TDO ?? 0,
    gatepass_port:     summary?.by_classification?.GATEPASS_PORT ?? 0,
    gatepass_non_port: summary?.by_classification?.GATEPASS_NON_PORT ?? 0,
  };

  const hasActiveFilters = debouncedSearch || statusFilter !== "All" || matchFilter !== "All" || sourceFilter !== "All";

  function clearFilters() {
    resetSearch();
    setStatusFilter("All");
    setMatchFilter("All");
    setSourceFilter("All");
    setPage(1);
  }

  function handleExportCsv() {
    exportTeps.mutate(listParams, {
      onSuccess: () => toast.success("TEPs exported as CSV."),
    });
  }

  function handleRevoke(tep: TEP) {
    setReasonDialog({
      title: `Revoke TEP — ${tep.reference_number}`,
      description: "This TEP will be permanently revoked. All matched trucks will be unlinked.",
      confirmLabel: "Revoke TEP",
      onConfirm: (reason) => {
        setReasonDialog(null);
        revokeTEP.mutate({ id: tep.id, reason }, {
          onSuccess: () => {
            if (selectedTEP?.id === tep.id) setSelectedTEP(null);
            toast.success(`TEP ${tep.reference_number} has been revoked.`);
          },
        });
      },
    });
  }

  // ─── Action Menu ───
  function ActionsMenu({ tep }: { tep: TEP }) {
    return (
      <TableActionsDropdown width={208}>
        {(close) => (
          <>
            <button onClick={() => { close(); setSelectedTEP(tep); }} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"><Eye className="h-3.5 w-3.5" /> View Details</button>
            {tep.status === "ACTIVE" && (
              <button onClick={() => { close(); handleRevoke(tep); }} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-gray-50"><Ban className="h-3.5 w-3.5" /> Revoke TEP</button>
            )}
          </>
        )}
      </TableActionsDropdown>
    );
  }

  const staticTH = (label: string) => <th className="px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">{label}</th>;

  const TAB_CONFIG: Record<TabId, { label: string; dot: string; short: string }> = {
    all:               { label: "All TEPs",           dot: "bg-gray-500",    short: "ALL" },
    empty_tdo:         { label: "Empty TDO",          dot: "bg-sky-500",     short: "ETD" },
    import_tdo:        { label: "Import TDO",         dot: "bg-indigo-500",  short: "ITD" },
    export_tdo:        { label: "Export TDO",         dot: "bg-violet-500",  short: "XTD" },
    gatepass_port:     { label: "Gatepass (Port)",    dot: "bg-emerald-500", short: "GPP" },
    gatepass_non_port: { label: "Gatepass (Non-Port)",dot: "bg-teal-500",    short: "GPN" },
  };

  const TABS = (["all", "empty_tdo", "import_tdo", "export_tdo", "gatepass_port", "gatepass_non_port"] as TabId[]);

  return (
    <div className="space-y-5 p-6">
      {/* ─── Dialogs ─── */}
      {reasonDialog && <ReasonDialog {...reasonDialog} onCancel={() => setReasonDialog(null)} />}
      {showCreateTep && (
        <CreateTepModal onClose={() => setShowCreateTep(false)} onCreated={() => setPage(1)} />
      )}
      {showBulkUpload && (
        <BulkUploadTepsModal onClose={() => setShowBulkUpload(false)} onUploaded={() => setPage(1)} />
      )}

      {/* ─── TEP Detail Drawer ─── */}
      {selectedTEP && (
        <>
          <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setSelectedTEP(null)} />
          <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[500px] flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between bg-[#0f1e2e] px-6 py-4">
              <div>
                <p className="font-mono text-sm font-bold text-white">{selectedTEP.reference_number}</p>
                <p className="text-[11px] text-gray-400">{CLASSIFICATION_LABELS[selectedTEP.classification]}</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={selectedTEP.status} />
                <button onClick={() => setSelectedTEP(null)} className="rounded-lg p-1.5 text-gray-400 hover:bg-white/10 hover:text-white"><X className="h-4 w-4" /></button>
              </div>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto p-6">
              <div className="flex flex-wrap gap-2">
                <ClassificationBadge type={selectedTEP.classification} />
                <SourceBadge source={selectedTEP.source} />
                <MatchBadge status={selectedTEP.match_status} />
              </div>

              {/* Core details */}
              <div className="rounded-xl border border-gray-100 bg-white">
                <p className="border-b border-gray-100 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">TEP Details</p>
                <div className="divide-y divide-gray-50">
                  {[
                    ["Source of Upload", SOURCE_LABELS[selectedTEP.source]],
                    ["Facility", selectedTEP.facility_name],
                    ["Company", selectedTEP.company_name],
                    ["User Account", selectedTEP.user_account],
                    ["Date Created", formatTimestamp(selectedTEP.created_at)],
                    ["Expiry Date", selectedTEP.expiry_date ? formatTimestamp(selectedTEP.expiry_date) : "—"],
                  ].map(([label, value]) => (
                    <div key={String(label)} className="flex items-start justify-between gap-4 px-4 py-2.5">
                      <p className="shrink-0 text-xs text-gray-500">{String(label)}</p>
                      <p className="text-right text-xs font-medium text-gray-800">{String(value)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Matched Trucks */}
              {selectedTEP.matched_trucks && selectedTEP.matched_trucks.length > 0 && (
                <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                  <p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-600">
                    <Truck className="h-3.5 w-3.5" /> Matched Trucks
                  </p>
                  {selectedTEP.matched_trucks.map((mt, i) => (
                    <div key={i} className="mt-2 rounded-lg bg-white p-3">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-gray-900">{mt.plate_number}</span>
                        <span className="text-[10px] text-gray-500">{formatTimestamp(mt.match_timestamp)}</span>
                      </div>
                      <p className="mt-0.5 text-[11px] text-gray-600">{mt.driver_name} <span className="text-gray-400">• {mt.driver_id}</span></p>
                    </div>
                  ))}
                </div>
              )}

              {/* Activity Log */}
              <div className="rounded-xl border border-gray-100">
                <p className="border-b border-gray-100 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                  Activity Log
                </p>
                <div className="divide-y divide-gray-50">
                  {selectedTEP.activity_log.map((event, i) => (
                    <div key={i} className="flex items-start gap-3 px-4 py-3">
                      <div className="mt-0.5 shrink-0"><ActivityIcon type={event.event_type} /></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-800">{event.event_type.replace(/_/g, " ")}</p>
                        <p className="text-[11px] text-gray-500">{event.details}</p>
                        <p className="mt-0.5 text-[10px] text-gray-400">{event.performed_by} · {formatTimestamp(event.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="border-t border-gray-100 px-6 py-3">
              {selectedTEP.status === "ACTIVE" && (
                <button onClick={() => { setSelectedTEP(null); handleRevoke(selectedTEP); }} className="w-full rounded-lg border border-red-200 bg-red-50 py-2 text-xs font-semibold text-red-600 hover:bg-red-100">
                  Revoke This TEP
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* ─── Breadcrumb ─── */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-500">
        <span>Administration</span>
        <Chevron className="h-3 w-3" />
        <span>TEPs</span>
        <Chevron className="h-3 w-3" />
        <span className="font-semibold text-gray-800">{TAB_CONFIG[activeTab].label}</span>
      </nav>

      {/* ─── Summary Panel ─── */}
      <SummaryPanel summary={summary} isLoading={summaryLoading} />

      {/* ─── Module Header + Tabs ─── */}
      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-6 pb-0 pt-4">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0f1e2e]">
                <FileCheck className="h-4 w-4 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-base font-bold text-gray-900">Truck Entry Permits Registry</h1>
                <p className="text-xs text-gray-500">Monitor all TEPs — Empty TDO, Import TDO, Export TDO, Gatepass (Port) &amp; Gatepass (Non-Port)</p>
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowBulkUpload(true)}
                className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-white px-3 py-2 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-50"
              >
                <Upload className="h-3.5 w-3.5" />
                Bulk Upload
              </button>
              <button
                type="button"
                onClick={() => setShowCreateTep(true)}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-emerald-700"
              >
                <Plus className="h-3.5 w-3.5" />
                Create TEP
              </button>
            </div>
          </div>
          <div className="flex gap-0.5 overflow-x-auto">
            {TABS.map((tab) => {
              const tc = TAB_CONFIG[tab];
              const isActive = activeTab === tab;
              return (
                <button key={tab} onClick={() => switchTab(tab)}
                  className={`flex items-center gap-1.5 whitespace-nowrap rounded-t-lg border-b-2 px-4 py-3 text-xs font-semibold transition-colors ${
                    isActive ? "border-emerald-600 text-emerald-700" : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${tc.dot}`} />
                  {tc.label}
                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                    {tabCounts[tab]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex items-center justify-between px-6 py-2.5">
          <p className="text-xs text-gray-500">
            {activeTab === "all" && "All TEPs across all classification types and sources of upload."}
            {activeTab === "empty_tdo" && "Empty TDOs — uploaded by Shipping Lines for empty container evacuations."}
            {activeTab === "import_tdo" && "Import TDOs — uploaded by Port Terminals for inbound cargo movements."}
            {activeTab === "export_tdo" && "Export TDOs — uploaded by EPTs for outbound cargo dispatch."}
            {activeTab === "gatepass_port" && "Gatepass (Port) — gate admission passes issued by Port Terminals."}
            {activeTab === "gatepass_non_port" && "Gatepass (Non-Port) — gate admission passes issued by Non-Port Terminals."}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
            <RefreshCw className="h-3 w-3" />
            Last refresh: {lastRefresh}
          </div>
        </div>
      </div>

      {/* ─── Toolbar ─── */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-60 flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search TEP ref, plate number, facility or company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm placeholder-gray-400 outline-none focus:border-emerald-300 focus:bg-white focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <button onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${showFilters || hasActiveFilters ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
          >
            <Filter className="h-4 w-4" />Filters
          </button>

          <DisplayOptionsMenu
            columns={TOGGLEABLE_COLUMNS}
            allColumnKeys={ALL_COLUMN_KEYS}
            visibleColumns={visibleColumns}
            onApply={setVisibleColumns}
          />

          <div className="relative group">
            <button className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
              <Download className="h-4 w-4" />Export<ChevronDown className="h-3 w-3" />
            </button>
            <div className="absolute right-0 top-full z-20 mt-1 hidden w-36 rounded-lg border border-gray-200 bg-white py-1 shadow-lg group-hover:block">
              <button
                onClick={handleExportCsv}
                disabled={exportTeps.isPending}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                {exportTeps.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-400" /> : <FileText className="h-3.5 w-3.5 text-gray-400" />}
                CSV
              </button>
              <button onClick={() => toast.info("PDF export — coming soon.")} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"><FileText className="h-3.5 w-3.5 text-red-500" /> PDF</button>
            </div>
          </div>
        </div>

        {showFilters && (
          <div className="mt-3 flex flex-wrap items-end gap-4 border-t border-gray-100 pt-3">
            <div>
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-gray-400">Status</label>
              <div className="relative">
                <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="appearance-none rounded-lg border border-gray-200 bg-white py-1.5 pl-3 pr-8 text-xs text-gray-700 outline-none focus:border-emerald-300">
                  {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s === "All" ? "All Statuses" : s}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute bottom-2.5 right-2 h-3 w-3 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-gray-400">Match Status</label>
              <div className="relative">
                <select value={matchFilter} onChange={(e) => { setMatchFilter(e.target.value); setPage(1); }} className="appearance-none rounded-lg border border-gray-200 bg-white py-1.5 pl-3 pr-8 text-xs text-gray-700 outline-none focus:border-emerald-300">
                  {MATCH_OPTIONS.map((s) => <option key={s} value={s}>{s === "All" ? "All" : s}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute bottom-2.5 right-2 h-3 w-3 text-gray-400" />
              </div>
            </div>

            {activeTab === "all" && (
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-gray-400">Source of Upload</label>
                <div className="relative">
                  <select value={sourceFilter} onChange={(e) => { setSourceFilter(e.target.value); setPage(1); }} className="appearance-none rounded-lg border border-gray-200 bg-white py-1.5 pl-3 pr-8 text-xs text-gray-700 outline-none focus:border-emerald-300">
                    {SOURCE_OPTIONS.map((s) => <option key={s} value={s}>{s === "All" ? "All Sources" : SOURCE_LABELS[s as TEPSource]}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute bottom-2.5 right-2 h-3 w-3 text-gray-400" />
                </div>
              </div>
            )}

            {hasActiveFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50">
                <X className="h-3 w-3" /> Clear All
              </button>
            )}
          </div>
        )}
      </div>

      {/* ─── Results ─── */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">
          Showing <span className="font-semibold text-gray-800">{totalCount}</span> TEP{totalCount !== 1 ? "s" : ""}
          {hasActiveFilters && " matching your filters"}
        </p>
      </div>

      {/* ─── Table ─── */}
      <div className="min-w-0 rounded-xl border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-max w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                {staticTH("S/No.")}
                {staticTH("TEP Ref. No.")}
                {activeTab === "all" && staticTH("Classification")}
                {col("source") && staticTH("Source")}
                {col("facility") && staticTH("Facility")}
                {col("company") && staticTH("Company")}
                {col("user_account") && staticTH("User Account")}
                {col("truck_plate") && staticTH("Plate No.")}
                {staticTH("Match Status")}
                {staticTH("Date Created")}
                {col("expiry_date") && staticTH("Expiry Date")}
                {staticTH("Status")}
                <th className="px-3 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={15} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
                      <p className="text-sm font-medium text-gray-400">Loading TEPs...</p>
                    </div>
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={15} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <AlertCircle className="h-8 w-8 text-red-300" />
                      <p className="text-sm font-medium text-gray-400">Failed to load TEPs</p>
                    </div>
                  </td>
                </tr>
              ) : teps.length === 0 ? (
                <tr>
                  <td colSpan={15} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <FileCheck className="h-8 w-8 text-gray-300" />
                      <p className="text-sm font-medium text-gray-400">No TEPs match your filters</p>
                      {hasActiveFilters && <button onClick={clearFilters} className="text-xs font-medium text-emerald-600 hover:underline">Clear all filters</button>}
                    </div>
                  </td>
                </tr>
              ) : (
                teps.map((t, idx) => (
                  <tr key={t.id} className="transition-colors hover:bg-gray-50/80">
                    {/* S/No */}
                    <td className="px-3 py-3 text-xs font-medium text-gray-400">{(page - 1) * PAGE_SIZE + idx + 1}</td>

                    {/* Ref No — clickable */}
                    <td className="px-3 py-3">
                      <button onClick={() => setSelectedTEP(t)} className="flex items-center gap-1 font-mono text-xs font-bold text-emerald-700 hover:underline">
                        <Hash className="h-3 w-3" />{t.reference_number}
                      </button>
                    </td>

                    {/* Classification (all tab only) */}
                    {activeTab === "all" && <td className="px-3 py-3"><ClassificationBadge type={t.classification} /></td>}

                    {/* Source */}
                    {col("source") && <td className="px-3 py-3"><SourceBadge source={t.source} /></td>}

                    {/* Facility */}
                    {col("facility") && (
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1">
                          <Building2 className="h-3 w-3 shrink-0 text-gray-400" />
                          <span className="text-xs text-gray-700">{t.facility_name}</span>
                        </div>
                      </td>
                    )}

                    {/* Company */}
                    {col("company") && <td className="px-3 py-3 text-xs font-medium text-gray-800">{t.company_name}</td>}

                    {/* User Account */}
                    {col("user_account") && <td className="px-3 py-3 text-xs text-gray-600">{t.user_account}</td>}

                    {/* Truck Plate */}
                    {col("truck_plate") && (
                      <td className="px-3 py-3">
                        {t.truck_plate_number ? (
                          <div className="flex items-center gap-1">
                            <Truck className="h-3 w-3 text-gray-400" />
                            <span className="font-mono text-xs font-semibold text-gray-800">{t.truck_plate_number}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                    )}

                    {/* Match Status */}
                    <td className="px-3 py-3"><MatchBadge status={t.match_status} /></td>

                    {/* Date Created */}
                    <td className="px-3 py-3">
                      <span className="flex items-center gap-1 text-[11px] text-gray-500">
                        <Clock className="h-3 w-3" />{formatTimestamp(t.created_at)}
                      </span>
                    </td>

                    {/* Expiry Date */}
                    {col("expiry_date") && (
                      <td className="px-3 py-3">
                        {t.expiry_date ? (
                          <span className={`text-xs font-medium ${isExpiredDate(t.expiry_date) ? "text-red-600" : "text-gray-700"}`}>
                            {isExpiredDate(t.expiry_date) && <AlertTriangle className="mr-1 inline h-3 w-3" />}
                            {formatDateShort(t.expiry_date)}
                          </span>
                        ) : <span className="text-xs text-gray-400">—</span>}
                      </td>
                    )}

                    {/* Status */}
                    <td className="px-3 py-3"><StatusBadge status={t.status} /></td>

                    {/* Actions */}
                    <td className="px-3 py-3 text-center"><ActionsMenu tep={t} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ─── Pagination ─── */}
        <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
          <p className="text-xs text-gray-500">
            Showing <span className="font-medium text-gray-700">{teps.length > 0 ? (page - 1) * PAGE_SIZE + 1 : 0}</span>–
            <span className="font-medium text-gray-700">{(page - 1) * PAGE_SIZE + teps.length}</span> of{" "}
            <span className="font-medium text-gray-700">{totalCount}</span> TEPs
          </p>
          <div className="flex items-center gap-1">
            <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="rounded-lg border border-gray-200 p-1.5 text-gray-500 hover:bg-gray-50 disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)} className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium transition-colors ${p === page ? "bg-emerald-600 text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>{p}</button>
            ))}
            <button disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="rounded-lg border border-gray-200 p-1.5 text-gray-500 hover:bg-gray-50 disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button>
          </div>
        </div>
      </div>

   
    </div>
  );
}

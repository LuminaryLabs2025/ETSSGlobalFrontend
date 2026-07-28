"use client";

import { useState } from "react";
import {
  Landmark,
  Search,
  Download,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  Clock,
  CheckCircle2,
  XCircle,
  Archive,
  Power,
  Ban,
  Eye,
  Edit2,
  MapPin,
  Truck,
  Timer,
  Plus,
  FileText,
  AlertCircle,
  Anchor,
  Warehouse,
  Loader2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { toast } from "sonner";
import {
  portTerminalChartData,
  nonPortTerminalChartData,
} from "@/lib/terminals-mock-data";
import type {
  Terminal,
  TerminalDisplayStatus,
  TerminalsSummaryResponse,
} from "@/types/terminals.types";
import { getTerminalDisplayStatus } from "@/types/terminals.types";
import { useTerminals } from "@/hooks/terminals/useTerminals";
import { useTerminalsSummary } from "@/hooks/terminals/useTerminalsSummary";
import {
  useEnableTerminal,
  useDisableTerminal,
  useArchiveTerminal,
} from "@/hooks/terminals/useTerminalActions";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { DisplayOptionsMenu } from "@/components/dashboard/DisplayOptionsMenu";
import { TableActionsDropdown } from "@/components/dashboard/TableActionsDropdown";

// ─── Constants ───
const PAGE_SIZE = 10;

const TERMINAL_TYPES = [
  { value: "All", label: "All Types" },
  { value: "PORT_TERMINAL", label: "Port Terminal" },
  { value: "NON_PORT_TERMINAL", label: "Non-Port Terminal" },
];

const STATUSES = [
  { value: "All", label: "All Statuses" },
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "ARCHIVED", label: "Archived" },
];

const TOGGLEABLE_COLUMNS = [
  { key: "terminal_type", label: "Terminal Type" },
  { key: "terminal_code", label: "Terminal Code" },
  { key: "location", label: "Location/Address" },
  { key: "daily_capacity", label: "Approved Daily Capacity" },
  { key: "hourly_capacity", label: "Hourly TAT Capacity" },
  { key: "status", label: "Operational Status" },
  { key: "created_at", label: "Created At" },
  { key: "updated_at", label: "Last Updated" },
] as const;

type ColumnKey = typeof TOGGLEABLE_COLUMNS[number]["key"];
const ALL_COLUMN_KEYS = TOGGLEABLE_COLUMNS.map((c) => c.key);

// ─── Helpers ───
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

// ─── Status Badge ───
function StatusBadge({ status }: { status: TerminalDisplayStatus }) {
  const config: Record<TerminalDisplayStatus, { cls: string; Icon: React.ElementType; label: string }> = {
    ACTIVE:   { cls: "bg-emerald-50 text-emerald-700 border-emerald-200", Icon: CheckCircle2, label: "Active" },
    INACTIVE: { cls: "bg-red-50 text-red-700 border-red-200",             Icon: XCircle,     label: "Inactive" },
    ARCHIVED: { cls: "bg-gray-50 text-gray-500 border-gray-200",           Icon: Archive,     label: "Archived" },
  };
  const { cls, Icon, label } = config[status];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${cls}`}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}

// ─── Terminal Type Badge ───
function TypeBadge({ type }: { type: Terminal["terminal_type"] }) {
  if (type === "PORT_TERMINAL") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700">
        <Anchor className="h-3 w-3" />
        Port Terminal
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
      <Warehouse className="h-3 w-3" />
      Non-Port Terminal
    </span>
  );
}

// ─── Confirm Dialog ───
function ConfirmDialog({
  title,
  message,
  confirmLabel,
  danger,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onCancel} />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl border border-gray-200 bg-white p-6 shadow-2xl">
        <h3 className="text-sm font-bold text-gray-900">{title}</h3>
        <p className="mt-2 text-sm text-gray-600">{message}</p>
        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`rounded-lg px-4 py-2 text-sm font-medium text-white ${
              danger ? "bg-red-600 hover:bg-red-700" : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Terminal Detail Drawer ───
function TerminalDetailDrawer({
  terminal,
  onClose,
}: {
  terminal: Terminal;
  onClose: () => void;
}) {
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[480px] flex-col bg-white shadow-2xl">
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-[#0f1e2e] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600/20">
              {terminal.terminal_type === "PORT_TERMINAL"
                ? <Anchor className="h-5 w-5 text-emerald-400" />
                : <Warehouse className="h-5 w-5 text-emerald-400" />
              }
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">{terminal.name}</h2>
              <p className="text-[11px] font-mono text-emerald-400">{terminal.terminal_code}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Status + Type */}
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={getTerminalDisplayStatus(terminal)} />
            <TypeBadge type={terminal.terminal_type} />
            {terminal.location && (
              <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-700">
                {terminal.location === "APAPA" ? "Apapa Zone" : terminal.location === "TINCAN" ? "Tincan Zone" : terminal.location}
              </span>
            )}
          </div>

          {/* Capacity Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <div className="mb-2 flex items-center gap-2">
                <div className="rounded-lg bg-blue-100 p-1.5">
                  <Truck className="h-3.5 w-3.5 text-blue-600" />
                </div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Daily Capacity</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {terminal.approved_daily_truck_capacity.toLocaleString()}
              </p>
              <p className="mt-0.5 text-[11px] text-gray-400">trucks / day</p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <div className="mb-2 flex items-center gap-2">
                <div className="rounded-lg bg-emerald-100 p-1.5">
                  <Timer className="h-3.5 w-3.5 text-emerald-600" />
                </div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Hourly TAT</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {terminal.approved_trucks_per_hour.toLocaleString()}
              </p>
              <p className="mt-0.5 text-[11px] text-gray-400">trucks / hour</p>
            </div>
          </div>

          {/* Details */}
          <div className="rounded-xl border border-gray-100 bg-white">
            <div className="border-b border-gray-100 px-4 py-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Terminal Details</p>
            </div>
            <div className="divide-y divide-gray-50">
              {[
                { label: "Terminal ID", value: terminal.id, mono: true },
                { label: "Terminal Name", value: terminal.name },
                { label: "Terminal Code", value: terminal.terminal_code, mono: true },
                { label: "Terminal Type", value: terminal.terminal_type === "PORT_TERMINAL" ? "Port Terminal" : "Non-Port Terminal" },
                { label: "Location", value: terminal.location },
                { label: "Address", value: terminal.address },
                { label: "Booking Status", value: terminal.booking_status },
              ].map(({ label, value, mono }) => (
                <div key={label} className="flex items-start justify-between gap-4 px-4 py-3">
                  <p className="shrink-0 text-xs text-gray-500">{label}</p>
                  <p className={`text-right text-xs font-medium text-gray-800 ${mono ? "font-mono" : ""}`}>{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Timestamps */}
          <div className="rounded-xl border border-gray-100 bg-white">
            <div className="border-b border-gray-100 px-4 py-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Timestamps</p>
            </div>
            <div className="divide-y divide-gray-50">
              <div className="flex items-center justify-between px-4 py-3">
                <p className="text-xs text-gray-500">Created At</p>
                <p className="flex items-center gap-1 text-xs font-medium text-gray-800">
                  <Clock className="h-3 w-3 text-gray-400" />
                  {formatTimestamp(terminal.created_at)}
                </p>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <p className="text-xs text-gray-500">Last Updated</p>
                <p className="flex items-center gap-1 text-xs font-medium text-gray-800">
                  <Clock className="h-3 w-3 text-gray-400" />
                  {formatTimestamp(terminal.updated_at)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="border-t border-gray-100 px-6 py-4">
          <p className="text-[10px] text-gray-400 text-center">
            Terminal record — ETSS-Nigeria Platform
          </p>
        </div>
      </div>
    </>
  );
}

// ─── Actions Menu ───
function ActionsMenu({
  terminal,
  onAction,
}: {
  terminal: Terminal;
  onAction: (action: string, t: Terminal) => void;
}) {
  const displayStatus = getTerminalDisplayStatus(terminal);

  const actions: { label: string; icon: React.ElementType; action: string; danger?: boolean }[] = [
    { label: "View Details", icon: Eye, action: "view" },
    { label: "Edit Terminal", icon: Edit2, action: "edit" },
  ];

  if (displayStatus === "ACTIVE") {
    actions.push({ label: "Disable Terminal", icon: Ban, action: "disable", danger: true });
    actions.push({ label: "Archive Terminal", icon: Archive, action: "archive", danger: true });
  } else if (displayStatus === "INACTIVE") {
    actions.push({ label: "Enable Terminal", icon: Power, action: "enable" });
    actions.push({ label: "Archive Terminal", icon: Archive, action: "archive", danger: true });
  } else if (displayStatus === "ARCHIVED") {
    actions.push({ label: "Enable Terminal", icon: Power, action: "enable" });
  }

  return (
    <TableActionsDropdown width={208}>
      {(close) => (
        <>
          {actions.map((a) => (
            <button
              key={a.action}
              onClick={() => { close(); onAction(a.action, terminal); }}
              className={`flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-gray-50 ${
                a.danger ? "text-red-600" : "text-gray-700"
              }`}
            >
              <a.icon className="h-3.5 w-3.5" />
              {a.label}
            </button>
          ))}
        </>
      )}
    </TableActionsDropdown>
  );
}

// ─── Summary Panel ───
function SummaryPanel({
  summary,
  isLoading,
  onAddTerminal,
}: {
  summary?: TerminalsSummaryResponse;
  isLoading?: boolean;
  onAddTerminal: () => void;
}) {
  const cards = [
    { label: "Total Terminals",    value: summary?.total ?? 0,                      Icon: Landmark,     color: "text-blue-400",    bg: "bg-blue-400/10" },
    { label: "Port Terminals",      value: summary?.port_terminals ?? 0,             Icon: Anchor,       color: "text-cyan-400",    bg: "bg-cyan-400/10" },
    { label: "Non-Port Terminals",  value: summary?.non_port_terminals ?? 0,         Icon: Warehouse,    color: "text-amber-400",   bg: "bg-amber-400/10" },
    { label: "Enabled",             value: summary?.enabled ?? 0,                    Icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-400/10" },
    { label: "Disabled",            value: summary?.disabled ?? 0,                   Icon: XCircle,      color: "text-red-400",     bg: "bg-red-400/10" },
    { label: "Avg Hourly Capacity", value: `${summary?.avg_trucks_per_hour ?? 0}/hr`, Icon: Timer,     color: "text-violet-400", bg: "bg-violet-400/10" },
  ];

  return (
    <div className="rounded-2xl bg-[#0f1e2e] p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Terminal Management</h1>
          <p className="text-xs text-gray-400">All registered terminals across ETSS-Nigeria platform</p>
        </div>
        <button
          onClick={onAddTerminal}
          className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-emerald-700"
        >
          <Plus className="h-3.5 w-3.5" />
          Add New Terminal
        </button>
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

// ─── Terminal Charts ───
function TerminalCharts() {
  const commonTooltipStyle = {
    fontSize: 12,
    borderRadius: 8,
    border: "1px solid #e5e7eb",
  };

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
      {/* ── Port Terminals Chart ── */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100">
              <Anchor className="h-3.5 w-3.5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Port Terminals — Capacity Overview</h3>
              <p className="text-[11px] text-gray-500">
                Daily Approved Capacity vs DTTR vs Live Bookings — Apapa &amp; Tincan Axis
              </p>
            </div>
          </div>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={portTerminalChartData} barCategoryGap="18%" barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="terminal" tick={{ fontSize: 9 }} interval={0} />
              <YAxis tick={{ fontSize: 10 }} width={40} />
              <Tooltip contentStyle={commonTooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="approved_daily_capacity" name="Approved Daily Cap." fill="#3b82f6" radius={[3, 3, 0, 0]} />
              <Bar dataKey="dttr"                    name="DTTR"                fill="#10b981" radius={[3, 3, 0, 0]} />
              <Bar dataKey="live_booking_count"       name="Live Bookings"       fill="#f59e0b" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 flex flex-wrap gap-3 border-t border-gray-100 pt-3">
          <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
            <span className="inline-block h-2.5 w-2.5 rounded-sm bg-blue-500" />
            <span>Approved Daily Cap. = max scheduled trucks/day</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
            <span className="inline-block h-2.5 w-2.5 rounded-sm bg-emerald-500" />
            <span>DTTR = Daily Truck Turnaround Rate</span>
          </div>
        </div>
      </div>

      {/* ── Non-Port Terminals Chart ── */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100">
              <Warehouse className="h-3.5 w-3.5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Non-Port Terminals — Capacity Overview</h3>
              <p className="text-[11px] text-gray-500">
                Daily Approved Capacity vs DTTR vs Live Bookings — Apapa &amp; Tincan Non-Port Axis
              </p>
            </div>
          </div>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={nonPortTerminalChartData} barCategoryGap="25%" barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="terminal" tick={{ fontSize: 9 }} interval={0} />
              <YAxis tick={{ fontSize: 10 }} width={40} />
              <Tooltip contentStyle={commonTooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="approved_daily_capacity" name="Approved Daily Cap." fill="#3b82f6" radius={[3, 3, 0, 0]} />
              <Bar dataKey="dttr"                    name="DTTR"                fill="#10b981" radius={[3, 3, 0, 0]} />
              <Bar dataKey="live_booking_count"       name="Live Bookings"       fill="#f59e0b" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 border-t border-gray-100 pt-3">
          <p className="text-[11px] text-gray-500">
            Bars at <span className="font-medium text-gray-700">0</span> indicate inactive or archived terminals excluded from operations.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───
export function TerminalsPage() {
  const [page, setPage] = useState(1);
  const { search, setSearch, debouncedSearch, resetSearch } = useDebouncedSearch("", () => setPage(1));
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<Set<ColumnKey>>(
    new Set(TOGGLEABLE_COLUMNS.map((c) => c.key))
  );
  const [selectedTerminal, setSelectedTerminal] = useState<Terminal | null>(null);
  const [confirm, setConfirm] = useState<{
    title: string;
    message: string;
    confirmLabel: string;
    danger?: boolean;
    onConfirm: () => void;
  } | null>(null);

  // ─── API Hooks ───
  const { data: summary, isLoading: summaryLoading } = useTerminalsSummary();
  const { data: terminalsData, isLoading, isError } = useTerminals({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
    type: typeFilter !== "All" ? (typeFilter as Terminal["terminal_type"]) : undefined,
    status: statusFilter !== "All" ? statusFilter : undefined,
  });

  const enableTerminal = useEnableTerminal();
  const disableTerminal = useDisableTerminal();
  const archiveTerminal = useArchiveTerminal();

  const terminals = Array.isArray(terminalsData?.data) ? terminalsData.data : [];
  const meta = terminalsData?.meta;
  const totalPages = meta?.total_pages ?? 1;
  const totalCount = meta?.total ?? 0;

  const hasActiveFilters = debouncedSearch || typeFilter !== "All" || statusFilter !== "All";
  const activeFilterCount = [typeFilter !== "All", statusFilter !== "All"].filter(Boolean).length;

  function clearFilters() {
    resetSearch();
    setTypeFilter("All");
    setStatusFilter("All");
    setPage(1);
  }

  // ─── Actions ───
  function handleAction(action: string, terminal: Terminal) {
    if (action === "view") {
      setSelectedTerminal(terminal);
      return;
    }

    if (action === "edit") {
      toast.info(`Edit "${terminal.name}" — coming soon.`);
      return;
    }

    if (action === "enable") {
      setConfirm({
        title: "Enable Terminal",
        message: `Enable "${terminal.name}"? It will become available for scheduling and dispatch operations.`,
        confirmLabel: "Enable Terminal",
        onConfirm: () => {
          setConfirm(null);
          enableTerminal.mutate(terminal, {
            onSuccess: () => toast.success(`"${terminal.name}" has been enabled.`),
          });
        },
      });
    }

    if (action === "disable") {
      setConfirm({
        title: "Disable Terminal",
        message: `Disable "${terminal.name}"? It will be excluded from scheduling and dispatch but remain visible in the database.`,
        confirmLabel: "Disable Terminal",
        danger: true,
        onConfirm: () => {
          setConfirm(null);
          disableTerminal.mutate(terminal, {
            onSuccess: () => toast.success(`"${terminal.name}" has been disabled.`),
          });
        },
      });
    }

    if (action === "archive") {
      setConfirm({
        title: "Archive Terminal",
        message: `Archive "${terminal.name}"? It will be permanently removed from all users' view. Only SuperAdmin will retain visibility.`,
        confirmLabel: "Archive Terminal",
        danger: true,
        onConfirm: () => {
          setConfirm(null);
          archiveTerminal.mutate(terminal.id, {
            onSuccess: () => toast.success(`"${terminal.name}" has been archived.`),
          });
        },
      });
    }
  }

  const col = (key: ColumnKey) => visibleColumns.has(key);

  return (
    <div className="space-y-5 p-6">

      {/* ─── Confirm Dialog ─── */}
      {confirm && (
        <ConfirmDialog
          title={confirm.title}
          message={confirm.message}
          confirmLabel={confirm.confirmLabel}
          danger={confirm.danger}
          onConfirm={confirm.onConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}

      {/* ─── Terminal Detail Drawer ─── */}
      {selectedTerminal && (
        <TerminalDetailDrawer terminal={selectedTerminal} onClose={() => setSelectedTerminal(null)} />
      )}

      {/* ─── Breadcrumb ─── */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-500">
        <span>Infrastructure</span>
        <ChevronRight className="h-3 w-3" />
        <span>Terminals</span>
        <ChevronRight className="h-3 w-3" />
        <span className="font-semibold text-gray-800">All Terminals</span>
      </nav>

      {/* ─── Summary Panel ─── */}
      <SummaryPanel
        summary={summary}
        isLoading={summaryLoading}
        onAddTerminal={() => toast.info("Add Terminal form — coming soon.")}
      />

      {/* ─── Charts ─── */}
      <TerminalCharts />

      {/* ─── Toolbar ─── */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex flex-wrap items-center gap-3">

          {/* Search */}
          <div className="relative min-w-56 flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by terminal name or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-emerald-300 focus:bg-white focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          {/* Filters Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
              showFilters || hasActiveFilters
                ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                : "border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Filter className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Display Options */}
          <DisplayOptionsMenu
            columns={TOGGLEABLE_COLUMNS}
            allColumnKeys={ALL_COLUMN_KEYS}
            visibleColumns={visibleColumns}
            onApply={setVisibleColumns}
            label="Display"
            showHiddenCount={false}
          />

          {/* Export */}
          <div className="relative group">
            <button className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50">
              <Download className="h-4 w-4" />
              Export
              <ChevronDown className="h-3 w-3" />
            </button>
            <div className="absolute right-0 top-full z-20 mt-1 hidden w-36 rounded-lg border border-gray-200 bg-white py-1 shadow-lg group-hover:block">
              <button
                onClick={() => toast.info("Exporting as CSV...")}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <FileText className="h-3.5 w-3.5 text-gray-400" /> CSV
              </button>
              <button
                onClick={() => toast.info("Exporting as PDF...")}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <FileText className="h-3.5 w-3.5 text-red-500" /> PDF
              </button>
            </div>
          </div>
        </div>

        {/* ─── Filter Row ─── */}
        {showFilters && (
          <div className="mt-3 flex flex-wrap items-center gap-4 border-t border-gray-100 pt-3">
            {/* Terminal Type */}
            <div>
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                Terminal Type
              </label>
              <div className="relative">
                <select
                  value={typeFilter}
                  onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
                  className="appearance-none rounded-lg border border-gray-200 bg-white py-1.5 pl-3 pr-8 text-xs text-gray-700 outline-none focus:border-emerald-300"
                >
                  {TERMINAL_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute bottom-2.5 right-2 h-3 w-3 text-gray-400" />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                Status
              </label>
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                  className="appearance-none rounded-lg border border-gray-200 bg-white py-1.5 pl-3 pr-8 text-xs text-gray-700 outline-none focus:border-emerald-300"
                >
                  {STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute bottom-2.5 right-2 h-3 w-3 text-gray-400" />
              </div>
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50"
              >
                <X className="h-3 w-3" />
                Clear All
              </button>
            )}
          </div>
        )}
      </div>

      {/* ─── Results Count ─── */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">
          Showing <span className="font-semibold text-gray-800">{totalCount}</span> terminal{totalCount !== 1 ? "s" : ""}
          {hasActiveFilters && " matching your filters"}
        </p>
      </div>

      {/* ─── Table ─── */}
      <div className="min-w-0 rounded-xl border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-max w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                  S/No.
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                  Terminal Name
                </th>
                {col("terminal_type") && (
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                    Type
                  </th>
                )}
                {col("terminal_code") && (
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                    Code
                  </th>
                )}
                {col("location") && (
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                    Location / Address
                  </th>
                )}
                {col("daily_capacity") && (
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                    Daily Cap.
                  </th>
                )}
                {col("hourly_capacity") && (
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                    Hourly TAT
                  </th>
                )}
                {col("status") && (
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                )}
                {col("created_at") && (
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                    Created
                  </th>
                )}
                {col("updated_at") && (
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                    Last Updated
                  </th>
                )}
                <th className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={12} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
                      <p className="text-sm font-medium text-gray-400">Loading terminals...</p>
                    </div>
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={12} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <AlertCircle className="h-8 w-8 text-red-300" />
                      <p className="text-sm font-medium text-gray-400">Failed to load terminals</p>
                    </div>
                  </td>
                </tr>
              ) : terminals.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Landmark className="h-8 w-8 text-gray-300" />
                      <p className="text-sm font-medium text-gray-400">No terminals match your filters</p>
                      {hasActiveFilters && (
                        <button onClick={clearFilters} className="text-xs font-medium text-emerald-600 hover:underline">
                          Clear all filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                terminals.map((t, idx) => (
                  <tr key={t.id} className="group transition-colors hover:bg-gray-50/80">
                    {/* S/No */}
                    <td className="px-4 py-3 text-xs font-medium text-gray-400">
                      {(page - 1) * PAGE_SIZE + idx + 1}
                    </td>

                    {/* Terminal Name */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                          t.terminal_type === "PORT_TERMINAL"
                            ? "bg-blue-50"
                            : "bg-amber-50"
                        }`}>
                          {t.terminal_type === "PORT_TERMINAL"
                            ? <Anchor className="h-4 w-4 text-blue-600" />
                            : <Warehouse className="h-4 w-4 text-amber-600" />
                          }
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-gray-900">{t.name}</p>
                          {t.location && (
                            <p className="text-[10px] text-gray-400">
                              {t.location === "APAPA" ? "Apapa Zone" : t.location === "TINCAN" ? "Tincan Zone" : t.location}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Type */}
                    {col("terminal_type") && (
                      <td className="px-4 py-3">
                        <TypeBadge type={t.terminal_type} />
                      </td>
                    )}

                    {/* Code */}
                    {col("terminal_code") && (
                      <td className="px-4 py-3">
                        <span className="rounded-md bg-gray-100 px-2 py-0.5 font-mono text-[11px] text-gray-600">
                          {t.terminal_code}
                        </span>
                      </td>
                    )}

                    {/* Location */}
                    {col("location") && (
                      <td className="px-4 py-3">
                        <div className="flex items-start gap-1">
                          <MapPin className="mt-0.5 h-3 w-3 shrink-0 text-gray-400" />
                          <p className="text-xs text-gray-600 max-w-44 leading-tight">{t.address || t.location}</p>
                        </div>
                      </td>
                    )}

                    {/* Daily Capacity */}
                    {col("daily_capacity") && (
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Truck className="h-3 w-3 text-gray-400" />
                          <span className="text-xs font-semibold text-gray-800">
                            {t.approved_daily_truck_capacity.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-gray-400">/day</span>
                        </div>
                      </td>
                    )}

                    {/* Hourly Capacity */}
                    {col("hourly_capacity") && (
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Timer className="h-3 w-3 text-gray-400" />
                          <span className="text-xs font-semibold text-gray-800">
                            {t.approved_trucks_per_hour.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-gray-400">/hr</span>
                        </div>
                      </td>
                    )}

                    {/* Status */}
                    {col("status") && (
                      <td className="px-4 py-3">
                        <StatusBadge status={getTerminalDisplayStatus(t)} />
                      </td>
                    )}

                    {/* Created */}
                    {col("created_at") && (
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1 text-[11px] text-gray-500">
                          <Clock className="h-3 w-3" />
                          {formatTimestamp(t.created_at)}
                        </span>
                      </td>
                    )}

                    {/* Updated */}
                    {col("updated_at") && (
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1 text-[11px] text-gray-500">
                          <Clock className="h-3 w-3" />
                          {formatTimestamp(t.updated_at)}
                        </span>
                      </td>
                    )}

                    {/* Actions */}
                    <td className="px-4 py-3 text-center">
                      <ActionsMenu terminal={t} onAction={handleAction} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ─── Pagination ─── */}
        <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
          <p className="text-xs text-gray-500">
            Showing{" "}
            <span className="font-medium text-gray-700">
              {terminals.length > 0 ? (page - 1) * PAGE_SIZE + 1 : 0}
            </span>
            –
            <span className="font-medium text-gray-700">
              {(page - 1) * PAGE_SIZE + terminals.length}
            </span>{" "}
            of <span className="font-medium text-gray-700">{totalCount}</span> terminals
          </p>

          <div className="flex items-center gap-1">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border border-gray-200 p-1.5 text-gray-500 transition-colors hover:bg-gray-50 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium transition-colors ${
                  p === page
                    ? "bg-emerald-600 text-white"
                    : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-lg border border-gray-200 p-1.5 text-gray-500 transition-colors hover:bg-gray-50 disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

 
    </div>
  );
}

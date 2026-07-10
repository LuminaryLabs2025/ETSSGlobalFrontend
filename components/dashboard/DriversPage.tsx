"use client";

import { useState } from "react";
import {
  Users,
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
  Archive,
  Power,
  Ban,
  Eye,
  MoreHorizontal,
  Shield,
  AlertTriangle,
  FileText,
  Building2,
  RefreshCw,
  Send,
  AlertCircle,
  SlidersHorizontal,
  UserCheck,
  Flag,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import type {
  Driver,
  DriverVerificationStatus,
  DriverOperationalStatus,
  DriverVisibility,
  FlagType,
  FlagStatus,
  DriversSummaryResponse,
  DriversListParams,
} from "@/types/drivers.types";
import { useDrivers } from "@/hooks/drivers/useDrivers";
import { useDriversSummary } from "@/hooks/drivers/useDriversSummary";
import {
  useDisableDriver,
  useArchiveDriver,
  useEnableDriver,
  useClearDriverFlag,
  useStartDriverVerification,
  useExportDrivers,
} from "@/hooks/drivers/useDriverActions";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";

// ─── Constants ───
const PAGE_SIZE = 10;

type TabId = "all" | "verified" | "unverified" | "flagged" | "disabled";

const OPERATIONAL_STATUS_OPTIONS = [
  "All", "AVAILABLE", "ON_TRIP", "IN_FACILITY", "IN_PREGATE", "IN_TERMINAL", "OFF_DUTY", "SUSPENDED",
];

const VISIBILITY_OPTIONS = [
  { value: "All", label: "All" },
  { value: "PUBLIC", label: "Public" },
  { value: "PRIVATE", label: "Private" },
];

const FLAG_TYPE_OPTIONS = [
  "All", "TRAFFIC_VIOLATION", "MISCONDUCT", "ACCIDENT", "UNAUTHORIZED_ROUTE", "EXPIRED_LICENSE", "CUSTOMER_COMPLAINT",
];

const FLAG_STATUS_OPTIONS = ["All", "ACTIVE", "CLEARED", "UNDER_REVIEW"];

const VER_STATUS_FILTERS = [
  { value: "All", label: "All" },
  { value: "VERIFIED", label: "Verified" },
  { value: "UNVERIFIED", label: "Unverified" },
  { value: "VERIFICATION_IN_PROGRESS", label: "Verification In Progress" },
  { value: "FLAGGED", label: "Flagged" },
  { value: "DISABLED", label: "Disabled" },
];

// ─── Display Options columns ───
const TOGGLEABLE_COLUMNS = [
  { key: "driver_image",    label: "Driver Image" },
  { key: "mobile_number",   label: "Mobile Number" },
  { key: "date_of_birth",   label: "Date of Birth" },
  { key: "sex",             label: "Sex" },
  { key: "license_expiry",  label: "License Expiry" },
  { key: "registered_by",   label: "Registered By" },
  { key: "visibility",      label: "Visibility" },
] as const;

type ColumnKey = (typeof TOGGLEABLE_COLUMNS)[number]["key"];
const ALL_COLUMN_KEYS = TOGGLEABLE_COLUMNS.map((c) => c.key) as ColumnKey[];

// ─── Avatar color palette ───
const AVATAR_COLORS = [
  "bg-blue-100 text-blue-700",   "bg-purple-100 text-purple-700",
  "bg-emerald-100 text-emerald-700", "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",   "bg-indigo-100 text-indigo-700",
  "bg-teal-100 text-teal-700",   "bg-orange-100 text-orange-700",
];

// ─── Helpers ───
function formatTimestamp(ts: string) {
  return new Date(ts).toLocaleString("en-NG", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-NG", { day: "2-digit", month: "short", year: "numeric" });
}

function formatLabel(s: string) {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// ─── Driver Avatar ───
function DriverAvatar({ driver }: { driver: Driver }) {
  const initials = `${driver.first_name[0]}${driver.last_name[0]}`.toUpperCase();
  const colorIdx = driver.id.charCodeAt(driver.id.length - 1) % AVATAR_COLORS.length;
  return (
    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${AVATAR_COLORS[colorIdx]}`}>
      {initials}
    </div>
  );
}

// ─── Verification Status Badge ───
function VerStatusBadge({ status }: { status: DriverVerificationStatus }) {
  const map: Record<DriverVerificationStatus, { cls: string; label: string }> = {
    VERIFIED:                  { cls: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "Verified" },
    UNVERIFIED:                { cls: "bg-amber-50 text-amber-700 border-amber-200",       label: "Unverified" },
    VERIFICATION_IN_PROGRESS:  { cls: "bg-blue-50 text-blue-700 border-blue-200",          label: "In Progress" },
    FLAGGED:                   { cls: "bg-red-50 text-red-700 border-red-200",             label: "Flagged" },
    DISABLED:                  { cls: "bg-gray-100 text-gray-500 border-gray-200",         label: "Disabled" },
    ARCHIVED:                  { cls: "bg-gray-50 text-gray-400 border-gray-200",          label: "Archived" },
  };
  const { cls, label } = map[status] ?? { cls: "bg-gray-50 text-gray-400 border-gray-200", label: status };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${cls}`}>
      {label}
    </span>
  );
}

// ─── Operational Status Badge ───
function OpStatusBadge({ status }: { status: DriverOperationalStatus }) {
  const map: Record<DriverOperationalStatus, string> = {
    AVAILABLE:   "bg-emerald-50 text-emerald-700 border-emerald-200",
    ON_TRIP:     "bg-blue-50 text-blue-700 border-blue-200",
    IN_FACILITY: "bg-violet-50 text-violet-700 border-violet-200",
    IN_PREGATE:  "bg-orange-50 text-orange-700 border-orange-200",
    IN_TERMINAL: "bg-purple-50 text-purple-700 border-purple-200",
    OFF_DUTY:    "bg-gray-100 text-gray-500 border-gray-200",
    SUSPENDED:   "bg-red-50 text-red-700 border-red-200",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap ${map[status]}`}>
      {formatLabel(status)}
    </span>
  );
}

// ─── Visibility Badge ───
function VisibilityBadge({ v }: { v: DriverVisibility }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
      v === "PUBLIC" ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-600"
    }`}>
      {v === "PUBLIC" ? "🌐 Public" : "🔒 Private"}
    </span>
  );
}

// ─── Flag Type Badge ───
function FlagTypeBadge({ type }: { type: FlagType }) {
  const map: Record<FlagType, string> = {
    TRAFFIC_VIOLATION:    "bg-red-50 text-red-600",
    MISCONDUCT:           "bg-orange-50 text-orange-700",
    ACCIDENT:             "bg-rose-50 text-rose-700",
    UNAUTHORIZED_ROUTE:   "bg-amber-50 text-amber-700",
    EXPIRED_LICENSE:      "bg-purple-50 text-purple-700",
    CUSTOMER_COMPLAINT:   "bg-yellow-50 text-yellow-700",
  };
  return (
    <span className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${map[type]}`}>
      {formatLabel(type)}
    </span>
  );
}

// ─── Flag Status Badge ───
function FlagStatusBadge({ status }: { status: FlagStatus }) {
  const map: Record<FlagStatus, string> = {
    ACTIVE:       "bg-red-50 text-red-700 border-red-200",
    CLEARED:      "bg-emerald-50 text-emerald-700 border-emerald-200",
    UNDER_REVIEW: "bg-amber-50 text-amber-700 border-amber-200",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${map[status]}`}>
      {formatLabel(status)}
    </span>
  );
}

// ─── Sex Badge ───
function SexBadge({ sex }: { sex: "MALE" | "FEMALE" }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
      sex === "FEMALE" ? "bg-pink-50 text-pink-700" : "bg-sky-50 text-sky-700"
    }`}>
      {sex === "FEMALE" ? "♀ Female" : "♂ Male"}
    </span>
  );
}

// ─── Confirm Dialog ───
function ConfirmDialog({
  title, message, confirmLabel, danger, onConfirm, onCancel,
}: {
  title: string; message: string; confirmLabel: string; danger?: boolean;
  onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onCancel} />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl border border-gray-200 bg-white p-6 shadow-2xl">
        <h3 className="text-sm font-bold text-gray-900">{title}</h3>
        <p className="mt-2 text-sm text-gray-600">{message}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onCancel} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={onConfirm} className={`rounded-lg px-4 py-2 text-sm font-medium text-white ${danger ? "bg-red-600 hover:bg-red-700" : "bg-emerald-600 hover:bg-emerald-700"}`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Reason Dialog ───
function ReasonDialog({
  title, description, confirmLabel, danger, onConfirm, onCancel,
}: {
  title: string; description: string; confirmLabel: string; danger?: boolean;
  onConfirm: (reason: string) => void; onCancel: () => void;
}) {
  const [reason, setReason] = useState("");
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onCancel} />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-gray-200 bg-white p-6 shadow-2xl">
        <h3 className="text-sm font-bold text-gray-900">{title}</h3>
        <p className="mt-1.5 text-xs text-gray-500">{description}</p>
        <div className="mt-4">
          <label className="mb-1.5 block text-xs font-semibold text-gray-700">
            Reason / Comment <span className="text-red-500">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="Enter reason..."
            className="w-full rounded-lg border border-gray-200 p-3 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
          />
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onCancel} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
          <button
            disabled={!reason.trim()}
            onClick={() => reason.trim() && onConfirm(reason.trim())}
            className={`rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50 ${danger ? "bg-red-600 hover:bg-red-700" : "bg-emerald-600 hover:bg-emerald-700"}`}
          >
            {confirmLabel}
          </button>
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
  summary?: DriversSummaryResponse;
  isLoading?: boolean;
}) {
  const cards = [
    { label: "Total Drivers",   value: summary?.total ?? 0, color: "text-blue-400",    bg: "bg-blue-400/10",    Icon: Users },
    { label: "Verified",        value: summary?.verified ?? 0, color: "text-emerald-400", bg: "bg-emerald-400/10", Icon: CheckCircle2 },
    { label: "Unverified",      value: (summary?.unverified ?? 0) + (summary?.verification_in_progress ?? 0), color: "text-amber-400", bg: "bg-amber-400/10", Icon: AlertCircle },
    { label: "Flagged",         value: summary?.flagged ?? 0, color: "text-red-400",     bg: "bg-red-400/10",     Icon: Flag },
    { label: "Disabled",        value: summary?.disabled ?? 0, color: "text-gray-400",    bg: "bg-gray-400/10",    Icon: XCircle },
    { label: "Available Now",   value: summary?.available ?? 0, color: "text-cyan-400",    bg: "bg-cyan-400/10",    Icon: UserCheck },
  ];

  return (
    <div className="rounded-2xl bg-[#0f1e2e] p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Driver Fleet Management</h1>
          <p className="text-xs text-gray-400">All registered drivers across the ETSS-Nigeria logistics platform</p>
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

function buildListParams(
  activeTab: TabId,
  page: number,
  debouncedSearch: string,
  opStatusFilter: string,
  visibilityFilter: string,
  verStatusFilter: string,
  flagTypeFilter: string,
  flagStatusFilter: string,
): DriversListParams {
  const params: DriversListParams = {
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
  };

  if (activeTab !== "all") {
    params.category = activeTab;
  } else if (verStatusFilter !== "All") {
    params.verification_status = verStatusFilter;
  }

  if (opStatusFilter !== "All") params.operational_status = opStatusFilter;
  if (visibilityFilter !== "All") params.visibility = visibilityFilter;
  if (flagTypeFilter !== "All") params.flag_type = flagTypeFilter;
  if (flagStatusFilter !== "All") params.flag_status = flagStatusFilter;

  return params;
}

// ─── Main Page ───
export function DriversPage() {
  const [activeTab, setActiveTab] = useState<TabId>("all");
  const [page, setPage] = useState(1);
  const { search, setSearch, debouncedSearch, resetSearch } = useDebouncedSearch("", () => setPage(1));
  const [opStatusFilter, setOpStatusFilter] = useState("All");
  const [visibilityFilter, setVisibilityFilter] = useState("All");
  const [verStatusFilter, setVerStatusFilter] = useState("All");
  const [flagTypeFilter, setFlagTypeFilter] = useState("All");
  const [flagStatusFilter, setFlagStatusFilter] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [confirm, setConfirm] = useState<{
    title: string; message: string; confirmLabel: string; danger?: boolean;
    onConfirm: () => void;
  } | null>(null);
  const [reasonDialog, setReasonDialog] = useState<{
    title: string; description: string; confirmLabel: string; danger?: boolean;
    onConfirm: (reason: string) => void;
  } | null>(null);
  const [visibleColumns, setVisibleColumns] = useState<Set<ColumnKey>>(new Set(ALL_COLUMN_KEYS));

  const col = (key: ColumnKey) => visibleColumns.has(key);
  function toggleColumn(key: ColumnKey) {
    setVisibleColumns((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  const listParams = buildListParams(
    activeTab,
    page,
    debouncedSearch,
    opStatusFilter,
    visibilityFilter,
    verStatusFilter,
    flagTypeFilter,
    flagStatusFilter,
  );

  const { data: summary, isLoading: summaryLoading } = useDriversSummary();
  const { data: driversData, isLoading, isError } = useDrivers(listParams);

  const disableDriver = useDisableDriver();
  const archiveDriver = useArchiveDriver();
  const enableDriver = useEnableDriver();
  const clearFlag = useClearDriverFlag();
  const startVerification = useStartDriverVerification();
  const exportDrivers = useExportDrivers();

  const drivers = Array.isArray(driversData?.data) ? driversData.data : [];
  const meta = driversData?.meta;
  const totalPages = meta?.total_pages ?? 1;
  const totalCount = meta?.total ?? 0;

  const lastRefresh = new Date().toLocaleString("en-NG", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });

  function switchTab(tab: TabId) {
    setActiveTab(tab);
    setPage(1);
    resetSearch();
    setOpStatusFilter("All");
    setVisibilityFilter("All");
    setVerStatusFilter("All");
    setFlagTypeFilter("All");
    setFlagStatusFilter("All");
    setShowFilters(false);
  }

  const tabCounts = {
    all:        summary?.total ?? 0,
    verified:   summary?.verified ?? 0,
    unverified: (summary?.unverified ?? 0) + (summary?.verification_in_progress ?? 0),
    flagged:    summary?.flagged ?? 0,
    disabled:   summary?.disabled ?? 0,
  };

  const hasActiveFilters = debouncedSearch || opStatusFilter !== "All" || visibilityFilter !== "All" ||
    verStatusFilter !== "All" || flagTypeFilter !== "All" || flagStatusFilter !== "All";

  function clearFilters() {
    resetSearch();
    setOpStatusFilter("All");
    setVisibilityFilter("All");
    setVerStatusFilter("All");
    setFlagTypeFilter("All");
    setFlagStatusFilter("All");
    setPage(1);
  }

  function handleExportCsv() {
    exportDrivers.mutate(listParams, {
      onSuccess: () => toast.success("Drivers exported as CSV."),
    });
  }

  function handleDisable(driver: Driver) {
    setReasonDialog({
      title: `Disable Driver — ${driver.first_name} ${driver.last_name}`,
      description: "This driver will be prevented from new booking assignments. Provide a reason.",
      confirmLabel: "Disable Driver",
      danger: true,
      onConfirm: (reason) => {
        setReasonDialog(null);
        disableDriver.mutate({ id: driver.id, reason }, {
          onSuccess: () => toast.success(`Driver ${driver.first_name} ${driver.last_name} has been disabled.`),
        });
      },
    });
  }

  function handleArchive(driver: Driver) {
    setConfirm({
      title: `Archive Driver — ${driver.first_name} ${driver.last_name}`,
      message: "This driver's record will be retained for audit but removed from active listings.",
      confirmLabel: "Archive Driver",
      danger: true,
      onConfirm: () => {
        setConfirm(null);
        archiveDriver.mutate(driver.id, {
          onSuccess: () => toast.success(`Driver ${driver.first_name} ${driver.last_name} has been archived.`),
        });
      },
    });
  }

  function handleStartVerification(driver: Driver) {
    setConfirm({
      title: "Start Verification",
      message: `Initiate verification process for ${driver.first_name} ${driver.last_name}?`,
      confirmLabel: "Start Verification",
      onConfirm: () => {
        setConfirm(null);
        startVerification.mutate(driver.id, {
          onSuccess: () => toast.success(`Verification initiated for ${driver.first_name} ${driver.last_name}.`),
        });
      },
    });
  }

  function handleClearFlag(driver: Driver) {
    setReasonDialog({
      title: `Clear Flag — ${driver.first_name} ${driver.last_name}`,
      description: `Flag ID: ${driver.flag?.flag_id ?? "—"}. Provide a reason for clearing this flag. This action will be logged.`,
      confirmLabel: "Clear Flag",
      onConfirm: (reason) => {
        setReasonDialog(null);
        clearFlag.mutate({ id: driver.id, reason }, {
          onSuccess: () => toast.success(`Flag for ${driver.first_name} ${driver.last_name} cleared.`),
        });
      },
    });
  }

  function handleEnableDriver(driver: Driver) {
    setConfirm({
      title: `Enable Driver — ${driver.first_name} ${driver.last_name}`,
      message: "This driver will be reactivated and made available for scheduling and dispatch.",
      confirmLabel: "Enable Driver",
      onConfirm: () => {
        setConfirm(null);
        enableDriver.mutate(driver.id, {
          onSuccess: () => toast.success(`Driver ${driver.first_name} ${driver.last_name} is now active and available.`),
        });
      },
    });
  }

  // ─── Action Menus ───
  function AllActionsMenu({ driver }: { driver: Driver }) {
    const [open, setOpen] = useState(false);
    return (
      <div className="relative">
        <button onClick={() => setOpen(!open)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"><MoreHorizontal className="h-4 w-4" /></button>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <div className="absolute right-0 top-full z-20 mt-1 w-52 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
              <button onClick={() => { setOpen(false); setSelectedDriver(driver); }} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"><Eye className="h-3.5 w-3.5" /> View Details</button>
              {driver.verification_status === "VERIFIED" && (
                <button onClick={() => { setOpen(false); handleDisable(driver); }} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-gray-50"><Ban className="h-3.5 w-3.5" /> Disable Driver</button>
              )}
            </div>
          </>
        )}
      </div>
    );
  }

  function VerifiedActionsMenu({ driver }: { driver: Driver }) {
    const [open, setOpen] = useState(false);
    return (
      <div className="relative">
        <button onClick={() => setOpen(!open)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"><MoreHorizontal className="h-4 w-4" /></button>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <div className="absolute right-0 top-full z-20 mt-1 w-52 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
              <button onClick={() => { setOpen(false); setSelectedDriver(driver); }} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"><Eye className="h-3.5 w-3.5" /> View Details</button>
              <button onClick={() => { setOpen(false); handleDisable(driver); }} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-gray-50"><Ban className="h-3.5 w-3.5" /> Disable Driver</button>
              <button onClick={() => { setOpen(false); handleArchive(driver); }} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-gray-50"><Archive className="h-3.5 w-3.5" /> Archive Driver</button>
            </div>
          </>
        )}
      </div>
    );
  }

  function UnverifiedActionsMenu({ driver }: { driver: Driver }) {
    const [open, setOpen] = useState(false);
    const canStart = driver.verification_status === "UNVERIFIED";
    return (
      <div className="relative">
        <button onClick={() => setOpen(!open)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"><MoreHorizontal className="h-4 w-4" /></button>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <div className="absolute right-0 top-full z-20 mt-1 w-56 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
              <button onClick={() => { setOpen(false); setSelectedDriver(driver); }} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"><Eye className="h-3.5 w-3.5" /> View Details</button>
              {canStart && (
                <button onClick={() => { setOpen(false); handleStartVerification(driver); }} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-blue-700 hover:bg-gray-50"><Send className="h-3.5 w-3.5" /> Start Verification</button>
              )}
            </div>
          </>
        )}
      </div>
    );
  }

  function FlaggedActionsMenu({ driver }: { driver: Driver }) {
    const [open, setOpen] = useState(false);
    const canClear = driver.flag?.flag_status === "ACTIVE" || driver.flag?.flag_status === "UNDER_REVIEW";
    return (
      <div className="relative">
        <button onClick={() => setOpen(!open)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"><MoreHorizontal className="h-4 w-4" /></button>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <div className="absolute right-0 top-full z-20 mt-1 w-52 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
              <button onClick={() => { setOpen(false); setSelectedDriver(driver); }} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"><Eye className="h-3.5 w-3.5" /> View Details</button>
              {canClear && (
                <button onClick={() => { setOpen(false); handleClearFlag(driver); }} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-emerald-700 hover:bg-gray-50"><Shield className="h-3.5 w-3.5" /> Clear Flag</button>
              )}
            </div>
          </>
        )}
      </div>
    );
  }

  function DisabledActionsMenu({ driver }: { driver: Driver }) {
    const [open, setOpen] = useState(false);
    return (
      <div className="relative">
        <button onClick={() => setOpen(!open)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"><MoreHorizontal className="h-4 w-4" /></button>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <div className="absolute right-0 top-full z-20 mt-1 w-52 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
              <button onClick={() => { setOpen(false); setSelectedDriver(driver); }} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"><Eye className="h-3.5 w-3.5" /> View Details</button>
              <button onClick={() => { setOpen(false); handleEnableDriver(driver); }} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-emerald-700 hover:bg-gray-50"><Power className="h-3.5 w-3.5" /> Enable Driver</button>
            </div>
          </>
        )}
      </div>
    );
  }

  function DisplayOptionsMenu() {
    const [open, setOpen] = useState(false);
    const hiddenCount = ALL_COLUMN_KEYS.length - visibleColumns.size;
    return (
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
            hiddenCount > 0 ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-gray-200 text-gray-600 hover:bg-gray-50"
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Display Options
          {hiddenCount > 0 && (
            <span className="rounded-full bg-emerald-600 px-1.5 py-0.5 text-[10px] font-bold text-white">{hiddenCount} hidden</span>
          )}
          <ChevronDown className="h-3 w-3" />
        </button>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <div className="absolute right-0 top-full z-20 mt-1 w-52 rounded-xl border border-gray-200 bg-white shadow-lg">
              <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2.5">
                <p className="text-xs font-bold text-gray-700">Display Columns</p>
                <button
                  onClick={() => setVisibleColumns(visibleColumns.size === ALL_COLUMN_KEYS.length ? new Set() : new Set(ALL_COLUMN_KEYS))}
                  className="text-[11px] font-medium text-emerald-600 hover:underline"
                >
                  {visibleColumns.size === ALL_COLUMN_KEYS.length ? "Hide all" : "Show all"}
                </button>
              </div>
              <div className="py-1">
                {TOGGLEABLE_COLUMNS.map((column) => (
                  <label key={column.key} className="flex cursor-pointer items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={visibleColumns.has(column.key)}
                      onChange={() => toggleColumn(column.key)}
                      className="h-3.5 w-3.5 rounded border-gray-300 accent-emerald-600"
                    />
                    {column.label}
                  </label>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  const staticTH = (label: string) => (
    <th className="px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">{label}</th>
  );

  const TAB_CONFIG: Record<TabId, { label: string; dot: string }> = {
    all:        { label: "All Drivers",      dot: "bg-gray-500" },
    verified:   { label: "Verified",         dot: "bg-emerald-500" },
    unverified: { label: "Unverified",       dot: "bg-amber-500" },
    flagged:    { label: "Flagged",          dot: "bg-red-500" },
    disabled:   { label: "Disabled",         dot: "bg-gray-400" },
  };

  const searchPlaceholders: Record<TabId, string> = {
    all:        "Search name, license number, mobile or company...",
    verified:   "Search name, license number or mobile number...",
    unverified: "Search name or license number...",
    flagged:    "Search name, license number or flag ID...",
    disabled:   "Search name, license number or company...",
  };

  const tabDescriptions: Record<TabId, string> = {
    all:        "All registered drivers across the ETSS-Nigeria platform.",
    verified:   "Drivers successfully verified — real-time operational status tracking.",
    unverified: "Registered drivers pending or undergoing the verification process.",
    flagged:    "Drivers flagged for traffic violations, misconduct, accidents or complaints.",
    disabled:   "Drivers deactivated by SuperAdmin or NPA — re-enable after confirmation.",
  };

  return (
    <div className="space-y-5 p-6">

      {/* ─── Dialogs ─── */}
      {confirm && <ConfirmDialog {...confirm} onCancel={() => setConfirm(null)} />}
      {reasonDialog && <ReasonDialog {...reasonDialog} onCancel={() => setReasonDialog(null)} />}

      {/* ─── Driver Detail Drawer ─── */}
      {selectedDriver && (
        <>
          <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setSelectedDriver(null)} />
          <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[460px] flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between bg-[#0f1e2e] px-6 py-4">
              <div className="flex items-center gap-3">
                <DriverAvatar driver={selectedDriver} />
                <div>
                  <p className="text-sm font-bold text-white">{selectedDriver.first_name} {selectedDriver.last_name}</p>
                  <p className="text-[11px] text-gray-400">{selectedDriver.license_number}</p>
                </div>
              </div>
              <button onClick={() => setSelectedDriver(null)} className="rounded-lg p-1.5 text-gray-400 hover:bg-white/10 hover:text-white"><X className="h-4 w-4" /></button>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto p-6">
              <div className="flex flex-wrap gap-2">
                <VerStatusBadge status={selectedDriver.verification_status} />
                {selectedDriver.operational_status && <OpStatusBadge status={selectedDriver.operational_status} />}
                <VisibilityBadge v={selectedDriver.visibility} />
                <SexBadge sex={selectedDriver.sex} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  ["Mobile", selectedDriver.mobile_number],
                  ["Date of Birth", formatDate(selectedDriver.date_of_birth)],
                  ["License No.", selectedDriver.license_number],
                  ["License Expiry", formatDate(selectedDriver.license_expiry_date)],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-xl bg-gray-50 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{k}</p>
                    <p className="mt-1 text-sm font-semibold text-gray-800">{v}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-xl border border-gray-100 bg-white">
                <p className="border-b border-gray-100 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Record Details</p>
                <div className="divide-y divide-gray-50">
                  {[
                    ["Registered By", selectedDriver.registered_by.company_name],
                    ["User Account", selectedDriver.registered_by.user_account],
                    ["Created At", formatTimestamp(selectedDriver.created_at)],
                    ...(selectedDriver.verification_timestamp ? [["Verification Date", formatTimestamp(selectedDriver.verification_timestamp)]] : []),
                    ...(selectedDriver.disable_info ? [
                      ["Disabled By", selectedDriver.disable_info.disabled_by],
                      ["Disable Reason", selectedDriver.disable_info.disable_reason],
                      ["Disabled At", formatTimestamp(selectedDriver.disable_info.disable_timestamp)],
                    ] : []),
                  ].map(([label, value]) => (
                    <div key={String(label)} className="flex items-start justify-between gap-4 px-4 py-2.5">
                      <p className="shrink-0 text-xs text-gray-500">{String(label)}</p>
                      <p className="text-right text-xs font-medium text-gray-800">{String(value)}</p>
                    </div>
                  ))}
                </div>
              </div>
              {selectedDriver.flag && (
                <div className="rounded-xl border border-red-100 bg-red-50 p-4">
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-red-500">Active Flag</p>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between"><span className="text-xs text-gray-600">Flag ID</span><span className="font-mono text-xs font-semibold text-gray-800">{selectedDriver.flag.flag_id}</span></div>
                    <div className="flex items-center justify-between"><span className="text-xs text-gray-600">Type</span><FlagTypeBadge type={selectedDriver.flag.flag_type} /></div>
                    <div className="flex items-center justify-between"><span className="text-xs text-gray-600">Status</span><FlagStatusBadge status={selectedDriver.flag.flag_status} /></div>
                    <div className="mt-1"><span className="text-xs text-gray-600">Details: </span><span className="text-xs text-gray-800">{selectedDriver.flag.flag_details}</span></div>
                    <div className="flex items-center justify-between"><span className="text-xs text-gray-600">Flagged By</span><span className="text-xs text-gray-700">{selectedDriver.flag.flagged_by}</span></div>
                    <div className="flex items-center justify-between"><span className="text-xs text-gray-600">Flagged At</span><span className="text-xs text-gray-700">{formatTimestamp(selectedDriver.flag.flagged_at)}</span></div>
                  </div>
                </div>
              )}
            </div>
            <div className="border-t border-gray-100 px-6 py-3">
              <p className="text-center text-[10px] text-gray-400">Driver record — ETSS-Nigeria Platform</p>
            </div>
          </div>
        </>
      )}

      {/* ─── Breadcrumb ─── */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-500">
        <span>Operations</span>
        <Chevron className="h-3 w-3" />
        <span>Drivers</span>
        <Chevron className="h-3 w-3" />
        <span className="font-semibold text-gray-800">{TAB_CONFIG[activeTab].label}</span>
      </nav>

      {/* ─── Summary Panel ─── */}
      <SummaryPanel summary={summary} isLoading={summaryLoading} />

      {/* ─── Module Header + Tabs ─── */}
      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-6 pb-0 pt-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0f1e2e]">
              <Users className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900">Driver Registry</h1>
              <p className="text-xs text-gray-500">Manage all registered drivers — Verified, Unverified, Flagged &amp; Disabled</p>
            </div>
          </div>
          <div className="flex gap-0.5 overflow-x-auto">
            {(["all", "verified", "unverified", "flagged", "disabled"] as TabId[]).map((tab) => {
              const tc = TAB_CONFIG[tab];
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => switchTab(tab)}
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
          <p className="text-xs text-gray-500">{tabDescriptions[activeTab]}</p>
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
              placeholder={searchPlaceholders[activeTab]}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm placeholder-gray-400 outline-none focus:border-emerald-300 focus:bg-white focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
              showFilters || hasActiveFilters ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Filter className="h-4 w-4" />
            Filters
          </button>

          <DisplayOptionsMenu />

          <div className="relative group">
            <button className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
              <Download className="h-4 w-4" />Export<ChevronDown className="h-3 w-3" />
            </button>
            <div className="absolute right-0 top-full z-20 mt-1 hidden w-36 rounded-lg border border-gray-200 bg-white py-1 shadow-lg group-hover:block">
              <button
                onClick={handleExportCsv}
                disabled={exportDrivers.isPending}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                {exportDrivers.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-400" /> : <FileText className="h-3.5 w-3.5 text-gray-400" />}
                CSV
              </button>
              <button onClick={() => toast.info("PDF export — coming soon.")} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"><FileText className="h-3.5 w-3.5 text-red-500" /> PDF</button>
            </div>
          </div>
        </div>

        {showFilters && (
          <div className="mt-3 flex flex-wrap items-end gap-4 border-t border-gray-100 pt-3">
            {(activeTab === "all" || activeTab === "verified") && (
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-gray-400">Driver Status</label>
                <div className="relative">
                  <select value={opStatusFilter} onChange={(e) => { setOpStatusFilter(e.target.value); setPage(1); }} className="appearance-none rounded-lg border border-gray-200 bg-white py-1.5 pl-3 pr-8 text-xs text-gray-700 outline-none focus:border-emerald-300">
                    {OPERATIONAL_STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s === "All" ? "All Statuses" : formatLabel(s)}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute bottom-2.5 right-2 h-3 w-3 text-gray-400" />
                </div>
              </div>
            )}

            {activeTab === "all" && (
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-gray-400">Verification Status</label>
                <div className="relative">
                  <select value={verStatusFilter} onChange={(e) => { setVerStatusFilter(e.target.value); setPage(1); }} className="appearance-none rounded-lg border border-gray-200 bg-white py-1.5 pl-3 pr-8 text-xs text-gray-700 outline-none focus:border-emerald-300">
                    {VER_STATUS_FILTERS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute bottom-2.5 right-2 h-3 w-3 text-gray-400" />
                </div>
              </div>
            )}

            {(activeTab !== "all") && (
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-gray-400">Visibility</label>
                <div className="relative">
                  <select value={visibilityFilter} onChange={(e) => { setVisibilityFilter(e.target.value); setPage(1); }} className="appearance-none rounded-lg border border-gray-200 bg-white py-1.5 pl-3 pr-8 text-xs text-gray-700 outline-none focus:border-emerald-300">
                    {VISIBILITY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute bottom-2.5 right-2 h-3 w-3 text-gray-400" />
                </div>
              </div>
            )}

            {activeTab === "flagged" && (
              <>
                <div>
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-gray-400">Flag Type</label>
                  <div className="relative">
                    <select value={flagTypeFilter} onChange={(e) => { setFlagTypeFilter(e.target.value); setPage(1); }} className="appearance-none rounded-lg border border-gray-200 bg-white py-1.5 pl-3 pr-8 text-xs text-gray-700 outline-none focus:border-emerald-300">
                      {FLAG_TYPE_OPTIONS.map((s) => <option key={s} value={s}>{s === "All" ? "All Types" : formatLabel(s)}</option>)}
                    </select>
                    <ChevronDown className="pointer-events-none absolute bottom-2.5 right-2 h-3 w-3 text-gray-400" />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-gray-400">Flag Status</label>
                  <div className="relative">
                    <select value={flagStatusFilter} onChange={(e) => { setFlagStatusFilter(e.target.value); setPage(1); }} className="appearance-none rounded-lg border border-gray-200 bg-white py-1.5 pl-3 pr-8 text-xs text-gray-700 outline-none focus:border-emerald-300">
                      {FLAG_STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s === "All" ? "All Statuses" : formatLabel(s)}</option>)}
                    </select>
                    <ChevronDown className="pointer-events-none absolute bottom-2.5 right-2 h-3 w-3 text-gray-400" />
                  </div>
                </div>
              </>
            )}

            {hasActiveFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50">
                <X className="h-3 w-3" /> Clear All
              </button>
            )}
          </div>
        )}
      </div>

      {/* ─── Results count ─── */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">
          Showing <span className="font-semibold text-gray-800">{totalCount}</span> driver{totalCount !== 1 ? "s" : ""}
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
                {col("driver_image") && staticTH("Driver")}
                {staticTH("Driver Name")}
                {col("mobile_number") && staticTH("Mobile")}
                {staticTH("License No.")}
                {col("license_expiry") && staticTH("License Expiry")}
                {col("date_of_birth") && staticTH("Date of Birth")}
                {col("sex") && staticTH("Sex")}
                {staticTH("Created")}
                {staticTH("Ver. Status")}
                {(activeTab === "verified" || activeTab === "all") && staticTH("Driver Status")}
                {col("registered_by") && staticTH("Registered By")}
                {col("visibility") && staticTH("Visibility")}
                {(activeTab === "verified" || activeTab === "flagged" || activeTab === "disabled") && (
                  staticTH("Verification Date")
                )}
                {activeTab === "unverified" && staticTH("Ver. Progress")}
                {activeTab === "flagged" && staticTH("Flag ID")}
                {activeTab === "flagged" && staticTH("Flag Type")}
                {activeTab === "flagged" && staticTH("Flag Status")}
                {activeTab === "flagged" && staticTH("Flagged By")}
                {activeTab === "disabled" && staticTH("Disabled By")}
                {activeTab === "disabled" && staticTH("Reason")}
                {activeTab === "disabled" && staticTH("Disabled At")}
                <th className="px-3 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-gray-500">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={20} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
                      <p className="text-sm font-medium text-gray-400">Loading drivers...</p>
                    </div>
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={20} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <AlertCircle className="h-8 w-8 text-red-300" />
                      <p className="text-sm font-medium text-gray-400">Failed to load drivers</p>
                    </div>
                  </td>
                </tr>
              ) : drivers.length === 0 ? (
                <tr>
                  <td colSpan={20} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Users className="h-8 w-8 text-gray-300" />
                      <p className="text-sm font-medium text-gray-400">No drivers match your filters</p>
                      {hasActiveFilters && <button onClick={clearFilters} className="text-xs font-medium text-emerald-600 hover:underline">Clear all filters</button>}
                    </div>
                  </td>
                </tr>
              ) : (
                drivers.map((d, idx) => (
                  <tr key={d.id} className="transition-colors hover:bg-gray-50/80">
                    {/* S/No */}
                    <td className="px-3 py-3 text-xs font-medium text-gray-400">{(page - 1) * PAGE_SIZE + idx + 1}</td>

                    {/* Avatar */}
                    {col("driver_image") && <td className="px-3 py-3"><DriverAvatar driver={d} /></td>}

                    {/* Name */}
                    <td className="px-3 py-3">
                      <p className="text-sm font-semibold text-gray-900">{d.first_name} {d.last_name}</p>
                    </td>

                    {/* Mobile */}
                    {col("mobile_number") && <td className="px-3 py-3 text-xs text-gray-600">{d.mobile_number}</td>}

                    {/* License */}
                    <td className="px-3 py-3"><span className="font-mono text-xs font-medium text-gray-700">{d.license_number}</span></td>

                    {/* License Expiry */}
                    {col("license_expiry") && (
                      <td className="px-3 py-3">
                        {(() => {
                          const expiry = new Date(d.license_expiry_date);
                          const isExpired = expiry < new Date();
                          return (
                            <span className={`text-xs font-medium ${isExpired ? "text-red-600" : "text-gray-700"}`}>
                              {isExpired && <AlertTriangle className="mr-1 inline h-3 w-3" />}
                              {formatDate(d.license_expiry_date)}
                            </span>
                          );
                        })()}
                      </td>
                    )}

                    {/* DOB */}
                    {col("date_of_birth") && <td className="px-3 py-3 text-xs text-gray-600">{formatDate(d.date_of_birth)}</td>}

                    {/* Sex */}
                    {col("sex") && <td className="px-3 py-3"><SexBadge sex={d.sex} /></td>}

                    {/* Created */}
                    <td className="px-3 py-3">
                      <span className="flex items-center gap-1 text-[11px] text-gray-500">
                        <Clock className="h-3 w-3" />{formatTimestamp(d.created_at)}
                      </span>
                    </td>

                    {/* Ver Status */}
                    <td className="px-3 py-3"><VerStatusBadge status={d.verification_status} /></td>

                    {/* Operational Status (all + verified) */}
                    {(activeTab === "verified" || activeTab === "all") && (
                      <td className="px-3 py-3">
                        {d.operational_status ? <OpStatusBadge status={d.operational_status} /> : <span className="text-xs text-gray-400">—</span>}
                      </td>
                    )}

                    {/* Registered By */}
                    {col("registered_by") && (
                      <td className="px-3 py-3">
                        <div className="flex items-start gap-1">
                          <Building2 className="mt-0.5 h-3 w-3 shrink-0 text-gray-400" />
                          <div>
                            <p className="text-xs font-medium text-gray-800">{d.registered_by.company_name}</p>
                            <p className="text-[10px] text-gray-500">{d.registered_by.user_account}</p>
                          </div>
                        </div>
                      </td>
                    )}

                    {/* Visibility */}
                    {col("visibility") && <td className="px-3 py-3"><VisibilityBadge v={d.visibility} /></td>}

                    {/* Verification date */}
                    {(activeTab === "verified" || activeTab === "flagged" || activeTab === "disabled") && (
                      <td className="px-3 py-3">
                        <span className="flex items-center gap-1 text-[11px] text-gray-500">
                          <Clock className="h-3 w-3" />{d.verification_timestamp ? formatTimestamp(d.verification_timestamp) : "—"}
                        </span>
                      </td>
                    )}

                    {/* Unverified: progress */}
                    {activeTab === "unverified" && (
                      <td className="px-3 py-3">
                        {d.verification_status === "VERIFICATION_IN_PROGRESS" ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700">
                            <RefreshCw className="h-3 w-3 animate-spin" /> In Progress
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">Pending</span>
                        )}
                      </td>
                    )}

                    {/* Flagged columns */}
                    {activeTab === "flagged" && <td className="px-3 py-3"><span className="font-mono text-[11px] font-medium text-gray-700">{d.flag?.flag_id ?? "—"}</span></td>}
                    {activeTab === "flagged" && <td className="px-3 py-3">{d.flag ? <FlagTypeBadge type={d.flag.flag_type} /> : "—"}</td>}
                    {activeTab === "flagged" && <td className="px-3 py-3">{d.flag ? <FlagStatusBadge status={d.flag.flag_status} /> : "—"}</td>}
                    {activeTab === "flagged" && <td className="px-3 py-3 text-xs text-gray-600">{d.flag?.flagged_by ?? "—"}</td>}

                    {/* Disabled columns */}
                    {activeTab === "disabled" && <td className="px-3 py-3 text-xs text-gray-700">{d.disable_info?.disabled_by ?? "—"}</td>}
                    {activeTab === "disabled" && <td className="px-3 py-3"><p className="max-w-48 text-xs leading-tight text-gray-600">{d.disable_info?.disable_reason ?? "—"}</p></td>}
                    {activeTab === "disabled" && <td className="px-3 py-3"><span className="flex items-center gap-1 text-[11px] text-gray-500"><Clock className="h-3 w-3" />{d.disable_info ? formatTimestamp(d.disable_info.disable_timestamp) : "—"}</span></td>}

                    {/* Actions */}
                    <td className="px-3 py-3 text-center">
                      {activeTab === "all"        && <AllActionsMenu driver={d} />}
                      {activeTab === "verified"   && <VerifiedActionsMenu driver={d} />}
                      {activeTab === "unverified" && <UnverifiedActionsMenu driver={d} />}
                      {activeTab === "flagged"    && <FlaggedActionsMenu driver={d} />}
                      {activeTab === "disabled"   && <DisabledActionsMenu driver={d} />}
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
            Showing <span className="font-medium text-gray-700">{drivers.length > 0 ? (page - 1) * PAGE_SIZE + 1 : 0}</span>–
            <span className="font-medium text-gray-700">{(page - 1) * PAGE_SIZE + drivers.length}</span> of{" "}
            <span className="font-medium text-gray-700">{totalCount}</span> drivers
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

      {/* ─── Audit Notice ─── */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
        <p className="text-[11px] leading-relaxed text-amber-700">
          <span className="font-semibold">Audit Notice:</span> All driver management actions (Disable, Archive, Start Verification, Clear Flag, Enable) are
          automatically logged with Driver ID, Action Type, Reason, Performed By (SuperAdmin/NPA), and Timestamp.
        </p>
      </div>
    </div>
  );
}

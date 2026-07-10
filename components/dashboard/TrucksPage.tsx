"use client";

import { useState } from "react";
import {
  Truck,
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
  AlertCircle,
  SlidersHorizontal,
  Loader2,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import type {
  Truck as TruckType,
  RegistrationStatus,
  TruckStatus,
  Visibility,
  PenaltyType,
  PaymentStatus,
  TrucksSummaryResponse,
  TrucksListParams,
} from "@/types/trucks.types";
import { useTrucks } from "@/hooks/trucks/useTrucks";
import { useTrucksSummary } from "@/hooks/trucks/useTrucksSummary";
import {
  useDisableTruck,
  useArchiveTruck,
  useReEnableTruck,
  useOverrideTruckPenalty,
  useRequestTruckVerification,
  useExportTrucks,
} from "@/hooks/trucks/useTruckActions";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";

// ─── Constants ───
const PAGE_SIZE = 10;

type TabId = "all" | "verified" | "unverified" | "flagged" | "disabled";

const TRUCK_STATUS_OPTIONS = [
  "All", "AVAILABLE", "ON_TRIP", "IN_FACILITY", "MATCHED",
  "GTG_FACILITY", "LEFT_FACILITY", "IN_PREGATE", "GTG_PREGATE",
  "LEFT_PREGATE", "IN_TERMINAL", "LEFT_TERMINAL",
];

const VISIBILITY_OPTIONS = [
  { value: "All", label: "All" },
  { value: "PUBLIC", label: "Public" },
  { value: "PRIVATE", label: "Private" },
];

const PENALTY_TYPES = [
  "All", "OVERSTAY", "ROUTE_VIOLATION", "UNAUTHORIZED_PARKING", "OVERWEIGHT", "CONTRABAND",
];

const PAYMENT_STATUSES = ["All", "UNPAID", "PAID", "OVERRIDDEN", "DISPUTED"];

const REG_STATUS_FILTERS = [
  { value: "All", label: "All" },
  { value: "MSS_VERIFIED", label: "MSS Verified" },
  { value: "UNVERIFIED", label: "Unverified" },
  { value: "VERIFICATION_REQUESTED", label: "Verification Requested" },
  { value: "FLAGGED", label: "Flagged" },
  { value: "DISABLED", label: "Disabled" },
];

const TRUCK_TYPE_OPTIONS = [
  "All", "20-FOOTER", "40-FOOTER", "FLATBED", "LOW_LOADER", "TANKER", "CURTAINSIDER",
];

// ─── Display Options columns (user-toggleable, all on by default) ───
const TOGGLEABLE_COLUMNS = [
  { key: "truck_image",    label: "Truck Image" },
  { key: "truck_type",     label: "Truck Type" },
  { key: "truck_color",    label: "Truck Color" },
  { key: "chassis_number", label: "Chassis Number" },
  { key: "truck_brand",    label: "Truck Brand" },
  { key: "truck_model",    label: "Truck Model" },
  { key: "truck_length",   label: "Truck Length" },
  { key: "truck_capacity", label: "Truck Capacity" },
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

function formatLabel(s: string) {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// ─── Truck Image Placeholder ───
function TruckAvatar({ color }: { color: string }) {
  const colorMap: Record<string, string> = {
    White: "bg-gray-100", Red: "bg-red-50", Blue: "bg-blue-50",
    Grey: "bg-slate-100", Green: "bg-emerald-50", Yellow: "bg-yellow-50",
    Black: "bg-gray-900", Silver: "bg-gray-200",
  };
  const iconMap: Record<string, string> = {
    White: "text-gray-400", Red: "text-red-400", Blue: "text-blue-400",
    Grey: "text-slate-400", Green: "text-emerald-500", Yellow: "text-yellow-500",
    Black: "text-gray-400", Silver: "text-gray-500",
  };
  return (
    <div className={`flex h-9 w-14 shrink-0 items-center justify-center rounded-lg border border-gray-200 ${colorMap[color] ?? "bg-gray-100"}`}>
      <Truck className={`h-4 w-4 ${iconMap[color] ?? "text-gray-400"}`} />
    </div>
  );
}

// ─── Registration Status Badge ───
function RegStatusBadge({ status }: { status: RegistrationStatus }) {
  const map: Record<RegistrationStatus, { cls: string; label: string }> = {
    MSS_VERIFIED:            { cls: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "MSS Verified" },
    UNVERIFIED:              { cls: "bg-amber-50 text-amber-700 border-amber-200",       label: "Unverified" },
    VERIFICATION_REQUESTED:  { cls: "bg-blue-50 text-blue-700 border-blue-200",          label: "Verification Requested" },
    FLAGGED:                 { cls: "bg-red-50 text-red-700 border-red-200",             label: "Flagged" },
    DISABLED:                { cls: "bg-gray-100 text-gray-500 border-gray-200",         label: "Disabled" },
    ARCHIVED:                { cls: "bg-gray-50 text-gray-400 border-gray-200",          label: "Archived" },
  };
  const { cls, label } = map[status] ?? { cls: "bg-gray-50 text-gray-400 border-gray-200", label: status };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${cls}`}>
      {label}
    </span>
  );
}

// ─── Truck Status Badge ───
function TruckStatusBadge({ status }: { status: TruckStatus }) {
  const map: Record<TruckStatus, string> = {
    AVAILABLE:    "bg-emerald-50 text-emerald-700 border-emerald-200",
    ON_TRIP:      "bg-blue-50 text-blue-700 border-blue-200",
    IN_FACILITY:  "bg-violet-50 text-violet-700 border-violet-200",
    MATCHED:      "bg-cyan-50 text-cyan-700 border-cyan-200",
    GTG_FACILITY: "bg-indigo-50 text-indigo-700 border-indigo-200",
    LEFT_FACILITY:"bg-teal-50 text-teal-700 border-teal-200",
    IN_PREGATE:   "bg-orange-50 text-orange-700 border-orange-200",
    GTG_PREGATE:  "bg-lime-50 text-lime-700 border-lime-200",
    LEFT_PREGATE: "bg-yellow-50 text-yellow-700 border-yellow-200",
    IN_TERMINAL:  "bg-purple-50 text-purple-700 border-purple-200",
    LEFT_TERMINAL:"bg-rose-50 text-rose-700 border-rose-200",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap ${map[status]}`}>
      {formatLabel(status)}
    </span>
  );
}

// ─── Visibility Badge ───
function VisibilityBadge({ v }: { v: Visibility }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
      v === "PUBLIC" ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-600"
    }`}>
      {v === "PUBLIC" ? "🌐 Public" : "🔒 Private"}
    </span>
  );
}

// ─── Payment Status Badge ───
function PaymentBadge({ status }: { status: PaymentStatus }) {
  const map: Record<PaymentStatus, string> = {
    UNPAID:     "bg-red-50 text-red-700 border-red-200",
    PAID:       "bg-emerald-50 text-emerald-700 border-emerald-200",
    OVERRIDDEN: "bg-gray-50 text-gray-500 border-gray-200",
    DISPUTED:   "bg-amber-50 text-amber-700 border-amber-200",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${map[status]}`}>
      {formatLabel(status)}
    </span>
  );
}

// ─── Penalty Type Badge ───
function PenaltyBadge({ type }: { type: PenaltyType }) {
  const map: Record<PenaltyType, string> = {
    OVERSTAY:             "bg-red-50 text-red-600",
    ROUTE_VIOLATION:      "bg-orange-50 text-orange-600",
    UNAUTHORIZED_PARKING: "bg-amber-50 text-amber-700",
    OVERWEIGHT:           "bg-rose-50 text-rose-700",
    CONTRABAND:           "bg-purple-50 text-purple-700",
  };
  return (
    <span className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${map[type]}`}>
      {formatLabel(type)}
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

// ─── Reason Dialog (for Override + Re-enable) ───
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

function formatChassisNumber(value: string) {
  if (!value) return "—";
  return value.length > 12 ? `${value.substring(0, 12)}...` : value;
}

// ─── Summary Panel ───
function SummaryPanel({
  summary,
  isLoading,
}: {
  summary?: TrucksSummaryResponse;
  isLoading?: boolean;
}) {
  const cards = [
    { label: "Total Trucks",  value: summary?.total ?? 0, color: "text-blue-400",    bg: "bg-blue-400/10",    Icon: Truck },
    { label: "MSS Verified",  value: summary?.mss_verified ?? 0, color: "text-emerald-400", bg: "bg-emerald-400/10", Icon: CheckCircle2 },
    { label: "Unverified",    value: (summary?.unverified ?? 0) + (summary?.verification_requested ?? 0), color: "text-amber-400", bg: "bg-amber-400/10", Icon: AlertCircle },
    { label: "Flagged",       value: summary?.flagged ?? 0, color: "text-red-400",     bg: "bg-red-400/10",     Icon: AlertTriangle },
    { label: "Disabled",      value: summary?.disabled ?? 0, color: "text-gray-400",    bg: "bg-gray-400/10",    Icon: XCircle },
    { label: "Available Now", value: summary?.available ?? 0, color: "text-cyan-400",    bg: "bg-cyan-400/10",    Icon: Power },
  ];

  return (
    <div className="rounded-2xl bg-[#0f1e2e] p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Truck Fleet Management</h1>
          <p className="text-xs text-gray-400">All registered trucks across the ETSS-Nigeria logistics platform</p>
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
  regStatusFilter: string,
  truckStatusFilter: string,
  visibilityFilter: string,
  penaltyTypeFilter: string,
  paymentStatusFilter: string,
  truckTypeFilter: string,
): TrucksListParams {
  const params: TrucksListParams = {
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
  };

  if (activeTab !== "all") {
    params.category = activeTab;
  } else if (regStatusFilter !== "All") {
    params.registration_status = regStatusFilter;
  }

  if (truckStatusFilter !== "All") params.truck_status = truckStatusFilter;
  if (visibilityFilter !== "All") params.visibility = visibilityFilter;
  if (penaltyTypeFilter !== "All") params.penalty_type = penaltyTypeFilter;
  if (paymentStatusFilter !== "All") params.payment_status = paymentStatusFilter;
  if (truckTypeFilter !== "All") params.truck_type = truckTypeFilter;

  return params;
}

// ─── Main Page ───
export function TrucksPage() {
  const [activeTab, setActiveTab] = useState<TabId>("all");
  const [page, setPage] = useState(1);
  const { search, setSearch, debouncedSearch, resetSearch } = useDebouncedSearch("", () => setPage(1));
  const [truckStatusFilter, setTruckStatusFilter] = useState("All");
  const [visibilityFilter, setVisibilityFilter] = useState("All");
  const [regStatusFilter, setRegStatusFilter] = useState("All");
  const [penaltyTypeFilter, setPenaltyTypeFilter] = useState("All");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("All");
  const [truckTypeFilter, setTruckTypeFilter] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTruck, setSelectedTruck] = useState<TruckType | null>(null);
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
    regStatusFilter,
    truckStatusFilter,
    visibilityFilter,
    penaltyTypeFilter,
    paymentStatusFilter,
    truckTypeFilter,
  );

  const { data: summary, isLoading: summaryLoading } = useTrucksSummary();
  const { data: trucksData, isLoading, isError } = useTrucks(listParams);

  const disableTruck = useDisableTruck();
  const archiveTruck = useArchiveTruck();
  const reEnableTruck = useReEnableTruck();
  const overridePenalty = useOverrideTruckPenalty();
  const requestVerification = useRequestTruckVerification();
  const exportTrucks = useExportTrucks();

  const trucks = Array.isArray(trucksData?.data) ? trucksData.data : [];
  const meta = trucksData?.meta;
  const totalPages = meta?.total_pages ?? 1;
  const totalCount = meta?.total ?? 0;

  function switchTab(tab: TabId) {
    setActiveTab(tab);
    setPage(1);
    resetSearch();
    setTruckStatusFilter("All");
    setVisibilityFilter("All");
    setRegStatusFilter("All");
    setPenaltyTypeFilter("All");
    setPaymentStatusFilter("All");
    setTruckTypeFilter("All");
    setShowFilters(false);
  }

  const tabCounts = {
    all:        summary?.total ?? 0,
    verified:   summary?.mss_verified ?? 0,
    unverified: (summary?.unverified ?? 0) + (summary?.verification_requested ?? 0),
    flagged:    summary?.flagged ?? 0,
    disabled:   summary?.disabled ?? 0,
  };

  const hasActiveFilters = debouncedSearch || truckStatusFilter !== "All" || visibilityFilter !== "All" ||
    regStatusFilter !== "All" || penaltyTypeFilter !== "All" || paymentStatusFilter !== "All" || truckTypeFilter !== "All";

  function clearFilters() {
    resetSearch();
    setTruckStatusFilter("All");
    setVisibilityFilter("All");
    setRegStatusFilter("All");
    setPenaltyTypeFilter("All");
    setPaymentStatusFilter("All");
    setTruckTypeFilter("All");
    setPage(1);
  }

  function handleExportCsv() {
    exportTrucks.mutate(listParams, {
      onSuccess: () => toast.success("Trucks exported as CSV."),
    });
  }

  function handleDisable(truck: TruckType) {
    setReasonDialog({
      title: `Disable Truck — ${truck.plate_number}`,
      description: `Disable truck "${truck.plate_number}"? It will be prevented from new bookings immediately.`,
      confirmLabel: "Disable Truck",
      danger: true,
      onConfirm: (reason) => {
        setReasonDialog(null);
        disableTruck.mutate({ id: truck.id, reason }, {
          onSuccess: () => toast.success(`Truck ${truck.plate_number} has been disabled.`),
        });
      },
    });
  }

  function handleArchive(truck: TruckType) {
    setConfirm({
      title: "Archive Truck",
      message: `Archive truck "${truck.plate_number}"? Its record will be retained for audit purposes.`,
      confirmLabel: "Archive Truck",
      danger: true,
      onConfirm: () => {
        setConfirm(null);
        archiveTruck.mutate(truck.id, {
          onSuccess: () => toast.success(`Truck ${truck.plate_number} has been archived.`),
        });
      },
    });
  }

  function handleRequestVerification(truck: TruckType) {
    setConfirm({
      title: "Request MSS Verification",
      message: `Send an MSS verification request to the NPA system for truck "${truck.plate_number}"?`,
      confirmLabel: "Send Request",
      onConfirm: () => {
        setConfirm(null);
        requestVerification.mutate(truck.id, {
          onSuccess: () => toast.success(`Verification request sent for ${truck.plate_number}.`),
        });
      },
    });
  }

  function handleOverridePenalty(truck: TruckType) {
    setReasonDialog({
      title: `Override Penalty — ${truck.plate_number}`,
      description: `Penalty ID: ${truck.penalty?.penalty_id ?? "—"}. Provide a reason for this override. This action will be logged.`,
      confirmLabel: "Override Penalty",
      danger: true,
      onConfirm: (reason) => {
        setReasonDialog(null);
        overridePenalty.mutate({ id: truck.id, reason }, {
          onSuccess: () => toast.success(`Penalty for ${truck.plate_number} has been overridden.`),
        });
      },
    });
  }

  function handleReEnable(truck: TruckType) {
    setReasonDialog({
      title: `Re-enable Truck — ${truck.plate_number}`,
      description: "Provide a reason or NPA confirmation reference for re-enabling this truck.",
      confirmLabel: "Re-enable Truck",
      onConfirm: (reason) => {
        setReasonDialog(null);
        reEnableTruck.mutate({ id: truck.id, reason }, {
          onSuccess: () => toast.success(`Truck ${truck.plate_number} has been re-enabled.`),
        });
      },
    });
  }

  // ─── Actions Menus per tab ───
  function AllActionsMenu({ truck }: { truck: TruckType }) {
    const [open, setOpen] = useState(false);
    return (
      <div className="relative">
        <button onClick={() => setOpen(!open)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
          <MoreHorizontal className="h-4 w-4" />
        </button>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <div className="absolute right-0 top-full z-20 mt-1 w-52 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
              <button onClick={() => { setOpen(false); setSelectedTruck(truck); }} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                <Eye className="h-3.5 w-3.5" /> View Details
              </button>
              {truck.registration_status === "MSS_VERIFIED" && (
                <button onClick={() => { setOpen(false); handleDisable(truck); }} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-gray-50">
                  <Ban className="h-3.5 w-3.5" /> Disable Truck
                </button>
              )}
            </div>
          </>
        )}
      </div>
    );
  }

  function VerifiedActionsMenu({ truck }: { truck: TruckType }) {
    const [open, setOpen] = useState(false);
    return (
      <div className="relative">
        <button onClick={() => setOpen(!open)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
          <MoreHorizontal className="h-4 w-4" />
        </button>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <div className="absolute right-0 top-full z-20 mt-1 w-52 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
              <button onClick={() => { setOpen(false); setSelectedTruck(truck); }} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"><Eye className="h-3.5 w-3.5" /> View Details</button>
              <button onClick={() => { setOpen(false); handleDisable(truck); }} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-gray-50"><Ban className="h-3.5 w-3.5" /> Disable Truck</button>
              <button onClick={() => { setOpen(false); handleArchive(truck); }} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-gray-50"><Archive className="h-3.5 w-3.5" /> Archive Truck</button>
            </div>
          </>
        )}
      </div>
    );
  }

  function UnverifiedActionsMenu({ truck }: { truck: TruckType }) {
    const [open, setOpen] = useState(false);
    const canRequest = truck.registration_status === "UNVERIFIED";
    return (
      <div className="relative">
        <button onClick={() => setOpen(!open)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
          <MoreHorizontal className="h-4 w-4" />
        </button>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <div className="absolute right-0 top-full z-20 mt-1 w-56 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
              <button onClick={() => { setOpen(false); setSelectedTruck(truck); }} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"><Eye className="h-3.5 w-3.5" /> View Details</button>
              {canRequest && (
                <button onClick={() => { setOpen(false); handleRequestVerification(truck); }} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-blue-700 hover:bg-gray-50"><Send className="h-3.5 w-3.5" /> Request MSS Verification</button>
              )}
            </div>
          </>
        )}
      </div>
    );
  }

  function FlaggedActionsMenu({ truck }: { truck: TruckType }) {
    const [open, setOpen] = useState(false);
    const canOverride = truck.penalty?.payment_status === "UNPAID" || truck.penalty?.payment_status === "DISPUTED";
    return (
      <div className="relative">
        <button onClick={() => setOpen(!open)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
          <MoreHorizontal className="h-4 w-4" />
        </button>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <div className="absolute right-0 top-full z-20 mt-1 w-52 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
              <button onClick={() => { setOpen(false); setSelectedTruck(truck); }} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"><Eye className="h-3.5 w-3.5" /> View Details</button>
              {canOverride && (
                <button onClick={() => { setOpen(false); handleOverridePenalty(truck); }} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-amber-700 hover:bg-gray-50"><Shield className="h-3.5 w-3.5" /> Override Penalty</button>
              )}
            </div>
          </>
        )}
      </div>
    );
  }

  function DisabledActionsMenu({ truck }: { truck: TruckType }) {
    const [open, setOpen] = useState(false);
    return (
      <div className="relative">
        <button onClick={() => setOpen(!open)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
          <MoreHorizontal className="h-4 w-4" />
        </button>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <div className="absolute right-0 top-full z-20 mt-1 w-52 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
              <button onClick={() => { setOpen(false); setSelectedTruck(truck); }} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"><Eye className="h-3.5 w-3.5" /> View Truck Details</button>
              <button onClick={() => { setOpen(false); handleReEnable(truck); }} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-emerald-700 hover:bg-gray-50"><Power className="h-3.5 w-3.5" /> Re-enable Truck</button>
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

  const lastRefresh = trucksData
    ? new Date().toLocaleString("en-NG", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit", hour12: true,
      })
    : "—";

  // ─── Tab Config ───
  const TAB_CONFIG: Record<TabId, { label: string; color: string; dot: string }> = {
    all:        { label: "All Trucks",      color: "text-gray-700",    dot: "bg-gray-500" },
    verified:   { label: "MSS Verified",    color: "text-emerald-700", dot: "bg-emerald-500" },
    unverified: { label: "Unverified",      color: "text-amber-700",   dot: "bg-amber-500" },
    flagged:    { label: "Flagged",         color: "text-red-700",     dot: "bg-red-500" },
    disabled:   { label: "Disabled",        color: "text-gray-600",    dot: "bg-gray-400" },
  };

  const searchPlaceholders: Record<TabId, string> = {
    all:        "Search plate number, chassis, transporter...",
    verified:   "Search plate number, chassis, transporter, MSS number...",
    unverified: "Search plate number, chassis or transporter name...",
    flagged:    "Search plate number, transporter or penalty ID...",
    disabled:   "Search plate number, chassis or MSS number...",
  };

  return (
    <div className="space-y-5 p-6">

      {/* ─── Dialogs ─── */}
      {confirm && <ConfirmDialog {...confirm} onCancel={() => setConfirm(null)} />}
      {reasonDialog && <ReasonDialog {...reasonDialog} onCancel={() => setReasonDialog(null)} />}

      {/* ─── Truck Detail Drawer ─── */}
      {selectedTruck && (
        <>
          <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setSelectedTruck(null)} />
          <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[480px] flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between bg-[#0f1e2e] px-6 py-4">
              <div className="flex items-center gap-3">
                <TruckAvatar color={selectedTruck.color} />
                <div>
                  <p className="font-mono text-sm font-bold text-white">{selectedTruck.plate_number}</p>
                  <p className="text-[11px] text-gray-400">{selectedTruck.brand} {selectedTruck.model}</p>
                </div>
              </div>
              <button onClick={() => setSelectedTruck(null)} className="rounded-lg p-1.5 text-gray-400 hover:bg-white/10 hover:text-white"><X className="h-4 w-4" /></button>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto p-6">
              <div className="flex flex-wrap gap-2">
                <RegStatusBadge status={selectedTruck.registration_status} />
                {selectedTruck.truck_status && <TruckStatusBadge status={selectedTruck.truck_status} />}
                <VisibilityBadge v={selectedTruck.visibility} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  ["Truck Type", formatLabel(selectedTruck.truck_type)],
                  ["Color", selectedTruck.color],
                  ["Brand", selectedTruck.brand],
                  ["Model", selectedTruck.model],
                  ["Length", selectedTruck.truck_length],
                  ["Capacity", selectedTruck.truck_capacity],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-xl bg-gray-50 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{k}</p>
                    <p className="mt-1 text-sm font-semibold text-gray-800">{v}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-xl border border-gray-100 bg-white">
                <p className="border-b border-gray-100 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Details</p>
                <div className="divide-y divide-gray-50">
                  {[
                    ["Chassis Number", selectedTruck.chassis_number, true],
                    ["MSS Verification No.", selectedTruck.mss_verification_number ?? "—", true],
                    ["RFID Tag", selectedTruck.rfid_tag_number ?? "—", true],
                    ["Registered By", `${selectedTruck.registered_by.company_name} / ${selectedTruck.registered_by.user_account}`, false],
                    ["Created At", formatTimestamp(selectedTruck.created_at), false],
                    ...(selectedTruck.verification_timestamp ? [["Verification Date", formatTimestamp(selectedTruck.verification_timestamp), false]] : []),
                    ...(selectedTruck.disable_info ? [
                      ["Disabled By", selectedTruck.disable_info.disabled_by, false],
                      ["Disable Reason", selectedTruck.disable_info.disable_reason, false],
                      ["Disabled At", formatTimestamp(selectedTruck.disable_info.disable_timestamp), false],
                    ] : []),
                  ].map(([label, value, mono]) => (
                    <div key={String(label)} className="flex items-start justify-between gap-4 px-4 py-2.5">
                      <p className="shrink-0 text-xs text-gray-500">{String(label)}</p>
                      <p className={`text-right text-xs font-medium text-gray-800 ${mono ? "font-mono" : ""}`}>{String(value)}</p>
                    </div>
                  ))}
                </div>
              </div>
              {selectedTruck.penalty && (
                <div className="rounded-xl border border-red-100 bg-red-50 p-4">
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-red-500">Active Penalty</p>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between"><span className="text-xs text-gray-600">Penalty ID</span><span className="font-mono text-xs font-semibold text-gray-800">{selectedTruck.penalty.penalty_id}</span></div>
                    <div className="flex items-center justify-between"><span className="text-xs text-gray-600">Type</span><PenaltyBadge type={selectedTruck.penalty.penalty_type} /></div>
                    <div className="flex items-center justify-between"><span className="text-xs text-gray-600">Amount</span><span className="text-xs font-bold text-red-700">₦{selectedTruck.penalty.amount.toLocaleString()}</span></div>
                    <div className="flex items-center justify-between"><span className="text-xs text-gray-600">Status</span><PaymentBadge status={selectedTruck.penalty.payment_status} /></div>
                  </div>
                </div>
              )}
            </div>
            <div className="border-t border-gray-100 px-6 py-3">
              <p className="text-center text-[10px] text-gray-400">Truck record — ETSS-Nigeria Platform</p>
            </div>
          </div>
        </>
      )}

      {/* ─── Breadcrumb ─── */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-500">
        <span>Operations</span>
        <Chevron className="h-3 w-3" />
        <span>Trucks</span>
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
              <Truck className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900">Truck Fleet Registry</h1>
              <p className="text-xs text-gray-500">Manage all registered trucks — MSS Verified, Unverified, Flagged &amp; Disabled</p>
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

        {/* Last Refresh */}
        <div className="flex items-center justify-between px-6 py-2.5">
          <p className="text-xs text-gray-500">
            {activeTab === "verified" && "Trucks with valid MSS Verification Numbers — real-time logistics cycle status."}
            {activeTab === "unverified" && "Registered trucks pending MSS verification from the NPA system."}
            {activeTab === "flagged" && "Trucks with unpaid penalties issued by Enforcement Officers."}
            {activeTab === "disabled" && "Trucks disabled by NPA or SuperAdmin — re-enable requires NPA confirmation."}
            {activeTab === "all" && "All registered trucks across the ETSS-Nigeria platform."}
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
                disabled={exportTrucks.isPending}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                {exportTrucks.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-400" /> : <FileText className="h-3.5 w-3.5 text-gray-400" />}
                CSV
              </button>
              <button onClick={() => toast.info("PDF export — coming soon.")} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"><FileText className="h-3.5 w-3.5 text-red-500" /> PDF</button>
            </div>
          </div>
        </div>

        {/* ─── Tab-specific Filters ─── */}
        {showFilters && (
          <div className="mt-3 flex flex-wrap items-end gap-4 border-t border-gray-100 pt-3">
            {/* All + Verified: Truck Status */}
            {(activeTab === "all" || activeTab === "verified") && (
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-gray-400">Truck Status</label>
                <div className="relative">
                  <select value={truckStatusFilter} onChange={(e) => { setTruckStatusFilter(e.target.value); setPage(1); }} className="appearance-none rounded-lg border border-gray-200 bg-white py-1.5 pl-3 pr-8 text-xs text-gray-700 outline-none focus:border-emerald-300">
                    {TRUCK_STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s === "All" ? "All Statuses" : formatLabel(s)}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute bottom-2.5 right-2 h-3 w-3 text-gray-400" />
                </div>
              </div>
            )}

            {/* All: Registration Status */}
            {activeTab === "all" && (
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-gray-400">Registration Status</label>
                <div className="relative">
                  <select value={regStatusFilter} onChange={(e) => { setRegStatusFilter(e.target.value); setPage(1); }} className="appearance-none rounded-lg border border-gray-200 bg-white py-1.5 pl-3 pr-8 text-xs text-gray-700 outline-none focus:border-emerald-300">
                    {REG_STATUS_FILTERS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute bottom-2.5 right-2 h-3 w-3 text-gray-400" />
                </div>
              </div>
            )}

            {/* Visibility: verified, unverified, disabled */}
            {(activeTab === "verified" || activeTab === "unverified" || activeTab === "disabled" || activeTab === "flagged") && (
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

            {/* Flagged: Penalty Type */}
            {activeTab === "flagged" && (
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-gray-400">Penalty Type</label>
                <div className="relative">
                  <select value={penaltyTypeFilter} onChange={(e) => { setPenaltyTypeFilter(e.target.value); setPage(1); }} className="appearance-none rounded-lg border border-gray-200 bg-white py-1.5 pl-3 pr-8 text-xs text-gray-700 outline-none focus:border-emerald-300">
                    {PENALTY_TYPES.map((s) => <option key={s} value={s}>{s === "All" ? "All Types" : formatLabel(s)}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute bottom-2.5 right-2 h-3 w-3 text-gray-400" />
                </div>
              </div>
            )}

            {/* Flagged: Payment Status */}
            {activeTab === "flagged" && (
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-gray-400">Payment Status</label>
                <div className="relative">
                  <select value={paymentStatusFilter} onChange={(e) => { setPaymentStatusFilter(e.target.value); setPage(1); }} className="appearance-none rounded-lg border border-gray-200 bg-white py-1.5 pl-3 pr-8 text-xs text-gray-700 outline-none focus:border-emerald-300">
                    {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s === "All" ? "All Statuses" : formatLabel(s)}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute bottom-2.5 right-2 h-3 w-3 text-gray-400" />
                </div>
              </div>
            )}

            {/* Truck Type: disabled */}
            {activeTab === "disabled" && (
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-gray-400">Truck Type</label>
                <div className="relative">
                  <select value={truckTypeFilter} onChange={(e) => { setTruckTypeFilter(e.target.value); setPage(1); }} className="appearance-none rounded-lg border border-gray-200 bg-white py-1.5 pl-3 pr-8 text-xs text-gray-700 outline-none focus:border-emerald-300">
                    {TRUCK_TYPE_OPTIONS.map((s) => <option key={s} value={s}>{s === "All" ? "All Types" : formatLabel(s)}</option>)}
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

      {/* ─── Results count ─── */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">
          Showing <span className="font-semibold text-gray-800">{totalCount}</span> truck{totalCount !== 1 ? "s" : ""}
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
                {col("truck_image") && staticTH("Truck")}
                {staticTH("Plate Number")}
                {col("truck_type") && staticTH("Truck Type")}
                {col("truck_color") && staticTH("Color")}
                {col("chassis_number") && staticTH("Chassis No.")}
                {col("truck_brand") && staticTH("Brand")}
                {col("truck_model") && staticTH("Model")}
                {col("truck_length") && staticTH("Length")}
                {col("truck_capacity") && staticTH("Capacity")}
                {staticTH("Created")}
                {staticTH("Reg. Status")}
                {(activeTab === "verified" || activeTab === "all") && staticTH("Truck Status")}
                {staticTH("Registered By")}
                {staticTH("Visibility")}
                {activeTab === "verified" && staticTH("MSS Verif. No.")}
                {activeTab === "verified" && staticTH("Verification Date")}
                {activeTab === "unverified" && staticTH("MSS Status")}
                {activeTab === "flagged" && staticTH("Penalty ID")}
                {activeTab === "flagged" && staticTH("Penalty Type")}
                {activeTab === "flagged" && staticTH("Amount (₦)")}
                {activeTab === "flagged" && staticTH("Date Issued")}
                {activeTab === "flagged" && staticTH("Issued By")}
                {activeTab === "flagged" && staticTH("Payment")}
                {activeTab === "disabled" && staticTH("MSS Verif. No.")}
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
                      <p className="text-sm font-medium text-gray-400">Loading trucks...</p>
                    </div>
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={20} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <AlertCircle className="h-8 w-8 text-red-300" />
                      <p className="text-sm font-medium text-gray-400">Failed to load trucks</p>
                    </div>
                  </td>
                </tr>
              ) : trucks.length === 0 ? (
                <tr>
                  <td colSpan={20} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Truck className="h-8 w-8 text-gray-300" />
                      <p className="text-sm font-medium text-gray-400">No trucks match your filters</p>
                      {hasActiveFilters && <button onClick={clearFilters} className="text-xs font-medium text-emerald-600 hover:underline">Clear all filters</button>}
                    </div>
                  </td>
                </tr>
              ) : (
                trucks.map((t, idx) => (
                  <tr key={t.id} className="transition-colors hover:bg-gray-50/80">
                    {/* S/No */}
                    <td className="px-3 py-3 text-xs font-medium text-gray-400">{(page - 1) * PAGE_SIZE + idx + 1}</td>

                    {/* Truck image */}
                    {col("truck_image") && <td className="px-3 py-3"><TruckAvatar color={t.color} /></td>}

                    {/* Plate Number — always visible */}
                    <td className="px-3 py-3">
                      <span className="font-mono text-xs font-bold text-gray-900">{t.plate_number}</span>
                    </td>

                    {/* Truck Type */}
                    {col("truck_type") && (
                      <td className="px-3 py-3">
                        <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-700">{formatLabel(t.truck_type)}</span>
                      </td>
                    )}

                    {/* Truck Color */}
                    {col("truck_color") && <td className="px-3 py-3 text-xs text-gray-600">{t.color}</td>}

                    {/* Chassis Number */}
                    {col("chassis_number") && (
                      <td className="px-3 py-3"><span className="font-mono text-[11px] text-gray-500">{formatChassisNumber(t.chassis_number)}</span></td>
                    )}

                    {/* Truck Brand */}
                    {col("truck_brand") && (
                      <td className="px-3 py-3 text-xs font-semibold text-gray-800">{t?.brand || "N/A"}</td>
                    )}

                    {/* Truck Model */}
                    {col("truck_model") && (
                      <td className="px-3 py-3 text-xs text-gray-600">{t?.model || "N/A"}</td>
                    )}

                    {/* Truck Length */}
                    {col("truck_length") && (
                      <td className="px-3 py-3 text-xs text-gray-600">{t?.truck_length || "N/A"}</td>
                    )}

                    {/* Truck Capacity */}
                    {col("truck_capacity") && (
                      <td className="px-3 py-3 text-xs text-gray-600">{t?.truck_capacity || "N/A"}</td>
                    )}

                    {/* Created */}
                    <td className="px-3 py-3">
                      <span className="flex items-center gap-1 text-[11px] text-gray-500">
                        <Clock className="h-3 w-3" />{formatTimestamp(t.created_at)}
                      </span>
                    </td>

                    {/* Reg Status */}
                    <td className="px-3 py-3"><RegStatusBadge status={t.registration_status} /></td>

                    {/* Truck Status (all + verified) */}
                    {(activeTab === "verified" || activeTab === "all") && (
                      <td className="px-3 py-3">
                        {t.truck_status ? <TruckStatusBadge status={t.truck_status} /> : <span className="text-xs text-gray-400">—</span>}
                      </td>
                    )}

                    {/* Registered By */}
                    <td className="px-3 py-3">
                      <div className="flex items-start gap-1">
                        <Building2 className="mt-0.5 h-3 w-3 shrink-0 text-gray-400" />
                        <div>
                          <p className="text-xs font-medium text-gray-800">{t.registered_by.company_name}</p>
                          <p className="text-[10px] text-gray-500">{t.registered_by.user_account}</p>
                        </div>
                      </div>
                    </td>

                    {/* Visibility */}
                    <td className="px-3 py-3"><VisibilityBadge v={t.visibility} /></td>

                    {/* MSS Verif No. (verified tab) */}
                    {activeTab === "verified" && (
                      <td className="px-3 py-3"><span className="font-mono text-[11px] text-gray-600">{t.mss_verification_number ?? "—"}</span></td>
                    )}

                    {/* Verification Date (verified tab) */}
                    {activeTab === "verified" && (
                      <td className="px-3 py-3">
                        <span className="flex items-center gap-1 text-[11px] text-gray-500">
                          <Clock className="h-3 w-3" />{t.verification_timestamp ? formatTimestamp(t.verification_timestamp) : "—"}
                        </span>
                      </td>
                    )}

                    {/* Unverified: MSS Status */}
                    {activeTab === "unverified" && (
                      <td className="px-3 py-3">
                        {t.registration_status === "VERIFICATION_REQUESTED" ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700">
                            <RefreshCw className="h-3 w-3 animate-spin" /> In Progress
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                            Pending
                          </span>
                        )}
                      </td>
                    )}

                    {/* Flagged columns */}
                    {activeTab === "flagged" && <td className="px-3 py-3"><span className="font-mono text-[11px] font-medium text-gray-700">{t.penalty?.penalty_id ?? "—"}</span></td>}
                    {activeTab === "flagged" && <td className="px-3 py-3">{t.penalty ? <PenaltyBadge type={t.penalty.penalty_type} /> : "—"}</td>}
                    {activeTab === "flagged" && <td className="px-3 py-3"><span className="text-xs font-bold text-red-600">₦{(t.penalty?.amount ?? 0).toLocaleString()}</span></td>}
                    {activeTab === "flagged" && <td className="px-3 py-3"><span className="flex items-center gap-1 text-[11px] text-gray-500"><Clock className="h-3 w-3" />{t.penalty ? formatTimestamp(t.penalty.date_issued) : "—"}</span></td>}
                    {activeTab === "flagged" && <td className="px-3 py-3"><span className="text-xs text-gray-600">{t.penalty?.issued_by ?? "—"}</span></td>}
                    {activeTab === "flagged" && <td className="px-3 py-3">{t.penalty ? <PaymentBadge status={t.penalty.payment_status} /> : "—"}</td>}

                    {/* Disabled columns */}
                    {activeTab === "disabled" && <td className="px-3 py-3"><span className="font-mono text-[11px] text-gray-600">{t.mss_verification_number ?? "—"}</span></td>}
                    {activeTab === "disabled" && <td className="px-3 py-3"><span className="text-xs text-gray-700">{t.disable_info?.disabled_by ?? "—"}</span></td>}
                    {activeTab === "disabled" && <td className="px-3 py-3"><p className="max-w-48 text-xs leading-tight text-gray-600">{t.disable_info?.disable_reason ?? "—"}</p></td>}
                    {activeTab === "disabled" && <td className="px-3 py-3"><span className="flex items-center gap-1 text-[11px] text-gray-500"><Clock className="h-3 w-3" />{t.disable_info ? formatTimestamp(t.disable_info.disable_timestamp) : "—"}</span></td>}

                    {/* Actions */}
                    <td className="px-3 py-3 text-center">
                      {activeTab === "all"        && <AllActionsMenu truck={t} />}
                      {activeTab === "verified"   && <VerifiedActionsMenu truck={t} />}
                      {activeTab === "unverified" && <UnverifiedActionsMenu truck={t} />}
                      {activeTab === "flagged"    && <FlaggedActionsMenu truck={t} />}
                      {activeTab === "disabled"   && <DisabledActionsMenu truck={t} />}
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
            Showing <span className="font-medium text-gray-700">{trucks.length > 0 ? (page - 1) * PAGE_SIZE + 1 : 0}</span>–
            <span className="font-medium text-gray-700">{(page - 1) * PAGE_SIZE + trucks.length}</span> of{" "}
            <span className="font-medium text-gray-700">{totalCount}</span> trucks
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
          <span className="font-semibold">Audit Notice:</span> All truck management actions (Disable, Archive, Request Verification, Override Penalty, Re-enable) are
          automatically logged with Truck ID, Action Type, Performed By (SuperAdmin/NPA), Reason, and Timestamp. Penalty overrides require a mandatory reason.
        </p>
      </div>
    </div>
  );
}

"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import {
  Warehouse,
  Truck,
  Fish,
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
  Edit2,
  MoreHorizontal,
  MapPin,
  Timer,
  Package,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  FileText,
  Plus,
  Layers,
  SlidersHorizontal,
  BarChart3,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import {
  MOCK_BONDED_TERMINALS,
  MOCK_TRUCK_PARKS,
  MOCK_FISH_VAN_PARKS,
  bondedSummary,
  truckParksSummary,
  fishVanSummary,
} from "@/lib/facilities-mock-data";
import type { Facility, FacilityStatus, FacilitySubType, FacilitySummary } from "@/types/facilities.types";

// ─── Constants ───
const PAGE_SIZE = 10;

const STATUSES = [
  { value: "All",      label: "All Statuses" },
  { value: "ACTIVE",   label: "Enabled" },
  { value: "INACTIVE", label: "Disabled" },
  { value: "ARCHIVED", label: "Archived" },
];

const FACILITY_SUB_TYPES = [
  { value: "All",               label: "All Types" },
  { value: "FACILITY",          label: "Facility" },
  { value: "FACILITY_PREGATE",  label: "Facility Pregate" },
];

type TabId = "bonded" | "truck_parks" | "fish_van";
type SortField = "name" | "facility_type" | "operational_status" | "hourly_handling_capacity" | "approved_capacity";

// ─── Display Options ───
const TOGGLEABLE_COLUMNS = [
  { key: "facility_id",       label: "Facility ID" },
  { key: "facility_type",     label: "Facility Type" },
  { key: "address",           label: "Address" },
  { key: "hourly_capacity",   label: "Hourly Handling Capacity" },
  { key: "approved_capacity", label: "Approved Capacity" },
  { key: "status",            label: "Operational Status" },
  { key: "created_at",        label: "Created At" },
  { key: "updated_at",        label: "Last Updated" },
] as const;

type ColumnKey = typeof TOGGLEABLE_COLUMNS[number]["key"];

// ─── Tab Config ───
const TAB_CONFIG: Record<TabId, {
  label: string;
  entityLabel: string;
  idLabel: string;
  capacityLabel: string;
  capacityUnit: string;
  addLabel: string;
  emptyLabel: string;
  description: string;
  Icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  summaryData: FacilitySummary;
  data: Facility[];
}> = {
  bonded: {
    label: "Bonded Terminals",
    entityLabel: "Bonded Terminal",
    idLabel: "Bonded Terminal ID",
    capacityLabel: "Container Capacity",
    capacityUnit: "containers",
    addLabel: "Add Bonded Terminal",
    emptyLabel: "No bonded terminals match your filters",
    description: "Registered bonded holding bays for containerised cargo awaiting customs clearance.",
    Icon: Warehouse,
    iconColor: "text-orange-600",
    iconBg: "bg-orange-50",
    summaryData: bondedSummary,
    data: MOCK_BONDED_TERMINALS,
  },
  truck_parks: {
    label: "Truck Parks",
    entityLabel: "Truck Park",
    idLabel: "Truck Park ID",
    capacityLabel: "Truck Bay Capacity",
    capacityUnit: "bays",
    addLabel: "Add Truck Park",
    emptyLabel: "No truck parks match your filters",
    description: "Registered truck parking facilities for trucks awaiting loading, dispatch, or holding.",
    Icon: Truck,
    iconColor: "text-blue-600",
    iconBg: "bg-blue-50",
    summaryData: truckParksSummary,
    data: MOCK_TRUCK_PARKS,
  },
  fish_van: {
    label: "Fish-Van Parks",
    entityLabel: "Fish-Van Park",
    idLabel: "Fish-Van Park ID",
    capacityLabel: "Fish-Van Bay Capacity",
    capacityUnit: "bays",
    addLabel: "Add Fish-Van Park",
    emptyLabel: "No fish-van parks match your filters",
    description: "Registered Fish-Van parking facilities for refrigerated fish transport vehicles.",
    Icon: Fish,
    iconColor: "text-teal-600",
    iconBg: "bg-teal-50",
    summaryData: fishVanSummary,
    data: MOCK_FISH_VAN_PARKS,
  },
};

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

function formatFacilityType(type: FacilitySubType) {
  return type === "FACILITY" ? "Facility" : "Facility Pregate";
}

// ─── Status Badge ───
function StatusBadge({ status }: { status: FacilityStatus }) {
  const map: Record<FacilityStatus, { cls: string; Icon: React.ElementType; label: string }> = {
    ACTIVE:   { cls: "bg-emerald-50 text-emerald-700 border-emerald-200", Icon: CheckCircle2, label: "Enabled" },
    INACTIVE: { cls: "bg-red-50 text-red-700 border-red-200",             Icon: XCircle,     label: "Disabled" },
    ARCHIVED: { cls: "bg-gray-50 text-gray-500 border-gray-200",           Icon: Archive,     label: "Archived" },
  };
  const { cls, Icon, label } = map[status];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${cls}`}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}

// ─── Facility Type Badge ───
function FacilityTypeBadge({ type }: { type: FacilitySubType }) {
  if (type === "FACILITY_PREGATE") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-medium text-violet-700">
        <MapPin className="h-3 w-3" />
        Facility Pregate
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">
      <Layers className="h-3 w-3" />
      Facility
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
          <button onClick={onCancel} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`rounded-lg px-4 py-2 text-sm font-medium text-white ${danger ? "bg-red-600 hover:bg-red-700" : "bg-emerald-600 hover:bg-emerald-700"}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Facility Detail Drawer ───
function FacilityDetailDrawer({
  facility,
  tab,
  onClose,
}: {
  facility: Facility;
  tab: TabId;
  onClose: () => void;
}) {
  const cfg = TAB_CONFIG[tab];
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[460px] flex-col bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 bg-[#0f1e2e] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600/20">
              <cfg.Icon className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">{facility.name}</h2>
              <p className="font-mono text-[11px] text-emerald-400">{facility.facility_id}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-white/10 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-5 overflow-y-auto p-6">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={facility.operational_status} />
            <FacilityTypeBadge type={facility.facility_type} />
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${cfg.iconBg} ${cfg.iconColor}`}>
              <cfg.Icon className="h-3 w-3" />
              {cfg.entityLabel}
            </span>
          </div>

          {/* Capacity Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <div className="mb-2 flex items-center gap-2">
                <div className="rounded-lg bg-blue-100 p-1.5"><Timer className="h-3.5 w-3.5 text-blue-600" /></div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Hourly TAT</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">{facility.hourly_handling_capacity}</p>
              <p className="mt-0.5 text-[11px] text-gray-400">units / hour</p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <div className="mb-2 flex items-center gap-2">
                <div className="rounded-lg bg-emerald-100 p-1.5"><Package className="h-3.5 w-3.5 text-emerald-600" /></div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">{cfg.capacityLabel}</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">{facility.approved_capacity}</p>
              <p className="mt-0.5 text-[11px] text-gray-400">{cfg.capacityUnit}</p>
            </div>
            <div className="col-span-2 rounded-xl border border-gray-100 bg-gray-50 p-4">
              <div className="mb-2 flex items-center gap-2">
                <div className="rounded-lg bg-amber-100 p-1.5"><TrendingUp className="h-3.5 w-3.5 text-amber-600" /></div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Daily Evacuation Limit</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">{facility.daily_evacuation_limit.toLocaleString()}</p>
              <p className="mt-0.5 text-[11px] text-gray-400">units / day (max throughput)</p>
            </div>
          </div>

          {/* Details */}
          <div className="rounded-xl border border-gray-100 bg-white">
            <div className="border-b border-gray-100 px-4 py-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Facility Details</p>
            </div>
            <div className="divide-y divide-gray-50">
              {[
                { label: "Facility ID",     value: facility.id,                            mono: true },
                { label: cfg.idLabel,       value: facility.facility_id,                   mono: true },
                { label: "Name",            value: facility.name },
                { label: "Category",        value: cfg.entityLabel },
                { label: "Facility Type",   value: formatFacilityType(facility.facility_type) },
                { label: "Address",         value: facility.address },
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
                  <Clock className="h-3 w-3 text-gray-400" />{formatTimestamp(facility.created_at)}
                </p>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <p className="text-xs text-gray-500">Last Updated</p>
                <p className="flex items-center gap-1 text-xs font-medium text-gray-800">
                  <Clock className="h-3 w-3 text-gray-400" />{formatTimestamp(facility.updated_at)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 px-6 py-4">
          <p className="text-center text-[10px] text-gray-400">Facility record — ETSS-Nigeria Platform</p>
        </div>
      </div>
    </>
  );
}

// ─── Display Options Dropdown ───
function DisplayOptionsMenu({
  visibleColumns,
  onToggle,
}: {
  visibleColumns: Set<ColumnKey>;
  onToggle: (key: ColumnKey) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
          open ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-gray-200 text-gray-600 hover:bg-gray-50"
        }`}
      >
        <SlidersHorizontal className="h-4 w-4" />
        Display
        <ChevronDown className="h-3 w-3" />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-20 mt-1 w-58 rounded-xl border border-gray-200 bg-white py-2 shadow-lg">
          <p className="mb-1 px-3 pt-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
            Toggle Columns
          </p>
          {TOGGLEABLE_COLUMNS.map((col) => (
            <label key={col.key} className="flex cursor-pointer items-center gap-2.5 px-3 py-2 hover:bg-gray-50">
              <input
                type="checkbox"
                checked={visibleColumns.has(col.key)}
                onChange={() => onToggle(col.key)}
                className="h-3.5 w-3.5 rounded accent-emerald-600"
              />
              <span className="text-xs text-gray-700">{col.label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Actions Menu ───
function ActionsMenu({
  facility,
  tab,
  onAction,
}: {
  facility: Facility;
  tab: TabId;
  onAction: (action: string, f: Facility) => void;
}) {
  const [open, setOpen] = useState(false);
  const cfg = TAB_CONFIG[tab];

  const actions: { label: string; icon: React.ElementType; action: string; danger?: boolean }[] = [
    { label: "View Details",                           icon: Eye,     action: "view" },
    { label: `Edit ${cfg.entityLabel} Details`,        icon: Edit2,   action: "edit" },
  ];

  if (facility.operational_status === "ACTIVE") {
    actions.push({ label: `Disable ${cfg.entityLabel}`, icon: Ban,     action: "disable", danger: true });
    actions.push({ label: `Archive ${cfg.entityLabel}`, icon: Archive, action: "archive", danger: true });
  } else if (facility.operational_status === "INACTIVE") {
    actions.push({ label: `Enable ${cfg.entityLabel}`,  icon: Power,   action: "enable" });
    actions.push({ label: `Archive ${cfg.entityLabel}`, icon: Archive, action: "archive", danger: true });
  } else if (facility.operational_status === "ARCHIVED") {
    actions.push({ label: `Enable ${cfg.entityLabel}`,  icon: Power,   action: "enable" });
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-20 mt-1 w-52 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
            {actions.map((a) => (
              <button
                key={a.action}
                onClick={() => { setOpen(false); onAction(a.action, facility); }}
                className={`flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-gray-50 ${a.danger ? "text-red-600" : "text-gray-700"}`}
              >
                <a.icon className="h-3.5 w-3.5" />
                {a.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Summary Panel ───
function SummaryPanel({
  summary,
  tab,
  onAdd,
}: {
  summary: FacilitySummary;
  tab: TabId;
  onAdd: () => void;
}) {
  const cfg = TAB_CONFIG[tab];
  const cards = [
    { label: `Total ${cfg.label}`,         value: summary.total,                                       Icon: cfg.Icon,     color: "text-blue-400",    bg: "bg-blue-400/10" },
    { label: "Enabled",                    value: summary.enabled,                                     Icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-400/10" },
    { label: "Disabled",                   value: summary.disabled,                                    Icon: XCircle,      color: "text-red-400",     bg: "bg-red-400/10" },
    { label: "Avg Hourly Capacity",        value: `${summary.avg_hourly_handling_capacity}/hr`,        Icon: Timer,        color: "text-violet-400",  bg: "bg-violet-400/10" },
    { label: "Total Daily Evacuation",     value: summary.total_daily_evacuation_limit.toLocaleString(),Icon: TrendingUp,  color: "text-amber-400",   bg: "bg-amber-400/10" },
  ];

  return (
    <div className="rounded-2xl bg-[#0f1e2e] p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">{cfg.entityLabel} Management</h2>
          <p className="text-xs text-gray-400">{cfg.description}</p>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-emerald-700"
        >
          <Plus className="h-3.5 w-3.5" />
          {cfg.addLabel}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {cards.map((card) => (
          <div key={card.label} className="rounded-xl bg-white/5 p-4 transition-colors hover:bg-white/10">
            <div className="mb-2">
              <div className={`inline-flex rounded-lg p-1.5 ${card.bg}`}>
                <card.Icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{card.value}</p>
            <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-gray-500">{card.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Sort Icon ───
function SortIcon({ field, sortField, sortDir }: { field: string; sortField: string | null; sortDir: "asc" | "desc" }) {
  if (sortField !== field) return <ArrowUpDown className="ml-1 h-3 w-3 text-gray-300" />;
  return sortDir === "asc"
    ? <ArrowUp className="ml-1 h-3 w-3 text-emerald-600" />
    : <ArrowDown className="ml-1 h-3 w-3 text-emerald-600" />;
}

// ─── Main Page ───
export function FacilitiesPage() {
  const [activeTab, setActiveTab] = useState<TabId>("bonded");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [facilityTypeFilter, setFacilityTypeFilter] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [visibleColumns, setVisibleColumns] = useState<Set<ColumnKey>>(
    new Set(TOGGLEABLE_COLUMNS.map((c) => c.key))
  );

  const [bondedList, setBondedList] = useState<Facility[]>(MOCK_BONDED_TERMINALS);
  const [truckList, setTruckList] = useState<Facility[]>(MOCK_TRUCK_PARKS);
  const [fishVanList, setFishVanList] = useState<Facility[]>(MOCK_FISH_VAN_PARKS);

  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [confirm, setConfirm] = useState<{
    title: string;
    message: string;
    confirmLabel: string;
    danger?: boolean;
    onConfirm: () => void;
  } | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [search]);

  function switchTab(tab: TabId) {
    setActiveTab(tab);
    setPage(1);
    setSearch("");
    setDebouncedSearch("");
    setStatusFilter("All");
    setFacilityTypeFilter("All");
    setSortField(null);
  }

  function toggleColumn(key: ColumnKey) {
    setVisibleColumns((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }

  const col = (key: ColumnKey) => visibleColumns.has(key);

  const currentData = activeTab === "bonded" ? bondedList : activeTab === "truck_parks" ? truckList : fishVanList;
  const currentSetter = activeTab === "bonded" ? setBondedList : activeTab === "truck_parks" ? setTruckList : setFishVanList;
  const currentSummary = TAB_CONFIG[activeTab].summaryData;
  const cfg = TAB_CONFIG[activeTab];

  // ─── Filter + Sort + Paginate ───
  const filtered = useMemo(() => {
    let result = [...currentData];

    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(
        (f) => f.name.toLowerCase().includes(q) || f.address.toLowerCase().includes(q) || f.facility_id.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== "All") {
      result = result.filter((f) => f.operational_status === statusFilter);
    }

    if (facilityTypeFilter !== "All") {
      result = result.filter((f) => f.facility_type === facilityTypeFilter);
    }

    if (sortField) {
      result.sort((a, b) => {
        const av = a[sortField as keyof Facility] ?? "";
        const bv = b[sortField as keyof Facility] ?? "";
        const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
        return sortDir === "asc" ? cmp : -cmp;
      });
    }

    return result;
  }, [currentData, debouncedSearch, statusFilter, facilityTypeFilter, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const hasActiveFilters = debouncedSearch || statusFilter !== "All" || facilityTypeFilter !== "All";
  const activeFilterCount = [statusFilter !== "All", facilityTypeFilter !== "All"].filter(Boolean).length;

  function clearFilters() {
    setSearch("");
    setDebouncedSearch("");
    setStatusFilter("All");
    setFacilityTypeFilter("All");
    setPage(1);
  }

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
    setPage(1);
  }

  // ─── Mutations ───
  function handleAction(action: string, facility: Facility) {
    if (action === "view") { setSelectedFacility(facility); return; }
    if (action === "edit") { toast.info(`Edit "${facility.name}" — coming soon.`); return; }

    const update = (status: FacilityStatus) => {
      currentSetter((prev) =>
        prev.map((f) => f.id === facility.id ? { ...f, operational_status: status, updated_at: new Date().toISOString() } : f)
      );
    };

    if (action === "enable") {
      setConfirm({
        title: `Enable ${cfg.entityLabel}`,
        message: `Enable "${facility.name}"? It will become available for scheduling and dispatch.`,
        confirmLabel: `Enable ${cfg.entityLabel}`,
        onConfirm: () => { setConfirm(null); update("ACTIVE"); toast.success(`"${facility.name}" has been enabled.`); },
      });
    }

    if (action === "disable") {
      setConfirm({
        title: `Disable ${cfg.entityLabel}`,
        message: `Disable "${facility.name}"? It will be excluded from scheduling and dispatch but remain in the database.`,
        confirmLabel: `Disable ${cfg.entityLabel}`,
        danger: true,
        onConfirm: () => { setConfirm(null); update("INACTIVE"); toast.success(`"${facility.name}" has been disabled.`); },
      });
    }

    if (action === "archive") {
      setConfirm({
        title: `Archive ${cfg.entityLabel}`,
        message: `Archive "${facility.name}"? This will permanently remove it from all users' view. Only SuperAdmin retains visibility.`,
        confirmLabel: `Archive ${cfg.entityLabel}`,
        danger: true,
        onConfirm: () => { setConfirm(null); update("ARCHIVED"); toast.success(`"${facility.name}" has been archived.`); },
      });
    }
  }

  function SortableTH({ field, children }: { field: SortField; children: React.ReactNode }) {
    return (
      <th
        onClick={() => handleSort(field)}
        className="cursor-pointer select-none px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500 hover:text-gray-700"
      >
        <span className="inline-flex items-center">
          {children}
          <SortIcon field={field} sortField={sortField} sortDir={sortDir} />
        </span>
      </th>
    );
  }

  const TABS: TabId[] = ["bonded", "truck_parks", "fish_van"];
  const tabCounts: Record<TabId, number> = {
    bonded: bondedList.length,
    truck_parks: truckList.length,
    fish_van: fishVanList.length,
  };

  return (
    <div className="space-y-5 p-6">

      {/* ─── Dialogs ─── */}
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
      {selectedFacility && (
        <FacilityDetailDrawer
          facility={selectedFacility}
          tab={activeTab}
          onClose={() => setSelectedFacility(null)}
        />
      )}

      {/* ─── Breadcrumb ─── */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-500">
        <span>Infrastructure</span>
        <Chevron className="h-3 w-3" />
        <span>Facilities</span>
        <Chevron className="h-3 w-3" />
        <span className="font-semibold text-gray-800">{cfg.label}</span>
      </nav>

      {/* ─── Module Header + Tab Bar ─── */}
      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-6 pb-0 pt-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0f1e2e]">
              <BarChart3 className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900">Facility Management</h1>
              <p className="text-xs text-gray-500">
                Manage Bonded Terminals, Truck Parks, and Fish-Van Parks across the ETSS-Nigeria network
              </p>
            </div>
          </div>

          {/* 3-Tab Navigation */}
          <div className="flex gap-1">
            {TABS.map((tab) => {
              const tcfg = TAB_CONFIG[tab];
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => switchTab(tab)}
                  className={`flex items-center gap-2 rounded-t-lg border-b-2 px-5 py-3 text-xs font-semibold transition-colors ${
                    isActive
                      ? "border-emerald-600 text-emerald-700"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <tcfg.Icon className="h-3.5 w-3.5" />
                  {tcfg.label}
                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                    isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"
                  }`}>
                    {tabCounts[tab]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Contextual description */}
        <div className="px-6 py-3">
          <p className="text-xs text-gray-500">{cfg.description}</p>
        </div>
      </div>

      {/* ─── Summary Panel ─── */}
      <SummaryPanel
        summary={currentSummary}
        tab={activeTab}
        onAdd={() => toast.info(`${cfg.addLabel} form — coming soon.`)}
      />

      {/* ─── Toolbar ─── */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex flex-wrap items-center gap-3">

          {/* Search */}
          <div className="relative min-w-56 flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={`Search by ${cfg.entityLabel} name or location...`}
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
          <DisplayOptionsMenu visibleColumns={visibleColumns} onToggle={toggleColumn} />

          {/* Export */}
          <div className="relative group">
            <button className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50">
              <Download className="h-4 w-4" />
              Export
              <ChevronDown className="h-3 w-3" />
            </button>
            <div className="absolute right-0 top-full z-20 mt-1 hidden w-36 rounded-lg border border-gray-200 bg-white py-1 shadow-lg group-hover:block">
              <button onClick={() => toast.info("Exporting as CSV...")} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                <FileText className="h-3.5 w-3.5 text-gray-400" /> CSV
              </button>
              <button onClick={() => toast.info("Exporting as PDF...")} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                <FileText className="h-3.5 w-3.5 text-red-500" /> PDF
              </button>
            </div>
          </div>
        </div>

        {/* Filter Row */}
        {showFilters && (
          <div className="mt-3 flex flex-wrap items-center gap-4 border-t border-gray-100 pt-3">
            {/* Status */}
            <div>
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                Operational Status
              </label>
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                  className="appearance-none rounded-lg border border-gray-200 bg-white py-1.5 pl-3 pr-8 text-xs text-gray-700 outline-none focus:border-emerald-300"
                >
                  {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute bottom-2.5 right-2 h-3 w-3 text-gray-400" />
              </div>
            </div>

            {/* Facility Type */}
            <div>
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                Facility Type
              </label>
              <div className="relative">
                <select
                  value={facilityTypeFilter}
                  onChange={(e) => { setFacilityTypeFilter(e.target.value); setPage(1); }}
                  className="appearance-none rounded-lg border border-gray-200 bg-white py-1.5 pl-3 pr-8 text-xs text-gray-700 outline-none focus:border-emerald-300"
                >
                  {FACILITY_SUB_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
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

      {/* ─── Result Count ─── */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">
          Showing <span className="font-semibold text-gray-800">{filtered.length}</span> {cfg.entityLabel.toLowerCase()}{filtered.length !== 1 ? "s" : ""}
          {hasActiveFilters && " matching your filters"}
        </p>
        {sortField && (
          <button onClick={() => { setSortField(null); setSortDir("asc"); }} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600">
            <X className="h-3 w-3" />
            Clear sort
          </button>
        )}
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
                <SortableTH field="name">Facility Name</SortableTH>
                {col("facility_id") && (
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                    {cfg.idLabel}
                  </th>
                )}
                {col("facility_type") && <SortableTH field="facility_type">Facility Type</SortableTH>}
                {col("address") && (
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                    Address
                  </th>
                )}
                {col("hourly_capacity") && <SortableTH field="hourly_handling_capacity">Hourly Capacity</SortableTH>}
                {col("approved_capacity") && <SortableTH field="approved_capacity">{cfg.capacityLabel}</SortableTH>}
                {col("status") && <SortableTH field="operational_status">Status</SortableTH>}
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
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <cfg.Icon className="h-8 w-8 text-gray-300" />
                      <p className="text-sm font-medium text-gray-400">{cfg.emptyLabel}</p>
                      {hasActiveFilters && (
                        <button onClick={clearFilters} className="text-xs font-medium text-emerald-600 hover:underline">
                          Clear all filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paged.map((f, idx) => (
                  <tr key={f.id} className="transition-colors hover:bg-gray-50/80">

                    {/* S/No */}
                    <td className="px-4 py-3 text-xs font-medium text-gray-400">
                      {(page - 1) * PAGE_SIZE + idx + 1}
                    </td>

                    {/* Name */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${cfg.iconBg}`}>
                          <cfg.Icon className={`h-4 w-4 ${cfg.iconColor}`} />
                        </div>
                        <p className="text-xs font-semibold text-gray-900">{f.name}</p>
                      </div>
                    </td>

                    {/* Facility ID */}
                    {col("facility_id") && (
                      <td className="px-4 py-3">
                        <span className="rounded-md bg-gray-100 px-2 py-0.5 font-mono text-[11px] text-gray-600">
                          {f.facility_id}
                        </span>
                      </td>
                    )}

                    {/* Facility Type */}
                    {col("facility_type") && (
                      <td className="px-4 py-3">
                        <FacilityTypeBadge type={f.facility_type} />
                      </td>
                    )}

                    {/* Address */}
                    {col("address") && (
                      <td className="px-4 py-3">
                        <div className="flex items-start gap-1">
                          <MapPin className="mt-0.5 h-3 w-3 shrink-0 text-gray-400" />
                          <p className="max-w-44 text-xs leading-tight text-gray-600">{f.address}</p>
                        </div>
                      </td>
                    )}

                    {/* Hourly Capacity */}
                    {col("hourly_capacity") && (
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Timer className="h-3 w-3 text-gray-400" />
                          <span className="text-xs font-semibold text-gray-800">{f.hourly_handling_capacity}</span>
                          <span className="text-[10px] text-gray-400">/hr</span>
                        </div>
                      </td>
                    )}

                    {/* Approved Capacity */}
                    {col("approved_capacity") && (
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Package className="h-3 w-3 text-gray-400" />
                          <span className="text-xs font-semibold text-gray-800">{f.approved_capacity}</span>
                          <span className="text-[10px] text-gray-400">{cfg.capacityUnit}</span>
                        </div>
                      </td>
                    )}

                    {/* Status */}
                    {col("status") && (
                      <td className="px-4 py-3">
                        <StatusBadge status={f.operational_status} />
                      </td>
                    )}

                    {/* Created */}
                    {col("created_at") && (
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1 text-[11px] text-gray-500">
                          <Clock className="h-3 w-3" />
                          {formatTimestamp(f.created_at)}
                        </span>
                      </td>
                    )}

                    {/* Updated */}
                    {col("updated_at") && (
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1 text-[11px] text-gray-500">
                          <Clock className="h-3 w-3" />
                          {formatTimestamp(f.updated_at)}
                        </span>
                      </td>
                    )}

                    {/* Actions */}
                    <td className="px-4 py-3 text-center">
                      <ActionsMenu facility={f} tab={activeTab} onAction={handleAction} />
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
            <span className="font-medium text-gray-700">{paged.length > 0 ? (page - 1) * PAGE_SIZE + 1 : 0}</span>–
            <span className="font-medium text-gray-700">{(page - 1) * PAGE_SIZE + paged.length}</span> of{" "}
            <span className="font-medium text-gray-700">{filtered.length}</span> {cfg.label.toLowerCase()}
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
                  p === page ? "bg-emerald-600 text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"
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

      {/* ─── Audit Notice ─── */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
        <p className="text-[11px] leading-relaxed text-amber-700">
          <span className="font-semibold">Audit Notice:</span> All Facility management actions (Add, Edit, Enable, Disable, Archive)
          are automatically logged with Facility ID, Action Type, Performed By (SuperAdmin Name/ID), and Timestamp for compliance
          and accountability.
        </p>
      </div>
    </div>
  );
}

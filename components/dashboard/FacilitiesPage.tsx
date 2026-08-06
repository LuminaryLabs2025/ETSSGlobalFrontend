"use client";

import { useState, useEffect } from "react";
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
  MapPin,
  Timer,
  Package,
  FileText,
  Plus,
  Layers,
  BarChart3,
  TrendingUp,
  AlertCircle,
  Loader2,
  User,
  Mail,
  CalendarClock,
  Tags,
  Landmark,
  ParkingCircle,
  Wifi,
  WifiOff,
  DoorOpen,
} from "lucide-react";
import { toast } from "sonner";
import type {
  Facility,
  FacilityDetail,
  FacilityDisplayStatus,
  FacilityParkType,
  FacilitySubType,
  FacilityBarrierStatus,
  FacilitiesSummaryResponse,
  EditFacilityInformationPayload,
} from "@/types/facilities.types";
import {
  getFacilityDisplayStatus,
  extractFacilityBarrierIds,
  resolveFacilityBarrierNumber,
  resolveFacilityBarrierOperationalStatus,
} from "@/types/facilities.types";
import { useFacilities } from "@/hooks/facilities/useFacilities";
import { useFacility } from "@/hooks/facilities/useFacility";
import { useFacilitiesSummary } from "@/hooks/facilities/useFacilitiesSummary";
import {
  useEnableFacility,
  useDisableFacility,
  useArchiveFacility,
  useEditFacilityInformation,
} from "@/hooks/facilities/useFacilityActions";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { useBarriers } from "@/hooks/barriers/useBarriers";
import { DisplayOptionsMenu } from "@/components/dashboard/DisplayOptionsMenu";
import { TableActionsDropdown } from "@/components/dashboard/TableActionsDropdown";
import { FacilityFormModal } from "@/components/dashboard/FacilityFormModal";
import {
  barrierOverlapError,
  findOverlappingBarrierIds,
  toggleBarrierSelection,
} from "@/lib/barrier-assignment";

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

const LOCATIONS = [
  { value: "All",    label: "All Locations" },
  { value: "APAPA",  label: "Apapa" },
  { value: "TINCAN", label: "Tincan" },
];

type TabId = "bonded" | "truck_parks" | "fish_van";

const TAB_TO_PARK_TYPE: Record<TabId, FacilityParkType> = {
  bonded: "BONDED_TERMINAL",
  truck_parks: "TRUCK_PARK",
  fish_van: "FISH_VAN_PARK",
};

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
const ALL_COLUMN_KEYS = TOGGLEABLE_COLUMNS.map((c) => c.key);

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

function formatNumber(value: number | null | undefined): string {
  return (value ?? 0).toLocaleString();
}

function getApprovedCapacity(facility: Facility, tab: TabId): number {
  return tab === "bonded"
    ? facility.approved_truck_capacity ?? 0
    : facility.bay_capacity ?? 0;
}

function formatLocation(location: string) {
  if (location === "APAPA") return "Apapa Zone";
  if (location === "TINCAN") return "Tincan Zone";
  return location;
}

function displayOrDash(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : "—";
}

function formatCategoryLabel(category: string) {
  const map: Record<string, string> = {
    IMPORT: "Import",
    EXPORT: "Export",
    EMPTY: "Empty",
    DOMESTIC: "Domestic",
    ENTRY: "Entry",
    EXIT: "Exit",
  };
  return map[category] ?? category.replace(/_/g, " ");
}

function formatTimeWindow(
  from?: string | null,
  to?: string | null,
  allDay?: boolean,
) {
  if (allDay || (!from?.trim() && !to?.trim())) return "All Day";
  if (!from?.trim() || !to?.trim()) return "—";
  return `${from} to ${to}`;
}

function DrawerSection({
  title,
  children,
  noPadding,
}: {
  title: string;
  children: React.ReactNode;
  noPadding?: boolean;
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white">
      <div className="border-b border-gray-100 px-4 py-2.5">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{title}</p>
      </div>
      <div className={noPadding ? undefined : "px-4 py-3"}>{children}</div>
    </div>
  );
}

function DetailRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 px-4 py-3">
      <p className="shrink-0 text-xs text-gray-500">{label}</p>
      <p className={`text-right text-xs font-medium text-gray-800 ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}

function BarrierStatusBadge({ status }: { status: FacilityBarrierStatus }) {
  const isOnline = status === "ONLINE";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
      isOnline ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"
    }`}>
      {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
      {isOnline ? "Online" : "Offline"}
    </span>
  );
}

function EmptySectionNote({ message = "—" }: { message?: string }) {
  return <p className="text-xs text-gray-400">{message}</p>;
}

// ─── Status Badge ───
function StatusBadge({ status }: { status: FacilityDisplayStatus }) {
  const map: Record<FacilityDisplayStatus, { cls: string; Icon: React.ElementType; label: string }> = {
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
  facility: fallbackFacility,
  tab,
  onClose,
  onRequestEnable,
  onRequestDisable,
  isStatusUpdating,
}: {
  facility: Facility;
  tab: TabId;
  onClose: () => void;
  onRequestEnable: (facility: Facility) => void;
  onRequestDisable: (facility: Facility) => void;
  isStatusUpdating?: boolean;
}) {
  const cfg = TAB_CONFIG[tab];
  const { data: detail, isLoading, isError } = useFacility(fallbackFacility.id);
  const facility: FacilityDetail = detail ?? fallbackFacility;
  const displayStatus = getFacilityDisplayStatus(facility);
  const approvedCapacity = getApprovedCapacity(facility, tab);
  const primaryAccount = facility.primary_account_user;
  const operationalHours = facility.operational_hours;
  const linkedCategories = facility.linked_booking_categories ?? [];
  const linkedTransitParks = facility.linked_transit_parks ?? [];
  const linkedTerminalOperators = facility.linked_terminal_operators ?? [];
  const entryBarriers = facility.entry_barriers ?? [];
  const exitBarriers = facility.exit_barriers ?? [];
  const movementTimes = facility.movement_times ?? [];
  const subAccounts = facility.sub_accounts ?? [];
  const canToggleStatus = displayStatus === "ACTIVE" || displayStatus === "INACTIVE";

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[520px] flex-col bg-white shadow-2xl">
        <div className="border-b border-white/10 bg-[#0f1e2e] px-6 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600/20">
                <cfg.Icon className="h-5 w-5 text-emerald-400" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-bold text-white">{facility.name}</h2>
                <p className="font-mono text-[11px] text-emerald-400">{facility.facility_code}</p>
                <div className="mt-2 space-y-0.5">
                  <p className="flex items-center gap-1.5 text-xs text-gray-300">
                    <User className="h-3 w-3 shrink-0 text-gray-500" />
                    <span className="truncate">{displayOrDash(primaryAccount?.name)}</span>
                  </p>
                  <p className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Mail className="h-3 w-3 shrink-0 text-gray-500" />
                    <span className="truncate">{displayOrDash(primaryAccount?.email)}</span>
                  </p>
                  <p className="text-[10px] uppercase tracking-wider text-gray-500">Primary Account User</p>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-white/10 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-6">
          {isLoading && (
            <div className="flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-xs text-gray-500">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-500" />
              Loading facility details...
            </div>
          )}
          {isError && (
            <div className="flex items-center gap-2 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-xs text-amber-700">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              Some detail fields may be unavailable. Showing cached facility data.
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={displayStatus} />
            <FacilityTypeBadge type={facility.facility_type} />
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${cfg.iconBg} ${cfg.iconColor}`}>
              <cfg.Icon className="h-3 w-3" />
              {cfg.entityLabel}
            </span>
            {facility.location && (
              <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-700">
                {formatLocation(facility.location)}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <div className="mb-2 flex items-center gap-2">
                <div className="rounded-lg bg-blue-100 p-1.5"><Timer className="h-3.5 w-3.5 text-blue-600" /></div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Hourly TAT</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">{facility.approved_truck_exits_per_hour ?? 0}</p>
              <p className="mt-0.5 text-[11px] text-gray-400">units / hour</p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <div className="mb-2 flex items-center gap-2">
                <div className="rounded-lg bg-emerald-100 p-1.5"><Package className="h-3.5 w-3.5 text-emerald-600" /></div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">{cfg.capacityLabel}</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">{approvedCapacity}</p>
              <p className="mt-0.5 text-[11px] text-gray-400">{cfg.capacityUnit}</p>
            </div>
            <div className="col-span-2 rounded-xl border border-gray-100 bg-gray-50 p-4">
              <div className="mb-2 flex items-center gap-2">
                <div className="rounded-lg bg-amber-100 p-1.5"><TrendingUp className="h-3.5 w-3.5 text-amber-600" /></div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Daily Evacuation Limit</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(facility.daily_empty_evacuation_limit)}</p>
              <p className="mt-0.5 text-[11px] text-gray-400">units / day (max throughput)</p>
            </div>
          </div>

          <DrawerSection title="Facility Operational Hours">
            <div className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-gray-400" />
              <p className="text-sm font-semibold text-gray-900">
                {formatTimeWindow(
                  operationalHours?.opens_at,
                  operationalHours?.closes_at,
                  operationalHours?.all_day,
                )}
              </p>
            </div>
          </DrawerSection>

          <DrawerSection title="Linked Booking Categories">
            {linkedCategories.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {linkedCategories.map((category) => (
                  <span
                    key={category}
                    className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700"
                  >
                    <Tags className="h-3 w-3" />
                    {formatCategoryLabel(category)}
                  </span>
                ))}
              </div>
            ) : (
              <EmptySectionNote />
            )}
          </DrawerSection>

          <DrawerSection title="Linked Transit Parks">
            {linkedTransitParks.length > 0 ? (
              <ul className="space-y-2">
                {linkedTransitParks.map((park) => (
                  <li key={park} className="flex items-center gap-2 text-sm text-gray-800">
                    <ParkingCircle className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                    {park}
                  </li>
                ))}
              </ul>
            ) : (
              <EmptySectionNote />
            )}
          </DrawerSection>

          <DrawerSection title="Linked Terminal Operators">
            {linkedTerminalOperators.length > 0 ? (
              <ul className="space-y-2">
                {linkedTerminalOperators.map((operator) => (
                  <li key={operator} className="flex items-center gap-2 text-sm text-gray-800">
                    <Landmark className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                    {operator}
                  </li>
                ))}
              </ul>
            ) : (
              <EmptySectionNote />
            )}
          </DrawerSection>

          <DrawerSection title="Entry Barrier ID Number(s) & Status" noPadding>
            {entryBarriers.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {entryBarriers.map((barrier) => (
                  <div key={barrier.id} className="flex items-center justify-between gap-4 px-4 py-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <DoorOpen className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                      <div className="min-w-0">
                        <p className="font-mono text-xs font-medium text-gray-800">
                          {resolveFacilityBarrierNumber(barrier)}
                        </p>
                        {barrier.barrier_type && (
                          <p className="text-[10px] text-gray-400">{formatCategoryLabel(barrier.barrier_type)}</p>
                        )}
                      </div>
                    </div>
                    <BarrierStatusBadge status={resolveFacilityBarrierOperationalStatus(barrier)} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-4 py-3">
                <EmptySectionNote message="No entry barriers assigned. Edit facility to link barriers from the catalog." />
              </div>
            )}
          </DrawerSection>

          <DrawerSection title="Exit Barrier ID Number(s) & Status" noPadding>
            {exitBarriers.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {exitBarriers.map((barrier) => (
                  <div key={barrier.id} className="flex items-center justify-between gap-4 px-4 py-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <DoorOpen className="h-3.5 w-3.5 shrink-0 text-violet-600" />
                      <div className="min-w-0">
                        <p className="font-mono text-xs font-medium text-gray-800">
                          {resolveFacilityBarrierNumber(barrier)}
                        </p>
                        {barrier.barrier_type && (
                          <p className="text-[10px] text-gray-400">{formatCategoryLabel(barrier.barrier_type)}</p>
                        )}
                      </div>
                    </div>
                    <BarrierStatusBadge status={resolveFacilityBarrierOperationalStatus(barrier)} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-4 py-3">
                <EmptySectionNote message="No exit barriers assigned. Edit facility to link barriers from the catalog." />
              </div>
            )}
          </DrawerSection>

          <DrawerSection title="Movement Times" noPadding>
            {movementTimes.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/60 text-[10px] uppercase tracking-wider text-gray-500">
                      <th className="px-4 py-2.5 text-left font-semibold">Booking Category</th>
                      <th className="px-4 py-2.5 text-left font-semibold">Transit Park</th>
                      <th className="px-4 py-2.5 text-left font-semibold">Authorised Timeframe</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {movementTimes.map((row, index) => (
                      <tr key={`${row.booking_category}-${row.transit_park ?? index}`}>
                        <td className="px-4 py-3 font-medium text-gray-800">{formatCategoryLabel(row.booking_category)}</td>
                        <td className="px-4 py-3 text-gray-600">{displayOrDash(row.transit_park)}</td>
                        <td className="px-4 py-3 text-gray-800">{formatTimeWindow(row.from_time, row.to_time)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="px-4 py-3"><EmptySectionNote /></div>
            )}
          </DrawerSection>

          <DrawerSection title="Sub-Accounts Linked to Facility" noPadding>
            {subAccounts.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {subAccounts.map((account) => (
                  <div key={account.id} className="px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900">{account.name}</p>
                        <p className="truncate text-xs text-gray-500">{displayOrDash(account.email)}</p>
                      </div>
                      {account.status && (
                        <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
                          {account.status}
                        </span>
                      )}
                    </div>
                    {account.user_type && (
                      <p className="mt-1 text-[11px] text-gray-400">{account.user_type}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-4 py-3"><EmptySectionNote /></div>
            )}
          </DrawerSection>

          <DrawerSection title="Facility Details" noPadding>
            <div className="divide-y divide-gray-50">
              <DetailRow label="Record ID" value={facility.id} mono />
              <DetailRow label={cfg.idLabel} value={facility.facility_code} mono />
              <DetailRow label="Name" value={facility.name} />
              <DetailRow label="Category" value={cfg.entityLabel} />
              <DetailRow label="Facility Type" value={formatFacilityType(facility.facility_type)} />
              <DetailRow label="Location" value={facility.location} />
              <DetailRow label="Address" value={facility.address} />
            </div>
          </DrawerSection>

          <DrawerSection title="Timestamps" noPadding>
            <div className="divide-y divide-gray-50">
              <div className="flex items-center justify-between px-4 py-3">
                <p className="text-xs text-gray-500">Created At</p>
                <p className="flex items-center gap-1 text-xs font-medium text-gray-800">
                  <Clock className="h-3 w-3 text-gray-400" />
                  {formatTimestamp(facility.created_at)}
                </p>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <p className="text-xs text-gray-500">Last Updated</p>
                <p className="flex items-center gap-1 text-xs font-medium text-gray-800">
                  <Clock className="h-3 w-3 text-gray-400" />
                  {formatTimestamp(facility.updated_at)}
                </p>
              </div>
            </div>
          </DrawerSection>
        </div>

        <div className="space-y-3 border-t border-gray-100 px-6 py-4">
          {canToggleStatus && (
            <div className="flex gap-2">
              {displayStatus === "INACTIVE" ? (
                <button
                  type="button"
                  onClick={() => onRequestEnable(facility)}
                  disabled={isStatusUpdating}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isStatusUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Power className="h-4 w-4" />}
                  Activate {cfg.entityLabel}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onRequestDisable(facility)}
                  disabled={isStatusUpdating}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isStatusUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ban className="h-4 w-4" />}
                  Deactivate {cfg.entityLabel}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Edit Facility Information Modal ───
function EditFacilityInformationModal({
  facility,
  tab,
  onClose,
  onSaved,
}: {
  facility: Facility;
  tab: TabId;
  onClose: () => void;
  onSaved: (updates: EditFacilityInformationPayload) => void;
}) {
  const { data: detail, isLoading: detailLoading } = useFacility(facility.id);
  const editFacility = useEditFacilityInformation();
  const { data: barriersData, isLoading: barriersLoading } = useBarriers({
    limit: 100,
    status: "ACTIVE",
  });

  const [trucksPerHour, setTrucksPerHour] = useState("");
  const [entryBarrierIds, setEntryBarrierIds] = useState<Set<string>>(new Set());
  const [exitBarrierIds, setExitBarrierIds] = useState<Set<string>>(new Set());
  const [entryBarrierMenuOpen, setEntryBarrierMenuOpen] = useState(false);
  const [exitBarrierMenuOpen, setExitBarrierMenuOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (initialized) return;
    if (detailLoading && !detail) return;

    const source = detail ?? facility;
    setTrucksPerHour(String(source.approved_truck_exits_per_hour ?? 0));
    setEntryBarrierIds(new Set(extractFacilityBarrierIds(detail?.entry_barriers)));
    setExitBarrierIds(new Set(extractFacilityBarrierIds(detail?.exit_barriers)));
    setInitialized(true);
  }, [detail, detailLoading, facility, initialized]);

  const barrierOptions = barriersData?.data ?? [];

  function toggleEntryBarrier(id: string) {
    const { selected, otherSelected } = toggleBarrierSelection(id, entryBarrierIds, exitBarrierIds);
    setEntryBarrierIds(selected);
    setExitBarrierIds(otherSelected);
    setErrors((prev) => {
      if (!prev.barriers) return prev;
      const { barriers, ...rest } = prev;
      return rest;
    });
  }

  function toggleExitBarrier(id: string) {
    const { selected, otherSelected } = toggleBarrierSelection(id, exitBarrierIds, entryBarrierIds);
    setExitBarrierIds(selected);
    setEntryBarrierIds(otherSelected);
    setErrors((prev) => {
      if (!prev.barriers) return prev;
      const { barriers, ...rest } = prev;
      return rest;
    });
  }

  function validate() {
    const nextErrors: Record<string, string> = {};
    const hourlyRate = Number(trucksPerHour);

    if (!trucksPerHour.trim() || Number.isNaN(hourlyRate) || hourlyRate <= 0) {
      nextErrors.trucksPerHour = "Enter a valid trucks-per-hour override greater than 0.";
    }

    const overlapError = barrierOverlapError(
      findOverlappingBarrierIds(entryBarrierIds, exitBarrierIds),
    );
    if (overlapError) nextErrors.barriers = overlapError;

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSave() {
    if (!validate()) return;

    const payload: EditFacilityInformationPayload = {
      approved_truck_exits_per_hour: Number(trucksPerHour),
      entry_barrier_ids: Array.from(entryBarrierIds),
      exit_barrier_ids: Array.from(exitBarrierIds),
    };

    editFacility.mutate(
      { id: facility.id, facility, payload },
      {
        onSuccess: () => {
          onSaved(payload);
          onClose();
        },
      },
    );
  }

  const selectedEntryBarrierLabels = Array.from(entryBarrierIds).map((id) => {
    const fromCatalog = barrierOptions.find((barrier) => barrier.id === id);
    if (fromCatalog) return fromCatalog.barrier_id_number;
    const fromDetail = detail?.entry_barriers?.find((barrier) => barrier.id === id);
    return fromDetail ? resolveFacilityBarrierNumber(fromDetail) : id;
  });

  const selectedExitBarrierLabels = Array.from(exitBarrierIds).map((id) => {
    const fromCatalog = barrierOptions.find((barrier) => barrier.id === id);
    if (fromCatalog) return fromCatalog.barrier_id_number;
    const fromDetail = detail?.exit_barriers?.find((barrier) => barrier.id === id);
    return fromDetail ? resolveFacilityBarrierNumber(fromDetail) : id;
  });

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/40" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-[70] flex max-h-[90vh] w-full max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col rounded-2xl border border-gray-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0f1e2e]">
              <Edit2 className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">Edit Facility Information</h2>
              <p className="text-xs text-gray-500">
                Update truck release rate and barrier assignments for {facility.name}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          {detailLoading && !initialized && (
            <div className="flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-xs text-gray-500">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-500" />
              Loading facility settings...
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-gray-500">
              Number of Trucks Released Per Hour (Override) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min={1}
              value={trucksPerHour}
              onChange={(e) => setTrucksPerHour(e.target.value)}
              className={`w-full rounded-lg border bg-gray-50 px-3 py-2 text-sm outline-none focus:border-emerald-300 focus:bg-white focus:ring-2 focus:ring-emerald-100 ${
                errors.trucksPerHour ? "border-red-300" : "border-gray-200"
              }`}
              placeholder="e.g. 13"
            />
            <p className="mt-1 text-[11px] text-gray-400">SuperAdmin override for authorised truck release rate.</p>
            {errors.trucksPerHour && <p className="mt-1 text-xs text-red-500">{errors.trucksPerHour}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-gray-500">
              Entry Barriers
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setEntryBarrierMenuOpen((open) => !open)}
                disabled={barriersLoading}
                className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-left text-sm outline-none focus:border-emerald-300 focus:bg-white focus:ring-2 focus:ring-emerald-100 disabled:opacity-60"
              >
                <span className={selectedEntryBarrierLabels.length > 0 ? "text-gray-900" : "text-gray-400"}>
                  {barriersLoading
                    ? "Loading barriers..."
                    : selectedEntryBarrierLabels.length > 0
                      ? selectedEntryBarrierLabels.join(", ")
                      : "Select entry barriers..."}
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-gray-400 transition-transform ${entryBarrierMenuOpen ? "rotate-180" : ""}`}
                />
              </button>
              {entryBarrierMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setEntryBarrierMenuOpen(false)} />
                  <div className="absolute bottom-full left-0 right-0 z-20 mb-1 max-h-48 overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                    {barrierOptions.length === 0 ? (
                      <p className="px-3 py-2.5 text-sm text-gray-400">No active barriers available.</p>
                    ) : (
                      barrierOptions.map((barrier) => (
                        <label
                          key={barrier.id}
                          className="flex cursor-pointer items-center gap-2.5 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <input
                            type="checkbox"
                            checked={entryBarrierIds.has(barrier.id)}
                            onChange={() => toggleEntryBarrier(barrier.id)}
                            className="h-3.5 w-3.5 rounded border-gray-300 accent-emerald-600"
                          />
                          <span className="min-w-0">
                            <span className="font-mono text-xs font-medium">{barrier.barrier_id_number}</span>
                            <span className="ml-1.5 text-[11px] text-gray-400">{barrier.service_provider_name}</span>
                          </span>
                        </label>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>
            {entryBarrierIds.size > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedEntryBarrierLabels.map((label) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 font-mono text-[11px] font-medium text-blue-700"
                  >
                    <DoorOpen className="h-3 w-3" />
                    {label}
                  </span>
                ))}
              </div>
            )}
            <p className="mt-1 text-[11px] text-gray-400">
              Barriers assigned as entry gates for this facility. Create barriers under Infrastructure → Barriers first.
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-gray-500">
              Exit Barriers
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setExitBarrierMenuOpen((open) => !open)}
                disabled={barriersLoading}
                className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-left text-sm outline-none focus:border-emerald-300 focus:bg-white focus:ring-2 focus:ring-emerald-100 disabled:opacity-60"
              >
                <span className={selectedExitBarrierLabels.length > 0 ? "text-gray-900" : "text-gray-400"}>
                  {barriersLoading
                    ? "Loading barriers..."
                    : selectedExitBarrierLabels.length > 0
                      ? selectedExitBarrierLabels.join(", ")
                      : "Select exit barriers..."}
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-gray-400 transition-transform ${exitBarrierMenuOpen ? "rotate-180" : ""}`}
                />
              </button>
              {exitBarrierMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setExitBarrierMenuOpen(false)} />
                  <div className="absolute bottom-full left-0 right-0 z-20 mb-1 max-h-48 overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                    {barrierOptions.length === 0 ? (
                      <p className="px-3 py-2.5 text-sm text-gray-400">No active barriers available.</p>
                    ) : (
                      barrierOptions.map((barrier) => (
                        <label
                          key={barrier.id}
                          className="flex cursor-pointer items-center gap-2.5 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <input
                            type="checkbox"
                            checked={exitBarrierIds.has(barrier.id)}
                            onChange={() => toggleExitBarrier(barrier.id)}
                            className="h-3.5 w-3.5 rounded border-gray-300 accent-emerald-600"
                          />
                          <span className="min-w-0">
                            <span className="font-mono text-xs font-medium">{barrier.barrier_id_number}</span>
                            <span className="ml-1.5 text-[11px] text-gray-400">{barrier.service_provider_name}</span>
                          </span>
                        </label>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>
            {exitBarrierIds.size > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedExitBarrierLabels.map((label) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2.5 py-1 font-mono text-[11px] font-medium text-violet-700"
                  >
                    <DoorOpen className="h-3 w-3" />
                    {label}
                  </span>
                ))}
              </div>
            )}
            <p className="mt-1 text-[11px] text-gray-400">
              Barriers assigned as exit gates for this facility.
            </p>
          </div>
          {errors.barriers && <p className="text-xs text-red-500">{errors.barriers}</p>}
          <p className="text-[11px] text-gray-400">
            A barrier cannot be both entry and exit — selecting it in one list removes it from the other.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={editFacility.isPending}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={editFacility.isPending || (detailLoading && !initialized)}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {editFacility.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Changes
          </button>
        </div>
      </div>
    </>
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
  const cfg = TAB_CONFIG[tab];
  const displayStatus = getFacilityDisplayStatus(facility);

  const actions: { label: string; icon: React.ElementType; action: string; danger?: boolean }[] = [
    { label: "View Facility Details",                    icon: Eye,     action: "view" },
    { label: "Edit Facility Information",                icon: Edit2,   action: "edit" },
  ];

  if (displayStatus === "ACTIVE") {
    actions.push({ label: `Disable ${cfg.entityLabel}`, icon: Ban,     action: "disable", danger: true });
    actions.push({ label: `Archive ${cfg.entityLabel}`, icon: Archive, action: "archive", danger: true });
  } else if (displayStatus === "INACTIVE") {
    actions.push({ label: `Enable ${cfg.entityLabel}`,  icon: Power,   action: "enable" });
    actions.push({ label: `Archive ${cfg.entityLabel}`, icon: Archive, action: "archive", danger: true });
  } else if (displayStatus === "ARCHIVED") {
    actions.push({ label: `Enable ${cfg.entityLabel}`,  icon: Power,   action: "enable" });
  }

  return (
    <TableActionsDropdown width={248}>
      {(close) => (
        <>
          {actions.map((a) => (
            <button
              key={a.action}
              onClick={() => { close(); onAction(a.action, facility); }}
              className={`flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-gray-50 ${a.danger ? "text-red-600" : "text-gray-700"}`}
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
  tab,
  isLoading,
  onAdd,
}: {
  summary?: FacilitiesSummaryResponse;
  tab: TabId;
  isLoading?: boolean;
  onAdd: () => void;
}) {
  const cfg = TAB_CONFIG[tab];
  const tabTotal =
    tab === "bonded"
      ? summary?.bonded_terminals ?? 0
      : tab === "truck_parks"
        ? summary?.truck_parks ?? 0
        : summary?.fish_van_parks ?? 0;

  const cards = [
    { label: `Total ${cfg.label}`,         value: tabTotal,                                                          Icon: cfg.Icon,     color: "text-blue-400",    bg: "bg-blue-400/10" },
    { label: "Enabled",                    value: summary?.enabled ?? 0,                                             Icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-400/10" },
    { label: "Disabled",                   value: summary?.disabled ?? 0,                                            Icon: XCircle,      color: "text-red-400",     bg: "bg-red-400/10" },
    { label: "Avg Hourly Capacity",        value: `${summary?.avg_truck_exits_per_hour ?? 0}/hr`,                    Icon: Timer,        color: "text-violet-400",  bg: "bg-violet-400/10" },
    { label: "Total Daily Evacuation",     value: (summary?.total_daily_empty_evacuation_limit ?? 0).toLocaleString(), Icon: TrendingUp,   color: "text-amber-400",   bg: "bg-amber-400/10" },
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

// ─── Main Page ───
export function FacilitiesPage() {
  const [activeTab, setActiveTab] = useState<TabId>("bonded");
  const [page, setPage] = useState(1);
  const { search, setSearch, debouncedSearch, resetSearch } = useDebouncedSearch("", () => setPage(1));
  const [statusFilter, setStatusFilter] = useState("All");
  const [facilityTypeFilter, setFacilityTypeFilter] = useState("All");
  const [locationFilter, setLocationFilter] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<Set<ColumnKey>>(
    new Set(TOGGLEABLE_COLUMNS.map((c) => c.key))
  );

  const [selectedFacility, setSelectedFacility] = useState<FacilityDetail | null>(null);
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [confirm, setConfirm] = useState<{
    title: string;
    message: string;
    confirmLabel: string;
    danger?: boolean;
    onConfirm: () => void;
  } | null>(null);

  function switchTab(tab: TabId) {
    setActiveTab(tab);
    setPage(1);
    resetSearch();
    setStatusFilter("All");
    setFacilityTypeFilter("All");
    setLocationFilter("All");
  }

  const col = (key: ColumnKey) => visibleColumns.has(key);
  const cfg = TAB_CONFIG[activeTab];

  const { data: summary, isLoading: summaryLoading } = useFacilitiesSummary();
  const { data: facilitiesData, isLoading, isError } = useFacilities({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
    park_type: TAB_TO_PARK_TYPE[activeTab],
    facility_type: facilityTypeFilter !== "All" ? (facilityTypeFilter as FacilitySubType) : undefined,
    status: statusFilter !== "All" ? statusFilter : undefined,
    location: locationFilter !== "All" ? locationFilter : undefined,
  });

  const enableFacility = useEnableFacility();
  const disableFacility = useDisableFacility();
  const archiveFacility = useArchiveFacility();

  const facilities = Array.isArray(facilitiesData?.data) ? facilitiesData.data : [];
  const meta = facilitiesData?.meta;
  const totalPages = meta?.total_pages ?? 1;
  const totalCount = meta?.total ?? 0;

  const hasActiveFilters =
    debouncedSearch || statusFilter !== "All" || facilityTypeFilter !== "All" || locationFilter !== "All";
  const activeFilterCount = [
    statusFilter !== "All",
    facilityTypeFilter !== "All",
    locationFilter !== "All",
  ].filter(Boolean).length;

  function clearFilters() {
    resetSearch();
    setStatusFilter("All");
    setFacilityTypeFilter("All");
    setLocationFilter("All");
    setPage(1);
  }

  function handleEditSaved(facilityId: string, payload: EditFacilityInformationPayload) {
    setSelectedFacility((current) =>
      current?.id === facilityId
        ? {
            ...current,
            approved_truck_exits_per_hour: payload.approved_truck_exits_per_hour,
            entry_barriers: payload.entry_barrier_ids.map((id) => ({ id })),
            exit_barriers: payload.exit_barrier_ids.map((id) => ({ id })),
          }
        : current,
    );
  }

  function handleAction(action: string, facility: Facility) {
    if (action === "view") {
      setSelectedFacility(facility);
      return;
    }

    if (action === "edit") {
      setEditingFacility(facility);
      return;
    }

    if (action === "enable") {
      setConfirm({
        title: `Enable ${cfg.entityLabel}`,
        message: `Enable "${facility.name}"? It will become available for scheduling and dispatch.`,
        confirmLabel: `Enable ${cfg.entityLabel}`,
        onConfirm: () => {
          setConfirm(null);
          enableFacility.mutate(facility, {
            onSuccess: () => {
              toast.success(`"${facility.name}" has been enabled.`);
              setSelectedFacility((current) =>
                current?.id === facility.id ? { ...current, status: "ACTIVE", archived_at: null } : current,
              );
            },
          });
        },
      });
    }

    if (action === "disable") {
      setConfirm({
        title: `Disable ${cfg.entityLabel}`,
        message: `Disable "${facility.name}"? It will be excluded from scheduling and dispatch but remain in the database.`,
        confirmLabel: `Disable ${cfg.entityLabel}`,
        danger: true,
        onConfirm: () => {
          setConfirm(null);
          disableFacility.mutate(facility, {
            onSuccess: () => {
              toast.success(`"${facility.name}" has been disabled.`);
              setSelectedFacility((current) =>
                current?.id === facility.id ? { ...current, status: "INACTIVE" } : current,
              );
            },
          });
        },
      });
    }

    if (action === "archive") {
      setConfirm({
        title: `Archive ${cfg.entityLabel}`,
        message: `Archive "${facility.name}"? This will permanently remove it from all users' view. Only SuperAdmin retains visibility.`,
        confirmLabel: `Archive ${cfg.entityLabel}`,
        danger: true,
        onConfirm: () => {
          setConfirm(null);
          archiveFacility.mutate(facility.id, {
            onSuccess: () => toast.success(`"${facility.name}" has been archived.`),
          });
        },
      });
    }
  }

  const TABS: TabId[] = ["bonded", "truck_parks", "fish_van"];
  const tabCounts: Record<TabId, number> = {
    bonded: summary?.bonded_terminals ?? 0,
    truck_parks: summary?.truck_parks ?? 0,
    fish_van: summary?.fish_van_parks ?? 0,
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
      {showCreateModal && (
        <FacilityFormModal
          defaultParkType={TAB_TO_PARK_TYPE[activeTab]}
          entityLabel={cfg.entityLabel}
          addLabel={cfg.addLabel}
          onClose={() => setShowCreateModal(false)}
          onSaved={() => setShowCreateModal(false)}
        />
      )}
      {editingFacility && (
        <EditFacilityInformationModal
          facility={editingFacility}
          tab={activeTab}
          onClose={() => setEditingFacility(null)}
          onSaved={(payload) => handleEditSaved(editingFacility.id, payload)}
        />
      )}
      {selectedFacility && (
        <FacilityDetailDrawer
          facility={selectedFacility}
          tab={activeTab}
          onClose={() => setSelectedFacility(null)}
          onRequestEnable={(f) => handleAction("enable", f)}
          onRequestDisable={(f) => handleAction("disable", f)}
          isStatusUpdating={enableFacility.isPending || disableFacility.isPending}
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

      {/* ─── Summary Panel ─── */}
      <SummaryPanel
        summary={summary}
        tab={activeTab}
        isLoading={summaryLoading}
        onAdd={() => setShowCreateModal(true)}
      />

      {/* ─── Module Header + Tabs ─── */}
      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-6 pb-0 pt-4">
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

          <div className="flex gap-0.5 overflow-x-auto">
            {TABS.map((tab) => {
              const tcfg = TAB_CONFIG[tab];
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => switchTab(tab)}
                  className={`flex items-center gap-2 whitespace-nowrap rounded-t-lg border-b-2 px-4 py-3 text-xs font-semibold transition-colors ${
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

        <div className="px-6 py-2.5">
          <p className="text-xs text-gray-500">{cfg.description}</p>
        </div>
      </div>

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
            {/* Location */}
            <div>
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                Location
              </label>
              <div className="relative">
                <select
                  value={locationFilter}
                  onChange={(e) => { setLocationFilter(e.target.value); setPage(1); }}
                  className="appearance-none rounded-lg border border-gray-200 bg-white py-1.5 pl-3 pr-8 text-xs text-gray-700 outline-none focus:border-emerald-300"
                >
                  {LOCATIONS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute bottom-2.5 right-2 h-3 w-3 text-gray-400" />
              </div>
            </div>

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
          Showing <span className="font-semibold text-gray-800">{totalCount}</span> {cfg.entityLabel.toLowerCase()}{totalCount !== 1 ? "s" : ""}
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
                  Facility Name
                </th>
                {col("facility_id") && (
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                    {cfg.idLabel}
                  </th>
                )}
                {col("facility_type") && (
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                    Facility Type
                  </th>
                )}
                {col("address") && (
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                    Address
                  </th>
                )}
                {col("hourly_capacity") && (
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                    Hourly Capacity
                  </th>
                )}
                {col("approved_capacity") && (
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                    {cfg.capacityLabel}
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
                      <p className="text-sm font-medium text-gray-400">Loading {cfg.label.toLowerCase()}...</p>
                    </div>
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={12} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <AlertCircle className="h-8 w-8 text-red-300" />
                      <p className="text-sm font-medium text-gray-400">Failed to load {cfg.label.toLowerCase()}</p>
                    </div>
                  </td>
                </tr>
              ) : facilities.length === 0 ? (
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
                facilities.map((f, idx) => (
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
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-gray-900">{f.name}</p>
                          {f.location && (
                            <p className="text-[10px] text-gray-400">{formatLocation(f.location)}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Facility ID */}
                    {col("facility_id") && (
                      <td className="px-4 py-3">
                        <span className="rounded-md bg-gray-100 px-2 py-0.5 font-mono text-[11px] text-gray-600">
                          {f.facility_code}
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
                          <span className="text-xs font-semibold text-gray-800">{f.approved_truck_exits_per_hour ?? 0}</span>
                          <span className="text-[10px] text-gray-400">/hr</span>
                        </div>
                      </td>
                    )}

                    {/* Approved Capacity */}
                    {col("approved_capacity") && (
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Package className="h-3 w-3 text-gray-400" />
                          <span className="text-xs font-semibold text-gray-800">{getApprovedCapacity(f, activeTab)}</span>
                          <span className="text-[10px] text-gray-400">{cfg.capacityUnit}</span>
                        </div>
                      </td>
                    )}

                    {/* Status */}
                    {col("status") && (
                      <td className="px-4 py-3">
                        <StatusBadge status={getFacilityDisplayStatus(f)} />
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
            <span className="font-medium text-gray-700">{facilities.length > 0 ? (page - 1) * PAGE_SIZE + 1 : 0}</span>–
            <span className="font-medium text-gray-700">{(page - 1) * PAGE_SIZE + facilities.length}</span> of{" "}
            <span className="font-medium text-gray-700">{totalCount}</span> {cfg.label.toLowerCase()}
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

   
    </div>
  );
}

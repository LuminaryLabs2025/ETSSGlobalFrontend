"use client";

import { useState } from "react";
import {
  ParkingCircle,
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
  Edit2,
  MapPin,
  Timer,
  FileText,
  AlertCircle,
  Plus,
  Layers,
  LayoutGrid,
  Loader2,
  User,
  Mail,
  CalendarClock,
  Tags,
  Building2,
  Landmark,
  Wifi,
  WifiOff,
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
  pregatesChartData,
  eptsChartData,
} from "@/lib/transit-parks-mock-data";
import type {
  TransitPark,
  TransitParkDetail,
  TransitParkDisplayStatus,
  TransitParkType,
  TransitParkBarrierStatus,
  TransitParksSummaryResponse,
  TransitParkWritePayload,
} from "@/types/transit-parks.types";
import {
  getTransitParkDisplayStatus,
  resolveTransitParkBarrierNumber,
  resolveTransitParkBarrierOperationalStatus,
} from "@/types/transit-parks.types";
import { useTransitParks } from "@/hooks/transit-parks/useTransitParks";
import { useTransitPark } from "@/hooks/transit-parks/useTransitPark";
import { useTransitParksSummary } from "@/hooks/transit-parks/useTransitParksSummary";
import {
  useEnableTransitPark,
  useDisableTransitPark,
  useArchiveTransitPark,
} from "@/hooks/transit-parks/useTransitParkActions";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { DisplayOptionsMenu } from "@/components/dashboard/DisplayOptionsMenu";
import { TableActionsDropdown } from "@/components/dashboard/TableActionsDropdown";
import { TransitParkFormModal } from "@/components/dashboard/TransitParkFormModal";

// ─── Constants ───
const PAGE_SIZE = 10;

const STATUSES = [
  { value: "All",      label: "All Statuses" },
  { value: "ACTIVE",   label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "ARCHIVED", label: "Archived" },
];

const LOCATIONS = [
  { value: "All",    label: "All Locations" },
  { value: "APAPA",  label: "Apapa" },
  { value: "TINCAN", label: "Tincan" },
];

type TabId = "pregates" | "epts";

const TAB_TO_TYPE: Record<TabId, TransitParkType> = {
  pregates: "PREGATE",
  epts: "EPT",
};

// ─── Display Options ───
const TOGGLEABLE_COLUMNS = [
  { key: "code",            label: "ID Code" },
  { key: "address",         label: "Address" },
  { key: "hourly_capacity", label: "Hourly TAT Capacity" },
  { key: "approved_bays",   label: "Approved Bays" },
  { key: "status",          label: "Operational Status" },
  { key: "created_at",      label: "Created At" },
  { key: "updated_at",      label: "Last Updated" },
] as const;

type ColumnKey = typeof TOGGLEABLE_COLUMNS[number]["key"];
const ALL_COLUMN_KEYS = TOGGLEABLE_COLUMNS.map((c) => c.key);

// ─── Tab Config ───
const TAB_CONFIG: Record<TabId, {
  label: string;
  entityLabel: string;
  codeLabel: string;
  addLabel: string;
  emptyLabel: string;
  Icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  accentBg: string;
}> = {
  pregates: {
    label: "Pregates",
    entityLabel: "Pregate",
    codeLabel: "Pregate ID Code",
    addLabel: "Add New Pregate",
    emptyLabel: "No pregates match your filters",
    Icon: ParkingCircle,
    iconColor: "text-blue-600",
    iconBg: "bg-blue-50",
    accentBg: "bg-blue-100",
  },
  epts: {
    label: "EPTs",
    entityLabel: "EPT",
    codeLabel: "EPT ID Code",
    addLabel: "Add New EPT",
    emptyLabel: "No EPTs match your filters",
    Icon: Truck,
    iconColor: "text-violet-600",
    iconBg: "bg-violet-50",
    accentBg: "bg-violet-100",
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

function BarrierStatusBadge({ status }: { status: TransitParkBarrierStatus }) {
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
function StatusBadge({ status }: { status: TransitParkDisplayStatus }) {
  const map: Record<TransitParkDisplayStatus, { cls: string; Icon: React.ElementType; label: string }> = {
    ACTIVE:   { cls: "bg-emerald-50 text-emerald-700 border-emerald-200", Icon: CheckCircle2, label: "Active" },
    INACTIVE: { cls: "bg-red-50 text-red-700 border-red-200",             Icon: XCircle,     label: "Inactive" },
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

// ─── Transit Park Detail Drawer ───
function TransitParkDetailDrawer({
  park: fallbackPark,
  tab,
  onClose,
  onRequestEnable,
  onRequestDisable,
  isStatusUpdating,
}: {
  park: TransitPark;
  tab: TabId;
  onClose: () => void;
  onRequestEnable: (park: TransitPark) => void;
  onRequestDisable: (park: TransitPark) => void;
  isStatusUpdating?: boolean;
}) {
  const cfg = TAB_CONFIG[tab];
  const { data: detail, isLoading, isError } = useTransitPark(fallbackPark.id);
  const park: TransitParkDetail = detail ?? fallbackPark;
  const displayStatus = getTransitParkDisplayStatus(park);
  const primaryAccount = park.primary_account_user;
  const operationalHours = park.operational_hours;
  const linkedCategories = park.linked_booking_categories ?? [];
  const linkedFacilities = park.linked_facilities ?? [];
  const linkedTerminalOperators = park.linked_terminal_operators ?? [];
  const entryBarriers = park.entry_barriers ?? [];
  const exitBarriers = park.exit_barriers ?? [];
  const movementTimes = park.movement_times ?? [];
  const subAccounts = park.sub_accounts ?? [];
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
                <h2 className="text-sm font-bold text-white">{park.name}</h2>
                <p className="font-mono text-[11px] text-emerald-400">{park.transit_park_code}</p>
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
              Loading transit park details...
            </div>
          )}
          {isError && (
            <div className="flex items-center gap-2 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-xs text-amber-700">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              Some detail fields may be unavailable. Showing cached transit park data.
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={displayStatus} />
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${cfg.iconBg} ${cfg.iconColor}`}>
              <cfg.Icon className="h-3 w-3" />
              {cfg.entityLabel}
            </span>
            {park.location && (
              <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-700">
                {park.location === "APAPA" ? "Apapa Zone" : park.location === "TINCAN" ? "Tincan Zone" : park.location}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <div className="mb-2 flex items-center gap-2">
                <div className="rounded-lg bg-blue-100 p-1.5">
                  <Truck className="h-3.5 w-3.5 text-blue-600" />
                </div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Trucks Released / Hour</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">{park.approved_truck_exits_per_hour.toLocaleString()}</p>
              <p className="mt-0.5 text-[11px] text-gray-400">trucks / hr</p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <div className="mb-2 flex items-center gap-2">
                <div className="rounded-lg bg-emerald-100 p-1.5">
                  <LayoutGrid className="h-3.5 w-3.5 text-emerald-600" />
                </div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Approved Bays</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">{park.bay_capacity.toLocaleString()}</p>
              <p className="mt-0.5 text-[11px] text-gray-400">bay slots</p>
            </div>
          </div>

          <DrawerSection title="Transit Park Operational Hours">
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

          <DrawerSection title="Linked Facilities">
            {linkedFacilities.length > 0 ? (
              <ul className="space-y-2">
                {linkedFacilities.map((facility) => (
                  <li key={facility} className="flex items-center gap-2 text-sm text-gray-800">
                    <Building2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                    {facility}
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
                    <span className="font-mono text-xs font-medium text-gray-800">
                      {resolveTransitParkBarrierNumber(barrier)}
                    </span>
                    <BarrierStatusBadge status={resolveTransitParkBarrierOperationalStatus(barrier)} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-4 py-3"><EmptySectionNote /></div>
            )}
          </DrawerSection>

          <DrawerSection title="Exit Barrier ID Number(s) & Status" noPadding>
            {exitBarriers.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {exitBarriers.map((barrier) => (
                  <div key={barrier.id} className="flex items-center justify-between gap-4 px-4 py-3">
                    <span className="font-mono text-xs font-medium text-gray-800">
                      {resolveTransitParkBarrierNumber(barrier)}
                    </span>
                    <BarrierStatusBadge status={resolveTransitParkBarrierOperationalStatus(barrier)} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-4 py-3"><EmptySectionNote /></div>
            )}
          </DrawerSection>

          <DrawerSection title="Movement Times" noPadding>
            {movementTimes.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/60 text-[10px] uppercase tracking-wider text-gray-500">
                      <th className="px-4 py-2.5 text-left font-semibold">Booking Category</th>
                      <th className="px-4 py-2.5 text-left font-semibold">Terminal</th>
                      <th className="px-4 py-2.5 text-left font-semibold">Authorised Timeframe</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {movementTimes.map((row, index) => (
                      <tr key={`${row.booking_category}-${row.terminal ?? index}`}>
                        <td className="px-4 py-3 font-medium text-gray-800">{formatCategoryLabel(row.booking_category)}</td>
                        <td className="px-4 py-3 text-gray-600">{displayOrDash(row.terminal)}</td>
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

          <DrawerSection title="Sub-Accounts Linked to Transit Park" noPadding>
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

          <DrawerSection title={`${cfg.entityLabel} Details`} noPadding>
            <div className="divide-y divide-gray-50">
              <DetailRow label="Transit Park ID" value={park.id} mono />
              <DetailRow label="Name" value={park.name} />
              <DetailRow label={cfg.codeLabel} value={park.transit_park_code} mono />
              <DetailRow label="Type" value={cfg.entityLabel} />
              <DetailRow label="Location" value={park.location} />
              <DetailRow label="Address" value={park.address} />
              <DetailRow label="Truck Capacity" value={park.approved_truck_capacity.toLocaleString()} />
            </div>
          </DrawerSection>

          <DrawerSection title="Timestamps" noPadding>
            <div className="divide-y divide-gray-50">
              <div className="flex items-center justify-between px-4 py-3">
                <p className="text-xs text-gray-500">Created At</p>
                <p className="flex items-center gap-1 text-xs font-medium text-gray-800">
                  <Clock className="h-3 w-3 text-gray-400" />
                  {formatTimestamp(park.created_at)}
                </p>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <p className="text-xs text-gray-500">Last Updated</p>
                <p className="flex items-center gap-1 text-xs font-medium text-gray-800">
                  <Clock className="h-3 w-3 text-gray-400" />
                  {formatTimestamp(park.updated_at)}
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
                  onClick={() => onRequestEnable(park)}
                  disabled={isStatusUpdating}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isStatusUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Power className="h-4 w-4" />}
                  Activate {cfg.entityLabel}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onRequestDisable(park)}
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

// ─── Actions Menu ───
function ActionsMenu({
  park,
  tab,
  onAction,
}: {
  park: TransitPark;
  tab: TabId;
  onAction: (action: string, park: TransitPark) => void;
}) {
  const cfg = TAB_CONFIG[tab];
  const displayStatus = getTransitParkDisplayStatus(park);

  const actions: { label: string; icon: React.ElementType; action: string; danger?: boolean }[] = [
    { label: `View ${cfg.entityLabel} Details`,          icon: Eye,     action: "view" },
    { label: "Edit Transit Park Information",          icon: Edit2,   action: "edit" },
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
              onClick={() => { close(); onAction(a.action, park); }}
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
  summary?: TransitParksSummaryResponse;
  tab: TabId;
  isLoading?: boolean;
  onAdd: () => void;
}) {
  const cfg = TAB_CONFIG[tab];
  const tabTotal = tab === "pregates"
    ? summary?.pregates ?? 0
    : summary?.export_processing_terminals ?? 0;

  const cards = [
    { label: `Total ${cfg.label}`,         value: tabTotal,                                              Icon: cfg.Icon,      color: "text-blue-400",    bg: "bg-blue-400/10" },
    { label: "Enabled",                    value: summary?.enabled ?? 0,                                 Icon: CheckCircle2,  color: "text-emerald-400", bg: "bg-emerald-400/10" },
    { label: "Disabled",                   value: summary?.disabled ?? 0,                                Icon: XCircle,       color: "text-red-400",     bg: "bg-red-400/10" },
    { label: "Avg Hourly Handling",        value: `${summary?.avg_truck_exits_per_hour ?? 0}/hr`,        Icon: Timer,         color: "text-violet-400",  bg: "bg-violet-400/10" },
    { label: "Total Bay Capacity",         value: `${summary?.total_bay_capacity ?? 0} bays`,            Icon: LayoutGrid,    color: "text-amber-400",   bg: "bg-amber-400/10" },
  ];

  return (
    <div className="rounded-2xl bg-[#0f1e2e] p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">
            {tab === "pregates" ? "Pregate Management" : "EPT Management"}
          </h2>
          <p className="text-xs text-gray-400">
            {tab === "pregates"
              ? "All registered Transit Parks / Pregates on ETSS-Nigeria"
              : "All registered Export Processing Terminals (EPTs) on ETSS-Nigeria"}
          </p>
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

// ─── Charts (always visible regardless of active tab) ───
function TransitCharts() {
  const tooltipStyle = { fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" };

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
      {/* Pregates — Bay Capacity vs Live Bookings */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="mb-4 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
            <ParkingCircle className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Pregates — Bay Capacity vs Live Bookings</h3>
            <p className="text-[11px] text-gray-500">Approved Bay Capacity vs Active Booking Count — By Pregate</p>
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={pregatesChartData} barCategoryGap="22%" barGap={3}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 9 }} interval={0} />
              <YAxis tick={{ fontSize: 10 }} width={36} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="approved_capacity"  name="Approved Bay Cap."  fill="#3b82f6" radius={[3, 3, 0, 0]} />
              <Bar dataKey="live_booking_count" name="Live Bookings"       fill="#f59e0b" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-2 border-t border-gray-100 pt-2 text-[11px] text-gray-500">
          Bars at 0 represent inactive or archived pregates excluded from operations.
        </p>
      </div>

      {/* EPTs — Truck Handling Capacity vs Live Bookings */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="mb-4 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100">
            <Truck className="h-4 w-4 text-violet-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">EPTs — Truck Handling Capacity vs Live Bookings</h3>
            <p className="text-[11px] text-gray-500">Approved Truck Handling Capacity vs Active Booking Count — By EPT</p>
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={eptsChartData} barCategoryGap="22%" barGap={3}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 9 }} interval={0} />
              <YAxis tick={{ fontSize: 10 }} width={36} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="approved_capacity"  name="Approved Handling Cap." fill="#8b5cf6" radius={[3, 3, 0, 0]} />
              <Bar dataKey="live_booking_count" name="Live Bookings"            fill="#f59e0b" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-2 border-t border-gray-100 pt-2 text-[11px] text-gray-500">
          Bars at 0 represent inactive Export Processing Terminals excluded from scheduling and dispatch.
        </p>
      </div>
    </div>
  );
}

// ─── Main Page ───
export function TransitParksPage() {
  const [activeTab, setActiveTab] = useState<TabId>("pregates");
  const [page, setPage] = useState(1);
  const { search, setSearch, debouncedSearch, resetSearch } = useDebouncedSearch("", () => setPage(1));
  const [statusFilter, setStatusFilter] = useState("All");
  const [locationFilter, setLocationFilter] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<Set<ColumnKey>>(
    new Set(TOGGLEABLE_COLUMNS.map((c) => c.key))
  );

  const [selectedPark, setSelectedPark] = useState<TransitParkDetail | null>(null);
  const [editingPark, setEditingPark] = useState<TransitPark | null>(null);
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
    setLocationFilter("All");
  }

  const cfg = TAB_CONFIG[activeTab];

  const { data: summary, isLoading: summaryLoading } = useTransitParksSummary();
  const { data: parksData, isLoading, isError } = useTransitParks({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
    type: TAB_TO_TYPE[activeTab],
    status: statusFilter !== "All" ? statusFilter : undefined,
    location: locationFilter !== "All" ? locationFilter : undefined,
  });

  const enablePark = useEnableTransitPark();
  const disablePark = useDisableTransitPark();
  const archivePark = useArchiveTransitPark();

  const parks = Array.isArray(parksData?.data) ? parksData.data : [];
  const meta = parksData?.meta;
  const totalPages = meta?.total_pages ?? 1;
  const totalCount = meta?.total ?? 0;

  const hasActiveFilters = debouncedSearch || statusFilter !== "All" || locationFilter !== "All";
  const activeFilterCount = [statusFilter !== "All", locationFilter !== "All"].filter(Boolean).length;

  function clearFilters() {
    resetSearch();
    setStatusFilter("All");
    setLocationFilter("All");
    setPage(1);
  }

  const col = (key: ColumnKey) => visibleColumns.has(key);

  function handleEditSaved(parkId: string, payload: TransitParkWritePayload) {
    setSelectedPark((current) =>
      current?.id === parkId
        ? {
            ...current,
            name: payload.name,
            transit_park_type: payload.transit_park_type,
            location: payload.location,
            address: payload.address,
            approved_truck_capacity: payload.approved_truck_capacity,
            approved_truck_exits_per_hour: payload.approved_truck_exits_per_hour,
            bay_capacity: payload.bay_capacity,
            status: payload.status,
          }
        : current,
    );
  }

  function handleAction(action: string, park: TransitPark) {
    if (action === "view") {
      setSelectedPark(park);
      return;
    }

    if (action === "edit") {
      setEditingPark(park);
      return;
    }

    if (action === "enable") {
      setConfirm({
        title: `Enable ${cfg.entityLabel}`,
        message: `Enable "${park.name}"? It will become available for scheduling and dispatch operations.`,
        confirmLabel: `Enable ${cfg.entityLabel}`,
        onConfirm: () => {
          setConfirm(null);
          enablePark.mutate(park, {
            onSuccess: () => {
              toast.success(`"${park.name}" has been enabled.`);
              setSelectedPark((current) =>
                current?.id === park.id ? { ...current, status: "ACTIVE", archived_at: null } : current,
              );
            },
          });
        },
      });
    }

    if (action === "disable") {
      setConfirm({
        title: `Disable ${cfg.entityLabel}`,
        message: `Disable "${park.name}"? It will be excluded from scheduling and dispatch but remain visible in the database.`,
        confirmLabel: `Disable ${cfg.entityLabel}`,
        danger: true,
        onConfirm: () => {
          setConfirm(null);
          disablePark.mutate(park, {
            onSuccess: () => {
              toast.success(`"${park.name}" has been disabled.`);
              setSelectedPark((current) =>
                current?.id === park.id ? { ...current, status: "INACTIVE" } : current,
              );
            },
          });
        },
      });
    }

    if (action === "archive") {
      setConfirm({
        title: `Archive ${cfg.entityLabel}`,
        message: `Archive "${park.name}"? This will permanently remove it from all users' view. Only SuperAdmin retains visibility.`,
        confirmLabel: `Archive ${cfg.entityLabel}`,
        danger: true,
        onConfirm: () => {
          setConfirm(null);
          archivePark.mutate(park.id, {
            onSuccess: () => toast.success(`"${park.name}" has been archived.`),
          });
        },
      });
    }
  }

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
        <TransitParkFormModal
          mode="create"
          defaultParkType={TAB_TO_TYPE[activeTab]}
          entityLabel={cfg.entityLabel}
          addLabel={cfg.addLabel}
          onClose={() => setShowCreateModal(false)}
          onSaved={() => setShowCreateModal(false)}
        />
      )}
      {editingPark && (
        <TransitParkFormModal
          mode="edit"
          park={editingPark}
          defaultParkType={editingPark.transit_park_type}
          entityLabel={cfg.entityLabel}
          addLabel={cfg.addLabel}
          onClose={() => setEditingPark(null)}
          onSaved={(payload) => {
            if (payload) handleEditSaved(editingPark.id, payload);
            setEditingPark(null);
          }}
        />
      )}
      {selectedPark && (
        <TransitParkDetailDrawer
          park={selectedPark}
          tab={activeTab}
          onClose={() => setSelectedPark(null)}
          onRequestEnable={(p) => handleAction("enable", p)}
          onRequestDisable={(p) => handleAction("disable", p)}
          isStatusUpdating={enablePark.isPending || disablePark.isPending}
        />
      )}

      {/* ─── Breadcrumb ─── */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-500">
        <span>Infrastructure</span>
        <Chevron className="h-3 w-3" />
        <span>Transit Parks</span>
        <Chevron className="h-3 w-3" />
        <span className="font-semibold text-gray-800">{cfg.label}</span>
      </nav>

      {/* ─── Summary Panel (changes by tab) ─── */}
      <SummaryPanel
        summary={summary}
        tab={activeTab}
        isLoading={summaryLoading}
        onAdd={() => setShowCreateModal(true)}
      />

      {/* ─── Charts (always visible) ─── */}
      <TransitCharts />

      {/* ─── Module Header + Tabs ─── */}
      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-6 pb-0 pt-4">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0f1e2e]">
              <Layers className="h-4.5 w-4.5 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900">Transit Parks Module</h1>
              <p className="text-xs text-gray-500">Manage Pregates and Export Processing Terminals (EPTs)</p>
            </div>
          </div>

          <div className="flex gap-0.5 overflow-x-auto">
            {(["pregates", "epts"] as TabId[]).map((tab) => {
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
                    {tab === "pregates" ? summary?.pregates ?? 0 : summary?.export_processing_terminals ?? 0}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="px-6 py-2.5">
          <p className="text-xs text-gray-500">
            {activeTab === "pregates"
              ? "Showing all Transit Parks and Pregates — holding zones for trucks awaiting terminal entry."
              : "Showing all Export Processing Terminals (EPTs) — designated zones for processing and staging export cargo trucks."}
          </p>
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
              placeholder={`Search by ${cfg.entityLabel} name or status...`}
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
                  {LOCATIONS.map((l) => (
                    <option key={l.value} value={l.value}>{l.label}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute bottom-2.5 right-2 h-3 w-3 text-gray-400" />
              </div>
            </div>

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
                  {cfg.entityLabel} Name
                </th>
                {col("code") && (
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                    {cfg.codeLabel}
                  </th>
                )}
                {col("address") && (
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                    Address
                  </th>
                )}
                {col("hourly_capacity") && (
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                    Hourly TAT
                  </th>
                )}
                {col("approved_bays") && (
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                    Approved Bays
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
                  <td colSpan={10} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
                      <p className="text-sm font-medium text-gray-400">Loading {cfg.label.toLowerCase()}...</p>
                    </div>
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <AlertCircle className="h-8 w-8 text-red-300" />
                      <p className="text-sm font-medium text-gray-400">Failed to load {cfg.label.toLowerCase()}</p>
                    </div>
                  </td>
                </tr>
              ) : parks.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center">
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
                parks.map((park, idx) => (
                  <tr key={park.id} className="transition-colors hover:bg-gray-50/80">

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
                          <p className="text-xs font-semibold text-gray-900">{park.name}</p>
                          {park.location && (
                            <p className="text-[10px] text-gray-400">
                              {park.location === "APAPA" ? "Apapa Zone" : park.location === "TINCAN" ? "Tincan Zone" : park.location}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Code */}
                    {col("code") && (
                      <td className="px-4 py-3">
                        <span className="rounded-md bg-gray-100 px-2 py-0.5 font-mono text-[11px] text-gray-600">
                          {park.transit_park_code}
                        </span>
                      </td>
                    )}

                    {/* Address */}
                    {col("address") && (
                      <td className="px-4 py-3">
                        <div className="flex items-start gap-1">
                          <MapPin className="mt-0.5 h-3 w-3 shrink-0 text-gray-400" />
                          <p className="max-w-44 text-xs leading-tight text-gray-600">{park.address}</p>
                        </div>
                      </td>
                    )}

                    {/* Hourly TAT */}
                    {col("hourly_capacity") && (
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Timer className="h-3 w-3 text-gray-400" />
                          <span className="text-xs font-semibold text-gray-800">{park.approved_truck_exits_per_hour}</span>
                          <span className="text-[10px] text-gray-400">/hr</span>
                        </div>
                      </td>
                    )}

                    {/* Bays */}
                    {col("approved_bays") && (
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <LayoutGrid className="h-3 w-3 text-gray-400" />
                          <span className="text-xs font-semibold text-gray-800">{park.bay_capacity}</span>
                          <span className="text-[10px] text-gray-400">bays</span>
                        </div>
                      </td>
                    )}

                    {/* Status */}
                    {col("status") && (
                      <td className="px-4 py-3">
                        <StatusBadge status={getTransitParkDisplayStatus(park)} />
                      </td>
                    )}

                    {/* Created */}
                    {col("created_at") && (
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1 text-[11px] text-gray-500">
                          <Clock className="h-3 w-3" />
                          {formatTimestamp(park.created_at)}
                        </span>
                      </td>
                    )}

                    {/* Updated */}
                    {col("updated_at") && (
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1 text-[11px] text-gray-500">
                          <Clock className="h-3 w-3" />
                          {formatTimestamp(park.updated_at)}
                        </span>
                      </td>
                    )}

                    {/* Actions */}
                    <td className="px-4 py-3 text-center">
                      <ActionsMenu park={park} tab={activeTab} onAction={handleAction} />
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
            <span className="font-medium text-gray-700">{parks.length > 0 ? (page - 1) * PAGE_SIZE + 1 : 0}</span>–
            <span className="font-medium text-gray-700">{(page - 1) * PAGE_SIZE + parks.length}</span> of{" "}
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

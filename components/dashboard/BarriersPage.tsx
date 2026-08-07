"use client";

import { useEffect, useState } from "react";
import {
  Warehouse,
  Truck,
  Fish,
  Search,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronRight as Chevron,
  X,
  Edit2,
  Eye,
  Ban,
  Loader2,
  DoorOpen,
  Wifi,
  WifiOff,
  CheckCircle2,
  XCircle,
  BarChart3,
  Smartphone,
  Download,
  FileText,
  Landmark,
  ParkingCircle,
} from "lucide-react";
import { toast } from "sonner";
import type { FacilityParkType } from "@/types/facilities.types";
import type {
  BarrierDetail,
  BarrierOperationalStatus,
  BarrierPayload,
  BarrierRecord,
  BarrierRole,
  BarrierSiteType,
  BarriersSummaryResponse,
} from "@/types/barriers.types";
import { useBarriers } from "@/hooks/barriers/useBarriers";
import { useBarriersSummary } from "@/hooks/barriers/useBarriersSummary";
import { useBarrier } from "@/hooks/barriers/useBarrier";
import {
  useDisableBarrier,
  useUpdateBarrier,
} from "@/hooks/barriers/useBarrierActions";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { DisplayOptionsMenu } from "@/components/dashboard/DisplayOptionsMenu";
import { TableActionsDropdown } from "@/components/dashboard/TableActionsDropdown";

const PAGE_SIZE = 20;

type SiteTabId = "facilities" | "transit_parks" | "terminals";
type FacilityParkTabId = "bonded" | "truck_parks" | "fish_van";

const FACILITY_PARK_TAB_TO_TYPE: Record<FacilityParkTabId, FacilityParkType> = {
  bonded: "BONDED_TERMINAL",
  truck_parks: "TRUCK_PARK",
  fish_van: "FISH_VAN_PARK",
};

function getSiteTabFilters(
  siteTab: SiteTabId,
  facilityParkTab: FacilityParkTabId,
): { site_type: BarrierSiteType; park_type?: FacilityParkType } {
  if (siteTab === "facilities") {
    return { site_type: "FACILITY", park_type: FACILITY_PARK_TAB_TO_TYPE[facilityParkTab] };
  }
  if (siteTab === "transit_parks") {
    return { site_type: "TRANSIT_PARK" };
  }
  return { site_type: "TERMINAL" };
}

const SITE_TAB_CONFIG: Record<
  SiteTabId,
  {
    label: string;
    entityLabel: string;
    description: string;
    integratedLabel: string;
    searchPlaceholder: string;
    linkedSiteLabel: string;
    Icon: React.ElementType;
  }
> = {
  facilities: {
    label: "Facilities",
    entityLabel: "Facility",
    description: "Barriers linked to bonded terminals, truck parks, and fish-van parks.",
    integratedLabel: "Integrated barriers assigned to facilities",
    searchPlaceholder: "Search by facility name or barrier ID number...",
    linkedSiteLabel: "Linked Facility",
    Icon: Warehouse,
  },
  transit_parks: {
    label: "Transit Parks",
    entityLabel: "Transit Park",
    description: "Barriers linked to pre-gates and export processing terminals.",
    integratedLabel: "Integrated barriers assigned to transit parks",
    searchPlaceholder: "Search by transit park name or barrier ID number...",
    linkedSiteLabel: "Linked Transit Park",
    Icon: ParkingCircle,
  },
  terminals: {
    label: "Terminals",
    entityLabel: "Terminal",
    description: "Barriers linked to port and non-port terminals.",
    integratedLabel: "Integrated barriers assigned to terminals",
    searchPlaceholder: "Search by terminal name or barrier ID number...",
    linkedSiteLabel: "Linked Terminal",
    Icon: Landmark,
  },
};

const FACILITY_PARK_TAB_CONFIG: Record<
  FacilityParkTabId,
  { label: string; Icon: React.ElementType }
> = {
  bonded: { label: "Bonded Terminals", Icon: Warehouse },
  truck_parks: { label: "Truck Parks", Icon: Truck },
  fish_van: { label: "Fish-Van Parks", Icon: Fish },
};

const OPERATIONAL_STATUS_FILTERS = ["All", "ONLINE", "OFFLINE"] as const;
const BARRIER_TYPE_FILTERS = ["All", "ENTRY", "EXIT"] as const;
const ADMIN_STATUS_FILTERS = ["All", "ACTIVE", "INACTIVE"] as const;

const TOGGLEABLE_COLUMNS = [
  { key: "service_provider", label: "Service Provider" },
  { key: "barrier_type", label: "Barrier Type" },
  { key: "barrier_status", label: "Barrier Status" },
  { key: "admin_status", label: "Admin Status" },
  { key: "linked_facility", label: "Linked Facility" },
  { key: "linked_handheld", label: "Linked Handheld" },
] as const;

type ColumnKey = (typeof TOGGLEABLE_COLUMNS)[number]["key"];
const ALL_COLUMN_KEYS = TOGGLEABLE_COLUMNS.map((c) => c.key);

function formatLabel(value: string | null | undefined) {
  if (!value) return "—";
  if (value === "All") return "All";
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

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

function resolveLinkedSite(item: BarrierRecord) {
  return item.linked_facility?.name ?? item.linked_site?.site?.name ?? "—";
}

function resolveLinkedHandheld(item: BarrierRecord) {
  return item.linked_handheld?.name ?? item.linked_handhelds?.[0]?.name ?? "—";
}

function OperationalStatusBadge({ status }: { status: BarrierOperationalStatus }) {
  const isOnline = status === "ONLINE";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
        isOnline ? "bg-emerald-50 text-emerald-700" : "font-semibold text-red-600"
      }`}
    >
      {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
      {isOnline ? "Online" : "Offline"}
    </span>
  );
}

function AdminStatusBadge({ status }: { status: string }) {
  const active = status === "ACTIVE";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${
        active
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-gray-200 bg-gray-50 text-gray-500"
      }`}
    >
      {active ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
      {active ? "Active" : "Disabled"}
    </span>
  );
}

function BarrierTypeBadge({ type }: { type: BarrierRole | null }) {
  if (!type) return <span className="text-xs text-gray-400">—</span>;
  const isEntry = type === "ENTRY";
  return (
    <span
      className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${
        isEntry ? "bg-blue-50 text-blue-700" : "bg-violet-50 text-violet-700"
      }`}
    >
      {formatLabel(type)}
    </span>
  );
}

function ConfirmDialog({
  title,
  message,
  confirmLabel,
  danger,
  isPending,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  danger?: boolean;
  isPending?: boolean;
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
            disabled={isPending}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50 ${
              danger ? "bg-red-600 hover:bg-red-700" : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </>
  );
}

function SummaryPanel({
  summary,
  siteTab,
  facilityParkTab,
  isLoading,
}: {
  summary?: BarriersSummaryResponse;
  siteTab: SiteTabId;
  facilityParkTab?: FacilityParkTabId;
  isLoading?: boolean;
}) {
  const cfg = SITE_TAB_CONFIG[siteTab];
  const facilityLabel =
    siteTab === "facilities" && facilityParkTab
      ? FACILITY_PARK_TAB_CONFIG[facilityParkTab].label.replace(/s$/, "")
      : cfg.entityLabel;

  const cards = [
    {
      label: "Total Active vs Inactive Barriers (All)",
      active: summary?.all.active ?? 0,
      total: summary?.all.total ?? 0,
    },
    {
      label: "Total Active vs Inactive Barrier (Entry)",
      active: summary?.entry.active ?? 0,
      total: summary?.entry.total ?? 0,
    },
    {
      label: "Total Active vs Inactive Barrier (Exit)",
      active: summary?.exit.active ?? 0,
      total: summary?.exit.total ?? 0,
    },
  ];

  return (
    <div className="rounded-2xl bg-[#0f1e2e] p-6">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-white">{facilityLabel} Barrier Management</h2>
        <p className="text-xs text-gray-400">{cfg.description}</p>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-400" />
          </div>
        ) : (
          cards.map((card) => (
            <div key={card.label} className="rounded-xl bg-white/5 p-4 transition-colors hover:bg-white/10">
              <p className="text-[11px] font-medium uppercase tracking-wider text-gray-500">{card.label}</p>
              <p className="mt-2 text-2xl font-bold text-white">
                <span className="text-emerald-400">{card.active}</span>
                <span className="mx-1 text-gray-500">/</span>
                <span className="text-blue-300">{card.total}</span>
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function BarrierFormModal({
  barrier,
  onClose,
  onSaved,
}: {
  barrier: BarrierRecord;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { data: detail, isLoading: detailLoading } = useBarrier(barrier.id);
  const updateBarrier = useUpdateBarrier();

  const [serviceProviderName, setServiceProviderName] = useState("");
  const [barrierIdNumber, setBarrierIdNumber] = useState("");
  const [operationalStatus, setOperationalStatus] = useState<BarrierOperationalStatus>("OFFLINE");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (initialized) return;
    if (detailLoading && !detail) return;

    const source = detail ?? barrier;
    if (!source) return;

    setServiceProviderName(source.service_provider_name ?? "");
    setBarrierIdNumber(source.barrier_id_number ?? "");
    setOperationalStatus(source.operational_status ?? "OFFLINE");
    setInitialized(true);
  }, [detail, detailLoading, barrier, initialized]);

  function validate() {
    const nextErrors: Record<string, string> = {};
    if (!serviceProviderName.trim()) nextErrors.service_provider_name = "Service provider name is required.";
    if (!barrierIdNumber.trim()) nextErrors.barrier_id_number = "Barrier ID number is required.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function buildPayload(): BarrierPayload {
    return {
      service_provider_name: serviceProviderName.trim(),
      barrier_id_number: barrierIdNumber.trim(),
      operational_status: operationalStatus,
    };
  }

  function handleSave() {
    if (!validate()) return;
    const payload = buildPayload();

    updateBarrier.mutate(
      { id: barrier.id, payload },
      {
        onSuccess: () => {
          toast.success("Barrier updated successfully.");
          onSaved();
          onClose();
        },
      },
    );
  }

  const isPending = updateBarrier.isPending;

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/40" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-[70] flex max-h-[90vh] w-full max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col rounded-2xl border border-gray-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0f1e2e]">
              <DoorOpen className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">Edit Barrier Information</h2>
              <p className="text-xs text-gray-500">{displayOrDash(barrier.barrier_id_number)}</p>
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

        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
          {detailLoading && !initialized && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-500" />
              Loading barrier...
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-700">
              Service Provider Name <span className="text-red-500">*</span>
            </label>
            <input
              value={serviceProviderName}
              onChange={(e) => setServiceProviderName(e.target.value)}
              placeholder="e.g. Access Control Co."
              className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 ${
                errors.service_provider_name ? "border-red-300" : "border-gray-200"
              }`}
            />
            {errors.service_provider_name && (
              <p className="mt-1 text-xs text-red-500">{errors.service_provider_name}</p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-700">
              Barrier ID Number <span className="text-red-500">*</span>
            </label>
            <input
              value={barrierIdNumber}
              onChange={(e) => setBarrierIdNumber(e.target.value)}
              placeholder="e.g. BR-049"
              className={`w-full rounded-lg border px-3 py-2.5 font-mono text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 ${
                errors.barrier_id_number ? "border-red-300" : "border-gray-200"
              }`}
            />
            {errors.barrier_id_number && (
              <p className="mt-1 text-xs text-red-500">{errors.barrier_id_number}</p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-700">
              Operational Status
            </label>
            <select
              value={operationalStatus}
              onChange={(e) => setOperationalStatus(e.target.value as BarrierOperationalStatus)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            >
              <option value="ONLINE">Online</option>
              <option value="OFFLINE">Offline</option>
            </select>
            <p className="mt-1 text-[11px] text-gray-400">
              Partner sync is not live yet — update manually when needed.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-6 py-4">
          <button
            onClick={onClose}
            disabled={isPending}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isPending}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Changes
          </button>
        </div>
      </div>
    </>
  );
}

function BarrierDetailDrawer({
  barrierId,
  onClose,
  onEdit,
  onDisable,
}: {
  barrierId: string;
  onClose: () => void;
  onEdit: (barrier: BarrierDetail) => void;
  onDisable: (barrier: BarrierDetail) => void;
}) {
  const { data: barrier, isLoading, isError } = useBarrier(barrierId);

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-gray-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0f1e2e]">
              <DoorOpen className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">Barrier Details</h2>
              <p className="font-mono text-xs text-gray-500">{barrier?.barrier_id_number ?? "..."}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {isLoading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
            </div>
          )}
          {isError && (
            <p className="py-16 text-center text-sm text-red-500">Failed to load barrier details.</p>
          )}
          {barrier && (
            <div className="space-y-4">
              <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                  Barrier Information
                </p>
                <div className="mt-3 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-xs text-gray-500">Barrier ID Number</span>
                    <span className="font-mono text-xs font-medium text-gray-900">
                      {barrier.barrier_id_number}
                    </span>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-xs text-gray-500">Service Provider</span>
                    <span className="text-right text-xs font-medium text-gray-900">
                      {barrier.service_provider_name}
                    </span>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-xs text-gray-500">Operational Status</span>
                    <OperationalStatusBadge status={barrier.operational_status} />
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-xs text-gray-500">Admin Status</span>
                    <AdminStatusBadge status={barrier.status} />
                  </div>
                  {barrier.barrier_type && (
                    <div className="flex items-start justify-between gap-4">
                      <span className="text-xs text-gray-500">Role on Site</span>
                      <BarrierTypeBadge type={barrier.barrier_type} />
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-gray-100 bg-white">
                <div className="border-b border-gray-100 px-4 py-2.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                    Linked Sites
                  </p>
                </div>
                <div className="divide-y divide-gray-100">
                  {(barrier.linked_sites?.length ?? 0) === 0 ? (
                    <p className="px-4 py-3 text-xs text-gray-400">
                      Not linked to any site yet. Assign when editing a facility, transit park, or terminal.
                    </p>
                  ) : (
                    barrier.linked_sites.map((link) => (
                      <div key={link.link_id} className="flex items-center justify-between gap-3 px-4 py-3">
                        <div className="min-w-0">
                          <p className="truncate text-xs font-medium text-gray-900">
                            {link.site?.name ?? link.site_id}
                          </p>
                          <p className="text-[11px] text-gray-500">
                            {formatLabel(link.site_type)} · {formatLabel(link.barrier_role)}
                          </p>
                        </div>
                        <BarrierTypeBadge type={link.barrier_role} />
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-gray-100 bg-white">
                <div className="border-b border-gray-100 px-4 py-2.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                    Linked Handhelds
                  </p>
                </div>
                <div className="divide-y divide-gray-100">
                  {(barrier.linked_handhelds?.length ?? 0) === 0 && !barrier.linked_handheld ? (
                    <p className="px-4 py-3 text-xs text-gray-400">No handheld devices linked.</p>
                  ) : (
                    (barrier.linked_handhelds?.length
                      ? barrier.linked_handhelds
                      : barrier.linked_handheld
                        ? [barrier.linked_handheld]
                        : []
                    ).map((handheld) => (
                      <div key={handheld.id} className="flex items-center justify-between gap-3 px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Smartphone className="h-3.5 w-3.5 text-gray-400" />
                          <span className="text-xs font-medium text-gray-900">{handheld.name}</span>
                        </div>
                        <AdminStatusBadge status={handheld.status} />
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-gray-100 bg-white">
                <div className="border-b border-gray-100 px-4 py-2.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Timestamps</p>
                </div>
                <div className="space-y-0 divide-y divide-gray-100">
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="text-xs text-gray-500">Created At</span>
                    <span className="text-xs text-gray-800">{formatTimestamp(barrier.created_at)}</span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="text-xs text-gray-500">Last Updated</span>
                    <span className="text-xs text-gray-800">{formatTimestamp(barrier.updated_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {barrier && (
          <div className="flex items-center gap-2 border-t border-gray-100 px-5 py-4">
            <button
              onClick={() => onEdit(barrier)}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Edit2 className="h-4 w-4" />
              Edit
            </button>
            {barrier.status === "ACTIVE" && (
              <button
                onClick={() => onDisable(barrier)}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
              >
                <Ban className="h-4 w-4" />
                Disable
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export function BarriersPage() {
  const [activeSiteTab, setActiveSiteTab] = useState<SiteTabId>("facilities");
  const [activeFacilityTab, setActiveFacilityTab] = useState<FacilityParkTabId>("bonded");
  const [page, setPage] = useState(1);
  const { search, setSearch, debouncedSearch, resetSearch } = useDebouncedSearch("", () => setPage(1));
  const [operationalFilter, setOperationalFilter] = useState<(typeof OPERATIONAL_STATUS_FILTERS)[number]>("All");
  const [barrierTypeFilter, setBarrierTypeFilter] = useState<(typeof BARRIER_TYPE_FILTERS)[number]>("All");
  const [adminStatusFilter, setAdminStatusFilter] = useState<(typeof ADMIN_STATUS_FILTERS)[number]>("All");
  const [showFilters, setShowFilters] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<Set<ColumnKey>>(
    new Set(TOGGLEABLE_COLUMNS.map((c) => c.key)),
  );

  const [editTarget, setEditTarget] = useState<BarrierRecord | null>(null);
  const [viewTargetId, setViewTargetId] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{
    title: string;
    message: string;
    confirmLabel: string;
    danger?: boolean;
    onConfirm: () => void;
  } | null>(null);

  const disableBarrier = useDisableBarrier();
  const tabFilters = getSiteTabFilters(activeSiteTab, activeFacilityTab);
  const cfg = SITE_TAB_CONFIG[activeSiteTab];
  const col = (key: ColumnKey) => visibleColumns.has(key);

  const listParams = {
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
    ...tabFilters,
    operational_status: operationalFilter !== "All" ? operationalFilter : undefined,
    barrier_type: barrierTypeFilter !== "All" ? barrierTypeFilter : undefined,
    status: adminStatusFilter !== "All" ? adminStatusFilter : undefined,
  };

  const { data, isLoading, isError } = useBarriers(listParams);
  const { data: summary, isLoading: summaryLoading } = useBarriersSummary(tabFilters);

  const facilitiesSummary = useBarriersSummary({ site_type: "FACILITY" });
  const transitParksSummary = useBarriersSummary({ site_type: "TRANSIT_PARK" });
  const terminalsSummary = useBarriersSummary({ site_type: "TERMINAL" });

  const bondedSummary = useBarriersSummary({ site_type: "FACILITY", park_type: "BONDED_TERMINAL" });
  const truckSummary = useBarriersSummary({ site_type: "FACILITY", park_type: "TRUCK_PARK" });
  const fishSummary = useBarriersSummary({ site_type: "FACILITY", park_type: "FISH_VAN_PARK" });

  const items = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta?.total_pages ?? 1;
  const currentPage = meta?.page ?? page;

  const siteTabCounts: Record<SiteTabId, number> = {
    facilities: facilitiesSummary.data?.all.total ?? 0,
    transit_parks: transitParksSummary.data?.all.total ?? 0,
    terminals: terminalsSummary.data?.all.total ?? 0,
  };

  const facilityTabCounts: Record<FacilityParkTabId, number> = {
    bonded: bondedSummary.data?.all.total ?? 0,
    truck_parks: truckSummary.data?.all.total ?? 0,
    fish_van: fishSummary.data?.all.total ?? 0,
  };

  const hasActiveFilters =
    operationalFilter !== "All" || barrierTypeFilter !== "All" || adminStatusFilter !== "All";
  const activeFilterCount = [
    operationalFilter !== "All",
    barrierTypeFilter !== "All",
    adminStatusFilter !== "All",
  ].filter(Boolean).length;

  function resetFilters() {
    setPage(1);
    resetSearch();
    setOperationalFilter("All");
    setBarrierTypeFilter("All");
    setAdminStatusFilter("All");
    setShowFilters(false);
  }

  function switchSiteTab(tab: SiteTabId) {
    setActiveSiteTab(tab);
    resetFilters();
  }

  function switchFacilityTab(tab: FacilityParkTabId) {
    setActiveFacilityTab(tab);
    resetFilters();
  }

  function handleDisable(item: BarrierRecord) {
    disableBarrier.mutate(item.id, {
      onSuccess: () => {
        toast.success(`Barrier ${item.barrier_id_number} has been disabled.`);
        setViewTargetId(null);
      },
    });
  }

  function handleAction(action: string, item: BarrierRecord) {
    if (action === "view") {
      setViewTargetId(item.id);
      return;
    }
    if (action === "edit") {
      setEditTarget(item);
      return;
    }
    if (action === "disable") {
      setConfirm({
        title: "Disable Barrier",
        message: `Disable barrier "${item.barrier_id_number}"? It will no longer be available for new site assignments.`,
        confirmLabel: "Disable",
        danger: true,
        onConfirm: () => {
          setConfirm(null);
          handleDisable(item);
        },
      });
    }
  }

  const SITE_TABS: SiteTabId[] = ["facilities", "transit_parks", "terminals"];
  const FACILITY_TABS: FacilityParkTabId[] = ["bonded", "truck_parks", "fish_van"];

  return (
    <div className="space-y-5 p-6">
      {confirm && (
        <ConfirmDialog
          {...confirm}
          isPending={disableBarrier.isPending}
          onCancel={() => setConfirm(null)}
        />
      )}

      {editTarget && (
        <BarrierFormModal
          barrier={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={() => setEditTarget(null)}
        />
      )}

      {viewTargetId && (
        <BarrierDetailDrawer
          barrierId={viewTargetId}
          onClose={() => setViewTargetId(null)}
          onEdit={(barrier) => {
            setViewTargetId(null);
            setEditTarget(barrier);
          }}
          onDisable={(barrier) => {
            setConfirm({
              title: "Disable Barrier",
              message: `Disable barrier "${barrier.barrier_id_number}"? It will no longer be available for new site assignments.`,
              confirmLabel: "Disable",
              danger: true,
              onConfirm: () => {
                setConfirm(null);
                handleDisable(barrier);
              },
            });
          }}
        />
      )}

      <nav className="flex items-center gap-1.5 text-xs text-gray-500">
        <span>Infrastructure</span>
        <Chevron className="h-3 w-3" />
        <span>Barriers</span>
        <Chevron className="h-3 w-3" />
        <span className="font-semibold text-gray-800">{cfg.label}</span>
        {activeSiteTab === "facilities" && (
          <>
            <Chevron className="h-3 w-3" />
            <span className="font-semibold text-gray-800">
              {FACILITY_PARK_TAB_CONFIG[activeFacilityTab].label}
            </span>
          </>
        )}
      </nav>

      <SummaryPanel
        summary={summary}
        siteTab={activeSiteTab}
        facilityParkTab={activeSiteTab === "facilities" ? activeFacilityTab : undefined}
        isLoading={summaryLoading}
      />

      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-6 pb-0 pt-4">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0f1e2e]">
              <BarChart3 className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900">Barrier Management</h1>
              <p className="text-xs text-gray-500">
                View and manage barriers linked to facilities, transit parks, and terminals
              </p>
            </div>
          </div>

          <div className="flex gap-0.5 overflow-x-auto">
            {SITE_TABS.map((tab) => {
              const tcfg = SITE_TAB_CONFIG[tab];
              const isActive = activeSiteTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => switchSiteTab(tab)}
                  className={`flex items-center gap-2 whitespace-nowrap rounded-t-lg border-b-2 px-4 py-3 text-xs font-semibold transition-colors ${
                    isActive
                      ? "border-emerald-600 text-emerald-700"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <tcfg.Icon className="h-3.5 w-3.5" />
                  {tcfg.label}
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                      isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {siteTabCounts[tab]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {activeSiteTab === "facilities" && (
          <div className="border-b border-gray-100 bg-gray-50/70 px-6 py-3">
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-4">
              <p className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                Facility type
              </p>
              <div className="inline-flex max-w-full flex-wrap gap-1 rounded-lg bg-gray-100 p-1">
                {FACILITY_TABS.map((tab) => {
                  const fcfg = FACILITY_PARK_TAB_CONFIG[tab];
                  const isActive = activeFacilityTab === tab;
                  return (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => switchFacilityTab(tab)}
                      className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                        isActive
                          ? "bg-white text-emerald-700 shadow-sm ring-1 ring-gray-200/80"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      <fcfg.Icon className="h-3 w-3 shrink-0" />
                      <span className="whitespace-nowrap">{fcfg.label}</span>
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                          isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-200/60 text-gray-500"
                        }`}
                      >
                        {facilityTabCounts[tab]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <div className="px-6 py-2.5">
          <p className="text-xs text-gray-500">
            {activeSiteTab === "facilities"
              ? `Integrated barriers assigned to ${FACILITY_PARK_TAB_CONFIG[activeFacilityTab].label.toLowerCase()}`
              : cfg.integratedLabel}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-56 flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={cfg.searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-emerald-300 focus:bg-white focus:ring-2 focus:ring-emerald-100"
            />
          </div>

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

          <DisplayOptionsMenu
            columns={TOGGLEABLE_COLUMNS}
            allColumnKeys={ALL_COLUMN_KEYS}
            visibleColumns={visibleColumns}
            onApply={setVisibleColumns}
            label="Display"
            showHiddenCount={false}
          />

          <div className="group relative">
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
                <FileText className="h-3.5 w-3.5 text-gray-400" />
                CSV
              </button>
              <button
                onClick={() => toast.info("Exporting as PDF...")}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <FileText className="h-3.5 w-3.5 text-red-500" />
                PDF
              </button>
            </div>
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 grid grid-cols-1 gap-3 border-t border-gray-100 pt-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                Operational Status
              </label>
              <select
                value={operationalFilter}
                onChange={(e) => {
                  setOperationalFilter(e.target.value as (typeof OPERATIONAL_STATUS_FILTERS)[number]);
                  setPage(1);
                }}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
              >
                {OPERATIONAL_STATUS_FILTERS.map((s) => (
                  <option key={s} value={s}>
                    {s === "All" ? "All Statuses" : formatLabel(s)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                Barrier Type
              </label>
              <select
                value={barrierTypeFilter}
                onChange={(e) => {
                  setBarrierTypeFilter(e.target.value as (typeof BARRIER_TYPE_FILTERS)[number]);
                  setPage(1);
                }}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
              >
                {BARRIER_TYPE_FILTERS.map((s) => (
                  <option key={s} value={s}>
                    {s === "All" ? "All Types" : formatLabel(s)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                Admin Status
              </label>
              <select
                value={adminStatusFilter}
                onChange={(e) => {
                  setAdminStatusFilter(e.target.value as (typeof ADMIN_STATUS_FILTERS)[number]);
                  setPage(1);
                }}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
              >
                {ADMIN_STATUS_FILTERS.map((s) => (
                  <option key={s} value={s}>
                    {s === "All" ? "All Statuses" : s === "ACTIVE" ? "Active" : "Disabled"}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
            <span className="ml-2 text-sm text-gray-500">Loading barriers…</span>
          </div>
        )}

        {isError && (
          <div className="flex items-center justify-center py-16">
            <p className="text-sm text-red-500">Failed to load barriers. Please try again.</p>
          </div>
        )}

        {!isLoading && !isError && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/60">
                    <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                      S/No.
                    </th>
                    <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                      Barrier ID Number
                    </th>
                    {col("service_provider") && (
                      <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                        Service Provider
                      </th>
                    )}
                    {col("barrier_type") && (
                      <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                        Barrier Type
                      </th>
                    )}
                    {col("barrier_status") && (
                      <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                        Barrier Status
                      </th>
                    )}
                    {col("admin_status") && (
                      <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                        Admin Status
                      </th>
                    )}
                    {col("linked_facility") && (
                      <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                        {cfg.linkedSiteLabel}
                      </th>
                    )}
                    {col("linked_handheld") && (
                      <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                        Linked Handheld
                      </th>
                    )}
                    <th className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={2 + visibleColumns.size + 1} className="px-4 py-12 text-center">
                        <DoorOpen className="mx-auto h-8 w-8 text-gray-300" />
                        <p className="mt-2 text-sm font-medium text-gray-400">No barriers found</p>
                        <p className="mt-1 text-xs text-gray-400">
                          No barriers linked to this {cfg.entityLabel.toLowerCase()} category yet — register
                          barriers in App Options, then assign them when editing a site.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    items.map((item, index) => (
                      <tr key={`${item.id}-${item.barrier_type ?? "row"}`} className="hover:bg-gray-50/80">
                        <td className="px-4 py-3 text-xs text-gray-500">
                          {(currentPage - 1) * PAGE_SIZE + index + 1}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-mono text-xs font-medium text-gray-900">
                            {item.barrier_id_number}
                          </p>
                          {!col("service_provider") && (
                            <p className="mt-0.5 text-[11px] text-gray-400">{item.service_provider_name}</p>
                          )}
                          {!col("admin_status") && item.status === "INACTIVE" && (
                            <span className="mt-1 inline-flex">
                              <AdminStatusBadge status={item.status} />
                            </span>
                          )}
                        </td>
                        {col("service_provider") && (
                          <td className="px-4 py-3 text-xs text-gray-700">{item.service_provider_name}</td>
                        )}
                        {col("barrier_type") && (
                          <td className="px-4 py-3">
                            <BarrierTypeBadge type={item.barrier_type} />
                          </td>
                        )}
                        {col("barrier_status") && (
                          <td className="px-4 py-3">
                            <OperationalStatusBadge status={item.operational_status} />
                          </td>
                        )}
                        {col("admin_status") && (
                          <td className="px-4 py-3">
                            <AdminStatusBadge status={item.status} />
                          </td>
                        )}
                        {col("linked_facility") && (
                          <td className="px-4 py-3 text-xs text-gray-700">{resolveLinkedSite(item)}</td>
                        )}
                        {col("linked_handheld") && (
                          <td className="px-4 py-3 font-mono text-xs text-gray-700">
                            {resolveLinkedHandheld(item)}
                          </td>
                        )}
                        <td className="px-4 py-3 text-center">
                          <TableActionsDropdown>
                            {(close) => (
                              <>
                                <button
                                  onClick={() => {
                                    close();
                                    handleAction("view", item);
                                  }}
                                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50"
                                >
                                  <Eye className="h-4 w-4 text-gray-400" />
                                  View Barrier Details
                                </button>
                                <button
                                  onClick={() => {
                                    close();
                                    handleAction("edit", item);
                                  }}
                                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50"
                                >
                                  <Edit2 className="h-4 w-4 text-gray-400" />
                                  Edit Barrier Information
                                </button>
                                {item.status === "ACTIVE" && (
                                  <button
                                    onClick={() => {
                                      close();
                                      handleAction("disable", item);
                                    }}
                                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
                                  >
                                    <Ban className="h-4 w-4" />
                                    Disable Barrier
                                  </button>
                                )}
                              </>
                            )}
                          </TableActionsDropdown>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
                <p className="text-xs text-gray-500">
                  Page {currentPage} of {totalPages}
                  {meta?.total != null && ` · ${meta.total} barriers`}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage <= 1}
                    className="rounded-lg border border-gray-200 p-1.5 text-gray-500 hover:bg-gray-50 disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage >= totalPages}
                    className="rounded-lg border border-gray-200 p-1.5 text-gray-500 hover:bg-gray-50 disabled:opacity-40"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

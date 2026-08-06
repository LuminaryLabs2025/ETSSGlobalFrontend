"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Smartphone,
  Search,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  Plus,
  Edit2,
  Trash2,
  Ban,
  Loader2,
  CheckCircle2,
  XCircle,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { useHandheldDevices } from "@/hooks/handheld-devices/useHandheldDevices";
import { useHandheldDevice } from "@/hooks/handheld-devices/useHandheldDevice";
import {
  useCreateHandheldDevice,
  useDeleteHandheldDevice,
  useUpdateHandheldDevice,
} from "@/hooks/handheld-devices/useHandheldDeviceActions";
import { useUsers } from "@/hooks/users/useUsers";
import { useLocations } from "@/hooks/locations/useLocations";
import { useBarriers } from "@/hooks/barriers/useBarriers";
import { TableActionsDropdown } from "@/components/dashboard/TableActionsDropdown";
import type {
  HandheldDevice,
  HandheldDevicePayload,
  HandheldDeviceUser,
} from "@/types/handheld-devices.types";
import {
  buildHandheldDevicePayload,
  resolveHandheldBarrierLabel,
} from "@/types/handheld-devices.types";
import type { BarrierRecord } from "@/types/barriers.types";
import type { LocationRecord } from "@/types/locations.types";
import type { PlatformUser } from "@/types/users.types";

const PAGE_SIZE = 20;
const STATUS_FILTERS = ["All", "ACTIVE", "INACTIVE"] as const;

function formatLabel(value: string) {
  if (value === "All") return "All";
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatUserName(user?: HandheldDeviceUser | PlatformUser | null) {
  if (!user) return "—";
  const first = user.first_name?.trim() ?? "";
  const last = user.last_name?.trim() ?? "";
  const full = `${first} ${last}`.trim();
  if (full) return full;
  return user.email?.trim() ?? "—";
}

function formatUserOption(user: PlatformUser) {
  const name = formatUserName(user);
  const company = user.company?.name?.trim();
  if (company) return `${name} — ${company}`;
  return user.email ? `${name} (${user.email})` : name;
}

function formatLocationOption(location: LocationRecord) {
  const type = location.type ? formatLabel(location.type) : "Location";
  return `${location.name} (${type})`;
}

function formatBarrierOption(barrier: BarrierRecord) {
  const provider = barrier.service_provider_name?.trim();
  if (provider) return `${barrier.barrier_id_number} — ${provider}`;
  return barrier.barrier_id_number;
}

function StatusBadge({ status }: { status: string }) {
  const active = status === "ACTIVE";
  if (active) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
        <CheckCircle2 className="h-3 w-3" />
        Active
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[11px] font-medium text-gray-500">
      <XCircle className="h-3 w-3" />
      {formatLabel(status)}
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
              danger ? "bg-red-600 hover:bg-red-700" : "bg-fuchsia-600 hover:bg-fuchsia-700"
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

function HandheldDeviceFormModal({
  mode,
  device,
  onClose,
  onSaved,
}: {
  mode: "create" | "edit";
  device?: HandheldDevice;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { data: detail, isLoading: detailLoading } = useHandheldDevice(
    mode === "edit" && device ? device.id : null,
  );
  const { data: usersData, isLoading: usersLoading } = useUsers({ page: 1, limit: 100 });
  const { data: locationsData, isLoading: locationsLoading } = useLocations({
    page: 1,
    limit: 100,
  });
  const { data: barriersData, isLoading: barriersLoading } = useBarriers({
    page: 1,
    limit: 100,
  });

  const createDevice = useCreateHandheldDevice();
  const updateDevice = useUpdateHandheldDevice();

  const [name, setName] = useState("");
  const [userId, setUserId] = useState("");
  const [barrierId, setBarrierId] = useState("");
  const [locationId, setLocationId] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [initialized, setInitialized] = useState(false);

  const users = usersData?.data ?? [];
  const locations = locationsData?.data ?? [];
  const barriers = barriersData?.data ?? [];
  const barrierSelectOptions = useMemo(() => {
    const options = [...barriers];
    const assigned = detail?.barrier ?? device?.barrier;
    const assignedId = barrierId || assigned?.id;
    if (assignedId && !options.some((barrier) => barrier.id === assignedId) && assigned) {
      options.unshift({
        id: assigned.id,
        barrier_id_number: assigned.barrier_id_number ?? assigned.id,
        service_provider_name: assigned.service_provider_name ?? assigned.name ?? "",
        operational_status: "OFFLINE",
        status: "ACTIVE",
        barrier_type: null,
        linked_facility: null,
        linked_site: null,
        linked_sites: [],
        linked_handheld: null,
        linked_handhelds: [],
        created_at: "",
        updated_at: "",
      });
    }
    return options;
  }, [barriers, barrierId, detail?.barrier, device?.barrier]);

  useEffect(() => {
    if (mode === "create") {
      if (!usersLoading && !locationsLoading && !barriersLoading) setInitialized(true);
      return;
    }
    if (initialized) return;
    if (detailLoading && !detail) return;
    if (usersLoading || locationsLoading || barriersLoading) return;

    const source = detail ?? device;
    if (!source) return;

    setName(source.name ?? "");
    setUserId(source.user_id ?? "");
    setBarrierId(source.barrier_id ?? "");
    setLocationId(source.location_id ?? "");
    setStatus(source.status ?? "ACTIVE");
    setInitialized(true);
  }, [
    mode,
    detail,
    detailLoading,
    device,
    initialized,
    usersLoading,
    locationsLoading,
    barriersLoading,
  ]);

  function validate() {
    const nextErrors: Record<string, string> = {};
    if (!name.trim()) nextErrors.name = "Portal name is required.";
    if (!userId.trim()) nextErrors.user_id = "Assigned user is required.";
    if (!barrierId.trim() && !locationId.trim()) {
      nextErrors.barrier_id = "Select a linked barrier or location.";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSave() {
    if (!validate()) return;

    const payload: HandheldDevicePayload = buildHandheldDevicePayload({
      name,
      user_id: userId,
      barrier_id: barrierId,
      location_id: locationId,
      status,
    });

    if (mode === "create") {
      createDevice.mutate(payload, {
        onSuccess: () => {
          toast.success("Handheld user portal created successfully.");
          onSaved();
          onClose();
        },
      });
      return;
    }

    if (!device) return;
    updateDevice.mutate(
      { id: device.id, payload },
      {
        onSuccess: () => {
          toast.success("Handheld user portal updated successfully.");
          onSaved();
          onClose();
        },
      },
    );
  }

  const isPending = createDevice.isPending || updateDevice.isPending;

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/40" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-[70] flex max-h-[90vh] w-full max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col rounded-2xl border border-gray-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0f1e2e]">
              <Smartphone className="h-4 w-4 text-fuchsia-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">
                {mode === "create" ? "Add Handheld User Portal" : "Edit Handheld User Portal"}
              </h2>
              <p className="text-xs text-gray-500">
                {mode === "create"
                  ? "Link a device portal to a user and barrier (or optional location)"
                  : device?.name}
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

        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
          {mode === "edit" && detailLoading && !initialized && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-fuchsia-500" />
              Loading handheld portal...
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-700">
              Portal / Device Name <span className="text-red-500">*</span>
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. HH-APM-001"
              className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500 ${
                errors.name ? "border-red-300" : "border-gray-200"
              }`}
            />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-700">
              Assigned User <span className="text-red-500">*</span>
            </label>
            <select
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              disabled={usersLoading}
              className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500 disabled:opacity-60 ${
                errors.user_id ? "border-red-300" : "border-gray-200"
              }`}
            >
              <option value="">
                {usersLoading ? "Loading users…" : "Select assigned user…"}
              </option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {formatUserOption(user)}
                </option>
              ))}
            </select>
            {errors.user_id && <p className="mt-1 text-xs text-red-500">{errors.user_id}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-700">
              Linked Barrier <span className="text-red-500">*</span>
            </label>
            <select
              value={barrierId}
              onChange={(e) => setBarrierId(e.target.value)}
              disabled={barriersLoading}
              className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500 disabled:opacity-60 ${
                errors.barrier_id ? "border-red-300" : "border-gray-200"
              }`}
            >
              <option value="">
                {barriersLoading ? "Loading barriers…" : "Select barrier from catalog…"}
              </option>
              {barrierSelectOptions.map((barrier) => (
                <option key={barrier.id} value={barrier.id}>
                  {formatBarrierOption(barrier)}
                </option>
              ))}
            </select>
            {errors.barrier_id && <p className="mt-1 text-xs text-red-500">{errors.barrier_id}</p>}
            <p className="mt-1 text-[11px] text-gray-500">
              Preferred. Assign the handheld to a barrier registered under Infrastructure → Barriers.
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-700">
              Location (optional)
            </label>
            <select
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              disabled={locationsLoading}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500 disabled:opacity-60"
            >
              <option value="">
                {locationsLoading ? "Loading locations…" : "No location (barrier only)…"}
              </option>
              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {formatLocationOption(location)}
                </option>
              ))}
            </select>
            <p className="mt-1 text-[11px] text-gray-500">
              Optional facility timeslot location. Required only if no barrier is selected.
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-700">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500"
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="flex items-center gap-2 rounded-lg bg-fuchsia-600 px-4 py-2 text-sm font-medium text-white hover:bg-fuchsia-700 disabled:opacity-50"
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "create" ? "Create Portal" : "Save Changes"}
          </button>
        </div>
      </div>
    </>
  );
}

function ActionsMenu({
  item,
  onAction,
}: {
  item: HandheldDevice;
  onAction: (action: string, item: HandheldDevice) => void;
}) {
  const actions = [
    { label: "Edit", icon: Edit2, action: "edit" },
    ...(item.status === "ACTIVE"
      ? [{ label: "Deactivate", icon: Ban, action: "deactivate", danger: true as const }]
      : [{ label: "Activate", icon: CheckCircle2, action: "activate" }]),
    { label: "Delete", icon: Trash2, action: "delete", danger: true as const },
  ];

  return (
    <TableActionsDropdown width={208}>
      {(close) => (
        <>
          {actions.map((a) => (
            <button
              key={a.action}
              onClick={() => {
                close();
                onAction(a.action, item);
              }}
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

export function HandheldDevicesPanel() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_FILTERS)[number]>("All");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [confirm, setConfirm] = useState<{
    title: string;
    message: string;
    confirmLabel: string;
    danger?: boolean;
    onConfirm: () => void;
  } | null>(null);
  const [formMode, setFormMode] = useState<"create" | "edit" | null>(null);
  const [editTarget, setEditTarget] = useState<HandheldDevice | null>(null);

  const deleteDevice = useDeleteHandheldDevice();
  const updateDevice = useUpdateHandheldDevice();

  const { data: usersData } = useUsers({ page: 1, limit: 100 });
  const { data: locationsData } = useLocations({ page: 1, limit: 100 });
  const { data: barriersData } = useBarriers({ page: 1, limit: 200 });

  const userNameMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const user of usersData?.data ?? []) {
      map.set(user.id, formatUserOption(user));
    }
    return map;
  }, [usersData]);

  const locationNameMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const location of locationsData?.data ?? []) {
      map.set(location.id, formatLocationOption(location));
    }
    return map;
  }, [locationsData]);

  const barrierNameMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const barrier of barriersData?.data ?? []) {
      map.set(barrier.id, formatBarrierOption(barrier));
    }
    return map;
  }, [barriersData]);

  useEffect(() => {
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [search]);

  const { data, isLoading, isError } = useHandheldDevices({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
    status: statusFilter !== "All" ? statusFilter : undefined,
  });

  const items = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta?.total_pages ?? 1;
  const currentPage = meta?.page ?? page;
  const hasActiveFilters = search || statusFilter !== "All";

  function resolveUserLabel(item: HandheldDevice) {
    if (item.user) {
      const name = formatUserName(item.user);
      const company = item.user.company?.name?.trim();
      return company ? `${name} — ${company}` : name;
    }
    return userNameMap.get(item.user_id) ?? item.user_id;
  }

  function resolveLocationLabel(item: HandheldDevice) {
    if (!item.location_id?.trim()) return "—";
    if (item.location?.name) {
      const type = item.location.type ? formatLabel(item.location.type) : "";
      return type ? `${item.location.name} (${type})` : item.location.name;
    }
    return locationNameMap.get(item.location_id) ?? item.location_id;
  }

  function resolveBarrierLabel(item: HandheldDevice) {
    return resolveHandheldBarrierLabel(item, barrierNameMap);
  }

  function updateStatus(item: HandheldDevice, nextStatus: "ACTIVE" | "INACTIVE") {
    updateDevice.mutate(
      {
        id: item.id,
        payload: buildHandheldDevicePayload({
          name: item.name,
          user_id: item.user_id,
          location_id: item.location_id ?? undefined,
          barrier_id: item.barrier_id ?? undefined,
          status: nextStatus,
        }),
      },
      {
        onSuccess: () =>
          toast.success(
            nextStatus === "ACTIVE"
              ? `${item.name} has been activated.`
              : `${item.name} has been deactivated.`,
          ),
      },
    );
  }

  function handleAction(action: string, item: HandheldDevice) {
    if (action === "edit") {
      setEditTarget(item);
      setFormMode("edit");
      return;
    }
    if (action === "activate") {
      setConfirm({
        title: "Activate Handheld Portal",
        message: `Activate "${item.name}"? The assigned user will regain portal access.`,
        confirmLabel: "Activate",
        onConfirm: () => {
          setConfirm(null);
          updateStatus(item, "ACTIVE");
        },
      });
      return;
    }
    if (action === "deactivate") {
      setConfirm({
        title: "Deactivate Handheld Portal",
        message: `Deactivate "${item.name}"? Portal access will be suspended until reactivated.`,
        confirmLabel: "Deactivate",
        danger: true,
        onConfirm: () => {
          setConfirm(null);
          updateStatus(item, "INACTIVE");
        },
      });
      return;
    }
    if (action === "delete") {
      setConfirm({
        title: "Delete Handheld Portal",
        message: `Delete "${item.name}" permanently? This cannot be undone.`,
        confirmLabel: "Delete",
        danger: true,
        onConfirm: () => {
          setConfirm(null);
          deleteDevice.mutate(item.id, {
            onSuccess: () => toast.success(`${item.name} has been deleted.`),
          });
        },
      });
    }
  }

  return (
    <>
      {confirm && (
        <ConfirmDialog
          {...confirm}
          isPending={deleteDevice.isPending || updateDevice.isPending}
          onCancel={() => setConfirm(null)}
        />
      )}

      {formMode && (
        <HandheldDeviceFormModal
          mode={formMode}
          device={formMode === "edit" ? editTarget ?? undefined : undefined}
          onClose={() => {
            setFormMode(null);
            setEditTarget(null);
          }}
          onSaved={() => {
            setFormMode(null);
            setEditTarget(null);
          }}
        />
      )}

      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-fuchsia-50 p-2.5">
              <Smartphone className="h-5 w-5 text-fuchsia-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">Handheld User Portals</h2>
              <p className="text-xs text-gray-500">
                Manage handheld devices linked to users, barriers, and optional facility locations
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-fuchsia-50 px-2.5 py-1 text-[11px] font-medium text-fuchsia-700">
              {meta?.total ?? 0} total
            </span>
            <button
              type="button"
              onClick={() => setFormMode("create")}
              className="flex items-center gap-1.5 rounded-lg bg-fuchsia-600 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-fuchsia-700"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Handheld Portal
            </button>
          </div>
        </div>

        <div className="border-b border-fuchsia-100 bg-fuchsia-50/40 px-5 py-3">
          <div className="flex items-start gap-2">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-fuchsia-600" />
            <p className="text-[11px] leading-relaxed text-fuchsia-800">
              Create handheld user portals for gate operators and facility staff. Each portal links a
              device to a user account and a barrier from the catalog (recommended). An optional
              facility timeslot location can also be assigned when needed. SuperAdmin only.
            </p>
          </div>
        </div>

        <div className="border-b border-gray-100 px-5 py-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-50 flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search handheld portals..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-fuchsia-300 focus:bg-white focus:ring-2 focus:ring-fuchsia-100"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                showFilters || hasActiveFilters
                  ? "border-fuchsia-300 bg-fuchsia-50 text-fuchsia-700"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Filter className="h-4 w-4" />
              Filters
            </button>
          </div>

          {showFilters && (
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <div className="relative">
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value as (typeof STATUS_FILTERS)[number]);
                    setPage(1);
                  }}
                  className="appearance-none rounded-lg border border-gray-200 bg-white py-1.5 pl-3 pr-8 text-xs text-gray-700 outline-none focus:border-fuchsia-300"
                >
                  {STATUS_FILTERS.map((s) => (
                    <option key={s} value={s}>
                      {formatLabel(s)}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute bottom-2.5 right-2 h-3 w-3 text-gray-400" />
              </div>
            </div>
          )}
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-fuchsia-600" />
            <span className="ml-2 text-sm text-gray-500">Loading handheld portals…</span>
          </div>
        )}

        {isError && (
          <div className="flex items-center justify-center py-16">
            <p className="text-sm text-red-500">Failed to load handheld portals. Please try again.</p>
          </div>
        )}

        {!isLoading && !isError && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-200">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/60">
                    <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                      S/No.
                    </th>
                    <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                      Portal Name
                    </th>
                    <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                      Assigned User
                    </th>
                    <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                      Linked Barrier
                    </th>
                    <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                      Location
                    </th>
                    <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                      Status
                    </th>
                    <th className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center">
                        <Smartphone className="mx-auto h-8 w-8 text-gray-300" />
                        <p className="mt-2 text-sm font-medium text-gray-400">No handheld portals found</p>
                      </td>
                    </tr>
                  ) : (
                    items.map((item, index) => (
                      <tr key={item.id} className="transition-colors hover:bg-gray-50/80">
                        <td className="px-4 py-3 text-xs text-gray-500">
                          {(currentPage - 1) * PAGE_SIZE + index + 1}
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs font-medium text-gray-900">{item.name}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs text-gray-600">{resolveUserLabel(item)}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-mono text-xs text-gray-600">{resolveBarrierLabel(item)}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs text-gray-600">{resolveLocationLabel(item)}</p>
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={item.status} />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <ActionsMenu item={item} onAction={handleAction} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
              <p className="text-xs text-gray-500">
                Showing{" "}
                <span className="font-medium text-gray-700">
                  {meta?.total === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}
                </span>
                –
                <span className="font-medium text-gray-700">
                  {Math.min(currentPage * PAGE_SIZE, meta?.total ?? 0)}
                </span>{" "}
                of <span className="font-medium text-gray-700">{meta?.total ?? 0}</span> portals
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage <= 1}
                  className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .slice(0, 7)
                  .map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`min-w-8 rounded-lg px-2 py-1 text-xs font-medium ${
                        p === currentPage
                          ? "bg-fuchsia-600 text-white"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                <button
                  onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage >= totalPages}
                  className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export function useHandheldDevicesCount() {
  const { data } = useHandheldDevices({ page: 1, limit: 1 });
  return data?.meta.total ?? 0;
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  MapPin,
  Search,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { useLocations } from "@/hooks/locations/useLocations";
import { useLocation } from "@/hooks/locations/useLocation";
import {
  useCreateLocation,
  useDeleteLocation,
  useUpdateLocation,
} from "@/hooks/locations/useLocationActions";
import { useFacilities } from "@/hooks/facilities/useFacilities";
import { useTerminals } from "@/hooks/terminals/useTerminals";
import { TableActionsDropdown } from "@/components/dashboard/TableActionsDropdown";
import {
  LOCATION_TYPE_OPTIONS,
  type LocationPayload,
  type LocationRecord,
} from "@/types/locations.types";

const PAGE_SIZE = 20;
const TYPE_FILTERS = ["All", "FACILITY", "TERMINAL_GATE"] as const;

function formatLabel(value: string) {
  if (value === "All") return "All";
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function TypeBadge({ type }: { type: string }) {
  const isFacility = type === "FACILITY";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${
        isFacility
          ? "border-violet-200 bg-violet-50 text-violet-700"
          : "border-slate-200 bg-slate-50 text-slate-700"
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
              danger ? "bg-red-600 hover:bg-red-700" : "bg-rose-600 hover:bg-rose-700"
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

function ReferenceSelect({
  type,
  value,
  onChange,
  error,
}: {
  type: string;
  value: string;
  onChange: (id: string) => void;
  error?: string;
}) {
  const isFacility = type === "FACILITY";
  const { data: facilitiesData, isLoading: facilitiesLoading } = useFacilities(
    isFacility ? { page: 1, limit: 100 } : undefined,
  );
  const { data: terminalsData, isLoading: terminalsLoading } = useTerminals(
    !isFacility && type === "TERMINAL_GATE" ? { page: 1, limit: 100 } : undefined,
  );

  const options = isFacility
    ? (facilitiesData?.data ?? [])
    : type === "TERMINAL_GATE"
      ? (terminalsData?.data ?? [])
      : [];

  const isLoading = isFacility ? facilitiesLoading : type === "TERMINAL_GATE" ? terminalsLoading : false;
  const label = isFacility ? "Facility" : type === "TERMINAL_GATE" ? "Terminal" : "Reference";

  if (!type) {
    return (
      <p className="text-xs text-gray-400">Select a location type first to choose a linked record.</p>
    );
  }

  if (type !== "FACILITY" && type !== "TERMINAL_GATE") {
    return (
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Reference ID (UUID)"
        className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 ${
          error
            ? "border-red-300 focus:border-red-400 focus:ring-red-100"
            : "border-gray-200 focus:border-rose-300 focus:ring-rose-100"
        }`}
      />
    );
  }

  return (
    <div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={isLoading}
        className={`w-full appearance-none rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:ring-2 disabled:opacity-60 ${
          error
            ? "border-red-300 focus:border-red-400 focus:ring-red-100"
            : "border-gray-200 focus:border-rose-300 focus:ring-rose-100"
        }`}
      >
        <option value="">
          {isLoading ? `Loading ${label.toLowerCase()}s…` : `Select ${label.toLowerCase()}…`}
        </option>
        {options.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

function LocationFormModal({
  mode,
  location,
  onClose,
  onSaved,
}: {
  mode: "create" | "edit";
  location?: LocationRecord;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { data: detail, isLoading: detailLoading } = useLocation(
    mode === "edit" && location ? location.id : null,
  );
  const createLocation = useCreateLocation();
  const updateLocation = useUpdateLocation();

  const [name, setName] = useState("");
  const [type, setType] = useState("FACILITY");
  const [referenceId, setReferenceId] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [initialized, setInitialized] = useState(false);
  const prevTypeRef = useRef(type);

  useEffect(() => {
    if (mode === "create") {
      setInitialized(true);
      return;
    }
    if (initialized) return;
    if (detailLoading && !detail) return;

    const source = detail ?? location;
    if (!source) return;

    setName(source.name ?? "");
    setType(source.type ?? "FACILITY");
    setReferenceId(source.reference_id ?? "");
    prevTypeRef.current = source.type ?? "FACILITY";
    setInitialized(true);
  }, [mode, detail, detailLoading, location, initialized]);

  useEffect(() => {
    if (!initialized) return;
    if (prevTypeRef.current !== type) {
      setReferenceId("");
      prevTypeRef.current = type;
    }
  }, [type, initialized]);

  function validate() {
    const nextErrors: Record<string, string> = {};
    if (!name.trim()) nextErrors.name = "Location name is required.";
    if (!type.trim()) nextErrors.type = "Location type is required.";
    if (!referenceId.trim()) nextErrors.reference_id = "Linked reference is required.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSave() {
    if (!validate()) return;

    const payload: LocationPayload = {
      name: name.trim(),
      type,
      reference_id: referenceId.trim(),
    };

    if (mode === "create") {
      createLocation.mutate(payload, {
        onSuccess: () => {
          toast.success("Location created successfully.");
          onSaved();
        },
      });
      return;
    }

    if (!location) return;
    updateLocation.mutate(
      { id: location.id, payload },
      {
        onSuccess: () => {
          toast.success("Location updated successfully.");
          onSaved();
        },
      },
    );
  }

  const isPending = createLocation.isPending || updateLocation.isPending;
  const isLoadingForm = mode === "edit" && detailLoading && !initialized;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 flex max-h-[90vh] w-full max-w-md -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-rose-50 p-2">
              <MapPin className="h-4 w-4 text-rose-600" />
            </div>
            <h3 className="text-sm font-bold text-gray-900">
              {mode === "create" ? "Add Location" : "Edit Location"}
            </h3>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <X className="h-4 w-4" />
          </button>
        </div>

        {isLoadingForm ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-rose-600" />
          </div>
        ) : (
          <div className="space-y-4 overflow-y-auto px-5 py-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Location Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Apapa Truck Park"
                className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 ${
                  errors.name
                    ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                    : "border-gray-200 focus:border-rose-300 focus:ring-rose-100"
                }`}
              />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Location Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className={`w-full appearance-none rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:ring-2 ${
                  errors.type
                    ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                    : "border-gray-200 focus:border-rose-300 focus:ring-rose-100"
                }`}
              >
                {LOCATION_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {errors.type && <p className="mt-1 text-xs text-red-500">{errors.type}</p>}
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                Linked {type === "FACILITY" ? "Facility" : type === "TERMINAL_GATE" ? "Terminal" : "Reference"}
              </label>
              <ReferenceSelect
                type={type}
                value={referenceId}
                onChange={setReferenceId}
                error={errors.reference_id}
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-5 py-4">
          <button
            onClick={onClose}
            disabled={isPending}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isPending || isLoadingForm}
            className="flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50"
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "create" ? "Create Location" : "Save Changes"}
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
  item: LocationRecord;
  onAction: (action: "edit" | "delete", item: LocationRecord) => void;
}) {
  const actions = [
    { label: "Edit", icon: Edit2, action: "edit" as const },
    { label: "Delete", icon: Trash2, action: "delete" as const, danger: true as const },
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

export function LocationsPanel() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<(typeof TYPE_FILTERS)[number]>("All");
  const [showFilters, setShowFilters] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit" | null>(null);
  const [editTarget, setEditTarget] = useState<LocationRecord | null>(null);
  const [confirm, setConfirm] = useState<{
    title: string;
    message: string;
    confirmLabel: string;
    danger?: boolean;
    onConfirm: () => void;
  } | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const listParams = {
    page,
    limit: PAGE_SIZE,
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    ...(typeFilter !== "All" ? { type: typeFilter } : {}),
  };

  const { data, isLoading, isError } = useLocations(listParams);
  const deleteLocation = useDeleteLocation();

  const { data: facilitiesData } = useFacilities({ page: 1, limit: 100 });
  const { data: terminalsData } = useTerminals({ page: 1, limit: 100 });

  const referenceNameMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const facility of facilitiesData?.data ?? []) {
      map.set(facility.id, facility.name);
    }
    for (const terminal of terminalsData?.data ?? []) {
      map.set(terminal.id, terminal.name);
    }
    return map;
  }, [facilitiesData, terminalsData]);

  const items = data?.data ?? [];
  const meta = data?.meta;
  const currentPage = meta?.page ?? page;
  const totalPages = meta?.total_pages ?? 1;
  const hasActiveFilters = typeFilter !== "All";

  function resolveReferenceName(item: LocationRecord) {
    if (item.reference?.name) return item.reference.name;
    return referenceNameMap.get(item.reference_id) ?? item.reference_id;
  }

  function handleAction(action: "edit" | "delete", item: LocationRecord) {
    if (action === "edit") {
      setEditTarget(item);
      setFormMode("edit");
      return;
    }
    setConfirm({
      title: "Delete Location",
      message: `Delete "${item.name}" permanently? This cannot be undone.`,
      confirmLabel: "Delete",
      danger: true,
      onConfirm: () => {
        setConfirm(null);
        deleteLocation.mutate(item.id, {
          onSuccess: () => toast.success(`${item.name} has been deleted.`),
        });
      },
    });
  }

  return (
    <>
      {confirm && (
        <ConfirmDialog
          {...confirm}
          isPending={deleteLocation.isPending}
          onCancel={() => setConfirm(null)}
        />
      )}

      {formMode && (
        <LocationFormModal
          mode={formMode}
          location={formMode === "edit" ? editTarget ?? undefined : undefined}
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
            <div className="rounded-lg bg-rose-50 p-2.5">
              <MapPin className="h-5 w-5 text-rose-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">Locations</h2>
              <p className="text-xs text-gray-500">Geographic locations linked to facilities or terminal gates</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-medium text-rose-700">
              {meta?.total ?? 0} total
            </span>
            <button
              type="button"
              onClick={() => setFormMode("create")}
              className="flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-rose-700"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Location
            </button>
          </div>
        </div>

        <div className="border-b border-rose-100 bg-rose-50/40 px-5 py-3">
          <div className="flex items-start gap-2">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-600" />
            <p className="text-[11px] leading-relaxed text-rose-800">
              Locations map a display name to an underlying facility or terminal gate via{" "}
              <span className="font-medium">reference_id</span>. Choose the location type first, then select
              the linked facility or terminal record.
            </p>
          </div>
        </div>

        <div className="border-b border-gray-100 px-5 py-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-50 flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search locations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-rose-300 focus:bg-white focus:ring-2 focus:ring-rose-100"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                showFilters || hasActiveFilters
                  ? "border-rose-300 bg-rose-50 text-rose-700"
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
                  Type
                </label>
                <select
                  value={typeFilter}
                  onChange={(e) => {
                    setTypeFilter(e.target.value as (typeof TYPE_FILTERS)[number]);
                    setPage(1);
                  }}
                  className="appearance-none rounded-lg border border-gray-200 bg-white py-1.5 pl-3 pr-8 text-xs text-gray-700 outline-none focus:border-rose-300"
                >
                  {TYPE_FILTERS.map((t) => (
                    <option key={t} value={t}>
                      {formatLabel(t)}
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
            <Loader2 className="h-6 w-6 animate-spin text-rose-600" />
            <span className="ml-2 text-sm text-gray-500">Loading locations…</span>
          </div>
        )}

        {isError && (
          <div className="flex items-center justify-center py-16">
            <p className="text-sm text-red-500">Failed to load locations. Please try again.</p>
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
                      Location Name
                    </th>
                    <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                      Linked Reference
                    </th>
                    <th className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center">
                        <MapPin className="mx-auto h-8 w-8 text-gray-300" />
                        <p className="mt-2 text-sm font-medium text-gray-400">No locations found</p>
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
                          <TypeBadge type={item.type} />
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs text-gray-600">{resolveReferenceName(item)}</p>
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
                of <span className="font-medium text-gray-700">{meta?.total ?? 0}</span> locations
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
                          ? "bg-rose-600 text-white"
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

export function useLocationsCount() {
  const { data } = useLocations({ page: 1, limit: 1 });
  return data?.meta.total ?? 0;
}

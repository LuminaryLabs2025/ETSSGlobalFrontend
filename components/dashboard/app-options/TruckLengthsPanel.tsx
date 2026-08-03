"use client";

import { useEffect, useRef, useState } from "react";
import {
  Ruler,
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
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import { useTruckLengths } from "@/hooks/truck-lengths/useTruckLengths";
import { useTruckLength } from "@/hooks/truck-lengths/useTruckLength";
import {
  useCreateTruckLength,
  useDeleteTruckLength,
  useUpdateTruckLength,
} from "@/hooks/truck-lengths/useTruckLengthActions";
import { useTruckTypes } from "@/hooks/truck-types/useTruckTypes";
import { TableActionsDropdown } from "@/components/dashboard/TableActionsDropdown";
import type { TruckLength, TruckLengthPayload } from "@/types/truck-lengths.types";

const PAGE_SIZE = 20;
const STATUS_FILTERS = ["All", "ACTIVE", "INACTIVE"] as const;
const TRUCK_TYPE_FILTER_ALL = "All";

function formatLabel(value: string) {
  if (value === "All") return "All";
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function displayOrDash(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : "—";
}

function resolveTruckTypeName(item: TruckLength) {
  return item.truck_type?.name ?? item.truck_type_id;
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
              danger ? "bg-red-600 hover:bg-red-700" : "bg-cyan-600 hover:bg-cyan-700"
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

function TruckLengthFormModal({
  mode,
  length,
  onClose,
  onSaved,
}: {
  mode: "create" | "edit";
  length?: TruckLength;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { data: detail, isLoading: detailLoading } = useTruckLength(
    mode === "edit" && length ? length.id : null,
  );
  const { data: truckTypesData, isLoading: loadingTruckTypes } = useTruckTypes({
    page: 1,
    limit: 100,
    status: mode === "create" ? "ACTIVE" : undefined,
  });
  const createLength = useCreateTruckLength();
  const updateLength = useUpdateTruckLength();

  const truckTypes = truckTypesData?.data ?? [];

  const [truckTypeId, setTruckTypeId] = useState("");
  const [lengthValue, setLengthValue] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (mode === "create") {
      setInitialized(true);
      return;
    }
    if (initialized) return;
    if (detailLoading && !detail) return;

    const source = detail ?? length;
    if (!source) return;

    setTruckTypeId(source.truck_type_id ?? "");
    setLengthValue(source.length_value ?? "");
    setStatus(source.status ?? "ACTIVE");
    setInitialized(true);
  }, [mode, detail, detailLoading, length, initialized]);

  function validate() {
    const nextErrors: Record<string, string> = {};
    if (!truckTypeId) nextErrors.truck_type_id = "Select a linked truck type first.";
    if (!lengthValue.trim()) nextErrors.length_value = "Length value is required.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSave() {
    if (!validate()) return;

    const payload: TruckLengthPayload = {
      truck_type_id: truckTypeId,
      length_value: lengthValue.trim(),
      status,
    };

    if (mode === "create") {
      createLength.mutate(payload, {
        onSuccess: () => {
          toast.success("Truck length created successfully.");
          onSaved();
          onClose();
        },
      });
      return;
    }

    if (!length) return;
    updateLength.mutate(
      { id: length.id, payload },
      {
        onSuccess: () => {
          toast.success("Truck length updated successfully.");
          onSaved();
          onClose();
        },
      },
    );
  }

  const isPending = createLength.isPending || updateLength.isPending;
  const selectedTruckType = truckTypes.find((t) => t.id === truckTypeId);

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/40" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-[70] flex max-h-[90vh] w-full max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col rounded-2xl border border-gray-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0f1e2e]">
              <Ruler className="h-4 w-4 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">
                {mode === "create" ? "Create Truck Length" : "Edit Truck Length"}
              </h2>
              <p className="text-xs text-gray-500">
                {mode === "create"
                  ? "Link a length to a truck type"
                  : displayOrDash(length?.length_value)}
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
              <Loader2 className="h-3.5 w-3.5 animate-spin text-cyan-500" />
              Loading truck length...
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-700">
              Linked Truck Type <span className="text-red-500">*</span>
            </label>
            <select
              value={truckTypeId}
              onChange={(e) => setTruckTypeId(e.target.value)}
              disabled={loadingTruckTypes}
              className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 ${
                errors.truck_type_id ? "border-red-300" : "border-gray-200"
              }`}
            >
              <option value="">
                {loadingTruckTypes ? "Loading truck types…" : "Select truck type first…"}
              </option>
              {truckTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
            {errors.truck_type_id && (
              <p className="mt-1 text-xs text-red-500">{errors.truck_type_id}</p>
            )}
            {!loadingTruckTypes && truckTypes.length === 0 && (
              <p className="mt-1 text-xs text-amber-600">
                No active truck types found. Create a truck type before adding lengths.
              </p>
            )}
            {selectedTruckType?.description && (
              <p className="mt-1 text-[11px] text-gray-400">{selectedTruckType.description}</p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-700">
              Length Value <span className="text-red-500">*</span>
            </label>
            <input
              value={lengthValue}
              onChange={(e) => setLengthValue(e.target.value)}
              placeholder="e.g. 20ft, 40ft, 45ft"
              disabled={!truckTypeId}
              className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400 ${
                errors.length_value ? "border-red-300" : "border-gray-200"
              }`}
            />
            {!truckTypeId && (
              <p className="mt-1 text-[11px] text-gray-400">Select a truck type before entering length.</p>
            )}
            {errors.length_value && (
              <p className="mt-1 text-xs text-red-500">{errors.length_value}</p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-700">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
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
            disabled={isPending || (mode === "create" && truckTypes.length === 0)}
            className="flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-700 disabled:opacity-50"
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "create" ? "Create Length" : "Save Changes"}
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
  item: TruckLength;
  onAction: (action: string, item: TruckLength) => void;
}) {
  const actions = [
    { label: "Edit", icon: Edit2, action: "edit" },
    ...(item.status === "ACTIVE"
      ? [{ label: "Deactivate", icon: Ban, action: "deactivate", danger: true as const }]
      : []),
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

export function TruckLengthsPanel() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_FILTERS)[number]>("All");
  const [truckTypeFilter, setTruckTypeFilter] = useState(TRUCK_TYPE_FILTER_ALL);
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
  const [editTarget, setEditTarget] = useState<TruckLength | null>(null);

  const deleteLength = useDeleteTruckLength();
  const updateLength = useUpdateTruckLength();

  const { data: truckTypesData } = useTruckTypes({ page: 1, limit: 100 });
  const truckTypeOptions = truckTypesData?.data ?? [];

  useEffect(() => {
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [search]);

  const { data, isLoading, isError } = useTruckLengths({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
    status: statusFilter !== "All" ? statusFilter : undefined,
    truck_type_id: truckTypeFilter !== TRUCK_TYPE_FILTER_ALL ? truckTypeFilter : undefined,
  });

  const items = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta?.total_pages ?? 1;
  const currentPage = meta?.page ?? page;

  const hasActiveFilters =
    search || statusFilter !== "All" || truckTypeFilter !== TRUCK_TYPE_FILTER_ALL;

  function handleDeactivate(item: TruckLength) {
    const payload: TruckLengthPayload = {
      truck_type_id: item.truck_type_id,
      length_value: item.length_value,
      status: "INACTIVE",
    };
    updateLength.mutate(
      { id: item.id, payload },
      { onSuccess: () => toast.success(`${item.length_value} has been deactivated.`) },
    );
  }

  function handleAction(action: string, item: TruckLength) {
    if (action === "edit") {
      setEditTarget(item);
      setFormMode("edit");
      return;
    }
    if (action === "deactivate") {
      setConfirm({
        title: "Deactivate Truck Length",
        message: `Deactivate "${item.length_value}" for ${resolveTruckTypeName(item)}?`,
        confirmLabel: "Deactivate",
        danger: true,
        onConfirm: () => {
          setConfirm(null);
          handleDeactivate(item);
        },
      });
      return;
    }
    if (action === "delete") {
      setConfirm({
        title: "Delete Truck Length",
        message: `Delete "${item.length_value}" permanently? This cannot be undone.`,
        confirmLabel: "Delete",
        danger: true,
        onConfirm: () => {
          setConfirm(null);
          deleteLength.mutate(item.id, {
            onSuccess: () => toast.success(`${item.length_value} has been deleted.`),
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
          isPending={deleteLength.isPending || updateLength.isPending}
          onCancel={() => setConfirm(null)}
        />
      )}

      {formMode && (
        <TruckLengthFormModal
          mode={formMode}
          length={formMode === "edit" ? editTarget ?? undefined : undefined}
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
            <div className="rounded-lg bg-cyan-50 p-2.5">
              <Ruler className="h-5 w-5 text-cyan-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">Truck Lengths</h2>
              <p className="text-xs text-gray-500">
                Manage length values linked to truck types across the platform
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-cyan-50 px-2.5 py-1 text-[11px] font-medium text-cyan-700">
              {meta?.total ?? 0} total
            </span>
            <button
              type="button"
              onClick={() => setFormMode("create")}
              className="flex items-center gap-1.5 rounded-lg bg-cyan-600 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-cyan-700"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Length
            </button>
          </div>
        </div>

        <div className="border-b border-gray-100 px-5 py-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-50 flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search lengths..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-cyan-300 focus:bg-white focus:ring-2 focus:ring-cyan-100"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                showFilters || hasActiveFilters
                  ? "border-cyan-300 bg-cyan-50 text-cyan-700"
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
                  className="appearance-none rounded-lg border border-gray-200 bg-white py-1.5 pl-3 pr-8 text-xs text-gray-700 outline-none focus:border-cyan-300"
                >
                  {STATUS_FILTERS.map((s) => (
                    <option key={s} value={s}>
                      {formatLabel(s)}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute bottom-2.5 right-2 h-3 w-3 text-gray-400" />
              </div>
              <div className="relative">
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                  Truck Type
                </label>
                <select
                  value={truckTypeFilter}
                  onChange={(e) => {
                    setTruckTypeFilter(e.target.value);
                    setPage(1);
                  }}
                  className="appearance-none rounded-lg border border-gray-200 bg-white py-1.5 pl-3 pr-8 text-xs text-gray-700 outline-none focus:border-cyan-300"
                >
                  <option value={TRUCK_TYPE_FILTER_ALL}>All Types</option>
                  {truckTypeOptions.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
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
            <Loader2 className="h-6 w-6 animate-spin text-cyan-600" />
            <span className="ml-2 text-sm text-gray-500">Loading truck lengths…</span>
          </div>
        )}

        {isError && (
          <div className="flex items-center justify-center py-16">
            <p className="text-sm text-red-500">Failed to load truck lengths. Please try again.</p>
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
                      Length Value
                    </th>
                    <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                      Linked Truck Type
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
                      <td colSpan={5} className="px-4 py-12 text-center">
                        <Ruler className="mx-auto h-8 w-8 text-gray-300" />
                        <p className="mt-2 text-sm font-medium text-gray-400">No truck lengths found</p>
                      </td>
                    </tr>
                  ) : (
                    items.map((item, index) => (
                      <tr key={item.id} className="transition-colors hover:bg-gray-50/80">
                        <td className="px-4 py-3 text-xs text-gray-500">
                          {(currentPage - 1) * PAGE_SIZE + index + 1}
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs font-semibold text-gray-900">{item.length_value}</p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <Truck className="h-3.5 w-3.5 shrink-0 text-cyan-500" />
                            <p className="text-xs font-medium text-gray-700">{resolveTruckTypeName(item)}</p>
                          </div>
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
                of <span className="font-medium text-gray-700">{meta?.total ?? 0}</span> lengths
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
                      className={`h-7 w-7 rounded-lg text-xs font-medium transition-colors ${
                        p === currentPage ? "bg-cyan-600 text-white" : "text-gray-600 hover:bg-gray-100"
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

export function useTruckLengthsCount() {
  const { data } = useTruckLengths({ page: 1, limit: 1 });
  return data?.meta.total ?? 0;
}

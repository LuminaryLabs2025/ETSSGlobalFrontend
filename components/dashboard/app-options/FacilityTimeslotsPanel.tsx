"use client";

import { useEffect, useRef, useState } from "react";
import {
  Clock,
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
import { useFacilityTimeslots } from "@/hooks/facility-timeslots/useFacilityTimeslots";
import { useFacilityTimeslot } from "@/hooks/facility-timeslots/useFacilityTimeslot";
import {
  useCreateFacilityTimeslot,
  useDeleteFacilityTimeslot,
  useUpdateFacilityTimeslot,
} from "@/hooks/facility-timeslots/useFacilityTimeslotActions";
import { TableActionsDropdown } from "@/components/dashboard/TableActionsDropdown";
import type {
  FacilityTimeslot,
  FacilityTimeslotPayload,
} from "@/types/facility-timeslots.types";

const PAGE_SIZE = 20;
const STATUS_FILTERS = ["All", "ACTIVE", "INACTIVE"] as const;

function formatLabel(value: string) {
  if (value === "All") return "All";
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function toTimeInputValue(time: string) {
  if (!time) return "";
  const [hours, minutes] = time.split(":");
  return `${hours ?? "00"}:${minutes ?? "00"}`;
}

function toApiTime(value: string) {
  if (!value) return "";
  if (/^\d{2}:\d{2}:\d{2}$/.test(value)) return value;
  if (/^\d{2}:\d{2}$/.test(value)) return `${value}:00`;
  return value;
}

function formatTimeDisplay(time: string) {
  if (!time) return "—";
  const [hoursStr, minutesStr = "00"] = time.split(":");
  const hours = Number.parseInt(hoursStr, 10);
  if (Number.isNaN(hours)) return time;
  const ampm = hours >= 12 ? "PM" : "AM";
  const h12 = hours % 12 || 12;
  return `${h12}:${minutesStr.padStart(2, "0")} ${ampm}`;
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

function FacilityTimeslotFormModal({
  mode,
  timeslot,
  onClose,
  onSaved,
}: {
  mode: "create" | "edit";
  timeslot?: FacilityTimeslot;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { data: detail, isLoading: detailLoading } = useFacilityTimeslot(
    mode === "edit" && timeslot ? timeslot.id : null,
  );
  const createTimeslot = useCreateFacilityTimeslot();
  const updateTimeslot = useUpdateFacilityTimeslot();

  const [name, setName] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
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

    const source = detail ?? timeslot;
    if (!source) return;

    setName(source.name ?? "");
    setStartTime(toTimeInputValue(source.start_time));
    setEndTime(toTimeInputValue(source.end_time));
    setStatus(source.status ?? "ACTIVE");
    setInitialized(true);
  }, [mode, detail, detailLoading, timeslot, initialized]);

  function validate() {
    const nextErrors: Record<string, string> = {};
    if (!name.trim()) nextErrors.name = "Time-slot name is required.";
    if (!startTime) nextErrors.start_time = "Start time is required.";
    if (!endTime) nextErrors.end_time = "End time is required.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSave() {
    if (!validate()) return;

    const payload: FacilityTimeslotPayload = {
      name: name.trim(),
      start_time: toApiTime(startTime),
      end_time: toApiTime(endTime),
      status,
    };

    if (mode === "create") {
      createTimeslot.mutate(payload, {
        onSuccess: () => {
          toast.success("Facility timeslot created successfully.");
          onSaved();
          onClose();
        },
      });
      return;
    }

    if (!timeslot) return;
    updateTimeslot.mutate(
      { id: timeslot.id, payload },
      {
        onSuccess: () => {
          toast.success("Facility timeslot updated successfully.");
          onSaved();
          onClose();
        },
      },
    );
  }

  const isPending = createTimeslot.isPending || updateTimeslot.isPending;

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/40" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-[70] flex max-h-[90vh] w-full max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col rounded-2xl border border-gray-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0f1e2e]">
              <Clock className="h-4 w-4 text-teal-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">
                {mode === "create" ? "Create Facility Timeslot" : "Edit Facility Timeslot"}
              </h2>
              <p className="text-xs text-gray-500">
                {mode === "create" ? "Define a new operational time window" : timeslot?.name}
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
              <Loader2 className="h-3.5 w-3.5 animate-spin text-teal-500" />
              Loading timeslot...
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                Time-Slot Name <span className="text-red-500">*</span>
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Morning Window"
                className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 ${
                  errors.name ? "border-red-300" : "border-gray-200"
                }`}
              />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                Start Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 ${
                  errors.start_time ? "border-red-300" : "border-gray-200"
                }`}
              />
              {errors.start_time && (
                <p className="mt-1 text-xs text-red-500">{errors.start_time}</p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                End Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 ${
                  errors.end_time ? "border-red-300" : "border-gray-200"
                }`}
              />
              {errors.end_time && <p className="mt-1 text-xs text-red-500">{errors.end_time}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-700">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
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
            className="flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50"
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "create" ? "Create Timeslot" : "Save Changes"}
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
  item: FacilityTimeslot;
  onAction: (action: string, item: FacilityTimeslot) => void;
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

export function FacilityTimeslotsPanel() {
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
  const [editTarget, setEditTarget] = useState<FacilityTimeslot | null>(null);

  const deleteTimeslot = useDeleteFacilityTimeslot();
  const updateTimeslot = useUpdateFacilityTimeslot();

  useEffect(() => {
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [search]);

  const { data, isLoading, isError } = useFacilityTimeslots({
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

  function handleDeactivate(item: FacilityTimeslot) {
    const payload: FacilityTimeslotPayload = {
      name: item.name,
      start_time: item.start_time,
      end_time: item.end_time,
      status: "INACTIVE",
    };
    updateTimeslot.mutate(
      { id: item.id, payload },
      { onSuccess: () => toast.success(`${item.name} has been deactivated.`) },
    );
  }

  function handleAction(action: string, item: FacilityTimeslot) {
    if (action === "edit") {
      setEditTarget(item);
      setFormMode("edit");
      return;
    }
    if (action === "deactivate") {
      setConfirm({
        title: "Deactivate Facility Timeslot",
        message: `Deactivate "${item.name}"? It will no longer be available for facility scheduling.`,
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
        title: "Delete Facility Timeslot",
        message: `Delete "${item.name}" permanently? This cannot be undone.`,
        confirmLabel: "Delete",
        danger: true,
        onConfirm: () => {
          setConfirm(null);
          deleteTimeslot.mutate(item.id, {
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
          isPending={deleteTimeslot.isPending || updateTimeslot.isPending}
          onCancel={() => setConfirm(null)}
        />
      )}

      {formMode && (
        <FacilityTimeslotFormModal
          mode={formMode}
          timeslot={formMode === "edit" ? editTarget ?? undefined : undefined}
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
            <div className="rounded-lg bg-teal-50 p-2.5">
              <Clock className="h-5 w-5 text-teal-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">Facility Timeslot</h2>
              <p className="text-xs text-gray-500">
                Define and manage operational time windows for facility scheduling
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-teal-50 px-2.5 py-1 text-[11px] font-medium text-teal-700">
              {meta?.total ?? 0} total
            </span>
            <button
              type="button"
              onClick={() => setFormMode("create")}
              className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-teal-700"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Timeslot
            </button>
          </div>
        </div>

        <div className="border-b border-teal-100 bg-teal-50/40 px-5 py-3">
          <div className="flex items-start gap-2">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-600" />
            <p className="text-[11px] leading-relaxed text-teal-800">
              When a facility is created, all facility timeslot windows are populated in the
              facility profile so each timeslot can be switched on or off individually.
            </p>
          </div>
        </div>

        <div className="border-b border-gray-100 px-5 py-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-50 flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search timeslots..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-teal-300 focus:bg-white focus:ring-2 focus:ring-teal-100"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                showFilters || hasActiveFilters
                  ? "border-teal-300 bg-teal-50 text-teal-700"
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
                  className="appearance-none rounded-lg border border-gray-200 bg-white py-1.5 pl-3 pr-8 text-xs text-gray-700 outline-none focus:border-teal-300"
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
            <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
            <span className="ml-2 text-sm text-gray-500">Loading facility timeslots…</span>
          </div>
        )}

        {isError && (
          <div className="flex items-center justify-center py-16">
            <p className="text-sm text-red-500">Failed to load facility timeslots. Please try again.</p>
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
                      Time-Slot Name
                    </th>
                    <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                      Start Time
                    </th>
                    <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                      End Time
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
                      <td colSpan={6} className="px-4 py-12 text-center">
                        <Clock className="mx-auto h-8 w-8 text-gray-300" />
                        <p className="mt-2 text-sm font-medium text-gray-400">No facility timeslots found</p>
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
                          <p className="text-xs text-gray-700">{formatTimeDisplay(item.start_time)}</p>
                          <p className="text-[11px] text-gray-400">{item.start_time}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs text-gray-700">{formatTimeDisplay(item.end_time)}</p>
                          <p className="text-[11px] text-gray-400">{item.end_time}</p>
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
                of <span className="font-medium text-gray-700">{meta?.total ?? 0}</span> timeslots
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
                        p === currentPage ? "bg-teal-600 text-white" : "text-gray-600 hover:bg-gray-100"
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

export function useFacilityTimeslotsCount() {
  const { data } = useFacilityTimeslots({ page: 1, limit: 1 });
  return data?.meta.total ?? 0;
}

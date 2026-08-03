"use client";

import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import {
  FileCheck,
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
  Tags,
} from "lucide-react";
import { toast } from "sonner";
import { useTepTypes } from "@/hooks/tep-types/useTepTypes";
import { useTepType } from "@/hooks/tep-types/useTepType";
import {
  useCreateTepType,
  useDeleteTepType,
  useUpdateTepType,
} from "@/hooks/tep-types/useTepTypeActions";
import { useBookingCategories } from "@/hooks/booking-categories/useBookingCategories";
import { useTruckTypes } from "@/hooks/truck-types/useTruckTypes";
import { TableActionsDropdown } from "@/components/dashboard/TableActionsDropdown";
import type { TepType, TepTypeLinkedRef, TepTypePayload } from "@/types/tep-types.types";

const PAGE_SIZE = 20;
const STATUS_FILTERS = ["All", "ACTIVE", "INACTIVE"] as const;

function formatLabel(value: string) {
  if (value === "All") return "All";
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function normalizeLinkedItems(items?: TepTypeLinkedRef[] | string[]): TepTypeLinkedRef[] {
  if (!items?.length) return [];
  if (typeof items[0] === "string") {
    return (items as string[]).map((id) => ({ id, name: id }));
  }
  return items as TepTypeLinkedRef[];
}

function extractLinkedIds(
  items?: TepTypeLinkedRef[] | string[],
  explicitIds?: string[],
): string[] {
  if (explicitIds?.length) return explicitIds;
  return normalizeLinkedItems(items).map((item) => item.id);
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

function LinkedBadges({ items, tone }: { items: TepTypeLinkedRef[]; tone: "orange" | "blue" }) {
  if (items.length === 0) {
    return <span className="text-[11px] text-gray-400">—</span>;
  }
  const cls =
    tone === "orange"
      ? "bg-orange-50 text-orange-700"
      : "bg-blue-50 text-blue-700";
  return (
    <div className="flex flex-wrap gap-1">
      {items.map((item) => (
        <span key={item.id} className={`rounded-md px-1.5 py-0.5 text-[10px] font-medium ${cls}`}>
          {item.name}
        </span>
      ))}
    </div>
  );
}

function MultiSelectField({
  label,
  required,
  placeholder,
  options,
  selected,
  onToggle,
  error,
  loading,
  pillTone,
}: {
  label: string;
  required?: boolean;
  placeholder: string;
  options: { value: string; label: string }[];
  selected: Set<string>;
  onToggle: (value: string) => void;
  error?: string;
  loading?: boolean;
  pillTone: "orange" | "blue";
}) {
  const [open, setOpen] = useState(false);
  const selectedLabels = options.filter((o) => selected.has(o.value)).map((o) => o.label);
  const pillCls = pillTone === "orange" ? "bg-orange-50 text-orange-700" : "bg-blue-50 text-blue-700";

  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          disabled={loading}
          className={`flex w-full items-center justify-between rounded-lg border bg-gray-50 px-3 py-2.5 text-left text-sm outline-none focus:border-orange-300 focus:bg-white focus:ring-2 focus:ring-orange-100 disabled:opacity-60 ${
            error ? "border-red-300" : "border-gray-200"
          }`}
        >
          <span className={selectedLabels.length > 0 ? "text-gray-900" : "text-gray-400"}>
            {loading
              ? "Loading options…"
              : selectedLabels.length > 0
                ? selectedLabels.join(", ")
                : placeholder}
          </span>
          <ChevronDown className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <div className="absolute top-full left-0 right-0 z-20 mt-1 max-h-48 overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
              {options.length === 0 ? (
                <p className="px-3 py-2 text-xs text-gray-400">No options available</p>
              ) : (
                options.map((option) => (
                  <label
                    key={option.value}
                    className="flex cursor-pointer items-center gap-2.5 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={selected.has(option.value)}
                      onChange={() => onToggle(option.value)}
                      className="h-3.5 w-3.5 rounded border-gray-300 accent-orange-600"
                    />
                    {option.label}
                  </label>
                ))
              )}
            </div>
          </>
        )}
      </div>
      {selected.size > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {selectedLabels.map((lbl) => (
            <span
              key={lbl}
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ${pillCls}`}
            >
              <Tags className="h-3 w-3" />
              {lbl}
            </span>
          ))}
        </div>
      )}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
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
              danger ? "bg-red-600 hover:bg-red-700" : "bg-orange-600 hover:bg-orange-700"
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

function TepTypeFormModal({
  mode,
  tepType,
  onClose,
  onSaved,
}: {
  mode: "create" | "edit";
  tepType?: TepType;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { data: detail, isLoading: detailLoading } = useTepType(
    mode === "edit" && tepType ? tepType.id : null,
  );
  const { data: bookingCategoriesData, isLoading: loadingCategories } = useBookingCategories({
    page: 1,
    limit: 100,
    status: "ACTIVE",
  });
  const { data: truckTypesData, isLoading: loadingTruckTypes } = useTruckTypes({
    page: 1,
    limit: 100,
    status: mode === "create" ? "ACTIVE" : undefined,
  });

  const createTepType = useCreateTepType();
  const updateTepType = useUpdateTepType();

  const [name, setName] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [bookingCategoryIds, setBookingCategoryIds] = useState<Set<string>>(new Set());
  const [truckTypeIds, setTruckTypeIds] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [initialized, setInitialized] = useState(false);

  const bookingCategoryOptions =
    bookingCategoriesData?.data.map((c) => ({ value: c.id, label: c.name })) ?? [];
  const truckTypeOptions = truckTypesData?.data.map((t) => ({ value: t.id, label: t.name })) ?? [];

  useEffect(() => {
    if (mode === "create") {
      setInitialized(true);
      return;
    }
    if (initialized) return;
    if (detailLoading && !detail) return;

    const source = detail ?? tepType;
    if (!source) return;

    setName(source.name ?? "");
    setStatus(source.status ?? "ACTIVE");
    setBookingCategoryIds(
      new Set(extractLinkedIds(source.booking_categories, source.booking_category_ids)),
    );
    setTruckTypeIds(new Set(extractLinkedIds(source.truck_types, source.truck_type_ids)));
    setInitialized(true);
  }, [mode, detail, detailLoading, tepType, initialized]);

  function toggleSet(setter: Dispatch<SetStateAction<Set<string>>>, value: string) {
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  }

  function validate() {
    const nextErrors: Record<string, string> = {};
    if (!name.trim()) nextErrors.name = "TEP type name is required.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSave() {
    if (!validate()) return;

    const payload: TepTypePayload = {
      name: name.trim(),
      status,
      booking_category_ids: Array.from(bookingCategoryIds),
      truck_type_ids: Array.from(truckTypeIds),
    };

    if (mode === "create") {
      createTepType.mutate(payload, {
        onSuccess: () => {
          toast.success("TEP type created successfully.");
          onSaved();
          onClose();
        },
      });
      return;
    }

    if (!tepType) return;
    updateTepType.mutate(
      { id: tepType.id, payload },
      {
        onSuccess: () => {
          toast.success("TEP type updated successfully.");
          onSaved();
          onClose();
        },
      },
    );
  }

  const isPending = createTepType.isPending || updateTepType.isPending;

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/40" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-[70] flex max-h-[90vh] w-full max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col rounded-2xl border border-gray-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0f1e2e]">
              <FileCheck className="h-4 w-4 text-orange-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">
                {mode === "create" ? "Create TEP Type" : "Edit TEP Type"}
              </h2>
              <p className="text-xs text-gray-500">
                {mode === "create" ? "Define a truck entry permit type" : tepType?.name}
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
              <Loader2 className="h-3.5 w-3.5 animate-spin text-orange-500" />
              Loading TEP type...
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-700">
              TEP Type Name <span className="text-red-500">*</span>
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Import TDO, GatePass (Port)"
              className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 ${
                errors.name ? "border-red-300" : "border-gray-200"
              }`}
            />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
          </div>

          <MultiSelectField
            label="Linked Booking Categories"
            placeholder="Select booking categories..."
            options={bookingCategoryOptions}
            selected={bookingCategoryIds}
            onToggle={(v) => toggleSet(setBookingCategoryIds, v)}
            loading={loadingCategories}
            pillTone="orange"
          />

          <MultiSelectField
            label="Linked Truck Types"
            placeholder="Select truck types..."
            options={truckTypeOptions}
            selected={truckTypeIds}
            onToggle={(v) => toggleSet(setTruckTypeIds, v)}
            loading={loadingTruckTypes}
            pillTone="blue"
          />

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-700">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
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
            className="flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-50"
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "create" ? "Create TEP Type" : "Save Changes"}
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
  item: TepType;
  onAction: (action: string, item: TepType) => void;
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

export function TepTypesPanel() {
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
  const [editTarget, setEditTarget] = useState<TepType | null>(null);

  const deleteTepType = useDeleteTepType();
  const updateTepType = useUpdateTepType();

  useEffect(() => {
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [search]);

  const { data, isLoading, isError } = useTepTypes({
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

  function buildPayload(item: TepType, nextStatus: string): TepTypePayload {
    return {
      name: item.name,
      status: nextStatus,
      booking_category_ids: extractLinkedIds(item.booking_categories, item.booking_category_ids),
      truck_type_ids: extractLinkedIds(item.truck_types, item.truck_type_ids),
    };
  }

  function updateStatus(item: TepType, nextStatus: "ACTIVE" | "INACTIVE") {
    updateTepType.mutate(
      { id: item.id, payload: buildPayload(item, nextStatus) },
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

  function handleAction(action: string, item: TepType) {
    if (action === "edit") {
      setEditTarget(item);
      setFormMode("edit");
      return;
    }
    if (action === "activate") {
      setConfirm({
        title: "Activate TEP Type",
        message: `Activate "${item.name}"? It will be available for truck entry permits.`,
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
        title: "Deactivate TEP Type",
        message: `Deactivate "${item.name}"? It will no longer be available for new permits.`,
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
        title: "Delete TEP Type",
        message: `Delete "${item.name}" permanently? This cannot be undone.`,
        confirmLabel: "Delete",
        danger: true,
        onConfirm: () => {
          setConfirm(null);
          deleteTepType.mutate(item.id, {
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
          isPending={deleteTepType.isPending || updateTepType.isPending}
          onCancel={() => setConfirm(null)}
        />
      )}

      {formMode && (
        <TepTypeFormModal
          mode={formMode}
          tepType={formMode === "edit" ? editTarget ?? undefined : undefined}
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
            <div className="rounded-lg bg-orange-50 p-2.5">
              <FileCheck className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">Truck Entry Permit (TEP) Type</h2>
              <p className="text-xs text-gray-500">
                Define and manage TEP types linked to booking categories and truck types
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-orange-50 px-2.5 py-1 text-[11px] font-medium text-orange-700">
              {meta?.total ?? 0} total
            </span>
            <button
              type="button"
              onClick={() => setFormMode("create")}
              className="flex items-center gap-1.5 rounded-lg bg-orange-600 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-orange-700"
            >
              <Plus className="h-3.5 w-3.5" />
              Add TEP Type
            </button>
          </div>
        </div>

        <div className="border-b border-orange-100 bg-orange-50/40 px-5 py-3">
          <div className="flex items-start gap-2">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-orange-600" />
            <p className="text-[11px] leading-relaxed text-orange-800">
              Standard TEP types include Import TDO, Export TDO, Empty TDO, GatePass (Port), and
              GatePass (Non-Port). Link each type to relevant booking categories and truck types for
              operational control. SuperAdmin manages all TEP type configurations from this panel.
            </p>
          </div>
        </div>

        <div className="border-b border-gray-100 px-5 py-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-50 flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search TEP types..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-orange-300 focus:bg-white focus:ring-2 focus:ring-orange-100"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                showFilters || hasActiveFilters
                  ? "border-orange-300 bg-orange-50 text-orange-700"
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
                  className="appearance-none rounded-lg border border-gray-200 bg-white py-1.5 pl-3 pr-8 text-xs text-gray-700 outline-none focus:border-orange-300"
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
            <Loader2 className="h-6 w-6 animate-spin text-orange-600" />
            <span className="ml-2 text-sm text-gray-500">Loading TEP types…</span>
          </div>
        )}

        {isError && (
          <div className="flex items-center justify-center py-16">
            <p className="text-sm text-red-500">Failed to load TEP types. Please try again.</p>
          </div>
        )}

        {!isLoading && !isError && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-240">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/60">
                    <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                      S/No.
                    </th>
                    <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                      TEP Type Name
                    </th>
                    <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                      Booking Categories
                    </th>
                    <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                      Truck Types
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
                        <FileCheck className="mx-auto h-8 w-8 text-gray-300" />
                        <p className="mt-2 text-sm font-medium text-gray-400">No TEP types found</p>
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
                          <LinkedBadges
                            items={normalizeLinkedItems(item.booking_categories)}
                            tone="orange"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <LinkedBadges items={normalizeLinkedItems(item.truck_types)} tone="blue" />
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
                of <span className="font-medium text-gray-700">{meta?.total ?? 0}</span> TEP types
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
                        p === currentPage ? "bg-orange-600 text-white" : "text-gray-600 hover:bg-gray-100"
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

export function useTepTypesCount() {
  const { data } = useTepTypes({ page: 1, limit: 1 });
  return data?.meta.total ?? 0;
}

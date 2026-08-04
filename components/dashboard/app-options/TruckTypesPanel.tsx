"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Truck,
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
  Tags,
} from "lucide-react";
import { toast } from "sonner";
import { useTruckTypes } from "@/hooks/truck-types/useTruckTypes";
import { useTruckType } from "@/hooks/truck-types/useTruckType";
import {
  useCreateTruckType,
  useDeleteTruckType,
  useUpdateTruckType,
} from "@/hooks/truck-types/useTruckTypeActions";
import { useBookingCategories } from "@/hooks/booking-categories/useBookingCategories";
import { TableActionsDropdown } from "@/components/dashboard/TableActionsDropdown";
import type { TruckTypeLinkedRef, TruckTypePayload, TruckTypeRecord } from "@/types/truck-types.types";

const PAGE_SIZE = 20;
const STATUS_FILTERS = ["All", "ACTIVE", "INACTIVE"] as const;

type BookingCategoryOption = { value: string; label: string };

function formatLabel(value: string | null | undefined) {
  if (!value) return "—";
  if (value === "All") return "All";
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function normalizeLinkedCategories(items?: TruckTypeLinkedRef[] | string[]): TruckTypeLinkedRef[] {
  if (!items?.length) return [];
  if (typeof items[0] === "string") {
    return (items as string[]).map((id) => ({ id, name: id }));
  }
  return items as TruckTypeLinkedRef[];
}

function extractLinkedCategoryIds(
  items?: TruckTypeLinkedRef[] | string[],
  explicitIds?: string[],
): string[] {
  if (explicitIds?.length) return explicitIds;
  return normalizeLinkedCategories(items).map((item) => item.id);
}

function resolveCategoryLabel(category: TruckTypeLinkedRef, options: BookingCategoryOption[]) {
  const match = options.find((option) => option.value === category.id || option.label === category.name);
  return match?.label ?? category.name ?? formatLabel(category.id);
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
              danger ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"
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

function TruckTypeFormModal({
  mode,
  truckType,
  bookingCategoryOptions,
  loadingCategories,
  onClose,
  onSaved,
}: {
  mode: "create" | "edit";
  truckType?: TruckTypeRecord;
  bookingCategoryOptions: BookingCategoryOption[];
  loadingCategories?: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { data: detail, isLoading: detailLoading } = useTruckType(
    mode === "edit" && truckType ? truckType.id : null,
  );
  const createTruckType = useCreateTruckType();
  const updateTruckType = useUpdateTruckType();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [categories, setCategories] = useState<Set<string>>(new Set());
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (mode === "create") {
      setInitialized(true);
      return;
    }
    if (initialized) return;
    if (detailLoading && !detail) return;

    const source = detail ?? truckType;
    if (!source) return;

    setName(source.name ?? "");
    setDescription(source.description ?? "");
    setStatus(source.status ?? "ACTIVE");
    setCategories(new Set(extractLinkedCategoryIds(source.linked_booking_categories, source.linked_booking_category_ids)));
    setInitialized(true);
  }, [mode, detail, detailLoading, truckType, initialized]);

  function toggleCategory(value: string) {
    setCategories((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  }

  function validate() {
    const nextErrors: Record<string, string> = {};
    if (!name.trim()) nextErrors.name = "Truck type name is required.";
    if (categories.size === 0) {
      nextErrors.categories = "Select at least one linked booking category.";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function buildPayload(): TruckTypePayload {
    return {
      name: name.trim(),
      description: description.trim(),
      status,
      linked_booking_categories: Array.from(categories),
    };
  }

  function handleSave() {
    if (!validate()) return;

    const payload = buildPayload();

    if (mode === "create") {
      createTruckType.mutate(payload, {
        onSuccess: () => {
          toast.success("Truck type created successfully.");
          onSaved();
          onClose();
        },
      });
      return;
    }

    if (!truckType) return;
    updateTruckType.mutate(
      { id: truckType.id, payload },
      {
        onSuccess: () => {
          toast.success("Truck type updated successfully.");
          onSaved();
          onClose();
        },
      },
    );
  }

  const selectedCategoryLabels = bookingCategoryOptions
    .filter((option) => categories.has(option.value))
    .map((option) => option.label);

  const isPending = createTruckType.isPending || updateTruckType.isPending;

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/40" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-[70] flex max-h-[90vh] w-full max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col rounded-2xl border border-gray-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0f1e2e]">
              <Truck className="h-4 w-4 text-blue-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">
                {mode === "create" ? "Create Truck Type" : "Edit Truck Type"}
              </h2>
              <p className="text-xs text-gray-500">
                {mode === "create" ? "Add a new truck type classification" : truckType?.name}
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
              <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-500" />
              Loading truck type...
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-700">
              Truck Type Name <span className="text-red-500">*</span>
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Flatbed"
              className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${
                errors.name ? "border-red-300" : "border-gray-200"
              }`}
            />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Brief description of this truck type"
              className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-700">
              Linked Booking Categories <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setCategoryMenuOpen((open) => !open)}
                disabled={loadingCategories}
                className={`flex w-full items-center justify-between rounded-lg border bg-gray-50 px-3 py-2.5 text-left text-sm outline-none focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100 disabled:opacity-60 ${
                  errors.categories ? "border-red-300" : "border-gray-200"
                }`}
              >
                <span className={selectedCategoryLabels.length > 0 ? "text-gray-900" : "text-gray-400"}>
                  {loadingCategories
                    ? "Loading booking categories..."
                    : selectedCategoryLabels.length > 0
                      ? selectedCategoryLabels.join(", ")
                      : "Select booking categories..."}
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-gray-400 transition-transform ${categoryMenuOpen ? "rotate-180" : ""}`}
                />
              </button>
              {categoryMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setCategoryMenuOpen(false)} />
                  <div className="absolute bottom-full left-0 right-0 z-20 mb-1 max-h-48 overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                    {bookingCategoryOptions.length === 0 ? (
                      <p className="px-3 py-2.5 text-sm text-gray-400">No booking categories available.</p>
                    ) : (
                      bookingCategoryOptions.map((option) => (
                        <label
                          key={option.value}
                          className="flex cursor-pointer items-center gap-2.5 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <input
                            type="checkbox"
                            checked={categories.has(option.value)}
                            onChange={() => toggleCategory(option.value)}
                            className="h-3.5 w-3.5 rounded border-gray-300 accent-blue-600"
                          />
                          {option.label}
                        </label>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>
            {categories.size > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedCategoryLabels.map((label) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-700"
                  >
                    <Tags className="h-3 w-3" />
                    {label}
                  </span>
                ))}
              </div>
            )}
            <p className="mt-1 text-[11px] text-gray-400">
              Select all booking categories this truck type can be used for.
            </p>
            {errors.categories && <p className="mt-1 text-xs text-red-500">{errors.categories}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-700">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "create" ? "Create Truck Type" : "Save Changes"}
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
  item: TruckTypeRecord;
  onAction: (action: string, item: TruckTypeRecord) => void;
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

export function TruckTypesPanel() {
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
  const [editTarget, setEditTarget] = useState<TruckTypeRecord | null>(null);

  const deleteTruckType = useDeleteTruckType();
  const updateTruckType = useUpdateTruckType();

  const { data: bookingCategoriesData, isLoading: loadingCategories } = useBookingCategories({
    page: 1,
    limit: 100,
    status: "ACTIVE",
  });

  const bookingCategoryOptions = useMemo<BookingCategoryOption[]>(
    () => bookingCategoriesData?.data.map((c) => ({ value: c.id, label: c.name })) ?? [],
    [bookingCategoriesData],
  );

  useEffect(() => {
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [search]);

  const { data, isLoading, isError } = useTruckTypes({
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

  const formatTimestamp = (ts: string) =>
    new Date(ts).toLocaleString("en-NG", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  function handleDeactivate(item: TruckTypeRecord) {
    const payload: TruckTypePayload = {
      name: item.name,
      description: item.description ?? "",
      status: "INACTIVE",
      linked_booking_categories: extractLinkedCategoryIds(item.linked_booking_categories, item.linked_booking_category_ids),
    };
    updateTruckType.mutate(
      { id: item.id, payload },
      { onSuccess: () => toast.success(`${item.name} has been deactivated.`) },
    );
  }

  function handleAction(action: string, item: TruckTypeRecord) {
    if (action === "edit") {
      setEditTarget(item);
      setFormMode("edit");
      return;
    }
    if (action === "deactivate") {
      setConfirm({
        title: "Deactivate Truck Type",
        message: `Deactivate "${item.name}"? It will no longer be available for truck registration.`,
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
        title: "Delete Truck Type",
        message: `Delete "${item.name}" permanently? This cannot be undone.`,
        confirmLabel: "Delete",
        danger: true,
        onConfirm: () => {
          setConfirm(null);
          deleteTruckType.mutate(item.id, {
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
          isPending={deleteTruckType.isPending || updateTruckType.isPending}
          onCancel={() => setConfirm(null)}
        />
      )}

      {formMode && (
        <TruckTypeFormModal
          mode={formMode}
          truckType={formMode === "edit" ? editTarget ?? undefined : undefined}
          bookingCategoryOptions={bookingCategoryOptions}
          loadingCategories={loadingCategories}
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
            <div className="rounded-lg bg-blue-50 p-2.5">
              <Truck className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">Truck Types</h2>
              <p className="text-xs text-gray-500">
                Create, edit, or delete truck type classifications on the platform
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-700">
              {meta?.total ?? 0} total
            </span>
            <button
              type="button"
              onClick={() => setFormMode("create")}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-blue-700"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Truck Type
            </button>
          </div>
        </div>

        <div className="border-b border-gray-100 px-5 py-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-50 flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search truck types..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                showFilters || hasActiveFilters
                  ? "border-blue-300 bg-blue-50 text-blue-700"
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
                  className="appearance-none rounded-lg border border-gray-200 bg-white py-1.5 pl-3 pr-8 text-xs text-gray-700 outline-none focus:border-blue-300"
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
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <span className="ml-2 text-sm text-gray-500">Loading truck types…</span>
          </div>
        )}

        {isError && (
          <div className="flex items-center justify-center py-16">
            <p className="text-sm text-red-500">Failed to load truck types. Please try again.</p>
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
                      Truck Type Name
                    </th>
                    <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                      Created At
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
                        <Truck className="mx-auto h-8 w-8 text-gray-300" />
                        <p className="mt-2 text-sm font-medium text-gray-400">No truck types found</p>
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
                          {item.description && (
                            <p className="mt-0.5 truncate text-[11px] text-gray-400">{item.description}</p>
                          )}
                          {normalizeLinkedCategories(item.linked_booking_categories).length > 0 && (
                            <div className="mt-1.5 flex flex-wrap gap-1">
                              {normalizeLinkedCategories(item.linked_booking_categories).map((category) => (
                                <span
                                  key={category.id}
                                  className="rounded-md bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-700"
                                >
                                  {resolveCategoryLabel(category, bookingCategoryOptions)}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={item.status} />
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs text-gray-600">
                            {item.created_at ? formatTimestamp(item.created_at) : "—"}
                          </p>
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
                of <span className="font-medium text-gray-700">{meta?.total ?? 0}</span> truck types
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
                        p === currentPage ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"
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

export function useTruckTypesCount() {
  const { data } = useTruckTypes({ page: 1, limit: 1 });
  return data?.meta.total ?? 0;
}

"use client";

import { useEffect, useRef, useState } from "react";
import {
  CreditCard,
  Search,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  Clock,
  Plus,
  Eye,
  Edit2,
  Trash2,
  Ban,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { usePaymentTypes } from "@/hooks/payment-types/usePaymentTypes";
import { usePaymentType } from "@/hooks/payment-types/usePaymentType";
import {
  useCreatePaymentType,
  useDeletePaymentType,
  useUpdatePaymentType,
} from "@/hooks/payment-types/usePaymentTypeActions";
import { useUserTypes } from "@/hooks/useUserTypes";
import { TableActionsDropdown } from "@/components/dashboard/TableActionsDropdown";
import type {
  PaymentAmountType,
  PaymentType,
  PaymentTypeDetail,
  PaymentTypePayload,
} from "@/types/payment-types.types";

const PAGE_SIZE = 20;
const STATUS_FILTERS = ["All", "ACTIVE", "INACTIVE"] as const;
const AMOUNT_TYPE_OPTIONS: PaymentAmountType[] = ["FIXED", "PERCENTAGE"];

function formatLabel(value: string) {
  if (value === "All") return "All";
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function displayOrDash(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : "—";
}

function formatAmount(amount: number, amountType: string) {
  if (amountType === "PERCENTAGE") return `${amount}%`;
  return `₦${amount.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
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

function PaymentTypeDetailDrawer({
  paymentType: fallback,
  onClose,
  formatTimestamp,
}: {
  paymentType: PaymentType;
  onClose: () => void;
  formatTimestamp: (ts: string) => string;
}) {
  const { data: detail, isLoading, isError } = usePaymentType(fallback.id);
  const item: PaymentTypeDetail = detail ?? fallback;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[460px] flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 bg-[#0f1e2e] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600/20">
              <CreditCard className="h-5 w-5 text-emerald-400" />
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-sm font-bold text-white">{item.name}</h2>
              <p className="truncate text-[11px] text-gray-400">{displayOrDash(item.service_name)}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-6">
          {isLoading && (
            <div className="flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-xs text-gray-500">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-500" />
              Loading payment type details...
            </div>
          )}
          {isError && (
            <div className="flex items-center gap-2 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-xs text-amber-700">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              Some detail fields may be unavailable. Showing cached data.
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={item.status} />
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-700">
              {formatLabel(item.amount_type)}
            </span>
          </div>

          <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Rate</p>
            <p className="mt-1 text-2xl font-bold text-emerald-700">
              {formatAmount(item.amount, item.amount_type)}
            </p>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white">
            <div className="border-b border-gray-100 px-4 py-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                Payment Type Details
              </p>
            </div>
            <div className="divide-y divide-gray-50">
              {[
                { label: "ID", value: item.id, mono: true },
                { label: "Name", value: item.name },
                { label: "Service Name", value: displayOrDash(item.service_name) },
                { label: "Linked Form", value: displayOrDash(item.linked_form) },
                { label: "Revenue Event Trigger", value: displayOrDash(item.revenue_event_trigger) },
                {
                  label: "Charged To User Type",
                  value: displayOrDash(item.charged_to_user_type?.name ?? item.charged_to_user_type_id),
                },
                { label: "Amount Type", value: formatLabel(item.amount_type) },
                { label: "Amount", value: formatAmount(item.amount, item.amount_type) },
                { label: "Status", value: formatLabel(item.status) },
              ].map(({ label, value, mono }) => (
                <div key={label} className="flex items-start justify-between gap-4 px-4 py-3">
                  <p className="shrink-0 text-xs text-gray-500">{label}</p>
                  <p className={`text-right text-xs font-medium text-gray-800 ${mono ? "font-mono" : ""}`}>
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {(item.created_at || item.updated_at) && (
            <div className="rounded-xl border border-gray-100 bg-white">
              <div className="border-b border-gray-100 px-4 py-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Timestamps</p>
              </div>
              <div className="divide-y divide-gray-50">
                {item.created_at && (
                  <div className="flex items-center justify-between px-4 py-3">
                    <p className="text-xs text-gray-500">Created At</p>
                    <p className="flex items-center gap-1 text-xs font-medium text-gray-800">
                      <Clock className="h-3 w-3 text-gray-400" />
                      {formatTimestamp(item.created_at)}
                    </p>
                  </div>
                )}
                {item.updated_at && (
                  <div className="flex items-center justify-between px-4 py-3">
                    <p className="text-xs text-gray-500">Last Updated</p>
                    <p className="flex items-center gap-1 text-xs font-medium text-gray-800">
                      <Clock className="h-3 w-3 text-gray-400" />
                      {formatTimestamp(item.updated_at)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function PaymentTypeFormModal({
  mode,
  paymentType,
  onClose,
  onSaved,
}: {
  mode: "create" | "edit";
  paymentType?: PaymentType;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { data: detail, isLoading: detailLoading } = usePaymentType(
    mode === "edit" && paymentType ? paymentType.id : null,
  );
  const { data: userTypes = [], isLoading: loadingUserTypes } = useUserTypes();
  const createPaymentType = useCreatePaymentType();
  const updatePaymentType = useUpdatePaymentType();

  const [name, setName] = useState("");
  const [serviceName, setServiceName] = useState("");
  const [linkedForm, setLinkedForm] = useState("");
  const [revenueEventTrigger, setRevenueEventTrigger] = useState("");
  const [chargedToUserTypeId, setChargedToUserTypeId] = useState("");
  const [amountType, setAmountType] = useState<PaymentAmountType>("FIXED");
  const [amount, setAmount] = useState("");
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

    const source = detail ?? paymentType;
    if (!source) return;

    setName(source.name ?? "");
    setServiceName(source.service_name ?? "");
    setLinkedForm(source.linked_form ?? "");
    setRevenueEventTrigger(source.revenue_event_trigger ?? "");
    setChargedToUserTypeId(source.charged_to_user_type_id ?? "");
    setAmountType(source.amount_type ?? "FIXED");
    setAmount(String(source.amount ?? ""));
    setStatus(source.status ?? "ACTIVE");
    setInitialized(true);
  }, [mode, detail, detailLoading, paymentType, initialized]);

  function validate() {
    const nextErrors: Record<string, string> = {};
    if (!name.trim()) nextErrors.name = "Name is required.";
    if (!serviceName.trim()) nextErrors.service_name = "Service name is required.";
    if (!chargedToUserTypeId) nextErrors.charged_to_user_type_id = "Select a user type.";
    const amountNum = Number(amount);
    if (!amount.trim() || Number.isNaN(amountNum) || amountNum < 0) {
      nextErrors.amount = "Enter a valid amount.";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSave() {
    if (!validate()) return;

    const payload: PaymentTypePayload = {
      name: name.trim(),
      service_name: serviceName.trim(),
      linked_form: linkedForm.trim(),
      revenue_event_trigger: revenueEventTrigger.trim(),
      charged_to_user_type_id: chargedToUserTypeId,
      amount_type: amountType,
      amount: Number(amount),
      status,
    };

    if (mode === "create") {
      createPaymentType.mutate(payload, {
        onSuccess: () => {
          toast.success("Payment type created successfully.");
          onSaved();
          onClose();
        },
      });
      return;
    }

    if (!paymentType) return;
    updatePaymentType.mutate(
      { id: paymentType.id, payload },
      {
        onSuccess: () => {
          toast.success("Payment type updated successfully.");
          onSaved();
          onClose();
        },
      },
    );
  }

  const isPending = createPaymentType.isPending || updatePaymentType.isPending;

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/40" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-[70] flex max-h-[90vh] w-full max-w-xl -translate-x-1/2 -translate-y-1/2 flex-col rounded-2xl border border-gray-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0f1e2e]">
              <CreditCard className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">
                {mode === "create" ? "Create Payment Type" : "Edit Payment Type"}
              </h2>
              <p className="text-xs text-gray-500">
                {mode === "create" ? "Add a new payment type and rate" : paymentType?.name}
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
              <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-500" />
              Loading payment type...
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 ${
                  errors.name ? "border-red-300" : "border-gray-200"
                }`}
              />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                Service Name <span className="text-red-500">*</span>
              </label>
              <input
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 ${
                  errors.service_name ? "border-red-300" : "border-gray-200"
                }`}
              />
              {errors.service_name && (
                <p className="mt-1 text-xs text-red-500">{errors.service_name}</p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-700">Linked Form</label>
              <input
                value={linkedForm}
                onChange={(e) => setLinkedForm(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                Revenue Event Trigger
              </label>
              <input
                value={revenueEventTrigger}
                onChange={(e) => setRevenueEventTrigger(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                Charged To User Type <span className="text-red-500">*</span>
              </label>
              <select
                value={chargedToUserTypeId}
                onChange={(e) => setChargedToUserTypeId(e.target.value)}
                disabled={loadingUserTypes}
                className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 ${
                  errors.charged_to_user_type_id ? "border-red-300" : "border-gray-200"
                }`}
              >
                <option value="">Select user type…</option>
                {userTypes.map((ut) => (
                  <option key={ut.id} value={ut.id}>
                    {ut.name} ({ut.category})
                  </option>
                ))}
              </select>
              {errors.charged_to_user_type_id && (
                <p className="mt-1 text-xs text-red-500">{errors.charged_to_user_type_id}</p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-700">Amount Type</label>
              <select
                value={amountType}
                onChange={(e) => setAmountType(e.target.value as PaymentAmountType)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              >
                {AMOUNT_TYPE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {formatLabel(opt)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                Amount <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={0}
                step={amountType === "PERCENTAGE" ? "0.01" : "1"}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 ${
                  errors.amount ? "border-red-300" : "border-gray-200"
                }`}
              />
              {errors.amount && <p className="mt-1 text-xs text-red-500">{errors.amount}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-700">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
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
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "create" ? "Create Payment Type" : "Save Changes"}
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
  item: PaymentType;
  onAction: (action: string, item: PaymentType) => void;
}) {
  const actions = [
    { label: "View Details", icon: Eye, action: "view" },
    { label: "Edit", icon: Edit2, action: "edit" },
    ...(item.status === "ACTIVE"
      ? [{ label: "Disable", icon: Ban, action: "disable", danger: true as const }]
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

export function PaymentTypesPanel() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_FILTERS)[number]>("All");
  const [amountTypeFilter, setAmountTypeFilter] = useState("All");
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
  const [selectedItem, setSelectedItem] = useState<PaymentType | null>(null);
  const [formMode, setFormMode] = useState<"create" | "edit" | null>(null);
  const [editTarget, setEditTarget] = useState<PaymentType | null>(null);

  const deletePaymentType = useDeletePaymentType();
  const updatePaymentType = useUpdatePaymentType();

  useEffect(() => {
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [search]);

  const { data, isLoading, isError } = usePaymentTypes({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
    status: statusFilter !== "All" ? statusFilter : undefined,
    type: amountTypeFilter !== "All" ? amountTypeFilter : undefined,
  });

  const items = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta?.total_pages ?? 1;
  const currentPage = meta?.page ?? page;

  const activeCount = items.filter((i) => i.status === "ACTIVE").length;
  const hasActiveFilters = search || statusFilter !== "All" || amountTypeFilter !== "All";

  const formatTimestamp = (ts: string) =>
    new Date(ts).toLocaleString("en-NG", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  function handleDisable(item: PaymentType) {
    const payload: PaymentTypePayload = {
      name: item.name,
      service_name: item.service_name,
      linked_form: item.linked_form,
      revenue_event_trigger: item.revenue_event_trigger,
      charged_to_user_type_id: item.charged_to_user_type_id,
      amount_type: item.amount_type,
      amount: item.amount,
      status: "INACTIVE",
    };
    updatePaymentType.mutate(
      { id: item.id, payload },
      { onSuccess: () => toast.success(`${item.name} has been disabled.`) },
    );
  }

  function handleAction(action: string, item: PaymentType) {
    if (action === "view") {
      setSelectedItem(item);
      return;
    }
    if (action === "edit") {
      setEditTarget(item);
      setFormMode("edit");
      return;
    }
    if (action === "disable") {
      setConfirm({
        title: "Disable Payment Type",
        message: `Disable "${item.name}"? It will no longer be available for new transactions.`,
        confirmLabel: "Disable",
        danger: true,
        onConfirm: () => {
          setConfirm(null);
          handleDisable(item);
        },
      });
      return;
    }
    if (action === "delete") {
      setConfirm({
        title: "Delete Payment Type",
        message: `Delete "${item.name}" permanently? This cannot be undone.`,
        confirmLabel: "Delete",
        danger: true,
        onConfirm: () => {
          setConfirm(null);
          deletePaymentType.mutate(item.id, {
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
          isPending={deletePaymentType.isPending || updatePaymentType.isPending}
          onCancel={() => setConfirm(null)}
        />
      )}

      {selectedItem && (
        <PaymentTypeDetailDrawer
          paymentType={selectedItem}
          onClose={() => setSelectedItem(null)}
          formatTimestamp={formatTimestamp}
        />
      )}

      {formMode && (
        <PaymentTypeFormModal
          mode={formMode}
          paymentType={formMode === "edit" ? editTarget ?? undefined : undefined}
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
            <div className="rounded-lg bg-green-50 p-2.5">
              <CreditCard className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">Payment Type &amp; Rate</h2>
              <p className="text-xs text-gray-500">
                View, create, edit, or disable payment types and associated rates
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
              {meta?.total ?? 0} total
            </span>
            <button
              type="button"
              onClick={() => setFormMode("create")}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-emerald-700"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Payment Type
            </button>
          </div>
        </div>

        <div className="border-b border-gray-100 px-5 py-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-50 flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search payment types..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-emerald-300 focus:bg-white focus:ring-2 focus:ring-emerald-100"
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
                  className="appearance-none rounded-lg border border-gray-200 bg-white py-1.5 pl-3 pr-8 text-xs text-gray-700 outline-none focus:border-emerald-300"
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
                  Amount Type
                </label>
                <select
                  value={amountTypeFilter}
                  onChange={(e) => {
                    setAmountTypeFilter(e.target.value);
                    setPage(1);
                  }}
                  className="appearance-none rounded-lg border border-gray-200 bg-white py-1.5 pl-3 pr-8 text-xs text-gray-700 outline-none focus:border-emerald-300"
                >
                  <option value="All">All</option>
                  {AMOUNT_TYPE_OPTIONS.map((t) => (
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
            <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
            <span className="ml-2 text-sm text-gray-500">Loading payment types…</span>
          </div>
        )}

        {isError && (
          <div className="flex items-center justify-center py-16">
            <p className="text-sm text-red-500">Failed to load payment types. Please try again.</p>
          </div>
        )}

        {!isLoading && !isError && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-200">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/60">
                    <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                      Service
                    </th>
                    <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                      Charged To
                    </th>
                    <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                      Rate
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
                        <CreditCard className="mx-auto h-8 w-8 text-gray-300" />
                        <p className="mt-2 text-sm font-medium text-gray-400">No payment types found</p>
                      </td>
                    </tr>
                  ) : (
                    items.map((item) => (
                      <tr key={item.id} className="transition-colors hover:bg-gray-50/80">
                        <td className="px-4 py-3">
                          <p className="text-xs font-medium text-gray-900">{item.name}</p>
                          <p className="truncate text-[11px] text-gray-400">{displayOrDash(item.linked_form)}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs text-gray-600">{displayOrDash(item.service_name)}</p>
                          <p className="truncate text-[11px] text-gray-400">
                            {displayOrDash(item.revenue_event_trigger)}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs text-gray-600">
                            {displayOrDash(item.charged_to_user_type?.name ?? item.charged_to_user_type_id)}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs font-semibold text-gray-900">
                            {formatAmount(item.amount, item.amount_type)}
                          </p>
                          <p className="text-[11px] text-gray-400">{formatLabel(item.amount_type)}</p>
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
                of <span className="font-medium text-gray-700">{meta?.total ?? 0}</span> payment types
                {items.length > 0 && (
                  <span className="ml-2 text-gray-400">({activeCount} active on this page)</span>
                )}
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
                        p === currentPage ? "bg-emerald-600 text-white" : "text-gray-600 hover:bg-gray-100"
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

export function usePaymentTypesCount() {
  const { data } = usePaymentTypes({ page: 1, limit: 1 });
  return data?.meta.total ?? 0;
}

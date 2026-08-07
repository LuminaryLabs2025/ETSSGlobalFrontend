"use client";

import { useState } from "react";
import {
  DoorOpen,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  X,
  Plus,
  Loader2,
  Info,
  CheckCircle2,
  XCircle,
  Wifi,
  WifiOff,
} from "lucide-react";
import { toast } from "sonner";
import type {
  BarrierOperationalStatus,
  BarrierRecord,
  BarrierPayload,
} from "@/types/barriers.types";
import { useBarriers } from "@/hooks/barriers/useBarriers";
import { useCreateBarrier } from "@/hooks/barriers/useBarrierActions";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";

const PAGE_SIZE = 20;
const OPERATIONAL_STATUS_FILTERS = ["All", "ONLINE", "OFFLINE"] as const;
const ADMIN_STATUS_FILTERS = ["All", "ACTIVE", "INACTIVE"] as const;

function formatLabel(value: string) {
  if (value === "All") return "All";
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
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

function BarrierCreateModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const createBarrier = useCreateBarrier();
  const [serviceProviderName, setServiceProviderName] = useState("");
  const [barrierIdNumber, setBarrierIdNumber] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const nextErrors: Record<string, string> = {};
    if (!serviceProviderName.trim()) nextErrors.service_provider_name = "Service provider name is required.";
    if (!barrierIdNumber.trim()) nextErrors.barrier_id_number = "Barrier ID number is required.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    const payload: BarrierPayload = {
      service_provider_name: serviceProviderName.trim(),
      barrier_id_number: barrierIdNumber.trim(),
    };
    createBarrier.mutate(payload, {
      onSuccess: () => {
        toast.success("Barrier created successfully.");
        onSaved();
        onClose();
      },
    });
  }

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/40" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-[70] flex max-h-[90vh] w-full max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col rounded-2xl border border-gray-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0f1e2e]">
              <DoorOpen className="h-4 w-4 text-teal-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">Add New Barrier</h2>
              <p className="text-xs text-gray-500">Register a new barrier in the catalog</p>
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
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-700">
              Service Provider Name <span className="text-red-500">*</span>
            </label>
            <input
              value={serviceProviderName}
              onChange={(e) => setServiceProviderName(e.target.value)}
              placeholder="e.g. Access Control Co."
              className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 ${
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
              className={`w-full rounded-lg border px-3 py-2.5 font-mono text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 ${
                errors.barrier_id_number ? "border-red-300" : "border-gray-200"
              }`}
            />
            {errors.barrier_id_number && (
              <p className="mt-1 text-xs text-red-500">{errors.barrier_id_number}</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-6 py-4">
          <button
            onClick={onClose}
            disabled={createBarrier.isPending}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={createBarrier.isPending}
            className="flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50"
          >
            {createBarrier.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Create Barrier
          </button>
        </div>
      </div>
    </>
  );
}

export function BarriersPanel() {
  const [page, setPage] = useState(1);
  const { search, setSearch, debouncedSearch } = useDebouncedSearch("", () => setPage(1));
  const [operationalFilter, setOperationalFilter] =
    useState<(typeof OPERATIONAL_STATUS_FILTERS)[number]>("All");
  const [adminStatusFilter, setAdminStatusFilter] =
    useState<(typeof ADMIN_STATUS_FILTERS)[number]>("All");
  const [showFilters, setShowFilters] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  const listParams = {
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
    operational_status: operationalFilter !== "All" ? operationalFilter : undefined,
    status: adminStatusFilter !== "All" ? adminStatusFilter : undefined,
  };

  const { data, isLoading, isError } = useBarriers(listParams);

  const items = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta?.total_pages ?? 1;
  const currentPage = meta?.page ?? page;
  const hasActiveFilters =
    operationalFilter !== "All" || adminStatusFilter !== "All" || Boolean(search);

  return (
    <>
      {showCreate && (
        <BarrierCreateModal onClose={() => setShowCreate(false)} onSaved={() => setShowCreate(false)} />
      )}

      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-teal-50 p-2.5">
              <DoorOpen className="h-5 w-5 text-teal-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">Barriers</h2>
              <p className="text-xs text-gray-500">
                Register barriers here, then link them to facilities, transit parks, or terminals
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-teal-50 px-2.5 py-1 text-[11px] font-medium text-teal-700">
              {meta?.total ?? 0} total
            </span>
            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-teal-700"
            >
              <Plus className="h-3.5 w-3.5" />
              Add New Barrier
            </button>
          </div>
        </div>

          <div className="border-b border-teal-100 bg-teal-50/40 px-5 py-3">
            <div className="flex items-start gap-2">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-600" />
              <p className="text-[11px] leading-relaxed text-teal-800">
                Register new barriers here before assigning them as entry or exit gates on a facility,
                transit park, or terminal. Barriers appear under Infrastructure → Barriers once linked to a
                site.
              </p>
            </div>
          </div>

          <div className="border-b border-gray-100 px-5 py-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-50 flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by barrier ID number or service provider..."
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
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                    Operational Status
                  </label>
                  <select
                    value={operationalFilter}
                    onChange={(e) => {
                      setOperationalFilter(e.target.value as (typeof OPERATIONAL_STATUS_FILTERS)[number]);
                      setPage(1);
                    }}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-teal-300"
                  >
                    {OPERATIONAL_STATUS_FILTERS.map((s) => (
                      <option key={s} value={s}>
                        {s === "All" ? "All Statuses" : formatLabel(s)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                    Admin Status
                  </label>
                  <select
                    value={adminStatusFilter}
                    onChange={(e) => {
                      setAdminStatusFilter(e.target.value as (typeof ADMIN_STATUS_FILTERS)[number]);
                      setPage(1);
                    }}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-teal-300"
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

          {isLoading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
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
                <table className="w-full min-w-[640px]">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/60">
                      <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                        S/No.
                      </th>
                      <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                        Barrier ID Number
                      </th>
                      <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                        Service Provider
                      </th>
                      <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                        Operational Status
                      </th>
                      <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                        Admin Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-12 text-center">
                          <DoorOpen className="mx-auto h-8 w-8 text-gray-300" />
                          <p className="mt-2 text-sm font-medium text-gray-400">No barriers found</p>
                          <p className="mt-1 text-xs text-gray-400">
                            Add a barrier to the catalog, then assign it from Infrastructure.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      items.map((item: BarrierRecord, index: number) => (
                        <tr key={item.id} className="hover:bg-gray-50/80">
                          <td className="px-4 py-3 text-xs text-gray-500">
                            {(currentPage - 1) * PAGE_SIZE + index + 1}
                          </td>
                          <td className="px-4 py-3 font-mono text-xs font-medium text-gray-900">
                            {item.barrier_id_number}
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-700">{item.service_provider_name}</td>
                          <td className="px-4 py-3">
                            <OperationalStatusBadge status={item.operational_status} />
                          </td>
                          <td className="px-4 py-3">
                            <AdminStatusBadge status={item.status} />
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
    </>
  );
}

export function useBarriersCount() {
  const { data } = useBarriers({ page: 1, limit: 1 });
  return data?.meta.total ?? 0;
}

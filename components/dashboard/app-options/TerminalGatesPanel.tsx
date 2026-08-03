"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  DoorOpen,
  Search,
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
import { useTerminalGates } from "@/hooks/terminal-gates/useTerminalGates";
import { useTerminalGate } from "@/hooks/terminal-gates/useTerminalGate";
import {
  useCreateTerminalGate,
  useDeleteTerminalGate,
  useUpdateTerminalGate,
} from "@/hooks/terminal-gates/useTerminalGateActions";
import { useLocations } from "@/hooks/locations/useLocations";
import { useTerminal } from "@/hooks/terminals/useTerminal";
import { TableActionsDropdown } from "@/components/dashboard/TableActionsDropdown";
import type { LocationRecord } from "@/types/locations.types";
import type { TerminalGate, TerminalGatePayload } from "@/types/terminal-gates.types";

const PAGE_SIZE = 20;

function displayOrDash(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : "—";
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
              danger ? "bg-red-600 hover:bg-red-700" : "bg-slate-600 hover:bg-slate-700"
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

function BarrierIdField({
  label,
  value,
  onChange,
  options,
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { id: string }[];
  error?: string;
}) {
  if (options.length > 0) {
    return (
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-gray-700">{label}</label>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-slate-500 ${
            error ? "border-red-300" : "border-gray-200 focus:border-slate-500"
          }`}
        >
          <option value="">Select barrier ID…</option>
          {options.map((barrier) => (
            <option key={barrier.id} value={barrier.id}>
              {barrier.id}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }

  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-gray-700">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Barrier ID"
        className={`w-full rounded-lg border px-3 py-2.5 font-mono text-sm outline-none focus:ring-1 focus:ring-slate-500 ${
          error ? "border-red-300" : "border-gray-200 focus:border-slate-500"
        }`}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

function TerminalGateFormModal({
  mode,
  gate,
  onClose,
  onSaved,
}: {
  mode: "create" | "edit";
  gate?: TerminalGate;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { data: detail, isLoading: detailLoading } = useTerminalGate(
    mode === "edit" && gate ? gate.id : null,
  );
  const { data: locationsData, isLoading: locationsLoading } = useLocations({
    page: 1,
    limit: 100,
    type: "TERMINAL_GATE",
  });
  const createGate = useCreateTerminalGate();
  const updateGate = useUpdateTerminalGate();

  const [location, setLocation] = useState("");
  const [selectedLocationId, setSelectedLocationId] = useState("");
  const [entryBarrierName, setEntryBarrierName] = useState("");
  const [entryBarrierId, setEntryBarrierId] = useState("");
  const [exitBarrierName, setExitBarrierName] = useState("");
  const [exitBarrierId, setExitBarrierId] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [initialized, setInitialized] = useState(false);

  const gateLocations = locationsData?.data ?? [];

  const selectedLocationRecord = useMemo(
    () => gateLocations.find((loc) => loc.id === selectedLocationId),
    [gateLocations, selectedLocationId],
  );

  const terminalId =
    selectedLocationRecord?.type === "TERMINAL_GATE" ? selectedLocationRecord.reference_id : null;

  const { data: terminalDetail } = useTerminal(terminalId);

  const entryBarrierOptions = terminalDetail?.entry_barriers ?? [];
  const exitBarrierOptions = terminalDetail?.exit_barriers ?? [];

  useEffect(() => {
    if (mode === "create") {
      if (!locationsLoading) setInitialized(true);
      return;
    }
    if (initialized) return;
    if (detailLoading && !detail) return;
    if (locationsLoading) return;

    const source = detail ?? gate;
    if (!source) return;

    setLocation(source.location ?? "");
    setEntryBarrierName(source.entry_barrier_name ?? "");
    setEntryBarrierId(source.entry_barrier_id ?? "");
    setExitBarrierName(source.exit_barrier_name ?? "");
    setExitBarrierId(source.exit_barrier_id ?? "");

    const matchedLocation = gateLocations.find(
      (loc) => loc.name === source.location || loc.id === source.location,
    );
    if (matchedLocation) {
      setSelectedLocationId(matchedLocation.id);
    }

    setInitialized(true);
  }, [
    mode,
    detail,
    detailLoading,
    gate,
    initialized,
    gateLocations,
    locationsLoading,
  ]);

  function handleLocationChange(locationId: string) {
    setSelectedLocationId(locationId);
    const record = gateLocations.find((loc) => loc.id === locationId);
    setLocation(record?.name ?? "");
    setEntryBarrierId("");
    setExitBarrierId("");
  }

  function validate() {
    const nextErrors: Record<string, string> = {};
    if (!location.trim()) nextErrors.location = "Location is required.";
    if (!entryBarrierName.trim()) nextErrors.entry_barrier_name = "Entry barrier name is required.";
    if (!entryBarrierId.trim()) nextErrors.entry_barrier_id = "Entry barrier ID is required.";
    if (!exitBarrierName.trim()) nextErrors.exit_barrier_name = "Exit barrier name is required.";
    if (!exitBarrierId.trim()) nextErrors.exit_barrier_id = "Exit barrier ID is required.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSave() {
    if (!validate()) return;

    const payload: TerminalGatePayload = {
      location: location.trim(),
      entry_barrier_name: entryBarrierName.trim(),
      entry_barrier_id: entryBarrierId.trim(),
      exit_barrier_name: exitBarrierName.trim(),
      exit_barrier_id: exitBarrierId.trim(),
    };

    if (mode === "create") {
      createGate.mutate(payload, {
        onSuccess: () => {
          toast.success("Terminal gate created successfully.");
          onSaved();
          onClose();
        },
      });
      return;
    }

    if (!gate) return;
    updateGate.mutate(
      { id: gate.id, payload },
      {
        onSuccess: () => {
          toast.success("Terminal gate updated successfully.");
          onSaved();
          onClose();
        },
      },
    );
  }

  const isPending = createGate.isPending || updateGate.isPending;

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/40" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-[70] flex max-h-[90vh] w-full max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col rounded-2xl border border-gray-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0f1e2e]">
              <DoorOpen className="h-4 w-4 text-slate-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">
                {mode === "create" ? "Add Terminal Gate" : "Edit Terminal Gate"}
              </h2>
              <p className="text-xs text-gray-500">
                {mode === "create"
                  ? "Configure entry and exit barriers for a location"
                  : gate?.location}
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
              <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-500" />
              Loading terminal gate...
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-700">
              Location <span className="text-red-500">*</span>
            </label>
            {locationsLoading ? (
              <p className="text-xs text-gray-500">Loading locations…</p>
            ) : gateLocations.length > 0 ? (
              <select
                value={selectedLocationId}
                onChange={(e) => handleLocationChange(e.target.value)}
                className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 ${
                  errors.location ? "border-red-300" : "border-gray-200"
                }`}
              >
                <option value="">Select terminal gate location…</option>
                {gateLocations.map((loc: LocationRecord) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
            ) : (
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Location name"
                className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 ${
                  errors.location ? "border-red-300" : "border-gray-200"
                }`}
              />
            )}
            {errors.location && <p className="mt-1 text-xs text-red-500">{errors.location}</p>}
            {gateLocations.length === 0 && !locationsLoading && (
              <p className="mt-1 text-[11px] text-gray-500">
                No TERMINAL_GATE locations found. Enter the location name manually or create one under
                Locations first.
              </p>
            )}
          </div>

          <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-4">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
              Entry Barrier
            </p>
            <div className="space-y-3">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                  Entry Barrier Name <span className="text-red-500">*</span>
                </label>
                <input
                  value={entryBarrierName}
                  onChange={(e) => setEntryBarrierName(e.target.value)}
                  placeholder="e.g. Gate 1 – Entry"
                  className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 ${
                    errors.entry_barrier_name ? "border-red-300" : "border-gray-200"
                  }`}
                />
                {errors.entry_barrier_name && (
                  <p className="mt-1 text-xs text-red-500">{errors.entry_barrier_name}</p>
                )}
              </div>
              <BarrierIdField
                label="Entry Barrier ID *"
                value={entryBarrierId}
                onChange={setEntryBarrierId}
                options={entryBarrierOptions}
                error={errors.entry_barrier_id}
              />
            </div>
          </div>

          <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-4">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
              Exit Barrier
            </p>
            <div className="space-y-3">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                  Exit Barrier Name <span className="text-red-500">*</span>
                </label>
                <input
                  value={exitBarrierName}
                  onChange={(e) => setExitBarrierName(e.target.value)}
                  placeholder="e.g. Gate 1 – Exit"
                  className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 ${
                    errors.exit_barrier_name ? "border-red-300" : "border-gray-200"
                  }`}
                />
                {errors.exit_barrier_name && (
                  <p className="mt-1 text-xs text-red-500">{errors.exit_barrier_name}</p>
                )}
              </div>
              <BarrierIdField
                label="Exit Barrier ID *"
                value={exitBarrierId}
                onChange={setExitBarrierId}
                options={exitBarrierOptions}
                error={errors.exit_barrier_id}
              />
            </div>
          </div>

          {terminalId && entryBarrierOptions.length === 0 && exitBarrierOptions.length === 0 && (
            <p className="text-[11px] text-gray-500">
              No barriers registered on the linked terminal yet. Enter barrier IDs manually.
            </p>
          )}
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
            className="flex items-center gap-2 rounded-lg bg-slate-600 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "create" ? "Create Terminal Gate" : "Save Changes"}
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
  item: TerminalGate;
  onAction: (action: "edit" | "delete", item: TerminalGate) => void;
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

export function TerminalGatesPanel() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [formMode, setFormMode] = useState<"create" | "edit" | null>(null);
  const [editTarget, setEditTarget] = useState<TerminalGate | null>(null);
  const [confirm, setConfirm] = useState<{
    title: string;
    message: string;
    confirmLabel: string;
    danger?: boolean;
    onConfirm: () => void;
  } | null>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [search]);

  const { data, isLoading, isError } = useTerminalGates({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
  });

  const deleteGate = useDeleteTerminalGate();

  const items = data?.data ?? [];
  const meta = data?.meta;
  const currentPage = meta?.page ?? page;
  const totalPages = meta?.total_pages ?? 1;

  function handleAction(action: "edit" | "delete", item: TerminalGate) {
    if (action === "edit") {
      setEditTarget(item);
      setFormMode("edit");
      return;
    }
    setConfirm({
      title: "Delete Terminal Gate",
      message: `Delete the gate configuration for "${item.location}" permanently? This cannot be undone.`,
      confirmLabel: "Delete",
      danger: true,
      onConfirm: () => {
        setConfirm(null);
        deleteGate.mutate(item.id, {
          onSuccess: () => toast.success(`Terminal gate for ${item.location} has been deleted.`),
        });
      },
    });
  }

  return (
    <>
      {confirm && (
        <ConfirmDialog
          {...confirm}
          isPending={deleteGate.isPending}
          onCancel={() => setConfirm(null)}
        />
      )}

      {formMode && (
        <TerminalGateFormModal
          mode={formMode}
          gate={formMode === "edit" ? editTarget ?? undefined : undefined}
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
            <div className="rounded-lg bg-slate-50 p-2.5">
              <DoorOpen className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">Terminal Gates</h2>
              <p className="text-xs text-gray-500">Entry and exit gate configurations by location</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-700">
              {meta?.total ?? 0} total
            </span>
            <button
              type="button"
              onClick={() => setFormMode("create")}
              className="flex items-center gap-1.5 rounded-lg bg-slate-600 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-slate-700"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Terminal Gate
            </button>
          </div>
        </div>

        <div className="border-b border-slate-100 bg-slate-50/40 px-5 py-3">
          <div className="flex items-start gap-2">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-600" />
            <p className="text-[11px] leading-relaxed text-slate-800">
              Link each terminal gate location to its entry and exit barrier names and IDs. Select a
              TERMINAL_GATE location to auto-load barrier IDs from the linked terminal when available.
            </p>
          </div>
        </div>

        <div className="border-b border-gray-100 px-5 py-3">
          <div className="relative min-w-50">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search terminal gates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-slate-300 focus:bg-white focus:ring-2 focus:ring-slate-100"
            />
          </div>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-slate-600" />
            <span className="ml-2 text-sm text-gray-500">Loading terminal gates…</span>
          </div>
        )}

        {isError && (
          <div className="flex items-center justify-center py-16">
            <p className="text-sm text-red-500">Failed to load terminal gates. Please try again.</p>
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
                      Location
                    </th>
                    <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                      Entry Barrier
                    </th>
                    <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                      Exit Barrier
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
                        <DoorOpen className="mx-auto h-8 w-8 text-gray-300" />
                        <p className="mt-2 text-sm font-medium text-gray-400">No terminal gates found</p>
                      </td>
                    </tr>
                  ) : (
                    items.map((item, index) => (
                      <tr key={item.id} className="transition-colors hover:bg-gray-50/80">
                        <td className="px-4 py-3 text-xs text-gray-500">
                          {(currentPage - 1) * PAGE_SIZE + index + 1}
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs font-medium text-gray-900">{displayOrDash(item.location)}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs font-medium text-gray-900">
                            {displayOrDash(item.entry_barrier_name)}
                          </p>
                          <p className="mt-0.5 font-mono text-[10px] text-gray-500">
                            {displayOrDash(item.entry_barrier_id)}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs font-medium text-gray-900">
                            {displayOrDash(item.exit_barrier_name)}
                          </p>
                          <p className="mt-0.5 font-mono text-[10px] text-gray-500">
                            {displayOrDash(item.exit_barrier_id)}
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
                of <span className="font-medium text-gray-700">{meta?.total ?? 0}</span> gates
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
                          ? "bg-slate-600 text-white"
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

export function useTerminalGatesCount() {
  const { data } = useTerminalGates({ page: 1, limit: 1 });
  return data?.meta.total ?? 0;
}

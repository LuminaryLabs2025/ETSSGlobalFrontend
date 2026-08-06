"use client";

import { useState } from "react";
import { ChevronDown, DoorOpen, Loader2, Plus, X } from "lucide-react";
import type {
  CreateFacilityPayload,
  FacilityParkType,
  FacilitySubType,
} from "@/types/facilities.types";
import { useCreateFacility } from "@/hooks/facilities/useFacilityActions";
import { useBarriers } from "@/hooks/barriers/useBarriers";
import {
  barrierOverlapError,
  findOverlappingBarrierIds,
  toggleBarrierSelection,
} from "@/lib/barrier-assignment";

const FACILITY_FORM_TYPES = [
  { value: "FACILITY", label: "Facility" },
  { value: "FACILITY_PREGATE", label: "Facility Pregate" },
] as const;

const FACILITY_FORM_LOCATIONS = [
  { value: "APAPA", label: "Apapa Zone" },
  { value: "TINCAN", label: "Tincan Zone" },
] as const;

function fieldInputClass(hasError: boolean) {
  return `w-full rounded-lg border bg-gray-50 px-3 py-2 text-sm outline-none focus:border-emerald-300 focus:bg-white focus:ring-2 focus:ring-emerald-100 ${
    hasError ? "border-red-300" : "border-gray-200"
  }`;
}

type FacilityFormModalProps = {
  defaultParkType: FacilityParkType;
  entityLabel: string;
  addLabel: string;
  onClose: () => void;
  onSaved?: () => void;
};

export function FacilityFormModal({
  defaultParkType,
  entityLabel,
  addLabel,
  onClose,
  onSaved,
}: FacilityFormModalProps) {
  const createFacility = useCreateFacility();
  const { data: barriersData, isLoading: barriersLoading } = useBarriers({
    limit: 100,
    status: "ACTIVE",
  });

  const [name, setName] = useState("");
  const [facilityType, setFacilityType] = useState<FacilitySubType>("FACILITY");
  const [location, setLocation] = useState("APAPA");
  const [address, setAddress] = useState("");
  const [truckCapacity, setTruckCapacity] = useState("0");
  const [trucksPerHour, setTrucksPerHour] = useState("0");
  const [bayCapacity, setBayCapacity] = useState("0");
  const [dailyEvacuationLimit, setDailyEvacuationLimit] = useState("0");
  const [status, setStatus] = useState<CreateFacilityPayload["status"]>("ACTIVE");
  const [entryBarrierIds, setEntryBarrierIds] = useState<Set<string>>(new Set());
  const [exitBarrierIds, setExitBarrierIds] = useState<Set<string>>(new Set());
  const [entryBarrierMenuOpen, setEntryBarrierMenuOpen] = useState(false);
  const [exitBarrierMenuOpen, setExitBarrierMenuOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const barrierOptions = barriersData?.data ?? [];

  function toggleEntryBarrier(id: string) {
    const { selected, otherSelected } = toggleBarrierSelection(id, entryBarrierIds, exitBarrierIds);
    setEntryBarrierIds(selected);
    setExitBarrierIds(otherSelected);
    setErrors((prev) => {
      if (!prev.barriers) return prev;
      const { barriers, ...rest } = prev;
      return rest;
    });
  }

  function toggleExitBarrier(id: string) {
    const { selected, otherSelected } = toggleBarrierSelection(id, exitBarrierIds, entryBarrierIds);
    setExitBarrierIds(selected);
    setEntryBarrierIds(otherSelected);
    setErrors((prev) => {
      if (!prev.barriers) return prev;
      const { barriers, ...rest } = prev;
      return rest;
    });
  }

  function resolveBarrierLabel(id: string) {
    return barrierOptions.find((barrier) => barrier.id === id)?.barrier_id_number ?? id;
  }

  const selectedEntryBarrierLabels = Array.from(entryBarrierIds).map(resolveBarrierLabel);
  const selectedExitBarrierLabels = Array.from(exitBarrierIds).map(resolveBarrierLabel);

  function validateNonNegative(value: string, key: string, label: string, bag: Record<string, string>) {
    const num = Number(value);
    if (value.trim() === "" || Number.isNaN(num) || num < 0) {
      bag[key] = `Enter a valid ${label} (0 or greater).`;
    }
  }

  function validate() {
    const nextErrors: Record<string, string> = {};
    if (!name.trim()) nextErrors.name = "Facility name is required.";
    if (!address.trim()) nextErrors.address = "Address is required.";
    validateNonNegative(truckCapacity, "truckCapacity", "truck capacity", nextErrors);
    validateNonNegative(trucksPerHour, "trucksPerHour", "trucks-per-hour value", nextErrors);
    validateNonNegative(bayCapacity, "bayCapacity", "bay capacity", nextErrors);
    validateNonNegative(dailyEvacuationLimit, "dailyEvacuationLimit", "daily evacuation limit", nextErrors);
    const overlapError = barrierOverlapError(
      findOverlappingBarrierIds(entryBarrierIds, exitBarrierIds),
    );
    if (overlapError) nextErrors.barriers = overlapError;
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function buildPayload(): CreateFacilityPayload {
    return {
      name: name.trim(),
      park_type: defaultParkType,
      facility_type: facilityType,
      location,
      address: address.trim(),
      approved_truck_capacity: Number(truckCapacity),
      approved_truck_exits_per_hour: Number(trucksPerHour),
      bay_capacity: Number(bayCapacity),
      daily_empty_evacuation_limit: Number(dailyEvacuationLimit),
      status,
      entry_barrier_ids: Array.from(entryBarrierIds),
      exit_barrier_ids: Array.from(exitBarrierIds),
    };
  }

  function handleSave() {
    if (!validate()) return;
    createFacility.mutate(buildPayload(), {
      onSuccess: () => {
        onSaved?.();
        onClose();
      },
    });
  }

  function renderBarrierSelect({
    label,
    selectedIds,
    selectedLabels,
    menuOpen,
    setMenuOpen,
    onToggle,
    badgeClass,
  }: {
    label: string;
    selectedIds: Set<string>;
    selectedLabels: string[];
    menuOpen: boolean;
    setMenuOpen: (open: boolean) => void;
    onToggle: (id: string) => void;
    badgeClass: string;
  }) {
    return (
      <div>
        <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-gray-500">
          {label}
        </label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            disabled={barriersLoading}
            className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-left text-sm outline-none focus:border-emerald-300 focus:bg-white focus:ring-2 focus:ring-emerald-100 disabled:opacity-60"
          >
            <span className={selectedLabels.length > 0 ? "text-gray-900" : "text-gray-400"}>
              {barriersLoading
                ? "Loading barriers..."
                : selectedLabels.length > 0
                  ? selectedLabels.join(", ")
                  : `Select ${label.toLowerCase()}...`}
            </span>
            <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${menuOpen ? "rotate-180" : ""}`} />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute bottom-full left-0 right-0 z-20 mb-1 max-h-48 overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                {barrierOptions.length === 0 ? (
                  <p className="px-3 py-2.5 text-sm text-gray-400">No active barriers available.</p>
                ) : (
                  barrierOptions.map((barrier) => (
                    <label
                      key={barrier.id}
                      className="flex cursor-pointer items-center gap-2.5 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.has(barrier.id)}
                        onChange={() => onToggle(barrier.id)}
                        className="h-3.5 w-3.5 rounded border-gray-300 accent-emerald-600"
                      />
                      <span className="min-w-0">
                        <span className="font-mono text-xs font-medium">{barrier.barrier_id_number}</span>
                        <span className="ml-1.5 text-[11px] text-gray-400">{barrier.service_provider_name}</span>
                      </span>
                    </label>
                  ))
                )}
              </div>
            </>
          )}
        </div>
        {selectedIds.size > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {selectedLabels.map((barrierLabel) => (
              <span
                key={barrierLabel}
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-mono text-[11px] font-medium ${badgeClass}`}
              >
                <DoorOpen className="h-3 w-3" />
                {barrierLabel}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/40" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-[70] flex max-h-[90vh] w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 flex-col rounded-2xl border border-gray-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0f1e2e]">
              <Plus className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">{addLabel}</h2>
              <p className="text-xs text-gray-500">
                Register a new {entityLabel.toLowerCase()} with capacity settings and barrier assignments
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={`e.g. Apapa ${entityLabel}`}
                className={fieldInputClass(!!errors.name)}
              />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                Facility Type <span className="text-red-500">*</span>
              </label>
              <select
                value={facilityType}
                onChange={(e) => setFacilityType(e.target.value as FacilitySubType)}
                className={fieldInputClass(false)}
              >
                {FACILITY_FORM_TYPES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                Location <span className="text-red-500">*</span>
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className={fieldInputClass(false)}
              >
                {FACILITY_FORM_LOCATIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                Address <span className="text-red-500">*</span>
              </label>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Full facility address"
                className={fieldInputClass(!!errors.address)}
              />
              {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                Approved Truck Capacity
              </label>
              <input
                type="number"
                min={0}
                value={truckCapacity}
                onChange={(e) => setTruckCapacity(e.target.value)}
                className={fieldInputClass(!!errors.truckCapacity)}
              />
              {errors.truckCapacity && <p className="mt-1 text-xs text-red-500">{errors.truckCapacity}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                Trucks Exits Per Hour
              </label>
              <input
                type="number"
                min={0}
                value={trucksPerHour}
                onChange={(e) => setTrucksPerHour(e.target.value)}
                className={fieldInputClass(!!errors.trucksPerHour)}
              />
              {errors.trucksPerHour && <p className="mt-1 text-xs text-red-500">{errors.trucksPerHour}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                Bay Capacity
              </label>
              <input
                type="number"
                min={0}
                value={bayCapacity}
                onChange={(e) => setBayCapacity(e.target.value)}
                className={fieldInputClass(!!errors.bayCapacity)}
              />
              {errors.bayCapacity && <p className="mt-1 text-xs text-red-500">{errors.bayCapacity}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                Daily Empty Evacuation Limit
              </label>
              <input
                type="number"
                min={0}
                value={dailyEvacuationLimit}
                onChange={(e) => setDailyEvacuationLimit(e.target.value)}
                className={fieldInputClass(!!errors.dailyEvacuationLimit)}
              />
              {errors.dailyEvacuationLimit && (
                <p className="mt-1 text-xs text-red-500">{errors.dailyEvacuationLimit}</p>
              )}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-gray-500">
              Operational Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as CreateFacilityPayload["status"])}
              className={fieldInputClass(false)}
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>

          {renderBarrierSelect({
            label: "Entry Barriers",
            selectedIds: entryBarrierIds,
            selectedLabels: selectedEntryBarrierLabels,
            menuOpen: entryBarrierMenuOpen,
            setMenuOpen: setEntryBarrierMenuOpen,
            onToggle: toggleEntryBarrier,
            badgeClass: "bg-blue-50 text-blue-700",
          })}

          {renderBarrierSelect({
            label: "Exit Barriers",
            selectedIds: exitBarrierIds,
            selectedLabels: selectedExitBarrierLabels,
            menuOpen: exitBarrierMenuOpen,
            setMenuOpen: setExitBarrierMenuOpen,
            onToggle: toggleExitBarrier,
            badgeClass: "bg-violet-50 text-violet-700",
          })}

          <p className="text-[11px] text-gray-400">
            Create barriers under Infrastructure → Barriers first, then assign them here. A barrier
            cannot be both entry and exit — selecting it in one list removes it from the other.
          </p>
          {errors.barriers && <p className="text-xs text-red-500">{errors.barriers}</p>}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={createFacility.isPending}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={createFacility.isPending}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {createFacility.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {addLabel}
          </button>
        </div>
      </div>
    </>
  );
}

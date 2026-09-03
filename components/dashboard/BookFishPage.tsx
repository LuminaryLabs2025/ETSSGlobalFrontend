"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Fish,
  ChevronRight,
  Search,
  ChevronDown,
  Truck,
  Calendar,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth.store";
import {
  flattenBookingOptions,
  formatAssistDateLong,
  formatAssistDateShort,
  mapPreviewFee,
  stripGroupedLabel,
} from "@/lib/booking-form-utils";
import { useCompanies } from "@/hooks/companies/useCompanies";
import { useFacilities } from "@/hooks/facilities/useFacilities";
import { useTerminals } from "@/hooks/terminals/useTerminals";
import { useTruckBookingOptions } from "@/hooks/booking-creation/useTruckBookingOptions";
import { useDriverBookingOptions } from "@/hooks/booking-creation/useDriverBookingOptions";
import {
  useConfirmBookingPayment,
  useCreateBooking,
  usePreviewBooking,
} from "@/hooks/booking-creation/useBookingCreationMutations";
import type { BookingPreview, CreateFishBookingRequest } from "@/types/booking-creation.types";
import {
  PaymentSummaryPanel,
  BookingPaymentSuccessModal,
  SuperAdminGate,
  type PaymentMethod,
} from "@/components/dashboard/book-assist/BookAssistUi";

type Step = 1 | 2;
type TerminalZone = "APAPA" | "TINCAN";

interface SelectOption {
  value: string;
  label: string;
}

interface GroupedSelectOption extends SelectOption {
  group: "mine" | "public";
}

interface SearchableSelectProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  required?: boolean;
  disabled?: boolean;
  searchPlaceholder?: string;
}

interface SearchableGroupedSelectProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  options: GroupedSelectOption[];
  mineSectionLabel: string;
  publicSectionLabel: string;
  required?: boolean;
  disabled?: boolean;
  searchPlaceholder?: string;
}

function useClickOutside(ref: React.RefObject<HTMLElement | null>, onClose: () => void) {
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [ref, onClose]);
}

function SearchableSelect({
  label,
  placeholder,
  value,
  onChange,
  options,
  required,
  disabled,
  searchPlaceholder = "Type to filter…",
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useClickOutside(containerRef, () => {
    setOpen(false);
    setQuery("");
  });

  const selected = options.find((o) => o.value === value);
  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <div ref={containerRef} className="relative">
      <label className="mb-1.5 block text-xs font-semibold text-gray-700">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((v) => !v)}
        className={`flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ${
          disabled
            ? "cursor-not-allowed border-gray-100 bg-gray-50 text-gray-400"
            : open
              ? "border-emerald-500 ring-1 ring-emerald-500"
              : "border-gray-200 bg-white text-gray-900 hover:border-gray-300"
        }`}
      >
        <span className={selected ? "text-gray-900" : "text-gray-400"}>
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute z-30 mt-1 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
          <div className="border-b border-gray-100 p-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full rounded-md border border-gray-200 py-2 pl-8 pr-3 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>
          <ul className="max-h-52 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-gray-400">No matches found</li>
            ) : (
              filtered.map((opt) => (
                <li key={opt.value}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setOpen(false);
                      setQuery("");
                    }}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-emerald-50 ${
                      opt.value === value ? "bg-emerald-50 font-medium text-emerald-800" : "text-gray-700"
                    }`}
                  >
                    {opt.label}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

function SearchableGroupedSelect({
  label,
  placeholder,
  value,
  onChange,
  options,
  mineSectionLabel,
  publicSectionLabel,
  required,
  disabled,
  searchPlaceholder = "Type to filter…",
}: SearchableGroupedSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useClickOutside(containerRef, () => {
    setOpen(false);
    setQuery("");
  });

  const selected = options.find((o) => o.value === value);
  const q = query.trim().toLowerCase();
  const filtered = options.filter((o) => o.label.toLowerCase().includes(q));
  const mineOptions = filtered.filter((o) => o.group === "mine");
  const publicOptions = filtered.filter((o) => o.group === "public");

  function renderGroup(title: string, items: GroupedSelectOption[]) {
    if (items.length === 0) return null;
    return (
      <>
        <li className="sticky top-0 bg-gray-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-500">
          {title}
        </li>
        {items.map((opt) => (
          <li key={opt.value}>
            <button
              type="button"
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
                setQuery("");
              }}
              className={`w-full px-3 py-2 text-left text-sm hover:bg-emerald-50 ${
                opt.value === value ? "bg-emerald-50 font-medium text-emerald-800" : "text-gray-700"
              }`}
            >
              {opt.label}
            </button>
          </li>
        ))}
      </>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <label className="mb-1.5 block text-xs font-semibold text-gray-700">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((v) => !v)}
        className={`flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ${
          disabled
            ? "cursor-not-allowed border-gray-100 bg-gray-50 text-gray-400"
            : open
              ? "border-emerald-500 ring-1 ring-emerald-500"
              : "border-gray-200 bg-white text-gray-900 hover:border-gray-300"
        }`}
      >
        <span className={selected ? "text-gray-900" : "text-gray-400"}>
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute z-30 mt-1 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
          <div className="border-b border-gray-100 p-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full rounded-md border border-gray-200 py-2 pl-8 pr-3 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>
          <ul className="max-h-60 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-gray-400">No matches found</li>
            ) : (
              <>
                {renderGroup(mineSectionLabel, mineOptions)}
                {renderGroup(publicSectionLabel, publicOptions)}
              </>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

function StepIndicator({ step }: { step: Step }) {
  const steps = [
    { num: 1, label: "Booking Details" },
    { num: 2, label: "Preview" },
  ] as const;

  return (
    <div className="flex items-center justify-center gap-0">
      {steps.map((s, i) => (
        <div key={s.num} className="flex items-center">
          <div className="flex items-center gap-2">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                step >= s.num ? "bg-emerald-600 text-white" : "bg-gray-200 text-gray-500"
              }`}
            >
              {s.num}
            </div>
            <span
              className={`text-xs font-semibold ${
                step >= s.num ? "text-emerald-700" : "text-gray-400"
              }`}
            >
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`mx-4 h-0.5 w-16 sm:w-24 ${
                step > s.num ? "bg-emerald-500" : "bg-gray-200"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function PreviewDataCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="relative flex-1 border-l-2 border-emerald-500 pl-3 first:border-l-0 first:pl-0">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-gray-900">{value}</p>
    </div>
  );
}

export function BookFishPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isSuperAdmin = user?.is_super_admin ?? false;

  const [step, setStep] = useState<Step>(1);
  const [transporterId, setTransporterId] = useState("");
  const [truckId, setTruckId] = useState("");
  const [driverId, setDriverId] = useState("");
  const [terminalZone, setTerminalZone] = useState<TerminalZone | "">("");
  const [terminalId, setTerminalId] = useState("");
  const [facilityId, setFacilityId] = useState("");
  const [arrivalDate, setArrivalDate] = useState("");
  const [gatePass, setGatePass] = useState("");

  const [preview, setPreview] = useState<BookingPreview | null>(null);
  const [createdBookingId, setCreatedBookingId] = useState<string | null>(null);

  const [paymentSuccess, setPaymentSuccess] = useState<{
    booking_id: string;
    journey_code: string;
  } | null>(null);

  const [detailsConfirmed, setDetailsConfirmed] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("wallet");

  const { data: transporters = [] } = useCompanies({ user_type_slug: "transporter" });
  const { data: facilitiesData } = useFacilities({ park_type: "FISH_VAN_PARK", limit: 100 });
  const terminalParams = useMemo(
    () =>
      terminalZone
        ? { type: "PORT_TERMINAL" as const, location: terminalZone, limit: 100 }
        : undefined,
    [terminalZone],
  );
  const { data: terminalsData } = useTerminals(terminalParams);
  const { data: truckOptionsData } = useTruckBookingOptions({ transporter_company_id: transporterId });
  const { data: driverOptionsData } = useDriverBookingOptions({ transporter_company_id: transporterId });

  const previewMutation = usePreviewBooking("fish");
  const createMutation = useCreateBooking("fish");
  const confirmPaymentMutation = useConfirmBookingPayment();

  const transporterName =
    transporters.find((t) => t.id === transporterId)?.name ??
    preview?.transporter_company.name ??
    "";

  const truckOptions = useMemo(
    () => flattenBookingOptions(truckOptionsData) as GroupedSelectOption[],
    [truckOptionsData],
  );
  const driverOptions = useMemo(
    () => flattenBookingOptions(driverOptionsData) as GroupedSelectOption[],
    [driverOptionsData],
  );

  const selectedTruck = truckOptions.find((t) => t.value === truckId);
  const selectedDriver = driverOptions.find((d) => d.value === driverId);

  const portTerminalOptions = useMemo(
    () => (terminalsData?.data ?? []).map((t) => ({ value: t.id, label: t.name })),
    [terminalsData],
  );

  const portTerminalName =
    terminalsData?.data.find((t) => t.id === terminalId)?.name ?? preview?.terminal.name ?? "";

  const facilityOptions = useMemo(
    () => (facilitiesData?.data ?? []).map((f) => ({ value: f.id, label: f.name })),
    [facilitiesData],
  );

  const facilityName =
    facilitiesData?.data.find((f) => f.id === facilityId)?.name ?? preview?.facility?.name ?? "";

  const transporterOptions = transporters.map((t) => ({ value: t.id, label: t.name }));

  const paymentFee = mapPreviewFee(preview?.fee);

  const bookedByName = user ? `${user.first_name} ${user.last_name}` : "SuperAdmin";
  const createdLabel = formatAssistDateShort(new Date().toISOString());

  function buildPayload(): CreateFishBookingRequest {
    const payload: CreateFishBookingRequest = {
      facility_id: facilityId,
      transporter_company_id: transporterId,
      truck_id: truckId,
      driver_id: driverId,
      terminal_id: terminalId,
      expected_arrival_date: arrivalDate,
    };
    if (gatePass.trim()) {
      payload.gate_pass_number = gatePass.trim();
    }
    return payload;
  }

  function handleTransporterChange(id: string) {
    setTransporterId(id);
    setTruckId("");
    setDriverId("");
  }

  function handleTerminalZoneChange(zone: TerminalZone) {
    setTerminalZone(zone);
    setTerminalId("");
  }

  function validateStep1(): boolean {
    if (!transporterId) {
      toast.error("Please select a transporter.");
      return false;
    }
    if (!truckId) {
      toast.error("Please select a truck.");
      return false;
    }
    if (!driverId) {
      toast.error("Please select a driver.");
      return false;
    }
    if (!terminalZone) {
      toast.error("Please select a terminal location.");
      return false;
    }
    if (!terminalId) {
      toast.error("Please select a port terminal destination.");
      return false;
    }
    if (!facilityId) {
      toast.error("Please select a fish-van park facility.");
      return false;
    }
    if (!arrivalDate) {
      toast.error("Please select an expected arrival date.");
      return false;
    }
    if (!gatePass.trim()) {
      toast.error("Please enter the truck entry permit (GatePass) number.");
      return false;
    }
    return true;
  }

  async function handleProceedToPreview() {
    if (!validateStep1()) return;
    setDetailsConfirmed(false);
    setTermsAccepted(false);
    setCreatedBookingId(null);

    try {
      const result = await previewMutation.mutateAsync(buildPayload());
      setPreview(result);
      setStep(2);
    } catch {
      // toast handled in mutation
    }
  }

  function handleGoBack() {
    setStep(1);
    setDetailsConfirmed(false);
    setTermsAccepted(false);
    setCreatedBookingId(null);
  }

  async function handleConfirmDetails() {
    try {
      const booking = await createMutation.mutateAsync(buildPayload());
      setCreatedBookingId(booking.id);
      setDetailsConfirmed(true);
      toast.success("Booking details confirmed. You may now proceed to payment.");
    } catch {
      // toast handled in mutation
    }
  }

  async function handleProceedToPay() {
    if (!detailsConfirmed) {
      toast.error("Please confirm booking details first.");
      return;
    }
    if (!termsAccepted) {
      toast.error("Please accept the Maritime-ETSS terms and conditions.");
      return;
    }
    if (!createdBookingId) {
      toast.error("Booking not found. Please confirm details again.");
      return;
    }

    try {
      const booking = await confirmPaymentMutation.mutateAsync({
        id: createdBookingId,
        payload: {
          payment_method: paymentMethod === "wallet" ? "WALLET" : "PAYSTACK",
          terms_accepted: true,
        },
      });
      setPaymentSuccess({
        booking_id: booking.booking_id,
        journey_code: booking.journey_code,
      });
    } catch {
      // toast handled in mutation
    }
  }

  const isPreviewLoading = previewMutation.isPending;
  const isCreating = createMutation.isPending;
  const isPaying = confirmPaymentMutation.isPending;

  if (!isSuperAdmin) {
    return <SuperAdminGate featureLabel="Book Fish" />;
  }

  return (
    <div className="space-y-5 p-6">
      <nav className="flex items-center gap-1.5 text-xs text-gray-500">
        <Link href="/dashboard/bookings/all" className="hover:text-gray-700">
          Operations
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/dashboard/bookings/all" className="hover:text-gray-700">
          Bookings
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="font-semibold text-gray-800">Book Fish</span>
      </nav>

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0f1e2e]">
              <Fish className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Book Fish</h1>
              <p className="text-xs text-gray-500">
                Assist transporters with fish-van park bookings
              </p>
            </div>
          </div>
          <StepIndicator step={step} />
        </div>
      </div>

      {step === 1 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-1 text-sm font-bold text-gray-900">Booking Details</h2>
          <p className="mb-6 text-xs text-gray-500">
            Select the transporter and trip details on their behalf
          </p>

          <div className="grid gap-5 sm:grid-cols-2">
            <SearchableSelect
              label="Select Transporter"
              placeholder="Choose transporter…"
              value={transporterId}
              onChange={handleTransporterChange}
              options={transporterOptions}
              searchPlaceholder="Search transporters…"
              required
            />

            <SearchableGroupedSelect
              label="Select Truck"
              placeholder={transporterId ? "Choose truck…" : "Select transporter first"}
              value={truckId}
              onChange={setTruckId}
              options={truckOptions}
              mineSectionLabel="My Available Trucks"
              publicSectionLabel="Public Listed Trucks"
              searchPlaceholder="Search plate numbers…"
              required
              disabled={!transporterId}
            />

            <SearchableGroupedSelect
              label="Select Driver"
              placeholder={transporterId ? "Choose driver…" : "Select transporter first"}
              value={driverId}
              onChange={setDriverId}
              options={driverOptions}
              mineSectionLabel="My Available Drivers"
              publicSectionLabel="Public Listed Drivers"
              searchPlaceholder="Search driver names…"
              required
              disabled={!transporterId}
            />

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                Select Terminal Location <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                {(["APAPA", "TINCAN"] as TerminalZone[]).map((zone) => (
                  <button
                    key={zone}
                    type="button"
                    onClick={() => handleTerminalZoneChange(zone)}
                    className={`flex-1 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                      terminalZone === zone
                        ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {zone === "APAPA" ? "Apapa (Port-Terminals)" : "Tincan (Port-Terminals)"}
                  </button>
                ))}
              </div>
            </div>

            <SearchableSelect
              label="Port Terminal Destination"
              placeholder={terminalZone ? "Choose port terminal…" : "Select terminal location first"}
              value={terminalId}
              onChange={setTerminalId}
              options={portTerminalOptions}
              searchPlaceholder="Search terminals…"
              required
              disabled={!terminalZone}
            />

            <SearchableSelect
              label="Facility"
              placeholder="Choose fish-van park…"
              value={facilityId}
              onChange={setFacilityId}
              options={facilityOptions}
              searchPlaceholder="Search fish-van parks…"
              required
            />

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                Expected Arrival Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="date"
                  value={arrivalDate}
                  min={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => setArrivalDate(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                Truck Entry Permit (GatePass #) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={gatePass}
                onChange={(e) => setGatePass(e.target.value.toUpperCase())}
                placeholder="e.g. APMT1234567890"
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm uppercase outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="button"
              onClick={handleProceedToPreview}
              disabled={isPreviewLoading}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
            >
              {isPreviewLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Proceed To Preview Data
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-5">
          {/* Preview column */}
          <div className="space-y-4 lg:col-span-3">
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="text-sm font-bold text-gray-900">Preview Details</h2>

              <div className="mt-4 grid gap-3 rounded-lg bg-gray-50 p-4 text-sm sm:grid-cols-2">
                <div>
                  <span className="text-gray-500">Booked By:</span>{" "}
                  <span className="font-semibold text-gray-900">
                    {bookedByName} (SuperAdmin)
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">On behalf of:</span>{" "}
                  <span className="font-semibold text-gray-900">{transporterName}</span>
                </div>
                <div>
                  <span className="text-gray-500">Vehicle Plate Number:</span>{" "}
                  <span className="font-semibold text-gray-900">
                    {preview?.truck.plate_number ??
                      (selectedTruck ? stripGroupedLabel(selectedTruck.label) : "—")}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Destination:</span>{" "}
                  <span className="font-semibold text-gray-900">{portTerminalName}</span>
                </div>
              </div>

              <div className="mt-6 flex flex-col items-center py-4">
                <div className="flex h-28 w-28 items-center justify-center rounded-2xl border-2 border-dashed border-teal-200 bg-teal-50">
                  <Fish className="h-16 w-16 text-teal-500" strokeWidth={1.2} />
                </div>
                <p className="mt-3 text-sm font-bold text-gray-900">
                  GatePass #:{" "}
                  <span className="text-emerald-700">
                    {preview?.gate_pass_number ?? gatePass}
                  </span>
                </p>
                <p className="mt-0.5 text-[10px] uppercase tracking-wider text-gray-400">
                  {preview?.booking_category_ref?.name ?? "Fish"} · GatePass
                </p>
              </div>

              <div className="mt-4 space-y-4">
                <div className="flex flex-wrap gap-4">
                  <PreviewDataCell
                    label="Truck Plate Number"
                    value={
                      preview?.truck.plate_number ??
                      (selectedTruck ? stripGroupedLabel(selectedTruck.label) : "—")
                    }
                  />
                  <PreviewDataCell
                    label="Driver's Name"
                    value={
                      preview?.driver.name ??
                      (selectedDriver ? stripGroupedLabel(selectedDriver.label) : "—")
                    }
                  />
                  <PreviewDataCell label="Port Terminal Destination" value={portTerminalName} />
                </div>
                <div className="flex flex-wrap gap-4">
                  <PreviewDataCell label="Facility" value={facilityName || "—"} />
                  <PreviewDataCell
                    label="Booking Category"
                    value={preview?.booking_category_ref?.name ?? "Fish"}
                  />
                  <PreviewDataCell
                    label="Arrival Date"
                    value={formatAssistDateLong(preview?.expected_arrival_date ?? arrivalDate)}
                  />
                </div>
              </div>

              {/* Trip roadmap */}
              <div className="mt-8">
                <p className="mb-4 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                  Trip Roadmap
                </p>
                <div className="relative flex items-center justify-between px-2">
                  <div className="text-center">
                    <p className="text-[10px] font-semibold uppercase text-gray-400">Created</p>
                    <p className="text-sm font-bold text-gray-900">{createdLabel}</p>
                  </div>
                  <div className="relative mx-4 flex flex-1 items-center">
                    <div className="h-0.5 w-full border-t-2 border-dashed border-emerald-300" />
                    <div className="absolute left-1/2 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full bg-emerald-600 shadow-md">
                      <Truck className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-semibold uppercase text-gray-400">{portTerminalName}</p>
                    <p className="text-sm font-bold text-gray-900">
                      {formatAssistDateShort(preview?.expected_arrival_date ?? arrivalDate)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button
                  type="button"
                  onClick={handleGoBack}
                  className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Go Back
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDetails}
                  disabled={detailsConfirmed || isCreating}
                  className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors ${
                    detailsConfirmed
                      ? "cursor-default bg-emerald-100 text-emerald-700"
                      : "bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
                  }`}
                >
                  {isCreating ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Loader2 className="h-4 w-4 animate-spin" /> Confirming…
                    </span>
                  ) : detailsConfirmed ? (
                    <span className="inline-flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4" /> Details Confirmed
                    </span>
                  ) : (
                    "Confirm Details"
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <PaymentSummaryPanel
              detailsConfirmed={detailsConfirmed}
              termsAccepted={termsAccepted}
              onTermsChange={setTermsAccepted}
              paymentMethod={paymentMethod}
              onPaymentMethodChange={setPaymentMethod}
              onProceedToPay={handleProceedToPay}
              isPaying={isPaying}
              fee={paymentFee}
            />
          </div>
        </div>
      )}
      {paymentSuccess && (
        <BookingPaymentSuccessModal
          bookingId={paymentSuccess.booking_id}
          journeyCode={paymentSuccess.journey_code}
          message="Your fish booking payment has been confirmed."
          onContinue={() => router.push("/dashboard/bookings/all")}
        />
      )}
    </div>
  );
}

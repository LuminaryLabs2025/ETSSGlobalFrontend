"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Truck, Calendar, CheckCircle2, Container, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth.store";
import {
  DEFAULT_EPT_ARRIVAL_TIME,
  EPT_OPERATION_TYPES,
  EXPORT_TYPES,
} from "@/lib/booking-form-constants";
import {
  flattenBookingOptions,
  formatAssistDateLong,
  formatAssistDateShort,
  mapPreviewFee,
  stripGroupedLabel,
} from "@/lib/booking-form-utils";
import { useCompanies } from "@/hooks/companies/useCompanies";
import { useTerminals } from "@/hooks/terminals/useTerminals";
import { useTransitParks } from "@/hooks/transit-parks/useTransitParks";
import { useTruckBookingOptions } from "@/hooks/booking-creation/useTruckBookingOptions";
import { useDriverBookingOptions } from "@/hooks/booking-creation/useDriverBookingOptions";
import {
  useConfirmBookingPayment,
  useCreateBooking,
  usePreviewBooking,
} from "@/hooks/booking-creation/useBookingCreationMutations";
import type { BookingPreview, CreateEptBookingRequest } from "@/types/booking-creation.types";
import {
  BookAssistBreadcrumb,
  BookingPaymentSuccessModal,
  PaymentSummaryPanel,
  PreviewDataCell,
  SearchableGroupedSelect,
  SearchableSelect,
  StepIndicator,
  SuperAdminGate,
  TerminalZoneToggle,
  type PaymentMethod,
} from "@/components/dashboard/book-assist/BookAssistUi";

type Step = 1 | 2;

export function BookEPTPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isSuperAdmin = user?.is_super_admin ?? false;

  const [step, setStep] = useState<Step>(1);
  const [transporterId, setTransporterId] = useState("");
  const [exportType, setExportType] = useState("");
  const [truckId, setTruckId] = useState("");
  const [driverId, setDriverId] = useState("");
  const [terminalZone, setTerminalZone] = useState<"" | "APAPA" | "TINCAN">("");
  const [eptId, setEptId] = useState("");
  const [operationType, setOperationType] = useState("");
  const [terminalId, setTerminalId] = useState("");
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
  const { data: truckOptionsData } = useTruckBookingOptions({ transporter_company_id: transporterId });
  const { data: driverOptionsData } = useDriverBookingOptions({ transporter_company_id: transporterId });

  const eptParams = useMemo(
    () =>
      terminalZone
        ? { type: "EPT" as const, location: terminalZone, limit: 100 }
        : undefined,
    [terminalZone],
  );
  const terminalParams = useMemo(
    () =>
      terminalZone
        ? { type: "PORT_TERMINAL" as const, location: terminalZone, limit: 100 }
        : undefined,
    [terminalZone],
  );

  const { data: eptData } = useTransitParks(eptParams);
  const { data: terminalsData } = useTerminals(terminalParams);

  const previewMutation = usePreviewBooking("ept");
  const createMutation = useCreateBooking("ept");
  const confirmPaymentMutation = useConfirmBookingPayment();

  const transporterName =
    transporters.find((t) => t.id === transporterId)?.name ??
    preview?.transporter_company.name ??
    "";

  const truckOptions = useMemo(() => flattenBookingOptions(truckOptionsData), [truckOptionsData]);
  const driverOptions = useMemo(() => flattenBookingOptions(driverOptionsData), [driverOptionsData]);

  const selectedTruck = truckOptions.find((t) => t.value === truckId);
  const selectedDriver = driverOptions.find((d) => d.value === driverId);
  const selectedExportType = EXPORT_TYPES.find((e) => e.value === exportType);
  const selectedOperation = EPT_OPERATION_TYPES.find((o) => o.value === operationType);

  const eptOptions = useMemo(
    () => (eptData?.data ?? []).map((e) => ({ value: e.id, label: e.name })),
    [eptData],
  );

  const selectedEpt = eptData?.data.find((e) => e.id === eptId);
  const eptName = selectedEpt?.name ?? preview?.transit_park?.name ?? "";
  const eptFacility = eptName;

  const portTerminalOptions = useMemo(
    () => (terminalsData?.data ?? []).map((t) => ({ value: t.id, label: t.name })),
    [terminalsData],
  );

  const portTerminalName =
    terminalsData?.data.find((t) => t.id === terminalId)?.name ?? preview?.terminal.name ?? "";

  const transporterOptions = transporters.map((t) => ({ value: t.id, label: t.name }));

  const bookedByName = user ? `${user.first_name} ${user.last_name}` : "SuperAdmin";
  const createdLabel = formatAssistDateShort(new Date().toISOString());
  const terminalLocationLabel =
    terminalZone === "APAPA" ? "Apapa" : terminalZone === "TINCAN" ? "Tincan" : "—";

  const paymentFee = mapPreviewFee(preview?.fee);

  function buildPayload(): CreateEptBookingRequest {
    return {
      transporter_company_id: transporterId,
      export_type: exportType as CreateEptBookingRequest["export_type"],
      truck_id: truckId,
      driver_id: driverId,
      transit_park_id: eptId,
      ept_operation_type: operationType as CreateEptBookingRequest["ept_operation_type"],
      terminal_id: terminalId,
      expected_arrival_date: arrivalDate,
      expected_arrival_time: DEFAULT_EPT_ARRIVAL_TIME,
      gate_pass_number: gatePass.trim(),
    };
  }

  function handleTransporterChange(id: string) {
    setTransporterId(id);
    setTruckId("");
    setDriverId("");
  }

  function handleTerminalZoneChange(zone: "APAPA" | "TINCAN") {
    setTerminalZone(zone);
    setEptId("");
    setTerminalId("");
  }

  function validateStep1(): boolean {
    if (!transporterId) {
      toast.error("Please select a transporter.");
      return false;
    }
    if (!exportType) {
      toast.error("Please select an export type.");
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
    if (!eptId) {
      toast.error("Please select an EPT.");
      return false;
    }
    if (!operationType) {
      toast.error("Please select an operation type.");
      return false;
    }
    if (!terminalId) {
      toast.error("Please select a port terminal destination.");
      return false;
    }
    if (!arrivalDate) {
      toast.error("Please select an expected arrival date.");
      return false;
    }
    if (!gatePass.trim()) {
      toast.error("Please enter the GatePass number.");
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
    return <SuperAdminGate featureLabel="Book EPT" />;
  }

  return (
    <div className="space-y-5 p-6">
      <BookAssistBreadcrumb currentLabel="Book EPT" />

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0f1e2e]">
              <Container className="h-5 w-5 text-violet-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Book EPT</h1>
              <p className="text-xs text-gray-500">
                Assist transporters with export processing terminal bookings
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
            Select the transporter and export trip details on their behalf
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

            <SearchableSelect
              label="Select Export Type"
              placeholder="Choose export type…"
              value={exportType}
              onChange={setExportType}
              options={[...EXPORT_TYPES]}
              searchPlaceholder="Search export types…"
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

            <TerminalZoneToggle value={terminalZone} onChange={handleTerminalZoneChange} />

            <SearchableSelect
              label="Select EPT"
              placeholder={terminalZone ? "Choose EPT…" : "Select terminal location first"}
              value={eptId}
              onChange={setEptId}
              options={eptOptions}
              searchPlaceholder="Search EPTs…"
              required
              disabled={!terminalZone}
            />

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-700">EPT Facility</label>
              <input
                type="text"
                readOnly
                value={eptFacility}
                placeholder="Auto-populated from selected EPT"
                className="w-full cursor-not-allowed rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5 text-sm text-gray-600"
              />
            </div>

            <SearchableSelect
              label="Operation Type"
              placeholder="Choose operation type…"
              value={operationType}
              onChange={setOperationType}
              options={[...EPT_OPERATION_TYPES]}
              searchPlaceholder="Search operation types…"
              required
            />

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
                GatePass <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={gatePass}
                onChange={(e) => setGatePass(e.target.value.toUpperCase())}
                placeholder="e.g. NXP1234567890"
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
          <div className="space-y-4 lg:col-span-3">
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="text-sm font-bold text-gray-900">Preview Details</h2>

              <div className="mt-4 grid gap-3 rounded-lg bg-gray-50 p-4 text-sm sm:grid-cols-2">
                <div>
                  <span className="text-gray-500">Booked By:</span>{" "}
                  <span className="font-semibold text-gray-900">{bookedByName} (SuperAdmin)</span>
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
                <div className="relative flex h-32 w-48 items-center justify-center rounded-lg border-2 border-violet-200 bg-gradient-to-br from-violet-50 to-white shadow-sm">
                  <Container className="h-14 w-14 text-violet-500" strokeWidth={1.2} />
                  <span className="absolute bottom-2 rounded bg-violet-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                    EPT
                  </span>
                </div>
                <p className="mt-3 text-sm font-bold text-gray-900">
                  {selectedExportType?.label ?? preview?.export_type ?? "Export Container"}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Container / GatePass:{" "}
                  <span className="font-semibold text-emerald-700">
                    {(preview?.gate_pass_number ?? gatePass) || "None"}
                  </span>
                </p>
              </div>

              <div className="mt-4 space-y-4">
                <div className="flex flex-wrap gap-4">
                  <PreviewDataCell
                    label="Export Type"
                    value={selectedExportType?.label ?? preview?.export_type ?? "—"}
                  />
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
                </div>
                <div className="flex flex-wrap gap-4">
                  <PreviewDataCell label="Terminal Location" value={terminalLocationLabel} />
                  <PreviewDataCell label="EPT" value={eptName || "—"} />
                  <PreviewDataCell label="EPT-Facility" value={eptFacility || "—"} />
                </div>
                <div className="flex flex-wrap gap-4">
                  <PreviewDataCell
                    label="Operation Type"
                    value={selectedOperation?.label ?? preview?.ept_operation_type ?? "—"}
                  />
                  <PreviewDataCell label="Port Terminal Destination" value={portTerminalName} />
                  <PreviewDataCell
                    label="GatePass Number"
                    value={(preview?.gate_pass_number ?? gatePass) || "None"}
                  />
                </div>
                <div className="flex flex-wrap gap-4">
                  <PreviewDataCell
                    label="Expected Arrival Date (EPT)"
                    value={formatAssistDateLong(preview?.expected_arrival_date ?? arrivalDate)}
                  />
                </div>
              </div>

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
                    <p className="text-[10px] font-semibold uppercase text-gray-400">
                      {eptName || portTerminalName}
                    </p>
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
          message="Your EPT booking payment has been confirmed."
          onContinue={() => router.push("/dashboard/bookings/all")}
        />
      )}
    </div>
  );
}

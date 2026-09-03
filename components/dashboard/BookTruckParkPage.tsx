"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Truck, Calendar, CheckCircle2, ParkingCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth.store";
import {
  BONDED_TERMINAL_LOCATIONS,
  getBondedLocationLabel,
  parseBondedTerminalLocation,
  type BondedTerminalLocation,
} from "@/lib/booking-form-constants";
import {
  flattenBookingOptions,
  formatAssistDateLong,
  formatAssistDateShort,
  formatTimeslotLabel,
  mapPreviewFee,
  PREVIEW_REFERENCE_PLACEHOLDER,
  stripGroupedLabel,
} from "@/lib/booking-form-utils";
import { useCompanies } from "@/hooks/companies/useCompanies";
import { useFacilities } from "@/hooks/facilities/useFacilities";
import { useTerminals } from "@/hooks/terminals/useTerminals";
import { useBookingCategories } from "@/hooks/booking-categories/useBookingCategories";
import { useTruckBookingOptions } from "@/hooks/booking-creation/useTruckBookingOptions";
import { useDriverBookingOptions } from "@/hooks/booking-creation/useDriverBookingOptions";
import { useFacilityTimeslots } from "@/hooks/booking-creation/useFacilityTimeslots";
import {
  useConfirmBookingPayment,
  useCreateBooking,
  usePreviewBooking,
} from "@/hooks/booking-creation/useBookingCreationMutations";
import type { BookingPreview } from "@/types/booking-creation.types";
import type { CreateFacilityBookingRequest } from "@/types/booking-creation.types";
import {
  BookAssistBreadcrumb,
  BookingPaymentSuccessModal,
  PaymentSummaryPanel,
  PreviewDataCell,
  SearchableGroupedSelect,
  SearchableSelect,
  StepIndicator,
  SuperAdminGate,
  type PaymentMethod,
} from "@/components/dashboard/book-assist/BookAssistUi";
import { BookingCategoryBadge } from "@/components/dashboard/book-assist/BookingCategoryBadge";

type Step = 1 | 2;

export function BookTruckParkPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isSuperAdmin = user?.is_super_admin ?? false;

  const [step, setStep] = useState<Step>(1);
  const [facilityId, setFacilityId] = useState("");
  const [transporterId, setTransporterId] = useState("");
  const [truckId, setTruckId] = useState("");
  const [driverId, setDriverId] = useState("");
  const [terminalLocation, setTerminalLocation] = useState<BondedTerminalLocation | "">("");
  const [terminalId, setTerminalId] = useState("");
  const [bookingCategoryId, setBookingCategoryId] = useState("");
  const [arrivalDate, setArrivalDate] = useState("");
  const [arrivalTimeslotId, setArrivalTimeslotId] = useState("");

  const [preview, setPreview] = useState<BookingPreview | null>(null);
  const [createdBookingId, setCreatedBookingId] = useState<string | null>(null);
  const [bookingReference, setBookingReference] = useState(PREVIEW_REFERENCE_PLACEHOLDER);

  const [paymentSuccess, setPaymentSuccess] = useState<{
    booking_id: string;
    journey_code: string;
  } | null>(null);

  const [detailsConfirmed, setDetailsConfirmed] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("wallet");

  const { data: transporters = [] } = useCompanies({ user_type_slug: "transporter" });
  const { data: facilitiesData } = useFacilities({ park_type: "TRUCK_PARK", limit: 100 });
  const { data: categoriesData } = useBookingCategories({ limit: 100, status: "ACTIVE" });

  const terminalParams = useMemo(() => {
    if (!terminalLocation) return undefined;
    const parsed = parseBondedTerminalLocation(terminalLocation);
    return { type: parsed.type, location: parsed.location, limit: 100 };
  }, [terminalLocation]);

  const { data: terminalsData } = useTerminals(terminalParams);
  const { data: truckOptionsData } = useTruckBookingOptions({ transporter_company_id: transporterId });
  const { data: driverOptionsData } = useDriverBookingOptions({ transporter_company_id: transporterId });
  const { data: timeslotsData } = useFacilityTimeslots(facilityId || undefined);

  const previewMutation = usePreviewBooking("truck-park");
  const createMutation = useCreateBooking("truck-park");
  const confirmPaymentMutation = useConfirmBookingPayment();

  const transporterName =
    transporters.find((t) => t.id === transporterId)?.name ??
    preview?.transporter_company.name ??
    "";

  const truckOptions = useMemo(() => flattenBookingOptions(truckOptionsData), [truckOptionsData]);
  const driverOptions = useMemo(() => flattenBookingOptions(driverOptionsData), [driverOptionsData]);

  const selectedTruck = truckOptions.find((t) => t.value === truckId);
  const selectedDriver = driverOptions.find((d) => d.value === driverId);

  const facilityOptions = useMemo(
    () => (facilitiesData?.data ?? []).map((f) => ({ value: f.id, label: f.name })),
    [facilitiesData],
  );

  const selectedFacility = facilitiesData?.data.find((f) => f.id === facilityId);
  const facilityName = selectedFacility?.name ?? preview?.facility?.name ?? "";

  const terminalDestinationOptions = useMemo(
    () => (terminalsData?.data ?? []).map((t) => ({ value: t.id, label: t.name })),
    [terminalsData],
  );

  const terminalDestinationName =
    terminalsData?.data.find((t) => t.id === terminalId)?.name ??
    preview?.terminal.name ??
    "";

  const categoryOptions = useMemo(
    () => (categoriesData?.data ?? []).map((c) => ({ value: c.id, label: c.name })),
    [categoriesData],
  );

  const selectedCategory = categoriesData?.data.find((c) => c.id === bookingCategoryId);
  const categoryLabel = selectedCategory?.name ?? preview?.booking_category_ref?.name ?? "—";

  const timeslotOptions = useMemo(
    () =>
      (timeslotsData?.data ?? [])
        .filter((a) => a.is_active)
        .map((a) => ({
          value: a.timeslot.id,
          label: formatTimeslotLabel(
            a.timeslot.start_time,
            a.timeslot.end_time,
            a.timeslot.name,
          ),
        })),
    [timeslotsData],
  );

  const selectedTimeslotOption = timeslotOptions.find((t) => t.value === arrivalTimeslotId);
  const timeslotLabel =
    selectedTimeslotOption?.label ??
    (preview?.expected_arrival_time_slot
      ? formatTimeslotLabel(
          preview.expected_arrival_time_slot.start_time,
          preview.expected_arrival_time_slot.end_time,
          preview.expected_arrival_time_slot.name,
        )
      : "—");

  const transporterOptions = transporters.map((t) => ({ value: t.id, label: t.name }));

  const bookedByName = user ? `${user.first_name} ${user.last_name}` : "SuperAdmin";
  const createdLabel = formatAssistDateShort(new Date().toISOString());
  const terminalLocationLabel = terminalLocation
    ? getBondedLocationLabel(terminalLocation)
    : preview?.terminal.location ?? "—";

  const paymentFee = mapPreviewFee(preview?.fee);

  function buildPayload(): CreateFacilityBookingRequest {
    return {
      facility_id: facilityId,
      transporter_company_id: transporterId,
      truck_id: truckId,
      driver_id: driverId,
      terminal_id: terminalId,
      booking_category_id: bookingCategoryId,
      expected_arrival_date: arrivalDate,
      expected_arrival_time_slot_id: arrivalTimeslotId,
    };
  }

  function handleFacilityChange(id: string) {
    setFacilityId(id);
    setArrivalTimeslotId("");
  }

  function handleTransporterChange(id: string) {
    setTransporterId(id);
    setTruckId("");
    setDriverId("");
  }

  function handleTerminalLocationChange(location: string) {
    setTerminalLocation(location as BondedTerminalLocation);
    setTerminalId("");
  }

  function validateStep1(): boolean {
    if (!facilityId) {
      toast.error("Please select a truck park facility.");
      return false;
    }
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
    if (!terminalLocation) {
      toast.error("Please select a terminal location.");
      return false;
    }
    if (!terminalId) {
      toast.error("Please select a terminal destination.");
      return false;
    }
    if (!bookingCategoryId) {
      toast.error("Please select a booking category.");
      return false;
    }
    if (!arrivalDate) {
      toast.error("Please select an expected arrival date.");
      return false;
    }
    if (!arrivalTimeslotId) {
      toast.error("Please select an expected arrival time.");
      return false;
    }
    return true;
  }

  async function handleProceedToPreview() {
    if (!validateStep1()) return;
    setDetailsConfirmed(false);
    setTermsAccepted(false);
    setCreatedBookingId(null);
    setBookingReference(PREVIEW_REFERENCE_PLACEHOLDER);

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
    setBookingReference(PREVIEW_REFERENCE_PLACEHOLDER);
  }

  async function handleConfirmDetails() {
    try {
      const booking = await createMutation.mutateAsync(buildPayload());
      setCreatedBookingId(booking.id);
      setBookingReference(booking.journey_code || booking.booking_id);
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
    return <SuperAdminGate featureLabel="Book Truck Park" />;
  }

  return (
    <div className="space-y-5 p-6">
      <BookAssistBreadcrumb currentLabel="Book Truck Park" />

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0f1e2e]">
              <ParkingCircle className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Book Truck Park</h1>
              <p className="text-xs text-gray-500">
                Assist transporters with truck park bookings
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
            Select the truck park facility and trip details on the transporter&apos;s behalf
          </p>

          <div className="grid gap-5 sm:grid-cols-2">
            <SearchableSelect
              label="Facility Name"
              placeholder="Choose truck park…"
              value={facilityId}
              onChange={handleFacilityChange}
              options={facilityOptions}
              searchPlaceholder="Search truck parks…"
              required
            />

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                Facility (Auto-populated)
              </label>
              <input
                type="text"
                readOnly
                value={facilityName}
                placeholder="Auto-populated from selection"
                className="w-full cursor-not-allowed rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5 text-sm text-gray-600"
              />
            </div>

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

            <SearchableSelect
              label="Select Terminal Location"
              placeholder="Choose terminal location…"
              value={terminalLocation}
              onChange={handleTerminalLocationChange}
              options={BONDED_TERMINAL_LOCATIONS}
              searchPlaceholder="Search locations…"
              required
            />

            <SearchableSelect
              label="Terminal Destination"
              placeholder={terminalLocation ? "Choose terminal…" : "Select terminal location first"}
              value={terminalId}
              onChange={setTerminalId}
              options={terminalDestinationOptions}
              searchPlaceholder="Search terminals…"
              required
              disabled={!terminalLocation}
            />

            <SearchableSelect
              label="Select Booking Category"
              placeholder="Choose booking category…"
              value={bookingCategoryId}
              onChange={setBookingCategoryId}
              options={categoryOptions}
              searchPlaceholder="Search categories…"
              required
            />

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                Expected Arrival Date (Facility) <span className="text-red-500">*</span>
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

            <SearchableSelect
              label="Expected Arrival Time (Facility)"
              placeholder={facilityId ? "Choose timeslot…" : "Select facility first"}
              value={arrivalTimeslotId}
              onChange={setArrivalTimeslotId}
              options={timeslotOptions}
              searchPlaceholder="Search timeslots…"
              required
              disabled={!facilityId}
            />
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
                  <span className="font-semibold text-gray-900">{terminalDestinationName}</span>
                </div>
              </div>

              <div className="mt-6 flex flex-col items-center py-4">
                {categoryLabel !== "—" && (
                  <BookingCategoryBadge
                    categoryName={categoryLabel}
                    label={categoryLabel}
                    referenceNumber={bookingReference}
                  />
                )}
              </div>

              <div className="mt-4 space-y-4">
                <div className="flex flex-wrap gap-4">
                  <PreviewDataCell label="Facility" value={facilityName || "—"} />
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
                  <PreviewDataCell label="Terminal Destination" value={terminalDestinationName} />
                  <PreviewDataCell label="Booking Category" value={categoryLabel} />
                </div>
                <div className="flex flex-wrap gap-4">
                  <PreviewDataCell
                    label="Expected Arrival Date (Facility)"
                    value={formatAssistDateLong(preview?.expected_arrival_date ?? arrivalDate)}
                  />
                  <PreviewDataCell label="Expected Arrival Time (Facility)" value={timeslotLabel} />
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
                      {terminalDestinationName}
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
          message="Your truck park booking payment has been confirmed."
          onContinue={() => router.push("/dashboard/bookings/all")}
        />
      )}
    </div>
  );
}

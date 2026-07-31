"use client";

import { useMemo, useState } from "react";
import { Truck, Calendar, CheckCircle2, ParkingCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth.store";
import {
  BONDED_BOOKING_CATEGORIES,
  BONDED_TERMINAL_LOCATIONS,
  BOOK_ASSIST_TRANSPORTERS,
  FACILITY_ARRIVAL_TIMESLOTS,
  TERMINALS_BY_BONDED_LOCATION,
  TRUCK_PARK_FACILITIES,
  buildGroupedDriverOptions,
  buildGroupedTruckOptions,
  formatAssistDateLong,
  formatAssistDateShort,
  getBondedLocationLabel,
  type BondedTerminalLocation,
} from "@/lib/book-assist-mock-data";
import {
  BookAssistBreadcrumb,
  PaymentSummaryPanel,
  PreviewDataCell,
  SearchableGroupedSelect,
  SearchableSelect,
  StepIndicator,
  SuperAdminGate,
  type PaymentMethod,
} from "@/components/dashboard/book-assist/BookAssistUi";
import {
  BookingCategoryBadge,
  buildBookingReferenceNumber,
} from "@/components/dashboard/book-assist/BookingCategoryBadge";

type Step = 1 | 2;

function stripGroupedLabel(label: string) {
  return label.split(" (")[0];
}

export function BookTruckParkPage() {
  const user = useAuthStore((s) => s.user);
  const isSuperAdmin = user?.is_super_admin ?? false;

  const [step, setStep] = useState<Step>(1);
  const [facilityId, setFacilityId] = useState("");
  const [transporterId, setTransporterId] = useState("");
  const [truckId, setTruckId] = useState("");
  const [driverId, setDriverId] = useState("");
  const [terminalLocation, setTerminalLocation] = useState<BondedTerminalLocation | "">("");
  const [terminalDestination, setTerminalDestination] = useState("");
  const [bookingCategory, setBookingCategory] = useState("");
  const [arrivalDate, setArrivalDate] = useState("");
  const [arrivalTimeslot, setArrivalTimeslot] = useState("");

  const [detailsConfirmed, setDetailsConfirmed] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("wallet");
  const [isPaying, setIsPaying] = useState(false);

  const selectedFacility = TRUCK_PARK_FACILITIES.find((f) => f.id === facilityId);
  const facilityName = selectedFacility?.name ?? "";

  const transporter = BOOK_ASSIST_TRANSPORTERS.find((t) => t.id === transporterId);
  const transporterName = transporter?.name ?? "";

  const truckOptions = useMemo(
    () => (transporterName ? buildGroupedTruckOptions(transporterName) : []),
    [transporterName],
  );
  const driverOptions = useMemo(
    () => (transporterName ? buildGroupedDriverOptions(transporterName) : []),
    [transporterName],
  );

  const selectedTruck = truckOptions.find((t) => t.value === truckId);
  const selectedDriver = driverOptions.find((d) => d.value === driverId);
  const selectedCategory = BONDED_BOOKING_CATEGORIES.find((c) => c.value === bookingCategory);
  const selectedTimeslot = FACILITY_ARRIVAL_TIMESLOTS.find((t) => t.value === arrivalTimeslot);

  const terminalDestinationOptions = terminalLocation
    ? TERMINALS_BY_BONDED_LOCATION[terminalLocation].map((name) => ({
        value: name,
        label: name,
      }))
    : [];

  const facilityOptions = TRUCK_PARK_FACILITIES.map((f) => ({
    value: f.id,
    label: f.name,
  }));

  const transporterOptions = BOOK_ASSIST_TRANSPORTERS.map((t) => ({
    value: t.id,
    label: t.name,
  }));

  const bookedByName = user ? `${user.first_name} ${user.last_name}` : "SuperAdmin";
  const createdLabel = formatAssistDateShort(new Date().toISOString());
  const terminalLocationLabel = terminalLocation
    ? getBondedLocationLabel(terminalLocation)
    : "—";

  const referenceNumber = useMemo(
    () =>
      buildBookingReferenceNumber(
        selectedTruck ? stripGroupedLabel(selectedTruck.label) : undefined,
        selectedCategory?.variant,
      ),
    [selectedTruck, selectedCategory],
  );

  function handleTransporterChange(id: string) {
    setTransporterId(id);
    setTruckId("");
    setDriverId("");
  }

  function handleTerminalLocationChange(location: string) {
    setTerminalLocation(location as BondedTerminalLocation);
    setTerminalDestination("");
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
    if (!terminalDestination) {
      toast.error("Please select a terminal destination.");
      return false;
    }
    if (!bookingCategory) {
      toast.error("Please select a booking category.");
      return false;
    }
    if (!arrivalDate) {
      toast.error("Please select an expected arrival date.");
      return false;
    }
    if (!arrivalTimeslot) {
      toast.error("Please select an expected arrival time.");
      return false;
    }
    return true;
  }

  function handleProceedToPreview() {
    if (!validateStep1()) return;
    setDetailsConfirmed(false);
    setTermsAccepted(false);
    setStep(2);
  }

  function handleGoBack() {
    setStep(1);
    setDetailsConfirmed(false);
    setTermsAccepted(false);
  }

  function handleConfirmDetails() {
    setDetailsConfirmed(true);
    toast.success("Booking details confirmed. You may now proceed to payment.");
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
    setIsPaying(true);
    await new Promise((r) => setTimeout(r, 1200));
    setIsPaying(false);
    toast.success("Truck park booking payment processed successfully.");
  }

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
              onChange={setFacilityId}
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
              value={terminalDestination}
              onChange={setTerminalDestination}
              options={terminalDestinationOptions}
              searchPlaceholder="Search terminals…"
              required
              disabled={!terminalLocation}
            />

            <SearchableSelect
              label="Select Booking Category"
              placeholder="Choose booking category…"
              value={bookingCategory}
              onChange={setBookingCategory}
              options={BONDED_BOOKING_CATEGORIES.map((c) => ({
                value: c.value,
                label: c.label,
              }))}
              searchPlaceholder="Search categories…"
              required
            />

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                Expected Arrival Date (Facility / Truck Park) <span className="text-red-500">*</span>
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
              label="Expected Arrival Time (Facility / Truck Park)"
              placeholder="Choose timeslot…"
              value={arrivalTimeslot}
              onChange={setArrivalTimeslot}
              options={FACILITY_ARRIVAL_TIMESLOTS}
              searchPlaceholder="Search timeslots…"
              required
            />
          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="button"
              onClick={handleProceedToPreview}
              className="rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
            >
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
                    {selectedTruck ? stripGroupedLabel(selectedTruck.label) : "—"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Destination:</span>{" "}
                  <span className="font-semibold text-gray-900">{terminalDestination}</span>
                </div>
              </div>

              <div className="mt-6 flex flex-col items-center py-4">
                {selectedCategory && (
                  <BookingCategoryBadge
                    variant={selectedCategory.variant}
                    label={selectedCategory.label}
                    referenceNumber={referenceNumber}
                  />
                )}
              </div>

              <div className="mt-4 space-y-4">
                <div className="flex flex-wrap gap-4">
                  <PreviewDataCell label="Facility" value={facilityName || "—"} />
                  <PreviewDataCell
                    label="Truck Plate Number"
                    value={selectedTruck ? stripGroupedLabel(selectedTruck.label) : "—"}
                  />
                  <PreviewDataCell
                    label="Driver's Name"
                    value={selectedDriver ? stripGroupedLabel(selectedDriver.label) : "—"}
                  />
                  <PreviewDataCell label="Terminal Location" value={terminalLocationLabel} />
                </div>
                <div className="flex flex-wrap gap-4">
                  <PreviewDataCell label="Terminal Destination" value={terminalDestination} />
                  <PreviewDataCell label="Booking Category" value={selectedCategory?.label ?? "—"} />
                  <PreviewDataCell
                    label="Expected Arrival Date (Facility / Truck Park)"
                    value={formatAssistDateLong(arrivalDate)}
                  />
                  <PreviewDataCell
                    label="Expected Arrival Time (Facility / Truck Park)"
                    value={selectedTimeslot?.label ?? "—"}
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
                      {facilityName || terminalDestination}
                    </p>
                    <p className="text-sm font-bold text-gray-900">
                      {formatAssistDateShort(arrivalDate)}
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
                  disabled={detailsConfirmed}
                  className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors ${
                    detailsConfirmed
                      ? "cursor-default bg-emerald-100 text-emerald-700"
                      : "bg-emerald-600 text-white hover:bg-emerald-700"
                  }`}
                >
                  {detailsConfirmed ? (
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
            />
          </div>
        </div>
      )}
    </div>
  );
}

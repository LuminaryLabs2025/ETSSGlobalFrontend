"use client";

import { useRef, useState } from "react";
import { Truck, Shield, X, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { downloadTicketPdf } from "@/lib/download-ticket-pdf";
import type { Booking, BookingStatus } from "@/types/bookings.types";

const CATEGORY_DISPLAY: Record<string, string> = {
  IMPORT: "Import Container",
  EXPORT: "Export Container",
  EMPTY: "Empty Container",
  DOMESTIC: "Domestic Container",
};

function formatLabel(s: string) {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDateLong(ts: string) {
  return new Date(ts).toLocaleDateString("en-NG", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTimeLong(ts: string) {
  return new Date(ts).toLocaleString("en-NG", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function formatNaira(amount: number) {
  return `₦${amount.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
}

function displayValue(value?: string | null) {
  return value?.trim() ? value : "N/A";
}

function statusTicketMeta(status: BookingStatus) {
  const map: Record<BookingStatus, { label: string; dot: string; badge: string }> = {
    LIVE: { label: "Live", dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-800" },
    COMPLETED: { label: "Completed", dot: "bg-amber-500", badge: "bg-amber-50 text-amber-800" },
    CANCELLED: { label: "Cancelled", dot: "bg-red-500", badge: "bg-red-50 text-red-700" },
    EXPIRED: { label: "Expired", dot: "bg-gray-400", badge: "bg-gray-100 text-gray-600" },
  };
  return map[status];
}

function TicketRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <span className="shrink-0 text-sm text-gray-500">{label}</span>
      <span className="text-right text-sm font-semibold text-gray-900">{value}</span>
    </div>
  );
}

function TicketDivider() {
  return <div className="border-t border-dashed border-gray-200" />;
}

function TearLine() {
  return (
    <div className="relative my-1 py-2">
      <div className="border-t border-dotted border-rose-300" />
      <span className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-rose-300 bg-white" />
    </div>
  );
}

function PerforatedEdge() {
  return (
    <div
      className="h-3 w-full"
      style={{
        background:
          "linear-gradient(135deg, #f3f4f6 25%, transparent 25%) -4px 0 / 8px 8px, linear-gradient(225deg, #f3f4f6 25%, transparent 25%) -4px 0 / 8px 8px, linear-gradient(315deg, #f3f4f6 25%, transparent 25%) 0 0 / 8px 8px, linear-gradient(45deg, #f3f4f6 25%, transparent 25%) 0 0 / 8px 8px",
        backgroundColor: "#ffffff",
      }}
    />
  );
}

export function BookingETicket({ booking }: { booking: Booking }) {
  const status = statusTicketMeta(booking.status);
  const categoryLabel = CATEGORY_DISPLAY[booking.booking_category] ?? formatLabel(booking.booking_category);
  const terminal = displayValue(booking.terminal_destination || booking.terminal_name);
  const pregate = booking.transit_park_name
    ? `${booking.transit_park_name}${booking.transit_park_code ? ` (${booking.transit_park_code})` : ""}`
    : "N/A";
  const driverDisplay = booking.driver_name?.trim() ? booking.driver_name : "No driver assigned";
  const generatedAt = new Date();

  return (
    <article data-booking-eticket className="mx-auto w-full max-w-md overflow-hidden rounded-xl bg-white shadow-lg">
      {/* Header */}
      <div
        className="relative px-6 pb-10 pt-6 text-white"
        style={{
          backgroundColor: "#1e4d3a",
          backgroundImage:
            "repeating-linear-gradient(-45deg, rgba(255,255,255,0.04) 0, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 10px)",
        }}
      >
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">E-Ticket</h1>
            <p className="mt-0.5 text-sm font-medium text-emerald-100/90">MARITIME-ETSS</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/20">
              <Truck className="h-4 w-4 text-white" />
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/20">
              <Shield className="h-4 w-4 text-white" />
            </span>
          </div>
        </div>
      </div>

      {/* Summary card — full width, spaced below header */}
      <div className="w-full border-y border-gray-200 bg-gray-50 px-5 py-5">
        <div className="grid w-full grid-cols-2 gap-x-6 gap-y-4">
          <div>
            <p className="text-[11px] text-gray-500">Status</p>
            <span className={`mt-1.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${status.badge}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
              {status.label}
            </span>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-gray-500">Amount</p>
            <p className="mt-1.5 text-sm font-bold text-gray-900">
              {booking.booking_fee != null ? formatNaira(booking.booking_fee) : "N/A"}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-gray-500">Booking Reference</p>
            <p className="mt-1.5 font-mono text-sm font-bold text-gray-900">{booking.booking_id}</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-gray-500">Journey Code</p>
            <p className="mt-1.5 font-mono text-sm font-bold text-gray-900">{booking.journey_code}</p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="bg-white px-5 pb-2 pt-2">
        <TicketRow label="TEP Code" value={displayValue(booking.tep_code)} />
        <TicketRow label="Booking Category" value={categoryLabel} />
        <TicketDivider />
        <TicketRow label="Company Name" value={booking.transporter_company} />
        <TicketRow label="Terminal" value={terminal} />
        <TicketRow label="Pregate" value={pregate} />
        <TearLine />
        <TicketRow label="Truck Plate Number" value={<span className="font-mono">{booking.truck_plate_number}</span>} />
        <TicketRow label="Driver" value={driverDisplay} />
        <TicketDivider />
        <TicketRow
          label="Payment Status"
          value={
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Paid
            </span>
          }
        />
        <TicketRow label="Booking Date" value={formatDateLong(booking.created_at)} />
        <TicketRow
          label="Expected Arrival Date"
          value={booking.arrival_date ? formatDateLong(booking.arrival_date) : formatDateLong(booking.created_at)}
        />
        <TicketRow label="Time Slot" value={displayValue(booking.time_slot)} />
        <TicketDivider />
        <TicketRow label="Booked By" value={booking.truck_booked_by} />
        <TicketRow label="Created On" value={formatDateTimeLong(booking.created_at)} />

        <div className="py-6 text-center">
          <p className="text-sm font-bold text-gray-800">MARITIME-ETSS</p>
          <p className="mt-1 text-[11px] text-gray-500">
            Generated on {formatDateLong(generatedAt.toISOString())} at{" "}
            {generatedAt.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })}
          </p>
          <p className="mt-2 text-[10px] text-gray-400">For inquiries, please contact system administrator.</p>
        </div>
      </div>

      <PerforatedEdge />
    </article>
  );
}

export function BookingETicketModal({ booking, onClose }: { booking: Booking; onClose: () => void }) {
  const modalBodyRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    const ticket = modalBodyRef.current?.querySelector<HTMLElement>("[data-booking-eticket]");
    if (!ticket || downloading) return;

    setDownloading(true);
    try {
      await downloadTicketPdf(ticket, `e-ticket-${booking.booking_id}.pdf`);
      toast.success("E-Ticket downloaded as PDF");
    } catch (error) {
      console.error("E-Ticket PDF export failed:", error);
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-60 bg-black/40" onClick={onClose} />
      <div className="fixed inset-0 z-70 flex items-center justify-center p-4">
        <div className="flex max-h-[95vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-gray-100 shadow-2xl">
          <div className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-white px-5 py-4">
            <div>
              <h2 className="text-sm font-bold text-gray-900">E-Ticket Preview</h2>
              <p className="text-xs text-gray-500">Sample ticket — layout may change when API is connected</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div ref={modalBodyRef} className="flex-1 overflow-y-auto p-5">
            <BookingETicket booking={booking} />
          </div>

          <div className="flex shrink-0 justify-end gap-2 border-t border-gray-200 bg-white px-5 py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={downloading}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              {downloading ? "Generating…" : "Download"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

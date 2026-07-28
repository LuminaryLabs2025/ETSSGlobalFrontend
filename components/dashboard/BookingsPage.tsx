"use client";

import { useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  BookOpen,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronRight as Chevron,
  X,
  Clock,
  Eye,
  Ban,
  Shield,
  Truck,
  RefreshCw,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Loader2,
  AlertCircle,
  Download,
  MapPin,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth.store";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { useBookings } from "@/hooks/bookings/useBookings";
import { useBookingsSummary } from "@/hooks/bookings/useBookingsSummary";
import { useBookingsManifest } from "@/hooks/bookings/useBookingsManifest";
import { useBooking } from "@/hooks/bookings/useBooking";
import {
  useRemoveFromManifest,
  useAddToManifest,
  useCancelBooking,
  useExportBookings,
} from "@/hooks/bookings/useBookingActions";
import type {
  Booking,
  BookingStatus,
  TransferType,
  BookingsSummaryResponse,
  BookingsListParams,
  BookingsManifestParams,
} from "@/types/bookings.types";
import { BookingETicketModal } from "@/components/dashboard/BookingETicket";
import { TableActionsDropdown } from "@/components/dashboard/TableActionsDropdown";

const PAGE_SIZE = 10;

type MainSection = "all" | "manifest";
type StatusTab = "all" | BookingStatus;
type ManifestTab = "in" | "left";

const TERMINAL_OPTIONS = [
  "All",
  "Apapa Port Terminal A",
  "Tincan Island Terminal",
  "Onne Port Terminal",
  "Lekki Deep Sea Terminal",
  "Calabar Non-Port Terminal",
];

const TRANSPORTER_OPTIONS = [
  "All",
  "ABC Logistics Ltd",
  "BUA Transport Services",
  "Dangote Transport Services",
  "Mikano Logistics",
  "Shina & Sons Logistics",
  "Calabar Haulage Co.",
];

const STATUS_TABS: { id: StatusTab; label: string }[] = [
  { id: "all", label: "All Bookings" },
  { id: "LIVE", label: "Live" },
  { id: "COMPLETED", label: "Completed" },
  { id: "CANCELLED", label: "Cancelled" },
  { id: "EXPIRED", label: "Expired" },
];

const TRANSFER_TYPE_OPTIONS: (TransferType | "All")[] = [
  "All", "INBOUND", "OUTBOUND", "INTER_TERMINAL", "EMPTY_RETURN", "LOCAL",
];

const TRANSFER_LABELS: Record<TransferType, string> = {
  INBOUND: "Inbound",
  OUTBOUND: "Outbound",
  INTER_TERMINAL: "Inter-Terminal",
  EMPTY_RETURN: "Empty Return",
  LOCAL: "Local",
};

const CATEGORY_LABELS: Record<string, string> = {
  IMPORT: "Import",
  EXPORT: "Export",
  EMPTY: "Empty",
  DOMESTIC: "Domestic",
};

function formatTimestamp(ts: string) {
  return new Date(ts).toLocaleString("en-NG", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
}

function formatLabel(s: string) {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDateShort(ts: string) {
  return new Date(ts).toLocaleDateString("en-NG", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function truckStatusLabel(booking: Booking): string {
  if (booking.truck?.truck_status) return formatLabel(booking.truck.truck_status);
  if (booking.status === "LIVE") return "On-Trip";
  return formatLabel(booking.status);
}

function truckStatusBadgeCls(booking: Booking): string {
  if (booking.truck?.truck_status === "ON_TRIP" || booking.status === "LIVE") {
    return "bg-blue-50 text-blue-700 border-blue-200";
  }
  if (booking.status === "COMPLETED") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (booking.status === "CANCELLED") return "bg-red-50 text-red-700 border-red-200";
  return "bg-gray-100 text-gray-600 border-gray-200";
}

function TruckPreviewCard({ booking }: { booking: Booking }) {
  const truck = booking.truck;
  const displayType = truck?.truck_type ? formatLabel(truck.truck_type) : "—";

  return (
    <div className="w-72 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl ring-1 ring-black/5">
      <div className="border-b border-gray-100 bg-gray-50/80 px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Plate Number</p>
            <p className="font-mono text-sm font-bold text-gray-900">{booking.truck_plate_number}</p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Truck Type</p>
            <p className="text-xs font-bold text-gray-800">{displayType}</p>
          </div>
          <div className="shrink-0 scale-110">
            <TruckAvatar color={booking.truck_color} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-px bg-gray-100">
        <div className="bg-white px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Truck Brand</p>
          <p className="mt-0.5 text-sm font-bold text-gray-900">{truck?.brand ?? "—"}</p>
        </div>
        <div className="bg-white px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Truck Model</p>
          <p className="mt-0.5 text-sm font-bold text-gray-900">{truck?.model ?? "—"}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-px border-t border-gray-100 bg-gray-100">
        <div className="bg-white px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">MSS Verification No</p>
          <p className="mt-0.5 text-sm font-bold text-gray-900">{truck?.mss_verification_number ?? "—"}</p>
        </div>
        <div className="bg-white px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">MSS Expiry Date</p>
          <p className="mt-0.5 text-sm font-bold text-gray-900">
            {truck?.mss_expiry_date ? formatDateShort(truck.mss_expiry_date) : "—"}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-gray-100 px-4 py-3">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Owned By</p>
          <p className="truncate text-sm font-bold text-gray-900">{booking.truck_owned_by}</p>
        </div>
        <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${truckStatusBadgeCls(booking)}`}>
          {truckStatusLabel(booking)}
        </span>
      </div>
    </div>
  );
}

function TruckPreviewTrigger({ booking, children }: { booking: Booking; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updatePosition = useCallback(() => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cardWidth = 288;
    const cardHeight = 280;
    const padding = 8;
    let left = rect.left;
    let top = rect.bottom + padding;
    if (left + cardWidth > window.innerWidth - padding) {
      left = window.innerWidth - cardWidth - padding;
    }
    if (top + cardHeight > window.innerHeight - padding) {
      top = rect.top - cardHeight - padding;
    }
    setPosition({ top, left });
  }, []);

  const show = useCallback(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    updatePosition();
    setOpen(true);
  }, [updatePosition]);

  const hide = useCallback(() => {
    hideTimerRef.current = setTimeout(() => setOpen(false), 120);
  }, []);

  const cancelHide = useCallback(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
  }, []);

  return (
    <>
      <div
        ref={triggerRef}
        className="inline-flex cursor-pointer"
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
      >
        {children}
      </div>
      {open && typeof document !== "undefined" && createPortal(
        <div
          className="fixed z-[100]"
          style={{ top: position.top, left: position.left }}
          onMouseEnter={cancelHide}
          onMouseLeave={hide}
        >
          <TruckPreviewCard booking={booking} />
        </div>,
        document.body,
      )}
    </>
  );
}

function TruckAvatar({ color }: { color: string }) {
  const colorMap: Record<string, string> = {
    White: "bg-gray-100", Red: "bg-red-50", Blue: "bg-blue-50",
    Grey: "bg-slate-100", Green: "bg-emerald-50", Yellow: "bg-yellow-50",
  };
  const iconMap: Record<string, string> = {
    White: "text-gray-400", Red: "text-red-400", Blue: "text-blue-400",
    Grey: "text-slate-400", Green: "text-emerald-500", Yellow: "text-yellow-500",
  };
  return (
    <div className={`flex h-9 w-14 shrink-0 items-center justify-center rounded-lg border border-gray-200 ${colorMap[color] ?? "bg-gray-100"}`}>
      <Truck className={`h-4 w-4 ${iconMap[color] ?? "text-gray-400"}`} />
    </div>
  );
}

function StatusBadge({ status }: { status: BookingStatus }) {
  const map: Record<BookingStatus, { cls: string; label: string }> = {
    LIVE: { cls: "bg-blue-50 text-blue-700 border-blue-200", label: "Live" },
    COMPLETED: { cls: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "Completed" },
    CANCELLED: { cls: "bg-red-50 text-red-700 border-red-200", label: "Cancelled" },
    EXPIRED: { cls: "bg-gray-100 text-gray-500 border-gray-200", label: "Expired" },
  };
  const { cls, label } = map[status];
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${cls}`}>
      {label}
    </span>
  );
}

function SummaryPanel({
  summary,
  isLoading,
  lastRefresh,
}: {
  summary?: BookingsSummaryResponse;
  isLoading?: boolean;
  lastRefresh: string;
}) {
  const cards = [
    { label: "Total Bookings", value: summary?.total ?? 0, color: "text-blue-400", bg: "bg-blue-400/10", Icon: BookOpen },
    { label: "Live", value: summary?.live ?? 0, color: "text-cyan-400", bg: "bg-cyan-400/10", Icon: ActivityIcon },
    { label: "Completed", value: summary?.completed ?? 0, color: "text-emerald-400", bg: "bg-emerald-400/10", Icon: CheckCircle2 },
    { label: "Cancelled", value: summary?.cancelled ?? 0, color: "text-red-400", bg: "bg-red-400/10", Icon: XCircle },
    { label: "Expired", value: summary?.expired ?? 0, color: "text-gray-400", bg: "bg-gray-400/10", Icon: Clock },
  ];

  return (
    <div className="rounded-2xl bg-[#0f1e2e] p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Bookings Database</h1>
          <p className="text-xs text-gray-400">Real-time view of all truck bookings across the ETSS platform</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-[10px] text-gray-400">
            <RefreshCw className="h-3 w-3" />
            Last refresh: {lastRefresh}
          </div>
          <div className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">Live</span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {isLoading ? (
          <div className="col-span-full flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-400" />
          </div>
        ) : (
          cards.map((card) => (
            <div key={card.label} className="rounded-xl bg-white/5 p-4 transition-colors hover:bg-white/10">
              <div className="mb-2">
                <div className={`inline-flex rounded-lg p-1.5 ${card.bg}`}>
                  <card.Icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-white">{card.value}</p>
              <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-gray-500">{card.label}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function ActivityIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}

const CATEGORY_DISPLAY: Record<string, string> = {
  IMPORT: "Import Container",
  EXPORT: "Export Container",
  EMPTY: "Empty Container",
  DOMESTIC: "Domestic Container",
};

function formatNaira(amount: number) {
  return `₦${amount.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
}

function displayValue(value?: string | null) {
  return value?.trim() ? value : "N/A";
}

function DetailStatusBadge({ status }: { status: BookingStatus }) {
  const map: Record<BookingStatus, { cls: string; label: string }> = {
    LIVE: { cls: "bg-blue-50 text-blue-700 border-blue-200", label: "Live" },
    COMPLETED: { cls: "bg-amber-50 text-amber-800 border-amber-200", label: "Completed" },
    CANCELLED: { cls: "bg-red-50 text-red-700 border-red-200", label: "Cancelled" },
    EXPIRED: { cls: "bg-gray-100 text-gray-500 border-gray-200", label: "Expired" },
  };
  const { cls, label } = map[status];
  return (
    <span className={`inline-flex items-center rounded-md border px-3 py-1 text-xs font-semibold ${cls}`}>
      {label}
    </span>
  );
}

function ContainerBanner({ booking }: { booking: Booking }) {
  const categoryLabel = CATEGORY_DISPLAY[booking.booking_category] ?? formatLabel(booking.booking_category);
  const hasTep = Boolean(booking.tep_code);

  return (
    <div
      className="relative overflow-hidden rounded-lg border border-gray-200 px-6 py-8 text-center"
      style={{
        backgroundImage: "repeating-linear-gradient(90deg, #e5e7eb 0, #e5e7eb 2px, transparent 2px, transparent 14px)",
        backgroundColor: "#f9fafb",
      }}
    >
      <div className="relative space-y-1">
        {hasTep && (
          <>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Truck Entry Permit</p>
            <p className="font-mono text-sm font-bold text-gray-800">{booking.tep_code}</p>
          </>
        )}
        <p className="text-sm font-bold uppercase tracking-wide text-emerald-600">{categoryLabel}</p>
      </div>
    </div>
  );
}

function DetailField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-medium text-gray-500">{label}</p>
      <div className="mt-1 text-sm font-semibold text-gray-900">{children}</div>
    </div>
  );
}

function TruckStatusDot({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const isAvailable = normalized.includes("available");
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`h-2 w-2 rounded-full ${isAvailable ? "bg-emerald-500" : "bg-blue-500"}`} />
      {formatLabel(status.replace(/_/g, " "))}
    </span>
  );
}

function BookingActivityTimeline({ booking }: { booking: Booking }) {
  const entries = [...(booking.timeline ?? [])].reverse();
  if (entries.length === 0) {
    return <p className="py-8 text-center text-sm text-gray-400">No activity recorded yet</p>;
  }

  return (
    <div className="relative space-y-0">
      {entries.map((entry, index) => {
        const isLatest = entry.is_latest ?? index === 0;
        const fromStatus = entry.from_status ?? (entries[index + 1] ? formatLabel(entries[index + 1].status) : undefined);
        const performer = entry.performed_by ?? "System";

        return (
          <div key={entry.id} className="relative flex gap-3 pb-6 last:pb-0">
            {index < entries.length - 1 && (
              <span className="absolute left-[13px] top-7 bottom-0 w-px bg-gray-200" />
            )}
            <div className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0f1e2e]">
              <CheckCircle2 className="h-3.5 w-3.5 text-white" />
            </div>
            <div className="min-w-0 flex-1 rounded-lg border border-gray-100 bg-gray-50/50 p-3">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-bold text-gray-900">{formatLabel(entry.status)}</p>
                {isLatest && (
                  <span className="rounded bg-[#0f1e2e] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                    Latest
                  </span>
                )}
              </div>
              {fromStatus && (
                <p className="mt-1 text-xs text-gray-600">
                  <span className="text-gray-400">From:</span> {fromStatus}
                </p>
              )}
              <p className="mt-0.5 text-xs text-gray-600">
                <span className="text-gray-400">Updated by:</span> {performer}
              </p>
              {entry.location && (
                <p className="mt-1 flex items-center gap-1 text-xs text-gray-600">
                  <MapPin className="h-3 w-3 shrink-0 text-gray-400" />
                  {entry.location}
                </p>
              )}
              <p className="mt-1 flex items-center gap-1 text-[11px] text-gray-500">
                <Calendar className="h-3 w-3 shrink-0 text-gray-400" />
                {formatTimestamp(entry.timestamp)}
              </p>
              {entry.tat_duration && (
                <div className="mt-2 rounded-md border border-gray-200 bg-white px-2.5 py-1.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Turn Around Time</p>
                  <p className="text-xs font-bold text-gray-800">{entry.tat_duration}</p>
                </div>
              )}
              {entry.notes && !entry.tat_duration && (
                <p className="mt-1 text-[11px] text-gray-500">{entry.notes}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function BookingDetailDrawer({ bookingId, onClose }: { bookingId: string; onClose: () => void }) {
  const { data: booking, isLoading, isError } = useBooking(bookingId);
  const [showETicket, setShowETicket] = useState(false);

  const facilityDisplay = booking?.facility_name
    ? `${booking.facility_name}${booking.facility_code ? ` (${booking.facility_code})` : ""}`
    : booking?.terminal_name;

  const transitParkDisplay = booking?.transit_park_name
    ? `${booking.transit_park_name}${booking.transit_park_code ? ` (${booking.transit_park_code})` : ""}`
    : undefined;

  const currentTruckStatus = booking?.current_truck_status
    ?? booking?.truck?.truck_status
    ?? (booking?.status === "LIVE" ? "ON_TRIP" : "AVAILABLE");

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-4xl flex-col bg-gray-50 shadow-2xl">
        {/* Drawer header */}
        <div className="shrink-0 border-b border-gray-200 bg-white px-6 py-4">
          <nav className="mb-2 flex items-center gap-1.5 text-xs text-gray-500">
            <span>Bookings</span>
            <Chevron className="h-3 w-3" />
            <span className="font-semibold text-gray-800">Details</span>
          </nav>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Booking Details</h2>
              <p className="text-xs text-gray-500">View complete booking information</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {booking && (
                <>
                  <button
                    type="button"
                    onClick={() => toast.info("Update truck status coming soon")}
                    className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    <Truck className="h-3.5 w-3.5" />
                    Update Truck Status
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowETicket(true)}
                    className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download E-Ticket
                  </button>
                </>
              )}
              <button onClick={onClose} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex flex-col items-center gap-2 py-16">
              <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
              <p className="text-sm text-gray-400">Loading booking details...</p>
            </div>
          ) : isError || !booking ? (
            <div className="flex flex-col items-center gap-2 py-16">
              <AlertCircle className="h-8 w-8 text-red-300" />
              <p className="text-sm text-gray-400">Failed to load booking details</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_300px]">
              {/* Left — booking information card */}
              <div className="space-y-5">
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-lg font-bold text-gray-900">{booking.booking_id}</p>
                      <p className="mt-0.5 font-mono text-xs text-gray-500">{booking.journey_code}</p>
                    </div>
                    <DetailStatusBadge status={booking.status} />
                  </div>

                  <ContainerBanner booking={booking} />

                  <div className="mt-5 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
                    <DetailField label="Truck Plate Number">
                      <div className="flex items-center gap-2">
                        <TruckPreviewTrigger booking={booking}>
                          <TruckAvatar color={booking.truck_color} />
                        </TruckPreviewTrigger>
                        <span className="font-mono">{booking.truck_plate_number}</span>
                      </div>
                    </DetailField>
                    <DetailField label="Name of Transporter">{booking.transporter_company}</DetailField>
                    <DetailField label="TEP Code">{displayValue(booking.tep_code)}</DetailField>
                    <DetailField label="Port Terminal Destination">
                      {displayValue(booking.terminal_destination || booking.terminal_name)}
                    </DetailField>
                    <DetailField label="Current Truck Status">
                      <TruckStatusDot status={currentTruckStatus} />
                    </DetailField>
                    <DetailField label="Booking Category">
                      {CATEGORY_DISPLAY[booking.booking_category] ?? formatLabel(booking.booking_category)}
                    </DetailField>
                    <DetailField label="Facility">{displayValue(facilityDisplay)}</DetailField>
                    <DetailField label="Transit Park (Pregate)">{displayValue(transitParkDisplay)}</DetailField>
                    <DetailField label="Booking Fee">
                      {booking.booking_fee != null ? formatNaira(booking.booking_fee) : "N/A"}
                    </DetailField>
                    <DetailField label="Arrival Date">
                      {booking.arrival_date ? formatDateShort(booking.arrival_date) : formatDateShort(booking.created_at)}
                    </DetailField>
                    <DetailField label="Driver">
                      <span>{booking.driver_name}</span>
                      {booking.driver_phone && (
                        <p className="mt-0.5 text-xs font-normal text-gray-500">{booking.driver_phone}</p>
                      )}
                    </DetailField>
                    <DetailField label="Time Slot">{displayValue(booking.time_slot)}</DetailField>
                    <DetailField label="Booked By">{booking.truck_booked_by}</DetailField>
                    <DetailField label="Transfer Type">{TRANSFER_LABELS[booking.transfer_type]}</DetailField>
                  </div>
                </div>

                {(booking.exceptions?.length ?? 0) > 0 && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-amber-600">Penalties, Delays &amp; Exceptions</p>
                    {booking.exceptions!.map((ex) => (
                      <div key={ex.id} className="mt-2 rounded-lg bg-white p-3">
                        <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">{ex.type}</span>
                        <p className="mt-1 text-xs text-gray-700">{ex.description}</p>
                        <p className="mt-0.5 text-[10px] text-gray-400">{formatTimestamp(ex.timestamp)}</p>
                      </div>
                    ))}
                  </div>
                )}

                {booking.tow_truck_request && (
                  <div className="rounded-xl border border-violet-200 bg-violet-50/50 p-4">
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-violet-600">Tow Truck Request</p>
                    <p className="text-xs text-gray-700">{booking.tow_truck_request.reason}</p>
                    <p className="mt-1 text-[11px] text-gray-500">Requested by {booking.tow_truck_request.requested_by}</p>
                    {booking.tow_truck_request.tow_company && (
                      <p className="text-[11px] text-gray-500">Tow company: {booking.tow_truck_request.tow_company}</p>
                    )}
                    <p className="mt-0.5 text-[10px] text-gray-400">{formatTimestamp(booking.tow_truck_request.requested_at)}</p>
                  </div>
                )}
              </div>

              {/* Right — booking activity */}
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm lg:sticky lg:top-0 lg:self-start">
                <h3 className="mb-4 text-sm font-bold text-gray-900">Booking Activity</h3>
                <BookingActivityTimeline booking={booking} />
              </div>
            </div>
          )}
        </div>
      </div>

      {showETicket && booking && (
        <BookingETicketModal booking={booking} onClose={() => setShowETicket(false)} />
      )}
    </>
  );
}

function ConfirmDialog({
  title, message, confirmLabel, danger, onConfirm, onCancel, isPending,
}: {
  title: string; message: string; confirmLabel: string; danger?: boolean;
  onConfirm: () => void; onCancel: () => void; isPending?: boolean;
}) {
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onCancel} />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl border border-gray-200 bg-white p-6 shadow-2xl">
        <h3 className="text-sm font-bold text-gray-900">{title}</h3>
        <p className="mt-2 text-sm text-gray-600">{message}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onCancel} disabled={isPending} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50">Cancel</button>
          <button disabled={isPending} onClick={onConfirm} className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50 ${danger ? "bg-red-600 hover:bg-red-700" : "bg-emerald-600 hover:bg-emerald-700"}`}>
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </>
  );
}

export function BookingsPage({ initialSection = "all" }: { initialSection?: MainSection }) {
  const user = useAuthStore((s) => s.user);
  const isSuperAdmin = user?.is_super_admin ?? false;

  const [mainSection, setMainSection] = useState<MainSection>(initialSection);
  const [statusTab, setStatusTab] = useState<StatusTab>("all");
  const [manifestTab, setManifestTab] = useState<ManifestTab>("in");
  const [page, setPage] = useState(1);
  const [manifestPage, setManifestPage] = useState(1);
  const { search, setSearch, debouncedSearch, resetSearch } = useDebouncedSearch("", () => setPage(1));
  const { search: manifestSearch, setSearch: setManifestSearch, debouncedSearch: debouncedManifestSearch } = useDebouncedSearch("", () => setManifestPage(1));
  const [terminalFilter, setTerminalFilter] = useState("All");
  const [transferFilter, setTransferFilter] = useState<TransferType | "All">("All");
  const [transporterFilter, setTransporterFilter] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [dateField, setDateField] = useState<"created" | "completed">("created");
  const [showFilters, setShowFilters] = useState(false);

  const [detailBookingId, setDetailBookingId] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{
    title: string; message: string; confirmLabel: string; danger?: boolean;
    onConfirm: () => void;
  } | null>(null);

  const listParams: BookingsListParams = {
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
    status: statusTab !== "all" ? statusTab : undefined,
    terminal_name: terminalFilter !== "All" ? terminalFilter : undefined,
    transfer_type: transferFilter !== "All" ? transferFilter : undefined,
    transporter_company: transporterFilter !== "All" ? transporterFilter : undefined,
    date_field: dateFrom || dateTo ? dateField : undefined,
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
  };

  const manifestParams: BookingsManifestParams = {
    page: manifestPage,
    limit: PAGE_SIZE,
    search: debouncedManifestSearch || undefined,
    tab: manifestTab,
  };

  const manifestCountParams = (tab: ManifestTab): BookingsManifestParams => ({
    page: 1,
    limit: 1,
    search: debouncedManifestSearch || undefined,
    tab,
  });

  const { data: summary, isLoading: summaryLoading, dataUpdatedAt: summaryUpdatedAt } = useBookingsSummary(isSuperAdmin);
  const { data: bookingsData, isLoading, isError, dataUpdatedAt } = useBookings(listParams, isSuperAdmin && mainSection === "all");
  const { data: manifestData, isLoading: manifestLoading, isError: manifestError } = useBookingsManifest(
    manifestParams,
    isSuperAdmin && mainSection === "manifest",
  );
  const { data: inManifestCountData } = useBookingsManifest(
    manifestCountParams("in"),
    isSuperAdmin && mainSection === "manifest",
  );
  const { data: leftManifestCountData } = useBookingsManifest(
    manifestCountParams("left"),
    isSuperAdmin && mainSection === "manifest",
  );

  const removeFromManifest = useRemoveFromManifest();
  const addToManifest = useAddToManifest();
  const cancelBooking = useCancelBooking();
  const exportBookings = useExportBookings();

  const bookings = Array.isArray(bookingsData?.data) ? bookingsData.data : [];
  const meta = bookingsData?.meta;
  const totalPages = meta?.total_pages ?? 1;
  const totalCount = meta?.total ?? 0;

  const manifestBookings = Array.isArray(manifestData?.data) ? manifestData.data : [];
  const manifestMeta = manifestData?.meta;
  const manifestTotalPages = manifestMeta?.total_pages ?? 1;
  const manifestTotalCount = manifestMeta?.total ?? 0;

  const lastRefresh = formatTimestamp(new Date(summaryUpdatedAt || dataUpdatedAt || Date.now()).toISOString());

  const statusTabCounts = {
    all: summary?.total ?? 0,
    LIVE: summary?.live ?? 0,
    COMPLETED: summary?.completed ?? 0,
    CANCELLED: summary?.cancelled ?? 0,
    EXPIRED: summary?.expired ?? 0,
  };

  const hasActiveFilters =
    debouncedSearch || terminalFilter !== "All" || transferFilter !== "All" ||
    transporterFilter !== "All" || dateFrom || dateTo;

  const isActionPending = removeFromManifest.isPending || addToManifest.isPending || cancelBooking.isPending;

  function clearFilters() {
    resetSearch();
    setTerminalFilter("All");
    setTransferFilter("All");
    setTransporterFilter("All");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  }

  function handleExportCsv() {
    exportBookings.mutate(listParams, {
      onSuccess: () => toast.success("Bookings exported as CSV."),
    });
  }

  function handleRemoveFromManifest(booking: Booking) {
    removeFromManifest.mutate(booking.id, {
      onSuccess: (res) => {
        toast.success(res.message ?? `${booking.truck_plate_number} removed from manifest.`);
        setConfirm(null);
      },
    });
  }

  function handleAddToManifest(booking: Booking) {
    addToManifest.mutate(booking.id, {
      onSuccess: (res) => {
        toast.success(res.message ?? `${booking.truck_plate_number} added back to IN-MANIFEST.`);
        setConfirm(null);
      },
    });
  }

  function handleCancelBooking(booking: Booking) {
    cancelBooking.mutate(booking.id, {
      onSuccess: (res) => {
        toast.success(res.message ?? `Booking ${booking.booking_id} cancelled.`);
        setConfirm(null);
      },
    });
  }

  function InManifestActions({ booking }: { booking: Booking }) {
    return (
      <TableActionsDropdown>
        {(close) => (
          <>
            <button onClick={() => { close(); setDetailBookingId(booking.id); }} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"><Eye className="h-3.5 w-3.5" /> View Booking Details</button>
            <button onClick={() => { close(); setConfirm({ title: "Remove From Manifest", message: `Remove ${booking.truck_plate_number} from IN-MANIFEST?`, confirmLabel: "Remove", danger: true, onConfirm: () => handleRemoveFromManifest(booking) }); }} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-gray-50"><Ban className="h-3.5 w-3.5" /> Remove From Manifest</button>
          </>
        )}
      </TableActionsDropdown>
    );
  }

  function LeftManifestActions({ booking }: { booking: Booking }) {
    return (
      <TableActionsDropdown width={240}>
        {(close) => (
          <>
            <button onClick={() => { close(); setDetailBookingId(booking.id); }} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"><Eye className="h-3.5 w-3.5" /> View Tow Truck Request Details</button>
            <button onClick={() => { close(); setConfirm({ title: "Add to Manifest", message: `Re-list ${booking.truck_plate_number} in IN-MANIFEST?`, confirmLabel: "Add to Manifest", onConfirm: () => handleAddToManifest(booking) }); }} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-emerald-700 hover:bg-gray-50"><RotateCcw className="h-3.5 w-3.5" /> Add to Manifest</button>
            <button onClick={() => { close(); setConfirm({ title: "Cancel Booking", message: `Cancel booking ${booking.booking_id}?`, confirmLabel: "Cancel Booking", danger: true, onConfirm: () => handleCancelBooking(booking) }); }} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-gray-50"><Ban className="h-3.5 w-3.5" /> Cancel Booking</button>
          </>
        )}
      </TableActionsDropdown>
    );
  }

  const staticTH = (label: string) => (
    <th className="px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">{label}</th>
  );

  if (!isSuperAdmin) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-6">
        <Shield className="h-12 w-12 text-amber-400" />
        <h1 className="mt-4 text-lg font-bold text-gray-900">SuperAdmin Access Required</h1>
        <p className="mt-2 max-w-md text-center text-sm text-gray-500">The Bookings Database is restricted to SuperAdmin users only.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 p-6">
      {confirm && <ConfirmDialog {...confirm} onCancel={() => setConfirm(null)} isPending={isActionPending} />}
      {detailBookingId && <BookingDetailDrawer bookingId={detailBookingId} onClose={() => setDetailBookingId(null)} />}

      <nav className="flex items-center gap-1.5 text-xs text-gray-500">
        <span>Operations</span>
        <Chevron className="h-3 w-3" />
        <span className="font-semibold text-gray-800">Bookings</span>
      </nav>

      <SummaryPanel summary={summary} isLoading={summaryLoading} lastRefresh={lastRefresh} />

      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-6 pb-0 pt-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0f1e2e]">
              <BookOpen className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900">Bookings Management</h1>
              <p className="text-xs text-gray-500">All bookings database &amp; today&apos;s manifest</p>
            </div>
          </div>
          <div className="flex gap-0.5 overflow-x-auto">
            {([
              { id: "all" as MainSection, label: "All Bookings" },
              { id: "manifest" as MainSection, label: "Today's Manifest" },
            ]).map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setMainSection(tab.id); setPage(1); setManifestPage(1); }}
                className={`whitespace-nowrap rounded-t-lg border-b-2 px-4 py-3 text-xs font-semibold transition-colors ${
                  mainSection === tab.id ? "border-emerald-600 text-emerald-700" : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {mainSection === "all" ? (
        <>
          <div className="flex gap-0.5 overflow-x-auto rounded-xl border border-gray-200 bg-white p-1">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setStatusTab(tab.id); setPage(1); }}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                  statusTab === tab.id ? "bg-emerald-50 text-emerald-700" : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                {tab.label}
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${statusTab === tab.id ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                  {statusTabCounts[tab.id]}
                </span>
              </button>
            ))}
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-60 flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search booking ID, journey code, plate or driver..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-emerald-300 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                />
              </div>
              <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium ${showFilters || hasActiveFilters ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                <Filter className="h-4 w-4" /> Filters
              </button>
              <button
                onClick={handleExportCsv}
                disabled={exportBookings.isPending}
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              >
                {exportBookings.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                Export CSV
              </button>
            </div>
            {showFilters && (
              <div className="mt-3 flex flex-wrap items-end gap-4 border-t border-gray-100 pt-3">
                <div>
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-gray-400">Terminal</label>
                  <select value={terminalFilter} onChange={(e) => { setTerminalFilter(e.target.value); setPage(1); }} className="rounded-lg border border-gray-200 py-1.5 pl-3 pr-8 text-xs outline-none focus:border-emerald-300">
                    {TERMINAL_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-gray-400">Transfer Type</label>
                  <select value={transferFilter} onChange={(e) => { setTransferFilter(e.target.value as TransferType | "All"); setPage(1); }} className="rounded-lg border border-gray-200 py-1.5 pl-3 pr-8 text-xs outline-none focus:border-emerald-300">
                    {TRANSFER_TYPE_OPTIONS.map((o) => <option key={o} value={o}>{o === "All" ? "All Types" : TRANSFER_LABELS[o]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-gray-400">Transporter</label>
                  <select value={transporterFilter} onChange={(e) => { setTransporterFilter(e.target.value); setPage(1); }} className="rounded-lg border border-gray-200 py-1.5 pl-3 pr-8 text-xs outline-none focus:border-emerald-300">
                    {TRANSPORTER_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-gray-400">Date Field</label>
                  <select value={dateField} onChange={(e) => setDateField(e.target.value as "created" | "completed")} className="rounded-lg border border-gray-200 py-1.5 pl-3 pr-8 text-xs outline-none focus:border-emerald-300">
                    <option value="created">Creation Date</option>
                    <option value="completed">Completion Date</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-gray-400">From</label>
                  <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} className="rounded-lg border border-gray-200 py-1.5 pl-3 text-xs outline-none focus:border-emerald-300" />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-gray-400">To</label>
                  <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }} className="rounded-lg border border-gray-200 py-1.5 pl-3 text-xs outline-none focus:border-emerald-300" />
                </div>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="flex items-center gap-1 text-xs font-medium text-red-500 hover:bg-red-50 px-2 py-1.5 rounded-lg"><X className="h-3 w-3" /> Clear</button>
                )}
              </div>
            )}
          </div>

          <p className="text-xs text-gray-500">Showing <span className="font-semibold text-gray-800">{totalCount}</span> booking{totalCount !== 1 ? "s" : ""}</p>

          <div className="min-w-0 rounded-xl border border-gray-200 bg-white">
            <div className="overflow-x-auto">
              <table className="min-w-max w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/60">
                    {staticTH("S/No.")}
                    {staticTH("Booking ID")}
                    {staticTH("Truck")}
                    {staticTH("Plate No.")}
                    {staticTH("Driver")}
                    {staticTH("Transporter")}
                    {staticTH("Terminal")}
                    {staticTH("Transfer Type")}
                    {staticTH("Status")}
                    {staticTH("Created")}
                    {staticTH("Last Updated")}
                    <th className="px-3 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan={13} className="px-4 py-12 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
                          <p className="text-sm font-medium text-gray-400">Loading bookings...</p>
                        </div>
                      </td>
                    </tr>
                  ) : isError ? (
                    <tr>
                      <td colSpan={13} className="px-4 py-12 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <AlertCircle className="h-8 w-8 text-red-300" />
                          <p className="text-sm font-medium text-gray-400">Failed to load bookings</p>
                        </div>
                      </td>
                    </tr>
                  ) : bookings.length === 0 ? (
                    <tr>
                      <td colSpan={13} className="px-4 py-12 text-center text-sm text-gray-400">
                        No bookings match your filters
                        {hasActiveFilters && (
                          <button onClick={clearFilters} className="mt-2 block w-full text-xs font-medium text-emerald-600 hover:underline">Clear all filters</button>
                        )}
                      </td>
                    </tr>
                  ) : (
                    bookings.map((b, idx) => (
                      <tr key={b.id} className="hover:bg-gray-50/80">
                        <td className="px-3 py-3 text-xs text-gray-400">{(page - 1) * PAGE_SIZE + idx + 1}</td>
                        <td className="px-3 py-3">
                          <button onClick={() => setDetailBookingId(b.id)} className="font-mono text-xs font-bold text-emerald-700 hover:underline">{b.booking_id}</button>
                          <p className="text-[10px] text-gray-400">{b.journey_code}</p>
                        </td>
                        <td className="px-3 py-3">
                          <TruckPreviewTrigger booking={b}>
                            <TruckAvatar color={b.truck_color} />
                          </TruckPreviewTrigger>
                        </td>
                        <td className="px-3 py-3 font-mono text-xs font-semibold text-gray-800">{b.truck_plate_number}</td>
                        <td className="px-3 py-3"><p className="text-xs font-medium text-gray-800">{b.driver_name}</p></td>
                        <td className="px-3 py-3 text-xs text-gray-700">{b.transporter_company}</td>
                        <td className="px-3 py-3 text-xs text-gray-700">{b.terminal_name}</td>
                        <td className="px-3 py-3"><span className="rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-700">{TRANSFER_LABELS[b.transfer_type]}</span></td>
                        <td className="px-3 py-3"><StatusBadge status={b.status} /></td>
                        <td className="px-3 py-3 text-[11px] text-gray-500">{formatTimestamp(b.created_at)}</td>
                        <td className="px-3 py-3 text-[11px] text-gray-500">{formatTimestamp(b.last_updated_at)}</td>
                        <td className="px-3 py-3 text-center">
                          <button onClick={() => setDetailBookingId(b.id)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"><Eye className="h-4 w-4" /></button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
              <p className="text-xs text-gray-500">
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, totalCount)} of {totalCount}
              </p>
              <div className="flex items-center gap-1">
                <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-lg border border-gray-200 p-1.5 disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium ${p === page ? "bg-emerald-600 text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
                  >
                    {p}
                  </button>
                ))}
                <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="rounded-lg border border-gray-200 p-1.5 disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="flex gap-0.5 rounded-xl border border-gray-200 bg-white p-1">
            {([
              { id: "in" as ManifestTab, label: "IN-MANIFEST", count: inManifestCountData?.meta?.total ?? 0 },
              { id: "left" as ManifestTab, label: "LEFT-MANIFEST", count: leftManifestCountData?.meta?.total ?? 0 },
            ]).map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setManifestTab(tab.id); setManifestPage(1); }}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-xs font-semibold transition-colors ${
                  manifestTab === tab.id ? "bg-emerald-50 text-emerald-700" : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                {tab.label}
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${manifestTab === tab.id ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>{tab.count}</span>
              </button>
            ))}
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search booking ID or plate number..."
                value={manifestSearch}
                onChange={(e) => setManifestSearch(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-emerald-300 focus:bg-white"
              />
            </div>
          </div>

          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-[11px] text-blue-700">
            {manifestTab === "in" ? (
              <p><span className="font-semibold">IN-MANIFEST:</span> Trucks with LEFT-PREGATE status. Once gated into a terminal, trucks are automatically removed from this list.</p>
            ) : (
              <p><span className="font-semibold">LEFT-MANIFEST:</span> Trucks that requested a tow truck — delisted from scheduling pool. Adding back to manifest moves them to IN-MANIFEST.</p>
            )}
          </div>

          <div className="min-w-0 rounded-xl border border-gray-200 bg-white overflow-x-auto">
            <table className="min-w-max w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  {staticTH("Booking ID")}
                  {staticTH("Plate No.")}
                  {staticTH("Category")}
                  {staticTH("Left-Pregate")}
                  {manifestTab === "left" && staticTH("Left-Manifest")}
                  {staticTH("Terminal Destination")}
                  {staticTH("Booked By")}
                  {staticTH("Owned By")}
                  <th className="px-3 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {manifestLoading ? (
                  <tr>
                    <td colSpan={manifestTab === "in" ? 8 : 9} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
                        <p className="text-sm font-medium text-gray-400">Loading manifest...</p>
                      </div>
                    </td>
                  </tr>
                ) : manifestError ? (
                  <tr>
                    <td colSpan={manifestTab === "in" ? 8 : 9} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <AlertCircle className="h-8 w-8 text-red-300" />
                        <p className="text-sm font-medium text-gray-400">Failed to load manifest</p>
                      </div>
                    </td>
                  </tr>
                ) : manifestBookings.length === 0 ? (
                  <tr><td colSpan={manifestTab === "in" ? 8 : 9} className="px-4 py-12 text-center text-sm text-gray-400">No trucks in this manifest</td></tr>
                ) : (
                  manifestBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-gray-50/80">
                      <td className="px-3 py-3 font-mono text-xs font-bold text-emerald-700">{b.booking_id}</td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <TruckPreviewTrigger booking={b}>
                            <TruckAvatar color={b.truck_color} />
                          </TruckPreviewTrigger>
                          <span className="font-mono text-xs font-semibold text-gray-800">{b.truck_plate_number}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3"><span className="rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-medium">{CATEGORY_LABELS[b.booking_category]}</span></td>
                      <td className="px-3 py-3 text-[11px] text-gray-500">{b.left_pregate_at ? formatTimestamp(b.left_pregate_at) : "—"}</td>
                      {manifestTab === "left" && <td className="px-3 py-3 text-[11px] text-gray-500">{b.left_manifest_at ? formatTimestamp(b.left_manifest_at) : "—"}</td>}
                      <td className="px-3 py-3 text-xs text-gray-700">{b.terminal_destination}</td>
                      <td className="px-3 py-3 text-xs text-gray-700">{b.truck_booked_by}</td>
                      <td className="px-3 py-3 text-xs text-gray-700">{b.truck_owned_by}</td>
                      <td className="px-3 py-3 text-center">
                        {manifestTab === "in" ? <InManifestActions booking={b} /> : <LeftManifestActions booking={b} />}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
              <p className="text-xs text-gray-500">
                Showing {(manifestPage - 1) * PAGE_SIZE + 1}–{Math.min(manifestPage * PAGE_SIZE, manifestTotalCount)} of {manifestTotalCount}
              </p>
              <div className="flex items-center gap-1">
                <button disabled={manifestPage <= 1} onClick={() => setManifestPage((p) => p - 1)} className="rounded-lg border border-gray-200 p-1.5 disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button>
                {Array.from({ length: manifestTotalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setManifestPage(p)}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium ${p === manifestPage ? "bg-emerald-600 text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
                  >
                    {p}
                  </button>
                ))}
                <button disabled={manifestPage >= manifestTotalPages} onClick={() => setManifestPage((p) => p + 1)} className="rounded-lg border border-gray-200 p-1.5 disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button>
              </div>
            </div>
          </div>
        </>
      )}

   
    </div>
  );
}

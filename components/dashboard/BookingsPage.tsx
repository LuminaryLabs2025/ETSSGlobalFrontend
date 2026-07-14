"use client";

import { useState } from "react";
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
  MoreHorizontal,
  Shield,
  Truck,
  RefreshCw,
  History,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Loader2,
  AlertCircle,
  Download,
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

function BookingDetailDrawer({ bookingId, onClose }: { bookingId: string; onClose: () => void }) {
  const { data: booking, isLoading, isError } = useBooking(bookingId);

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[520px] flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between bg-[#0f1e2e] px-6 py-4">
          <div>
            <p className="font-mono text-sm font-bold text-white">{booking?.booking_id ?? "Loading..."}</p>
            <p className="text-[11px] text-gray-400">{booking?.journey_code ?? ""}</p>
          </div>
          <div className="flex items-center gap-2">
            {booking && <StatusBadge status={booking.status} />}
            <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-white/10"><X className="h-4 w-4" /></button>
          </div>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex flex-col items-center gap-2 py-12">
              <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
              <p className="text-sm text-gray-400">Loading booking details...</p>
            </div>
          ) : isError || !booking ? (
            <div className="flex flex-col items-center gap-2 py-12">
              <AlertCircle className="h-8 w-8 text-red-300" />
              <p className="text-sm text-gray-400">Failed to load booking details</p>
            </div>
          ) : (
            <>
          <div className="flex items-center gap-3 rounded-xl border border-gray-100 p-4">
            <TruckAvatar color={booking.truck_color} />
            <div>
              <p className="font-mono text-sm font-bold text-gray-900">{booking.truck_plate_number}</p>
              <p className="text-xs text-gray-600">{booking.driver_name} · {booking.driver_id}</p>
            </div>
          </div>

          <div className="rounded-xl border border-gray-100">
            <p className="border-b border-gray-100 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Transporter &amp; Terminal</p>
            <div className="divide-y divide-gray-50">
              {[
                ["Transporter", booking.transporter_company],
                ["Terminal", booking.terminal_name],
                ["Destination", booking.terminal_destination],
                ["Transfer Type", TRANSFER_LABELS[booking.transfer_type]],
                ["Booked By", booking.truck_booked_by],
                ["Owned By", booking.truck_owned_by],
              ].map(([label, value]) => (
                <div key={String(label)} className="flex justify-between gap-4 px-4 py-2.5">
                  <p className="text-xs text-gray-500">{String(label)}</p>
                  <p className="text-right text-xs font-medium text-gray-800">{String(value)}</p>
                </div>
              ))}
            </div>
          </div>

          {(booking.exceptions?.length ?? 0) > 0 && (
            <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-4">
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
            <div className="rounded-xl border border-violet-100 bg-violet-50/50 p-4">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-violet-600">Tow Truck Request</p>
              <p className="text-xs text-gray-700">{booking.tow_truck_request.reason}</p>
              <p className="mt-1 text-[11px] text-gray-500">Requested by {booking.tow_truck_request.requested_by}</p>
              {booking.tow_truck_request.tow_company && (
                <p className="text-[11px] text-gray-500">Tow company: {booking.tow_truck_request.tow_company}</p>
              )}
              <p className="mt-0.5 text-[10px] text-gray-400">{formatTimestamp(booking.tow_truck_request.requested_at)}</p>
            </div>
          )}

          <div className="rounded-xl border border-gray-100">
            <p className="border-b border-gray-100 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              <History className="mr-1 inline h-3.5 w-3.5" /> Booking Timeline
            </p>
            <div className="divide-y divide-gray-50">
              {[...(booking.timeline ?? [])].reverse().map((entry) => (
                <div key={entry.id} className="px-4 py-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-gray-800">{formatLabel(entry.status)}</p>
                    <span className="text-[10px] text-gray-400">{formatTimestamp(entry.timestamp)}</span>
                  </div>
                  {entry.notes && <p className="mt-0.5 text-[11px] text-gray-500">{entry.notes}</p>}
                  {entry.performed_by && <p className="text-[10px] text-gray-400">{entry.performed_by}</p>}
                </div>
              ))}
            </div>
          </div>
            </>
          )}
        </div>
      </div>
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
    const [open, setOpen] = useState(false);
    return (
      <div className="relative">
        <button onClick={() => setOpen(!open)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"><MoreHorizontal className="h-4 w-4" /></button>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <div className="absolute right-0 top-full z-20 mt-1 w-56 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
              <button onClick={() => { setOpen(false); setDetailBookingId(booking.id); }} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"><Eye className="h-3.5 w-3.5" /> View Booking Details</button>
              <button onClick={() => { setOpen(false); setConfirm({ title: "Remove From Manifest", message: `Remove ${booking.truck_plate_number} from IN-MANIFEST?`, confirmLabel: "Remove", danger: true, onConfirm: () => handleRemoveFromManifest(booking) }); }} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-gray-50"><Ban className="h-3.5 w-3.5" /> Remove From Manifest</button>
            </div>
          </>
        )}
      </div>
    );
  }

  function LeftManifestActions({ booking }: { booking: Booking }) {
    const [open, setOpen] = useState(false);
    return (
      <div className="relative">
        <button onClick={() => setOpen(!open)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"><MoreHorizontal className="h-4 w-4" /></button>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <div className="absolute right-0 top-full z-20 mt-1 w-60 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
              <button onClick={() => { setOpen(false); setDetailBookingId(booking.id); }} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"><Eye className="h-3.5 w-3.5" /> View Tow Truck Request Details</button>
              <button onClick={() => { setOpen(false); setConfirm({ title: "Add to Manifest", message: `Re-list ${booking.truck_plate_number} in IN-MANIFEST?`, confirmLabel: "Add to Manifest", onConfirm: () => handleAddToManifest(booking) }); }} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-emerald-700 hover:bg-gray-50"><RotateCcw className="h-3.5 w-3.5" /> Add to Manifest</button>
              <button onClick={() => { setOpen(false); setConfirm({ title: "Cancel Booking", message: `Cancel booking ${booking.booking_id}?`, confirmLabel: "Cancel Booking", danger: true, onConfirm: () => handleCancelBooking(booking) }); }} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-gray-50"><Ban className="h-3.5 w-3.5" /> Cancel Booking</button>
            </div>
          </>
        )}
      </div>
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
                        <td className="px-3 py-3"><TruckAvatar color={b.truck_color} /></td>
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
                      <td className="px-3 py-3 font-mono text-xs font-semibold text-gray-800">{b.truck_plate_number}</td>
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

      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
        <p className="text-[11px] leading-relaxed text-amber-700">
          <span className="font-semibold">Audit Notice:</span> All booking updates and SuperAdmin interactions (filters, record views, manifest actions) are logged for audit purposes.
        </p>
      </div>
    </div>
  );
}

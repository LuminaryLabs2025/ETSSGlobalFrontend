"use client";

import { useMemo, useState } from "react";
import { AlertCircle, Eye, Loader2, Search } from "lucide-react";
import { useFacilities } from "@/hooks/facilities/useFacilities";
import { useTerminals } from "@/hooks/terminals/useTerminals";
import { useFacilityQueue, usePregateQueue } from "@/hooks/bookings/useBookingOps";
import type { Booking } from "@/types/bookings.types";
import type { BookingQueueEntry } from "@/types/booking-ops.types";

const QUEUE_PAGE_SIZE = 20;

function PriorityBadge({ level }: { level: NonNullable<Booking["priority_level"]> }) {
  const map: Record<NonNullable<Booking["priority_level"]>, string> = {
    HIGH: "bg-red-50 text-red-700 border-red-200",
    MEDIUM: "bg-amber-50 text-amber-800 border-amber-200",
    LOW: "bg-gray-100 text-gray-600 border-gray-200",
  };
  const labels = { HIGH: "High", MEDIUM: "Medium", LOW: "Low" };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${map[level]}`}
    >
      {labels[level]}
    </span>
  );
}

function formatTimestamp(ts: string) {
  return new Date(ts).toLocaleString("en-NG", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function staticTH(label: string) {
  return (
    <th className="px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">
      {label}
    </th>
  );
}

export function BookingQueueSection({
  onViewBooking,
}: {
  onViewBooking: (bookingId: string) => void;
}) {
  const [queueTab, setQueueTab] = useState<"facility" | "pregate">("facility");
  const [facilityId, setFacilityId] = useState("");
  const [terminalId, setTerminalId] = useState("");
  const [page, setPage] = useState(1);

  const { data: facilitiesData } = useFacilities({ limit: 100 });
  const { data: terminalsData } = useTerminals({ limit: 100 });

  const facilityOptions = useMemo(
    () => (facilitiesData?.data ?? []).map((f) => ({ value: f.id, label: f.name })),
    [facilitiesData],
  );
  const terminalOptions = useMemo(
    () => (terminalsData?.data ?? []).map((t) => ({ value: t.id, label: t.name })),
    [terminalsData],
  );

  const facilityQueueParams = useMemo(
    () => (facilityId ? { facility_id: facilityId, page, limit: QUEUE_PAGE_SIZE } : undefined),
    [facilityId, page],
  );
  const pregateQueueParams = useMemo(
    () =>
      terminalId ? { terminal_id: terminalId, page, limit: QUEUE_PAGE_SIZE } : undefined,
    [terminalId, page],
  );

  const {
    data: facilityQueue,
    isLoading: facilityLoading,
    isError: facilityError,
  } = useFacilityQueue(facilityQueueParams, queueTab === "facility");
  const {
    data: pregateQueue,
    isLoading: pregateLoading,
    isError: pregateError,
  } = usePregateQueue(pregateQueueParams, queueTab === "pregate");

  const queueData = queueTab === "facility" ? facilityQueue : pregateQueue;
  const isLoading = queueTab === "facility" ? facilityLoading : pregateLoading;
  const isError = queueTab === "facility" ? facilityError : pregateError;
  const entries: BookingQueueEntry[] = queueData?.data ?? [];
  const totalCount = queueData?.meta?.total ?? 0;
  const totalPages = queueData?.meta?.total_pages ?? 1;

  const selectedSiteId = queueTab === "facility" ? facilityId : terminalId;
  const siteOptions = queueTab === "facility" ? facilityOptions : terminalOptions;

  function handleTabChange(tab: "facility" | "pregate") {
    setQueueTab(tab);
    setPage(1);
  }

  function handleSiteChange(id: string) {
    if (queueTab === "facility") {
      setFacilityId(id);
    } else {
      setTerminalId(id);
    }
    setPage(1);
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-[11px] text-blue-700">
        <p>
          <span className="font-semibold">FIFO priority queue</span> — ordered by priority rank,
          then check-in time, then match time. GTG actions only succeed for the #1 truck in each
          queue.
        </p>
      </div>

      <div className="flex gap-0.5 rounded-xl border border-gray-200 bg-white p-1">
        {([
          { id: "facility" as const, label: "Facility Queue" },
          { id: "pregate" as const, label: "Pregate Queue" },
        ]).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => handleTabChange(tab.id)}
            className={`flex-1 rounded-lg px-4 py-2.5 text-xs font-semibold transition-colors ${
              queueTab === tab.id ? "bg-emerald-50 text-emerald-700" : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              {queueTab === "facility" ? "Select Facility" : "Select Terminal"}
            </label>
            <select
              value={selectedSiteId}
              onChange={(e) => handleSiteChange(e.target.value)}
              className="w-full rounded-lg border border-gray-200 py-2 pl-3 pr-8 text-sm outline-none focus:border-emerald-300"
            >
              <option value="">
                {queueTab === "facility" ? "Choose a facility…" : "Choose a terminal…"}
              </option>
              {siteOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <p className="text-xs text-gray-500">
              {selectedSiteId ? (
                <>
                  Showing <span className="font-semibold text-gray-800">{totalCount}</span> queued
                  booking{totalCount !== 1 ? "s" : ""}
                </>
              ) : (
                "Select a site to load its queue"
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="min-w-0 overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="min-w-max w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/60">
              {staticTH("#")}
              {staticTH("Booking ID")}
              {staticTH("Plate No.")}
              {staticTH("Priority")}
              {staticTH("In Facility")}
              {staticTH("Matched")}
              {staticTH("Transporter")}
              <th className="px-3 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {!selectedSiteId ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-sm text-gray-400">
                  <Search className="mx-auto mb-2 h-6 w-6 text-gray-300" />
                  Select a {queueTab === "facility" ? "facility" : "terminal"} to view the queue
                </td>
              </tr>
            ) : isLoading ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-emerald-500" />
                  <p className="mt-2 text-sm text-gray-400">Loading queue…</p>
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center">
                  <AlertCircle className="mx-auto h-8 w-8 text-red-300" />
                  <p className="mt-2 text-sm text-gray-400">Failed to load queue</p>
                </td>
              </tr>
            ) : entries.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-sm text-gray-400">
                  No bookings in this queue
                </td>
              </tr>
            ) : (
              entries.map((entry) => (
                <tr
                  key={entry.id}
                  className={`hover:bg-gray-50/80 ${entry.queue_position === 1 ? "bg-emerald-50/40" : ""}`}
                >
                  <td className="px-3 py-3">
                    <span
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                        entry.queue_position === 1
                          ? "bg-emerald-600 text-white"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {entry.queue_position}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <button
                      type="button"
                      onClick={() => onViewBooking(entry.id)}
                      className="font-mono text-xs font-bold text-emerald-700 hover:underline"
                    >
                      {entry.booking_id}
                    </button>
                    <p className="text-[10px] text-gray-400">{entry.journey_code}</p>
                  </td>
                  <td className="px-3 py-3 font-mono text-xs font-semibold text-gray-800">
                    {entry.truck_plate_number}
                  </td>
                  <td className="px-3 py-3">
                    {entry.priority_level ? (
                      <PriorityBadge level={entry.priority_level} />
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-[11px] text-gray-500">
                    {entry.in_facility_at ? formatTimestamp(entry.in_facility_at) : "—"}
                  </td>
                  <td className="px-3 py-3 text-[11px] text-gray-500">
                    {entry.matched_at ? formatTimestamp(entry.matched_at) : "—"}
                  </td>
                  <td className="px-3 py-3 text-xs text-gray-700">{entry.transporter_company}</td>
                  <td className="px-3 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => onViewBooking(entry.id)}
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {selectedSiteId && totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
            <p className="text-xs text-gray-500">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-1">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-lg border border-gray-200 px-3 py-1 text-xs disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border border-gray-200 px-3 py-1 text-xs disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

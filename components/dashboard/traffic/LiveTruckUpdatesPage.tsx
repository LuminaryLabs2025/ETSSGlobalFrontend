"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  Loader2,
  Route,
  ListFilter,
  Truck,
} from "lucide-react";
import { TrafficCommandShell } from "@/components/dashboard/traffic/TrafficCommandShell";
import { LiveTrucksStageSummaryPanel } from "@/components/dashboard/traffic/LiveTrucksStageSummaryPanel";
import { useTrafficLiveTick } from "@/hooks/traffic/useTrafficLiveTick";
import { useLiveTrucks } from "@/hooks/traffic/useLiveTrucks";
import { useLiveTrucksSummary } from "@/hooks/traffic/useLiveTrucksSummary";
import type { LiveTruckMovement } from "@/types/traffic.types";

type ListView = "route" | "status";

type MovementSection = {
  key: string;
  label: string;
  order: number;
  trucks: LiveTruckMovement[];
};

function groupByStageGroup(movements: LiveTruckMovement[]): MovementSection[] {
  const map = new Map<string, MovementSection>();
  for (const truck of movements) {
    const key = truck.stageGroup || "UNKNOWN";
    let section = map.get(key);
    if (!section) {
      section = {
        key,
        label: truck.stageGroupLabel || key.replace(/_/g, " "),
        order: truck.stageGroupOrder,
        trucks: [],
      };
      map.set(key, section);
    }
    section.trucks.push(truck);
  }
  return [...map.values()].sort((a, b) => a.order - b.order);
}

function groupByStage(movements: LiveTruckMovement[]): MovementSection[] {
  const map = new Map<string, MovementSection>();
  for (const truck of movements) {
    const key = truck.stage || "UNKNOWN";
    let section = map.get(key);
    if (!section) {
      section = {
        key,
        label: truck.status || key.replace(/_/g, " "),
        order: truck.stageGroupOrder,
        trucks: [],
      };
      map.set(key, section);
    } else {
      section.order = Math.min(section.order, truck.stageGroupOrder);
    }
    section.trucks.push(truck);
  }
  return [...map.values()].sort((a, b) => a.order - b.order);
}

export function LiveTruckUpdatesPage() {
  const { lastUpdated: tickUpdated } = useTrafficLiveTick();
  const [listView, setListView] = useState<ListView>("route");
  const { data, isLoading, isError, refetch, isFetching } = useLiveTrucks();
  const {
    data: summary,
    isLoading: summaryLoading,
    isError: summaryError,
    isFetching: summaryFetching,
    refetch: refetchSummary,
  } = useLiveTrucksSummary();

  const movements = data?.movements ?? [];

  const summaryLastUpdated = useMemo(() => {
    if (summary?.lastUpdated) {
      const parsed = new Date(summary.lastUpdated);
      if (!Number.isNaN(parsed.getTime())) return parsed;
    }
    return tickUpdated;
  }, [summary?.lastUpdated, tickUpdated]);

  const listSections = useMemo(() => {
    return listView === "route" ? groupByStageGroup(movements) : groupByStage(movements);
  }, [movements, listView]);

  return (
    <TrafficCommandShell
      title="Live Truck Updates"
      subtitle="Real-time truck movement and operational flow across the logistics network."
    >
      <LiveTrucksStageSummaryPanel
        title="Live truck updates — at a glance"
        subtitle={
          (summaryFetching && !summaryLoading) || (isFetching && !isLoading)
            ? "Refreshing live movement data…"
            : "Booking counts by operational stage"
        }
        lastUpdated={summaryLastUpdated}
        totalBookings={summary?.totalBookings ?? 0}
        byStage={summary?.byStage ?? []}
        loading={summaryLoading}
      />

      {(isError || summaryError) && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {summaryError && isError
              ? "Failed to load live truck summary and movement listing."
              : summaryError
                ? "Failed to load live truck summary."
                : "Failed to load live truck movement listing."}
          </div>
          <button
            type="button"
            onClick={() => {
              if (summaryError) void refetchSummary();
              if (isError) void refetch();
            }}
            className="rounded-lg border border-red-300 bg-white px-3 py-1 text-xs font-semibold"
          >
            Retry
          </button>
        </div>
      )}

      <div className="min-w-0 rounded-xl border border-gray-200 bg-white">
        <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-emerald-600" />
            <div>
              <h2 className="text-sm font-bold text-gray-900">Trucks Currently On Trip</h2>
              <p className="text-xs text-gray-500">Live listing — updates as statuses change</p>
            </div>
          </div>
          <div className="flex gap-0.5 rounded-lg border border-gray-200 bg-gray-50 p-0.5">
            <button
              type="button"
              onClick={() => setListView("route")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold ${
                listView === "route" ? "bg-white text-emerald-700 shadow-sm" : "text-gray-500"
              }`}
            >
              <Route className="h-3.5 w-3.5" />
              By Route
            </button>
            <button
              type="button"
              onClick={() => setListView("status")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold ${
                listView === "status" ? "bg-white text-emerald-700 shadow-sm" : "text-gray-500"
              }`}
            >
              <ListFilter className="h-3.5 w-3.5" />
              By Status
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center gap-2 px-5 py-16">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
            <p className="text-sm text-gray-400">Loading live truck movements…</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {listSections.length === 0 ? (
              <p className="px-5 py-12 text-center text-sm text-gray-400">
                No truck movements returned for the current feed.
              </p>
            ) : (
              listSections.map((section) => (
                <div key={section.key} className="p-5">
                  <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    {section.label}
                  </p>
                  <div className="overflow-x-auto">
                    <table className="min-w-max w-full">
                      <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/60 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                          <th className="px-3 py-3">Plate No.</th>
                          <th className="px-3 py-3">Driver</th>
                          <th className="px-3 py-3">Current Location</th>
                          <th className="px-3 py-3">Destination</th>
                          <th className="px-3 py-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {section.trucks.map((t) => (
                          <tr key={t.id} className="hover:bg-gray-50/80">
                            <td className="px-3 py-3 font-mono text-xs font-semibold text-gray-900">
                              {t.plateNumber}
                            </td>
                            <td className="px-3 py-3 text-xs text-gray-700">{t.driverName}</td>
                            <td className="px-3 py-3 text-xs text-gray-600">{t.currentLocation}</td>
                            <td className="px-3 py-3 text-xs text-gray-600">{t.destination}</td>
                            <td className="px-3 py-3">
                              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700">
                                {t.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </TrafficCommandShell>
  );
}

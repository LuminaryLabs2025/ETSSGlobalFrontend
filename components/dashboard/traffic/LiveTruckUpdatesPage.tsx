"use client";

import { useMemo, useState } from "react";
import {
  DoorOpen,
  Landmark,
  Route,
  ListFilter,
  Truck,
  Warehouse,
} from "lucide-react";
import { TrafficCommandShell } from "@/components/dashboard/traffic/TrafficCommandShell";
import {
  TrafficSummaryPanel,
  type TrafficSummaryKpi,
} from "@/components/dashboard/traffic/TrafficSummaryPanel";
import { useTrafficLiveTick } from "@/hooks/traffic/useTrafficLiveTick";
import {
  jitterCount,
  LIVE_TRUCK_MOVEMENTS,
  TRAFFIC_STATUS_CARDS,
  type TrafficStatusCardKey,
  type TruckMovementRoute,
} from "@/lib/traffic-command-mock-data";

const STATUS_KPI_META: Record<
  TrafficStatusCardKey,
  Pick<TrafficSummaryKpi, "color" | "bg" | "Icon">
> = {
  ON_TRIP: { color: "text-blue-400", bg: "bg-blue-400/10", Icon: Truck },
  LEFT_FACILITY: {
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    Icon: Warehouse,
  },
  LEFT_PREGATE: {
    color: "text-orange-400",
    bg: "bg-orange-400/10",
    Icon: DoorOpen,
  },
  IN_TERMINAL: {
    color: "text-gray-400",
    bg: "bg-gray-400/10",
    Icon: Landmark,
  },
};

type ListView = "route" | "status";

const ROUTE_GROUP_LABELS: Record<TruckMovementRoute, string> = {
  FACILITY_TO_TRANSIT_PARK: "Facility → Transit Park",
  TRANSIT_PARK_TO_TERMINAL: "Transit Park → Port Terminal",
  IN_FACILITY: "In-Facility",
  IN_TRANSIT: "In-Transit",
  IN_TERMINAL: "In-Terminal",
};

export function LiveTruckUpdatesPage() {
  const { tick, lastUpdated } = useTrafficLiveTick();
  const [listView, setListView] = useState<ListView>("route");

  const statusCounts = useMemo(
    () =>
      TRAFFIC_STATUS_CARDS.map((card) => ({
        ...card,
        count: jitterCount(card.baseCount + tick % 3),
      })),
    [tick],
  );

  const groupedByRoute = useMemo(() => {
    const groups = new Map<string, typeof LIVE_TRUCK_MOVEMENTS>();
    for (const truck of LIVE_TRUCK_MOVEMENTS) {
      const key = ROUTE_GROUP_LABELS[truck.routeGroup];
      const list = groups.get(key) ?? [];
      list.push(truck);
      groups.set(key, list);
    }
    return [...groups.entries()];
  }, []);

  const groupedByStatus = useMemo(() => {
    const groups = new Map<string, typeof LIVE_TRUCK_MOVEMENTS>();
    for (const truck of LIVE_TRUCK_MOVEMENTS) {
      const list = groups.get(truck.status) ?? [];
      list.push(truck);
      groups.set(truck.status, list);
    }
    return [...groups.entries()];
  }, []);

  const listGroups = listView === "route" ? groupedByRoute : groupedByStatus;

  const summaryCards: TrafficSummaryKpi[] = useMemo(() => {
    const onTripList = statusCounts.map((card) => {
      const meta = STATUS_KPI_META[card.key];
      return {
        label: card.label,
        value: card.count,
        ...meta,
      };
    });
    const listedTrucks = LIVE_TRUCK_MOVEMENTS.length;
    return [
      ...onTripList,
      {
        label: "Trucks on live listing",
        value: listedTrucks,
        color: "text-cyan-400",
        bg: "bg-cyan-400/10",
        Icon: Route,
      },
    ];
  }, [statusCounts]);

  return (
    <TrafficCommandShell
      title="Live Truck Updates"
      subtitle="Real-time truck movement and operational flow across the logistics network."
    >
      <TrafficSummaryPanel
        title="Live truck updates — at a glance"
        subtitle="Status counts refresh automatically from the live movement database"
        lastUpdated={lastUpdated}
        cards={summaryCards}
        gridClassName="grid-cols-2 sm:grid-cols-3 xl:grid-cols-5"
      />

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

        <div className="divide-y divide-gray-100">
          {listGroups.map(([groupLabel, trucks]) => (
            <div key={groupLabel} className="p-5">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                {groupLabel}
              </p>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px]">
                  <thead>
                    <tr className="text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                      <th className="pb-2 pr-4">Plate No.</th>
                      <th className="pb-2 pr-4">Driver</th>
                      <th className="pb-2 pr-4">Current Location</th>
                      <th className="pb-2 pr-4">Destination</th>
                      <th className="pb-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {trucks.map((t) => (
                      <tr key={t.id} className="text-sm">
                        <td className="py-2.5 pr-4 font-mono text-xs font-semibold text-gray-900">
                          {t.plateNumber}
                        </td>
                        <td className="py-2.5 pr-4 text-xs text-gray-700">{t.driverName}</td>
                        <td className="py-2.5 pr-4 text-xs text-gray-600">{t.currentLocation}</td>
                        <td className="py-2.5 pr-4 text-xs text-gray-600">{t.destination}</td>
                        <td className="py-2.5">
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
          ))}
        </div>
      </div>
    </TrafficCommandShell>
  );
}

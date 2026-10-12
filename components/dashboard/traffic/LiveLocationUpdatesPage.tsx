"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  Clock,
  DoorOpen,
  Loader2,
  MapPin,
  Minus,
  Plus,
  Radio,
  Warehouse,
} from "lucide-react";
import { TrafficCommandShell } from "@/components/dashboard/traffic/TrafficCommandShell";
import {
  TrafficSummaryPanel,
  type TrafficSummaryKpi,
} from "@/components/dashboard/traffic/TrafficSummaryPanel";
import { useTrafficLiveTick } from "@/hooks/traffic/useTrafficLiveTick";
import { useTrafficLocations } from "@/hooks/traffic/useTrafficLocations";
import type {
  LocationKind,
  TrafficLocationsParams,
  TrafficMapLocation,
} from "@/types/traffic.types";

const DEFAULT_KIND_STYLE = { dot: "bg-slate-500", label: "Site" };

const KIND_COLORS: Record<LocationKind, { dot: string; label: string }> = {
  FACILITY: { dot: "bg-blue-500", label: "Facility" },
  FACILITY_PREGATE: { dot: "bg-emerald-500", label: "Facility-Pregate" },
  PREGATE: { dot: "bg-orange-500", label: "Pregate" },
  EPT: { dot: "bg-violet-500", label: "EPT" },
  TERMINAL: { dot: "bg-slate-700", label: "Terminal" },
  TRANSIT_PARK: { dot: "bg-teal-500", label: "Transit Park" },
};

function kindStyle(kind: LocationKind) {
  return KIND_COLORS[kind] ?? DEFAULT_KIND_STYLE;
}

const PARK_TYPE_FILTERS: { value: string; label: string }[] = [
  { value: "All", label: "All park types" },
  { value: "BONDED_TERMINAL", label: "Bonded Terminal" },
  { value: "TRUCK_PARK", label: "Truck Park" },
  { value: "FISH_VAN_PARK", label: "Fish-Van Park" },
  { value: "PREGATE", label: "Pregate" },
  { value: "EPT", label: "EPT" },
  { value: "PORT_TERMINAL", label: "Port Terminal" },
  { value: "NON_PORT_TERMINAL", label: "Non-Port Terminal" },
];

const KIND_FILTERS: { value: LocationKind | "All"; label: string }[] = [
  { value: "All", label: "All types" },
  { value: "FACILITY", label: "Facility" },
  { value: "FACILITY_PREGATE", label: "Facility-Pregate" },
  { value: "PREGATE", label: "Pregate" },
  { value: "EPT", label: "EPT" },
  { value: "TERMINAL", label: "Terminal" },
];

function LocationDetailCard({ loc }: { loc: TrafficMapLocation }) {
  const kind = kindStyle(loc.facilityKind);
  const tatDisplay =
    loc.hourlyTatLabel
    ?? (loc.hourlyTatMinutes != null ? `${loc.hourlyTatMinutes} min avg` : "—");
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-lg">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-bold text-gray-900">{loc.name}</p>
          <p className="text-[11px] text-gray-500">Park ID: {loc.parkId}</p>
        </div>
        {!loc.online && (
          <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
            <AlertTriangle className="h-3 w-3" />
            Offline
          </span>
        )}
      </div>
      <dl className="mt-3 space-y-1.5 text-xs">
        <div className="flex justify-between gap-2">
          <dt className="text-gray-500">Park Type</dt>
          <dd className="font-medium text-gray-800">{loc.parkType}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-gray-500">Facility Type</dt>
          <dd className="font-medium text-gray-800">{loc.kindLabel || kind.label}</dd>
        </div>
        {loc.trucksOnSite != null && (
          <div className="flex justify-between gap-2">
            <dt className="text-gray-500">Trucks on site</dt>
            <dd className="font-medium text-gray-800">
              {loc.trucksOnSite}
              {loc.capacity != null ? ` / ${loc.capacity}` : ""}
            </dd>
          </div>
        )}
        <div className="flex justify-between gap-2">
          <dt className="text-gray-500">ATAT</dt>
          <dd className="font-medium text-gray-800">{tatDisplay}</dd>
        </div>
      </dl>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <div className="rounded-lg bg-gray-50 p-2.5">
          <p className="text-[10px] font-semibold uppercase text-gray-400">Entry Gate</p>
          <p className="text-xs font-medium text-gray-800">{loc.entryBarrier.id}</p>
          <p className="text-[11px] text-gray-600">Status: {loc.entryBarrier.status}</p>
          <p className="text-[11px] text-gray-600">Tagged in/hr: {loc.entryBarrier.taggedPerHour}</p>
        </div>
        <div className="rounded-lg bg-gray-50 p-2.5">
          <p className="text-[10px] font-semibold uppercase text-gray-400">Exit Gate</p>
          <p className="text-xs font-medium text-gray-800">{loc.exitBarrier.id}</p>
          <p className="text-[11px] text-gray-600">Status: {loc.exitBarrier.status}</p>
          <p className="text-[11px] text-gray-600">Tagged out/hr: {loc.exitBarrier.taggedPerHour}</p>
        </div>
      </div>
    </div>
  );
}

export function LiveLocationUpdatesPage() {
  const { lastUpdated } = useTrafficLiveTick();
  const [kindFilter, setKindFilter] = useState<LocationKind | "All">("All");
  const [parkFilter, setParkFilter] = useState<string>("All");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const locationParams = useMemo((): TrafficLocationsParams => ({
    kind: kindFilter === "All" ? "ALL" : kindFilter,
    park_type: parkFilter === "All" ? "ALL" : parkFilter,
  }), [kindFilter, parkFilter]);

  const { data, isLoading, isError, refetch, isFetching } =
    useTrafficLocations(locationParams);

  const filtered = data?.locations ?? [];
  const summary = data?.summary;

  const selected =
    filtered.find((l) => l.id === selectedId) ?? filtered[0] ?? null;

  const summaryCards: TrafficSummaryKpi[] = useMemo(() => {
    if (!summary) return [];
    return [
      {
        label: "Locations on map",
        value: summary.totalLocations,
        color: "text-blue-400",
        bg: "bg-blue-400/10",
        Icon: MapPin,
      },
      {
        label: "Visible (filtered)",
        value: summary.visibleCount,
        color: "text-emerald-400",
        bg: "bg-emerald-400/10",
        Icon: Radio,
      },
      {
        label: "Online",
        value: summary.onlineCount,
        color: "text-cyan-400",
        bg: "bg-cyan-400/10",
        Icon: Warehouse,
      },
      {
        label: "Offline / inactive",
        value: summary.offlineCount,
        color: "text-amber-400",
        bg: "bg-amber-400/10",
        Icon: AlertTriangle,
      },
      {
        label: "Facilities",
        value: summary.facilitiesCount,
        color: "text-violet-400",
        bg: "bg-violet-400/10",
        Icon: Warehouse,
      },
      {
        label: "Facility pregates",
        value: summary.facilityPregatesCount,
        color: "text-orange-400",
        bg: "bg-orange-400/10",
        Icon: DoorOpen,
      },
      {
        label: "Pregates / EPT",
        value: summary.pregatesCount + summary.eptCount,
        color: "text-teal-400",
        bg: "bg-teal-400/10",
        Icon: MapPin,
      },
      {
        label: "Terminals",
        value: summary.terminalsCount,
        color: "text-slate-400",
        bg: "bg-slate-400/10",
        Icon: Warehouse,
      },
      {
        label: "Avg ATAT",
        value:
          summary.avgHourlyTatMinutes != null
            ? `${summary.avgHourlyTatMinutes} min`
            : "—",
        color: "text-gray-400",
        bg: "bg-gray-400/10",
        Icon: Clock,
      },
    ];
  }, [summary]);

  return (
    <TrafficCommandShell
      title="Live Location Updates"
      subtitle="Interactive map of facilities, facility-pregates, and transit parks — gate barriers, hourly TAT, and truck tagging metrics."
    >
      <TrafficSummaryPanel
        title="Live location updates — at a glance"
        subtitle={
          isFetching && !isLoading
            ? "Refreshing location feed…"
            : "Map metrics from the traffic command API"
        }
        lastUpdated={lastUpdated}
        cards={summaryCards}
        gridClassName="grid-cols-2 sm:grid-cols-4 xl:grid-cols-4"
      />

      {isError && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Failed to load live locations.
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            className="rounded-lg border border-red-300 bg-white px-3 py-1 text-xs font-semibold"
          >
            Retry
          </button>
        </div>
      )}

      <div className="flex flex-wrap gap-3 rounded-xl border border-gray-200 bg-white p-4">
        <div>
          <label className="mb-1 block text-[10px] font-semibold uppercase text-gray-400">
            Facility Type
          </label>
          <select
            value={kindFilter}
            onChange={(e) => setKindFilter(e.target.value as LocationKind | "All")}
            className="rounded-lg border border-gray-200 px-3 py-2 text-xs"
          >
            {KIND_FILTERS.map((k) => (
              <option key={k.value} value={k.value}>
                {k.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-[10px] font-semibold uppercase text-gray-400">
            Park Type
          </label>
          <select
            value={parkFilter}
            onChange={(e) => setParkFilter(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-xs"
          >
            {PARK_TYPE_FILTERS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end gap-1">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(0.7, z - 0.1))}
            className="rounded-lg border border-gray-200 p-2 hover:bg-gray-50"
            aria-label="Zoom out"
          >
            <Minus className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(1.6, z + 0.1))}
            className="rounded-lg border border-gray-200 p-2 hover:bg-gray-50"
            aria-label="Zoom in"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white py-24">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
            <p className="mt-2 text-sm text-gray-400">Loading map locations…</p>
          </div>
        ) : (
          <>
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-[#e8eef4]">
          <div
            className="relative h-[420px] w-full cursor-grab active:cursor-grabbing sm:h-[520px]"
            onMouseDown={(e) => {
              const startX = e.clientX - pan.x;
              const startY = e.clientY - pan.y;
              function move(ev: MouseEvent) {
                setPan({ x: ev.clientX - startX, y: ev.clientY - startY });
              }
              function up() {
                window.removeEventListener("mousemove", move);
                window.removeEventListener("mouseup", up);
              }
              window.addEventListener("mousemove", move);
              window.addEventListener("mouseup", up);
            }}
          >
            <div
              className="absolute inset-0 origin-center transition-transform duration-150"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                backgroundImage:
                  "linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            >
              <div className="absolute inset-[8%] rounded-3xl border-2 border-dashed border-slate-400/40 bg-slate-100/30" />
              <p className="absolute left-[10%] top-[12%] text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                Lagos Maritime Corridor
              </p>
              {filtered.map((loc) => {
                const kind = kindStyle(loc.facilityKind);
                const isSelected = loc.id === selected?.id;
                return (
                  <button
                    key={loc.id}
                    type="button"
                    title={loc.name}
                    onClick={() => setSelectedId(loc.id)}
                    className={`absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center transition-transform hover:scale-110 ${
                      !loc.online ? "opacity-50 grayscale" : ""
                    }`}
                    style={{ left: `${loc.mapX}%`, top: `${loc.mapY}%` }}
                  >
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-full border-2 border-white shadow-md ${kind.dot} ${
                        isSelected ? "ring-2 ring-emerald-500 ring-offset-2" : ""
                      }`}
                    >
                      <Warehouse className="h-4 w-4 text-white" />
                    </span>
                    {!loc.online && (
                      <AlertTriangle className="mt-0.5 h-3 w-3 text-amber-600" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 border-t border-gray-200 bg-white px-4 py-3">
            {Object.entries(KIND_COLORS).map(([key, val]) => (
              <div key={key} className="flex items-center gap-1.5 text-xs text-gray-600">
                <span className={`h-2.5 w-2.5 rounded-full ${val.dot}`} />
                {val.label}
              </div>
            ))}
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <AlertTriangle className="h-3 w-3 text-amber-600" />
              Offline / inactive
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {selected ? (
            <LocationDetailCard loc={selected} />
          ) : (
            <p className="text-sm text-gray-500">Select a location on the map</p>
          )}
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
              <MapPin className="h-3.5 w-3.5 text-emerald-600" />
              {filtered.length} location{filtered.length !== 1 ? "s" : ""} visible
            </p>
            <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto text-xs text-gray-600">
              {filtered.map((loc) => (
                <li key={loc.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(loc.id)}
                    className="w-full truncate text-left hover:text-emerald-700"
                  >
                    {loc.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
          </>
        )}
      </div>
    </TrafficCommandShell>
  );
}

"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Clock,
  DoorOpen,
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
import {
  TRAFFIC_MAP_LOCATIONS,
  type MapFacilityKind,
  type MapParkType,
  type TrafficMapLocation,
} from "@/lib/traffic-command-mock-data";

const KIND_COLORS: Record<MapFacilityKind, { dot: string; label: string }> = {
  FACILITY: { dot: "bg-blue-500", label: "Facility" },
  FACILITY_PREGATE: { dot: "bg-emerald-500", label: "Facility-Pregate" },
  TRANSIT_PARK: { dot: "bg-orange-500", label: "Transit Park" },
};

const PARK_TYPE_FILTERS: Array<MapParkType | "All"> = [
  "All",
  "Bonded Terminal",
  "Truck Park",
  "EPT",
  "Pregate-Empty",
  "Pregate-Mixed",
];

const KIND_FILTERS: Array<MapFacilityKind | "All"> = [
  "All",
  "FACILITY",
  "FACILITY_PREGATE",
  "TRANSIT_PARK",
];

function LocationDetailCard({ loc }: { loc: TrafficMapLocation }) {
  const kind = KIND_COLORS[loc.facilityKind];
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
          <dd className="font-medium text-gray-800">{kind.label}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-gray-500">Hourly TAT</dt>
          <dd className="font-medium text-gray-800">{loc.hourlyTatMinutes} min avg</dd>
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
  const [kindFilter, setKindFilter] = useState<MapFacilityKind | "All">("All");
  const [parkFilter, setParkFilter] = useState<MapParkType | "All">("All");
  const [selectedId, setSelectedId] = useState<string | null>(TRAFFIC_MAP_LOCATIONS[0]?.id ?? null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const filtered = useMemo(
    () =>
      TRAFFIC_MAP_LOCATIONS.filter((loc) => {
        if (kindFilter !== "All" && loc.facilityKind !== kindFilter) return false;
        if (parkFilter !== "All" && loc.parkType !== parkFilter) return false;
        return true;
      }),
    [kindFilter, parkFilter],
  );

  const selected = filtered.find((l) => l.id === selectedId) ?? filtered[0];

  const summaryCards: TrafficSummaryKpi[] = useMemo(() => {
    const all = TRAFFIC_MAP_LOCATIONS;
    const online = all.filter((l) => l.online).length;
    const offline = all.length - online;
    const facilities = all.filter((l) => l.facilityKind === "FACILITY").length;
    const pregates = all.filter((l) => l.facilityKind === "FACILITY_PREGATE").length;
    const parks = all.filter((l) => l.facilityKind === "TRANSIT_PARK").length;
    const avgTat = Math.round(
      all.reduce((s, l) => s + l.hourlyTatMinutes, 0) / Math.max(all.length, 1),
    );
    return [
      {
        label: "Locations on map",
        value: all.length,
        color: "text-blue-400",
        bg: "bg-blue-400/10",
        Icon: MapPin,
      },
      {
        label: "Visible (filtered)",
        value: filtered.length,
        color: "text-emerald-400",
        bg: "bg-emerald-400/10",
        Icon: Radio,
      },
      {
        label: "Online",
        value: online,
        color: "text-cyan-400",
        bg: "bg-cyan-400/10",
        Icon: Warehouse,
      },
      {
        label: "Offline / inactive",
        value: offline,
        color: "text-amber-400",
        bg: "bg-amber-400/10",
        Icon: AlertTriangle,
      },
      {
        label: "Facilities",
        value: facilities,
        color: "text-violet-400",
        bg: "bg-violet-400/10",
        Icon: Warehouse,
      },
      {
        label: "Facility pregates",
        value: pregates,
        color: "text-orange-400",
        bg: "bg-orange-400/10",
        Icon: DoorOpen,
      },
      {
        label: "Transit parks",
        value: parks,
        color: "text-teal-400",
        bg: "bg-teal-400/10",
        Icon: MapPin,
      },
      {
        label: "Avg hourly TAT",
        value: `${avgTat} min`,
        color: "text-gray-400",
        bg: "bg-gray-400/10",
        Icon: Clock,
      },
    ];
  }, [filtered.length]);

  return (
    <TrafficCommandShell
      title="Live Location Updates"
      subtitle="Interactive map of facilities, facility-pregates, and transit parks — gate barriers, hourly TAT, and truck tagging metrics."
    >
      <TrafficSummaryPanel
        title="Live location updates — at a glance"
        subtitle="Map metrics reflect network-wide locations; visible count follows your filters"
        lastUpdated={lastUpdated}
        cards={summaryCards}
        gridClassName="grid-cols-2 sm:grid-cols-4 xl:grid-cols-4"
      />

      <div className="flex flex-wrap gap-3 rounded-xl border border-gray-200 bg-white p-4">
        <div>
          <label className="mb-1 block text-[10px] font-semibold uppercase text-gray-400">
            Facility Type
          </label>
          <select
            value={kindFilter}
            onChange={(e) => setKindFilter(e.target.value as MapFacilityKind | "All")}
            className="rounded-lg border border-gray-200 px-3 py-2 text-xs"
          >
            {KIND_FILTERS.map((k) => (
              <option key={k} value={k}>
                {k === "All" ? "All types" : KIND_COLORS[k as MapFacilityKind].label}
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
            onChange={(e) => setParkFilter(e.target.value as MapParkType | "All")}
            className="rounded-lg border border-gray-200 px-3 py-2 text-xs"
          >
            {PARK_TYPE_FILTERS.map((p) => (
              <option key={p} value={p}>
                {p === "All" ? "All park types" : p}
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
                const kind = KIND_COLORS[loc.facilityKind];
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
      </div>
    </TrafficCommandShell>
  );
}

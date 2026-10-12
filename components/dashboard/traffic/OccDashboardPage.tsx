"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  Ban,
  Building2,
  DoorOpen,
  Download,
  Loader2,
  ParkingCircle,
  Route,
  Search,
  Send,
  Sparkles,
  Siren,
  Truck,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TrafficCommandShell } from "@/components/dashboard/traffic/TrafficCommandShell";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { useOccCancelledBookings } from "@/hooks/traffic/useOccCancelledBookings";
import { useOccCancelledBookingsExport } from "@/hooks/traffic/useOccCancelledBookingsExport";
import { useOccEmergencies } from "@/hooks/traffic/useOccEmergencies";
import {
  TrafficSummaryPanel,
  type TrafficSummaryKpi,
} from "@/components/dashboard/traffic/TrafficSummaryPanel";
import { useOccDashboard } from "@/hooks/traffic/useOccDashboard";
import { useTrafficLiveTick } from "@/hooks/traffic/useTrafficLiveTick";
import { formatEmergencyType } from "@/lib/traffic-command-mock-data";
import type { EmergencyType, OccDatePreset } from "@/types/traffic.types";

const DEST_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#94a3b8"];
type OccPeriodSelection = OccDatePreset | "CUSTOM";

const DATE_PRESET_FILTERS: OccPeriodSelection[] = [
  "DAILY",
  "WEEKLY",
  "MONTHLY",
  "YEARLY",
  "CUSTOM",
];

const DATE_PRESET_LABELS: Record<OccPeriodSelection, string> = {
  DAILY: "Daily",
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
  YEARLY: "Yearly",
  CUSTOM: "Custom",
};

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-sm font-bold text-gray-900">{title}</h2>
      <p className="text-xs text-gray-500">{description}</p>
    </div>
  );
}

function CapacityBars({
  data,
}: {
  data: { name: string; capacity: number; occupied: number }[];
}) {
  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barCategoryGap="22%">
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="capacity" name="Capacity" fill="#e5e7eb" radius={[4, 4, 0, 0]} />
          <Bar dataKey="occupied" name="Occupied" fill="#10b981" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function OccDashboardPage() {
  const { lastUpdated } = useTrafficLiveTick();
  const [emergencyFilter, setEmergencyFilter] = useState<EmergencyType | "All">("All");
  const [datePreset, setDatePreset] = useState<OccPeriodSelection>("WEEKLY");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const {
    search: cancelSearch,
    debouncedSearch: debouncedCancelSearch,
    setSearch: setCancelSearch,
  } = useDebouncedSearch("");

  const customRangeReady =
    datePreset !== "CUSTOM" || (customFrom.trim() !== "" && customTo.trim() !== "");

  const occParams = useMemo(() => {
    if (datePreset === "CUSTOM") {
      if (!customFrom || !customTo) return {};
      return { date_from: customFrom, date_to: customTo };
    }
    return { date_preset: datePreset };
  }, [datePreset, customFrom, customTo]);

  const emergenciesParams = useMemo(() => {
    const base = {
      emergency_type: emergencyFilter === "All" ? ("ALL" as const) : emergencyFilter,
      page: 1,
      limit: 50,
    };
    if (datePreset === "CUSTOM") {
      if (!customFrom || !customTo) return base;
      return { ...base, date_from: customFrom, date_to: customTo };
    }
    return { ...base, date_preset: datePreset };
  }, [datePreset, customFrom, customTo, emergencyFilter]);

  const cancelledBookingsParams = useMemo(() => {
    const base = {
      search: debouncedCancelSearch.trim() || undefined,
      page: 1,
      limit: 50,
    };
    if (datePreset === "CUSTOM") {
      if (!customFrom || !customTo) return base;
      return { ...base, date_from: customFrom, date_to: customTo };
    }
    return { ...base, date_preset: datePreset };
  }, [datePreset, customFrom, customTo, debouncedCancelSearch]);

  const { data: occ, isLoading, isError, refetch, isFetching } =
    useOccDashboard(occParams, customRangeReady);

  const {
    data: emergenciesData,
    isLoading: emergenciesLoading,
    isError: emergenciesError,
    refetch: refetchEmergencies,
  } = useOccEmergencies(emergenciesParams, customRangeReady);

  const {
    data: cancelledData,
    isLoading: cancelledLoading,
    isError: cancelledError,
    refetch: refetchCancelled,
  } = useOccCancelledBookings(cancelledBookingsParams, customRangeReady);

  const exportCancelled = useOccCancelledBookingsExport();

  const emergencies = emergenciesData?.data ?? [];
  const emergenciesSummary = emergenciesData?.summary;
  const trucksSummary = occ?.trucksSummary;
  const cancelled = cancelledData?.data ?? [];
  const cancelledTotal =
    cancelledData?.meta.total ?? occ?.cancelledBookingsTotal ?? cancelled.length;
  const aiCommandActions = occ?.aiCommandActions ?? [];
  const facilityCapacity = occ?.facilityCapacity ?? [];
  const facilityTatByCategory = occ?.facilityTatByCategory ?? [];
  const truckDestinations = occ?.truckDestinations ?? [];
  const transitParkCapacity = occ?.transitParkCapacity ?? [];
  const terminals = occ?.terminals ?? [];
  const trucksByStage = trucksSummary?.byStage ?? [];
  const terminalHourlyArrivals =
    occ?.terminalHourlyArrivals?.length
      ? occ.terminalHourlyArrivals
      : (occ?.terminalHourlyTat ?? []);

  const summaryCards: TrafficSummaryKpi[] = useMemo(() => {
    const facilityCap = facilityCapacity.reduce((s, d) => s + d.capacity, 0);
    const facilityOcc = facilityCapacity.reduce((s, d) => s + d.occupied, 0);
    const parkCap = transitParkCapacity.reduce((s, d) => s + d.capacity, 0);
    const parkOcc = transitParkCapacity.reduce((s, d) => s + d.occupied, 0);
    const activeEmergencies =
      emergenciesSummary?.active
      ?? emergencies.filter((e) => e.active).length;

    return [
      {
        label: "Bookings (period)",
        value: trucksSummary?.totalBookings ?? "—",
        color: "text-blue-400",
        bg: "bg-blue-400/10",
        Icon: Truck,
      },
      {
        label: "On trip",
        value: trucksSummary?.onTrip ?? "—",
        color: "text-cyan-400",
        bg: "bg-cyan-400/10",
        Icon: Route,
      },
      {
        label: "Left pregate",
        value: trucksSummary?.leftPregate ?? "—",
        color: "text-orange-400",
        bg: "bg-orange-400/10",
        Icon: DoorOpen,
      },
      {
        label: "In terminal",
        value: trucksSummary?.inTerminal ?? "—",
        color: "text-slate-400",
        bg: "bg-slate-400/10",
        Icon: Building2,
      },
      {
        label: "Active emergencies",
        value: activeEmergencies,
        color: "text-red-400",
        bg: "bg-red-400/10",
        Icon: Siren,
      },
      {
        label: "Cancelled bookings",
        value: cancelledTotal,
        color: "text-gray-400",
        bg: "bg-gray-400/10",
        Icon: Ban,
      },
      {
        label: "Facility occupancy",
        value: facilityCap
          ? `${Math.round((facilityOcc / facilityCap) * 100)}%`
          : "—",
        color: "text-emerald-400",
        bg: "bg-emerald-400/10",
        Icon: Building2,
      },
      {
        label: "Transit park occupancy",
        value: parkCap ? `${Math.round((parkOcc / parkCap) * 100)}%` : "—",
        color: "text-amber-400",
        bg: "bg-amber-400/10",
        Icon: ParkingCircle,
      },
    ];
  }, [
    emergencies,
    emergenciesSummary,
    trucksSummary,
    facilityCapacity,
    transitParkCapacity,
    cancelledTotal,
  ]);

  return (
    <TrafficCommandShell
      title="OCC Dashboard"
      subtitle="Monitor facilities, transit parks, terminals, emergencies, and cancelled bookings — AI-assisted command actions for corridor oversight."
    >
      <TrafficSummaryPanel
        title="Operations command & coordination — at a glance"
        subtitle={
          isFetching && !isLoading
            ? "Refreshing OCC dashboard…"
            : "Corridor KPIs from the traffic command API"
        }
        lastUpdated={lastUpdated}
        cards={summaryCards}
        gridClassName="grid-cols-2 sm:grid-cols-4 xl:grid-cols-4"
        aiPowered
      />

      {isError && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Failed to load OCC dashboard data.
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

      <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-700">Overview period</p>
          <p className="text-[11px] text-gray-500">
            Drives OCC overview metrics from the traffic command API
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {DATE_PRESET_FILTERS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setDatePreset(preset)}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
                datePreset === preset
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {DATE_PRESET_LABELS[preset]}
            </button>
          ))}
        </div>
      </div>

      {datePreset === "CUSTOM" && (
        <div className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-wrap items-end gap-3">
            <label className="text-xs text-gray-600">
              From
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="mt-1 block rounded-lg border border-gray-200 px-3 py-1.5 text-sm"
              />
            </label>
            <label className="text-xs text-gray-600">
              To
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="mt-1 block rounded-lg border border-gray-200 px-3 py-1.5 text-sm"
              />
            </label>
          </div>
          {!customRangeReady && (
            <p className="text-xs text-amber-700">
              Choose both dates — the overview loads with <code className="text-[11px]">date_from</code> and{" "}
              <code className="text-[11px]">date_to</code> only (no preset).
            </p>
          )}
        </div>
      )}

      {!customRangeReady ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-16 text-center text-sm text-gray-500">
          Select a custom date range to load OCC overview data.
        </div>
      ) : isLoading ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white py-24">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
          <p className="mt-2 text-sm text-gray-400">Loading OCC dashboard…</p>
        </div>
      ) : (
        <>
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="mb-4 flex items-start gap-2">
          <Send className="mt-0.5 h-4 w-4 text-emerald-600" />
          <div>
            <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900">
              Operations Command &amp; Control
              <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-semibold text-violet-700">
                <Sparkles className="h-3 w-3" />
                AI-Powered
              </span>
            </h3>
            <p className="mt-1 text-[11px] text-gray-500">
              One-tap corridor interventions recommended by AI; SuperAdmin authorises dispatch to LASTMA and Ops Control.
            </p>
          </div>
        </div>
        {aiCommandActions.length === 0 ? (
          <p className="text-xs text-gray-500">
            No AI command actions returned for this period — corridor recommendations will appear when available.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {aiCommandActions.map((action) => (
              <button
                key={action.title}
                type="button"
                className={`rounded-xl border p-4 text-left transition-colors hover:border-emerald-200 ${action.accent}`}
              >
                <p className="text-xs font-bold text-gray-900">{action.title}</p>
                <p className="mt-1 text-[10px] leading-snug text-gray-500">{action.description}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {trucksByStage.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <SectionHeader
            title="Truck movement by stage"
            description="Booking counts across corridor stages for the selected overview period"
          />
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trucksByStage} margin={{ bottom: 48 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 9 }}
                  interval={0}
                  angle={-35}
                  textAnchor="end"
                  height={56}
                />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Bar dataKey="count" name="Bookings" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <SectionHeader
          title="Facility Status Report"
          description="Capacity, hourly TAT by booking category, and truck destinations"
        />
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase text-gray-400">Capacity vs Availability</p>
            <CapacityBars data={facilityCapacity} />
          </div>
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase text-gray-400">Hourly Avg TAT by Category</p>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={facilityTatByCategory} layout="vertical" margin={{ left: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 10 }} unit="m" />
                  <YAxis type="category" dataKey="category" width={100} tick={{ fontSize: 9 }} />
                  <Tooltip contentStyle={{ fontSize: 12 }} />
                  <Bar dataKey="minutes" name="Minutes" fill="#6366f1" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase text-gray-400">Truck Destinations</p>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={truckDestinations} dataKey="value" nameKey="name" innerRadius={45} outerRadius={70}>
                    {truckDestinations.map((_, i) => (
                      <Cell key={i} fill={DEST_COLORS[i % DEST_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <SectionHeader
          title="Transit Park Status Report"
          description="Park occupancy, turnaround by category, and outbound terminal distribution"
        />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase text-gray-400">Capacity vs Availability</p>
            <CapacityBars data={transitParkCapacity} />
          </div>
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase text-gray-400">Destinations (sample)</p>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={truckDestinations}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ fontSize: 12 }} />
                  <Bar dataKey="value" name="Trucks" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <SectionHeader
          title="Terminal Status Report"
          description="Approved daily capacity, arrivals, in-terminal counts, and ATAT"
        />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-[10px] font-semibold uppercase text-gray-500">
                <th className="py-2 pr-3">Terminal</th>
                <th className="py-2 pr-3">Code</th>
                <th className="py-2 pr-3">Daily capacity</th>
                <th className="py-2 pr-3">Arrived</th>
                <th className="py-2 pr-3">In terminal</th>
                <th className="py-2">ATAT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {terminals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-gray-400">
                    No terminal rows in this overview period.
                  </td>
                </tr>
              ) : (
                terminals.map((t) => (
                  <tr key={t.id}>
                    <td className="py-2.5 pr-3 text-xs font-medium text-gray-900">{t.name}</td>
                    <td className="py-2.5 pr-3 font-mono text-xs text-gray-600">{t.code}</td>
                    <td className="py-2.5 pr-3 text-xs text-gray-700">{t.approvedDailyTruckCapacity}</td>
                    <td className="py-2.5 pr-3 text-xs text-gray-700">{t.trucksArrived}</td>
                    <td className="py-2.5 pr-3 text-xs text-gray-700">{t.trucksInTerminal}</td>
                    <td className="py-2.5 text-xs text-gray-600">
                      {t.atatLabel ?? (t.atatMinutes != null ? `${t.atatMinutes} min` : "—")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {terminalHourlyArrivals.length > 0 && (
          <div className="mt-6">
            <p className="mb-2 text-[10px] font-semibold uppercase text-gray-400">Hourly terminal arrivals</p>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={terminalHourlyArrivals}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                  <Tooltip contentStyle={{ fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="apapa" name="Apapa" stroke="#3b82f6" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="tincan" name="Tincan" stroke="#10b981" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="lekki" name="Lekki" stroke="#f59e0b" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <SectionHeader
          title="Emergency Truck Requests"
          description="Drivers with LEFT-PREGATE status — active emergencies highlighted"
        />
        <div className="mb-3 flex flex-wrap gap-2">
          {(["All", "TOW_TRUCK", "BREAKDOWN", "ACCIDENT"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setEmergencyFilter(f === "All" ? "All" : f)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                emergencyFilter === f
                  ? "bg-red-100 text-red-800"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {f === "All" ? "All types" : formatEmergencyType(f)}
            </button>
          ))}
        </div>
        {emergenciesError && (
          <div className="mb-3 flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
            <span className="flex items-center gap-2">
              <AlertCircle className="h-3.5 w-3.5" />
              Failed to load emergency requests.
            </span>
            <button
              type="button"
              onClick={() => refetchEmergencies()}
              className="rounded border border-red-300 bg-white px-2 py-0.5 font-semibold"
            >
              Retry
            </button>
          </div>
        )}
        {emergenciesData && (
          <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div className="rounded-lg border border-gray-100 bg-gray-50/80 px-3 py-2 text-xs">
              <p className="font-semibold text-gray-700">Total requests</p>
              <p className="text-lg font-bold text-gray-900">{emergenciesSummary?.total ?? 0}</p>
            </div>
            <div className="rounded-lg border border-red-100 bg-red-50/50 px-3 py-2 text-xs">
              <p className="font-semibold text-red-800">Tow requests</p>
              <p className="text-lg font-bold text-red-900">
                {emergenciesSummary?.byType.TOW_TRUCK ?? 0}
              </p>
            </div>
            <div className="rounded-lg border border-amber-100 bg-amber-50/50 px-3 py-2 text-xs">
              <p className="font-semibold text-amber-900">Breakdowns</p>
              <p className="text-lg font-bold text-amber-950">
                {emergenciesSummary?.byType.BREAKDOWN ?? 0}
              </p>
            </div>
            <div className="rounded-lg border border-orange-100 bg-orange-50/50 px-3 py-2 text-xs">
              <p className="font-semibold text-orange-900">Accidents</p>
              <p className="text-lg font-bold text-orange-950">
                {emergenciesSummary?.byType.ACCIDENT ?? 0}
              </p>
            </div>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-gray-100 text-left text-[10px] font-semibold uppercase text-gray-500">
                <th className="py-2 pr-3">Driver</th>
                <th className="py-2 pr-3">Plate</th>
                <th className="py-2 pr-3">Type</th>
                <th className="py-2 pr-3">Location</th>
                <th className="py-2">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {emergenciesLoading ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin text-emerald-500" />
                    <p className="mt-2 text-xs text-gray-400">Loading emergency requests…</p>
                  </td>
                </tr>
              ) : emergencies.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-gray-400">
                    No emergency requests for this period
                    {emergencyFilter !== "All" ? ` (${formatEmergencyType(emergencyFilter)})` : ""}.
                  </td>
                </tr>
              ) : (
              emergencies.map((e) => (
                <tr
                  key={e.id}
                  className={e.active ? "bg-red-50/60" : ""}
                >
                  <td className="py-2.5 pr-3 text-xs">
                    <span className="font-medium text-gray-900">{e.driverName}</span>
                    <span className="block text-[10px] text-gray-400">{e.driverId}</span>
                  </td>
                  <td className="py-2.5 pr-3 font-mono text-xs text-gray-800">{e.plateNumber}</td>
                  <td className="py-2.5 pr-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        e.active ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {e.active && <AlertTriangle className="h-3 w-3" />}
                      {formatEmergencyType(e.emergencyType)}
                    </span>
                  </td>
                  <td className="py-2.5 pr-3 text-xs text-gray-600">{e.currentLocation}</td>
                  <td className="py-2.5 text-xs text-gray-500">
                    {new Date(e.timestamp).toLocaleString("en-NG", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                </tr>
              )))}
            </tbody>
            </table>
        </div>
        <p className="mt-3 text-[11px] text-gray-400">
          Showing {emergencies.length} of {emergenciesData?.meta.total ?? emergencies.length} request
          {(emergenciesData?.meta.total ?? emergencies.length) !== 1 ? "s" : ""} for{" "}
          {DATE_PRESET_LABELS[datePreset].toLowerCase()} overview
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Ban className="h-4 w-4 text-gray-600" />
            <div>
              <h2 className="text-sm font-bold text-gray-900">Cancelled Bookings</h2>
              <p className="text-xs text-gray-500">
                Search and export — scoped to {DATE_PRESET_LABELS[datePreset].toLowerCase()} overview
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={exportCancelled.isPending || !customRangeReady}
              onClick={() => exportCancelled.mutate(cancelledBookingsParams)}
              className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              {exportCancelled.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Download className="h-3.5 w-3.5" />
              )}
              Export CSV
            </button>
          </div>
        </div>
        {cancelledError && (
          <div className="mb-3 flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
            <span className="flex items-center gap-2">
              <AlertCircle className="h-3.5 w-3.5" />
              Failed to load cancelled bookings.
            </span>
            <button
              type="button"
              onClick={() => refetchCancelled()}
              className="rounded border border-red-300 bg-white px-2 py-0.5 font-semibold"
            >
              Retry
            </button>
          </div>
        )}
        <div className="relative mb-3 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={cancelSearch}
            onChange={(e) => setCancelSearch(e.target.value)}
            placeholder="Search booking ID, plate, driver…"
            className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-emerald-300"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead>
              <tr className="border-b border-gray-100 text-left text-[10px] font-semibold uppercase text-gray-500">
                <th className="py-2 pr-3">Booking ID</th>
                <th className="py-2 pr-3">Plate</th>
                <th className="py-2 pr-3">Driver</th>
                <th className="py-2 pr-3">Category</th>
                <th className="py-2 pr-3">Reason</th>
                <th className="py-2">Cancelled</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {cancelledLoading ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin text-emerald-500" />
                    <p className="mt-2 text-xs text-gray-400">Loading cancelled bookings…</p>
                  </td>
                </tr>
              ) : cancelled.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-gray-400">
                    No cancelled bookings for this period
                    {debouncedCancelSearch ? " matching your search" : ""}.
                  </td>
                </tr>
              ) : (
              cancelled.map((b) => (
                <tr key={b.id}>
                  <td className="py-2.5 pr-3 font-mono text-xs font-semibold text-emerald-700">{b.bookingId}</td>
                  <td className="py-2.5 pr-3 font-mono text-xs text-gray-800">{b.plateNumber}</td>
                  <td className="py-2.5 pr-3 text-xs text-gray-700">{b.driverName}</td>
                  <td className="py-2.5 pr-3 text-xs text-gray-600">{b.category}</td>
                  <td className="py-2.5 pr-3 text-xs text-gray-600">{b.reason}</td>
                  <td className="py-2.5 text-xs text-gray-500">
                    {new Date(b.cancelledAt).toLocaleString("en-NG", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))
              )}
            </tbody>
          </table>
        </div>
        <p className="mt-3 flex items-center gap-1.5 text-[11px] text-gray-400">
          <Truck className="h-3 w-3" />
          Showing {cancelled.length} of {cancelledTotal} cancelled booking
          {cancelledTotal !== 1 ? "s" : ""} for {DATE_PRESET_LABELS[datePreset].toLowerCase()} overview
        </p>
      </div>
        </>
      )}
    </TrafficCommandShell>
  );
}

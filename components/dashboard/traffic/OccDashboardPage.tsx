"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Ban,
  Building2,
  Download,
  ParkingCircle,
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
import { toast } from "sonner";
import { TrafficCommandShell } from "@/components/dashboard/traffic/TrafficCommandShell";
import {
  TrafficSummaryPanel,
  type TrafficSummaryKpi,
} from "@/components/dashboard/traffic/TrafficSummaryPanel";
import { useTrafficLiveTick } from "@/hooks/traffic/useTrafficLiveTick";
import {
  formatEmergencyType,
  OCC_AI_COMMAND_ACTIONS,
  OCC_CANCELLED_BOOKINGS,
  OCC_EMERGENCY_REQUESTS,
  OCC_FACILITY_CAPACITY,
  OCC_FACILITY_TAT_BY_CATEGORY,
  OCC_TERMINAL_DOWNTIME,
  OCC_TERMINAL_EVACUATION,
  OCC_TERMINAL_HOURLY_TAT,
  OCC_TRANSIT_PARK_CAPACITY,
  OCC_TRUCK_DESTINATIONS,
  type EmergencyType,
} from "@/lib/traffic-command-mock-data";

const DEST_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#94a3b8"];
const PERIOD_FILTERS = ["Week", "Month", "Year", "Custom"] as const;

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
  const [cancelPeriod, setCancelPeriod] = useState<(typeof PERIOD_FILTERS)[number]>("Month");
  const [cancelSearch, setCancelSearch] = useState("");

  const emergencies = useMemo(() => {
    return OCC_EMERGENCY_REQUESTS.filter((e) => {
      if (emergencyFilter !== "All" && e.emergencyType !== emergencyFilter) return false;
      return true;
    });
  }, [emergencyFilter]);

  const cancelled = useMemo(() => {
    const q = cancelSearch.trim().toLowerCase();
    return OCC_CANCELLED_BOOKINGS.filter((b) => {
      if (!q) return true;
      return (
        b.bookingId.toLowerCase().includes(q)
        || b.plateNumber.toLowerCase().includes(q)
        || b.driverName.toLowerCase().includes(q)
      );
    });
  }, [cancelSearch]);

  const summaryCards: TrafficSummaryKpi[] = useMemo(() => {
    const activeEmergencies = OCC_EMERGENCY_REQUESTS.filter((e) => e.active).length;
    const facilityCap = OCC_FACILITY_CAPACITY.reduce((s, d) => s + d.capacity, 0);
    const facilityOcc = OCC_FACILITY_CAPACITY.reduce((s, d) => s + d.occupied, 0);
    const parkCap = OCC_TRANSIT_PARK_CAPACITY.reduce((s, d) => s + d.capacity, 0);
    const parkOcc = OCC_TRANSIT_PARK_CAPACITY.reduce((s, d) => s + d.occupied, 0);
    const downtimeMinutes = OCC_TERMINAL_DOWNTIME.reduce((s, d) => s + d.minutes, 0);
    const evacuated = OCC_TERMINAL_EVACUATION.reduce((s, d) => s + d.evacuated, 0);
    const delivered = OCC_TERMINAL_EVACUATION.reduce((s, d) => s + d.delivered, 0);

    return [
      {
        label: "Active emergencies",
        value: activeEmergencies,
        color: "text-red-400",
        bg: "bg-red-400/10",
        Icon: Siren,
      },
      {
        label: "Emergency requests",
        value: OCC_EMERGENCY_REQUESTS.length,
        color: "text-orange-400",
        bg: "bg-orange-400/10",
        Icon: AlertTriangle,
      },
      {
        label: "Cancelled bookings",
        value: OCC_CANCELLED_BOOKINGS.length,
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
      {
        label: "Terminal downtime",
        value: `${downtimeMinutes}m`,
        color: "text-violet-400",
        bg: "bg-violet-400/10",
        Icon: Truck,
      },
      {
        label: "Evacuated / delivered (hr)",
        value: `${evacuated} / ${delivered}`,
        color: "text-cyan-400",
        bg: "bg-cyan-400/10",
        Icon: Send,
      },
      {
        label: "AI command actions",
        value: OCC_AI_COMMAND_ACTIONS.length,
        color: "text-violet-400",
        bg: "bg-violet-400/10",
        Icon: Sparkles,
      },
    ];
  }, []);

  function exportCancelledCsv() {
    const header = "Booking ID,Plate,Driver,Category,Reason,Cancelled At\n";
    const rows = cancelled
      .map(
        (b) =>
          `"${b.bookingId}","${b.plateNumber}","${b.driverName}","${b.category}","${b.reason}","${b.cancelledAt}"`,
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cancelled-bookings-${cancelPeriod.toLowerCase()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Export started");
  }

  return (
    <TrafficCommandShell
      title="OCC Dashboard"
      subtitle="Monitor facilities, transit parks, terminals, emergencies, and cancelled bookings — AI-assisted command actions for corridor oversight."
    >
      <TrafficSummaryPanel
        title="Operations command & coordination — at a glance"
        subtitle="Corridor KPIs refresh with the live traffic feed"
        lastUpdated={lastUpdated}
        cards={summaryCards}
        gridClassName="grid-cols-2 sm:grid-cols-4 xl:grid-cols-4"
        aiPowered
      />

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
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {OCC_AI_COMMAND_ACTIONS.map((action) => (
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
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <SectionHeader
          title="Facility Status Report"
          description="Capacity, hourly TAT by booking category, and truck destinations"
        />
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase text-gray-400">Capacity vs Availability</p>
            <CapacityBars data={OCC_FACILITY_CAPACITY} />
          </div>
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase text-gray-400">Hourly Avg TAT by Category</p>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={OCC_FACILITY_TAT_BY_CATEGORY} layout="vertical" margin={{ left: 8 }}>
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
                  <Pie data={OCC_TRUCK_DESTINATIONS} dataKey="value" nameKey="name" innerRadius={45} outerRadius={70}>
                    {OCC_TRUCK_DESTINATIONS.map((_, i) => (
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
            <CapacityBars data={OCC_TRANSIT_PARK_CAPACITY} />
          </div>
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase text-gray-400">Destinations (sample)</p>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={OCC_TRUCK_DESTINATIONS}>
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
          description="Hourly TAT trends, evacuation & delivery, and downtime"
        />
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <p className="mb-2 text-[10px] font-semibold uppercase text-gray-400">Hourly Truck TAT</p>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={OCC_TERMINAL_HOURLY_TAT}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} unit="m" />
                  <Tooltip contentStyle={{ fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="apapa" name="APM Apapa" stroke="#3b82f6" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="tincan" name="Tincan" stroke="#10b981" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="lekki" name="Lekki" stroke="#f59e0b" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase text-gray-400">Downtime (minutes)</p>
            <div className="space-y-2">
              {OCC_TERMINAL_DOWNTIME.map((d) => (
                <div key={d.terminal} className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
                  <div className="flex justify-between text-xs font-semibold text-gray-800">
                    <span>{d.terminal}</span>
                    <span>{d.minutes}m</span>
                  </div>
                  <p className="text-[11px] text-gray-500">{d.reason}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-6">
          <p className="mb-2 text-[10px] font-semibold uppercase text-gray-400">Evacuation &amp; Delivery (last hour)</p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[400px] text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-[10px] font-semibold uppercase text-gray-500">
                  <th className="py-2 pr-4">Terminal</th>
                  <th className="py-2 pr-4">Evacuated</th>
                  <th className="py-2">Delivered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {OCC_TERMINAL_EVACUATION.map((row) => (
                  <tr key={row.terminal}>
                    <td className="py-2.5 pr-4 text-xs font-medium text-gray-800">{row.terminal}</td>
                    <td className="py-2.5 pr-4 text-xs text-gray-600">{row.evacuated}</td>
                    <td className="py-2.5 text-xs text-gray-600">{row.delivered}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
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
              {emergencies.map((e) => (
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
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Ban className="h-4 w-4 text-gray-600" />
            <div>
              <h2 className="text-sm font-bold text-gray-900">Cancelled Bookings</h2>
              <p className="text-xs text-gray-500">Search and export — filter by period</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {PERIOD_FILTERS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setCancelPeriod(p)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
                  cancelPeriod === p ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-600"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              type="button"
              onClick={exportCancelledCsv}
              className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
            >
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </button>
          </div>
        </div>
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
              {cancelled.map((b) => (
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
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 flex items-center gap-1.5 text-[11px] text-gray-400">
          <Truck className="h-3 w-3" />
          Showing {cancelled.length} record{cancelled.length !== 1 ? "s" : ""} for {cancelPeriod} view (sample data)
        </p>
      </div>
    </TrafficCommandShell>
  );
}

"use client";

import { useState } from "react";
import {
  Clock,
  Truck,
  Users,
  Timer,
  AlertTriangle,
  BookOpen,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ChevronRight,
  FileText,
  ArrowRight,
  Ban,
  Route,
  Warehouse,
  Megaphone,
  Zap,
  Send,
} from "lucide-react";
import {
  dashboardStats,
  revenueCards,
  recentBookings,
  recentMatchings,
  bookingsByTerminal,
  matchingsByTerminal,
} from "@/lib/mock-data";
import { BONDED_BOOKING_CATEGORIES } from "@/lib/book-assist-mock-data";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// ─── Mock: Corridor Live ───
const corridorLive = {
  liveMovements: 54,
  terminals: 92,
  verifiedTrucks: 47,
  verifiedDrivers: 40,
  congestionIndex: 78,
};

// ─── Mock: Manifest Lifecycle ───
const manifestLifecycleGroups = [
  {
    label: "Facility",
    items: [
      { stage: "Enroute Facility", count: 11, description: "Transporter books a bay at facility" },
      { stage: "In-Facility", count: 293, description: "Trucks gated into facilities" },
      { stage: "GTG-Facility", count: 52, description: "Scheduled & ready to exit facilities" },
      { stage: "Left-Facility", count: 73, description: "Trucks gated out of facilities" },
    ],
  },
  {
    label: "Transit & Matching",
    items: [
      { stage: "Matched", count: 199, description: "TEPs matched to trucks" },
      { stage: "In-Pregate", count: 281, description: "Gated into transit parks" },
      { stage: "GTG-Pregate", count: 11, description: "Ready to exit transit parks" },
      { stage: "Left-Pregate", count: 31, description: "Gated out of transit parks" },
    ],
  },
  {
    label: "Terminal",
    items: [
      { stage: "In-Terminal", count: 96, description: "Trucks gated into terminals" },
      { stage: "Left-Terminal", count: 14, description: "Gated out of terminals" },
    ],
  },
];

// ─── Mock: Bookings by category (platform booking categories) ───
const BOOKINGS_BY_CATEGORY_COLORS = [
  "#3b82f6",
  "#6366f1",
  "#06b6d4",
  "#10b981",
  "#14b8a6",
  "#f59e0b",
  "#8b5cf6",
];

const BOOKINGS_BY_CATEGORY_MOCK_VALUES: Record<string, number> = {
  IMPORT_CONTAINER: 34,
  IMPORT_NON_CONTAINER: 18,
  EMPTY_CONTAINER: 28,
  EXPORT_CONTAINER: 31,
  EXPORT_NON_CONTAINER: 15,
  FMCG: 22,
  FISH: 8,
};

const bookingsByCategory = BONDED_BOOKING_CATEGORIES.map((category, index) => ({
  name: category.label,
  value: BOOKINGS_BY_CATEGORY_MOCK_VALUES[category.value] ?? 0,
  color: BOOKINGS_BY_CATEGORY_COLORS[index] ?? "#94a3b8",
}));
const totalBookingsByCategory = bookingsByCategory.reduce((s, c) => s + c.value, 0);

// ─── Mock: Incident Notification Board ───
const severityStyles = {
  High: "bg-red-100 text-red-700",
  Critical: "bg-red-700 text-white",
  Low: "bg-gray-100 text-gray-600",
  Medium: "bg-amber-100 text-amber-700",
};

const incidentStatusStyles = {
  New: "bg-red-50 text-red-600 border-red-200",
  "In Progress": "bg-amber-50 text-amber-700 border-amber-200",
  Assigned: "bg-amber-50 text-amber-800 border-amber-200",
};

type IncidentSeverity = keyof typeof severityStyles;
type IncidentStatus = keyof typeof incidentStatusStyles;

const incidentNotifications: {
  title: string;
  meta: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
}[] = [
  {
    title: "Infrastructure damage · Lekki Port",
    meta: "INC-09019 · reported 8d ago · Terminal Operator",
    severity: "High",
    status: "New",
  },
  {
    title: "Truck breakdown · Apapa Corridor",
    meta: "INC-09031 · reported 3d ago · LASTMA Patrol",
    severity: "Critical",
    status: "In Progress",
  },
  {
    title: "Gate congestion · Tincan Island",
    meta: "INC-09044 · reported 1d ago · NPA Ops",
    severity: "Low",
    status: "Assigned",
  },
  {
    title: "Security breach attempt · Mile 2",
    meta: "INC-09052 · reported 6h ago · HarbourGate Security",
    severity: "Medium",
    status: "New",
  },
   {
    title: "Gate congestion · Tincan Island",
    meta: "INC-09044 · reported 1d ago · NPA Ops",
    severity: "Low",
    status: "Assigned",
  },
];

// ─── Mock: Ops Command Actions ───
const opsCommandActions = [
  {
    icon: Ban,
    title: "Suspend dispatch into Red Zone",
    description: "Halt new releases toward the congested corridor",
    accent: "border-red-200 bg-red-50/40 hover:bg-red-50",
    iconCls: "text-red-600 bg-red-100",
  },
  {
    icon: Route,
    title: "Reroute corridor traffic",
    description: "Divert onto the alternate managed corridor",
    accent: "border-gray-200 bg-white hover:bg-gray-50",
    iconCls: "text-gray-700 bg-gray-100",
  },
  {
    icon: Warehouse,
    title: "Activate overflow holding",
    description: "Open overflow bays to stage waiting trucks",
    accent: "border-gray-200 bg-white hover:bg-gray-50",
    iconCls: "text-gray-700 bg-gray-100",
  },
  {
    icon: Megaphone,
    title: "Broadcast diversion advisory",
    description: "Push advisory to drivers & transporters",
    accent: "border-gray-200 bg-white hover:bg-gray-50",
    iconCls: "text-gray-700 bg-gray-100",
  },
  {
    icon: Zap,
    title: "Priority movement",
    description: "Grant priority passage to a flagged convoy",
    accent: "border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50",
    iconCls: "text-emerald-600 bg-emerald-100",
  },
];

// ─── Corridor Live Banner ───
function CorridorLiveBanner() {
  const congestionHigh = corridorLive.congestionIndex >= 70;

  const metrics = [
    { value: corridorLive.liveMovements, label: "Live movements", hint: "Trucks in active transit" },
    { value: corridorLive.terminals, label: "Active terminals", hint: "Reporting live status" },
    { value: corridorLive.verifiedTrucks, label: "Verified trucks", hint: "On corridor now" },
    {
      value: corridorLive.congestionIndex,
      suffix: "/100",
      label: "Congestion index",
      hint: congestionHigh ? "Red-zone threshold" : "Within normal range",
      alert: congestionHigh,
    },
  ];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-[#0f1e2e] p-5 sm:p-6">
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-emerald-500/50 to-transparent" />

      {/* Header row */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/10 px-2.5 py-1">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">Live</span>
          </span>
          <span className="text-xs font-semibold text-white">Corridor status</span>
          <span className="hidden text-xs text-gray-600 sm:inline">·</span>
          <span className="text-xs text-gray-500">Maritime-ETSS</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-700">
            Traffic Command
          </button>
          <button className="flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/10">
            <AlertTriangle className={`h-3.5 w-3.5 ${congestionHigh ? "text-red-400" : "text-amber-400"}`} />
            Red-Zone
          </button>
        </div>
      </div>

      {/* Metric tiles */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
        {metrics.map((m) => (
          <div
            key={m.label}
            className={`rounded-xl px-3.5 py-3 sm:px-4 ${
              m.alert ? "bg-red-500/10 ring-1 ring-red-500/20" : "bg-white/5"
            }`}
          >
            <p className={`text-2xl font-bold tabular-nums leading-none sm:text-[1.75rem] ${m.alert ? "text-red-300" : "text-white"}`}>
              {m.value}
              {m.suffix && <span className="text-base font-semibold text-gray-500">{m.suffix}</span>}
            </p>
            <p className="mt-1.5 text-[11px] font-semibold text-gray-300">{m.label}</p>
            <p className="mt-0.5 text-[10px] text-gray-500">{m.hint}</p>
          </div>
        ))}
      </div>

      {/* Footer context */}
      <p className="mt-3.5 border-t border-white/5 pt-3.5 text-xs text-gray-500">
        <span className="font-medium text-gray-400">{corridorLive.verifiedDrivers} verified drivers</span>
        {" "}active across the corridor · Ibeju-Lekki maritime zone
      </p>
    </div>
  );
}

// ─── Hero Stats Banner ───
function StatsBanner() {
  const stats = dashboardStats;
  const items = [
    { icon: BookOpen, label: "Live Bookings", value: stats.liveBookings.value, trend: stats.liveBookings.trend, trendUp: stats.liveBookings.trendUp, color: "text-amber-400", bg: "bg-amber-400/10" },
    { icon: Truck, label: "Verified Trucks", value: stats.verifiedTrucks.value, trend: stats.verifiedTrucks.trend, trendUp: stats.verifiedTrucks.trendUp, color: "text-blue-400", bg: "bg-blue-400/10" },
    { icon: Users, label: "Verified Drivers", value: stats.verifiedDrivers.value, trend: stats.verifiedDrivers.trend, trendUp: stats.verifiedDrivers.trendUp, color: "text-emerald-400", bg: "bg-emerald-400/10" },
    { icon: Timer, label: "AVG TAT Apapa", value: stats.avgTatApapa.value, trend: stats.avgTatApapa.trend, trendUp: stats.avgTatApapa.trendUp, color: "text-violet-400", bg: "bg-violet-400/10" },
    { icon: Clock, label: "AVG TAT Tincan", value: stats.avgTatTincan.value, trend: stats.avgTatTincan.trend, trendUp: stats.avgTatTincan.trendUp, color: "text-cyan-400", bg: "bg-cyan-400/10" },
    { icon: AlertTriangle, label: "Exceptions", value: stats.exceptions.value, trend: stats.exceptions.trend, trendUp: stats.exceptions.trendUp, color: "text-red-400", bg: "bg-red-400/10" },
  ];

  return (
    <div className="rounded-2xl bg-[#0f1e2e] p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white">Executive Intelligence Dashboard</h2>
          <p className="text-xs text-gray-400">Maritime-ETSS real-time metrics</p>
        </div>
        <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
          Live
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {items.map((item) => (
          <button
            key={item.label}
            className="group rounded-xl bg-white/5 p-4 text-left transition-colors hover:bg-white/10"
          >
            <div className="mb-2 flex items-center justify-between">
              <div className={`rounded-lg p-1.5 ${item.bg}`}>
                <item.icon className={`h-4 w-4 ${item.color}`} />
              </div>
              <span
                className={`flex items-center gap-0.5 text-[11px] font-medium ${
                  item.trendUp ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {item.trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {item.trendUp ? "+" : "-"}{item.trend}%
              </span>
            </div>
            <p className="text-2xl font-bold text-white">
              {typeof item.value === "number" ? item.value.toLocaleString() : item.value}
            </p>
            <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-gray-500">
              {item.label}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Revenue Strip ───
function RevenueStrip() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {revenueCards.map((card) => (
        <div
          key={card.label}
          className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-5 py-4"
        >
          <div>
            <p className="text-xs text-gray-500">{card.label}</p>
            <p className="mt-1 text-lg font-bold text-gray-900">
              ₦{card.amount.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
              ₦
            </span>
            <span className="text-[11px] font-medium text-emerald-600">+{card.trend}%</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Manifest Lifecycle ───
function ManifestLifecycle() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="mb-5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">
          Booking → Manifest Lifecycle
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Live truck counts at each corridor stage — each number is trucks currently in that stage
        </p>
      </div>

      <div className="space-y-6">
        {manifestLifecycleGroups.map((group) => (
          <div key={group.label}>
            <div className="mb-3 flex items-center gap-2">
              <span className="h-px flex-1 bg-gray-100" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{group.label}</span>
              <span className="h-px flex-1 bg-gray-100" />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {group.items.map((item) => (
                <div
                  key={item.stage}
                  className="rounded-xl border border-gray-100 bg-gray-50/80 p-4 transition-colors hover:border-emerald-200 hover:bg-emerald-50/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-gray-900">{item.stage}</p>
                      <p className="mt-1.5 text-[11px] leading-relaxed text-gray-500">{item.description}</p>
                    </div>
                    <span className="shrink-0 rounded-lg bg-emerald-600 px-2.5 py-1 text-lg font-bold tabular-nums text-white">
                      {item.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Bookings by Category ───
function BookingsByCategory() {
  return (
    <div className="flex h-full flex-col rounded-xl border border-gray-200 bg-white p-5">
      <h3 className="text-sm font-bold text-gray-900">Bookings by transfer types</h3>
      <div className="relative mx-auto mt-3 w-full max-w-[240px]">
        <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={bookingsByCategory}
                cx="50%"
                cy="50%"
                innerRadius={56}
                outerRadius={84}
                paddingAngle={3}
                dataKey="value"
                nameKey="name"
                stroke="#ffffff"
                strokeWidth={2}
              >
                {bookingsByCategory.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
                formatter={(value, name) => [`${value} bookings`, name]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <p className="text-2xl font-bold text-gray-900 tabular-nums">{totalBookingsByCategory}</p>
          <p className="text-[11px] text-gray-500">Total bookings</p>
        </div>
      </div>
      <div className="mt-3 space-y-1.5">
        {bookingsByCategory.map((cat) => (
          <div key={cat.name} className="flex items-center justify-between gap-2 rounded-lg bg-gray-50 px-2.5 py-1.5">
            <div className="flex min-w-0 items-center gap-2">
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: cat.color }} />
              <span className="truncate text-[11px] text-gray-600">{cat.name}</span>
            </div>
            <span className="shrink-0 text-[11px] font-bold text-gray-900 tabular-nums">
              {cat.value}
              <span className="ml-1 font-normal text-gray-400">
                ({Math.round((cat.value / totalBookingsByCategory) * 100)}%)
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Incident Notification Board ───
function IncidentNotificationBoard() {
  return (
    <div className="flex h-full flex-col rounded-xl border border-gray-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-900">Incident notification board</h3>
        <button className="flex items-center gap-0.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700">
          View all <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="flex min-h-0 flex-1 flex-col space-y-2.5">
        {incidentNotifications.map((inc, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/60 px-4 py-3"
          >
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
              inc.severity === "Critical" ? "bg-red-600" : "bg-red-100"
            }`}>
              <AlertTriangle className={`h-4 w-4 ${inc.severity === "Critical" ? "text-white" : "text-red-600"}`} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-gray-900">{inc.title}</p>
              <p className="truncate text-[11px] text-gray-500">{inc.meta}</p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${severityStyles[inc.severity]}`}>
                {inc.severity}
              </span>
              <span className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold ${incidentStatusStyles[inc.status]}`}>
                {inc.status}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex shrink-0 items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
        <div className="flex items-center gap-2">
          <Truck className="h-4 w-4 text-amber-700" />
          <p className="text-xs font-medium text-amber-900">1 tow-truck request on Left-Manifest</p>
        </div>
        <button className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">Dispatch</button>
      </div>
    </div>
  );
}

// ─── Operations Command & Control ───
function OpsCommandControl() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="mb-4 flex items-start gap-2">
        <Send className="mt-0.5 h-4 w-4 text-emerald-600" />
        <div>
          <h3 className="text-sm font-bold text-gray-900">
            Operations Command &amp; Control (AI-Powered)
          </h3>
          <p className="mt-1 text-[11px] leading-relaxed text-gray-500">
            One-tap corridor interventions. AI recommends the action; the SuperAdmin authorises and the order is dispatched to LASTMA and Ops Control.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {opsCommandActions.map((action) => (
          <button
            key={action.title}
            className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-colors ${action.accent}`}
          >
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${action.iconCls}`}>
              <action.icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-gray-900">{action.title}</p>
              <p className="mt-0.5 text-[10px] leading-snug text-gray-500">{action.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Live Feed (Tabbed) ───
function LiveFeed() {
  const [tab, setTab] = useState<"bookings" | "matchings">("bookings");

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <div className="flex border-b border-gray-100">
        <button
          onClick={() => setTab("bookings")}
          className={`flex-1 px-4 py-3 text-xs font-semibold transition-colors ${
            tab === "bookings"
              ? "border-b-2 border-emerald-600 text-emerald-700"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Recent Bookings
        </button>
        <button
          onClick={() => setTab("matchings")}
          className={`flex-1 px-4 py-3 text-xs font-semibold transition-colors ${
            tab === "matchings"
              ? "border-b-2 border-emerald-600 text-emerald-700"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Recent Matchings
        </button>
      </div>

      <div className="max-h-100 overflow-y-auto p-4">
        {tab === "bookings" ? (
          <div className="space-y-3">
            {recentBookings.map((b, i) => (
              <div key={i} className="rounded-lg border-l-4 border-emerald-500 bg-gray-50 p-3">
                <div className="flex items-start justify-between">
                  <p className="text-xs font-semibold text-gray-800">{b.type}</p>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    b.status === "On-Trip" ? "bg-emerald-100 text-emerald-700" :
                    b.status === "Pending" ? "bg-amber-100 text-amber-700" :
                    "bg-blue-100 text-blue-700"
                  }`}>
                    {b.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  <span className="font-medium text-gray-700">{b.plateNumber}</span> — {b.bookedBy}
                </p>
                <p className="mt-0.5 text-[11px] text-gray-400">{b.time}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {recentMatchings.map((m, i) => (
              <div key={i} className="rounded-lg border-l-4 border-blue-500 bg-gray-50 p-3">
                <p className="text-xs font-semibold text-gray-800">{m.facility}</p>
                <p className="mt-1 text-xs text-gray-500">
                  <span className="font-medium text-gray-700">{m.plateNumber}</span> — {m.category}
                </p>
                <p className="text-xs text-gray-500">→ {m.destination}</p>
                <p className="mt-0.5 text-[11px] text-gray-400">{m.time}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Dashboard ───
export function DashboardOverview() {
  return (
    <div className="space-y-5 p-5 lg:p-6">
      <CorridorLiveBanner />
      <StatsBanner />

      <div>
        <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">
          e-Revenue Breakdown
        </h2>
        <RevenueStrip />
      </div>

      <ManifestLifecycle />

      {/* Row 1: Live Bookings · Live Matchings · Recent feed */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-[1fr_1fr_340px]">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Live Bookings by Terminal</h3>
              <p className="text-xs text-gray-500">Count of live bookings across all terminals</p>
            </div>
            <button className="flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-700">
              View All <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bookingsByTerminal} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="terminal" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="live" name="Live" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="completed" name="Completed" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="cancelled" name="Cancelled" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Live Matchings by Terminal</h3>
              <p className="text-xs text-gray-500">Count of live matchings across all facilities</p>
            </div>
            <button className="flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-700">
              View All <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={matchingsByTerminal} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="terminal" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="truckEntry" name="Truck Entry Permits" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="matched" name="Matched" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="unmatched" name="Unmatched" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <LiveFeed />
      </div>

      {/* Row 2: Bookings by category · Incident board */}
      <div className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-[minmax(280px,1fr)_2fr]">
        <BookingsByCategory />
        <IncidentNotificationBoard />
      </div>

      <OpsCommandControl />
    </div>
  );
}

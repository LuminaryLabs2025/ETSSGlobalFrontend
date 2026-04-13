"use client";

import { useState } from "react";
import Link from "next/link";
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
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import {
  dashboardStats,
  revenueCards,
  recentBookings,
  recentMatchings,
  bookingsByTerminal,
  matchingsByTerminal,
} from "@/lib/mock-data";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// ─── Mock Incidents ───
const incidents = [
  { title: "Apapa Gate 2 Gridlock", time: "15M AGO", severity: "high" },
  { title: "Tincan Server Latency", time: "42M AGO", severity: "medium" },
  { title: "Power Outage Transit Park B", time: "1H AGO", severity: "high" },
  { title: "Police Checkpoint — Mile 2", time: "2H AGO", severity: "low" },
];

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
          <h1 className="text-xl font-bold text-white">Operations Overview</h1>
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

// ─── Live Feed (Tabbed) ───
function LiveFeed() {
  const [tab, setTab] = useState<"bookings" | "matchings">("bookings");

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      {/* Tabs */}
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

// ─── Incident Reports ───
function IncidentReports() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-900">Incident Reports</h3>
        <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-[10px] font-bold text-red-700">
          {incidents.length} ACTIVE
        </span>
      </div>
      <div className="space-y-2.5">
        {incidents.map((inc, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 rounded-lg border-l-4 bg-gray-50 px-3 py-3 ${
              inc.severity === "high" ? "border-red-500" :
              inc.severity === "medium" ? "border-amber-500" :
              "border-gray-300"
            }`}
          >
            <AlertCircle className={`h-4 w-4 shrink-0 ${
              inc.severity === "high" ? "text-red-500" :
              inc.severity === "medium" ? "text-amber-500" :
              "text-gray-400"
            }`} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-gray-800">{inc.title}</p>
              <p className="flex items-center gap-1 text-[11px] text-gray-400">
                <Clock className="h-3 w-3" /> {inc.time}
              </p>
            </div>
          </div>
        ))}
      </div>
      <button className="mt-4 flex w-full items-center justify-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700">
        View All Incident Reports <ChevronRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ─── Security Status ───
function SecurityStatus() {
  return (
    <div className="flex flex-col items-center rounded-xl border border-gray-200 bg-linear-to-b from-gray-50 to-white p-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
        <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
      </div>
      <h4 className="mt-3 text-sm font-bold uppercase tracking-wider text-gray-700">
        Security Status
      </h4>
      <p className="mt-2 text-xs leading-relaxed text-gray-500">
        Last audit: 2h ago. All terminal access points encrypted and verified.
      </p>
    </div>
  );
}

// ─── Main Dashboard ───
export function DashboardOverview() {
  return (
    <div className="space-y-5 p-5 lg:p-6">
      {/* Row 1: Stats Banner */}
      <StatsBanner />

      {/* Row 2: Revenue Strip */}
      <div>
        <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">
          e-Revenue Breakdown
        </h2>
        <RevenueStrip />
      </div>

      {/* Row 3: Bento Grid — Charts + Feeds */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_340px]">
        {/* Left: Charts */}
        <div className="space-y-5">
          {/* Charts Grid */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {/* Bookings Chart */}
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    Live Bookings by Terminal
                  </h3>
                  <p className="text-xs text-gray-500">
                    Count of live bookings across all terminals
                  </p>
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

            {/* Matchings Chart */}
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    Live Matchings by Terminal
                  </h3>
                  <p className="text-xs text-gray-500">
                    Count of live matchings across all facilities
                  </p>
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
          </div>
        </div>

        {/* Right Column: Feed + Incidents + Security */}
        <div className="space-y-5">
          <LiveFeed />
          <IncidentReports />
          <SecurityStatus />
        </div>
      </div>
    </div>
  );
}
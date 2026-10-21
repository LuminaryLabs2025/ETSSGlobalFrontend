"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Ban,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  Loader2,
  Megaphone,
  Route,
  Send,
  Siren,
  Truck,
  Users,
  Timer,
  Warehouse,
  X,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth.store";
import {
  formatOverviewMoney,
  formatRelativeReportedAt,
  overviewCurrencySymbol,
  TrendIndicator,
} from "@/lib/dashboard-overview-trends";
import {
  useCreateOverviewOpsOrder,
  useLiftOverviewOpsOrder,
  useOverviewBookingsByCategory,
  useOverviewBookingsByTerminal,
  useOverviewCorridor,
  useOverviewExecutive,
  useOverviewIncidentBoard,
  useOverviewLifecycle,
  useOverviewMatchingsByFacility,
  useOverviewOpsCommand,
  useOverviewRecentActivity,
  useOverviewRedZone,
  useOverviewRevenue,
} from "@/hooks/dashboard-overview/useDashboardOverview";
import type {
  DashboardOpsAction,
  DashboardOpsActionType,
  DashboardTrendMetric,
} from "@/types/dashboard-overview.types";

const CATEGORY_COLORS = [
  "#3b82f6",
  "#6366f1",
  "#06b6d4",
  "#10b981",
  "#14b8a6",
  "#f59e0b",
  "#8b5cf6",
  "#94a3b8",
];

const OPS_ICONS: Record<DashboardOpsActionType, LucideIcon> = {
  SUSPEND_RED_ZONE_DISPATCH: Ban,
  REROUTE_CORRIDOR_TRAFFIC: Route,
  ACTIVATE_OVERFLOW_HOLDING: Warehouse,
  BROADCAST_DIVERSION_ADVISORY: Megaphone,
  PRIORITY_MOVEMENT: Zap,
};

function opsCardStyles(action: DashboardOpsActionType, recommended: boolean) {
  if (recommended && action === "SUSPEND_RED_ZONE_DISPATCH") {
    return {
      card: "border-red-200 bg-red-50/40",
      icon: "text-red-600 bg-red-100",
    };
  }
  if (recommended && action === "PRIORITY_MOVEMENT") {
    return {
      card: "border-emerald-200 bg-emerald-50/40",
      icon: "text-emerald-600 bg-emerald-100",
    };
  }
  if (recommended) {
    return {
      card: "border-amber-200 bg-amber-50/40",
      icon: "text-amber-700 bg-amber-100",
    };
  }
  return {
    card: "border-gray-200 bg-white",
    icon: "text-gray-700 bg-gray-100",
  };
}

function SectionLoading({ className = "h-32" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center rounded-xl border border-gray-200 bg-white ${className}`}>
      <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
    </div>
  );
}

function executiveValue(metric: DashboardTrendMetric): string {
  if (metric.display != null && metric.display !== "") return metric.display;
  if (metric.value == null) return "—";
  return typeof metric.value === "number"
    ? metric.value.toLocaleString()
    : String(metric.value);
}

function severityClass(severity: string) {
  const u = severity.toUpperCase();
  if (u === "CRITICAL") return "bg-red-700 text-white";
  if (u === "HIGH") return "bg-red-100 text-red-700";
  if (u === "MEDIUM") return "bg-amber-100 text-amber-700";
  return "bg-gray-100 text-gray-600";
}

function RedZoneDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data, isLoading, isError } = useOverviewRedZone(open);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="text-sm font-bold text-gray-900">Red zone sites</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {isLoading && <Loader2 className="mx-auto h-8 w-8 animate-spin text-emerald-500" />}
          {isError && (
            <p className="text-sm text-red-600">Failed to load red zone data.</p>
          )}
          {data && (
            <>
              <p className="text-xs text-gray-500">
                Index {data.index}/{100} · threshold {data.threshold} · {data.red_zone_site_count}{" "}
                site(s) in red zone
              </p>
              <div className="mt-4 space-y-2">
                {data.sites.map((site) => (
                  <div
                    key={`${site.site_type}-${site.id}`}
                    className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-xs"
                  >
                    <p className="font-semibold text-gray-900">{site.name}</p>
                    <p className="text-gray-500">
                      {site.utilisation_percentage}% · {site.occupied}/{site.capacity}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

function CorridorLiveBanner() {
  const [redZoneOpen, setRedZoneOpen] = useState(false);
  const { data, isLoading, isError } = useOverviewCorridor();

  if (isLoading) return <SectionLoading className="h-40 rounded-2xl border-0 bg-[#0f1e2e]" />;
  if (isError || !data) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800">
        Failed to load corridor status.
      </div>
    );
  }

  const inRed = data.congestion.in_red_zone;

  const sitesBreakdown = `${data.active_sites.terminals} terminals · ${data.active_sites.facilities} facilities · ${data.active_sites.transit_parks} transit parks`;

  const metrics: {
    value: number;
    label: string;
    hint: string;
    suffix?: string;
    alert?: boolean;
    breakdownTitle?: string;
  }[] = [
    {
      value: data.live_movements,
      label: "Live movements",
      hint: "Trucks in active transit",
    },
    {
      value: data.active_sites.total,
      label: "Active terminals",
      hint: "Reporting live status",
      breakdownTitle: sitesBreakdown,
    },
    {
      value: data.verified_trucks_on_corridor,
      label: "Verified trucks",
      hint: "On corridor now",
    },
    {
      value: data.congestion.index,
      suffix: "/100",
      label: "Congestion index",
      hint: inRed ? "Red-zone threshold" : "Within normal range",
      alert: inRed,
    },
  ];

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-[#0f1e2e] p-5 sm:p-6">
        <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-emerald-500/50 to-transparent" />

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
            <Link
              href="/dashboard/traffic/live-trucks"
              className="rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-700"
            >
              Traffic Command
            </Link>
            <button
              type="button"
              onClick={() => setRedZoneOpen(true)}
              className="flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/10"
            >
              <AlertTriangle className={`h-3.5 w-3.5 ${inRed ? "text-red-400" : "text-amber-400"}`} />
              Red-Zone
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
          {metrics.map((m) => (
            <div
              key={m.label}
              title={m.breakdownTitle}
              className={`rounded-xl px-3.5 py-3 sm:px-4 ${
                m.alert ? "bg-red-500/10 ring-1 ring-red-500/20" : "bg-white/5"
              }`}
            >
              <p
                className={`text-2xl font-bold tabular-nums leading-none sm:text-[1.75rem] ${
                  m.alert ? "text-red-300" : "text-white"
                }`}
              >
                {m.value}
                {m.suffix && (
                  <span className="text-base font-semibold text-gray-500">{m.suffix}</span>
                )}
              </p>
              <p className="mt-1.5 text-[11px] font-semibold text-gray-300">{m.label}</p>
              <p className="mt-0.5 text-[10px] text-gray-500">{m.hint}</p>
            </div>
          ))}
        </div>

        <p className="mt-3.5 border-t border-white/5 pt-3.5 text-xs text-gray-500">
          <span className="font-medium text-gray-400">
            {data.verified_drivers_on_corridor} verified drivers
          </span>
          {" "}active across the corridor · Ibeju-Lekki maritime zone
        </p>
      </div>
      <RedZoneDrawer open={redZoneOpen} onClose={() => setRedZoneOpen(false)} />
    </>
  );
}

function StatsBanner() {
  const { data, isLoading, isError } = useOverviewExecutive();

  const items = useMemo(() => {
    if (!data) return [];
    return [
      { icon: BookOpen, label: "Live Bookings", metric: data.live_bookings, color: "text-amber-400", bg: "bg-amber-400/10" },
      { icon: Truck, label: "Verified Trucks", metric: data.verified_trucks, color: "text-blue-400", bg: "bg-blue-400/10" },
      { icon: Users, label: "Verified Drivers", metric: data.verified_drivers, color: "text-emerald-400", bg: "bg-emerald-400/10" },
      { icon: Timer, label: "AVG TAT Apapa", metric: data.avg_tat_apapa, color: "text-violet-400", bg: "bg-violet-400/10" },
      { icon: Clock, label: "AVG TAT Tincan", metric: data.avg_tat_tincan, color: "text-cyan-400", bg: "bg-cyan-400/10" },
      { icon: AlertTriangle, label: "Exceptions", metric: data.exceptions, color: "text-red-400", bg: "bg-red-400/10" },
    ];
  }, [data]);

  if (isLoading) return <SectionLoading className="h-48 rounded-2xl border-0 bg-[#0f1e2e]" />;
  if (isError || !data) {
    return (
      <div className="rounded-2xl bg-[#0f1e2e] p-6 text-sm text-red-300">
        Failed to load executive metrics.
      </div>
    );
  }

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
          <div key={item.label} className="rounded-xl bg-white/5 p-4 text-left">
            <div className="mb-2 flex items-center justify-between">
              <div className={`rounded-lg p-1.5 ${item.bg}`}>
                <item.icon className={`h-4 w-4 ${item.color}`} />
              </div>
              <TrendIndicator
                trendPercentage={item.metric.trend_percentage}
                trendDirection={item.metric.trend_direction}
                higherIsBetter={item.metric.higher_is_better}
              />
            </div>
            <p className="text-2xl font-bold text-white">{executiveValue(item.metric)}</p>
            <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-gray-500">
              {item.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function RevenueStrip() {
  const { data, isLoading, isError } = useOverviewRevenue();

  if (isLoading) return <SectionLoading className="h-24" />;
  if (isError || !data) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
        Failed to load e-Revenue breakdown.
      </div>
    );
  }

  const currency = data.currency ?? "NGN";
  const currencySymbol = overviewCurrencySymbol(currency);

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {data.cards.map((card) => (
        <div
          key={card.source}
          className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-5 py-4"
        >
          <div>
            <p className="text-xs text-gray-500">{card.label}</p>
            <p className="mt-1 text-lg font-bold text-gray-900">
              {formatOverviewMoney(card.amount, currency)}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span
              className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700"
              title={currency}
            >
              {currencySymbol}
            </span>
            <TrendIndicator
              trendPercentage={card.trend_percentage}
              trendDirection={card.trend_direction}
              higherIsBetter
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function ManifestLifecycle() {
  const { data, isLoading, isError } = useOverviewLifecycle();

  if (isLoading) return <SectionLoading className="min-h-[200px]" />;
  if (isError || !data) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">
        Failed to load booking lifecycle.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="mb-5 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Booking → Manifest Lifecycle
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Live truck counts at each corridor stage — {data.total_live} total live
          </p>
        </div>
      </div>
      <div className="space-y-6">
        {data.groups.map((group) => (
          <div key={group.key}>
            <div className="mb-3 flex items-center gap-2">
              <span className="h-px flex-1 bg-gray-100" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{group.label}</span>
              <span className="h-px flex-1 bg-gray-100" />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {group.items.map((item) => (
                <div
                  key={item.key}
                  className="rounded-xl border border-gray-100 bg-gray-50/80 p-4 transition-colors hover:border-emerald-200 hover:bg-emerald-50/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-gray-900">{item.label}</p>
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

function BookingsByCategory() {
  const { data, isLoading, isError } = useOverviewBookingsByCategory();

  const pieData = useMemo(
    () =>
      (data?.data ?? []).map((row, index) => ({
        name: row.name,
        value: row.count,
        color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
      })),
    [data],
  );

  if (isLoading) return <SectionLoading className="h-full min-h-[320px]" />;
  if (isError || !data) {
    return (
      <div className="flex h-full flex-col rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">
        Failed to load bookings by category.
      </div>
    );
  }

  const total = data.total || pieData.reduce((s, c) => s + c.value, 0);

  return (
    <div className="flex h-full flex-col rounded-xl border border-gray-200 bg-white p-5">
      <h3 className="text-sm font-bold text-gray-900">Bookings by transfer types</h3>
      <div className="relative mx-auto mt-3 w-full max-w-[240px]">
        <div className="h-52 w-full">
          {pieData.length === 0 ? (
            <p className="flex h-full items-center justify-center text-xs text-gray-400">No data</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
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
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
                  formatter={(value, name) => [`${value} bookings`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
        {total > 0 && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            <p className="text-2xl font-bold tabular-nums text-gray-900">{total}</p>
            <p className="text-[11px] text-gray-500">Total bookings</p>
          </div>
        )}
      </div>
      <div className="mt-3 space-y-1.5">
        {pieData.map((cat) => (
          <div key={cat.name} className="flex items-center justify-between gap-2 rounded-lg bg-gray-50 px-2.5 py-1.5">
            <div className="flex min-w-0 items-center gap-2">
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: cat.color }} />
              <span className="truncate text-[11px] text-gray-600">{cat.name}</span>
            </div>
            <span className="shrink-0 text-[11px] font-bold tabular-nums text-gray-900">
              {cat.value}
              {total > 0 && (
                <span className="ml-1 font-normal text-gray-400">
                  ({Math.round((cat.value / total) * 100)}%)
                </span>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function IncidentNotificationBoard() {
  const { data, isLoading, isError } = useOverviewIncidentBoard();

  if (isLoading) return <SectionLoading className="h-full min-h-[320px]" />;
  if (isError || !data) {
    return (
      <div className="flex h-full flex-col rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">
        Failed to load incident board.
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col rounded-xl border border-gray-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-gray-900">Incident notification board</h3>
          <p className="text-[11px] text-gray-500">{data.open_total} open incident(s)</p>
        </div>
        <Link
          href="/dashboard/incidents"
          className="flex items-center gap-0.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
        >
          View all <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      <div className="flex min-h-0 flex-1 flex-col space-y-2.5">
        {data.data.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-400">No open incidents</p>
        ) : (
          data.data.map((inc) => (
            <Link
              key={inc.id}
              href="/dashboard/incidents"
              className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/60 px-4 py-3 hover:bg-gray-50"
            >
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${inc.severity === "CRITICAL" ? "bg-red-600" : "bg-red-100"}`}>
                <AlertTriangle className={`h-4 w-4 ${inc.severity === "CRITICAL" ? "text-white" : "text-red-600"}`} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-gray-900">{inc.title}</p>
                <p className="truncate text-[11px] text-gray-500">
                  {inc.reference_id} · reported {formatRelativeReportedAt(inc.reported_at)} · {inc.reported_by}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${severityClass(inc.severity)}`}>
                  {inc.severity_label}
                </span>
                <span className="rounded-md border border-gray-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-gray-700">
                  {inc.status_label}
                </span>
              </div>
            </Link>
          ))
        )}
      </div>
      {data.tow_requests.pending_left_manifest > 0 && (
        <div className="mt-4 flex shrink-0 items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-amber-700" />
            <p className="text-xs font-medium text-amber-900">
              {data.tow_requests.pending_left_manifest} tow-truck request(s) on Left-Manifest
            </p>
          </div>
          <Link
            href="/dashboard/bookings/manifest?tab=left"
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
          >
            Dispatch
          </Link>
        </div>
      )}
    </div>
  );
}

function LiveFeed() {
  const [tab, setTab] = useState<"bookings" | "matchings">("bookings");
  const bookingsQuery = useOverviewRecentActivity("bookings", tab === "bookings");
  const matchingsQuery = useOverviewRecentActivity("matchings", tab === "matchings");
  const active = tab === "bookings" ? bookingsQuery : matchingsQuery;

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <div className="flex border-b border-gray-100">
        {(["bookings", "matchings"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex-1 px-4 py-3 text-xs font-semibold transition-colors ${
              tab === t
                ? "border-b-2 border-emerald-600 text-emerald-700"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t === "bookings" ? "Recent Bookings" : "Recent Matchings"}
          </button>
        ))}
      </div>
      <div className="max-h-100 overflow-y-auto p-4">
        {active.isLoading ? (
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-emerald-500" />
        ) : active.isError ? (
          <p className="text-xs text-red-600">Failed to load activity.</p>
        ) : tab === "bookings" ? (
          <div className="space-y-3">
            {(bookingsQuery.data?.data ?? []).map((b) => {
              const row = b as import("@/types/dashboard-overview.types").DashboardRecentBookingActivity;
              return (
                <div key={row.id} className="rounded-lg border-l-4 border-emerald-500 bg-gray-50 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-semibold text-gray-800">{row.title}</p>
                    <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-700">
                      {row.status_label}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    <span className="font-medium text-gray-700">{row.plate_number}</span> — {row.party}
                  </p>
                  <p className="mt-0.5 text-[11px] text-gray-400">
                    {new Date(row.occurred_at).toLocaleString("en-NG", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-3">
            {(matchingsQuery.data?.data ?? []).map((m) => {
              const row = m as import("@/types/dashboard-overview.types").DashboardRecentMatchingActivity;
              return (
                <div key={row.id} className="rounded-lg border-l-4 border-blue-500 bg-gray-50 p-3">
                  <p className="text-xs font-semibold text-gray-800">{row.facility}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    <span className="font-medium text-gray-700">{row.plate_number}</span> — {row.category}
                  </p>
                  <p className="text-xs text-gray-500">→ {row.destination}</p>
                  <p className="mt-0.5 text-[11px] text-gray-400">
                    {new Date(row.matched_at).toLocaleString("en-NG", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function OpsCommandControl() {
  const isSuperAdmin = useAuthStore((s) => s.user?.is_super_admin ?? false);
  const { data, isLoading, isError, refetch } = useOverviewOpsCommand();
  const createOrder = useCreateOverviewOpsOrder();
  const liftOrder = useLiftOverviewOpsOrder();
  const [pendingAction, setPendingAction] = useState<DashboardOpsAction | null>(null);
  const [notes, setNotes] = useState("");
  const [liftId, setLiftId] = useState<string | null>(null);
  const [liftReason, setLiftReason] = useState("");

  function submitAuthorise() {
    if (!pendingAction) return;
    if (!pendingAction.targets.length) {
      toast.error("No dispatch targets are configured for this action.");
      return;
    }
    createOrder.mutate(
      {
        action: pendingAction.action,
        targets: pendingAction.targets.map((t) => ({
          type: t.type,
          name: t.name,
          id: t.id,
        })),
        notes: notes.trim(),
      },
      {
        onSuccess: () => {
          setPendingAction(null);
          setNotes("");
          refetch();
        },
      },
    );
  }

  function submitLift() {
    if (!liftId || !liftReason.trim()) {
      toast.error("Enter a lift reason.");
      return;
    }
    liftOrder.mutate(
      { id: liftId, payload: { reason: liftReason.trim() } },
      {
        onSuccess: () => {
          setLiftId(null);
          setLiftReason("");
          refetch();
        },
      },
    );
  }

  if (isLoading) return <SectionLoading className="min-h-[160px]" />;
  if (isError || !data) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">
        Failed to load operations command.
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="mb-4 flex items-center gap-2">
          <Send className="h-4 w-4 shrink-0 text-emerald-600" />
          <h3 className="text-sm font-bold text-gray-900">Operations Command &amp; Control</h3>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {data.actions.map((action) => {
            const Icon = OPS_ICONS[action.action] ?? Send;
            const hasActive = action.active_orders.length > 0;
            const styles = opsCardStyles(action.action, action.recommended);
            const openAuthorise = () => {
              if (!isSuperAdmin || createOrder.isPending) return;
              setPendingAction(action);
              setNotes("");
            };

            return (
              <div
                key={action.action}
                className={`flex flex-col rounded-xl border p-4 transition-colors ${styles.card}`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${styles.icon}`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <p className="text-xs font-bold text-gray-900">{action.title}</p>
                      {action.recommended && (
                        <span className="rounded-full bg-emerald-600/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-emerald-700">
                          Recommended
                        </span>
                      )}
                      {hasActive && (
                        <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-amber-800">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="mt-1 line-clamp-2 text-[10px] leading-snug text-gray-500">
                      {action.description}
                    </p>
                  </div>
                </div>

                {isSuperAdmin && (
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      disabled={createOrder.isPending}
                      onClick={openAuthorise}
                      className="min-h-8 flex-1 rounded-lg bg-[#0f1e2e] px-2 py-1.5 text-[10px] font-semibold text-white transition-colors hover:bg-[#1a3048] disabled:opacity-50"
                    >
                      Authorise
                    </button>
                    {hasActive && (
                      <button
                        type="button"
                        onClick={() => {
                          setLiftId(action.active_orders[0].id);
                          setLiftReason("");
                        }}
                        className="min-h-8 shrink-0 rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-[10px] font-semibold text-gray-700 hover:bg-gray-50"
                      >
                        Lift
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {pendingAction && (
        <>
          <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setPendingAction(null)} />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-2xl">
            <h3 className="text-sm font-bold text-gray-900">Authorise order</h3>
            <p className="mt-1 text-xs text-gray-600">{pendingAction.title}</p>
            {pendingAction.recommended && pendingAction.reason && (
              <p className="mt-2 text-[11px] text-emerald-800">{pendingAction.reason}</p>
            )}
            {pendingAction.targets.length > 0 ? (
              <p className="mt-3 text-[11px] text-gray-500">
                {pendingAction.targets.length} target{pendingAction.targets.length === 1 ? "" : "s"}:{" "}
                {pendingAction.targets.map((t) => t.name).join(", ")}
              </p>
            ) : (
              <p className="mt-3 text-[11px] text-amber-800">No targets configured for this action.</p>
            )}
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Notes (optional)…"
              className="mt-3 w-full rounded-lg border border-gray-200 px-3 py-2 text-xs"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setPendingAction(null)} className="rounded-lg border px-3 py-1.5 text-xs">
                Cancel
              </button>
              <button
                type="button"
                disabled={createOrder.isPending}
                onClick={submitAuthorise}
                className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
              >
                Confirm
              </button>
            </div>
          </div>
        </>
      )}

      {liftId && (
        <>
          <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setLiftId(null)} />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-2xl">
            <h3 className="text-sm font-bold text-gray-900">Lift active order</h3>
            <textarea
              value={liftReason}
              onChange={(e) => setLiftReason(e.target.value)}
              rows={3}
              placeholder="Reason for lifting…"
              className="mt-3 w-full rounded-lg border border-gray-200 px-3 py-2 text-xs"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setLiftId(null)} className="rounded-lg border px-3 py-1.5 text-xs">
                Cancel
              </button>
              <button
                type="button"
                disabled={liftOrder.isPending}
                onClick={submitLift}
                className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
              >
                Lift order
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}

function TerminalChartsRow() {
  const { data: bookingsData, isLoading: bookingsLoading, isError: bookingsError } =
    useOverviewBookingsByTerminal();
  const { data: matchingsData, isLoading: matchingsLoading, isError: matchingsError } =
    useOverviewMatchingsByFacility();

  const matchingsChart = useMemo(
    () =>
      (matchingsData?.data ?? []).map((row) => ({
        facility: row.facility,
        truckEntry: row.truck_entry_permits,
        matched: row.matched,
        unmatched: row.unmatched,
      })),
    [matchingsData],
  );

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-[1fr_1fr_340px]">
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Live Bookings by Terminal</h3>
            <p className="text-xs text-gray-500">Count of live bookings across all terminals</p>
          </div>
          <Link
            href="/dashboard/bookings/all"
            className="flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-700"
          >
            View All
          </Link>
        </div>
        <div className="h-72">
          {bookingsLoading ? (
            <Loader2 className="mx-auto mt-24 h-6 w-6 animate-spin text-emerald-500" />
          ) : bookingsError ? (
            <p className="pt-20 text-center text-xs text-red-600">Failed to load chart.</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bookingsData?.data ?? []} barCategoryGap="20%">
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
          )}
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Live Matchings by Facility</h3>
            <p className="text-xs text-gray-500">Truck entry permits grouped by facility</p>
          </div>
          <Link
            href="/dashboard/bookings/all"
            className="flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-700"
          >
            View All
          </Link>
        </div>
        <div className="h-72">
          {matchingsLoading ? (
            <Loader2 className="mx-auto mt-24 h-6 w-6 animate-spin text-emerald-500" />
          ) : matchingsError ? (
            <p className="pt-20 text-center text-xs text-red-600">Failed to load chart.</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={matchingsChart} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="facility" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="truckEntry" name="Truck Entry Permits" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="matched" name="Matched" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="unmatched" name="Unmatched" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <LiveFeed />
    </div>
  );
}

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
      <TerminalChartsRow />

      <div className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-[minmax(280px,1fr)_2fr]">
        <BookingsByCategory />
        <IncidentNotificationBoard />
      </div>

      <OpsCommandControl />
    </div>
  );
}

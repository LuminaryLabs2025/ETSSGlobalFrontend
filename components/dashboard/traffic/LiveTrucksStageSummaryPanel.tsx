"use client";

import {
  ArrowRightLeft,
  CheckCircle2,
  DoorOpen,
  Landmark,
  Loader2,
  RefreshCw,
  Route,
  Shield,
  Truck,
  Warehouse,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { OccTrucksStageCount } from "@/types/traffic.types";

type StageGroupKey = "movement" | "facility" | "pregate" | "terminal";

const STAGE_GROUPS: {
  key: StageGroupKey;
  title: string;
  hint: string;
  Icon: LucideIcon;
  accent: string;
  stages: string[];
}[] = [
  {
    key: "movement",
    title: "Movement",
    hint: "On trip & matched",
    Icon: Truck,
    accent: "text-blue-400",
    stages: ["ON_TRIP", "MATCHED"],
  },
  {
    key: "facility",
    title: "Facility",
    hint: "On-site & departures",
    Icon: Warehouse,
    accent: "text-emerald-400",
    stages: ["IN_FACILITY", "GTG_FACILITY", "LEFT_FACILITY"],
  },
  {
    key: "pregate",
    title: "Pregate",
    hint: "Transit park flow",
    Icon: DoorOpen,
    accent: "text-orange-400",
    stages: ["IN_PREGATE", "GTG_PREGATE", "LEFT_PREGATE"],
  },
  {
    key: "terminal",
    title: "Terminal",
    hint: "Port terminal",
    Icon: Landmark,
    accent: "text-violet-400",
    stages: ["IN_TERMINAL"],
  },
];

const STAGE_TILE_STYLE: Record<
  string,
  { color: string; bg: string }
> = {
  ON_TRIP: { color: "text-blue-300", bg: "bg-blue-500/15" },
  MATCHED: { color: "text-cyan-300", bg: "bg-cyan-500/15" },
  IN_FACILITY: { color: "text-emerald-300", bg: "bg-emerald-500/15" },
  GTG_FACILITY: { color: "text-teal-300", bg: "bg-teal-500/15" },
  LEFT_FACILITY: { color: "text-lime-300", bg: "bg-lime-500/15" },
  IN_PREGATE: { color: "text-orange-300", bg: "bg-orange-500/15" },
  GTG_PREGATE: { color: "text-amber-300", bg: "bg-amber-500/15" },
  LEFT_PREGATE: { color: "text-yellow-300", bg: "bg-yellow-500/15" },
  IN_TERMINAL: { color: "text-violet-300", bg: "bg-violet-500/15" },
};

function stageLookup(byStage: OccTrucksStageCount[]) {
  const map = new Map<string, OccTrucksStageCount>();
  for (const row of byStage) {
    map.set(row.stage.toUpperCase(), row);
  }
  return map;
}

export function LiveTrucksStageSummaryPanel({
  title,
  subtitle,
  lastUpdated,
  totalBookings,
  byStage,
  loading,
}: {
  title: string;
  subtitle: string;
  lastUpdated: Date;
  totalBookings: number;
  byStage: OccTrucksStageCount[];
  loading: boolean;
}) {
  const lastRefresh = lastUpdated.toLocaleString("en-NG", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  const lookup = stageLookup(byStage);
  const stageSum = byStage.reduce((s, r) => s + r.count, 0);

  const knownStages = new Set(STAGE_GROUPS.flatMap((g) => g.stages));
  const extraStages = byStage.filter((row) => !knownStages.has(row.stage.toUpperCase()));

  const groupTotals = STAGE_GROUPS.map((group) => ({
    ...group,
    total: group.stages.reduce((s, code) => s + (lookup.get(code)?.count ?? 0), 0),
  }));

  const barTotal =
    groupTotals.reduce((s, g) => s + g.total, 0) + extraStages.reduce((s, r) => s + r.count, 0) || 1;

  return (
    <div className="rounded-2xl bg-[#0f1e2e] p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <p className="text-xs text-gray-400">{subtitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-[10px] text-gray-400">
            <RefreshCw className="h-3 w-3 shrink-0" />
            <span className="whitespace-nowrap">Last refresh: {lastRefresh}</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
              Live
            </span>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5">
            <Shield className="h-3.5 w-3.5 shrink-0 text-amber-400" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-400">
              SuperAdmin
            </span>
          </div>
        </div>
      </div>

      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-stretch">
        <div className="flex min-w-[140px] flex-col justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-5 py-4">
          <div className="mb-2 inline-flex w-fit rounded-lg bg-cyan-500/20 p-1.5">
            <Route className="h-4 w-4 text-cyan-300" />
          </div>
          <p className="text-3xl font-bold tabular-nums text-white">
            {loading ? "—" : totalBookings}
          </p>
          <p className="mt-1 text-[11px] font-medium uppercase tracking-wider text-cyan-200/80">
            Live listings
          </p>
        </div>

        <div className="min-w-0 flex-1 rounded-xl bg-white/5 px-4 py-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
              Stage mix
            </p>
            <p className="text-[10px] text-gray-500">
              {loading ? "—" : `${stageSum} staged`}
            </p>
          </div>
          <div className="flex h-2.5 overflow-hidden rounded-full bg-white/10">
            {groupTotals.map((group) =>
              group.total > 0 ? (
                <div
                  key={group.key}
                  className={`h-full min-w-[2px] transition-all ${
                    group.key === "movement"
                      ? "bg-blue-500"
                      : group.key === "facility"
                        ? "bg-emerald-500"
                        : group.key === "pregate"
                          ? "bg-orange-500"
                          : "bg-violet-500"
                  }`}
                  style={{ width: `${(group.total / barTotal) * 100}%` }}
                  title={`${group.title}: ${group.total}`}
                />
              ) : null,
            )}
          </div>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            {groupTotals.map((group) => (
              <span key={group.key} className="flex items-center gap-1.5 text-[10px] text-gray-400">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    group.key === "movement"
                      ? "bg-blue-500"
                      : group.key === "facility"
                        ? "bg-emerald-500"
                        : group.key === "pregate"
                          ? "bg-orange-500"
                          : "bg-violet-500"
                  }`}
                />
                {group.title}
                <span className="font-semibold tabular-nums text-gray-300">
                  {loading ? "—" : group.total}
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-7 w-7 animate-spin text-emerald-500" />
        </div>
      ) : (
        <div
          className={`grid grid-cols-1 gap-3 lg:grid-cols-2 ${
            extraStages.length > 0 ? "xl:grid-cols-3" : "xl:grid-cols-4"
          }`}
        >
          {STAGE_GROUPS.map((group) => {
            const GroupIcon = group.Icon;
            return (
              <div
                key={group.key}
                className="rounded-xl border border-white/5 bg-white/[0.03] p-3.5"
              >
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <GroupIcon className={`h-3.5 w-3.5 shrink-0 ${group.accent}`} />
                      <p className="text-xs font-bold text-white">{group.title}</p>
                    </div>
                    <p className="mt-0.5 text-[10px] text-gray-500">{group.hint}</p>
                  </div>
                  <span className="shrink-0 rounded-lg bg-white/10 px-2 py-0.5 text-sm font-bold tabular-nums text-white">
                    {groupTotals.find((g) => g.key === group.key)?.total ?? 0}
                  </span>
                </div>
                <div className="space-y-1.5">
                  {group.stages.map((code) => {
                    const row = lookup.get(code);
                    const count = row?.count ?? 0;
                    const label = row?.label ?? code.replace(/_/g, " ");
                    const style = STAGE_TILE_STYLE[code] ?? {
                      color: "text-gray-300",
                      bg: "bg-white/10",
                    };
                    return (
                      <div
                        key={code}
                        className={`flex items-center justify-between gap-2 rounded-lg px-2.5 py-2 ${style.bg} ${
                          count === 0 ? "opacity-45" : ""
                        }`}
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          {code === "MATCHED" ? (
                            <CheckCircle2 className={`h-3 w-3 shrink-0 ${style.color}`} />
                          ) : code.startsWith("LEFT") ? (
                            <ArrowRightLeft className={`h-3 w-3 shrink-0 ${style.color}`} />
                          ) : (
                            <span className={`h-1.5 w-1.5 shrink-0 rounded-full bg-current ${style.color}`} />
                          )}
                          <span className="truncate text-[11px] font-medium text-gray-200">
                            {label}
                          </span>
                        </div>
                        <span className={`shrink-0 text-sm font-bold tabular-nums ${style.color}`}>
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          {extraStages.length > 0 && (
            <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3.5 lg:col-span-2 xl:col-span-1">
              <div className="mb-3 flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-bold text-white">Other stages</p>
                  <p className="mt-0.5 text-[10px] text-gray-500">From API</p>
                </div>
                <span className="shrink-0 rounded-lg bg-white/10 px-2 py-0.5 text-sm font-bold tabular-nums text-white">
                  {extraStages.reduce((s, r) => s + r.count, 0)}
                </span>
              </div>
              <div className="space-y-1.5">
                {extraStages.map((row) => (
                  <div
                    key={row.stage}
                    className={`flex items-center justify-between gap-2 rounded-lg bg-white/10 px-2.5 py-2 ${
                      row.count === 0 ? "opacity-45" : ""
                    }`}
                  >
                    <span className="truncate text-[11px] font-medium text-gray-200">
                      {row.label}
                    </span>
                    <span className="shrink-0 text-sm font-bold tabular-nums text-gray-300">
                      {row.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

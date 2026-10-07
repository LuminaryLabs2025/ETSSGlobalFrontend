"use client";

import { RefreshCw, Shield, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type TrafficSummaryKpi = {
  label: string;
  value: string | number;
  color: string;
  bg: string;
  Icon: LucideIcon;
};

export function TrafficSummaryPanel({
  title,
  subtitle,
  lastUpdated,
  cards,
  gridClassName,
  aiPowered,
}: {
  title: string;
  subtitle: string;
  lastUpdated: Date;
  cards: TrafficSummaryKpi[];
  gridClassName: string;
  aiPowered?: boolean;
}) {
  const lastRefresh = lastUpdated.toLocaleString("en-NG", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  return (
    <div className="rounded-2xl bg-[#0f1e2e] p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-bold text-white">{title}</h2>
            {aiPowered && (
              <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-violet-300">
                <Sparkles className="h-3 w-3" />
                AI-Powered
              </span>
            )}
          </div>
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
      <div className={`grid gap-3 ${gridClassName}`}>
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl bg-white/5 p-4 transition-colors hover:bg-white/10"
          >
            <div className="mb-2">
              <div className={`inline-flex rounded-lg p-1.5 ${card.bg}`}>
                <card.Icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </div>
            <p className="text-xl font-bold tabular-nums text-white sm:text-2xl">
              {card.value}
            </p>
            <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-gray-500">
              {card.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

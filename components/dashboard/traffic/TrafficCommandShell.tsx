"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Radio, Sparkles } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { SuperAdminGate } from "@/components/dashboard/book-assist/BookAssistUi";

const TRAFFIC_TABS = [
  { label: "Live Truck Updates", href: "/dashboard/traffic/live-trucks" },
  { label: "Live Location Updates", href: "/dashboard/traffic/locations" },
  { label: "OCC Dashboard", href: "/dashboard/traffic/occ", badge: "AI-Powered" },
] as const;

function LiveTimestamp({ at }: { at: Date }) {
  const formatted = at.toLocaleString("en-NG", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  return (
    <p className="text-[11px] text-gray-500">
      Last updated: <span className="font-medium text-gray-700">{formatted}</span>
    </p>
  );
}

export function TrafficCommandShell({
  title,
  subtitle,
  lastUpdated,
  children,
}: {
  title: string;
  subtitle: string;
  lastUpdated: Date;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isSuperAdmin = useAuthStore((s) => s.user?.is_super_admin ?? false);

  if (!isSuperAdmin) {
    return <SuperAdminGate featureLabel="Traffic Command & Coordination Management" />;
  }

  return (
    <div className="space-y-5 p-5 lg:p-6">
      <div className="rounded-2xl border border-white/5 bg-[#0f1e2e] p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-600/20">
              <Radio className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-base font-bold text-white sm:text-lg">{title}</h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-violet-300">
                  <Sparkles className="h-3 w-3" />
                  AI-Powered
                </span>
              </div>
              <p className="mt-1 max-w-2xl text-xs text-gray-400">{subtitle}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                  Live feed
                </span>
              </div>
            </div>
          </div>
          <LiveTimestamp at={lastUpdated} />
        </div>

        <div className="mt-4 flex flex-wrap gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
          {TRAFFIC_TABS.map((tab) => {
            const active = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-center text-xs font-semibold transition-colors sm:min-w-[140px] sm:flex-none ${
                  active ? "bg-emerald-600 text-white" : "text-gray-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                {tab.label}
                {"badge" in tab && tab.badge && (
                  <span
                    className={`hidden rounded px-1 py-0.5 text-[9px] font-bold uppercase sm:inline ${
                      active ? "bg-white/20 text-white" : "bg-violet-500/30 text-violet-200"
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {children}
    </div>
  );
}

"use client";

import { Wallet } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { canViewDashboardOverview } from "@/lib/dashboard-overview-access";
import { useOverviewRevenue } from "@/hooks/dashboard-overview/useDashboardOverview";
import { formatOverviewMoney } from "@/lib/dashboard-overview-trends";

export function OverviewRevenueBadge() {
  const user = useAuthStore((s) => s.user);
  const enabled = canViewDashboardOverview(user);
  const { data } = useOverviewRevenue(enabled);

  if (!enabled) return null;

  const total = data?.total_amount ?? 0;
  const currency = data?.currency ?? "NGN";

  return (
    <div className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 sm:flex">
      <Wallet className="h-3.5 w-3.5 text-emerald-600" />
      <span className="text-xs font-semibold text-emerald-800">
        e-Revenue: {formatOverviewMoney(total, currency)}
      </span>
    </div>
  );
}

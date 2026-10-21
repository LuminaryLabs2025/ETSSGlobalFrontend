import { TrendingDown, TrendingUp } from "lucide-react";
import type { DashboardTrendDirection } from "@/types/dashboard-overview.types";

const CURRENCY_SYMBOL: Record<string, string> = {
  NGN: "₦",
};

export function overviewCurrencySymbol(currency: string): string {
  const code = currency.trim().toUpperCase();
  return CURRENCY_SYMBOL[code] ?? code;
}

export function formatOverviewMoney(amount: number, currency: string): string {
  const code = currency.trim().toUpperCase() || "NGN";
  try {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${overviewCurrencySymbol(code)}${amount.toLocaleString("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
}

export function trendIsPositive(
  direction: DashboardTrendDirection,
  higherIsBetter: boolean,
): boolean | null {
  if (direction === "FLAT") return null;
  if (direction === "UP") return higherIsBetter;
  return !higherIsBetter;
}

export function formatTrendLabel(trendPercentage: number | null): string {
  if (trendPercentage == null) return "—";
  return `${Math.abs(trendPercentage).toFixed(1)}%`;
}

export function TrendIndicator({
  trendPercentage,
  trendDirection,
  higherIsBetter,
}: {
  trendPercentage: number | null;
  trendDirection: DashboardTrendDirection;
  higherIsBetter: boolean;
}) {
  const positive = trendIsPositive(trendDirection, higherIsBetter);
  const label = formatTrendLabel(trendPercentage);

  if (trendPercentage == null) {
    return <span className="text-[11px] font-medium text-gray-500">New</span>;
  }

  const color =
    positive === null
      ? "text-gray-400"
      : positive
        ? "text-emerald-400"
        : "text-red-400";

  return (
    <span className={`flex items-center gap-0.5 text-[11px] font-medium ${color}`}>
      {trendDirection === "UP" ? (
        <TrendingUp className="h-3 w-3" />
      ) : trendDirection === "DOWN" ? (
        <TrendingDown className="h-3 w-3" />
      ) : null}
      {trendDirection === "UP" ? "+" : trendDirection === "DOWN" ? "−" : ""}
      {label}
    </span>
  );
}

export function formatRelativeReportedAt(iso: string): string {
  const then = new Date(iso).getTime();
  const diffMs = Date.now() - then;
  if (Number.isNaN(then)) return "";
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 60) return `${Math.max(1, mins)}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 48) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

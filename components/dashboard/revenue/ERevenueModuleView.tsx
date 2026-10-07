"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Anchor,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  BookOpen,
  Building2,
  Clock,
  Download,
  Eye,
  Filter,
  Gavel,
  ParkingCircle,
  Receipt,
  RefreshCw,
  Search,
  Shield,
  Ticket,
  Truck,
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type {
  DateRangePreset,
  ERevenueModule,
  PaymentMethod,
  PaymentSource,
  PaymentStatus,
  RevenueTransaction,
} from "@/types/e-revenue.types";
import {
  breakdownBySourceEtss,
  buildPieSlices,
  createSimulatedLiveTransaction,
  EREVENUE_MODULE_META,
  filterTransactionsForModule,
  formatPaymentMethod,
  formatPaymentSource,
  formatPaymentStatus,
  getModuleDisplayAmount,
  MOCK_REVENUE_TRANSACTIONS,
  PAYMENT_METHOD_OPTIONS,
  PAYMENT_SOURCE_OPTIONS,
  PAYMENT_STATUS_OPTIONS,
  serviceReferenceLabel,
} from "@/lib/e-revenue-mock-data";
import { ERevenueShell } from "@/components/dashboard/revenue/ERevenueShell";
import { useRevenueLiveTick } from "@/hooks/revenue/useRevenueLiveTick";

const ngn = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

function formatTimestamp(ts: string) {
  return new Date(ts).toLocaleString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function formatTimestampCompact(ts: string) {
  return new Date(ts).toLocaleString("en-NG", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function staticTH(label: string) {
  return (
    <th className="px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">
      {label}
    </th>
  );
}

function SourceBadge({ source }: { source: PaymentSource }) {
  return (
    <span className="inline-flex rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-700">
      {formatPaymentSource(source)}
    </span>
  );
}

type SummaryKpi = {
  label: string;
  value: string | number;
  color: string;
  bg: string;
  Icon: LucideIcon;
};

function ERevenueSummaryPanel({
  title,
  subtitle,
  lastUpdated,
  cards,
  gridClassName,
}: {
  title: string;
  subtitle: string;
  lastUpdated: Date;
  cards: SummaryKpi[];
  gridClassName: string;
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

function StatusBadge({ status }: { status: PaymentStatus }) {
  const map: Record<PaymentStatus, string> = {
    SUCCESSFUL: "bg-emerald-50 text-emerald-700 border-emerald-200",
    PENDING: "bg-amber-50 text-amber-800 border-amber-200",
    FAILED: "bg-red-50 text-red-700 border-red-200",
  };
  return (
    <span
      className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium ${map[status]}`}
    >
      {formatPaymentStatus(status)}
    </span>
  );
}

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function resolveDateRange(
  preset: DateRangePreset,
  customFrom: string,
  customTo: string,
): { from: Date; to: Date } | null {
  const now = new Date();
  if (preset === "DAILY") {
    return { from: startOfDay(now), to: endOfDay(now) };
  }
  if (preset === "WEEKLY") {
    const from = new Date(now);
    from.setDate(from.getDate() - 7);
    return { from: startOfDay(from), to: endOfDay(now) };
  }
  if (preset === "MONTHLY") {
    const from = new Date(now);
    from.setDate(from.getDate() - 30);
    return { from: startOfDay(from), to: endOfDay(now) };
  }
  if (preset === "CUSTOM" && customFrom && customTo) {
    return {
      from: startOfDay(new Date(customFrom)),
      to: endOfDay(new Date(customTo)),
    };
  }
  return null;
}

function PaymentDetailDrawer({
  txn,
  module,
  onClose,
}: {
  txn: RevenueTransaction;
  module: ERevenueModule;
  onClose: () => void;
}) {
  const meta = EREVENUE_MODULE_META[module];
  const displayAmount = getModuleDisplayAmount(module, txn);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="relative flex h-full w-full max-w-md flex-col bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <h2 className="text-sm font-bold text-gray-900">Payment details</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-gray-500 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto p-5 text-sm">
          <DetailRow label="Transaction ID" value={txn.transactionId} />
          <DetailRow label="Payment reference" value={txn.paymentReference} />
          <DetailRow
            label="Payment source"
            value={formatPaymentSource(txn.paymentSource)}
          />
          <DetailRow label="Payer name / account" value={`${txn.payerName}${txn.payerAccount ? ` · ${txn.payerAccount}` : ""}`} />
          <DetailRow label={meta.amountLabel} value={ngn.format(displayAmount)} />
          <DetailRow label="Gross amount (₦)" value={ngn.format(txn.amountNgn)} />
          <DetailRow label="Payment date & time" value={formatTimestamp(txn.paidAt)} />
          <DetailRow
            label="Payment method"
            value={formatPaymentMethod(txn.paymentMethod)}
          />
          <DetailRow label="Status" value={formatPaymentStatus(txn.status)} />
          <DetailRow
            label={serviceReferenceLabel(txn.serviceReferenceKind)}
            value={txn.serviceReference}
          />
          {txn.npaShareNgn != null && txn.npaShareNgn > 0 && (
            <DetailRow label="NPA share (₦)" value={ngn.format(txn.npaShareNgn)} />
          )}
          {txn.facilityName && (
            <DetailRow
              label="Facility"
              value={`${txn.facilityName}${txn.facilityShareNgn ? ` · ${ngn.format(txn.facilityShareNgn)}` : ""}`}
            />
          )}
          {txn.transitParkName && (
            <DetailRow
              label="Transit park"
              value={`${txn.transitParkName}${txn.transitParkShareNgn ? ` · ${ngn.format(txn.transitParkShareNgn)}` : ""}`}
            />
          )}
          {txn.towCompanyName && (
            <DetailRow
              label="Tow company"
              value={`${txn.towCompanyName}${txn.towCompanyShareNgn ? ` · ${ngn.format(txn.towCompanyShareNgn)}` : ""}`}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
        {label}
      </p>
      <p className="mt-0.5 font-medium text-gray-900">{value}</p>
    </div>
  );
}

type SortKey =
  | "paidAt"
  | "amount"
  | "source"
  | "status"
  | "payer";

function exportCsv(rows: RevenueTransaction[], module: ERevenueModule) {
  const headers = [
    "Transaction ID",
    "Payment Reference",
    "Payment Source",
    "Payer Name",
    "Amount",
    "Payment Date",
    "Payment Method",
    "Status",
    "Service Reference",
  ];
  const lines = rows.map((t) => {
    const amt = getModuleDisplayAmount(module, t);
    return [
      t.transactionId,
      t.paymentReference,
      formatPaymentSource(t.paymentSource),
      t.payerName,
      String(amt),
      t.paidAt,
      formatPaymentMethod(t.paymentMethod),
      formatPaymentStatus(t.status),
      t.serviceReference,
    ]
      .map((c) => `"${String(c).replace(/"/g, '""')}"`)
      .join(",");
  });
  const blob = new Blob([[headers.join(","), ...lines].join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `e-revenue-${module}-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function ERevenueModuleView({ module }: { module: ERevenueModule }) {
  const meta = EREVENUE_MODULE_META[module];
  const { tick, lastUpdated } = useRevenueLiveTick();
  const [transactions, setTransactions] = useState(MOCK_REVENUE_TRANSACTIONS);
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState<PaymentSource | "ALL">("ALL");
  const [methodFilter, setMethodFilter] = useState<PaymentMethod | "ALL">("ALL");
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "ALL">("ALL");
  const [datePreset, setDatePreset] = useState<DateRangePreset>("MONTHLY");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [amountMin, setAmountMin] = useState("");
  const [amountMax, setAmountMax] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("paidAt");
  const [sortDesc, setSortDesc] = useState(true);
  const [selected, setSelected] = useState<RevenueTransaction | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (tick > 0 && tick % 2 === 0) {
      setTransactions((prev) => {
        const pendingIdx = prev.findIndex((t) => t.status === "PENDING");
        if (pendingIdx >= 0) {
          const next = [...prev];
          next[pendingIdx] = {
            ...next[pendingIdx],
            status: "SUCCESSFUL",
            paidAt: new Date().toISOString(),
            npaShareNgn: Math.round(next[pendingIdx].amountNgn * 0.1),
            towCompanyShareNgn: Math.round(next[pendingIdx].amountNgn * 0.72),
            towCompanyName: "Apapa Recovery Services",
          };
          return next;
        }
        return [createSimulatedLiveTransaction(tick), ...prev];
      });
    }
  }, [tick]);

  const moduleBase = useMemo(
    () => filterTransactionsForModule(module, transactions),
    [module, transactions],
  );

  const filtered = useMemo(() => {
    const range = resolveDateRange(datePreset, customFrom, customTo);
    const q = search.trim().toLowerCase();
    const min = amountMin ? Number(amountMin) : null;
    const max = amountMax ? Number(amountMax) : null;

    let list = moduleBase.filter((t) => {
      if (sourceFilter !== "ALL" && t.paymentSource !== sourceFilter) return false;
      if (methodFilter !== "ALL" && t.paymentMethod !== methodFilter) return false;
      if (statusFilter !== "ALL" && t.status !== statusFilter) return false;
      if (range) {
        const paid = new Date(t.paidAt).getTime();
        if (paid < range.from.getTime() || paid > range.to.getTime()) return false;
      }
      const displayAmt = getModuleDisplayAmount(module, t);
      if (min != null && displayAmt < min) return false;
      if (max != null && displayAmt > max) return false;
      if (q) {
        const hay = `${t.transactionId} ${t.serviceReference} ${t.payerName}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    list = [...list].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "paidAt") {
        cmp = new Date(a.paidAt).getTime() - new Date(b.paidAt).getTime();
      } else if (sortKey === "amount") {
        cmp = getModuleDisplayAmount(module, a) - getModuleDisplayAmount(module, b);
      } else if (sortKey === "source") {
        cmp = a.paymentSource.localeCompare(b.paymentSource);
      } else if (sortKey === "status") {
        cmp = a.status.localeCompare(b.status);
      } else if (sortKey === "payer") {
        cmp = a.payerName.localeCompare(b.payerName);
      }
      return sortDesc ? -cmp : cmp;
    });

    return list;
  }, [
    moduleBase,
    module,
    search,
    sourceFilter,
    methodFilter,
    statusFilter,
    datePreset,
    customFrom,
    customTo,
    amountMin,
    amountMax,
    sortKey,
    sortDesc,
  ]);

  const pieData = useMemo(
    () => buildPieSlices(module, filtered),
    [module, filtered],
  );
  const pieTotal = pieData.reduce((s, d) => s + d.value, 0);

  const successfulFiltered = filtered.filter((t) => t.status === "SUCCESSFUL");
  const totalRevenue = successfulFiltered.reduce(
    (s, t) => s + getModuleDisplayAmount(module, t),
    0,
  );

  const summaryCards = useMemo((): SummaryKpi[] => {
    const pending = filtered.filter((t) => t.status === "PENDING").length;
    const failed = filtered.filter((t) => t.status === "FAILED").length;

    const sumSuccessful = (
      pick: (t: RevenueTransaction) => number,
    ) => successfulFiltered.reduce((s, t) => s + pick(t), 0);

    if (module === "etss") {
      const bd = breakdownBySourceEtss(filtered);
      const amt = (src: PaymentSource) =>
        bd.find((b) => b.source === src)?.total ?? 0;
      return [
        {
          label: "Total revenue",
          value: ngn.format(totalRevenue),
          color: "text-emerald-400",
          bg: "bg-emerald-400/10",
          Icon: Wallet,
        },
        {
          label: "Transactions",
          value: filtered.length,
          color: "text-blue-400",
          bg: "bg-blue-400/10",
          Icon: Receipt,
        },
        {
          label: "From bookings",
          value: ngn.format(amt("BOOKING")),
          color: "text-cyan-400",
          bg: "bg-cyan-400/10",
          Icon: BookOpen,
        },
        {
          label: "Utility tickets",
          value: ngn.format(amt("UTILITY_TICKET")),
          color: "text-orange-400",
          bg: "bg-orange-400/10",
          Icon: Ticket,
        },
        {
          label: "Penalties",
          value: ngn.format(amt("PENALTY")),
          color: "text-red-400",
          bg: "bg-red-400/10",
          Icon: Gavel,
        },
        {
          label: "Tow requests",
          value: ngn.format(amt("TOW_TRUCK_REQUEST")),
          color: "text-violet-400",
          bg: "bg-violet-400/10",
          Icon: Truck,
        },
        {
          label: "Demurrage",
          value: ngn.format(amt("DEMURRAGE")),
          color: "text-amber-400",
          bg: "bg-amber-400/10",
          Icon: Clock,
        },
        {
          label: "Pending / failed",
          value: `${pending} / ${failed}`,
          color: "text-gray-400",
          bg: "bg-gray-400/10",
          Icon: AlertCircle,
        },
      ];
    }

    if (module === "npa") {
      return [
        {
          label: "Total NPA share",
          value: ngn.format(totalRevenue),
          color: "text-emerald-400",
          bg: "bg-emerald-400/10",
          Icon: Anchor,
        },
        {
          label: "Transactions",
          value: filtered.length,
          color: "text-blue-400",
          bg: "bg-blue-400/10",
          Icon: Receipt,
        },
        {
          label: "Share from bookings",
          value: ngn.format(
            sumSuccessful((t) =>
              t.paymentSource === "BOOKING" ? (t.npaShareNgn ?? 0) : 0,
            ),
          ),
          color: "text-cyan-400",
          bg: "bg-cyan-400/10",
          Icon: BookOpen,
        },
        {
          label: "Share from utilities",
          value: ngn.format(
            sumSuccessful((t) =>
              t.paymentSource === "UTILITY_TICKET" ? (t.npaShareNgn ?? 0) : 0,
            ),
          ),
          color: "text-orange-400",
          bg: "bg-orange-400/10",
          Icon: Ticket,
        },
        {
          label: "Share from tow",
          value: ngn.format(
            sumSuccessful((t) =>
              t.paymentSource === "TOW_TRUCK_REQUEST"
                ? (t.npaShareNgn ?? 0)
                : 0,
            ),
          ),
          color: "text-violet-400",
          bg: "bg-violet-400/10",
          Icon: Truck,
        },
        {
          label: "Pending / failed",
          value: `${pending} / ${failed}`,
          color: "text-gray-400",
          bg: "bg-gray-400/10",
          Icon: AlertCircle,
        },
      ];
    }

    if (module === "facilities") {
      return [
        {
          label: "Total facility revenue",
          value: ngn.format(totalRevenue),
          color: "text-emerald-400",
          bg: "bg-emerald-400/10",
          Icon: Building2,
        },
        {
          label: "Transactions",
          value: filtered.length,
          color: "text-blue-400",
          bg: "bg-blue-400/10",
          Icon: Receipt,
        },
        {
          label: "From bookings",
          value: ngn.format(
            sumSuccessful((t) =>
              t.paymentSource === "BOOKING" ? (t.facilityShareNgn ?? 0) : 0,
            ),
          ),
          color: "text-cyan-400",
          bg: "bg-cyan-400/10",
          Icon: BookOpen,
        },
        {
          label: "From demurrage",
          value: ngn.format(
            sumSuccessful((t) =>
              t.paymentSource === "DEMURRAGE" ? (t.facilityShareNgn ?? 0) : 0,
            ),
          ),
          color: "text-amber-400",
          bg: "bg-amber-400/10",
          Icon: Clock,
        },
        {
          label: "Pending / failed",
          value: `${pending} / ${failed}`,
          color: "text-gray-400",
          bg: "bg-gray-400/10",
          Icon: AlertCircle,
        },
      ];
    }

    if (module === "transit") {
      return [
        {
          label: "Total park revenue",
          value: ngn.format(totalRevenue),
          color: "text-emerald-400",
          bg: "bg-emerald-400/10",
          Icon: ParkingCircle,
        },
        {
          label: "Transactions",
          value: filtered.length,
          color: "text-blue-400",
          bg: "bg-blue-400/10",
          Icon: Receipt,
        },
        {
          label: "From bookings",
          value: ngn.format(
            sumSuccessful((t) =>
              t.paymentSource === "BOOKING"
                ? (t.transitParkShareNgn ?? 0)
                : 0,
            ),
          ),
          color: "text-cyan-400",
          bg: "bg-cyan-400/10",
          Icon: BookOpen,
        },
        {
          label: "From demurrage",
          value: ngn.format(
            sumSuccessful((t) =>
              t.paymentSource === "DEMURRAGE"
                ? (t.transitParkShareNgn ?? 0)
                : 0,
            ),
          ),
          color: "text-amber-400",
          bg: "bg-amber-400/10",
          Icon: Clock,
        },
        {
          label: "Pending / failed",
          value: `${pending} / ${failed}`,
          color: "text-gray-400",
          bg: "bg-gray-400/10",
          Icon: AlertCircle,
        },
      ];
    }

    return [
      {
        label: "Total company share",
        value: ngn.format(totalRevenue),
        color: "text-emerald-400",
        bg: "bg-emerald-400/10",
        Icon: Truck,
      },
      {
        label: "Tow transactions",
        value: filtered.length,
        color: "text-blue-400",
        bg: "bg-blue-400/10",
        Icon: Receipt,
      },
      {
        label: "Successful payments",
        value: successfulFiltered.length,
        color: "text-emerald-400",
        bg: "bg-emerald-400/10",
        Icon: Wallet,
      },
      {
        label: "Pending / failed",
        value: `${pending} / ${failed}`,
        color: "text-gray-400",
        bg: "bg-gray-400/10",
        Icon: AlertCircle,
      },
    ];
  }, [module, filtered, successfulFiltered, totalRevenue]);

  const summaryGridClass =
    module === "etss"
      ? "grid-cols-2 sm:grid-cols-4"
      : module === "npa"
        ? "grid-cols-2 sm:grid-cols-3 xl:grid-cols-6"
        : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5";

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDesc((d) => !d);
    else {
      setSortKey(key);
      setSortDesc(true);
    }
  }

  const hasActiveFilters =
    search.trim() !== ""
    || sourceFilter !== "ALL"
    || methodFilter !== "ALL"
    || statusFilter !== "ALL"
    || datePreset !== "MONTHLY"
    || amountMin !== ""
    || amountMax !== "";

  function clearFilters() {
    setSearch("");
    setSourceFilter("ALL");
    setMethodFilter("ALL");
    setStatusFilter("ALL");
    setDatePreset("MONTHLY");
    setCustomFrom("");
    setCustomTo("");
    setAmountMin("");
    setAmountMax("");
  }

  function SortableTH({
    column,
    children,
  }: {
    column: SortKey;
    children: React.ReactNode;
  }) {
    const active = sortKey === column;
    return (
      <th
        className="cursor-pointer select-none px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500 hover:text-gray-700"
        onClick={() => toggleSort(column)}
      >
        <span className="inline-flex items-center">
          {children}
          {!active ? (
            <ArrowUpDown className="ml-1 h-3 w-3 text-gray-300" />
          ) : sortDesc ? (
            <ArrowDown className="ml-1 h-3 w-3 text-emerald-600" />
          ) : (
            <ArrowUp className="ml-1 h-3 w-3 text-emerald-600" />
          )}
        </span>
      </th>
    );
  }

  const moduleTotal = moduleBase.length;

  return (
    <ERevenueShell title={meta.title} subtitle={meta.subtitle}>
      <ERevenueSummaryPanel
        title={`${meta.title} — at a glance`}
        subtitle="Revenue totals update with your filters and refresh in near real time"
        lastUpdated={lastUpdated}
        cards={summaryCards}
        gridClassName={summaryGridClass}
      />

      <div className="min-w-0 rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="text-sm font-bold text-gray-900">{meta.pieTitle}</h3>
        <div className="mt-4 grid min-w-0 gap-6 md:grid-cols-[minmax(0,260px)_1fr] md:items-center">
          <div className="relative mx-auto w-full max-w-[260px]">
            <div className="h-52 w-full">
              {pieData.length === 0 ? (
                <p className="flex h-full items-center justify-center text-xs text-gray-400">
                  No data for current filters
                </p>
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
                      contentStyle={{
                        fontSize: 12,
                        borderRadius: 8,
                        border: "1px solid #e5e7eb",
                      }}
                      formatter={(value, name) => [
                        ngn.format(Number(value ?? 0)),
                        String(name),
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            {pieTotal > 0 && (
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                <p className="text-lg font-bold text-gray-900 tabular-nums">
                  {ngn.format(pieTotal)}
                </p>
                <p className="text-[10px] text-gray-500">Successful</p>
              </div>
            )}
          </div>
          <div className="grid min-w-0 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {pieData.map((cat) => (
              <div
                key={cat.name}
                className="flex items-center justify-between gap-2 rounded-lg bg-gray-50 px-3 py-2"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="truncate text-[11px] text-gray-600">
                    {cat.name}
                  </span>
                </div>
                <span className="shrink-0 text-[11px] font-bold tabular-nums text-gray-900">
                  {pieTotal > 0
                    ? `${Math.round((cat.value / pieTotal) * 100)}%`
                    : "0%"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="min-w-0 rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-4 py-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[200px] flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                placeholder="Transaction ID, booking ID, or payer name…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-emerald-300 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold ${
                showFilters || hasActiveFilters
                  ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Filter className="h-4 w-4" />
              Filters
            </button>
            <button
              type="button"
              onClick={() => exportCsv(filtered, module)}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
          </div>

          {showFilters && (
            <div className="mt-3 flex flex-wrap items-end gap-4 border-t border-gray-100 pt-3">
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                  Payment source
                </label>
                <select
                  value={sourceFilter}
                  onChange={(e) =>
                    setSourceFilter(e.target.value as PaymentSource | "ALL")
                  }
                  className="rounded-lg border border-gray-200 py-1.5 pl-3 pr-8 text-xs outline-none focus:border-emerald-300"
                >
                  {PAYMENT_SOURCE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                  Payment method
                </label>
                <select
                  value={methodFilter}
                  onChange={(e) =>
                    setMethodFilter(e.target.value as PaymentMethod | "ALL")
                  }
                  className="rounded-lg border border-gray-200 py-1.5 pl-3 pr-8 text-xs outline-none focus:border-emerald-300"
                >
                  {PAYMENT_METHOD_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value as PaymentStatus | "ALL")
                  }
                  className="rounded-lg border border-gray-200 py-1.5 pl-3 pr-8 text-xs outline-none focus:border-emerald-300"
                >
                  {PAYMENT_STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                  Date range
                </label>
                <select
                  value={datePreset}
                  onChange={(e) =>
                    setDatePreset(e.target.value as DateRangePreset)
                  }
                  className="rounded-lg border border-gray-200 py-1.5 pl-3 pr-8 text-xs outline-none focus:border-emerald-300"
                >
                  <option value="DAILY">Daily</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="MONTHLY">Monthly</option>
                  <option value="CUSTOM">Custom</option>
                </select>
              </div>
              {datePreset === "CUSTOM" && (
                <>
                  <div>
                    <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                      From
                    </label>
                    <input
                      type="date"
                      value={customFrom}
                      onChange={(e) => setCustomFrom(e.target.value)}
                      className="rounded-lg border border-gray-200 py-1.5 pl-3 text-xs outline-none focus:border-emerald-300"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                      To
                    </label>
                    <input
                      type="date"
                      value={customTo}
                      onChange={(e) => setCustomTo(e.target.value)}
                      className="rounded-lg border border-gray-200 py-1.5 pl-3 text-xs outline-none focus:border-emerald-300"
                    />
                  </div>
                </>
              )}
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                  Amount min (₦)
                </label>
                <input
                  type="number"
                  min={0}
                  value={amountMin}
                  onChange={(e) => setAmountMin(e.target.value)}
                  className="w-28 rounded-lg border border-gray-200 py-1.5 pl-3 text-xs outline-none focus:border-emerald-300"
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                  Amount max (₦)
                </label>
                <input
                  type="number"
                  min={0}
                  value={amountMax}
                  onChange={(e) => setAmountMax(e.target.value)}
                  className="w-28 rounded-lg border border-gray-200 py-1.5 pl-3 text-xs outline-none focus:border-emerald-300"
                />
              </div>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50"
                >
                  <X className="h-3 w-3" />
                  Clear all
                </button>
              )}
            </div>
          )}
        </div>

        <p className="border-b border-gray-100 px-4 py-2.5 text-xs text-gray-500">
          Showing{" "}
          <span className="font-semibold text-gray-800">{filtered.length}</span>{" "}
          transaction{filtered.length !== 1 ? "s" : ""}
          {hasActiveFilters ? " matching your filters" : ""}
        </p>

        <div className="overflow-x-auto">
          <table className="min-w-max w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                {staticTH("S/No.")}
                {staticTH("Transaction")}
                <SortableTH column="source">Source</SortableTH>
                <SortableTH column="payer">Payer</SortableTH>
                <SortableTH column="amount">{meta.amountLabel}</SortableTH>
                <SortableTH column="paidAt">Payment date</SortableTH>
                {staticTH("Method")}
                <SortableTH column="status">Status</SortableTH>
                {staticTH("Service reference")}
                <th className="px-3 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center">
                    <Wallet className="mx-auto h-8 w-8 text-gray-300" />
                    <p className="mt-2 text-sm font-medium text-gray-400">
                      No transactions match your filters
                    </p>
                    {hasActiveFilters && (
                      <button
                        type="button"
                        onClick={clearFilters}
                        className="mt-2 text-xs font-medium text-emerald-600 hover:underline"
                      >
                        Clear all filters
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filtered.map((t, idx) => (
                  <tr key={t.id} className="transition-colors hover:bg-gray-50/80">
                    <td className="px-3 py-3 text-xs font-medium text-gray-400">
                      {idx + 1}
                    </td>
                    <td className="px-3 py-3">
                      <button
                        type="button"
                        onClick={() => setSelected(t)}
                        className="font-mono text-xs font-bold text-emerald-700 hover:underline"
                      >
                        {t.transactionId}
                      </button>
                      <p className="mt-0.5 font-mono text-[10px] text-gray-400">
                        {t.paymentReference}
                      </p>
                    </td>
                    <td className="px-3 py-3">
                      <SourceBadge source={t.paymentSource} />
                    </td>
                    <td className="px-3 py-3">
                      <p className="text-xs font-medium text-gray-800">
                        {t.payerName}
                      </p>
                      {t.payerAccount && (
                        <p className="text-[10px] text-gray-400">
                          {t.payerAccount}
                        </p>
                      )}
                    </td>
                    <td className="px-3 py-3 text-sm font-bold tabular-nums text-gray-900">
                      {ngn.format(getModuleDisplayAmount(module, t))}
                    </td>
                    <td className="px-3 py-3 text-[11px] text-gray-500">
                      {formatTimestampCompact(t.paidAt)}
                    </td>
                    <td className="px-3 py-3 text-xs text-gray-700">
                      {formatPaymentMethod(t.paymentMethod)}
                    </td>
                    <td className="px-3 py-3">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="px-3 py-3">
                      <p className="font-mono text-xs font-semibold text-gray-800">
                        {t.serviceReference}
                      </p>
                      <p className="mt-0.5 max-w-[160px] truncate text-[10px] text-gray-400">
                        {serviceReferenceLabel(t.serviceReferenceKind)}
                      </p>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => setSelected(t)}
                        className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-[11px] font-semibold text-gray-700 hover:bg-gray-50"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <p className="flex items-center gap-1.5 border-t border-gray-100 px-4 py-3 text-[11px] text-gray-400">
          <Receipt className="h-3 w-3" />
          Showing {filtered.length} of {moduleTotal} transactions in this module
          (sample database)
        </p>
      </div>

      {selected && (
        <PaymentDetailDrawer
          txn={selected}
          module={module}
          onClose={() => setSelected(null)}
        />
      )}
    </ERevenueShell>
  );
}

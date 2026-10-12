import type {
  ERevenueModule,
  PaymentMethod,
  PaymentSource,
  PaymentStatus,
  RevenueBreakdownResponse,
  RevenueSortField,
  RevenueSortOrder,
  RevenueSummaryBreakdownItem,
  RevenueSummaryResponse,
  RevenueTransaction,
  ServiceReferenceKind,
} from "@/types/e-revenue.types";
import type { PieSlice } from "@/types/e-revenue.types";

type RawTransaction = Record<string, unknown>;

const PIE_COLORS = ["#059669", "#0d9488", "#6366f1", "#f59e0b", "#64748b"];

function str(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

function num(v: unknown): number | undefined {
  if (typeof v === "number" && !Number.isNaN(v)) return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    return Number.isNaN(n) ? undefined : n;
  }
  return undefined;
}

function mapSortByToApi(sortBy?: RevenueSortField): string | undefined {
  if (!sortBy) return undefined;
  if (sortBy === "paid_at") return "transacted_at";
  return sortBy;
}

function mapSortOrder(sortDir?: "asc" | "desc"): RevenueSortOrder | undefined {
  if (sortDir === "asc") return "ASC";
  if (sortDir === "desc") return "DESC";
  return undefined;
}

function mapServiceReferenceKind(
  paymentSource: PaymentSource,
  linkedKind?: string,
): ServiceReferenceKind {
  const kind = (linkedKind ?? paymentSource).toUpperCase();
  if (kind === "TOW_TRUCK_REQUEST" || kind === "TOW_TRUCK") return "TOW_TRUCK";
  if (kind === "UTILITY_TICKET") return "UTILITY_TICKET";
  if (kind === "PENALTY") return "PENALTY";
  if (kind === "DEMURRAGE") return "DEMURRAGE";
  return "BOOKING";
}

function readShares(raw: RawTransaction) {
  const shares = (raw.shares ?? {}) as RawTransaction;
  return {
    etssShareNgn: num(shares.etss),
    npaShareNgn: num(shares.npa),
    facilityShareNgn: num(shares.facility),
    transitParkShareNgn: num(shares.transit_park ?? shares.transitPark),
    towCompanyShareNgn: num(shares.tow_company ?? shares.towCompany),
  };
}

function readNamedEntity(raw: unknown): { name: string } | null {
  if (!raw || typeof raw !== "object") return null;
  const name = str((raw as RawTransaction).name);
  return name ? { name } : null;
}

export function mapRevenueTransaction(raw: RawTransaction): RevenueTransaction {
  const transactionId = str(raw.transaction_id ?? raw.transactionId);
  const payer = (raw.payer ?? {}) as RawTransaction;
  const linked = (raw.linked_reference ?? raw.linkedReference ?? {}) as RawTransaction;
  const paymentSource = str(raw.payment_source ?? raw.paymentSource) as PaymentSource;
  const shares = readShares(raw);
  const facility = readNamedEntity(raw.facility);
  const transitPark = readNamedEntity(raw.transit_park ?? raw.transitPark);
  const towCompany = readNamedEntity(raw.tow_company ?? raw.towCompany);

  const payerName =
    str(raw.payer_display)
    || str(payer.user_name ?? payer.userName)
    || str(payer.company_name ?? payer.companyName)
    || str(raw.payer_name ?? raw.payerName);

  return {
    id: str(raw.id, transactionId),
    transactionId,
    paymentReference: str(raw.payment_reference ?? raw.paymentReference),
    invoiceNumber: str(raw.invoice_number ?? raw.invoiceNumber) || undefined,
    paymentSource,
    paymentSourceLabel: str(raw.payment_source_label ?? raw.paymentSourceLabel) || undefined,
    payerName,
    payerDisplay: str(raw.payer_display ?? raw.payerDisplay) || undefined,
    payerAccount: str(payer.email ?? raw.payer_account ?? raw.payerAccount) || undefined,
    amountNgn: num(raw.amount_paid ?? raw.amount_ngn ?? raw.amountNgn ?? raw.amount) ?? 0,
    amountDue: num(raw.amount_due ?? raw.amountDue),
    paidAt: str(raw.transacted_at ?? raw.paid_at ?? raw.paidAt),
    paymentMethod: str(raw.payment_method ?? raw.paymentMethod) as PaymentMethod,
    status: str(raw.status) as PaymentStatus,
    serviceReference: str(linked.reference ?? raw.service_reference ?? raw.serviceReference),
    serviceReferenceKind: mapServiceReferenceKind(
      paymentSource,
      str(linked.kind),
    ),
    etssShareNgn: shares.etssShareNgn,
    npaShareNgn: shares.npaShareNgn,
    facilityName:
      facility?.name ?? (str(raw.facility_name ?? raw.facilityName) || undefined),
    facilityShareNgn: shares.facilityShareNgn,
    transitParkName:
      transitPark?.name ?? (str(raw.transit_park_name ?? raw.transitParkName) || undefined),
    transitParkShareNgn: shares.transitParkShareNgn,
    towCompanyName:
      towCompany?.name ?? (str(raw.tow_company_name ?? raw.towCompanyName) || undefined),
    towCompanyShareNgn: shares.towCompanyShareNgn,
    truckPlateNumber: str(raw.truck_plate_number ?? raw.truckPlateNumber) || undefined,
    terminalName: str(raw.terminal_name ?? raw.terminalName) || undefined,
  };
}

function mapBreakdownItems(raw: unknown): RevenueSummaryBreakdownItem[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  return raw.map((b) => {
    const row = b as Record<string, unknown>;
    const amountPaid = num(row.amount_paid ?? row.amountPaid) ?? num(row.total ?? row.value ?? row.amount) ?? 0;
    return {
      source: str(row.source ?? row.payment_source) as PaymentSource,
      label: str(row.label ?? row.name),
      total: amountPaid,
      amountDue: num(row.amount_due ?? row.amountDue),
      entries: num(row.entries),
    } satisfies RevenueSummaryBreakdownItem;
  });
}

function breakdownToPieSlices(breakdown?: RevenueSummaryBreakdownItem[]): PieSlice[] | undefined {
  if (!breakdown?.length) return undefined;
  const slices = breakdown
    .filter((b) => b.total > 0)
    .map((b, i) => ({
      name: b.label,
      value: b.total,
      color: PIE_COLORS[i % PIE_COLORS.length],
    }));
  return slices.length ? slices : undefined;
}

function mapPieSlices(raw: unknown): PieSlice[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  return raw.map((p, i) => {
    const row = p as Record<string, unknown>;
    return {
      name: str(row.name ?? row.label),
      value: num(row.value ?? row.total ?? row.amount_paid ?? row.amount) ?? 0,
      color: str(row.color, PIE_COLORS[i % PIE_COLORS.length]),
    } satisfies PieSlice;
  });
}

export function mapRevenueSummary(raw: Record<string, unknown>): RevenueSummaryResponse {
  const breakdown = mapBreakdownItems(raw.by_source ?? raw.breakdown ?? raw.breakdown_by_source);

  const pieSlices =
    mapPieSlices(raw.pie_slices ?? raw.pieSlices)
    ?? breakdownToPieSlices(breakdown);

  return {
    totalRevenue:
      num(raw.total_amount_paid ?? raw.total_revenue ?? raw.totalRevenue ?? raw.total_amount) ?? 0,
    totalAmountDue: num(raw.total_amount_due ?? raw.totalAmountDue),
    transactionCount:
      num(raw.total_entries ?? raw.transaction_count ?? raw.transactionCount ?? raw.count) ?? 0,
    pendingCount: num(raw.pending_count ?? raw.pendingCount),
    failedCount: num(raw.failed_count ?? raw.failedCount),
    breakdown,
    pieSlices,
  };
}

export function mapRevenueBreakdown(raw: Record<string, unknown>): RevenueBreakdownResponse {
  const root = raw.data && typeof raw.data === "object" && !Array.isArray(raw.data)
    ? (raw.data as Record<string, unknown>)
    : raw;

  const breakdown =
    mapBreakdownItems(root.by_source ?? root.breakdown ?? root.breakdown_by_source ?? root.items)
    ?? (Array.isArray(root) ? mapBreakdownItems(root) : undefined);

  const pieSlices =
    mapPieSlices(root.pie_slices ?? root.pieSlices)
    ?? breakdownToPieSlices(breakdown);

  return { breakdown, pieSlices };
}

export function unwrapRevenueListPayload(payload: unknown): unknown {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return payload;
  }
  const root = payload as Record<string, unknown>;
  if (
    root.data
    && typeof root.data === "object"
    && !Array.isArray(root.data)
    && Array.isArray((root.data as Record<string, unknown>).data)
  ) {
    return root.data;
  }
  return payload;
}

export function buildRevenueQueryParams(
  params: Record<string, string | number | undefined>,
): Record<string, string | number> {
  const out: Record<string, string | number> = {};
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === "" || v === "ALL") continue;
    if (k === "module" || k === "date_preset") continue;
    if (k === "sort_by") {
      const mapped = mapSortByToApi(v as RevenueSortField);
      if (mapped) out.sort_by = mapped;
      continue;
    }
    if (k === "sort_dir") {
      const order = mapSortOrder(v as "asc" | "desc");
      if (order) out.sort_order = order;
      continue;
    }
    out[k] = v;
  }
  return out;
}

export function revenueModuleParam(module: ERevenueModule): string {
  return module;
}

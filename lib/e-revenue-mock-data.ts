import type {
  ERevenueModule,
  PaymentMethod,
  PaymentSource,
  PaymentStatus,
  PieSlice,
  RevenueTransaction,
  ServiceReferenceKind,
} from "@/types/e-revenue.types";

const PIE_COLORS = [
  "#059669",
  "#2563eb",
  "#d97706",
  "#7c3aed",
  "#dc2626",
  "#0891b2",
  "#4f46e5",
  "#ca8a04",
];

export const PAYMENT_SOURCE_OPTIONS: { value: PaymentSource | "ALL"; label: string }[] = [
  { value: "ALL", label: "All sources" },
  { value: "BOOKING", label: "Booking" },
  { value: "UTILITY_TICKET", label: "Utility ticket" },
  { value: "PENALTY", label: "Penalty" },
  { value: "TOW_TRUCK_REQUEST", label: "Tow truck request" },
  { value: "DEMURRAGE", label: "Demurrage" },
];

export const PAYMENT_METHOD_OPTIONS: { value: PaymentMethod | "ALL"; label: string }[] = [
  { value: "ALL", label: "All methods" },
  { value: "PAYSTACK", label: "Paystack" },
  { value: "CARD", label: "Card" },
  { value: "BANK_TRANSFER", label: "Bank transfer" },
  { value: "WALLET", label: "Wallet" },
];

export const PAYMENT_STATUS_OPTIONS: { value: PaymentStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "All statuses" },
  { value: "SUCCESSFUL", label: "Successful" },
  { value: "PENDING", label: "Pending" },
  { value: "FAILED", label: "Failed" },
];

export function formatPaymentSource(source: PaymentSource): string {
  const map: Record<PaymentSource, string> = {
    BOOKING: "Booking",
    UTILITY_TICKET: "Utility ticket",
    PENALTY: "Penalty",
    TOW_TRUCK_REQUEST: "Tow truck request",
    DEMURRAGE: "Demurrage",
  };
  return map[source];
}

export function formatPaymentMethod(method: PaymentMethod): string {
  const map: Record<PaymentMethod, string> = {
    PAYSTACK: "Paystack",
    CARD: "Card",
    BANK_TRANSFER: "Bank transfer",
    WALLET: "Wallet",
  };
  return map[method];
}

export function formatPaymentStatus(status: PaymentStatus): string {
  const map: Record<PaymentStatus, string> = {
    SUCCESSFUL: "Successful",
    PENDING: "Pending",
    FAILED: "Failed",
  };
  return map[status];
}

export function serviceReferenceLabel(kind: ServiceReferenceKind): string {
  const map: Record<ServiceReferenceKind, string> = {
    BOOKING: "Booking ID (Booked by transporter)",
    UTILITY_TICKET: "Utility ticket (Booked by terminal operator)",
    TOW_TRUCK: "Tow truck request (Requested by transporter)",
    PENALTY: "Penalty (Issued by enforcement officer)",
    DEMURRAGE: "Demurrage (Incurred by transporter)",
  };
  return map[kind];
}

function daysAgo(days: number, hour = 10, minute = 0): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

function withShares(row: Omit<RevenueTransaction, "id" | "npaShareNgn" | "facilityShareNgn" | "transitParkShareNgn" | "towCompanyShareNgn"> & {
  npaRate?: number;
  facility?: { name: string; rate: number };
  transit?: { name: string; rate: number };
  tow?: { name: string; rate: number };
}): RevenueTransaction {
  const { npaRate, facility, transit, tow, ...base } = row;
  const amount = base.amountNgn;
  return {
    ...base,
    id: base.transactionId,
    npaShareNgn:
      npaRate != null && base.status === "SUCCESSFUL"
        ? Math.round(amount * npaRate)
        : undefined,
    facilityName: facility?.name,
    facilityShareNgn:
      facility && base.status === "SUCCESSFUL"
        ? Math.round(amount * facility.rate)
        : undefined,
    transitParkName: transit?.name,
    transitParkShareNgn:
      transit && base.status === "SUCCESSFUL"
        ? Math.round(amount * transit.rate)
        : undefined,
    towCompanyName: tow?.name,
    towCompanyShareNgn:
      tow && base.status === "SUCCESSFUL"
        ? Math.round(amount * tow.rate)
        : undefined,
  };
}

/** Seed transactions — client may append simulated live rows. */
export const MOCK_REVENUE_TRANSACTIONS: RevenueTransaction[] = [
  withShares({
    transactionId: "TXN-2026-00041",
    paymentReference: "PSK-8f2a91bc",
    paymentSource: "BOOKING",
    payerName: "Kola Haulage Ltd",
    payerAccount: "ACC-88421",
    amountNgn: 185_000,
    paidAt: daysAgo(0, 9, 12),
    paymentMethod: "PAYSTACK",
    status: "SUCCESSFUL",
    serviceReference: "BKG-APM-8821",
    serviceReferenceKind: "BOOKING",
    npaRate: 0.12,
    facility: { name: "APM Terminal Gate A", rate: 0.35 },
    transit: { name: "Apapa Transit Park", rate: 0.08 },
  }),
  withShares({
    transactionId: "TXN-2026-00040",
    paymentReference: "PSK-7c11d004",
    paymentSource: "UTILITY_TICKET",
    payerName: "Tincan Logistics",
    amountNgn: 42_500,
    paidAt: daysAgo(0, 8, 45),
    paymentMethod: "PAYSTACK",
    status: "SUCCESSFUL",
    serviceReference: "UTL-TNC-4412",
    serviceReferenceKind: "UTILITY_TICKET",
    npaRate: 0.08,
  }),
  withShares({
    transactionId: "TXN-2026-00039",
    paymentReference: "PSK-pending-001",
    paymentSource: "TOW_TRUCK_REQUEST",
    payerName: "Swift Movers",
    amountNgn: 95_000,
    paidAt: daysAgo(0, 8, 30),
    paymentMethod: "PAYSTACK",
    status: "PENDING",
    serviceReference: "TOW-882-19",
    serviceReferenceKind: "TOW_TRUCK",
    tow: { name: "Apapa Recovery Services", rate: 0.72 },
  }),
  withShares({
    transactionId: "TXN-2026-00038",
    paymentReference: "BNK-992811",
    paymentSource: "PENALTY",
    payerName: "Emeka Okafor",
    amountNgn: 25_000,
    paidAt: daysAgo(1, 16, 20),
    paymentMethod: "BANK_TRANSFER",
    status: "SUCCESSFUL",
    serviceReference: "PEN-ENF-2201",
    serviceReferenceKind: "PENALTY",
  }),
  withShares({
    transactionId: "TXN-2026-00037",
    paymentReference: "PSK-5512aa01",
    paymentSource: "BOOKING",
    payerName: "Marine Cargo Co",
    amountNgn: 210_000,
    paidAt: daysAgo(1, 11, 5),
    paymentMethod: "CARD",
    status: "SUCCESSFUL",
    serviceReference: "BKG-PTML-7710",
    serviceReferenceKind: "BOOKING",
    npaRate: 0.12,
    facility: { name: "PTML Yard", rate: 0.32 },
    transit: { name: "Tincan Holding Park", rate: 0.1 },
  }),
  withShares({
    transactionId: "TXN-2026-00036",
    paymentReference: "WLT-882190",
    paymentSource: "DEMURRAGE",
    payerName: "Kola Haulage Ltd",
    amountNgn: 68_000,
    paidAt: daysAgo(2, 14, 0),
    paymentMethod: "WALLET",
    status: "SUCCESSFUL",
    serviceReference: "DMG-BKG-APM-8800",
    serviceReferenceKind: "DEMURRAGE",
    facility: { name: "APM Terminal Gate A", rate: 0.55 },
    transit: { name: "Apapa Transit Park", rate: 0.25 },
  }),
  withShares({
    transactionId: "TXN-2026-00035",
    paymentReference: "PSK-fail-991",
    paymentSource: "BOOKING",
    payerName: "Northbound Freight",
    amountNgn: 150_000,
    paidAt: daysAgo(2, 9, 0),
    paymentMethod: "PAYSTACK",
    status: "FAILED",
    serviceReference: "BKG-TNC-9901",
    serviceReferenceKind: "BOOKING",
  }),
  withShares({
    transactionId: "TXN-2026-00034",
    paymentReference: "PSK-3344bb88",
    paymentSource: "TOW_TRUCK_REQUEST",
    payerName: "BlueLine Transport",
    amountNgn: 88_000,
    paidAt: daysAgo(3, 13, 40),
    paymentMethod: "PAYSTACK",
    status: "SUCCESSFUL",
    serviceReference: "TOW-441-02",
    serviceReferenceKind: "TOW_TRUCK",
    npaRate: 0.1,
    tow: { name: "Lagos Port Tow Co", rate: 0.68 },
  }),
  withShares({
    transactionId: "TXN-2026-00033",
    paymentReference: "PSK-221100ff",
    paymentSource: "UTILITY_TICKET",
    payerName: "Terminal Ops Unit 3",
    amountNgn: 18_750,
    paidAt: daysAgo(4, 10, 15),
    paymentMethod: "PAYSTACK",
    status: "SUCCESSFUL",
    serviceReference: "UTL-APM-3301",
    serviceReferenceKind: "UTILITY_TICKET",
    npaRate: 0.08,
  }),
  withShares({
    transactionId: "TXN-2026-00032",
    paymentReference: "PSK-99887766",
    paymentSource: "BOOKING",
    payerName: "Swift Movers",
    amountNgn: 172_000,
    paidAt: daysAgo(5, 8, 0),
    paymentMethod: "PAYSTACK",
    status: "SUCCESSFUL",
    serviceReference: "BKG-FISH-1209",
    serviceReferenceKind: "BOOKING",
    npaRate: 0.12,
    facility: { name: "Fish Port Facility", rate: 0.4 },
    transit: { name: "Apapa Transit Park", rate: 0.07 },
  }),
  withShares({
    transactionId: "TXN-2026-00031",
    paymentReference: "BNK-440022",
    paymentSource: "PENALTY",
    payerName: "Abdul Logistics",
    amountNgn: 50_000,
    paidAt: daysAgo(6, 17, 30),
    paymentMethod: "BANK_TRANSFER",
    status: "SUCCESSFUL",
    serviceReference: "PEN-ENF-2188",
    serviceReferenceKind: "PENALTY",
  }),
  withShares({
    transactionId: "TXN-2026-00030",
    paymentReference: "PSK-66778899",
    paymentSource: "DEMURRAGE",
    payerName: "Marine Cargo Co",
    amountNgn: 112_000,
    paidAt: daysAgo(8, 12, 0),
    paymentMethod: "PAYSTACK",
    status: "SUCCESSFUL",
    serviceReference: "DMG-BKG-PTML-7702",
    serviceReferenceKind: "DEMURRAGE",
    facility: { name: "PTML Yard", rate: 0.5 },
    transit: { name: "Tincan Holding Park", rate: 0.28 },
  }),
  withShares({
    transactionId: "TXN-2026-00029",
    paymentReference: "PSK-11223344",
    paymentSource: "TOW_TRUCK_REQUEST",
    payerName: "Kola Haulage Ltd",
    amountNgn: 102_000,
    paidAt: daysAgo(10, 6, 50),
    paymentMethod: "PAYSTACK",
    status: "SUCCESSFUL",
    serviceReference: "TOW-882-11",
    serviceReferenceKind: "TOW_TRUCK",
    npaRate: 0.1,
    tow: { name: "Apapa Recovery Services", rate: 0.7 },
  }),
  withShares({
    transactionId: "TXN-2026-00028",
    paymentReference: "PSK-aabbccdd",
    paymentSource: "BOOKING",
    payerName: "Tincan Logistics",
    amountNgn: 198_000,
    paidAt: daysAgo(12, 15, 10),
    paymentMethod: "PAYSTACK",
    status: "SUCCESSFUL",
    serviceReference: "BKG-TNC-5520",
    serviceReferenceKind: "BOOKING",
    npaRate: 0.12,
    facility: { name: "Tincan Gate 2", rate: 0.33 },
    transit: { name: "Tincan Holding Park", rate: 0.09 },
  }),
  withShares({
    transactionId: "TXN-2026-00027",
    paymentReference: "PSK-eeff0011",
    paymentSource: "UTILITY_TICKET",
    payerName: "APM Terminal Ops",
    amountNgn: 31_000,
    paidAt: daysAgo(15, 9, 30),
    paymentMethod: "CARD",
    status: "SUCCESSFUL",
    serviceReference: "UTL-APM-2200",
    serviceReferenceKind: "UTILITY_TICKET",
    npaRate: 0.08,
  }),
  withShares({
    transactionId: "TXN-2026-00026",
    paymentReference: "PSK-22334455",
    paymentSource: "BOOKING",
    payerName: "BlueLine Transport",
    amountNgn: 165_000,
    paidAt: daysAgo(20, 11, 0),
    paymentMethod: "PAYSTACK",
    status: "SUCCESSFUL",
    serviceReference: "BKG-EPT-3300",
    serviceReferenceKind: "BOOKING",
    npaRate: 0.12,
    facility: { name: "EPT Bonded Zone", rate: 0.38 },
    transit: { name: "Apapa Transit Park", rate: 0.08 },
  }),
  withShares({
    transactionId: "TXN-2026-00025",
    paymentReference: "PSK-55667788",
    paymentSource: "TOW_TRUCK_REQUEST",
    payerName: "Northbound Freight",
    amountNgn: 91_500,
    paidAt: daysAgo(25, 7, 20),
    paymentMethod: "PAYSTACK",
    status: "SUCCESSFUL",
    serviceReference: "TOW-119-88",
    serviceReferenceKind: "TOW_TRUCK",
    npaRate: 0.1,
    tow: { name: "Lagos Port Tow Co", rate: 0.65 },
  }),
  withShares({
    transactionId: "TXN-2026-00024",
    paymentReference: "WLT-100200",
    paymentSource: "PENALTY",
    payerName: "Swift Movers",
    amountNgn: 15_000,
    paidAt: daysAgo(28, 18, 0),
    paymentMethod: "WALLET",
    status: "SUCCESSFUL",
    serviceReference: "PEN-ENF-2100",
    serviceReferenceKind: "PENALTY",
  }),
  withShares({
    transactionId: "TXN-2026-00023",
    paymentReference: "PSK-99001122",
    paymentSource: "DEMURRAGE",
    payerName: "BlueLine Transport",
    amountNgn: 54_000,
    paidAt: daysAgo(32, 10, 0),
    paymentMethod: "PAYSTACK",
    status: "SUCCESSFUL",
    serviceReference: "DMG-BKG-EPT-3298",
    serviceReferenceKind: "DEMURRAGE",
    facility: { name: "EPT Bonded Zone", rate: 0.52 },
    transit: { name: "Apapa Transit Park", rate: 0.22 },
  }),
];

export const EREVENUE_MODULE_META: Record<
  ERevenueModule,
  { title: string; subtitle: string; pieTitle: string; amountLabel: string }
> = {
  etss: {
    title: "Maritime-ETSS e-Revenue",
    subtitle:
      "Platform-wide revenue from bookings, utility tickets, penalties, tow requests, and demurrage.",
    pieTitle: "Revenue by payment source",
    amountLabel: "Amount paid (₦)",
  },
  npa: {
    title: "NPA e-Revenue",
    subtitle: "Nigeria Ports Authority share of qualifying platform transactions.",
    pieTitle: "NPA revenue share by source",
    amountLabel: "NPA share (₦)",
  },
  facilities: {
    title: "Facilities e-Revenue",
    subtitle: "Booking and demurrage revenue attributed to facility owners.",
    pieTitle: "Revenue share by facility",
    amountLabel: "Facility share (₦)",
  },
  transit: {
    title: "Transit Parks e-Revenue",
    subtitle: "Booking and demurrage revenue attributed to transit parks.",
    pieTitle: "Revenue share by transit park",
    amountLabel: "Transit park share (₦)",
  },
  tow: {
    title: "Tow truck companies e-Revenue",
    subtitle: "Paid tow truck request revenue by service provider.",
    pieTitle: "Revenue share by tow company",
    amountLabel: "Company share (₦)",
  },
};

export function getModuleDisplayAmount(
  module: ERevenueModule,
  txn: RevenueTransaction,
): number {
  switch (module) {
    case "etss":
      return txn.amountNgn;
    case "npa":
      return txn.npaShareNgn ?? 0;
    case "facilities":
      return txn.facilityShareNgn ?? 0;
    case "transit":
      return txn.transitParkShareNgn ?? 0;
    case "tow":
      return txn.towCompanyShareNgn ?? 0;
    default:
      return txn.amountNgn;
  }
}

export function filterTransactionsForModule(
  module: ERevenueModule,
  txns: RevenueTransaction[],
): RevenueTransaction[] {
  switch (module) {
    case "etss":
      return txns;
    case "npa":
      return txns.filter((t) =>
        ["BOOKING", "UTILITY_TICKET", "TOW_TRUCK_REQUEST"].includes(
          t.paymentSource,
        ),
      );
    case "facilities":
      return txns.filter(
        (t) =>
          (t.facilityShareNgn ?? 0) > 0
          && (t.paymentSource === "BOOKING" || t.paymentSource === "DEMURRAGE"),
      );
    case "transit":
      return txns.filter(
        (t) =>
          (t.transitParkShareNgn ?? 0) > 0
          && (t.paymentSource === "BOOKING" || t.paymentSource === "DEMURRAGE"),
      );
    case "tow":
      return txns.filter(
        (t) =>
          t.paymentSource === "TOW_TRUCK_REQUEST"
          && (t.towCompanyShareNgn ?? 0) > 0,
      );
    default:
      return txns;
  }
}

export function buildPieSlices(
  module: ERevenueModule,
  txns: RevenueTransaction[],
): PieSlice[] {
  const successful = txns.filter((t) => t.status === "SUCCESSFUL");
  const buckets = new Map<string, number>();

  if (module === "etss") {
    for (const t of successful) {
      const key = formatPaymentSource(t.paymentSource);
      buckets.set(key, (buckets.get(key) ?? 0) + t.amountNgn);
    }
  } else if (module === "npa") {
    for (const t of successful) {
      const share = t.npaShareNgn ?? 0;
      if (share <= 0) continue;
      const key =
        t.paymentSource === "BOOKING"
          ? "Bookings"
          : t.paymentSource === "UTILITY_TICKET"
            ? "Utility tickets"
            : t.paymentSource === "TOW_TRUCK_REQUEST"
              ? "Tow truck requests"
              : "Other";
      if (key === "Other") continue;
      buckets.set(key, (buckets.get(key) ?? 0) + share);
    }
  } else if (module === "facilities") {
    for (const t of successful) {
      const share = t.facilityShareNgn ?? 0;
      if (share <= 0 || !t.facilityName) continue;
      buckets.set(t.facilityName, (buckets.get(t.facilityName) ?? 0) + share);
    }
  } else if (module === "transit") {
    for (const t of successful) {
      const share = t.transitParkShareNgn ?? 0;
      if (share <= 0 || !t.transitParkName) continue;
      buckets.set(
        t.transitParkName,
        (buckets.get(t.transitParkName) ?? 0) + share,
      );
    }
  } else if (module === "tow") {
    for (const t of successful) {
      const share = t.towCompanyShareNgn ?? 0;
      if (share <= 0 || !t.towCompanyName) continue;
      buckets.set(
        t.towCompanyName,
        (buckets.get(t.towCompanyName) ?? 0) + share,
      );
    }
  }

  const entries = [...buckets.entries()].sort((a, b) => b[1] - a[1]);
  return entries.map(([name, value], i) => ({
    name,
    value,
    color: PIE_COLORS[i % PIE_COLORS.length],
  }));
}

export function breakdownBySourceEtss(txns: RevenueTransaction[]) {
  const sources: PaymentSource[] = [
    "BOOKING",
    "UTILITY_TICKET",
    "PENALTY",
    "TOW_TRUCK_REQUEST",
    "DEMURRAGE",
  ];
  return sources.map((source) => ({
    source,
    label: formatPaymentSource(source),
    total: txns
      .filter((t) => t.status === "SUCCESSFUL" && t.paymentSource === source)
      .reduce((s, t) => s + t.amountNgn, 0),
  }));
}

/** Simulated live payment appended on refresh cycles. */
export function createSimulatedLiveTransaction(seq: number): RevenueTransaction {
  const id = `TXN-LIVE-${seq}`;
  return withShares({
    transactionId: id,
    paymentReference: `PSK-live-${seq}`,
    paymentSource: "BOOKING",
    payerName: "Live Feed Transporter",
    amountNgn: 125_000 + (seq % 5) * 5_000,
    paidAt: new Date().toISOString(),
    paymentMethod: "PAYSTACK",
    status: "SUCCESSFUL",
    serviceReference: `BKG-LIVE-${9000 + seq}`,
    serviceReferenceKind: "BOOKING",
    npaRate: 0.12,
    facility: { name: "APM Terminal Gate A", rate: 0.35 },
    transit: { name: "Apapa Transit Park", rate: 0.08 },
  });
}

export type ERevenueModule = "etss" | "npa" | "facilities" | "transit" | "tow";

export type PaymentSource =
  | "BOOKING"
  | "UTILITY_TICKET"
  | "PENALTY"
  | "TOW_TRUCK_REQUEST"
  | "DEMURRAGE";

export type PaymentMethod = "CARD" | "BANK_TRANSFER" | "WALLET" | "PAYSTACK";

export type PaymentStatus = "SUCCESSFUL" | "PENDING" | "FAILED";

export type ServiceReferenceKind =
  | "BOOKING"
  | "UTILITY_TICKET"
  | "TOW_TRUCK"
  | "PENALTY"
  | "DEMURRAGE";

export type DateRangePreset = "DAILY" | "WEEKLY" | "MONTHLY" | "CUSTOM";

export interface RevenueTransaction {
  id: string;
  transactionId: string;
  paymentReference: string;
  invoiceNumber?: string;
  paymentSource: PaymentSource;
  paymentSourceLabel?: string;
  payerName: string;
  payerDisplay?: string;
  payerAccount?: string;
  amountNgn: number;
  amountDue?: number;
  paidAt: string;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  serviceReference: string;
  serviceReferenceKind: ServiceReferenceKind;
  etssShareNgn?: number;
  npaShareNgn?: number;
  facilityName?: string;
  facilityShareNgn?: number;
  transitParkName?: string;
  transitParkShareNgn?: number;
  towCompanyName?: string;
  towCompanyShareNgn?: number;
  truckPlateNumber?: string;
  terminalName?: string;
}

export interface PieSlice {
  name: string;
  value: number;
  color: string;
}

/** API accepts `transacted_at`; UI may still use legacy `paid_at` aliases in mappers. */
export type RevenueSortField =
  | "transacted_at"
  | "paid_at"
  | "amount"
  | "source"
  | "status"
  | "payer";

export type RevenueSortOrder = "ASC" | "DESC";

export interface RevenueTransactionsListParams {
  module: ERevenueModule;
  page?: number;
  limit?: number;
  search?: string;
  payment_source?: PaymentSource | "ALL";
  payment_method?: PaymentMethod | "ALL";
  status?: PaymentStatus | "ALL";
  /** Client-only; resolved to date_from / date_to before API calls */
  date_preset?: DateRangePreset;
  date_from?: string;
  date_to?: string;
  amount_min?: number;
  amount_max?: number;
  sort_by?: RevenueSortField;
  /** Sent to API as `sort_order` (ASC | DESC) */
  sort_dir?: "asc" | "desc";
}

export interface RevenueBreakdownResponse {
  breakdown?: RevenueSummaryBreakdownItem[];
  pieSlices?: PieSlice[];
}

export interface RevenueTransactionsListResponse {
  data: RevenueTransaction[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
    module_total?: number;
  };
}

export interface RevenueSummaryBreakdownItem {
  source: PaymentSource;
  label: string;
  /** Paid amount (maps from API `amount_paid`) */
  total: number;
  amountDue?: number;
  entries?: number;
}

export interface RevenueSummaryResponse {
  totalRevenue: number;
  totalAmountDue?: number;
  transactionCount: number;
  pendingCount?: number;
  failedCount?: number;
  breakdown?: RevenueSummaryBreakdownItem[];
  pieSlices?: PieSlice[];
}

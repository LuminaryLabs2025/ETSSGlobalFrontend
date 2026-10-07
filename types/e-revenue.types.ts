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
  paymentSource: PaymentSource;
  payerName: string;
  payerAccount?: string;
  amountNgn: number;
  paidAt: string;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  serviceReference: string;
  serviceReferenceKind: ServiceReferenceKind;
  npaShareNgn?: number;
  facilityName?: string;
  facilityShareNgn?: number;
  transitParkName?: string;
  transitParkShareNgn?: number;
  towCompanyName?: string;
  towCompanyShareNgn?: number;
}

export interface PieSlice {
  name: string;
  value: number;
  color: string;
}

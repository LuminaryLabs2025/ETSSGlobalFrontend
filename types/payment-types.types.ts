export type PaymentAmountType = "FIXED" | "PERCENTAGE" | string;
export type PaymentTypeStatus = "ACTIVE" | "INACTIVE" | string;

export type PaymentLinkedForm =
  | "BOOK_BONDED_TERMINAL"
  | "BOOK_TRUCK_PARK"
  | "BOOK_FISH"
  | "BOOK_EPT";

export const PAYMENT_LINKED_FORM_OPTIONS: {
  value: PaymentLinkedForm;
  label: string;
  description: string;
}[] = [
  {
    value: "BOOK_BONDED_TERMINAL",
    label: "Book Bonded Terminal",
    description: "Bonded terminal assist booking form",
  },
  {
    value: "BOOK_TRUCK_PARK",
    label: "Book Truck Park",
    description: "Truck park assist booking form",
  },
  {
    value: "BOOK_FISH",
    label: "Book Fish",
    description: "Fish van park assist booking form",
  },
  {
    value: "BOOK_EPT",
    label: "Book EPT",
    description: "Export processing terminal assist booking form",
  },
];

export function formatPaymentLinkedForm(value?: string | null): string {
  if (!value?.trim()) return "—";
  const match = PAYMENT_LINKED_FORM_OPTIONS.find((opt) => opt.value === value);
  return match?.label ?? value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export interface PaymentTypeUserType {
  id: string;
  name: string;
  slug?: string;
  category?: string;
}

export interface PaymentType {
  id: string;
  name: string;
  service_name: string;
  linked_form: string;
  revenue_event_trigger: string;
  charged_to_user_type_id: string;
  charged_to_user_type?: PaymentTypeUserType | null;
  amount_type: PaymentAmountType;
  amount: number;
  status: PaymentTypeStatus;
  type?: string | null;
  created_at?: string;
  updated_at?: string;
}

export type PaymentTypeDetail = PaymentType;

export interface PaymentTypesListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  type?: string;
}

export interface PaymentTypesListResponse {
  data: PaymentType[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export interface PaymentTypePayload {
  name: string;
  service_name: string;
  linked_form: string;
  revenue_event_trigger: string;
  charged_to_user_type_id: string;
  amount_type: PaymentAmountType;
  amount: number;
  status: string;
}

export interface PaymentTypeActionResponse {
  message?: string;
  data?: PaymentType;
}

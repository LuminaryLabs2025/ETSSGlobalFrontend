export type PaymentAmountType = "FIXED" | "PERCENTAGE" | string;
export type PaymentTypeStatus = "ACTIVE" | "INACTIVE" | string;

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

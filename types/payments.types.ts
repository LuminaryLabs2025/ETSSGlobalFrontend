export interface InitializePaymentRequest {
  terms_accepted: true;
}

export interface InitializePaymentResponse {
  reference: string;
  authorization_url: string;
  access_code: string;
  amount: number;
  currency: string;
}

export interface VerifyByReferenceRequest {
  reference: string;
}

export type PaymentTransactionStatus = "PENDING" | "SUCCESSFUL" | "FAILED" | "ABANDONED";

export interface PaymentTransactionResponse {
  id: string;
  reference: string;
  invoice_id: string;
  invoice_number?: string;
  payable_type?: "BOOKING";
  payable_id?: string;
  gateway: "PAYSTACK";
  status: PaymentTransactionStatus;
  amount: number;
  currency: string;
  customer_email?: string;
  paystack_authorization_url?: string;
  channel?: string;
  gateway_response?: string;
  paid_at?: string;
  created_at: string;
}

export interface PaymentsConfigResponse {
  public_key: string;
}

export interface VerifyBookingPaymentRequest {
  reference?: string;
}

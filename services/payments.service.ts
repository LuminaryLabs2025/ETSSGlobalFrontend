import apiClient from "@/api/client";
import { PAYMENTS } from "@/api/endpoints";
import type { ApiResponse } from "@/types/api.types";
import type {
  InitializePaymentResponse,
  PaymentTransactionResponse,
  VerifyBookingPaymentRequest,
} from "@/types/payments.types";

export const paymentsService = {
  initialize: async (bookingId: string): Promise<InitializePaymentResponse> => {
    const { data } = await apiClient.post<ApiResponse<InitializePaymentResponse>>(
      PAYMENTS.INITIALIZE(bookingId),
      { terms_accepted: true },
    );
    return data.data;
  },

  verifyByReference: async (reference: string): Promise<PaymentTransactionResponse> => {
    const { data } = await apiClient.post<ApiResponse<PaymentTransactionResponse>>(
      PAYMENTS.VERIFY,
      { reference },
    );
    return data.data;
  },

  verifyBooking: async (
    bookingId: string,
    payload?: VerifyBookingPaymentRequest,
  ): Promise<PaymentTransactionResponse> => {
    const { data } = await apiClient.post<ApiResponse<PaymentTransactionResponse>>(
      PAYMENTS.VERIFY_BOOKING(bookingId),
      payload ?? {},
    );
    return data.data;
  },
};

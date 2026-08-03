import apiClient from "@/api/client";
import { PAYMENT_TYPES } from "@/api/endpoints";
import type { ApiResponse } from "@/types/api.types";
import type {
  PaymentType,
  PaymentTypeActionResponse,
  PaymentTypeDetail,
  PaymentTypePayload,
  PaymentTypesListParams,
  PaymentTypesListResponse,
} from "@/types/payment-types.types";

export const paymentTypesService = {
  list: async (params?: PaymentTypesListParams): Promise<PaymentTypesListResponse> => {
    const { data } = await apiClient.get<ApiResponse<PaymentTypesListResponse>>(PAYMENT_TYPES.LIST, {
      params,
    });
    return data.data;
  },

  getById: async (id: string): Promise<PaymentTypeDetail> => {
    const { data } = await apiClient.get<ApiResponse<PaymentTypeDetail>>(PAYMENT_TYPES.BY_ID(id));
    return data.data;
  },

  create: async (payload: PaymentTypePayload): Promise<PaymentTypeActionResponse> => {
    const { data } = await apiClient.post<ApiResponse<PaymentType>>(PAYMENT_TYPES.LIST, payload);
    return { message: data.message, data: data.data };
  },

  update: async (id: string, payload: PaymentTypePayload): Promise<PaymentTypeActionResponse> => {
    const { data } = await apiClient.put<ApiResponse<PaymentType>>(PAYMENT_TYPES.BY_ID(id), payload);
    return { message: data.message, data: data.data };
  },

  delete: async (id: string): Promise<PaymentTypeActionResponse> => {
    const { data } = await apiClient.delete<ApiResponse<unknown>>(PAYMENT_TYPES.BY_ID(id));
    return { message: data.message };
  },
};

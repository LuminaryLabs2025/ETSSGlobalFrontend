import apiClient from "@/api/client";
import { BARRIERS } from "@/api/endpoints";
import type { ApiResponse } from "@/types/api.types";
import type {
  BarrierActionResponse,
  BarrierDetail,
  BarrierPayload,
  BarriersListParams,
  BarriersListResponse,
  BarriersSummaryParams,
  BarriersSummaryResponse,
} from "@/types/barriers.types";

export const barriersService = {
  list: async (params?: BarriersListParams): Promise<BarriersListResponse> => {
    const { data } = await apiClient.get<ApiResponse<BarriersListResponse>>(BARRIERS.LIST, {
      params,
    });
    return data.data;
  },

  summary: async (params?: BarriersSummaryParams): Promise<BarriersSummaryResponse> => {
    const { data } = await apiClient.get<ApiResponse<BarriersSummaryResponse>>(BARRIERS.SUMMARY, {
      params,
    });
    return data.data;
  },

  getById: async (id: string): Promise<BarrierDetail> => {
    const { data } = await apiClient.get<ApiResponse<BarrierDetail>>(BARRIERS.BY_ID(id));
    return data.data;
  },

  create: async (payload: BarrierPayload): Promise<BarrierActionResponse> => {
    const { data } = await apiClient.post<ApiResponse<BarrierDetail>>(BARRIERS.LIST, payload);
    return { message: data.message, data: data.data };
  },

  update: async (id: string, payload: BarrierPayload): Promise<BarrierActionResponse> => {
    const { data } = await apiClient.put<ApiResponse<BarrierDetail>>(BARRIERS.BY_ID(id), payload);
    return { message: data.message, data: data.data };
  },

  disable: async (id: string): Promise<BarrierActionResponse> => {
    const { data } = await apiClient.patch<ApiResponse<BarrierDetail>>(BARRIERS.DISABLE(id));
    return { message: data.message, data: data.data };
  },
};

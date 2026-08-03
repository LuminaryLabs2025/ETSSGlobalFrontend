import apiClient from "@/api/client";
import { TEP_TYPES } from "@/api/endpoints";
import type { ApiResponse } from "@/types/api.types";
import type {
  TepType,
  TepTypeActionResponse,
  TepTypeDetail,
  TepTypePayload,
  TepTypesListParams,
  TepTypesListResponse,
} from "@/types/tep-types.types";

export const tepTypesService = {
  list: async (params?: TepTypesListParams): Promise<TepTypesListResponse> => {
    const { data } = await apiClient.get<ApiResponse<TepTypesListResponse>>(TEP_TYPES.LIST, {
      params,
    });
    return data.data;
  },

  getById: async (id: string): Promise<TepTypeDetail> => {
    const { data } = await apiClient.get<ApiResponse<TepTypeDetail>>(TEP_TYPES.BY_ID(id));
    return data.data;
  },

  create: async (payload: TepTypePayload): Promise<TepTypeActionResponse> => {
    const { data } = await apiClient.post<ApiResponse<TepType>>(TEP_TYPES.LIST, payload);
    return { message: data.message, data: data.data };
  },

  update: async (id: string, payload: TepTypePayload): Promise<TepTypeActionResponse> => {
    const { data } = await apiClient.put<ApiResponse<TepType>>(TEP_TYPES.BY_ID(id), payload);
    return { message: data.message, data: data.data };
  },

  delete: async (id: string): Promise<TepTypeActionResponse> => {
    const { data } = await apiClient.delete<ApiResponse<unknown>>(TEP_TYPES.BY_ID(id));
    return { message: data.message };
  },
};

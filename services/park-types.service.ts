import apiClient from "@/api/client";
import { PARK_TYPES } from "@/api/endpoints";
import type { ApiResponse } from "@/types/api.types";
import type {
  ParkType,
  ParkTypeActionResponse,
  ParkTypeDetail,
  ParkTypePayload,
  ParkTypesListParams,
  ParkTypesListResponse,
} from "@/types/park-types.types";

export const parkTypesService = {
  list: async (params?: ParkTypesListParams): Promise<ParkTypesListResponse> => {
    const { data } = await apiClient.get<ApiResponse<ParkTypesListResponse>>(PARK_TYPES.LIST, {
      params,
    });
    return data.data;
  },

  getById: async (id: string): Promise<ParkTypeDetail> => {
    const { data } = await apiClient.get<ApiResponse<ParkTypeDetail>>(PARK_TYPES.BY_ID(id));
    return data.data;
  },

  create: async (payload: ParkTypePayload): Promise<ParkTypeActionResponse> => {
    const { data } = await apiClient.post<ApiResponse<ParkType>>(PARK_TYPES.LIST, payload);
    return { message: data.message, data: data.data };
  },

  update: async (id: string, payload: ParkTypePayload): Promise<ParkTypeActionResponse> => {
    const { data } = await apiClient.put<ApiResponse<ParkType>>(PARK_TYPES.BY_ID(id), payload);
    return { message: data.message, data: data.data };
  },

  delete: async (id: string): Promise<ParkTypeActionResponse> => {
    const { data } = await apiClient.delete<ApiResponse<unknown>>(PARK_TYPES.BY_ID(id));
    return { message: data.message };
  },
};

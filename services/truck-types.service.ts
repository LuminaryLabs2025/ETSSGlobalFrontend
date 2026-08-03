import apiClient from "@/api/client";
import { TRUCK_TYPES } from "@/api/endpoints";
import type { ApiResponse } from "@/types/api.types";
import type {
  TruckTypeActionResponse,
  TruckTypeDetail,
  TruckTypePayload,
  TruckTypeRecord,
  TruckTypesListParams,
  TruckTypesListResponse,
} from "@/types/truck-types.types";

export const truckTypesService = {
  list: async (params?: TruckTypesListParams): Promise<TruckTypesListResponse> => {
    const { data } = await apiClient.get<ApiResponse<TruckTypesListResponse>>(TRUCK_TYPES.LIST, {
      params,
    });
    return data.data;
  },

  getById: async (id: string): Promise<TruckTypeDetail> => {
    const { data } = await apiClient.get<ApiResponse<TruckTypeDetail>>(TRUCK_TYPES.BY_ID(id));
    return data.data;
  },

  create: async (payload: TruckTypePayload): Promise<TruckTypeActionResponse> => {
    const { data } = await apiClient.post<ApiResponse<TruckTypeRecord>>(TRUCK_TYPES.LIST, payload);
    return { message: data.message, data: data.data };
  },

  update: async (id: string, payload: TruckTypePayload): Promise<TruckTypeActionResponse> => {
    const { data } = await apiClient.put<ApiResponse<TruckTypeRecord>>(TRUCK_TYPES.BY_ID(id), payload);
    return { message: data.message, data: data.data };
  },

  delete: async (id: string): Promise<TruckTypeActionResponse> => {
    const { data } = await apiClient.delete<ApiResponse<unknown>>(TRUCK_TYPES.BY_ID(id));
    return { message: data.message };
  },
};

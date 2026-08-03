import apiClient from "@/api/client";
import { TRUCK_LENGTHS } from "@/api/endpoints";
import type { ApiResponse } from "@/types/api.types";
import type {
  TruckLength,
  TruckLengthActionResponse,
  TruckLengthDetail,
  TruckLengthPayload,
  TruckLengthsListParams,
  TruckLengthsListResponse,
} from "@/types/truck-lengths.types";

export const truckLengthsService = {
  list: async (params?: TruckLengthsListParams): Promise<TruckLengthsListResponse> => {
    const { data } = await apiClient.get<ApiResponse<TruckLengthsListResponse>>(TRUCK_LENGTHS.LIST, {
      params,
    });
    return data.data;
  },

  getById: async (id: string): Promise<TruckLengthDetail> => {
    const { data } = await apiClient.get<ApiResponse<TruckLengthDetail>>(TRUCK_LENGTHS.BY_ID(id));
    return data.data;
  },

  create: async (payload: TruckLengthPayload): Promise<TruckLengthActionResponse> => {
    const { data } = await apiClient.post<ApiResponse<TruckLength>>(TRUCK_LENGTHS.LIST, payload);
    return { message: data.message, data: data.data };
  },

  update: async (id: string, payload: TruckLengthPayload): Promise<TruckLengthActionResponse> => {
    const { data } = await apiClient.put<ApiResponse<TruckLength>>(TRUCK_LENGTHS.BY_ID(id), payload);
    return { message: data.message, data: data.data };
  },

  delete: async (id: string): Promise<TruckLengthActionResponse> => {
    const { data } = await apiClient.delete<ApiResponse<unknown>>(TRUCK_LENGTHS.BY_ID(id));
    return { message: data.message };
  },
};

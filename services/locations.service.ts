import apiClient from "@/api/client";
import { LOCATIONS } from "@/api/endpoints";
import type { ApiResponse } from "@/types/api.types";
import type {
  LocationActionResponse,
  LocationDetail,
  LocationPayload,
  LocationRecord,
  LocationsListParams,
  LocationsListResponse,
} from "@/types/locations.types";

export const locationsService = {
  list: async (params?: LocationsListParams): Promise<LocationsListResponse> => {
    const { data } = await apiClient.get<ApiResponse<LocationsListResponse>>(LOCATIONS.LIST, {
      params,
    });
    return data.data;
  },

  getById: async (id: string): Promise<LocationDetail> => {
    const { data } = await apiClient.get<ApiResponse<LocationDetail>>(LOCATIONS.BY_ID(id));
    return data.data;
  },

  create: async (payload: LocationPayload): Promise<LocationActionResponse> => {
    const { data } = await apiClient.post<ApiResponse<LocationRecord>>(LOCATIONS.LIST, payload);
    return { message: data.message, data: data.data };
  },

  update: async (id: string, payload: LocationPayload): Promise<LocationActionResponse> => {
    const { data } = await apiClient.put<ApiResponse<LocationRecord>>(LOCATIONS.BY_ID(id), payload);
    return { message: data.message, data: data.data };
  },

  delete: async (id: string): Promise<LocationActionResponse> => {
    const { data } = await apiClient.delete<ApiResponse<unknown>>(LOCATIONS.BY_ID(id));
    return { message: data.message };
  },
};

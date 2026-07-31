import apiClient from "@/api/client";
import { TRANSIT_PARKS } from "@/api/endpoints";
import type { ApiResponse } from "@/types/api.types";
import type {
  TransitParksListParams,
  TransitParksListResponse,
  TransitParksSummaryResponse,
  TransitParkActionResponse,
  TransitPark,
  TransitParkDetail,
  UpdateTransitParkPayload,
  TransitParkStatus,
} from "@/types/transit-parks.types";

export const transitParksService = {
  list: async (params?: TransitParksListParams): Promise<TransitParksListResponse> => {
    const { data } = await apiClient.get<ApiResponse<TransitParksListResponse>>(TRANSIT_PARKS.LIST, {
      params,
    });
    return data.data;
  },

  summary: async (): Promise<TransitParksSummaryResponse> => {
    const { data } = await apiClient.get<ApiResponse<TransitParksSummaryResponse>>(TRANSIT_PARKS.SUMMARY);
    return data.data;
  },

  getById: async (id: string): Promise<TransitParkDetail> => {
    const { data } = await apiClient.get<ApiResponse<TransitParkDetail>>(TRANSIT_PARKS.BY_ID(id));
    return data.data;
  },

  update: async (id: string, payload: UpdateTransitParkPayload): Promise<TransitParkActionResponse> => {
    const { data } = await apiClient.put<ApiResponse<TransitParkActionResponse>>(TRANSIT_PARKS.BY_ID(id), payload);
    return { message: data.message };
  },

  enable: async (id: string): Promise<TransitParkActionResponse> => {
    const { data } = await apiClient.patch<ApiResponse<TransitParkActionResponse>>(TRANSIT_PARKS.ENABLE(id));
    return { message: data.message };
  },

  disable: async (id: string): Promise<TransitParkActionResponse> => {
    const { data } = await apiClient.patch<ApiResponse<TransitParkActionResponse>>(TRANSIT_PARKS.DISABLE(id));
    return { message: data.message };
  },

  setStatus: async (id: string, status: TransitParkStatus): Promise<TransitParkActionResponse> => {
    const { data } = await apiClient.patch<ApiResponse<TransitParkActionResponse>>(TRANSIT_PARKS.STATUS(id), {
      status,
    });
    return { message: data.message };
  },

  delete: async (id: string): Promise<TransitParkActionResponse> => {
    const { data } = await apiClient.delete<ApiResponse<TransitParkActionResponse>>(TRANSIT_PARKS.BY_ID(id));
    return { message: data.message };
  },

  archive: async (id: string): Promise<TransitParkActionResponse> => {
    const { data } = await apiClient.patch<ApiResponse<TransitParkActionResponse>>(TRANSIT_PARKS.ARCHIVE(id));
    return { message: data.message };
  },

  unarchive: async (id: string): Promise<TransitParkActionResponse> => {
    const { data } = await apiClient.patch<ApiResponse<TransitParkActionResponse>>(TRANSIT_PARKS.UNARCHIVE(id));
    return { message: data.message };
  },
};

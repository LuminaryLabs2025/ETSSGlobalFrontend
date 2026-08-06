import apiClient from "@/api/client";
import { FACILITIES } from "@/api/endpoints";
import type { ApiResponse } from "@/types/api.types";
import type {
  FacilitiesListParams,
  FacilitiesListResponse,
  FacilitiesSummaryResponse,
  FacilityActionResponse,
  Facility,
  FacilityDetail,
  CreateFacilityPayload,
  UpdateFacilityPayload,
  FacilityStatus,
  FacilityTimeslotsListParams,
  FacilityTimeslotsListResponse,
} from "@/types/facilities.types";

export const facilitiesService = {
  list: async (params?: FacilitiesListParams): Promise<FacilitiesListResponse> => {
    const { data } = await apiClient.get<ApiResponse<FacilitiesListResponse>>(FACILITIES.LIST, {
      params,
    });
    return data.data;
  },

  summary: async (): Promise<FacilitiesSummaryResponse> => {
    const { data } = await apiClient.get<ApiResponse<FacilitiesSummaryResponse>>(FACILITIES.SUMMARY);
    return data.data;
  },

  getById: async (id: string): Promise<FacilityDetail> => {
    const { data } = await apiClient.get<ApiResponse<FacilityDetail>>(FACILITIES.BY_ID(id));
    return data.data;
  },

  create: async (payload: CreateFacilityPayload): Promise<FacilityActionResponse> => {
    const { data } = await apiClient.post<ApiResponse<FacilityDetail>>(FACILITIES.LIST, payload);
    return { message: data.message };
  },

  update: async (id: string, payload: UpdateFacilityPayload): Promise<FacilityActionResponse> => {
    const { data } = await apiClient.put<ApiResponse<FacilityActionResponse>>(FACILITIES.BY_ID(id), payload);
    return { message: data.message };
  },

  enable: async (id: string): Promise<FacilityActionResponse> => {
    const { data } = await apiClient.patch<ApiResponse<FacilityActionResponse>>(FACILITIES.ENABLE(id));
    return { message: data.message };
  },

  disable: async (id: string): Promise<FacilityActionResponse> => {
    const { data } = await apiClient.patch<ApiResponse<FacilityActionResponse>>(FACILITIES.DISABLE(id));
    return { message: data.message };
  },

  setStatus: async (id: string, status: FacilityStatus): Promise<FacilityActionResponse> => {
    const { data } = await apiClient.patch<ApiResponse<FacilityActionResponse>>(FACILITIES.STATUS(id), {
      status,
    });
    return { message: data.message };
  },

  delete: async (id: string): Promise<FacilityActionResponse> => {
    const { data } = await apiClient.delete<ApiResponse<FacilityActionResponse>>(FACILITIES.BY_ID(id));
    return { message: data.message };
  },

  archive: async (id: string): Promise<FacilityActionResponse> => {
    const { data } = await apiClient.patch<ApiResponse<FacilityActionResponse>>(FACILITIES.ARCHIVE(id));
    return { message: data.message };
  },

  unarchive: async (id: string): Promise<FacilityActionResponse> => {
    const { data } = await apiClient.patch<ApiResponse<FacilityActionResponse>>(FACILITIES.UNARCHIVE(id));
    return { message: data.message };
  },

  timeslots: async (
    id: string,
    params?: FacilityTimeslotsListParams
  ): Promise<FacilityTimeslotsListResponse> => {
    const { data } = await apiClient.get<ApiResponse<FacilityTimeslotsListResponse>>(
      FACILITIES.TIMESLOTS(id),
      { params }
    );
    return data.data;
  },
};

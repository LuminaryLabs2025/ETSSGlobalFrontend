import apiClient from "@/api/client";
import { FACILITY_TYPES } from "@/api/endpoints";
import type { ApiResponse } from "@/types/api.types";
import type {
  FacilityTypeActionResponse,
  FacilityTypeDetail,
  FacilityTypePayload,
  FacilityTypeRecord,
  FacilityTypesListParams,
  FacilityTypesListResponse,
} from "@/types/facility-types.types";

export const facilityTypesService = {
  list: async (params?: FacilityTypesListParams): Promise<FacilityTypesListResponse> => {
    const { data } = await apiClient.get<ApiResponse<FacilityTypesListResponse>>(FACILITY_TYPES.LIST, {
      params,
    });
    return data.data;
  },

  getById: async (id: string): Promise<FacilityTypeDetail> => {
    const { data } = await apiClient.get<ApiResponse<FacilityTypeDetail>>(FACILITY_TYPES.BY_ID(id));
    return data.data;
  },

  create: async (payload: FacilityTypePayload): Promise<FacilityTypeActionResponse> => {
    const { data } = await apiClient.post<ApiResponse<FacilityTypeRecord>>(FACILITY_TYPES.LIST, payload);
    return { message: data.message, data: data.data };
  },

  update: async (id: string, payload: FacilityTypePayload): Promise<FacilityTypeActionResponse> => {
    const { data } = await apiClient.put<ApiResponse<FacilityTypeRecord>>(
      FACILITY_TYPES.BY_ID(id),
      payload,
    );
    return { message: data.message, data: data.data };
  },

  delete: async (id: string): Promise<FacilityTypeActionResponse> => {
    const { data } = await apiClient.delete<ApiResponse<unknown>>(FACILITY_TYPES.BY_ID(id));
    return { message: data.message };
  },
};

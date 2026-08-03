import apiClient from "@/api/client";
import { FACILITY_TIMESLOTS } from "@/api/endpoints";
import type { ApiResponse } from "@/types/api.types";
import type {
  FacilityTimeslot,
  FacilityTimeslotActionResponse,
  FacilityTimeslotDetail,
  FacilityTimeslotPayload,
  FacilityTimeslotsListParams,
  FacilityTimeslotsListResponse,
} from "@/types/facility-timeslots.types";

export const facilityTimeslotsService = {
  list: async (params?: FacilityTimeslotsListParams): Promise<FacilityTimeslotsListResponse> => {
    const { data } = await apiClient.get<ApiResponse<FacilityTimeslotsListResponse>>(
      FACILITY_TIMESLOTS.LIST,
      { params },
    );
    return data.data;
  },

  getById: async (id: string): Promise<FacilityTimeslotDetail> => {
    const { data } = await apiClient.get<ApiResponse<FacilityTimeslotDetail>>(
      FACILITY_TIMESLOTS.BY_ID(id),
    );
    return data.data;
  },

  create: async (payload: FacilityTimeslotPayload): Promise<FacilityTimeslotActionResponse> => {
    const { data } = await apiClient.post<ApiResponse<FacilityTimeslot>>(
      FACILITY_TIMESLOTS.LIST,
      payload,
    );
    return { message: data.message, data: data.data };
  },

  update: async (
    id: string,
    payload: FacilityTimeslotPayload,
  ): Promise<FacilityTimeslotActionResponse> => {
    const { data } = await apiClient.put<ApiResponse<FacilityTimeslot>>(
      FACILITY_TIMESLOTS.BY_ID(id),
      payload,
    );
    return { message: data.message, data: data.data };
  },

  delete: async (id: string): Promise<FacilityTimeslotActionResponse> => {
    const { data } = await apiClient.delete<ApiResponse<unknown>>(FACILITY_TIMESLOTS.BY_ID(id));
    return { message: data.message };
  },
};

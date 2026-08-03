import apiClient from "@/api/client";
import { TRUCK_CAPACITIES } from "@/api/endpoints";
import type { ApiResponse } from "@/types/api.types";
import type {
  TruckCapacity,
  TruckCapacityActionResponse,
  TruckCapacityDetail,
  TruckCapacityPayload,
  TruckCapacitiesListParams,
  TruckCapacitiesListResponse,
} from "@/types/truck-capacities.types";

export const truckCapacitiesService = {
  list: async (params?: TruckCapacitiesListParams): Promise<TruckCapacitiesListResponse> => {
    const { data } = await apiClient.get<ApiResponse<TruckCapacitiesListResponse>>(
      TRUCK_CAPACITIES.LIST,
      { params },
    );
    return data.data;
  },

  getById: async (id: string): Promise<TruckCapacityDetail> => {
    const { data } = await apiClient.get<ApiResponse<TruckCapacityDetail>>(
      TRUCK_CAPACITIES.BY_ID(id),
    );
    return data.data;
  },

  create: async (payload: TruckCapacityPayload): Promise<TruckCapacityActionResponse> => {
    const { data } = await apiClient.post<ApiResponse<TruckCapacity>>(TRUCK_CAPACITIES.LIST, payload);
    return { message: data.message, data: data.data };
  },

  update: async (
    id: string,
    payload: TruckCapacityPayload,
  ): Promise<TruckCapacityActionResponse> => {
    const { data } = await apiClient.put<ApiResponse<TruckCapacity>>(
      TRUCK_CAPACITIES.BY_ID(id),
      payload,
    );
    return { message: data.message, data: data.data };
  },

  delete: async (id: string): Promise<TruckCapacityActionResponse> => {
    const { data } = await apiClient.delete<ApiResponse<unknown>>(TRUCK_CAPACITIES.BY_ID(id));
    return { message: data.message };
  },
};

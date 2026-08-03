import apiClient from "@/api/client";
import { HANDHELD_DEVICES } from "@/api/endpoints";
import type { ApiResponse } from "@/types/api.types";
import type {
  HandheldDevice,
  HandheldDeviceActionResponse,
  HandheldDeviceDetail,
  HandheldDevicePayload,
  HandheldDevicesListParams,
  HandheldDevicesListResponse,
} from "@/types/handheld-devices.types";

export const handheldDevicesService = {
  list: async (params?: HandheldDevicesListParams): Promise<HandheldDevicesListResponse> => {
    const { data } = await apiClient.get<ApiResponse<HandheldDevicesListResponse>>(
      HANDHELD_DEVICES.LIST,
      { params },
    );
    return data.data;
  },

  getById: async (id: string): Promise<HandheldDeviceDetail> => {
    const { data } = await apiClient.get<ApiResponse<HandheldDeviceDetail>>(
      HANDHELD_DEVICES.BY_ID(id),
    );
    return data.data;
  },

  create: async (payload: HandheldDevicePayload): Promise<HandheldDeviceActionResponse> => {
    const { data } = await apiClient.post<ApiResponse<HandheldDevice>>(
      HANDHELD_DEVICES.LIST,
      payload,
    );
    return { message: data.message, data: data.data };
  },

  update: async (
    id: string,
    payload: HandheldDevicePayload,
  ): Promise<HandheldDeviceActionResponse> => {
    const { data } = await apiClient.put<ApiResponse<HandheldDevice>>(
      HANDHELD_DEVICES.BY_ID(id),
      payload,
    );
    return { message: data.message, data: data.data };
  },

  delete: async (id: string): Promise<HandheldDeviceActionResponse> => {
    const { data } = await apiClient.delete<ApiResponse<unknown>>(HANDHELD_DEVICES.BY_ID(id));
    return { message: data.message };
  },
};

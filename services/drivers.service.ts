import apiClient from "@/api/client";
import { DRIVERS } from "@/api/endpoints";
import type { ApiResponse } from "@/types/api.types";
import type {
  DriversListParams,
  DriversListResponse,
  DriversSummaryResponse,
  DriverActionResponse,
  Driver,
  DriverReasonPayload,
  CreateDriverPayload,
} from "@/types/drivers.types";

export const driversService = {
  list: async (params?: DriversListParams): Promise<DriversListResponse> => {
    const { data } = await apiClient.get<ApiResponse<DriversListResponse>>(DRIVERS.LIST, {
      params,
    });
    return data.data;
  },

  summary: async (): Promise<DriversSummaryResponse> => {
    const { data } = await apiClient.get<ApiResponse<DriversSummaryResponse>>(DRIVERS.SUMMARY);
    return data.data;
  },

  getById: async (id: string): Promise<Driver> => {
    const { data } = await apiClient.get<ApiResponse<Driver>>(DRIVERS.BY_ID(id));
    return data.data;
  },

  create: async (payload: CreateDriverPayload): Promise<DriverActionResponse> => {
    const { data } = await apiClient.post<ApiResponse<DriverActionResponse>>(DRIVERS.CREATE, payload);
    return { message: data.message };
  },

  disable: async (id: string, payload: DriverReasonPayload): Promise<DriverActionResponse> => {
    const { data } = await apiClient.patch<ApiResponse<DriverActionResponse>>(DRIVERS.DISABLE(id), payload);
    return { message: data.message };
  },

  archive: async (id: string): Promise<DriverActionResponse> => {
    const { data } = await apiClient.patch<ApiResponse<DriverActionResponse>>(DRIVERS.ARCHIVE(id));
    return { message: data.message };
  },

  enable: async (id: string): Promise<DriverActionResponse> => {
    const { data } = await apiClient.patch<ApiResponse<DriverActionResponse>>(DRIVERS.ENABLE(id));
    return { message: data.message };
  },

  clearFlag: async (id: string, payload: DriverReasonPayload): Promise<DriverActionResponse> => {
    const { data } = await apiClient.patch<ApiResponse<DriverActionResponse>>(DRIVERS.CLEAR_FLAG(id), payload);
    return { message: data.message };
  },

  startVerification: async (id: string): Promise<DriverActionResponse> => {
    const { data } = await apiClient.patch<ApiResponse<DriverActionResponse>>(DRIVERS.START_VERIFICATION(id));
    return { message: data.message };
  },

  exportCsv: async (params?: DriversListParams): Promise<void> => {
    const response = await apiClient.get(DRIVERS.EXPORT, {
      params,
      responseType: "blob",
    });

    const blob = new Blob([response.data], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `drivers-export-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};

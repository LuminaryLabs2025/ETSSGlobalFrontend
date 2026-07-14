import apiClient from "@/api/client";
import { PENALTIES } from "@/api/endpoints";
import type { ApiResponse } from "@/types/api.types";
import type {
  PenaltiesListParams,
  PenaltiesListResponse,
  PenaltiesSummaryResponse,
  PenaltyDefinition,
  PenaltyActionResponse,
  PenaltyPayload,
} from "@/types/penalties.types";

export const penaltiesService = {
  summary: async (): Promise<PenaltiesSummaryResponse> => {
    const { data } = await apiClient.get<ApiResponse<PenaltiesSummaryResponse>>(PENALTIES.SUMMARY);
    return data.data;
  },

  list: async (params?: PenaltiesListParams): Promise<PenaltiesListResponse> => {
    const { data } = await apiClient.get<ApiResponse<PenaltiesListResponse>>(PENALTIES.LIST, { params });
    return data.data;
  },

  getById: async (id: string): Promise<PenaltyDefinition> => {
    const { data } = await apiClient.get<ApiResponse<PenaltyDefinition>>(PENALTIES.BY_ID(id));
    return data.data;
  },

  create: async (payload: PenaltyPayload): Promise<PenaltyActionResponse> => {
    const { data } = await apiClient.post<ApiResponse<PenaltyDefinition>>(PENALTIES.CREATE, payload);
    return { message: data.message, data: data.data };
  },

  edit: async (id: string, payload: PenaltyPayload): Promise<PenaltyActionResponse> => {
    const { data } = await apiClient.patch<ApiResponse<PenaltyDefinition>>(PENALTIES.EDIT(id), payload);
    return { message: data.message, data: data.data };
  },

  archive: async (id: string): Promise<PenaltyActionResponse> => {
    const { data } = await apiClient.patch<ApiResponse<PenaltyDefinition>>(PENALTIES.ARCHIVE(id));
    return { message: data.message, data: data.data };
  },

  exportCsv: async (params?: PenaltiesListParams): Promise<void> => {
    const response = await apiClient.get(PENALTIES.EXPORT, { params, responseType: "blob" });
    const blob = new Blob([response.data], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `penalties-export-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};

import apiClient from "@/api/client";
import { TEPS } from "@/api/endpoints";
import type { ApiResponse } from "@/types/api.types";
import type {
  TEPsListParams,
  TEPsListResponse,
  TEPsSummaryResponse,
  TEPActionResponse,
  TEP,
  TEPReasonPayload,
  CreateTEPPayload,
  BulkCreateTEPsPayload,
} from "@/types/teps.types";

export const tepsService = {
  list: async (params?: TEPsListParams): Promise<TEPsListResponse> => {
    const { data } = await apiClient.get<ApiResponse<TEPsListResponse>>(TEPS.LIST, {
      params,
    });
    return data.data;
  },

  summary: async (): Promise<TEPsSummaryResponse> => {
    const { data } = await apiClient.get<ApiResponse<TEPsSummaryResponse>>(TEPS.SUMMARY);
    return data.data;
  },

  getById: async (id: string): Promise<TEP> => {
    const { data } = await apiClient.get<ApiResponse<TEP>>(TEPS.BY_ID(id));
    return data.data;
  },

  create: async (payload: CreateTEPPayload): Promise<TEPActionResponse> => {
    const { data } = await apiClient.post<ApiResponse<TEPActionResponse>>(TEPS.CREATE, payload);
    return { message: data.message };
  },

  bulkCreate: async (payload: BulkCreateTEPsPayload): Promise<TEPActionResponse> => {
    const { data } = await apiClient.post<ApiResponse<TEPActionResponse>>(TEPS.BULK, payload);
    return { message: data.message };
  },

  revoke: async (id: string, payload: TEPReasonPayload): Promise<TEPActionResponse> => {
    const { data } = await apiClient.patch<ApiResponse<TEPActionResponse>>(TEPS.REVOKE(id), payload);
    return { message: data.message };
  },

  exportCsv: async (params?: TEPsListParams): Promise<void> => {
    const response = await apiClient.get(TEPS.EXPORT, {
      params,
      responseType: "blob",
    });

    const blob = new Blob([response.data], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `teps-export-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};

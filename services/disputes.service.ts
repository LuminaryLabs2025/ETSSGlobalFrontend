import apiClient from "@/api/client";
import { DISPUTES } from "@/api/endpoints";
import type { ApiResponse } from "@/types/api.types";
import type {
  DisputeActionResponse,
  DisputesListParams,
  DisputesListResponse,
  DisputesSummaryResponse,
  FineDispute,
  ResolveDisputePayload,
} from "@/types/penalties.types";

export const disputesService = {
  summary: async (): Promise<DisputesSummaryResponse> => {
    const { data } = await apiClient.get<ApiResponse<DisputesSummaryResponse>>(DISPUTES.SUMMARY);
    return data.data;
  },

  list: async (params?: DisputesListParams): Promise<DisputesListResponse> => {
    const { data } = await apiClient.get<ApiResponse<DisputesListResponse>>(DISPUTES.LIST, { params });
    return data.data;
  },

  getById: async (id: string): Promise<FineDispute> => {
    const { data } = await apiClient.get<ApiResponse<FineDispute>>(DISPUTES.BY_ID(id));
    return data.data;
  },

  resolve: async (id: string, payload: ResolveDisputePayload): Promise<DisputeActionResponse> => {
    const { data } = await apiClient.patch<ApiResponse<FineDispute>>(DISPUTES.RESOLVE(id), payload);
    return { message: data.message, data: data.data };
  },

  exportCsv: async (params?: DisputesListParams): Promise<void> => {
    const response = await apiClient.get(DISPUTES.EXPORT, { params, responseType: "blob" });
    const blob = new Blob([response.data], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `disputes-export-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};

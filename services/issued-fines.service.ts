import apiClient from "@/api/client";
import { ISSUED_FINES } from "@/api/endpoints";
import type { ApiResponse } from "@/types/api.types";
import type {
  IssuedFine,
  IssuedFinesListParams,
  IssuedFinesListResponse,
  IssuedFinesSummaryResponse,
} from "@/types/penalties.types";

export const issuedFinesService = {
  summary: async (): Promise<IssuedFinesSummaryResponse> => {
    const { data } = await apiClient.get<ApiResponse<IssuedFinesSummaryResponse>>(ISSUED_FINES.SUMMARY);
    return data.data;
  },

  list: async (params?: IssuedFinesListParams): Promise<IssuedFinesListResponse> => {
    const { data } = await apiClient.get<ApiResponse<IssuedFinesListResponse>>(ISSUED_FINES.LIST, { params });
    return data.data;
  },

  getById: async (id: string): Promise<IssuedFine> => {
    const { data } = await apiClient.get<ApiResponse<IssuedFine>>(ISSUED_FINES.BY_ID(id));
    return data.data;
  },

  exportCsv: async (params?: IssuedFinesListParams): Promise<void> => {
    const response = await apiClient.get(ISSUED_FINES.EXPORT, { params, responseType: "blob" });
    const blob = new Blob([response.data], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `issued-fines-export-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};

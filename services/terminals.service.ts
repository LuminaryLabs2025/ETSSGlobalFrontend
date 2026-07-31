import apiClient from "@/api/client";
import { TERMINALS } from "@/api/endpoints";
import type { ApiResponse } from "@/types/api.types";
import type {
  TerminalsListParams,
  TerminalsListResponse,
  TerminalsSummaryResponse,
  TerminalActionResponse,
  Terminal,
  TerminalDetail,
  UpdateTerminalPayload,
} from "@/types/terminals.types";

export const terminalsService = {
  list: async (params?: TerminalsListParams): Promise<TerminalsListResponse> => {
    const { data } = await apiClient.get<ApiResponse<TerminalsListResponse>>(TERMINALS.LIST, {
      params,
    });
    return data.data;
  },

  summary: async (): Promise<TerminalsSummaryResponse> => {
    const { data } = await apiClient.get<ApiResponse<TerminalsSummaryResponse>>(TERMINALS.SUMMARY);
    return data.data;
  },

  getById: async (id: string): Promise<TerminalDetail> => {
    const { data } = await apiClient.get<ApiResponse<TerminalDetail>>(TERMINALS.BY_ID(id));
    return data.data;
  },

  update: async (id: string, payload: UpdateTerminalPayload): Promise<TerminalActionResponse> => {
    const { data } = await apiClient.put<ApiResponse<TerminalActionResponse>>(TERMINALS.BY_ID(id), payload);
    return { message: data.message };
  },

  enable: async (id: string): Promise<TerminalActionResponse> => {
    const { data } = await apiClient.patch<ApiResponse<TerminalActionResponse>>(TERMINALS.ENABLE(id));
    return { message: data.message };
  },

  disable: async (id: string): Promise<TerminalActionResponse> => {
    const { data } = await apiClient.patch<ApiResponse<TerminalActionResponse>>(TERMINALS.DISABLE(id));
    return { message: data.message };
  },

  delete: async (id: string): Promise<TerminalActionResponse> => {
    const { data } = await apiClient.delete<ApiResponse<TerminalActionResponse>>(TERMINALS.BY_ID(id));
    return { message: data.message };
  },

  archive: async (id: string): Promise<TerminalActionResponse> => {
    const { data } = await apiClient.patch<ApiResponse<TerminalActionResponse>>(TERMINALS.ARCHIVE(id));
    return { message: data.message };
  },

  unarchive: async (id: string): Promise<TerminalActionResponse> => {
    const { data } = await apiClient.patch<ApiResponse<TerminalActionResponse>>(TERMINALS.UNARCHIVE(id));
    return { message: data.message };
  },
};

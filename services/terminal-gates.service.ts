import apiClient from "@/api/client";
import { TERMINAL_GATES } from "@/api/endpoints";
import type { ApiResponse } from "@/types/api.types";
import type {
  TerminalGate,
  TerminalGateActionResponse,
  TerminalGateDetail,
  TerminalGatePayload,
  TerminalGatesListParams,
  TerminalGatesListResponse,
} from "@/types/terminal-gates.types";

export const terminalGatesService = {
  list: async (params?: TerminalGatesListParams): Promise<TerminalGatesListResponse> => {
    const { data } = await apiClient.get<ApiResponse<TerminalGatesListResponse>>(
      TERMINAL_GATES.LIST,
      { params },
    );
    return data.data;
  },

  getById: async (id: string): Promise<TerminalGateDetail> => {
    const { data } = await apiClient.get<ApiResponse<TerminalGateDetail>>(TERMINAL_GATES.BY_ID(id));
    return data.data;
  },

  create: async (payload: TerminalGatePayload): Promise<TerminalGateActionResponse> => {
    const { data } = await apiClient.post<ApiResponse<TerminalGate>>(TERMINAL_GATES.LIST, payload);
    return { message: data.message, data: data.data };
  },

  update: async (id: string, payload: TerminalGatePayload): Promise<TerminalGateActionResponse> => {
    const { data } = await apiClient.put<ApiResponse<TerminalGate>>(TERMINAL_GATES.BY_ID(id), payload);
    return { message: data.message, data: data.data };
  },

  delete: async (id: string): Promise<TerminalGateActionResponse> => {
    const { data } = await apiClient.delete<ApiResponse<unknown>>(TERMINAL_GATES.BY_ID(id));
    return { message: data.message };
  },
};

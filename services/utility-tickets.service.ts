import apiClient from "@/api/client";
import { UTILITY_TICKETS } from "@/api/endpoints";
import type { ApiResponse } from "@/types/api.types";
import type {
  EditUtilityTicketPayload,
  GenerateUtilityTicketPayload,
  UtilityTicket,
  UtilityTicketActionResponse,
  UtilityTicketsListParams,
  UtilityTicketsListResponse,
  UtilityTicketsSummaryResponse,
} from "@/types/utility-tickets.types";

export const utilityTicketsService = {
  summary: async (): Promise<UtilityTicketsSummaryResponse> => {
    const { data } = await apiClient.get<ApiResponse<UtilityTicketsSummaryResponse>>(UTILITY_TICKETS.SUMMARY);
    return data.data;
  },

  list: async (params?: UtilityTicketsListParams): Promise<UtilityTicketsListResponse> => {
    const { data } = await apiClient.get<ApiResponse<UtilityTicketsListResponse>>(UTILITY_TICKETS.LIST, {
      params,
    });
    return data.data;
  },

  getById: async (id: string): Promise<UtilityTicket> => {
    const { data } = await apiClient.get<ApiResponse<UtilityTicket>>(UTILITY_TICKETS.BY_ID(id));
    return data.data;
  },

  generate: async (payload: GenerateUtilityTicketPayload): Promise<UtilityTicketActionResponse> => {
    const { data } = await apiClient.post<ApiResponse<UtilityTicket>>(UTILITY_TICKETS.GENERATE, payload);
    return { message: data.message, data: data.data };
  },

  edit: async (id: string, payload: EditUtilityTicketPayload): Promise<UtilityTicketActionResponse> => {
    const { data } = await apiClient.patch<ApiResponse<UtilityTicket>>(UTILITY_TICKETS.EDIT(id), payload);
    return { message: data.message, data: data.data };
  },

  approve: async (id: string): Promise<UtilityTicketActionResponse> => {
    const { data } = await apiClient.patch<ApiResponse<UtilityTicket>>(UTILITY_TICKETS.APPROVE(id));
    return { message: data.message, data: data.data };
  },

  cancel: async (id: string): Promise<UtilityTicketActionResponse> => {
    const { data } = await apiClient.patch<ApiResponse<UtilityTicket>>(UTILITY_TICKETS.CANCEL(id));
    return { message: data.message, data: data.data };
  },

  getETicket: async (id: string): Promise<UtilityTicket> => {
    const { data } = await apiClient.get<ApiResponse<UtilityTicket>>(UTILITY_TICKETS.E_TICKET(id));
    return data.data;
  },

  exportCsv: async (params?: UtilityTicketsListParams): Promise<void> => {
    const response = await apiClient.get(UTILITY_TICKETS.EXPORT, {
      params,
      responseType: "blob",
    });

    const blob = new Blob([response.data], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `utility-tickets-export-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};

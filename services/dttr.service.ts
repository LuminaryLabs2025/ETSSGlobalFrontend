import apiClient from "@/api/client";
import { DTTR } from "@/api/endpoints";
import type { ApiResponse } from "@/types/api.types";
import type {
  ConfigureModePayload,
  DTTREditAuditEntry,
  DTTRListParams,
  DTTRListResponse,
  DTTRSubmissionRecord,
  DTTRSummaryResponse,
  DTTRTerminalRequest,
  DTTRActionResponse,
  EditDttrPayload,
  SubmitDttrPayload,
} from "@/types/dttr.types";

export const dttrService = {
  summary: async (): Promise<DTTRSummaryResponse> => {
    const { data } = await apiClient.get<ApiResponse<DTTRSummaryResponse>>(DTTR.SUMMARY);
    return data.data;
  },

  list: async (params?: DTTRListParams): Promise<DTTRListResponse> => {
    const { data } = await apiClient.get<ApiResponse<DTTRListResponse>>(DTTR.LIST, {
      params,
    });
    return data.data;
  },

  editAudit: async (): Promise<DTTREditAuditEntry[]> => {
    const { data } = await apiClient.get<ApiResponse<DTTREditAuditEntry[]>>(DTTR.EDIT_AUDIT);
    return data.data;
  },

  getById: async (id: string): Promise<DTTRTerminalRequest> => {
    const { data } = await apiClient.get<ApiResponse<DTTRTerminalRequest>>(DTTR.BY_ID(id));
    return data.data;
  },

  submissions: async (id: string): Promise<DTTRSubmissionRecord[]> => {
    const { data } = await apiClient.get<ApiResponse<DTTRSubmissionRecord[]>>(DTTR.SUBMISSIONS(id));
    return data.data;
  },

  submit: async (id: string, payload: SubmitDttrPayload): Promise<DTTRActionResponse> => {
    const { data } = await apiClient.post<ApiResponse<DTTRActionResponse>>(DTTR.SUBMIT(id), payload);
    return { message: data.message };
  },

  edit: async (id: string, payload: EditDttrPayload): Promise<DTTRActionResponse> => {
    const { data } = await apiClient.patch<ApiResponse<DTTRActionResponse>>(DTTR.EDIT(id), payload);
    return { message: data.message };
  },

  configureMode: async (id: string, payload: ConfigureModePayload): Promise<DTTRActionResponse> => {
    const { data } = await apiClient.patch<ApiResponse<DTTRActionResponse>>(DTTR.CONFIGURE_MODE(id), payload);
    return { message: data.message };
  },
};

import apiClient from "@/api/client";
import { INCIDENTS } from "@/api/endpoints";
import {
  mapAssigneeCompany,
  mapAssigneeUser,
  mapIncidentReport,
  mapIncidentsSummary,
} from "@/lib/mappers/incidents.mapper";
import type { ApiResponse } from "@/types/api.types";
import type {
  IncidentActionResponse,
  IncidentApproveResolutionPayload,
  IncidentAssignPayload,
  IncidentAssigneeCompany,
  IncidentAssigneeUser,
  IncidentCommentPayload,
  IncidentDeadlinePayload,
  IncidentEmergencyResponsePayload,
  IncidentEscalatePayload,
  IncidentRejectPayload,
  IncidentReopenPayload,
  IncidentRequestEvidencePayload,
  IncidentResolvePayload,
  IncidentSeverityPayload,
  IncidentReport,
  IncidentsListParams,
  IncidentsListResponse,
  IncidentsSummaryResponse,
} from "@/types/incidents.types";

function cleanListParams(params?: IncidentsListParams) {
  if (!params) return undefined;
  const out: Record<string, string | number> = {};
  if (params.page) out.page = params.page;
  if (params.limit) out.limit = params.limit;
  if (params.search) out.search = params.search;
  if (params.type && params.type !== "All") out.type = params.type;
  if (params.severity && params.severity !== "All") out.severity = params.severity;
  if (params.status && params.status !== "All") out.status = params.status;
  if (params.location_kind && params.location_kind !== "All") {
    out.location_kind = params.location_kind;
  }
  return out;
}

function actionResponse(data: ApiResponse<Record<string, unknown>>): IncidentActionResponse {
  return {
    message: data.message,
    data: mapIncidentReport(data.data ?? {}),
  };
}

export const incidentsService = {
  list: async (params?: IncidentsListParams): Promise<IncidentsListResponse> => {
    const { data } = await apiClient.get<
      ApiResponse<{ data: Record<string, unknown>[]; meta: IncidentsListResponse["meta"] }>
    >(INCIDENTS.LIST, { params: cleanListParams(params) });

    const payload = data.data;
    const rows = Array.isArray(payload?.data) ? payload.data : [];
    return {
      data: rows.map((row) => mapIncidentReport(row as Record<string, unknown>)),
      meta: payload?.meta ?? {
        total: rows.length,
        page: params?.page ?? 1,
        limit: params?.limit ?? rows.length,
        total_pages: 1,
      },
    };
  },

  summary: async (): Promise<IncidentsSummaryResponse> => {
    const { data } = await apiClient.get<ApiResponse<Record<string, unknown>>>(
      INCIDENTS.SUMMARY,
    );
    return mapIncidentsSummary(data.data ?? {});
  },

  getById: async (id: string): Promise<IncidentReport> => {
    const { data } = await apiClient.get<ApiResponse<Record<string, unknown>>>(
      INCIDENTS.BY_ID(id),
    );
    return mapIncidentReport(data.data ?? {});
  },

  listAssigneeCompanies: async (): Promise<IncidentAssigneeCompany[]> => {
    const { data } = await apiClient.get<ApiResponse<Record<string, unknown>[]>>(
      INCIDENTS.ASSIGNEE_COMPANIES,
    );
    const rows = Array.isArray(data.data) ? data.data : [];
    return rows.map((row) => mapAssigneeCompany(row));
  },

  listAssigneeUsers: async (companyId: string): Promise<IncidentAssigneeUser[]> => {
    const { data } = await apiClient.get<ApiResponse<Record<string, unknown>[]>>(
      INCIDENTS.ASSIGNEE_USERS,
      { params: { company_id: companyId } },
    );
    const rows = Array.isArray(data.data) ? data.data : [];
    return rows.map((row) => mapAssigneeUser(row));
  },

  assign: async (id: string, payload: IncidentAssignPayload): Promise<IncidentActionResponse> => {
    const { data } = await apiClient.patch<ApiResponse<Record<string, unknown>>>(
      INCIDENTS.ASSIGN(id),
      payload,
    );
    return actionResponse(data);
  },

  setSeverity: async (
    id: string,
    payload: IncidentSeverityPayload,
  ): Promise<IncidentActionResponse> => {
    const { data } = await apiClient.patch<ApiResponse<Record<string, unknown>>>(
      INCIDENTS.SEVERITY(id),
      payload,
    );
    return actionResponse(data);
  },

  setDeadline: async (
    id: string,
    payload: IncidentDeadlinePayload,
  ): Promise<IncidentActionResponse> => {
    const { data } = await apiClient.patch<ApiResponse<Record<string, unknown>>>(
      INCIDENTS.DEADLINE(id),
      payload,
    );
    return actionResponse(data);
  },

  addComment: async (
    id: string,
    payload: IncidentCommentPayload,
  ): Promise<IncidentActionResponse> => {
    const { data } = await apiClient.post<ApiResponse<Record<string, unknown>>>(
      INCIDENTS.COMMENTS(id),
      payload,
    );
    return actionResponse(data);
  },

  escalate: async (
    id: string,
    payload: IncidentEscalatePayload,
  ): Promise<IncidentActionResponse> => {
    const { data } = await apiClient.post<ApiResponse<Record<string, unknown>>>(
      INCIDENTS.ESCALATE(id),
      payload,
    );
    return actionResponse(data);
  },

  requestEvidence: async (
    id: string,
    payload: IncidentRequestEvidencePayload,
  ): Promise<IncidentActionResponse> => {
    const { data } = await apiClient.post<ApiResponse<Record<string, unknown>>>(
      INCIDENTS.REQUEST_EVIDENCE(id),
      payload,
    );
    return actionResponse(data);
  },

  emergencyResponse: async (
    id: string,
    payload: IncidentEmergencyResponsePayload,
  ): Promise<IncidentActionResponse> => {
    const { data } = await apiClient.post<ApiResponse<Record<string, unknown>>>(
      INCIDENTS.EMERGENCY_RESPONSE(id),
      payload,
    );
    return actionResponse(data);
  },

  approveResolution: async (
    id: string,
    payload?: IncidentApproveResolutionPayload,
  ): Promise<IncidentActionResponse> => {
    const { data } = await apiClient.patch<ApiResponse<Record<string, unknown>>>(
      INCIDENTS.APPROVE_RESOLUTION(id),
      payload ?? {},
    );
    return actionResponse(data);
  },

  rejectResolution: async (
    id: string,
    payload: IncidentRejectPayload,
  ): Promise<IncidentActionResponse> => {
    const { data } = await apiClient.patch<ApiResponse<Record<string, unknown>>>(
      INCIDENTS.REJECT_RESOLUTION(id),
      payload,
    );
    return actionResponse(data);
  },

  resolve: async (id: string, payload: IncidentResolvePayload): Promise<IncidentActionResponse> => {
    const { data } = await apiClient.patch<ApiResponse<Record<string, unknown>>>(
      INCIDENTS.RESOLVE(id),
      payload,
    );
    return actionResponse(data);
  },

  reopen: async (id: string, payload: IncidentReopenPayload): Promise<IncidentActionResponse> => {
    const { data } = await apiClient.patch<ApiResponse<Record<string, unknown>>>(
      INCIDENTS.REOPEN(id),
      payload,
    );
    return actionResponse(data);
  },
};

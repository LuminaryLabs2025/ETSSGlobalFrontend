import apiClient from "@/api/client";
import { INCIDENTS } from "@/api/endpoints";
import { mapIncidentReport, mapIncidentsSummary } from "@/lib/mappers/incidents.mapper";
import type { ApiResponse } from "@/types/api.types";
import type {
  IncidentActionResponse,
  IncidentRejectPayload,
  IncidentReport,
  IncidentsListParams,
  IncidentsListResponse,
  IncidentsSummaryResponse,
  UpdateIncidentPayload,
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

  update: async (id: string, payload: UpdateIncidentPayload): Promise<IncidentActionResponse> => {
    const { data } = await apiClient.patch<ApiResponse<Record<string, unknown>>>(
      INCIDENTS.UPDATE(id),
      payload,
    );
    return {
      message: data.message,
      data: mapIncidentReport(data.data ?? {}),
    };
  },

  approveClose: async (id: string): Promise<IncidentActionResponse> => {
    const { data } = await apiClient.post<ApiResponse<Record<string, unknown>>>(
      INCIDENTS.APPROVE_CLOSE(id),
    );
    return {
      message: data.message,
      data: mapIncidentReport(data.data ?? {}),
    };
  },

  rejectResolution: async (
    id: string,
    payload: IncidentRejectPayload,
  ): Promise<IncidentActionResponse> => {
    const { data } = await apiClient.post<ApiResponse<Record<string, unknown>>>(
      INCIDENTS.REJECT_RESOLUTION(id),
      payload,
    );
    return {
      message: data.message,
      data: mapIncidentReport(data.data ?? {}),
    };
  },

  escalate: async (id: string): Promise<IncidentActionResponse> => {
    const { data } = await apiClient.post<ApiResponse<Record<string, unknown>>>(
      INCIDENTS.ESCALATE(id),
    );
    return {
      message: data.message,
      data: mapIncidentReport(data.data ?? {}),
    };
  },
};

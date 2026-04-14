import apiClient from "@/api/client";
import { TEAM } from "@/api/endpoints";
import type {
  TeamListParams,
  TeamListResponse,
  TeamSummaryResponse,
  TeamActionResponse,
  CreateTeamMemberPayload,
} from "@/types/team.types";

export const teamService = {
  list: async (params?: TeamListParams): Promise<TeamListResponse> => {
    const { data } = await apiClient.get<TeamListResponse>(TEAM.LIST, {
      params,
    });
    return data;
  },

  create: async (payload: CreateTeamMemberPayload): Promise<TeamActionResponse> => {
    const { data } = await apiClient.post<TeamActionResponse>(TEAM.CREATE, payload);
    return data;
  },

  summary: async (): Promise<TeamSummaryResponse> => {
    const { data } = await apiClient.get<TeamSummaryResponse>(TEAM.SUMMARY);
    return data;
  },

  disable: async (id: string): Promise<TeamActionResponse> => {
    const { data } = await apiClient.patch<TeamActionResponse>(TEAM.DISABLE(id));
    return data;
  },

  enable: async (id: string): Promise<TeamActionResponse> => {
    const { data } = await apiClient.patch<TeamActionResponse>(TEAM.ENABLE(id));
    return data;
  },

  archive: async (id: string): Promise<TeamActionResponse> => {
    const { data } = await apiClient.patch<TeamActionResponse>(TEAM.ARCHIVE(id));
    return data;
  },

  resendInvite: async (id: string): Promise<TeamActionResponse> => {
    const { data } = await apiClient.post<TeamActionResponse>(TEAM.RESEND_INVITE(id));
    return data;
  },
};

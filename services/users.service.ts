import apiClient from "@/api/client";
import { USERS } from "@/api/endpoints";
import type {
  UsersListParams,
  UsersListResponse,
  UsersSummaryParams,
  UsersSummaryResponse,
  UserActionResponse,
  CreateUserPayload,
  UserDetail,
} from "@/types/users.types";

export const usersService = {
  list: async (params?: UsersListParams): Promise<UsersListResponse> => {
    const { data } = await apiClient.get<UsersListResponse>(USERS.LIST, {
      params,
    });
    return data;
  },

  create: async (payload: CreateUserPayload): Promise<UserActionResponse> => {
    const { data } = await apiClient.post<UserActionResponse>(USERS.CREATE, payload);
    return data;
  },

  summary: async (params?: UsersSummaryParams): Promise<UsersSummaryResponse> => {
    const { data } = await apiClient.get<UsersSummaryResponse>(USERS.SUMMARY, { params });
    return data;
  },

  getById: async (id: string): Promise<UserDetail> => {
    const { data } = await apiClient.get<UserDetail>(USERS.BY_ID(id));
    return data;
  },

  disable: async (id: string): Promise<UserActionResponse> => {
    const { data } = await apiClient.patch<UserActionResponse>(USERS.DISABLE(id));
    return data;
  },

  enable: async (id: string): Promise<UserActionResponse> => {
    const { data } = await apiClient.patch<UserActionResponse>(USERS.ENABLE(id));
    return data;
  },

  archive: async (id: string): Promise<UserActionResponse> => {
    const { data } = await apiClient.patch<UserActionResponse>(USERS.ARCHIVE(id));
    return data;
  },

  resendInvite: async (id: string): Promise<UserActionResponse> => {
    const { data } = await apiClient.post<UserActionResponse>(USERS.RESEND_INVITE(id));
    return data;
  },
};

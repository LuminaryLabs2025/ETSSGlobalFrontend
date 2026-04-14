import apiClient from "@/api/client";
import { USERS } from "@/api/endpoints";
import type {
  UsersListParams,
  UsersListResponse,
  UsersSummaryResponse,
  UserActionResponse,
  CreateUserPayload,
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

  summary: async (): Promise<UsersSummaryResponse> => {
    const { data } = await apiClient.get<UsersSummaryResponse>(USERS.SUMMARY);
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

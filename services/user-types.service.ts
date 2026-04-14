import apiClient from "@/api/client";
import { USER_TYPES } from "@/api/endpoints";
import type { UserType, UserTypesListParams } from "@/types/user-types.types";

export const userTypesService = {
  list: async (params?: UserTypesListParams): Promise<UserType[]> => {
    const { data } = await apiClient.get<UserType[]>(USER_TYPES.LIST, {
      params,
    });
    return data;
  },
};

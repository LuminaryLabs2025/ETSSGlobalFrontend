import apiClient from "@/api/client";
import { INFRACTION_CATEGORIES } from "@/api/endpoints";
import type { ApiResponse } from "@/types/api.types";
import type {
  InfractionCategory,
  InfractionCategoryActionResponse,
  InfractionCategoryDetail,
  InfractionCategoryPayload,
  InfractionCategoriesListParams,
  InfractionCategoriesListResponse,
} from "@/types/infraction-categories.types";

export const infractionCategoriesService = {
  list: async (
    params?: InfractionCategoriesListParams,
  ): Promise<InfractionCategoriesListResponse> => {
    const { data } = await apiClient.get<ApiResponse<InfractionCategoriesListResponse>>(
      INFRACTION_CATEGORIES.LIST,
      { params },
    );
    return data.data;
  },

  getById: async (id: string): Promise<InfractionCategoryDetail> => {
    const { data } = await apiClient.get<ApiResponse<InfractionCategoryDetail>>(
      INFRACTION_CATEGORIES.BY_ID(id),
    );
    return data.data;
  },

  create: async (payload: InfractionCategoryPayload): Promise<InfractionCategoryActionResponse> => {
    const { data } = await apiClient.post<ApiResponse<InfractionCategory>>(
      INFRACTION_CATEGORIES.LIST,
      payload,
    );
    return { message: data.message, data: data.data };
  },

  update: async (
    id: string,
    payload: InfractionCategoryPayload,
  ): Promise<InfractionCategoryActionResponse> => {
    const { data } = await apiClient.put<ApiResponse<InfractionCategory>>(
      INFRACTION_CATEGORIES.BY_ID(id),
      payload,
    );
    return { message: data.message, data: data.data };
  },

  delete: async (id: string): Promise<InfractionCategoryActionResponse> => {
    const { data } = await apiClient.delete<ApiResponse<unknown>>(INFRACTION_CATEGORIES.BY_ID(id));
    return { message: data.message };
  },
};

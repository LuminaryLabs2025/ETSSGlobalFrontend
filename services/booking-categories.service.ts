import apiClient from "@/api/client";
import { BOOKING_CATEGORIES } from "@/api/endpoints";
import type { ApiResponse } from "@/types/api.types";
import type {
  BookingCategory,
  BookingCategoryActionResponse,
  BookingCategoryDetail,
  BookingCategoryPayload,
  BookingCategoriesListParams,
  BookingCategoriesListResponse,
} from "@/types/booking-categories.types";

export const bookingCategoriesService = {
  list: async (params?: BookingCategoriesListParams): Promise<BookingCategoriesListResponse> => {
    const { data } = await apiClient.get<ApiResponse<BookingCategoriesListResponse>>(
      BOOKING_CATEGORIES.LIST,
      { params },
    );
    return data.data;
  },

  getById: async (id: string): Promise<BookingCategoryDetail> => {
    const { data } = await apiClient.get<ApiResponse<BookingCategoryDetail>>(
      BOOKING_CATEGORIES.BY_ID(id),
    );
    return data.data;
  },

  create: async (payload: BookingCategoryPayload): Promise<BookingCategoryActionResponse> => {
    const { data } = await apiClient.post<ApiResponse<BookingCategory>>(
      BOOKING_CATEGORIES.LIST,
      payload,
    );
    return { message: data.message, data: data.data };
  },

  update: async (
    id: string,
    payload: BookingCategoryPayload,
  ): Promise<BookingCategoryActionResponse> => {
    const { data } = await apiClient.put<ApiResponse<BookingCategory>>(
      BOOKING_CATEGORIES.BY_ID(id),
      payload,
    );
    return { message: data.message, data: data.data };
  },

  delete: async (id: string): Promise<BookingCategoryActionResponse> => {
    const { data } = await apiClient.delete<ApiResponse<unknown>>(BOOKING_CATEGORIES.BY_ID(id));
    return { message: data.message };
  },
};

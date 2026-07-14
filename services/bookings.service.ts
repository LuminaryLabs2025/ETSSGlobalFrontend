import apiClient from "@/api/client";
import { BOOKINGS } from "@/api/endpoints";
import type { ApiResponse } from "@/types/api.types";
import type {
  Booking,
  BookingActionResponse,
  BookingsListParams,
  BookingsListResponse,
  BookingsManifestParams,
  BookingsManifestResponse,
  BookingsSummaryResponse,
} from "@/types/bookings.types";

export const bookingsService = {
  summary: async (): Promise<BookingsSummaryResponse> => {
    const { data } = await apiClient.get<ApiResponse<BookingsSummaryResponse>>(BOOKINGS.SUMMARY);
    return data.data;
  },

  list: async (params?: BookingsListParams): Promise<BookingsListResponse> => {
    const { data } = await apiClient.get<ApiResponse<BookingsListResponse>>(BOOKINGS.LIST, {
      params,
    });
    return data.data;
  },

  manifest: async (params?: BookingsManifestParams): Promise<BookingsManifestResponse> => {
    const { data } = await apiClient.get<ApiResponse<BookingsManifestResponse>>(BOOKINGS.MANIFEST, {
      params,
    });
    return data.data;
  },

  getById: async (id: string): Promise<Booking> => {
    const { data } = await apiClient.get<ApiResponse<Booking>>(BOOKINGS.BY_ID(id));
    return data.data;
  },

  removeFromManifest: async (id: string): Promise<BookingActionResponse> => {
    const { data } = await apiClient.patch<ApiResponse<Booking>>(BOOKINGS.REMOVE_FROM_MANIFEST(id));
    return { message: data.message, data: data.data };
  },

  addToManifest: async (id: string): Promise<BookingActionResponse> => {
    const { data } = await apiClient.patch<ApiResponse<Booking>>(BOOKINGS.ADD_TO_MANIFEST(id));
    return { message: data.message, data: data.data };
  },

  cancel: async (id: string): Promise<BookingActionResponse> => {
    const { data } = await apiClient.patch<ApiResponse<Booking>>(BOOKINGS.CANCEL(id));
    return { message: data.message, data: data.data };
  },

  exportCsv: async (params?: BookingsListParams): Promise<void> => {
    const response = await apiClient.get(BOOKINGS.EXPORT, {
      params,
      responseType: "blob",
    });

    const blob = new Blob([response.data], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `bookings-export-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};

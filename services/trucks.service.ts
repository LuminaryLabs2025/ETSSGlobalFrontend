import apiClient from "@/api/client";
import { TRUCKS } from "@/api/endpoints";
import type { ApiResponse } from "@/types/api.types";
import type { BookingOptionsParams, BookingOptionsResponse } from "@/types/booking-creation.types";
import type {
  TrucksListParams,
  TrucksListResponse,
  TrucksSummaryResponse,
  TruckActionResponse,
  Truck,
  TruckReasonPayload,
  CreateTruckPayload,
  BulkCreateTrucksPayload,
} from "@/types/trucks.types";

export const trucksService = {
  list: async (params?: TrucksListParams): Promise<TrucksListResponse> => {
    const { data } = await apiClient.get<ApiResponse<TrucksListResponse>>(TRUCKS.LIST, {
      params,
    });
    return data.data;
  },

  summary: async (): Promise<TrucksSummaryResponse> => {
    const { data } = await apiClient.get<ApiResponse<TrucksSummaryResponse>>(TRUCKS.SUMMARY);
    return data.data;
  },

  getById: async (id: string): Promise<Truck> => {
    const { data } = await apiClient.get<ApiResponse<Truck>>(TRUCKS.BY_ID(id));
    return data.data;
  },

  create: async (payload: CreateTruckPayload): Promise<TruckActionResponse> => {
    const { data } = await apiClient.post<ApiResponse<TruckActionResponse>>(TRUCKS.CREATE, payload);
    return { message: data.message };
  },

  bulkCreate: async (payload: BulkCreateTrucksPayload): Promise<TruckActionResponse> => {
    const { data } = await apiClient.post<ApiResponse<TruckActionResponse>>(TRUCKS.BULK, payload);
    return { message: data.message };
  },

  disable: async (id: string, payload: TruckReasonPayload): Promise<TruckActionResponse> => {
    const { data } = await apiClient.patch<ApiResponse<TruckActionResponse>>(TRUCKS.DISABLE(id), payload);
    return { message: data.message };
  },

  archive: async (id: string): Promise<TruckActionResponse> => {
    const { data } = await apiClient.patch<ApiResponse<TruckActionResponse>>(TRUCKS.ARCHIVE(id));
    return { message: data.message };
  },

  reEnable: async (id: string, payload: TruckReasonPayload): Promise<TruckActionResponse> => {
    const { data } = await apiClient.patch<ApiResponse<TruckActionResponse>>(TRUCKS.RE_ENABLE(id), payload);
    return { message: data.message };
  },

  overridePenalty: async (id: string, payload: TruckReasonPayload): Promise<TruckActionResponse> => {
    const { data } = await apiClient.patch<ApiResponse<TruckActionResponse>>(TRUCKS.OVERRIDE_PENALTY(id), payload);
    return { message: data.message };
  },

  requestVerification: async (id: string): Promise<TruckActionResponse> => {
    const { data } = await apiClient.patch<ApiResponse<TruckActionResponse>>(TRUCKS.REQUEST_VERIFICATION(id));
    return { message: data.message };
  },

  bookingOptions: async (params?: BookingOptionsParams): Promise<BookingOptionsResponse> => {
    const { data } = await apiClient.get<ApiResponse<BookingOptionsResponse>>(
      TRUCKS.BOOKING_OPTIONS,
      { params },
    );
    return data.data;
  },

  exportCsv: async (params?: TrucksListParams): Promise<void> => {
    const response = await apiClient.get(TRUCKS.EXPORT, {
      params,
      responseType: "blob",
    });

    const blob = new Blob([response.data], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `trucks-export-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};

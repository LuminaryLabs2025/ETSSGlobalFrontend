import apiClient from "@/api/client";
import { RFID_TAGS } from "@/api/endpoints";
import type { ApiResponse } from "@/types/api.types";
import type {
  RfidTag,
  RfidTagActionResponse,
  RfidTagBulkUploadResponse,
  RfidTagCreatePayload,
  RfidTagDetail,
  RfidTagUpdatePayload,
  RfidTagsListParams,
  RfidTagsListResponse,
} from "@/types/rfid-tags.types";

export const rfidTagsService = {
  list: async (params?: RfidTagsListParams): Promise<RfidTagsListResponse> => {
    const { data } = await apiClient.get<ApiResponse<RfidTagsListResponse>>(RFID_TAGS.LIST, {
      params,
    });
    return data.data;
  },

  getById: async (id: string): Promise<RfidTagDetail> => {
    const { data } = await apiClient.get<ApiResponse<RfidTagDetail>>(RFID_TAGS.BY_ID(id));
    return data.data;
  },

  create: async (payload: RfidTagCreatePayload): Promise<RfidTagActionResponse> => {
    const { data } = await apiClient.post<ApiResponse<RfidTag>>(RFID_TAGS.LIST, payload);
    return { message: data.message, data: data.data };
  },

  update: async (id: string, payload: RfidTagUpdatePayload): Promise<RfidTagActionResponse> => {
    const { data } = await apiClient.put<ApiResponse<RfidTag>>(RFID_TAGS.BY_ID(id), payload);
    return { message: data.message, data: data.data };
  },

  delete: async (id: string): Promise<RfidTagActionResponse> => {
    const { data } = await apiClient.delete<ApiResponse<unknown>>(RFID_TAGS.BY_ID(id));
    return { message: data.message };
  },

  bulkUpload: async (file: File): Promise<RfidTagBulkUploadResponse> => {
    const formData = new FormData();
    formData.append("file", file);

    const { data } = await apiClient.post<ApiResponse<RfidTagBulkUploadResponse["data"]>>(
      RFID_TAGS.BULK_UPLOAD,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );

    return { message: data.message, data: data.data ?? undefined };
  },
};

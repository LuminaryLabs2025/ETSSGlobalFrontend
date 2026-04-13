import apiClient from "@/api/client";
import { ACTIVITY_LOG } from "@/api/endpoints";
import type {
  ActivityLogListParams,
  ActivityLogListResponse,
  ActivityLogSummaryResponse,
  ActivityLogDetail,
} from "@/types/activity-log.types";

export const activityLogService = {
  list: async (params?: ActivityLogListParams): Promise<ActivityLogListResponse> => {
    const { data } = await apiClient.get<ActivityLogListResponse>(ACTIVITY_LOG.LIST, {
      params,
    });
    return data;
  },

  summary: async (): Promise<ActivityLogSummaryResponse> => {
    const { data } = await apiClient.get<ActivityLogSummaryResponse>(ACTIVITY_LOG.SUMMARY);
    return data;
  },

  getById: async (id: string): Promise<ActivityLogDetail> => {
    const { data } = await apiClient.get<ActivityLogDetail>(ACTIVITY_LOG.BY_ID(id));
    return data;
  },
};

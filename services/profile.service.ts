import apiClient from "@/api/client";
import { PROFILE } from "@/api/endpoints";
import type {
  ProfileResponse,
  UpdateProfileRequest,
  ChangePasswordRequest,
  UpdateNotificationsRequest,
} from "@/types/profile.types";

export const profileService = {
  get: async (): Promise<ProfileResponse> => {
    const { data } = await apiClient.get<ProfileResponse>(PROFILE.GET);
    return data;
  },

  update: async (payload: UpdateProfileRequest): Promise<void> => {
    await apiClient.patch(PROFILE.UPDATE, payload);
  },

  changePassword: async (payload: ChangePasswordRequest): Promise<void> => {
    await apiClient.post(PROFILE.CHANGE_PASSWORD, payload);
  },

  updateNotifications: async (
    payload: UpdateNotificationsRequest
  ): Promise<void> => {
    await apiClient.patch(PROFILE.NOTIFICATIONS, payload);
  },
};

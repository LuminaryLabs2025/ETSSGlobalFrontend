import apiClient from "@/api/client";
import { PROFILE } from "@/api/endpoints";
import type {
  ProfileResponse,
  UpdateProfileRequest,
  ChangePasswordRequest,
  UpdateNotificationsRequest,
  TwoFactorSetupResponse,
  TwoFactorVerifyRequest,
  TwoFactorMethodRequest,
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

  setup2FA: async (): Promise<TwoFactorSetupResponse> => {
    const { data } = await apiClient.post<TwoFactorSetupResponse>(
      PROFILE.TWO_FACTOR_SETUP
    );
    return data;
  },

  verify2FA: async (payload: TwoFactorVerifyRequest): Promise<void> => {
    await apiClient.post(PROFILE.TWO_FACTOR_VERIFY, payload);
  },

  change2FAMethod: async (payload: TwoFactorMethodRequest): Promise<void> => {
    await apiClient.patch(PROFILE.TWO_FACTOR_METHOD, payload);
  },
};

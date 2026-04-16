import apiClient from "@/api/client";
import { AUTH } from "@/api/endpoints";
import type {
  LoginRequest,
  LoginResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  JoinTeamRequest,
  Verify2FARequest,
  Verify2FAResponse,
} from "@/types/auth.types";

export const authService = {
  login: async (payload: LoginRequest): Promise<LoginResponse> => {
    const { data } = await apiClient.post<LoginResponse>(
      AUTH.LOGIN,
      payload
    );
    return data;
  },

  verify2FA: async (
    payload: Verify2FARequest
  ): Promise<Verify2FAResponse> => {
    const { data } = await apiClient.post<Verify2FAResponse>(
      AUTH.VERIFY_2FA,
      payload
    );
    return data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post(AUTH.LOGOUT);
  },

  forgotPassword: async (
    payload: ForgotPasswordRequest
  ): Promise<void> => {
    await apiClient.post(AUTH.FORGOT_PASSWORD, payload);
  },

  resetPassword: async (
    payload: ResetPasswordRequest
  ): Promise<void> => {
    await apiClient.post(AUTH.RESET_PASSWORD, payload);
  },

  joinTeam: async (payload: JoinTeamRequest): Promise<void> => {
    await apiClient.post(AUTH.JOIN_TEAM, payload);
  },
};

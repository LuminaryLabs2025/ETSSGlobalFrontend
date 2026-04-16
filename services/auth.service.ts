import apiClient from "@/api/client";
import { AUTH } from "@/api/endpoints";
import type {
  LoginRequest,
  LoginResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  JoinTeamRequest,
  VerifyOtpRequest,
  VerifyOtpResponse,
  ResendOtpRequest,
  ResendOtpResponse,
} from "@/types/auth.types";

export const authService = {
  login: async (payload: LoginRequest): Promise<LoginResponse> => {
    const { data } = await apiClient.post<LoginResponse>(
      AUTH.LOGIN,
      payload
    );
    return data;
  },

  verifyOtp: async (
    payload: VerifyOtpRequest
  ): Promise<VerifyOtpResponse> => {
    const { data } = await apiClient.post<VerifyOtpResponse>(
      AUTH.VERIFY_OTP,
      payload
    );
    return data;
  },

  resendOtp: async (payload: ResendOtpRequest): Promise<ResendOtpResponse> => {
    const { data } = await apiClient.post<ResendOtpResponse>(
      AUTH.RESEND_OTP,
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

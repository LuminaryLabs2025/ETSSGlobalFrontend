// ─── Login ───
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

// ─── User (auth context) ───
export interface UserType {
  id: string;
  name: string;
}

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  is_super_admin: boolean;
  account_type: string;
  two_factor_enabled: boolean;
  status: string;
  user_type: UserType;
  company_id: string | null;
  permissions: string[];
  created_at: string;
}

// ─── Forgot Password ───
export interface ForgotPasswordRequest {
  email: string;
}

// ─── Reset Password ───
export interface ResetPasswordRequest {
  email: string;
  token: string;
  newPassword: string;
}

// ─── Join Team (Invite Sign-Up) ───
export interface JoinTeamRequest {
  email: string;
  token: string;
  newPassword: string;
}

// ─── Two Factor Authentication ───
export type OtpMethod = "email" | "sms" | "authenticator";

export interface VerifyOtpRequest {
  otp: string;
  method: OtpMethod;
}

export interface VerifyOtpResponse {
  access_token: string;
  user: User;
}

export interface ResendOtpRequest {
  method: OtpMethod;
}

export interface ResendOtpResponse {
  message: string;
}

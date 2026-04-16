// ─── Login ───
export interface LoginRequest {
  email: string;
  password: string;
}

export type TwoFactorMethod = "EMAIL" | "SMS" | "AUTHENTICATOR";

export interface LoginResponse {
  temporary_token: string;
  message: string;
  two_factor_method: TwoFactorMethod;
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
export interface Verify2FARequest {
  temporary_token: string;
  code: string;
}

export interface Verify2FAResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

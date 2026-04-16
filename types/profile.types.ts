// ─── Profile Response ───
export interface ProfileResponse {
  personalInformation: {
    fullName: string;
    email: string;
    role: string;
    company: string;
    accountType: string;
    accountStatus: string;
    address: string | null;
  };
  securityAudit: {
    passwordLastChanged: string | null;
    twoFactorAuthentication: boolean;
    twoFactorMethod: "EMAIL" | "SMS" | "AUTHENTICATOR" | null;
    accountCreated: string;
  };
  notifications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    updatedAt: string;
  };
}

// ─── Update Profile ───
export interface UpdateProfileRequest {
  name: string;
  address: string;
}

// ─── Change Password ───
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// ─── Update Notifications ───
export interface UpdateNotificationsRequest {
  emailNotifications: boolean;
  smsNotifications: boolean;
}

// ─── Two-Factor Authentication ───
export interface TwoFactorSetupResponse {
  qrCode: string;
  secret: string;
}

export interface TwoFactorVerifyRequest {
  token: string;
}

export interface TwoFactorMethodRequest {
  method: "EMAIL" | "AUTHENTICATOR";
}

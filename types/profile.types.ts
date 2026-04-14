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

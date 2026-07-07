// ─── Auth ───
export const AUTH = {
  LOGIN: "/auth/login",
  LOGOUT: "/auth/logout",
  FORGOT_PASSWORD: "/auth/forgot-password",
  RESET_PASSWORD: "/auth/reset-password",
  REFRESH_TOKEN: "/auth/refresh-token",
  JOIN_TEAM: "/auth/join-invite/complete", // For accepting team invites
  VERIFY_2FA: "/auth/login/verify-2fa",
} as const;

// ─── Users ───
export const USERS = {
  LIST: "/users",
  CREATE: "/users",
  SUMMARY: "/users/summary",
  BY_ID: (id: string) => `/users/${id}`,
  DISABLE: (id: string) => `/users/${id}/disable`,
  ENABLE: (id: string) => `/users/${id}/enable`,
  ARCHIVE: (id: string) => `/users/${id}/archive`,
  RESEND_INVITE: (id: string) => `/users/${id}/resend-invite`,
} as const;

// ─── Team ───
export const TEAM = {
  LIST: "/team-members",
  CREATE: "/team-members",
  BY_ID: (id: string) => `/team-members/${id}`,
  SUMMARY: "/team-members/summary",
  DISABLE: (id: string) => `/team-members/${id}/disable`,
  ENABLE: (id: string) => `/team-members/${id}/enable`,
  ARCHIVE: (id: string) => `/team-members/${id}/archive`,
  RESEND_INVITE: (id: string) => `/team-members/${id}/resend-invite`,
} as const;

// ─── Bookings ───
export const BOOKINGS = {
  LIST: "/bookings",
  BY_ID: (id: string) => `/bookings/${id}`,
} as const;

// ─── Profile ───
export const PROFILE = {
  GET: "/profile",
  UPDATE: "/profile",
  CHANGE_PASSWORD: "/profile/change-password",
  NOTIFICATIONS: "/profile/notifications",
  TWO_FACTOR_SETUP: "/profile/2fa/setup",
  TWO_FACTOR_VERIFY: "/profile/2fa/verify",
  TWO_FACTOR_METHOD: "/profile/2fa/method",
} as const;

// ─── User Types ───
export const USER_TYPES = {
  LIST: "/user-types",
} as const;

// ─── Permissions ───
export const PERMISSIONS = {
  MODULES: "/roles-permissions/permission-modules",
} as const;

// ─── Terminals ───
export const TERMINALS = {
  LIST: "/terminals",
  SUMMARY: "/terminals/summary",
  BY_ID: (id: string) => `/terminals/${id}`,
  ENABLE: (id: string) => `/terminals/${id}/enable`,
  DISABLE: (id: string) => `/terminals/${id}/disable`,
  ARCHIVE: (id: string) => `/terminals/${id}/archive`,
  UNARCHIVE: (id: string) => `/terminals/${id}/unarchive`,
} as const;

// ─── Activity Log ───
export const ACTIVITY_LOG = {
  LIST: "/activity-logs",
  SUMMARY: "/activity-logs/summary",
  BY_ID: (id: string) => `/activity-logs/${id}`,
  EXPORT: "/activity-logs/export",
} as const;

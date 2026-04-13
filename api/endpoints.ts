// ─── Auth ───
export const AUTH = {
  LOGIN: "/auth/login",
  LOGOUT: "/auth/logout",
  FORGOT_PASSWORD: "/auth/forgot-password",
  RESET_PASSWORD: "/auth/reset-password",
  REFRESH_TOKEN: "/auth/refresh-token",
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
  LIST: "/team",
  INVITE: "/team/invite",
  BY_ID: (id: string) => `/team/${id}`,
} as const;

// ─── Bookings ───
export const BOOKINGS = {
  LIST: "/bookings",
  BY_ID: (id: string) => `/bookings/${id}`,
} as const;

// ─── Activity Log ───
export const ACTIVITY_LOG = {
  LIST: "/activity-log",
} as const;

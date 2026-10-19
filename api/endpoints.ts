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

// ─── Companies ───
export const COMPANIES = {
  LIST: "/companies",
  BY_ID: (id: string) => `/companies/${id}`,
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
  SUMMARY: "/bookings/summary",
  EXPORT: "/bookings/export",
  MANIFEST: "/bookings/manifest",
  BY_ID: (id: string) => `/bookings/${id}`,
  REMOVE_FROM_MANIFEST: (id: string) => `/bookings/${id}/remove-from-manifest`,
  ADD_TO_MANIFEST: (id: string) => `/bookings/${id}/add-to-manifest`,
  CANCEL: (id: string) => `/bookings/${id}/cancel`,
  PREVIEW: (type: string) => `/bookings/${type}/preview`,
  CREATE: (type: string) => `/bookings/${type}`,
  MARK_IN_FACILITY: (id: string) => `/bookings/${id}/mark-in-facility`,
  MARK_IN_PREGATE: (id: string) => `/bookings/${id}/mark-in-pregate`,
  MARK_MATCHED: (id: string) => `/bookings/${id}/mark-matched`,
  MARK_GTG_FACILITY: (id: string) => `/bookings/${id}/mark-gtg-facility`,
  MARK_GTG_PREGATE: (id: string) => `/bookings/${id}/mark-gtg-pregate`,
  QUEUE_FACILITY: "/bookings/queue/facility",
  QUEUE_PREGATE: "/bookings/queue/pregate",
} as const;

// ─── Utility Tickets ───
export const UTILITY_TICKETS = {
  LIST: "/utility-tickets",
  SUMMARY: "/utility-tickets/summary",
  EXPORT: "/utility-tickets/export",
  GENERATE: "/utility-tickets/generate",
  BY_ID: (id: string) => `/utility-tickets/${id}`,
  EDIT: (id: string) => `/utility-tickets/${id}`,
  APPROVE: (id: string) => `/utility-tickets/${id}/approve`,
  CANCEL: (id: string) => `/utility-tickets/${id}/cancel`,
  E_TICKET: (id: string) => `/utility-tickets/${id}/e-ticket`,
} as const;

// ─── Penalties ───
export const PENALTIES = {
  LIST: "/penalties",
  SUMMARY: "/penalties/summary",
  EXPORT: "/penalties/export",
  CREATE: "/penalties",
  BY_ID: (id: string) => `/penalties/${id}`,
  EDIT: (id: string) => `/penalties/${id}`,
  ARCHIVE: (id: string) => `/penalties/${id}/archive`,
} as const;

// ─── Issued Fines ───
export const ISSUED_FINES = {
  LIST: "/issued-fines",
  SUMMARY: "/issued-fines/summary",
  EXPORT: "/issued-fines/export",
  BY_ID: (id: string) => `/issued-fines/${id}`,
} as const;

// ─── Fine Disputes ───
export const DISPUTES = {
  LIST: "/disputes",
  SUMMARY: "/disputes/summary",
  EXPORT: "/disputes/export",
  BY_ID: (id: string) => `/disputes/${id}`,
  RESOLVE: (id: string) => `/disputes/${id}/resolve`,
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

// ─── Transit Parks ───
export const TRANSIT_PARKS = {
  LIST: "/transit-parks",
  SUMMARY: "/transit-parks/summary",
  BY_ID: (id: string) => `/transit-parks/${id}`,
  ENABLE: (id: string) => `/transit-parks/${id}/enable`,
  DISABLE: (id: string) => `/transit-parks/${id}/disable`,
  ARCHIVE: (id: string) => `/transit-parks/${id}/archive`,
  UNARCHIVE: (id: string) => `/transit-parks/${id}/unarchive`,
  STATUS: (id: string) => `/transit-parks/${id}/status`,
} as const;

// ─── Facilities ───
export const FACILITIES = {
  LIST: "/facilities",
  SUMMARY: "/facilities/summary",
  BY_ID: (id: string) => `/facilities/${id}`,
  ENABLE: (id: string) => `/facilities/${id}/enable`,
  DISABLE: (id: string) => `/facilities/${id}/disable`,
  ARCHIVE: (id: string) => `/facilities/${id}/archive`,
  UNARCHIVE: (id: string) => `/facilities/${id}/unarchive`,
  STATUS: (id: string) => `/facilities/${id}/status`,
  TIMESLOTS: (id: string) => `/facilities/${id}/timeslots`,
} as const;

// ─── Trucks ───
export const TRUCKS = {
  LIST: "/trucks",
  SUMMARY: "/trucks/summary",
  EXPORT: "/trucks/export",
  CREATE: "/trucks",
  BULK: "/trucks/bulk",
  BY_ID: (id: string) => `/trucks/${id}`,
  DISABLE: (id: string) => `/trucks/${id}/disable`,
  ARCHIVE: (id: string) => `/trucks/${id}/archive`,
  RE_ENABLE: (id: string) => `/trucks/${id}/re-enable`,
  OVERRIDE_PENALTY: (id: string) => `/trucks/${id}/override-penalty`,
  REQUEST_VERIFICATION: (id: string) => `/trucks/${id}/request-verification`,
  BOOKING_OPTIONS: "/trucks/booking-options",
} as const;

// ─── Drivers ───
export const DRIVERS = {
  LIST: "/drivers",
  SUMMARY: "/drivers/summary",
  EXPORT: "/drivers/export",
  CREATE: "/drivers",
  BULK: "/drivers/bulk",
  BY_ID: (id: string) => `/drivers/${id}`,
  DISABLE: (id: string) => `/drivers/${id}/disable`,
  ARCHIVE: (id: string) => `/drivers/${id}/archive`,
  ENABLE: (id: string) => `/drivers/${id}/enable`,
  BOOKING_OPTIONS: "/drivers/booking-options",
  CLEAR_FLAG: (id: string) => `/drivers/${id}/clear-flag`,
  START_VERIFICATION: (id: string) => `/drivers/${id}/start-verification`,
} as const;

// ─── TEPs ───
export const TEPS = {
  LIST: "/teps",
  SUMMARY: "/teps/summary",
  EXPORT: "/teps/export",
  CREATE: "/teps",
  BULK: "/teps/bulk",
  BY_ID: (id: string) => `/teps/${id}`,
  REVOKE: (id: string) => `/teps/${id}/revoke`,
} as const;

// ─── DTTR ───
export const DTTR = {
  LIST: "/dttr",
  SUMMARY: "/dttr/summary",
  EDIT_AUDIT: "/dttr/edit-audit",
  BY_ID: (id: string) => `/dttr/${id}`,
  SUBMISSIONS: (id: string) => `/dttr/${id}/submissions`,
  SUBMIT: (id: string) => `/dttr/${id}/submit`,
  EDIT: (id: string) => `/dttr/${id}`,
  CONFIGURE_MODE: (id: string) => `/dttr/${id}/configure-mode`,
} as const;

// ─── Payment Types ───
export const PAYMENT_TYPES = {
  LIST: "/payment-types",
  BY_ID: (id: string) => `/payment-types/${id}`,
} as const;

// ─── Payments (Paystack) ───
export const PAYMENTS = {
  INITIALIZE: (bookingId: string) => `/bookings/${bookingId}/payments/initialize`,
  VERIFY_BOOKING: (bookingId: string) => `/bookings/${bookingId}/payments/verify`,
  VERIFY: "/payments/verify",
  CONFIG: "/payments/config",
  LIST: "/payments",
  BY_ID: (id: string) => `/payments/${id}`,
} as const;

// ─── Facility Timeslots ───
export const FACILITY_TIMESLOTS = {
  LIST: "/facility-timeslots",
  BY_ID: (id: string) => `/facility-timeslots/${id}`,
} as const;

// ─── Truck Types ───
export const TRUCK_TYPES = {
  LIST: "/truck-types",
  BY_ID: (id: string) => `/truck-types/${id}`,
} as const;

// ─── Truck Capacities ───
export const TRUCK_CAPACITIES = {
  LIST: "/truck-capacities",
  BY_ID: (id: string) => `/truck-capacities/${id}`,
} as const;

// ─── Truck Lengths ───
export const TRUCK_LENGTHS = {
  LIST: "/truck-lengths",
  BY_ID: (id: string) => `/truck-lengths/${id}`,
} as const;

// ─── Booking Categories ───
export const BOOKING_CATEGORIES = {
  LIST: "/booking-categories",
  BY_ID: (id: string) => `/booking-categories/${id}`,
} as const;

// ─── TEP Types ───
export const TEP_TYPES = {
  LIST: "/tep-types",
  BY_ID: (id: string) => `/tep-types/${id}`,
} as const;

// ─── Park Types ───
export const PARK_TYPES = {
  LIST: "/park-types",
  BY_ID: (id: string) => `/park-types/${id}`,
} as const;

// ─── Facility Types ───
export const FACILITY_TYPES = {
  LIST: "/facility-types",
  BY_ID: (id: string) => `/facility-types/${id}`,
} as const;

// ─── Locations ───
export const LOCATIONS = {
  LIST: "/locations",
  BY_ID: (id: string) => `/locations/${id}`,
} as const;

// ─── Barriers ───
export const BARRIERS = {
  LIST: "/barriers",
  SUMMARY: "/barriers/summary",
  BY_ID: (id: string) => `/barriers/${id}`,
  DISABLE: (id: string) => `/barriers/${id}/disable`,
} as const;

// ─── Handheld Devices ───
export const HANDHELD_DEVICES = {
  LIST: "/handheld-devices",
  BY_ID: (id: string) => `/handheld-devices/${id}`,
} as const;

// ─── RFID Tags ───
export const RFID_TAGS = {
  LIST: "/rfid-tags",
  BY_ID: (id: string) => `/rfid-tags/${id}`,
  BULK_UPLOAD: "/rfid-tags/bulk-upload",
} as const;

// ─── Activity Log ───
export const ACTIVITY_LOG = {
  LIST: "/activity-logs",
  SUMMARY: "/activity-logs/summary",
  BY_ID: (id: string) => `/activity-logs/${id}`,
  EXPORT: "/activity-logs/export",
} as const;

// ─── e-Revenue (SuperAdmin) ───
// Module path segment: etss | npa | facilities | transit | tow
export const REVENUE = {
  /** All-time successful revenue (platform-wide). */
  TOTAL: "/e-revenue/total",
  /** Fee schedule: amounts, payer, and recipient split per payment type. */
  FEE_SCHEDULE: "/e-revenue/fee-schedule",
  SUMMARY: (module: string) => `/e-revenue/${module}/summary`,
  BREAKDOWN: (module: string) => `/e-revenue/${module}/breakdown`,
  TRANSACTIONS: (module: string) => `/e-revenue/${module}/transactions`,
  TRANSACTION_BY_ID: (module: string, id: string) =>
    `/e-revenue/${module}/transactions/${id}`,
  EXPORT: (module: string) => `/e-revenue/${module}/export`,
} as const;

// ─── Incident Reports (SuperAdmin) ───
export const INCIDENTS = {
  LIST: "/incidents",
  SUMMARY: "/incidents/summary",
  BY_ID: (id: string) => `/incidents/${id}`,
  ASSIGNEE_COMPANIES: "/incidents/assignees/companies",
  ASSIGNEE_USERS: "/incidents/assignees/users",
  ASSIGN: (id: string) => `/incidents/${id}/assign`,
  SEVERITY: (id: string) => `/incidents/${id}/severity`,
  DEADLINE: (id: string) => `/incidents/${id}/deadline`,
  COMMENTS: (id: string) => `/incidents/${id}/comments`,
  ESCALATE: (id: string) => `/incidents/${id}/escalate`,
  REQUEST_EVIDENCE: (id: string) => `/incidents/${id}/request-evidence`,
  EMERGENCY_RESPONSE: (id: string) => `/incidents/${id}/emergency-response`,
  APPROVE_RESOLUTION: (id: string) => `/incidents/${id}/approve-resolution`,
  REJECT_RESOLUTION: (id: string) => `/incidents/${id}/reject-resolution`,
  RESOLVE: (id: string) => `/incidents/${id}/resolve`,
  REOPEN: (id: string) => `/incidents/${id}/reopen`,
} as const;

// ─── Traffic Command (SuperAdmin) ───
// Paths are relative to NEXT_PUBLIC_API_URL (e.g. …/api → …/api/traffic-command/locations)
export const TRAFFIC = {
  LIVE_TRUCKS: "/traffic-command/live-trucks",
  LOCATIONS: "/traffic-command/locations",
  OCC_OVERVIEW: "/traffic-command/occ/overview",
  OCC_EMERGENCIES: "/traffic-command/occ/emergencies",
  OCC_CANCELLED_BOOKINGS: "/traffic-command/occ/cancelled-bookings",
  OCC_CANCELLED_BOOKINGS_EXPORT: "/traffic-command/occ/cancelled-bookings/export",
  DISPATCH_COMMAND: (actionSlug: string) =>
    `/traffic-command/occ/command-actions/${actionSlug}/dispatch`,
} as const;

// ─── Dashboard Stats ───
export const dashboardStats = {
  liveBookings: { value: 1284, trend: 14, trendUp: true },
  verifiedTrucks: { value: 8420, trend: 2.4, trendUp: true },
  verifiedDrivers: { value: 12105, trend: 0.8, trendUp: true },
  avgTatApapa: { value: "4.2h", trend: 12, trendUp: false },
  avgTatTincan: { value: "5.1h", trend: 5, trendUp: true },
  exceptions: { value: 24, trend: 3, trendUp: false },
};

// ─── e-Revenue ───
export const revenueCards = [
  { label: "From Bookings", amount: 2535000.0, trend: 18.3, type: "N" as const },
  { label: "From Penalties", amount: 185000.0, trend: 12.7, type: "N" as const },
  { label: "From Utility Tickets", amount: 2535000.0, trend: 18.3, type: "N" as const },
  { label: "From Tow Requests", amount: 185000.0, trend: 12.7, type: "N" as const },
];

export const totalRevenue = 5440000;

// ─── Bookings by Terminal (Bar Chart) ───
export const bookingsByTerminal = [
  { terminal: "APM T1", live: 180000, completed: 150000, cancelled: 10000 },
  { terminal: "Tincan", live: 120000, completed: 100000, cancelled: 8000 },
  { terminal: "PTML", live: 90000, completed: 80000, cancelled: 5000 },
  { terminal: "Grimaldi", live: 60000, completed: 55000, cancelled: 3000 },
  { terminal: "ENL", live: 75000, completed: 65000, cancelled: 4000 },
  { terminal: "5-Star", live: 45000, completed: 40000, cancelled: 2000 },
  { terminal: "Josepdam", live: 30000, completed: 25000, cancelled: 1500 },
  { terminal: "Port & Cargo", live: 55000, completed: 50000, cancelled: 3500 },
];

// ─── Matchings by Terminal (Bar Chart) ───
export const matchingsByTerminal = [
  { terminal: "APM T1", truckEntry: 4200, matched: 3800, unmatched: 400 },
  { terminal: "Tincan", truckEntry: 3500, matched: 3200, unmatched: 300 },
  { terminal: "PTML", truckEntry: 2800, matched: 2600, unmatched: 200 },
  { terminal: "Grimaldi", truckEntry: 1800, matched: 1650, unmatched: 150 },
  { terminal: "ENL", truckEntry: 2200, matched: 2000, unmatched: 200 },
  { terminal: "5-Star", truckEntry: 1500, matched: 1350, unmatched: 150 },
  { terminal: "Josepdam", truckEntry: 1000, matched: 900, unmatched: 100 },
  { terminal: "Port & Cargo", truckEntry: 1700, matched: 1550, unmatched: 150 },
];

// ─── Recent Booking Activities ───
export const recentBookings = [
  {
    type: "Truck Booking",
    plateNumber: "AAA123XY",
    status: "On-Trip",
    bookedBy: "ABC Logistics",
    time: "14:23, 6th April 2026",
  },
  {
    type: "Utility Ticket",
    plateNumber: "MN1440D",
    status: "Pending",
    bookedBy: "APM Terminals Apapa",
    time: "15:47, 6th April 2026",
  },
  {
    type: "Truck Booking",
    plateNumber: "CCC634RT",
    status: "Left-Staging",
    bookedBy: "Shina & Sons Logistics",
    time: "15:31, 6th April 2026",
  },
];

// ─── Recent Matching Activities ───
export const recentMatchings = [
  {
    facility: "BNSC Bonded Terminal",
    plateNumber: "AAA123XY",
    category: "Empty Container",
    destination: "APM Terminals",
    bookedBy: "ABC Logistics",
    time: "14:23, 6th April 2026",
  },
  {
    facility: "RainPark Truck Park",
    plateNumber: "EEESS621",
    category: "Empty Container",
    destination: "ENL Consortium",
    bookedBy: "DAL Logistics",
    time: "15:41, 6th April 2026",
  },
  {
    facility: "Goldspeed Truck Park",
    plateNumber: "EEESS621",
    category: "GasPhus",
    destination: "Five Star Logistics Terminal",
    bookedBy: "Shina & Sons Logistics",
    time: "18:19, 6th April 2026",
  },
];

// ─── Sidebar Navigation ───
export interface NavItem {
  label: string;
  href?: string;
  children?: NavItem[];
}

export const sidebarNav: NavItem[] = [
  { label: "Overview", href: "/dashboard" },
  {
    label: "Traffic Command & Coordination",
    children: [
      { label: "Live Truck Updates", href: "/dashboard/traffic/live-trucks" },
      { label: "Live Location Updates", href: "/dashboard/traffic/locations" },
      { label: "Operations Command & Coordination (OCC)", href: "/dashboard/traffic/occ" },
    ],
  },
  {
    label: "e-Revenue",
    children: [
      { label: "Maritime-ETSS (e-Revenue)", href: "/dashboard/revenue/etss" },
      { label: "NPA (e-Revenue)", href: "/dashboard/revenue/npa" },
      { label: "Transit Parks (e-Revenue)", href: "/dashboard/revenue/transit" },
      { label: "Facilities (e-Revenue)", href: "/dashboard/revenue/facilities" },
      { label: "Tow Truck Companies (e-Revenue)", href: "/dashboard/revenue/tow" },
    ],
  },
  {
    label: "Manage Bookings",
    children: [
      { label: "Book Fish (Assist Transporter)", href: "/dashboard/bookings/book-fish" },
      { label: "Book EPT (Assist Transporter)", href: "/dashboard/bookings/book-ept" },
      { label: "Book Bonded Terminal (Assist Transporter)", href: "/dashboard/bookings/book-bonded-terminal" },
      { label: "Book Truck Park (Assist Transporter)", href: "/dashboard/bookings/book-truck-park" },
      { label: "Today's Manifest (In-Manifest & Left-Manifest)", href: "/dashboard/bookings/manifest" },
      { label: "All Bookings (Live, Completed & Cancelled)", href: "/dashboard/bookings/all" },
      { label: "Priority Queue (Facility & Pregate)", href: "/dashboard/bookings/queue" },
    ],
  },
  {
    label: "Manage Trucks (Add Truck Feature)",
    children: [
      { label: "MSS Verified Trucks", href: "/dashboard/trucks/verified" },
      { label: "Unverified Trucks", href: "/dashboard/trucks/unverified" },
      { label: "Disabled Trucks", href: "/dashboard/trucks/disabled" },
      { label: "Flagged Trucks", href: "/dashboard/trucks/flagged" },
    ],
  },
  {
    label: "Manage Drivers (Add Driver Feature)",
    children: [
      { label: "Verified Drivers", href: "/dashboard/drivers/verified" },
      { label: "Unverified Drivers", href: "/dashboard/drivers/unverified" },
      { label: "Disabled Drivers", href: "/dashboard/drivers/disabled" },
      { label: "Flagged Drivers", href: "/dashboard/drivers/flagged" },
    ],
  },
  { label: "Companies (All Companies & Add Company Feature)", href: "/dashboard/companies" },
  { label: "Manage Users (All Users & Add User Feature)", href: "/dashboard/users" },
  { label: "My Team (All Team members, Add Team member Feature & Permissions)", href: "/dashboard/team" },
  { label: "Ports (All Ports & Create Port Feature)", href: "/dashboard/ports" },
  {
    label: "Terminals (All Terminals & Add Terminal Feature)",
    children: [
      { label: "Port Terminals", href: "/dashboard/terminals/port" },
      { label: "Non Port Terminals", href: "/dashboard/terminals/non-port" },
    ],
  },
  {
    label: "Transit Parks (All Transit Parks & Add Transit Park Feature)",
    children: [
      { label: "Pregatin-Empties", href: "/dashboard/transit/pregatin-empties" },
      { label: "Pregatin-Mixed", href: "/dashboard/transit/pregatin-mixed" },
      { label: "EPPs", href: "/dashboard/transit/epps" },
    ],
  },
  {
    label: "Facilities (All Facilities + Add Facility Feature)",
    children: [
      { label: "Bonded Terminals", href: "/dashboard/facilities/bonded" },
      { label: "Truck Parks", href: "/dashboard/facilities/truck-parks" },
      { label: "Non-Van Parks", href: "/dashboard/facilities/non-van" },
    ],
  },
  { label: "Utility Tickets (All Utility Requests & Create Utility Ticket Feature)", href: "/dashboard/utility-tickets" },
  { label: "Truck Entry Permits (TEPs): All TEPs & Add TEP Feature", href: "/dashboard/teps" },
  {
    label: "Penalties & Fines",
    children: [
      { label: "Penalty Database & Add Penalty Feature", href: "/dashboard/penalties/database" },
      { label: "All Issued Fines", href: "/dashboard/penalties/fines" },
      { label: "All Disputed Fines", href: "/dashboard/penalties/disputed" },
    ],
  },
];

// ─── Activity Log ───
export interface ActivityLogEntry {
  id: string;
  timestamp: string;
  userName: string;
  email: string;
  userType: "SuperAdmin" | "Admin" | "Operator" | "Transporter" | "Driver" | "Terminal" | "System";
  company: string;
  action: string;
  module: string;
  ipAddress: string;
  device: string;
  status: "Success" | "Failed" | "Pending";
  details?: string;
}

export const activityLogEntries: ActivityLogEntry[] = [
  {
    id: "ACT-00001",
    timestamp: "2026-04-06T18:47:12",
    userName: "Femi Okunlola",
    email: "femi.okunlola@maritime-etss.com",
    userType: "SuperAdmin",
    company: "MARITIME-ETSS",
    action: "Approved Truck Registration",
    module: "Trucks",
    ipAddress: "102.89.23.47",
    device: "Chrome / macOS",
    status: "Success",
    details: "Approved truck AAA123XY registration for ABC Logistics",
  },
  {
    id: "ACT-00002",
    timestamp: "2026-04-06T18:32:05",
    userName: "Ngozi Adebayo",
    email: "ngozi.adebayo@maritime-etss.com",
    userType: "Admin",
    company: "MARITIME-ETSS",
    action: "Created Booking",
    module: "Bookings",
    ipAddress: "102.89.23.51",
    device: "Firefox / Windows",
    status: "Success",
    details: "Created booking BK-20260406-0892 for APM Terminals Apapa",
  },
  {
    id: "ACT-00003",
    timestamp: "2026-04-06T18:15:33",
    userName: "Chidi Eze",
    email: "chidi.eze@abclogistics.com",
    userType: "Transporter",
    company: "ABC Logistics",
    action: "Login",
    module: "Auth",
    ipAddress: "41.58.120.14",
    device: "Chrome / Android",
    status: "Success",
    details: "Successful login from mobile device",
  },
  {
    id: "ACT-00004",
    timestamp: "2026-04-06T17:58:19",
    userName: "Unknown User",
    email: "admin@maritime-etss.com",
    userType: "System",
    company: "MARITIME-ETSS",
    action: "Failed Login Attempt",
    module: "Auth",
    ipAddress: "195.220.11.88",
    device: "Unknown / Linux",
    status: "Failed",
    details: "3 consecutive failed login attempts — account temporarily locked",
  },
  {
    id: "ACT-00005",
    timestamp: "2026-04-06T17:42:50",
    userName: "Amara Obi",
    email: "amara.obi@maritime-etss.com",
    userType: "Operator",
    company: "MARITIME-ETSS",
    action: "Issued Penalty",
    module: "Penalties & Fines",
    ipAddress: "102.89.23.60",
    device: "Edge / Windows",
    status: "Success",
    details: "Issued ₦50,000 fine to truck MN1440D for gate violation",
  },
  {
    id: "ACT-00006",
    timestamp: "2026-04-06T17:30:07",
    userName: "Bola Tinubu",
    email: "bola.tinubu@apmterminals.com",
    userType: "Terminal",
    company: "APM Terminals",
    action: "Updated Terminal Capacity",
    module: "Terminals",
    ipAddress: "102.89.23.77",
    device: "Chrome / Windows",
    status: "Success",
    details: "Updated APM Terminal 1 daily capacity from 400 to 450 trucks",
  },
  {
    id: "ACT-00007",
    timestamp: "2026-04-06T17:12:44",
    userName: "System",
    email: "system@maritime-etss.com",
    userType: "System",
    company: "MARITIME-ETSS",
    action: "Auto-Cancelled Booking",
    module: "Bookings",
    ipAddress: "10.0.0.1",
    device: "System / Server",
    status: "Success",
    details: "Auto-cancelled 12 expired bookings older than 48 hours",
  },
  {
    id: "ACT-00008",
    timestamp: "2026-04-06T16:55:21",
    userName: "Femi Okunlola",
    email: "femi.okunlola@maritime-etss.com",
    userType: "SuperAdmin",
    company: "MARITIME-ETSS",
    action: "Added Team Member",
    module: "Users & Team",
    ipAddress: "102.89.23.47",
    device: "Chrome / macOS",
    status: "Success",
    details: "Added Ngozi Adebayo as Admin with full operations access",
  },
  {
    id: "ACT-00009",
    timestamp: "2026-04-06T16:40:10",
    userName: "Kemi Afolabi",
    email: "kemi@shinaandsons.com",
    userType: "Transporter",
    company: "Shina & Sons Logistics",
    action: "Uploaded Document",
    module: "Trucks",
    ipAddress: "41.58.120.88",
    device: "Safari / iOS",
    status: "Pending",
    details: "Uploaded vehicle insurance certificate for truck CCC634RT — awaiting review",
  },
  {
    id: "ACT-00010",
    timestamp: "2026-04-06T16:22:03",
    userName: "Emeka Nwosu",
    email: "emeka.nwosu@maritime-etss.com",
    userType: "Admin",
    company: "MARITIME-ETSS",
    action: "Exported Report",
    module: "e-Revenue",
    ipAddress: "102.89.23.55",
    device: "Chrome / Windows",
    status: "Success",
    details: "Exported monthly revenue report (March 2026) as PDF",
  },
  {
    id: "ACT-00011",
    timestamp: "2026-04-06T15:58:44",
    userName: "DAL Logistics Bot",
    email: "api@dallogistics.com",
    userType: "System",
    company: "DAL Logistics",
    action: "API Booking Request",
    module: "Bookings",
    ipAddress: "52.14.98.201",
    device: "API / Server",
    status: "Failed",
    details: "Rate limit exceeded — 429 Too Many Requests",
  },
  {
    id: "ACT-00012",
    timestamp: "2026-04-06T15:30:15",
    userName: "Femi Okunlola",
    email: "femi.okunlola@maritime-etss.com",
    userType: "SuperAdmin",
    company: "MARITIME-ETSS",
    action: "Updated System Config",
    module: "Settings",
    ipAddress: "102.89.23.47",
    device: "Chrome / macOS",
    status: "Success",
    details: "Changed maximum booking window from 72h to 48h",
  },
  {
    id: "ACT-00013",
    timestamp: "2026-04-06T15:10:30",
    userName: "Olumide Balogun",
    email: "olumide@goldspeed.com",
    userType: "Transporter",
    company: "Goldspeed Truck Park",
    action: "Registered Driver",
    module: "Drivers",
    ipAddress: "41.58.121.03",
    device: "Chrome / Android",
    status: "Success",
    details: "Registered new driver Ibrahim Musa with license #DRV-9201",
  },
  {
    id: "ACT-00014",
    timestamp: "2026-04-06T14:48:22",
    userName: "Amara Obi",
    email: "amara.obi@maritime-etss.com",
    userType: "Operator",
    company: "MARITIME-ETSS",
    action: "Resolved Dispute",
    module: "Penalties & Fines",
    ipAddress: "102.89.23.60",
    device: "Edge / Windows",
    status: "Success",
    details: "Resolved fine dispute #DSP-0044 in favour of Shina & Sons Logistics",
  },
  {
    id: "ACT-00015",
    timestamp: "2026-04-06T14:20:55",
    userName: "System",
    email: "system@maritime-etss.com",
    userType: "System",
    company: "MARITIME-ETSS",
    action: "Database Backup",
    module: "Settings",
    ipAddress: "10.0.0.1",
    device: "System / Server",
    status: "Success",
    details: "Automated daily database backup completed — 2.4 GB",
  },
];

// ─── Team Members ───
export type TeamUserType =
  | "ETSS-Nigeria SuperAdmin"
  | "Customer Service Personnel"
  | "Traffic Manager"
  | "Gate Ops Personnel"
  | "Road Marshall";

export type TeamAccountType = "Primary" | "Sub-Account";
export type TeamStatus = "Active" | "Inactive" | "Awaiting Activation";
export type TeamDepartment = "SuperAdmin" | "Operations" | "Customer Service";

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  userType: TeamUserType;
  accountType: TeamAccountType;
  status: TeamStatus;
  department: TeamDepartment;
  createdAt: string;
  permissions?: string[];
}

// ─── Permissions by Module ───
export interface PermissionModule {
  module: string;
  permissions: { key: string; label: string; description: string }[];
}

export const permissionModules: PermissionModule[] = [
  {
    module: "Bookings",
    permissions: [
      { key: "bookings.view", label: "View Bookings", description: "View all booking records and manifests" },
      { key: "bookings.create", label: "Create Bookings", description: "Create new truck bookings" },
      { key: "bookings.cancel", label: "Cancel Bookings", description: "Cancel active bookings" },
      { key: "bookings.export", label: "Export Bookings", description: "Export booking data and reports" },
    ],
  },
  {
    module: "Trucks & Drivers",
    permissions: [
      { key: "trucks.view", label: "View Trucks", description: "View truck registry and verification status" },
      { key: "trucks.manage", label: "Manage Trucks", description: "Add, verify, disable, or flag trucks" },
      { key: "drivers.view", label: "View Drivers", description: "View driver registry and verification status" },
      { key: "drivers.manage", label: "Manage Drivers", description: "Add, verify, disable, or flag drivers" },
    ],
  },
  {
    module: "Terminals & Infrastructure",
    permissions: [
      { key: "terminals.view", label: "View Terminals", description: "View terminal records and capacity" },
      { key: "terminals.manage", label: "Manage Terminals", description: "Add or modify terminal settings" },
      { key: "facilities.view", label: "View Facilities", description: "View transit parks and facilities" },
      { key: "facilities.manage", label: "Manage Facilities", description: "Add or modify facility settings" },
    ],
  },
  {
    module: "Traffic & Operations",
    permissions: [
      { key: "traffic.view", label: "View Live Traffic", description: "Access live truck tracking and locations" },
      { key: "traffic.command", label: "Traffic Command", description: "Issue traffic commands and coordination" },
      { key: "occ.access", label: "OCC Access", description: "Access Operations Command Centre" },
    ],
  },
  {
    module: "Revenue & Finance",
    permissions: [
      { key: "revenue.view", label: "View Revenue", description: "View e-Revenue dashboards and reports" },
      { key: "revenue.export", label: "Export Revenue", description: "Export revenue and financial reports" },
      { key: "penalties.view", label: "View Penalties", description: "View penalty database and issued fines" },
      { key: "penalties.manage", label: "Manage Penalties", description: "Issue, edit, or resolve fines" },
    ],
  },
  {
    module: "User & Team Management",
    permissions: [
      { key: "users.view", label: "View Users", description: "View all platform users" },
      { key: "users.manage", label: "Manage Users", description: "Add, modify, or disable platform users" },
      { key: "team.view", label: "View Team", description: "View team members list" },
      { key: "team.manage", label: "Manage Team", description: "Create and manage sub-accounts" },
    ],
  },
  {
    module: "Reports & Analytics",
    permissions: [
      { key: "reports.view", label: "View Reports", description: "Access system reports and analytics" },
      { key: "reports.export", label: "Export Reports", description: "Export reports in CSV/PDF/Excel" },
      { key: "activity.view", label: "View Activity Log", description: "Access audit trail and activity logs" },
    ],
  },
  {
    module: "System Settings",
    permissions: [
      { key: "settings.view", label: "View Settings", description: "View system configuration" },
      { key: "settings.manage", label: "Manage Settings", description: "Modify system configuration and policies" },
      { key: "utility.manage", label: "Manage Utility Tickets", description: "Create and manage utility tickets" },
      { key: "teps.manage", label: "Manage TEPs", description: "Create and manage Truck Entry Permits" },
    ],
  },
];

export const teamMembers: TeamMember[] = [
  {
    id: "TM-001",
    name: "Femi Okunlola",
    email: "femi.okunlola@maritime-etss.com",
    userType: "ETSS-Nigeria SuperAdmin",
    accountType: "Primary",
    status: "Active",
    department: "SuperAdmin",
    createdAt: "2025-06-01T09:00:00",
  },
  {
    id: "TM-002",
    name: "Ngozi Adebayo",
    email: "ngozi.adebayo@maritime-etss.com",
    userType: "Customer Service Personnel",
    accountType: "Sub-Account",
    status: "Active",
    department: "Customer Service",
    createdAt: "2025-08-15T11:30:00",
  },
  {
    id: "TM-003",
    name: "Amara Obi",
    email: "amara.obi@maritime-etss.com",
    userType: "Traffic Manager",
    accountType: "Sub-Account",
    status: "Active",
    department: "Operations",
    createdAt: "2025-09-02T14:00:00",
  },
  {
    id: "TM-004",
    name: "Emeka Nwosu",
    email: "emeka.nwosu@maritime-etss.com",
    userType: "Gate Ops Personnel",
    accountType: "Sub-Account",
    status: "Inactive",
    department: "Operations",
    createdAt: "2025-10-12T08:45:00",
  },
  {
    id: "TM-005",
    name: "Bola Adesanya",
    email: "bola.adesanya@maritime-etss.com",
    userType: "Road Marshall",
    accountType: "Sub-Account",
    status: "Active",
    department: "Operations",
    createdAt: "2025-11-05T10:15:00",
  },
  {
    id: "TM-006",
    name: "Chidinma Eze",
    email: "chidinma.eze@maritime-etss.com",
    userType: "Customer Service Personnel",
    accountType: "Sub-Account",
    status: "Awaiting Activation",
    department: "Customer Service",
    createdAt: "2026-03-28T16:00:00",
  },
  {
    id: "TM-007",
    name: "Ibrahim Musa",
    email: "ibrahim.musa@maritime-etss.com",
    userType: "Traffic Manager",
    accountType: "Sub-Account",
    status: "Active",
    department: "Operations",
    createdAt: "2025-12-10T13:20:00",
  },
  {
    id: "TM-008",
    name: "Adaeze Okoro",
    email: "adaeze.okoro@maritime-etss.com",
    userType: "Gate Ops Personnel",
    accountType: "Sub-Account",
    status: "Awaiting Activation",
    department: "Operations",
    createdAt: "2026-04-01T09:30:00",
  },
  {
    id: "TM-009",
    name: "Yusuf Abdullahi",
    email: "yusuf.abdullahi@maritime-etss.com",
    userType: "Road Marshall",
    accountType: "Sub-Account",
    status: "Inactive",
    department: "Operations",
    createdAt: "2025-07-20T07:00:00",
  },
  {
    id: "TM-010",
    name: "Fatima Bello",
    email: "fatima.bello@maritime-etss.com",
    userType: "Customer Service Personnel",
    accountType: "Sub-Account",
    status: "Active",
    department: "Customer Service",
    createdAt: "2026-01-14T11:45:00",
  },
  {
    id: "TM-011",
    name: "Oluwaseun Bakare",
    email: "oluwaseun.bakare@maritime-etss.com",
    userType: "Traffic Manager",
    accountType: "Sub-Account",
    status: "Active",
    department: "Operations",
    createdAt: "2026-02-03T15:10:00",
  },
  {
    id: "TM-012",
    name: "Grace Okafor",
    email: "grace.okafor@maritime-etss.com",
    userType: "Gate Ops Personnel",
    accountType: "Sub-Account",
    status: "Active",
    department: "Operations",
    createdAt: "2026-02-20T09:00:00",
  },
];

// ─── Platform Users (All Users Management) ───
export type PlatformUserType =
  | "ETSS-Nigeria Admin"
  | "NPA"
  | "Terminal Operator"
  | "Bonded Terminal"
  | "Truck Park"
  | "Fish-Van Park"
  | "EPT"
  | "Pregate"
  | "Shipping Lines"
  | "Enforcement Officer"
  | "Gate Officer"
  | "Tow Truck Company";

export type PlatformAccountType = "Primary" | "Sub-Account";
export type PlatformUserStatus = "Active" | "Inactive" | "Awaiting Activation";

export interface PlatformUser {
  id: string;
  name: string;
  email: string;
  userType: PlatformUserType;
  accountType: PlatformAccountType;
  status: PlatformUserStatus;
  linkedCompany: string;
  createdAt: string;
  phone?: string;
  address?: string;
}

export const platformUsers: PlatformUser[] = [
  {
    id: "USR-001",
    name: "Femi Okunlola",
    email: "femi.okunlola@maritime-etss.com",
    userType: "ETSS-Nigeria Admin",
    accountType: "Primary",
    status: "Active",
    linkedCompany: "MARITIME-ETSS",
    createdAt: "2025-06-01T09:00:00",
    phone: "+234 812 345 6789",
  },
  {
    id: "USR-002",
    name: "Capt. Abubakar Dantata",
    email: "abubakar.dantata@npa.gov.ng",
    userType: "NPA",
    accountType: "Primary",
    status: "Active",
    linkedCompany: "Nigerian Ports Authority",
    createdAt: "2025-07-10T08:30:00",
    phone: "+234 803 222 1111",
  },
  {
    id: "USR-003",
    name: "Chen Wei",
    email: "chen.wei@apmterminals.com",
    userType: "Terminal Operator",
    accountType: "Primary",
    status: "Active",
    linkedCompany: "APM Terminals Apapa",
    createdAt: "2025-08-15T10:00:00",
    phone: "+234 810 555 4444",
  },
  {
    id: "USR-004",
    name: "Rasheed Balogun",
    email: "rasheed@tincanterminal.com",
    userType: "Terminal Operator",
    accountType: "Primary",
    status: "Active",
    linkedCompany: "Tincan Island Container Terminal",
    createdAt: "2025-08-20T11:15:00",
    phone: "+234 811 666 3333",
  },
  {
    id: "USR-005",
    name: "Olumide Balogun",
    email: "olumide@goldspeedpark.com",
    userType: "Truck Park",
    accountType: "Primary",
    status: "Active",
    linkedCompany: "Goldspeed Truck Park",
    createdAt: "2025-09-01T14:00:00",
    phone: "+234 802 888 7777",
  },
  {
    id: "USR-006",
    name: "Aminu Garba",
    email: "aminu@lilyponds.com",
    userType: "Truck Park",
    accountType: "Primary",
    status: "Inactive",
    linkedCompany: "Lilypond Transit Park",
    createdAt: "2025-09-12T09:30:00",
    phone: "+234 803 111 2222",
  },
  {
    id: "USR-007",
    name: "Ngozi Ibe",
    email: "ngozi@grimaldi.com",
    userType: "Shipping Lines",
    accountType: "Primary",
    status: "Active",
    linkedCompany: "Grimaldi Lines Nigeria",
    createdAt: "2025-10-05T13:45:00",
    phone: "+234 814 333 4444",
  },
  {
    id: "USR-008",
    name: "James Okafor",
    email: "james@pillingtow.com",
    userType: "Tow Truck Company",
    accountType: "Primary",
    status: "Active",
    linkedCompany: "Pilling Tow Services",
    createdAt: "2025-10-18T08:00:00",
    phone: "+234 805 777 6666",
  },
  {
    id: "USR-009",
    name: "Halima Yusuf",
    email: "halima.yusuf@npa.gov.ng",
    userType: "Enforcement Officer",
    accountType: "Sub-Account",
    status: "Active",
    linkedCompany: "Nigerian Ports Authority",
    createdAt: "2025-11-01T10:20:00",
    phone: "+234 806 444 5555",
  },
  {
    id: "USR-010",
    name: "Tunde Adeyemi",
    email: "tunde@bnscbonded.com",
    userType: "Bonded Terminal",
    accountType: "Primary",
    status: "Active",
    linkedCompany: "BNSC Bonded Terminal",
    createdAt: "2025-11-15T12:00:00",
    phone: "+234 807 222 8888",
  },
  {
    id: "USR-011",
    name: "Grace Nwankwo",
    email: "grace@fishvanpark.com",
    userType: "Fish-Van Park",
    accountType: "Primary",
    status: "Awaiting Activation",
    linkedCompany: "Ijora Fish-Van Park",
    createdAt: "2026-03-20T15:00:00",
    phone: "+234 808 999 1111",
  },
  {
    id: "USR-012",
    name: "Bayo Ogundimu",
    email: "bayo@pregatemixed.com",
    userType: "Pregate",
    accountType: "Primary",
    status: "Active",
    linkedCompany: "Pregate Mixed Terminal",
    createdAt: "2025-12-01T09:00:00",
    phone: "+234 809 555 2222",
  },
  {
    id: "USR-013",
    name: "Fatima Abdullahi",
    email: "fatima@eptapapa.com",
    userType: "EPT",
    accountType: "Primary",
    status: "Active",
    linkedCompany: "EPT Apapa",
    createdAt: "2025-12-10T11:30:00",
    phone: "+234 810 777 3333",
  },
  {
    id: "USR-014",
    name: "Sgt. Emeka Uzor",
    email: "emeka.uzor@npa.gov.ng",
    userType: "Gate Officer",
    accountType: "Sub-Account",
    status: "Active",
    linkedCompany: "Nigerian Ports Authority",
    createdAt: "2026-01-05T08:15:00",
    phone: "+234 811 888 4444",
  },
  {
    id: "USR-015",
    name: "Chioma Eze",
    email: "chioma@ptml.com",
    userType: "Terminal Operator",
    accountType: "Sub-Account",
    status: "Active",
    linkedCompany: "PTML Nigeria",
    createdAt: "2026-01-20T14:45:00",
    phone: "+234 812 999 5555",
  },
  {
    id: "USR-016",
    name: "Kabiru Mohammed",
    email: "kabiru@enlconsortium.com",
    userType: "Terminal Operator",
    accountType: "Primary",
    status: "Inactive",
    linkedCompany: "ENL Consortium",
    createdAt: "2025-09-25T10:30:00",
    phone: "+234 813 111 6666",
  },
  {
    id: "USR-017",
    name: "Adaora Nnamdi",
    email: "adaora@maersk.com",
    userType: "Shipping Lines",
    accountType: "Primary",
    status: "Active",
    linkedCompany: "Maersk Nigeria",
    createdAt: "2026-02-01T09:00:00",
    phone: "+234 814 222 7777",
  },
  {
    id: "USR-018",
    name: "Segun Afolabi",
    email: "segun@jollytowtruck.com",
    userType: "Tow Truck Company",
    accountType: "Primary",
    status: "Awaiting Activation",
    linkedCompany: "Jolly Tow Services",
    createdAt: "2026-04-02T16:00:00",
    phone: "+234 815 333 8888",
  },
  {
    id: "USR-019",
    name: "Maryam Suleiman",
    email: "maryam@eptempties.com",
    userType: "EPT",
    accountType: "Sub-Account",
    status: "Awaiting Activation",
    linkedCompany: "EPT Apapa",
    createdAt: "2026-03-28T12:30:00",
    phone: "+234 816 444 9999",
  },
  {
    id: "USR-020",
    name: "Ikechukwu Obi",
    email: "ikechukwu@pregatempties.com",
    userType: "Pregate",
    accountType: "Sub-Account",
    status: "Active",
    linkedCompany: "Pregate Empties Terminal",
    createdAt: "2026-02-15T10:00:00",
    phone: "+234 817 555 1111",
  },
  {
    id: "USR-021",
    name: "Yinka Bakare",
    email: "yinka.bakare@npa.gov.ng",
    userType: "NPA",
    accountType: "Sub-Account",
    status: "Inactive",
    linkedCompany: "Nigerian Ports Authority",
    createdAt: "2025-11-20T09:30:00",
    phone: "+234 818 666 2222",
  },
  {
    id: "USR-022",
    name: "Danladi Musa",
    email: "danladi@5starlogistics.com",
    userType: "Terminal Operator",
    accountType: "Primary",
    status: "Active",
    linkedCompany: "5-Star Logistics Terminal",
    createdAt: "2026-01-10T13:00:00",
    phone: "+234 819 777 3333",
  },
  {
    id: "USR-023",
    name: "Ada Okechukwu",
    email: "ada@josepdam.com",
    userType: "Terminal Operator",
    accountType: "Primary",
    status: "Active",
    linkedCompany: "Josepdam Port Services",
    createdAt: "2026-02-05T11:00:00",
    phone: "+234 820 888 4444",
  },
  {
    id: "USR-024",
    name: "Bashir Abubakar",
    email: "bashir@portcargo.com",
    userType: "Terminal Operator",
    accountType: "Primary",
    status: "Active",
    linkedCompany: "Port & Cargo Handling",
    createdAt: "2025-12-20T08:30:00",
    phone: "+234 821 999 5555",
  },
  {
    id: "USR-025",
    name: "Sade Oladipo",
    email: "sade@bondedwarehouse.ng",
    userType: "Bonded Terminal",
    accountType: "Primary",
    status: "Awaiting Activation",
    linkedCompany: "Lagos Bonded Warehouse",
    createdAt: "2026-04-05T10:00:00",
    phone: "+234 822 111 6666",
  },
];

// ─── Create User: User Type Config (dynamic form fields) ───
export type CreateUserType =
  | "Terminal Operator"
  | "Bonded Terminal"
  | "Truck Park"
  | "Fish-Van Park"
  | "Pregate"
  | "EPT"
  | "Shipping Lines"
  | "Tow Truck Company"
  | "Enforcement Verifiers"
  | "Gate Verification Officers";

export interface CreateUserTypeConfig {
  value: CreateUserType;
  label: string;
  category: "Terminal" | "Facility" | "Transit Park" | "Shipping" | "Enforcement" | "Tow";
  specificFields: { key: string; label: string; placeholder: string; type?: "text" | "number" | "select"; options?: string[] }[];
}

export const createUserTypeConfigs: CreateUserTypeConfig[] = [
  {
    value: "Terminal Operator",
    label: "Terminal Operator",
    category: "Terminal",
    specificFields: [
      { key: "terminalName", label: "Terminal Name", placeholder: "e.g. APM Terminals Apapa" },
      { key: "portLocation", label: "Port Location", placeholder: "e.g. Apapa, Lagos", type: "select", options: ["Apapa", "Tincan Island", "Onne", "Calabar", "Warri"] },
      { key: "terminalCode", label: "Terminal Code", placeholder: "e.g. APM-APA-01" },
      { key: "operatingHours", label: "Operating Hours", placeholder: "e.g. 06:00 - 22:00" },
    ],
  },
  {
    value: "Bonded Terminal",
    label: "Bonded Terminal (Facility)",
    category: "Facility",
    specificFields: [
      { key: "facilityName", label: "Facility Name", placeholder: "e.g. BNSC Bonded Terminal" },
      { key: "facilityType", label: "Facility Type", placeholder: "Select type", type: "select", options: ["Bonded Warehouse", "Free Zone", "Customs Area"] },
      { key: "capacity", label: "Capacity (TEU)", placeholder: "e.g. 5000", type: "number" },
      { key: "locationCoordinates", label: "Location Coordinates", placeholder: "e.g. 6.4474° N, 3.3903° E" },
    ],
  },
  {
    value: "Truck Park",
    label: "Truck Park (Facility)",
    category: "Facility",
    specificFields: [
      { key: "facilityName", label: "Facility Name", placeholder: "e.g. Goldspeed Truck Park" },
      { key: "facilityType", label: "Facility Type", placeholder: "Select type", type: "select", options: ["Open Yard", "Covered Facility", "Mixed Use"] },
      { key: "capacity", label: "Capacity (Trucks)", placeholder: "e.g. 200", type: "number" },
      { key: "locationCoordinates", label: "Location Coordinates", placeholder: "e.g. 6.4521° N, 3.3845° E" },
    ],
  },
  {
    value: "Fish-Van Park",
    label: "Fish-Van Park (Facility)",
    category: "Facility",
    specificFields: [
      { key: "facilityName", label: "Facility Name", placeholder: "e.g. Ijora Fish-Van Park" },
      { key: "facilityType", label: "Facility Type", placeholder: "Select type", type: "select", options: ["Cold Storage", "Dry Park", "Mixed Use"] },
      { key: "capacity", label: "Capacity (Vehicles)", placeholder: "e.g. 100", type: "number" },
      { key: "locationCoordinates", label: "Location Coordinates", placeholder: "e.g. 6.4612° N, 3.3799° E" },
    ],
  },
  {
    value: "Pregate",
    label: "Pregate (Transit Park)",
    category: "Transit Park",
    specificFields: [
      { key: "transitParkName", label: "Transit Park Name", placeholder: "e.g. Pregate Mixed Terminal" },
      { key: "transitParkType", label: "Transit Park Type", placeholder: "Select type", type: "select", options: ["Mixed", "Empties Only", "Laden Only"] },
      { key: "capacity", label: "Capacity (Trucks)", placeholder: "e.g. 300", type: "number" },
      { key: "contactNumber", label: "Transit Park Contact Number", placeholder: "+234 800 000 0000" },
      { key: "locationCoordinates", label: "Location Coordinates", placeholder: "e.g. 6.4490° N, 3.3880° E" },
    ],
  },
  {
    value: "EPT",
    label: "EPT (Transit Park)",
    category: "Transit Park",
    specificFields: [
      { key: "transitParkName", label: "Transit Park Name", placeholder: "e.g. EPT Apapa" },
      { key: "transitParkType", label: "Transit Park Type", placeholder: "Select type", type: "select", options: ["Export Processing", "Import Processing", "Mixed"] },
      { key: "capacity", label: "Capacity (Trucks)", placeholder: "e.g. 250", type: "number" },
      { key: "contactNumber", label: "Transit Park Contact Number", placeholder: "+234 800 000 0000" },
      { key: "locationCoordinates", label: "Location Coordinates", placeholder: "e.g. 6.4455° N, 3.3920° E" },
    ],
  },
  {
    value: "Shipping Lines",
    label: "Shipping Lines",
    category: "Shipping",
    specificFields: [
      { key: "companyName", label: "Shipping Line Name", placeholder: "e.g. Maersk Nigeria" },
      { key: "vesselCount", label: "Number of Vessels", placeholder: "e.g. 15", type: "number" },
      { key: "registrationNumber", label: "Company Registration Number", placeholder: "e.g. RC-123456" },
      { key: "serviceCoverage", label: "Service Coverage", placeholder: "Select area", type: "select", options: ["Apapa Only", "Tincan Only", "Both Apapa & Tincan", "All Ports"] },
    ],
  },
  {
    value: "Tow Truck Company",
    label: "Tow Truck Company",
    category: "Tow",
    specificFields: [
      { key: "companyName", label: "Company Name", placeholder: "e.g. Pilling Tow Services" },
      { key: "fleetSize", label: "Fleet Size", placeholder: "e.g. 12", type: "number" },
      { key: "registrationNumber", label: "Company Registration Number", placeholder: "e.g. RC-789012" },
      { key: "serviceCoverage", label: "Service Coverage Area", placeholder: "Select area", type: "select", options: ["Apapa", "Tincan", "Both"] },
      { key: "contactNumber", label: "Contact Number", placeholder: "+234 800 000 0000" },
    ],
  },
  {
    value: "Enforcement Verifiers",
    label: "Enforcement Verifiers",
    category: "Enforcement",
    specificFields: [
      { key: "npaRole", label: "NPA Role", placeholder: "Select role", type: "select", options: ["Finance", "Operations", "ICT", "Safety/HSE"] },
      { key: "badgeNumber", label: "Badge / Staff ID", placeholder: "e.g. NPA-ENF-0042" },
    ],
  },
  {
    value: "Gate Verification Officers",
    label: "Gate Verification Officers",
    category: "Enforcement",
    specificFields: [
      { key: "npaRole", label: "NPA Role", placeholder: "Select role", type: "select", options: ["Finance", "Operations", "ICT", "Safety/HSE"] },
      { key: "badgeNumber", label: "Badge / Staff ID", placeholder: "e.g. NPA-GVO-0018" },
    ],
  },
];

// ─── Current User / Profile ───
export const currentUser = {
  name: "Femi Okunlola",
  email: "Femi.Okunlola@maritime-etss.com",
  role: "SuperAdmin" as const,
  avatar: null,
  phone: "+234 812 345 6789",
  company: "MARITIME-ETSS",
  accountType: "Primary" as const,
  accountStatus: "Active" as const,
  notifications: {
    sms: true,
    email: true,
  },
  lastPasswordChange: "2026-03-15T10:30:00",
  createdAt: "2025-06-01T09:00:00",
};
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Radio,
  Wallet,
  BookOpen,
  Truck,
  Users,
  Building2,
  MapPin,
  Landmark,
  ParkingCircle,
  Warehouse,
  Ticket,
  FileCheck,
  Gavel,
  Bell,
  Ship,
  ChevronLeft,
  ChevronRight,
  LogOut,
  HelpCircle,
  MessageCircle,
  Shield,
  Menu,
  X,
  Activity,
  UsersRound,
  Settings,
} from "lucide-react";
import { totalRevenue } from "@/lib/mock-data";
import { useAuthStore } from "@/store/auth.store";

// ─── Sidebar Navigation with icons ───
const navGroups = [
  {
    items: [
      { label: "Overview", icon: LayoutDashboard, href: "/dashboard" },
      { label: "Traffic Command", icon: Radio, href: "/dashboard/traffic/live-trucks" },
      { label: "e-Revenue", icon: Wallet, href: "/dashboard/revenue/etss" },
    ],
  },
  {
    title: "Operations",
    items: [
      { label: "Bookings", icon: BookOpen, href: "/dashboard/bookings/all" },
      { label: "Trucks", icon: Truck, href: "/dashboard/trucks" },
      { label: "Drivers", icon: Users, href: "/dashboard/drivers" },
      { label: "Companies", icon: Building2, href: "/dashboard/companies" },
    ],
  },
  {
    title: "Infrastructure",
    items: [
      { label: "Ports", icon: MapPin, href: "/dashboard/ports" },
      { label: "Terminals", icon: Landmark, href: "/dashboard/terminals" },
      { label: "Transit Parks", icon: ParkingCircle, href: "/dashboard/transit-parks" },
      { label: "Facilities", icon: Warehouse, href: "/dashboard/facilities" },
    ],
  },
  {
    title: "Administration",
    items: [
      { label: "Utility Tickets", icon: Ticket, href: "/dashboard/utility-tickets" },
      { label: "TEPs", icon: FileCheck, href: "/dashboard/teps" },
      { label: "Penalties & Fines", icon: Gavel, href: "/dashboard/penalties" },
      { label: "Users", icon: Users, href: "/dashboard/users" },
      { label: "My Team", icon: UsersRound, href: "/dashboard/team" },
      { label: "Activity Log", icon: Activity, href: "/dashboard/activity-log" },
      { label: "App Options", icon: Settings, href: "/dashboard/app-options" },
    ],
  },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [expanded, setExpanded] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const formatter = new Intl.NumberFormat("en-NG");

  const userInitials = user
    ? `${user.first_name[0]}${user.last_name[0]}`
    : "--";
  const userFullName = user
    ? `${user.first_name} ${user.last_name}`
    : "User";
  const userRole = user?.user_type?.name ?? "User";

  const sidebarWidth = expanded ? "w-64" : "w-[68px]";

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* ─── Mobile Overlay ─── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ─── Sidebar ─── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-gray-200 bg-[#0f1e2e] transition-all duration-200 ${sidebarWidth} ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen`}
      >
        {/* Sidebar Header */}
        <div className="flex h-14 items-center justify-between px-4">
          <Link href="/dashboard" className="flex items-center gap-2.5 overflow-hidden">
            <Ship className="h-6 w-6 shrink-0 text-emerald-400" />
            {expanded && (
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-white">MARITIME-ETSS</p>
                <p className="truncate text-[9px] font-semibold uppercase tracking-widest text-emerald-400">
                  Logistics Solutions
                </p>
              </div>
            )}
          </Link>
          <button
            onClick={() => setExpanded(!expanded)}
            className="hidden rounded-md p-1 text-gray-400 hover:bg-white/10 hover:text-white lg:block"
          >
            {expanded ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 overflow-y-auto px-2 py-4">
          {navGroups.map((group, gi) => (
            <div key={gi} className="mb-4">
              {expanded && group.title && (
                <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-gray-500">
                  {group.title}
                </p>
              )}
              {!expanded && gi > 0 && (
                <div className="mx-3 mb-3 h-px bg-white/10" />
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={!expanded ? item.label : undefined}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                        active
                          ? "bg-emerald-600/20 font-medium text-emerald-400"
                          : "text-gray-400 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <item.icon className="h-4.5 w-4.5 shrink-0" />
                      {expanded && <span className="truncate">{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-white/10 p-3">
          {expanded ? (
            <>
              <div className="mb-3 rounded-lg bg-emerald-600/10 p-3">
                <p className="text-xs font-semibold text-emerald-400">Help Center</p>
                <p className="mt-1 text-[11px] text-gray-400">Need assistance with bookings?</p>
                <p className="text-[11px] text-gray-400">Contact Support 24/7</p>
              </div>
              <button
                onClick={() => { clearAuth(); router.push("/"); }}
                className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-white/5"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <button title="Help Center" className="rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-white">
                <HelpCircle className="h-4 w-4" />
              </button>
              <button
                title="Logout"
                onClick={() => { clearAuth(); router.push("/"); }}
                className="rounded-lg p-2 text-red-400 hover:bg-white/5"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ─── Main Area ─── */}
      <div className="flex min-w-0 flex-1 flex-col overflow-x-hidden">
        {/* ─── Top Bar ─── */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 lg:px-6">
          <div className="flex items-center gap-4">
            {/* Mobile hamburger */}
            <button
              className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 lg:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {/* e-Revenue Badge */}
            <div className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 sm:flex">
              <Wallet className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-xs font-semibold text-emerald-800">
                e-Revenue: ₦{formatter.format(totalRevenue)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Actions */}
            <div className="hidden items-center gap-2 lg:flex">
              <Link href="/dashboard/team/invite" className="rounded-full border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700">
                + Team Member
              </Link>
              <Link href="/dashboard/users/create" className="rounded-full border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700">
                + New User
              </Link>
            </div>

            {/* Notifications */}
            <button className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                3
              </span>
            </button>

            {/* Profile */}
            <Link
              href="/dashboard/profile"
              className="flex items-center gap-2.5 rounded-lg border border-gray-200 px-3 py-1.5 transition-colors hover:border-emerald-300 hover:bg-emerald-50"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0f1e2e] text-[10px] font-bold text-white">
                {userInitials}
              </div>
              <div className="hidden text-right sm:block">
                <p className="text-xs font-semibold text-gray-900">{userFullName}</p>
                <p className="text-[10px] text-gray-500">{userRole}</p>
              </div>
            </Link>
          </div>
        </header>

        {/* ─── Page Content ─── */}
        <main className="min-w-0 flex-1">{children}</main>

        {/* ─── Sticky Footer Bar ─── */}
        <footer className="sticky bottom-0 z-20 flex items-center justify-between border-t border-gray-200 bg-white px-6 py-2.5">
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="font-medium text-gray-700">2026 MARITIME-ETSS</span>
            <span className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              SYSTEM ONLINE
            </span>
          </div>
          <div className="flex items-center gap-5 text-xs text-gray-400">
            <a href="#" className="flex items-center gap-1 text-red-500 hover:text-red-600">
              <Shield className="h-3.5 w-3.5" />
              Help Stop Extortion
            </a>
            <a href="/privacy" className="hover:text-gray-600">Privacy Policy</a>
            <a href="/terms" className="hover:text-gray-600">Terms of Service</a>
            <a href="/contact" className="hover:text-gray-600">Contact Support</a>
          </div>
          {/* Chatbot FAB */}
          <button className="fixed bottom-16 right-6 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-600/25 transition-transform hover:scale-105">
            <MessageCircle className="h-5 w-5" />
          </button>
        </footer>
      </div>
    </div>
  );
}
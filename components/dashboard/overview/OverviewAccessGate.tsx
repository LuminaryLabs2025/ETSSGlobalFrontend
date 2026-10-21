"use client";

import Link from "next/link";
import { Shield } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { canViewDashboardOverview } from "@/lib/dashboard-overview-access";

export function OverviewAccessGate({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const allowed = canViewDashboardOverview(user);

  if (!allowed) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-6">
        <div className="max-w-md rounded-xl border border-gray-200 bg-white p-8 text-center">
          <Shield className="mx-auto h-10 w-10 text-gray-400" />
          <h1 className="mt-4 text-lg font-bold text-gray-900">Overview not available</h1>
          <p className="mt-2 text-sm text-gray-500">
            The executive overview is limited to SuperAdmin and authorised system staff.
          </p>
          <Link
            href="/dashboard/bookings/all"
            className="mt-6 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Go to Bookings
          </Link>
        </div>
      </div>
    );
  }

  return children;
}

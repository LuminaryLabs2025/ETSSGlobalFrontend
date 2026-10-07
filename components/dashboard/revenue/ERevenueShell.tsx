"use client";

import { Wallet } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { SuperAdminGate } from "@/components/dashboard/book-assist/BookAssistUi";

export function ERevenueShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  const isSuperAdmin = useAuthStore((s) => s.user?.is_super_admin ?? false);

  if (!isSuperAdmin) {
    return <SuperAdminGate featureLabel="e-Revenue" />;
  }

  return (
    <div className="space-y-5 p-5 lg:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{title}</h1>
            <p className="mt-0.5 max-w-2xl text-sm text-gray-500">{subtitle}</p>
          </div>
        </div>
      </div>

      <div className="min-w-0 space-y-5">{children}</div>
    </div>
  );
}

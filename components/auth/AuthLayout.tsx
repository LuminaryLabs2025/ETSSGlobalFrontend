"use client";

import Image from "next/image";
import { CheckCircle2, Ship } from "lucide-react";
import portImg from "@/assets/images/harbor.jpg";
import Link from "next/link";

const stats = [
  { value: "12k+", label: "Registered Trucks" },
  { value: "12+", label: "Registered Drivers" },
  { value: "98.4%", label: "Scheduling Accuracy" },
  { value: "3.1M+", label: "Completed Bookings" },
];

interface AuthLayoutProps {
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function AuthLayout({ children, footer }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen">
      {/* ─── Left Panel ─── */}
      <div className="flex w-full flex-col justify-between bg-white px-8 py-10 lg:w-120 lg:min-w-120 lg:px-14">
        <div>
          {/* Logo */}
          <div className="mb-10 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
              <Ship className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold leading-tight tracking-tight text-gray-900">
                MARITIME-ETSS
              </h2>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-emerald-600">
                Logistics Solutions
              </p>
            </div>
          </div>

          {children}
        </div>

        {/* Bottom */}
        <div className="mt-8 space-y-6">
          {footer}
          <div className="flex items-center justify-between border-t border-gray-100 pt-4 text-xs text-gray-400">
            <div className="flex gap-4">
              <Link href="/terms" className="hover:text-gray-600">
                Terms of Service
              </Link>
              <Link href="/privacy" className="hover:text-gray-600">
                Privacy Policy
              </Link>
            </div>
            <span>🌐 Nigeria (EN)</span>
          </div>
        </div>
      </div>

      {/* ─── Right Panel: Hero ─── */}
      <div className="relative hidden flex-1 lg:block">
        <div className="absolute inset-0">
          <Image
            src={portImg}
            alt="Nigerian port with shipping containers"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-linear-to-t from-gray-900/90 via-gray-900/50 to-gray-900/30" />
        </div>

        <div className="relative flex h-full flex-col justify-between p-10">
          <div className="flex justify-end">
            <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-md">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span className="text-xs font-medium tracking-wide text-white">
                NIGERIAN PORT AUTHORITY APPROVED
              </span>
            </div>
          </div>

          <div>
            <h2 className="max-w-lg text-4xl font-bold leading-tight text-white">
              Seamless Logistics for{" "}
              <span className="text-emerald-400">Nigeria&apos;s Gateway</span>
            </h2>
            <p className="mt-4 max-w-md text-base font-sans leading-relaxed text-gray-300">
              Empowering maritime operations with real-time scheduling, verified
              credentials, and end-to-end transparency.
            </p>
            <div className="my-6 h-px w-full bg-white/20" />
            <div className="grid grid-cols-4 gap-6">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="mt-0.5 text-xs text-gray-400">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
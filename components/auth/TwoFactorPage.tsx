"use client";

import { useState, useRef } from "react";
import {
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { AuthLayout } from "./AuthLayout";
import { useVerifyOtp } from "@/hooks/auth/useVerifyOtp";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";
import type { TwoFactorMethod } from "@/types/auth.types";

const methodConfig: Record<TwoFactorMethod, { description: string; inputHint: string }> = {
  EMAIL: {
    description: "A verification code has been sent to your email address.",
    inputHint: "Enter the 6-digit code sent to your email",
  },
  SMS: {
    description: "A verification code has been sent to your phone via SMS.",
    inputHint: "Enter the 6-digit code sent to your phone",
  },
  AUTHENTICATOR: {
    description: "Open your authenticator app to get the verification code.",
    inputHint: "Enter the 6-digit code from your authenticator app",
  },
};

export function TwoFactorPage() {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const hasSubmitted = useRef(false);
  
  const pending2FA = useAuthStore((s) => s.pending2FA);
  const twoFactorMethod = useAuthStore((s) => s.twoFactorMethod);

  const verifyMutation = useVerifyOtp();

  // Redirect if not in pending 2FA state (skip if user already submitted verification)
  if (!pending2FA && !hasSubmitted.current) {
    router.push("/");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.trim().length === 0) return;
    
    hasSubmitted.current = true;
    verifyMutation.mutate(otp);
  };

  const isLoading = verifyMutation.isPending;
  const config = methodConfig[twoFactorMethod ?? "EMAIL"];

  return (
    <AuthLayout
      footer={
        <p className="text-center text-sm text-gray-500">
          Having trouble?{" "}
          <button
            onClick={() => router.push("/")}
            className="font-semibold text-emerald-600 hover:text-emerald-700"
          >
            Back to login
          </button>
        </p>
      }
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-[28px] font-bold text-gray-900">
            Verify Your Identity
          </h1>
          <p className="mt-1.5 text-sm text-gray-500">
            {config.description}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* OTP Input */}
          <div>
            <label
              htmlFor="otp"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Verification Code
            </label>
            <input
              id="otp"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\s/g, ""))}
              placeholder="000000"
              maxLength={6}
              disabled={isLoading}
              className="h-12 w-full rounded-lg border border-gray-200 bg-white px-4 text-center text-2xl tracking-widest text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:bg-gray-50 disabled:text-gray-400"
              required
            />
            <p className="mt-1.5 text-xs text-gray-500">
              {config.inputHint}
            </p>
          </div>

          {/* Error Message */}
          {verifyMutation.isError && (
            <div className="flex gap-2 rounded-lg bg-red-50 p-3">
              <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
              <p className="text-sm text-red-700">
                {verifyMutation.error?.response?.data?.message ||
                  "Invalid verification code. Please try again."}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={otp.length !== 6 || isLoading}
            className="group relative h-12 w-full rounded-lg bg-emerald-600 font-medium text-white transition-all hover:bg-emerald-700 hover:shadow-lg disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none"
          >
            <span className="flex items-center justify-center gap-2">
              {isLoading ? "Verifying..." : "Verify and Continue"}
              {!isLoading && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />}
            </span>
          </button>
        </form>
      </div>
    </AuthLayout>
  );
}

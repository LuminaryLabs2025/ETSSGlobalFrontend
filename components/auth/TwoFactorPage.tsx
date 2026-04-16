"use client";

import { useState } from "react";
import {
  Mail,
  MessageSquare,
  Smartphone,
  ArrowRight,
  RotateCcw,
  AlertCircle,
} from "lucide-react";
import { AuthLayout } from "./AuthLayout";
import { useVerifyOtp } from "@/hooks/auth/useVerifyOtp";
import { useResendOtp } from "@/hooks/auth/useResendOtp";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";
import type { OtpMethod } from "@/types/auth.types";

export function TwoFactorPage() {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [method, setMethod] = useState<OtpMethod>("email");
  
  const loginEmail = useAuthStore((s) => s.loginEmail);
  const pending2FA = useAuthStore((s) => s.pending2FA);

  const verifyMutation = useVerifyOtp();
  const resendMutation = useResendOtp();

  // Redirect if not in pending 2FA state
  if (!pending2FA) {
    router.push("/");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.trim().length === 0) return;
    
    verifyMutation.mutate({ otp, method });
  };

  const handleResend = () => {
    resendMutation.mutate(method);
  };

  const methods: { value: OtpMethod; label: string; icon: React.ReactNode }[] =
    [
      { value: "email", label: "Email", icon: <Mail className="h-5 w-5" /> },
      { value: "sms", label: "SMS", icon: <MessageSquare className="h-5 w-5" /> },
      {
        value: "authenticator",
        label: "Authenticator App",
        icon: <Smartphone className="h-5 w-5" />,
      },
    ];

  const isLoading = verifyMutation.isPending || resendMutation.isPending;

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
            We've sent a verification code to{" "}
            <span className="font-medium text-gray-700">{loginEmail}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Method Selection */}
          <div>
            <label className="mb-3 block text-sm font-medium text-gray-700">
              Verification Method
            </label>
            <div className="grid grid-cols-3 gap-3">
              {methods.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setMethod(m.value)}
                  disabled={isLoading}
                  className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 px-3 py-4 transition-all ${
                    method === m.value
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <span
                    className={`${
                      method === m.value
                        ? "text-emerald-600"
                        : "text-gray-400"
                    }`}
                  >
                    {m.icon}
                  </span>
                  <span
                    className={`text-xs font-medium ${
                      method === m.value
                        ? "text-emerald-600"
                        : "text-gray-600"
                    }`}
                  >
                    {m.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

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
              {method === "authenticator"
                ? "Enter the 6-digit code from your authenticator app"
                : `Enter the code we sent to your ${method}`}
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
              Verify and Continue
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </button>

          {/* Resend Code */}
          <div className="border-t border-gray-200 pt-5">
            <p className="text-center text-sm text-gray-600">
              Didn't receive a code?
            </p>
            <button
              type="button"
              onClick={handleResend}
              disabled={isLoading}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 font-medium text-gray-700 transition-all hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RotateCcw className="h-4 w-4" />
              Resend Code
            </button>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
}

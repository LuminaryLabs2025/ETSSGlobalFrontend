"use client";

import { useState } from "react";
import { Lock, ArrowRight, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { AuthLayout } from "./AuthLayout";
import Link from "next/link";

const requirements = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { label: "One number", test: (p: string) => /\d/.test(p) },
  { label: "One special character", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

export function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isReset, setIsReset] = useState(false);

  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;
  const allRequirementsMet = requirements.every((r) => r.test(password));
  const canSubmit = passwordsMatch && allRequirementsMet;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setIsLoading(true);
    // TODO: Integrate with reset password API (pass token from URL params)
    console.log({ password });
    setIsReset(true);
    setIsLoading(false);
  };

  return (
    <AuthLayout
      footer={
        <p className="text-center text-sm text-gray-500">
          Remember your password?{" "}
          <Link
            href="/"
            className="font-semibold text-emerald-600 hover:text-emerald-700"
          >
            Back to Sign In
          </Link>
        </p>
      }
    >
      {!isReset ? (
        <>
          <h1 className="text-[28px] font-bold text-gray-900">
            Reset Password
          </h1>
          <p className="mt-1.5 text-sm text-gray-500">
            Create a new secure password for your account.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {/* New Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                New Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="h-12 w-full rounded-lg border border-gray-200 bg-white pl-11 pr-11 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className={`h-12 w-full rounded-lg border bg-white pl-11 pr-11 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 ${
                    confirmPassword.length > 0 && !passwordsMatch
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                      : "border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                  }`}
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirm ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {confirmPassword.length > 0 && !passwordsMatch && (
                <p className="mt-1.5 text-xs text-red-500">
                  Passwords do not match
                </p>
              )}
            </div>

            {/* Password Requirements */}
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
              <p className="mb-2.5 text-xs font-medium text-gray-700">
                Password Requirements
              </p>
              <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                {requirements.map((req) => {
                  const met = req.test(password);
                  return (
                    <div
                      key={req.label}
                      className="flex items-center gap-2 text-xs"
                    >
                      <div
                        className={`h-1.5 w-1.5 rounded-full ${
                          met ? "bg-emerald-500" : "bg-gray-300"
                        }`}
                      />
                      <span
                        className={met ? "text-emerald-700" : "text-gray-500"}
                      >
                        {req.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !canSubmit}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-60"
            >
              {isLoading ? "Resetting..." : "Reset Password"}
              {!isLoading && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>
        </>
      ) : (
        /* ─── Success State ─── */
        <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
            <CheckCircle2 className="h-7 w-7 text-emerald-600" />
          </div>

          <h1 className="mt-6 text-[28px] font-bold text-gray-900">
            Password Reset Successful
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-gray-500">
            Your password has been reset successfully. You can now sign in with
            your new password.
          </p>

          <Link
            href="/"
            className="mt-8 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            Sign In to Portal
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </AuthLayout>
  );
}
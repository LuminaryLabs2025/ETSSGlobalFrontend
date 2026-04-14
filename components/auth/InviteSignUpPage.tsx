"use client";

import { useState } from "react";
import {
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  KeyRound,
} from "lucide-react";
import { AuthLayout } from "./AuthLayout";
import Link from "next/link";

export function InviteSignUpPage() {
  // In production, extract invite token + pre-filled email from URL params
  const inviteEmail = "j.doe@nigeriaports.gov"; // TODO: from URL searchParams

  const [temporaryPassword, setTemporaryPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showTempPassword, setShowTempPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const passwordsMatch =
    password === confirmPassword && confirmPassword.length > 0;
  const canSubmit =
    temporaryPassword.trim() &&
    password.length >= 8 &&
    passwordsMatch &&
    acceptTerms;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setIsLoading(true);
    // TODO: Integrate with invite sign-up API
    console.log({ temporaryPassword, password, inviteEmail });
    setIsLoading(false);
  };

  return (
    <AuthLayout
      footer={
        <p className="text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link
            href="/"
            className="font-semibold text-emerald-600 hover:text-emerald-700"
          >
            Sign In
          </Link>
        </p>
      }
    >
      <h1 className="text-[28px] font-bold text-gray-900">
        Complete Your Account
      </h1>
      <p className="mt-1.5 text-sm text-gray-500">
        You&apos;ve been invited to join the MARITIME-ETSS platform. Set up your
        profile to get started.
      </p>

      {/* Invite Badge */}
      <div className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-3">
        <Mail className="h-4 w-4 text-emerald-600" />
        <p className="text-sm text-emerald-800">
          Invite sent to{" "}
          <span className="font-medium">{inviteEmail}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        {/* Email (read-only from invite) */}
        <div>
          <label
            htmlFor="email"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            Email Address
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              id="email"
              type="email"
              value={inviteEmail}
              readOnly
              className="h-12 w-full rounded-lg border border-gray-200 bg-gray-50 pl-11 pr-4 text-sm text-gray-500 cursor-not-allowed"
            />
          </div>
          <p className="mt-1 text-xs text-gray-400">
            Email is pre-filled from your invitation
          </p>
        </div>

        {/* Temporary Password */}
        <div>
          <label
            htmlFor="temporaryPassword"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            Temporary Password
          </label>
          <div className="relative">
            <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              id="temporaryPassword"
              type={showTempPassword ? "text" : "password"}
              value={temporaryPassword}
              onChange={(e) => setTemporaryPassword(e.target.value)}
              placeholder="Enter the password sent to your email"
              className="h-12 w-full rounded-lg border border-gray-200 bg-white pl-11 pr-11 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              required
              autoComplete="one-time-code"
            />
            <button
              type="button"
              onClick={() => setShowTempPassword(!showTempPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showTempPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-400">
            Check your email for the temporary password
          </p>
        </div>

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
              placeholder="Minimum 8 characters"
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
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              className={`h-12 w-full rounded-lg border bg-white pl-11 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 ${
                confirmPassword.length > 0 && !passwordsMatch
                  ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                  : "border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20"
              }`}
              required
              autoComplete="new-password"
            />
          </div>
          {confirmPassword.length > 0 && !passwordsMatch && (
            <p className="mt-1.5 text-xs text-red-500">
              Passwords do not match
            </p>
          )}
        </div>

        {/* Terms */}
        <label className="flex cursor-pointer items-start gap-2.5 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
          />
          <span>
            I agree to the{" "}
            <Link
              href="/terms"
              className="font-medium text-emerald-600 hover:text-emerald-700"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link 
              href="/privacy"
              className="font-medium text-emerald-600 hover:text-emerald-700"
            >
              Privacy Policy
            </Link>
          </span>
        </label>

        <button
          type="submit"
          disabled={isLoading || !canSubmit}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-60"
        >
          {isLoading ? "Creating Account..." : "Complete Sign Up"}
          {!isLoading && <ArrowRight className="h-4 w-4" />}
        </button>
      </form>

      <div className="mt-6 flex items-start gap-3 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3.5">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
        <p className="text-xs leading-relaxed text-gray-500">
          Your account will be linked to your organization with the permissions
          assigned by your administrator.
        </p>
      </div>
    </AuthLayout>
  );
}
"use client";

import { useState } from "react";
import { Mail, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import { AuthLayout } from "./AuthLayout";
import Link from "next/link";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // TODO: Integrate with password reset API
    console.log({ email });
    setIsSubmitted(true);
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
      {!isSubmitted ? (
        <>
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Sign In
          </Link>

          <h1 className="text-[28px] font-bold text-gray-900">
            Forgot Password?
          </h1>
          <p className="mt-1.5 text-sm text-gray-500">
            Enter the email address associated with your account and we&apos;ll
            send you a link to reset your password.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. j.doe@nigeriaports.gov"
                  className="h-12 w-full rounded-lg border border-gray-200 bg-white pl-11 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-60"
            >
              {isLoading ? "Sending..." : "Send Reset Link"}
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
            Check Your Email
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-gray-500">
            We&apos;ve sent a password reset link to{" "}
            <span className="font-medium text-gray-900">{email}</span>. Click
            the link in the email to reset your password.
          </p>

          <div className="mt-8 w-full space-y-3">
            <button
              onClick={() => setIsSubmitted(false)}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            >
              Resend Email
            </button>
            <Link
              href="/"
              className="flex h-12 w-full items-center justify-center rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
            >
              Back to Sign In
            </Link>
          </div>

          <p className="mt-6 text-xs text-gray-400">
            Didn&apos;t receive the email? Check your spam folder or try a
            different email address.
          </p>
        </div>
      )}
    </AuthLayout>
  );
}
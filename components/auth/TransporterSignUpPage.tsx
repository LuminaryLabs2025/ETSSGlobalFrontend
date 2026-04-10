"use client";

import { useState } from "react";
import {
  Mail,
  Lock,
  Building2,
  Phone,
  MapPin,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { AuthLayout } from "./AuthLayout";
import Link from "next/link";

const nigerianStates = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
  "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT",
  "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi",
  "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo",
  "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
];

export function TransporterSignUpPage() {
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [state, setState] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const passwordsMatch =
    password === confirmPassword && confirmPassword.length > 0;

  const canSubmit =
    companyName.trim() &&
    email.trim() &&
    phone.trim() &&
    state &&
    address.trim() &&
    password.length >= 8 &&
    passwordsMatch &&
    acceptTerms;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setIsLoading(true);
    // TODO: Integrate with transporter sign-up API
    console.log({ companyName, email, phone, state, address, password });
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
        Transporter Registration
      </h1>
      <p className="mt-1.5 text-sm text-gray-500">
        Register your transport company on the MARITIME-ETSS platform to start
        managing bookings and truck operations.
      </p>

      {/* Transporter Badge */}
      <div className="mt-6 flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-3">
        <Truck className="h-4 w-4 text-blue-600" />
        <p className="text-sm text-blue-800">
          Transporter / Trucking Company Registration
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        {/* Company Name */}
        <div>
          <label
            htmlFor="companyName"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            Company Name
          </label>
          <div className="relative">
            <Building2 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              id="companyName"
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. ABC Logistics Ltd"
              className="h-12 w-full rounded-lg border border-gray-200 bg-white pl-11 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              required
            />
          </div>
        </div>

        {/* Email Address */}
        <div>
          <label
            htmlFor="email"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            E-Mail Address
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. info@abclogistics.com"
              className="h-12 w-full rounded-lg border border-gray-200 bg-white pl-11 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              required
              autoComplete="email"
            />
          </div>
        </div>

        {/* Phone Number & State */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="phone"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Phone Number
            </label>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +234 801 234 5678"
                className="h-12 w-full rounded-lg border border-gray-200 bg-white pl-11 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                required
                autoComplete="tel"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="state"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              State
            </label>
            <div className="relative">
              <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <select
                id="state"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="h-12 w-full appearance-none rounded-lg border border-gray-200 bg-white pl-11 pr-4 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                required
              >
                <option value="">Select state</option>
                {nigerianStates.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Address */}
        <div>
          <label
            htmlFor="address"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            Address
          </label>
          <div className="relative">
            <MapPin className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
            <input
              id="address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. 12 Wharf Road, Apapa, Lagos"
              className="h-12 w-full rounded-lg border border-gray-200 bg-white pl-11 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              required
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="signupPassword"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              id="signupPassword"
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
            htmlFor="signupConfirmPassword"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              id="signupConfirmPassword"
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
          {isLoading ? "Registering..." : "Register as Transporter"}
          {!isLoading && <ArrowRight className="h-4 w-4" />}
        </button>
      </form>

      <div className="mt-6 flex items-start gap-3 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3.5">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
        <p className="text-xs leading-relaxed text-gray-500">
          Your registration will be reviewed and verified by the MARITIME-ETSS
          admin team before your account is activated.
        </p>
      </div>
    </AuthLayout>
  );
}
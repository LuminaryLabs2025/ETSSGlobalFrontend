"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Shield,
  Building2,
  Key,
  Bell,
  MessageSquare,
  Eye,
  EyeOff,
  Check,
  X,
  ArrowLeft,
  Lock,
  Save,
  AlertCircle,
  Clock,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "sonner";

// ─── Password Policy ───
const PASSWORD_RULES = [
  { label: "Minimum 8 characters", test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { label: "One number", test: (p: string) => /\d/.test(p) },
  { label: "One special character", test: (p: string) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(p) },
];

// ─── Section Wrapper ───
function Section({
  title,
  description,
  icon: Icon,
  children,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-4">
        <div className="rounded-lg bg-emerald-50 p-2">
          <Icon className="h-4.5 w-4.5 text-emerald-600" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-gray-900">{title}</h2>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

// ─── Toggle Switch ───
function Toggle({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
        enabled ? "bg-emerald-600" : "bg-gray-200"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
          enabled ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

// ─── Main Profile Page ───
export function ProfilePage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const userFullName = user ? `${user.first_name} ${user.last_name}` : "";
  const userInitials = user
    ? `${user.first_name[0]}${user.last_name[0]}`
    : "--";
  const userRole = user?.user_type?.name ?? "User";
  const userEmail = user?.email ?? "";
  const userAccountType = user?.account_type ?? "";
  const userStatus = user?.status ?? "";
  const userCompany = user?.company_id ?? "N/A";
  const userCreatedAt = user?.created_at ?? "";

  // Personal info state
  const [fullName, setFullName] = useState(userFullName);
  const [personalDirty, setPersonalDirty] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  // Notification state
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [notifDirty, setNotifDirty] = useState(false);

  // Feedback
  const [profileSaving, setProfileSaving] = useState(false);
  const [notifSaving, setNotifSaving] = useState(false);

  // Errors
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});

  // ─── Personal Info Handlers ───
  const handlePersonalChange = (field: "name" | "phone", value: string) => {
    if (field === "name") setFullName(value);
    setPersonalDirty(true);
    setProfileErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateProfile = () => {
    const errors: Record<string, string> = {};
    if (!fullName.trim()) errors.name = "Full name is required";
    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveProfile = () => {
    if (!validateProfile()) return;
    setProfileSaving(true);
    setTimeout(() => {
      setProfileSaving(false);
      setPersonalDirty(false);
      toast.success("Profile information successfully updated");
    }, 800);
  };

  // ─── Password Handlers ───
  const passwordMeetsPolicy = PASSWORD_RULES.every((r) => r.test(newPassword));
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;

  const validatePassword = () => {
    const errors: Record<string, string> = {};
    if (!currentPassword) errors.current = "Current password is required";
    if (!newPassword) errors.new = "New password is required";
    else if (!passwordMeetsPolicy) errors.new = "Password does not meet policy requirements";
    if (!confirmPassword) errors.confirm = "Please confirm your new password";
    else if (!passwordsMatch) errors.confirm = "Passwords do not match";
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChangePassword = () => {
    if (!validatePassword()) return;
    setPasswordSaving(true);
    setTimeout(() => {
      setPasswordSaving(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password successfully updated. You will be redirected to login.");
      setTimeout(() => router.push("/"), 2500);
    }, 1000);
  };

  // ─── Notification Handlers ───
  const handleNotifChange = (type: "sms" | "email", value: boolean) => {
    if (type === "sms") setSmsEnabled(value);
    else setEmailEnabled(value);
    setNotifDirty(true);
  };

  const handleSaveNotifications = () => {
    setNotifSaving(true);
    setTimeout(() => {
      setNotifSaving(false);
      setNotifDirty(false);
      toast.success("Notification preferences successfully updated");
    }, 600);
  };

  // ─── Cancel All ───
  const handleCancel = () => {
    setFullName(userFullName);
    setSmsEnabled(true);
    setEmailEnabled(true);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPersonalDirty(false);
    setNotifDirty(false);
    setProfileErrors({});
    setPasswordErrors({});
  };

  const lastChanged = "N/A";

  return (
    <div className="p-6 space-y-5">
      {/* ─── Header Banner ─── */}
      <div className="rounded-2xl bg-[#0f1e2e] p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600/20 text-xl font-bold text-emerald-400">
              {userInitials}
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{userFullName}</h1>
              <p className="text-xs text-gray-400">{userEmail}</p>
              <div className="mt-1.5 flex items-center gap-2">
                <span className="rounded-full bg-emerald-400/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                  {userRole}
                </span>
                <span className="rounded-full bg-blue-400/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-blue-400">
                  {userAccountType} Account
                </span>
                <span className="flex items-center gap-1 rounded-full bg-emerald-400/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  </span>
                  {userStatus}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Clock className="h-3.5 w-3.5" />
            {userCreatedAt
              ? `Member since ${new Date(userCreatedAt).toLocaleDateString("en-NG", { month: "long", year: "numeric" })}`
              : "Member"}
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* ─── Personal Information ─── */}
        <Section title="Personal Information" description="Manage your personal details" icon={User}>
          <div className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => handlePersonalChange("name", e.target.value)}
                  className={`w-full rounded-lg border bg-gray-50 py-2.5 pl-10 pr-3 text-sm text-gray-900 outline-none transition-colors focus:bg-white focus:ring-2 ${
                    profileErrors.name
                      ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                      : "border-gray-200 focus:border-emerald-300 focus:ring-emerald-100"
                  }`}
                />
              </div>
              {profileErrors.name && (
                <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                  <AlertCircle className="h-3 w-3" /> {profileErrors.name}
                </p>
              )}
            </div>

            {/* Email (non-editable) */}
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={userEmail}
                  disabled
                  className="w-full rounded-lg border border-gray-200 bg-gray-100 py-2.5 pl-10 pr-3 text-sm text-gray-500 cursor-not-allowed"
                />
                <Lock className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-300" />
              </div>
              <p className="mt-1 text-[11px] text-gray-400">Email cannot be changed. Contact support for assistance.</p>
            </div>

            {/* Role & Company */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-gray-500">Role</label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={userRole}
                    disabled
                    className="w-full rounded-lg border border-gray-200 bg-gray-100 py-2.5 pl-10 pr-3 text-sm text-gray-500 cursor-not-allowed"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-gray-500">Company</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={userCompany}
                    disabled
                    className="w-full rounded-lg border border-gray-200 bg-gray-100 py-2.5 pl-10 pr-3 text-sm text-gray-500 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Account Type & Status */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-gray-500">Account Type</label>
                <div className="rounded-lg border border-gray-200 bg-gray-100 px-3 py-2.5 text-sm text-gray-500">
                  {userAccountType}
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-gray-500">Account Status</label>
                <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-100 px-3 py-2.5 text-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  <span className="text-emerald-700 font-medium">{userStatus}</span>
                </div>
              </div>
            </div>

            {/* Save Profile */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={handleSaveProfile}
                disabled={!personalDirty || profileSaving}
                className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {profileSaving ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {profileSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </Section>

        {/* ─── Account Settings (Change Password) ─── */}
        <Section title="Account Settings" description="Update your password securely" icon={Key}>
          <div className="space-y-4">
            <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
              <Clock className="h-4 w-4 shrink-0 text-amber-600" />
              <p className="text-xs text-amber-700">
                Last password change: <span className="font-semibold">{lastChanged}</span>
              </p>
            </div>

            {/* Current Password */}
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                Current Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => { setCurrentPassword(e.target.value); setPasswordErrors((p) => ({ ...p, current: "" })); }}
                  placeholder="Enter current password"
                  className={`w-full rounded-lg border bg-gray-50 py-2.5 pl-10 pr-10 text-sm text-gray-900 outline-none transition-colors focus:bg-white focus:ring-2 ${
                    passwordErrors.current
                      ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                      : "border-gray-200 focus:border-emerald-300 focus:ring-emerald-100"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordErrors.current && (
                <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                  <AlertCircle className="h-3 w-3" /> {passwordErrors.current}
                </p>
              )}
            </div>

            {/* New Password */}
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                New Password
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setPasswordErrors((p) => ({ ...p, new: "" })); }}
                  placeholder="Enter new password"
                  className={`w-full rounded-lg border bg-gray-50 py-2.5 pl-10 pr-10 text-sm text-gray-900 outline-none transition-colors focus:bg-white focus:ring-2 ${
                    passwordErrors.new
                      ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                      : "border-gray-200 focus:border-emerald-300 focus:ring-emerald-100"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordErrors.new && (
                <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                  <AlertCircle className="h-3 w-3" /> {passwordErrors.new}
                </p>
              )}

              {/* Policy Checklist */}
              {newPassword.length > 0 && (
                <div className="mt-2 space-y-1 rounded-lg border border-gray-100 bg-gray-50 p-3">
                  {PASSWORD_RULES.map((rule) => {
                    const passed = rule.test(newPassword);
                    return (
                      <div key={rule.label} className="flex items-center gap-2 text-xs">
                        {passed ? (
                          <Check className="h-3.5 w-3.5 text-emerald-500" />
                        ) : (
                          <X className="h-3.5 w-3.5 text-gray-300" />
                        )}
                        <span className={passed ? "text-emerald-700" : "text-gray-400"}>{rule.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                Confirm New Password
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setPasswordErrors((p) => ({ ...p, confirm: "" })); }}
                  placeholder="Confirm new password"
                  className={`w-full rounded-lg border bg-gray-50 py-2.5 pl-10 pr-10 text-sm text-gray-900 outline-none transition-colors focus:bg-white focus:ring-2 ${
                    passwordErrors.confirm
                      ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                      : confirmPassword && passwordsMatch
                        ? "border-emerald-300 focus:border-emerald-400 focus:ring-emerald-100"
                        : "border-gray-200 focus:border-emerald-300 focus:ring-emerald-100"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordErrors.confirm && (
                <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                  <AlertCircle className="h-3 w-3" /> {passwordErrors.confirm}
                </p>
              )}
              {confirmPassword && !passwordErrors.confirm && passwordsMatch && (
                <p className="mt-1 flex items-center gap-1 text-xs text-emerald-600">
                  <Check className="h-3 w-3" /> Passwords match
                </p>
              )}
              {confirmPassword && !passwordErrors.confirm && !passwordsMatch && (
                <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                  <AlertCircle className="h-3 w-3" /> Passwords do not match
                </p>
              )}
            </div>

            {/* Change Password Button */}
            <div className="flex items-center justify-end pt-2">
              <button
                onClick={handleChangePassword}
                disabled={passwordSaving || (!currentPassword && !newPassword && !confirmPassword)}
                className="flex items-center gap-2 rounded-lg bg-[#0f1e2e] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1a2f42] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {passwordSaving ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <Key className="h-4 w-4" />
                )}
                {passwordSaving ? "Updating..." : "Change Password"}
              </button>
            </div>
          </div>
        </Section>

        {/* ─── Notification Settings ─── */}
        <Section title="Notification Settings" description="Choose how you receive alerts and updates" icon={Bell}>
          <div className="space-y-5">
            {/* SMS Toggle */}
            <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-50 p-2">
                  <MessageSquare className="h-4.5 w-4.5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">SMS Notifications</p>
                  <p className="text-xs text-gray-500">Receive alerts via text message</p>
                </div>
              </div>
              <Toggle enabled={smsEnabled} onChange={(v) => handleNotifChange("sms", v)} />
            </div>

            {/* Email Toggle */}
            <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-violet-50 p-2">
                  <Mail className="h-4.5 w-4.5 text-violet-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Email Notifications</p>
                  <p className="text-xs text-gray-500">Receive alerts via email</p>
                </div>
              </div>
              <Toggle enabled={emailEnabled} onChange={(v) => handleNotifChange("email", v)} />
            </div>

            {/* Save Notifications */}
            <div className="flex items-center justify-end pt-1">
              <button
                onClick={handleSaveNotifications}
                disabled={!notifDirty || notifSaving}
                className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {notifSaving ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {notifSaving ? "Saving..." : "Save Preferences"}
              </button>
            </div>
          </div>
        </Section>

        {/* ─── Security & Audit Info ─── */}
        <Section title="Security & Audit" description="Account security information" icon={Shield}>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-3">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-gray-400" />
                <span className="text-xs text-gray-600">Password last changed</span>
              </div>
              <span className="text-xs font-medium text-gray-900">{lastChanged}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-3">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-gray-400" />
                <span className="text-xs text-gray-600">Two-factor authentication</span>
              </div>
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">Not Enabled</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-xs text-gray-600">Account created</span>
              </div>
              <span className="text-xs font-medium text-gray-900">
                {userCreatedAt
                  ? new Date(userCreatedAt).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })
                  : "N/A"}
              </span>
            </div>
            <p className="pt-2 text-center text-[11px] text-gray-400">
              All profile updates, password changes, and notification preference changes are logged in the Activity Log.
            </p>
          </div>
        </Section>
      </div>

      {/* ─── Navigation Controls (Sticky Bottom Bar) ─── */}
      <div className="sticky bottom-12 z-10 flex items-center justify-between rounded-xl border border-gray-200 bg-white/95 px-6 py-3 shadow-sm backdrop-blur-sm">
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCancel}
            disabled={!personalDirty && !notifDirty}
            className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <X className="h-4 w-4" />
            Cancel
          </button>
          <button
            onClick={() => {
              if (personalDirty) handleSaveProfile();
              if (notifDirty) handleSaveNotifications();
            }}
            disabled={!personalDirty && !notifDirty}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

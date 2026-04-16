"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
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
  Lock,
  Save,
  AlertCircle,
  Clock,
  Loader2,
  Camera,
  MapPin,
  Smartphone,
  Copy,
} from "lucide-react";
import { useProfile } from "@/hooks/profile/useProfile";
import {
  useUpdateProfile,
  useChangePassword,
  useUpdateNotifications,
} from "@/hooks/profile/useProfileActions";
import {
  useSetup2FA,
  useVerify2FA,
  useChange2FAMethod,
} from "@/hooks/profile/useTwoFactor";

// ─── Password Policy ───
const PASSWORD_RULES = [
  { label: "Minimum 8 characters", test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { label: "One number", test: (p: string) => /\d/.test(p) },
  { label: "One special character", test: (p: string) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(p) },
];

// ─── Tab Types ───
type ProfileTab = "personal" | "security" | "notifications";

const TABS: { id: ProfileTab; label: string; icon: React.ElementType }[] = [
  { id: "personal", label: "Personal Info", icon: User },
  { id: "security", label: "Security", icon: Key },
  { id: "notifications", label: "Notifications", icon: Bell },
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
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { mutate: updateProfile, isPending: profileSaving } = useUpdateProfile();
  const { mutate: changePassword, isPending: passwordSaving } = useChangePassword();
  const { mutate: updateNotifications, isPending: notifSaving } = useUpdateNotifications();
  const setup2FAMutation = useSetup2FA();
  const verify2FAMutation = useVerify2FA();
  const change2FAMethodMutation = useChange2FAMethod();

  const [activeTab, setActiveTab] = useState<ProfileTab>("personal");

  // Derived profile data
  const personal = profile?.personalInformation;
  const security = profile?.securityAudit;
  const notifications = profile?.notifications;

  const fullName = personal?.fullName ?? "";
  const userEmail = personal?.email ?? "";
  const userRole = personal?.role ?? "User";
  const userCompany = personal?.company ?? "N/A";
  const userAccountType = personal?.accountType ?? "";
  const userStatus = personal?.accountStatus ?? "";
  const userCreatedAt = security?.accountCreated ?? "";
  const userAddress = personal?.address ?? "";

  const initials = fullName
    ? fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "--";

  const lastChanged = security?.passwordLastChanged
    ? new Date(security.passwordLastChanged).toLocaleDateString("en-NG", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Never";

  // Avatar state (for future API upload)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAvatarPreview(url);
    // TODO: Upload via API when endpoint is available
  };

  // Personal info editable state
  const [editAddress, setEditAddress] = useState("");
  const [personalDirty, setPersonalDirty] = useState(false);

  useEffect(() => {
    if (personal) {
      setEditAddress(personal.address ?? "");
      setPersonalDirty(false);
    }
  }, [personal]);

  const handleAddressChange = (value: string) => {
    setEditAddress(value);
    setPersonalDirty(true);
  };

  const handleSaveProfile = () => {
    updateProfile(
      { address: editAddress },
      { onSuccess: () => setPersonalDirty(false) }
    );
  };

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});

  // Notification state
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [notifDirty, setNotifDirty] = useState(false);

  // 2FA state
  const [showAuthSetup, setShowAuthSetup] = useState(false);
  const [verifyCode, setVerifyCode] = useState("");
  const [secretCopied, setSecretCopied] = useState(false);

  const currentMethod = security?.twoFactorMethod ?? "EMAIL";

  // Sync notification toggles when profile data loads
  useEffect(() => {
    if (notifications) {
      setSmsEnabled(notifications.smsNotifications);
      setEmailEnabled(notifications.emailNotifications);
      setNotifDirty(false);
    }
  }, [notifications]);

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
    changePassword(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
          setPasswordErrors({});
          setTimeout(() => router.push("/"), 2500);
        },
      }
    );
  };

  // ─── Notification Handlers ───
  const handleNotifChange = (type: "sms" | "email", value: boolean) => {
    if (type === "sms") setSmsEnabled(value);
    else setEmailEnabled(value);
    setNotifDirty(true);
  };

  // ─── 2FA Handlers ───
  const handleSetupAuthenticator = () => {
    setup2FAMutation.mutate(undefined, {
      onSuccess: () => {
        setShowAuthSetup(true);
        setVerifyCode("");
        setSecretCopied(false);
      },
    });
  };

  const handleVerifyAuthenticator = () => {
    if (verifyCode.length !== 6) return;
    verify2FAMutation.mutate(
      { token: verifyCode },
      {
        onSuccess: () => {
          setShowAuthSetup(false);
          setVerifyCode("");
        },
      }
    );
  };

  const handleSwitchToEmail = () => {
    change2FAMethodMutation.mutate({ method: "EMAIL" }, {
      onSuccess: () => setShowAuthSetup(false),
    });
  };

  const handleCopySecret = () => {
    if (setup2FAMutation.data?.secret) {
      navigator.clipboard.writeText(setup2FAMutation.data.secret);
      setSecretCopied(true);
      setTimeout(() => setSecretCopied(false), 2000);
    }
  };

  const handleSaveNotifications = () => {
    updateNotifications(
      { emailNotifications: emailEnabled, smsNotifications: smsEnabled },
      { onSuccess: () => setNotifDirty(false) }
    );
  };

  if (profileLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-5">
      {/* ─── Header Banner ─── */}
      <div className="rounded-2xl bg-[#0f1e2e] p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="group relative">
              <div className="flex h-18 w-18 items-center justify-center overflow-hidden rounded-2xl border-2 border-emerald-500/30 bg-emerald-600/20">
                {avatarPreview ? (
                  <Image
                    src={avatarPreview}
                    alt={fullName}
                    width={72}
                    height={72}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-xl font-bold text-emerald-400">
                    {initials}
                  </span>
                )}
              </div>
              <label
                htmlFor="avatar-upload"
                className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-2xl bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
              >
                <Camera className="h-5 w-5 text-white" />
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-white">{fullName}</h1>
              <p className="text-xs text-gray-400">{userEmail}</p>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                <span className="rounded-full bg-emerald-400/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                  {userRole}
                </span>
                <span className="rounded-full bg-blue-400/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-blue-400">
                  {userAccountType === "SUB_ACCOUNT" ? "Sub Account" : userAccountType}
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

      {/* ─── Tab Navigation ─── */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-0 overflow-x-auto" aria-label="Profile tabs">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group relative flex items-center gap-2 whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors sm:px-5 ${
                  isActive
                    ? "text-emerald-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-emerald-600" : "text-gray-400 group-hover:text-gray-500"}`} />
                {tab.label}
                {/* Active indicator */}
                <span
                  className={`absolute inset-x-0 bottom-0 h-0.5 rounded-full transition-colors ${
                    isActive ? "bg-emerald-600" : "bg-transparent group-hover:bg-gray-200"
                  }`}
                />
              </button>
            );
          })}
        </nav>
      </div>

      {/* ─── Tab Content ─── */}
      {activeTab === "personal" && (
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
                    disabled
                    className="w-full rounded-lg border border-gray-200 bg-gray-100 py-2.5 pl-10 pr-3 text-sm text-gray-500 cursor-not-allowed"
                  />
                </div>
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

              {/* Address */}
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  Address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <textarea
                    value={editAddress}
                    onChange={(e) => handleAddressChange(e.target.value)}
                    rows={2}
                    placeholder="Enter your address"
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-3 text-sm text-gray-900 outline-none transition-colors resize-none focus:bg-white focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>
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
                    {userAccountType === "SUB_ACCOUNT" ? "Sub Account" : userAccountType || "N/A"}
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

          {/* ─── Security & Audit Info ─── */}
          <Section title="Security & Audit" description="Account security and two-factor settings" icon={Shield}>
            <div className="space-y-4">
              {/* Password & Account Info */}
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
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-xs text-gray-600">Account created</span>
                  </div>
                  <span className="text-xs font-medium text-gray-900">
                    {userCreatedAt
                      ? new Date(userCreatedAt).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })
                      : "N/A"}
                  </span>
                </div>
              </div>

              {/* 2FA Section */}
              <div className="border-t border-gray-100 pt-4">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Two-Factor Authentication</h3>
                    <p className="text-xs text-gray-500">2FA is always enabled for your security</p>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700">
                    Enabled
                  </span>
                </div>

                {/* Current Method */}
                <div className="mb-3 rounded-lg border border-gray-100 bg-gray-50 p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {currentMethod === "AUTHENTICATOR" ? (
                        <Smartphone className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <Mail className="h-4 w-4 text-emerald-600" />
                      )}
                      <div>
                        <span className="text-xs font-medium text-gray-900">
                          Current method:{" "}
                          {currentMethod === "AUTHENTICATOR" ? "Authenticator App" : "Email"}
                        </span>
                        <p className="text-[11px] text-gray-500">
                          {currentMethod === "AUTHENTICATOR"
                            ? "Codes generated by your authenticator app"
                            : "Verification codes sent to your email"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Method Switch Buttons */}
                {!showAuthSetup && (
                  <div className="space-y-2">
                    {currentMethod === "EMAIL" ? (
                      <button
                        onClick={handleSetupAuthenticator}
                        disabled={setup2FAMutation.isPending}
                        className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {setup2FAMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Smartphone className="h-4 w-4" />
                        )}
                        {setup2FAMutation.isPending ? "Setting up..." : "Switch to Authenticator App"}
                      </button>
                    ) : (
                      <button
                        onClick={handleSwitchToEmail}
                        disabled={change2FAMethodMutation.isPending}
                        className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {change2FAMethodMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Mail className="h-4 w-4" />
                        )}
                        {change2FAMethodMutation.isPending ? "Switching..." : "Switch to Email"}
                      </button>
                    )}
                  </div>
                )}

                {/* Authenticator Setup Flow */}
                {showAuthSetup && setup2FAMutation.data && (
                  <div className="space-y-4 rounded-lg border border-emerald-200 bg-emerald-50/50 p-4">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">Set Up Authenticator App</h4>
                      <p className="mt-0.5 text-xs text-gray-500">
                        Scan the QR code with your Google Authenticator or similar app
                      </p>
                    </div>

                    {/* QR Code */}
                    <div className="flex justify-center rounded-lg bg-white p-4">
                      <img
                        src={setup2FAMutation.data.qrCode}
                        alt="2FA QR Code"
                        className="h-40 w-40"
                      />
                    </div>

                    {/* Secret Key */}
                    <div>
                      <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                        Or enter this secret key manually
                      </label>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-mono text-gray-800 break-all">
                          {setup2FAMutation.data.secret}
                        </code>
                        <button
                          onClick={handleCopySecret}
                          className="shrink-0 rounded-lg border border-gray-200 bg-white p-2 text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700"
                          title="Copy secret"
                        >
                          {secretCopied ? (
                            <Check className="h-4 w-4 text-emerald-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Verify Code Input */}
                    <div>
                      <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                        Enter code from app to verify
                      </label>
                      <input
                        type="text"
                        value={verifyCode}
                        onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        placeholder="000000"
                        maxLength={6}
                        disabled={verify2FAMutation.isPending}
                        className="h-10 w-full rounded-lg border border-gray-200 bg-white px-4 text-center text-lg tracking-widest text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:bg-gray-50 disabled:text-gray-400"
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowAuthSetup(false)}
                        disabled={verify2FAMutation.isPending}
                        className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleVerifyAuthenticator}
                        disabled={verifyCode.length !== 6 || verify2FAMutation.isPending}
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {verify2FAMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                        {verify2FAMutation.isPending ? "Verifying..." : "Verify & Enable"}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <p className="pt-2 text-center text-[11px] text-gray-400">
                All profile updates, password changes, and notification preference changes are logged in the Activity Log.
              </p>
            </div>
          </Section>
        </div>
      )}

      {activeTab === "security" && (
        <Section title="Change Password" description="Update your password securely" icon={Key}>
          <div className="max-w-lg space-y-4">
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
      )}

      {activeTab === "notifications" && (
        <Section title="Notification Settings" description="Choose how you receive alerts and updates" icon={Bell}>
          <div className="max-w-lg space-y-5">
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

            {notifications?.updatedAt && (
              <p className="text-[11px] text-gray-400">
                Last updated: {new Date(notifications.updatedAt).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
              </p>
            )}

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
      )}
    </div>
  );
}

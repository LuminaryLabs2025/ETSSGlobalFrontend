"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Briefcase,
  Shield,
  CheckCircle2,
  X,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Check,
  Lock,
  UserPlus,
  Loader2,
} from "lucide-react";
import { useUserTypes } from "@/hooks/useUserTypes";
import { usePermissionModules } from "@/hooks/usePermissions";
import { useCreateTeamMember } from "@/hooks/team/useTeamActions";
import type { PermissionModule } from "@/types/permissions.types";

// ─── Toast ───
function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="fixed right-6 top-20 z-50 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3.5 shadow-lg">
      <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
      <p className="text-sm font-medium text-emerald-800">{message}</p>
      <button onClick={onClose} className="ml-2 rounded-md p-0.5 text-emerald-400 hover:text-emerald-600">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

// ─── Section Wrapper ───
function Section({
  title,
  description,
  icon: Icon,
  step,
  children,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  step: number;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
          {step}
        </div>
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

// ─── Permission Module Accordion ───
function PermissionGroup({
  module,
  selected,
  onToggle,
  onToggleAll,
}: {
  module: PermissionModule;
  selected: Set<string>;
  onToggle: (id: string) => void;
  onToggleAll: (ids: string[], checked: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  const allIds = module.permissions.map((p) => p.id);
  const allChecked = allIds.length > 0 && allIds.every((id) => selected.has(id));
  const someChecked = allIds.some((id) => selected.has(id));
  const checkedCount = allIds.filter((id) => selected.has(id)).length;

  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden">
      {/* Module Header */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen(!open)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpen(!open); } }}
        className="flex w-full items-center justify-between bg-gray-50 px-4 py-3 text-left transition-colors hover:bg-gray-100 cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <ChevronRight
            className={`h-4 w-4 text-gray-400 transition-transform ${open ? "rotate-90" : ""}`}
          />
          <span className="text-sm font-semibold text-gray-900">{module.name}</span>
          {checkedCount > 0 && (
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
              {checkedCount}/{module.permissions.length}
            </span>
          )}
        </div>
        {/* Select all toggle */}
        <div
          className="flex items-center gap-2 text-xs text-gray-500"
          onClick={(e) => e.stopPropagation()}
        >
          <span>{allChecked ? "Deselect All" : "Select All"}</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleAll(allIds, !allChecked);
            }}
            className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${
              allChecked
                ? "border-emerald-600 bg-emerald-600 text-white"
                : someChecked
                  ? "border-emerald-300 bg-emerald-50 text-emerald-600"
                  : "border-gray-300 bg-white text-transparent hover:border-gray-400"
            }`}
          >
            {(allChecked || someChecked) && <Check className="h-3 w-3" />}
          </button>
        </div>
      </div>

      {/* Permission Items */}
      {open && (
        <div className="divide-y divide-gray-100">
          {module.permissions.map((perm) => {
            const checked = selected.has(perm.id);
            return (
              <div
                key={perm.id}
                role="button"
                tabIndex={0}
                onClick={() => onToggle(perm.id)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onToggle(perm.id); } }}
                className="flex cursor-pointer items-center justify-between px-4 py-3 transition-colors hover:bg-gray-50"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Lock className="h-3.5 w-3.5 shrink-0 text-gray-300" />
                  <div className="min-w-0">
                    <p className="text-sm text-gray-800">{perm.name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</p>
                    <p className="text-[11px] text-gray-400 truncate">{perm.description}</p>
                  </div>
                </div>
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
                    checked
                      ? "border-emerald-600 bg-emerald-600 text-white"
                      : "border-gray-300 bg-white text-transparent hover:border-gray-400"
                  }`}
                >
                  {checked && <Check className="h-3 w-3" />}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ───
export function AddTeamMemberPage() {
  const router = useRouter();

  // API hooks
  const { data: userTypes = [], isLoading: loadingUserTypes } = useUserTypes({ category: "SYSTEM" });
  const { data: permissionModules = [], isLoading: loadingPermissions } = usePermissionModules();
  const createTeamMember = useCreateTeamMember();

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [userTypeId, setUserTypeId] = useState("");
  const [department, setDepartment] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());

  // UI state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const selectedUserType = userTypes.find((ut) => ut.id === userTypeId);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  }, []);

  // ─── Permission Handlers ───
  const handleTogglePermission = (id: string) => {
    setSelectedPermissions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleToggleAll = (ids: string[], checked: boolean) => {
    setSelectedPermissions((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => (checked ? next.add(id) : next.delete(id)));
      return next;
    });
  };

  const handleSelectAllPermissions = () => {
    const allIds = permissionModules.flatMap((m) => m.permissions.map((p) => p.id));
    setSelectedPermissions(new Set(allIds));
  };

  const handleClearAllPermissions = () => {
    setSelectedPermissions(new Set());
  };

  // ─── Validation ───
  const validate = () => {
    const errs: Record<string, string> = {};
    if (!firstName.trim()) errs.firstName = "First name is required";
    if (!lastName.trim()) errs.lastName = "Last name is required";
    if (!email.trim()) errs.email = "Email address is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errs.email = "Enter a valid email address";
    if (!phone.trim()) errs.phone = "Phone number is required";
    if (!userTypeId) errs.role = "Please select a role";
    if (selectedPermissions.size === 0) errs.permissions = "Assign at least one permission";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ─── Submit ───
  const handleSubmit = () => {
    if (!validate()) return;
    createTeamMember.mutate(
      {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        user_type_id: userTypeId,
        permission_ids: Array.from(selectedPermissions),
        department: department.trim(),
      },
      {
        onSuccess: () => {
          setSubmitted(true);
          showToast(`Sub-Account successfully created for ${firstName} ${lastName}`);
        },
      }
    );
  };

  // ─── Success State ───
  if (submitted) {
    return (
      <div className="p-6 space-y-5">
        <div className="mx-auto max-w-lg rounded-2xl border border-gray-200 bg-white p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">Team Member Created</h2>
          <p className="mt-2 text-sm text-gray-600">
            Sub-Account successfully created for <span className="font-semibold">{firstName} {lastName}</span>.
            An activation email has been sent to <span className="font-semibold">{email}</span> with
            login instructions.
          </p>
          <div className="mt-4 rounded-lg border border-gray-100 bg-gray-50 p-4 text-left">
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Name</span>
                <span className="font-medium text-gray-900">{firstName} {lastName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Email</span>
                <span className="font-medium text-gray-900">{email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Role</span>
                <span className="font-medium text-gray-900">{selectedUserType?.name ?? "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Permissions</span>
                <span className="font-medium text-gray-900">{selectedPermissions.size} Assigned</span>
              </div>
            </div>
          </div>
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              onClick={() => router.push("/dashboard/team")}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              Back to Team
            </button>
            <button
              onClick={() => {
                setSubmitted(false);
                setFirstName("");
                setLastName("");
                setEmail("");
                setPhone("");
                setUserTypeId("");
                setDepartment("");
                setSelectedPermissions(new Set());
                setErrors({});
              }}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
            >
              <UserPlus className="h-4 w-4" />
              Create Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  const totalPermissions = permissionModules.reduce((sum, m) => sum + m.permissions.length, 0);
  const isLoading = loadingUserTypes || loadingPermissions;

  return (
    <div className="p-6 space-y-5">
      {/* Toast */}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      {/* ─── Header Banner ─── */}
      <div className="rounded-2xl bg-[#0f1e2e] p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Create Team Member</h1>
            <p className="text-xs text-gray-400">Add a new sub-account to your ETSS-Nigeria team</p>
          </div>
          <button
            onClick={() => router.push("/dashboard/team")}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-gray-300 transition-colors hover:bg-white/5 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Team
          </button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-5">
        {/* ─── Left Column: Form (3/5) ─── */}
        <div className="space-y-5 lg:col-span-3">
          {/* Step 1: Personal Information */}
          <Section title="Personal Information" description="Basic details for the new team member" icon={User} step={1}>
            <div className="space-y-4">
              {/* First Name & Last Name */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    First Name <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => { setFirstName(e.target.value); setErrors((p) => ({ ...p, firstName: "" })); }}
                      placeholder="e.g. Ngozi"
                      className={`w-full rounded-lg border bg-gray-50 py-2.5 pl-10 pr-3 text-sm text-gray-900 outline-none transition-colors focus:bg-white focus:ring-2 ${
                        errors.firstName
                          ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                          : "border-gray-200 focus:border-emerald-300 focus:ring-emerald-100"
                      }`}
                    />
                  </div>
                  {errors.firstName && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                      <AlertCircle className="h-3 w-3" /> {errors.firstName}
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    Last Name <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => { setLastName(e.target.value); setErrors((p) => ({ ...p, lastName: "" })); }}
                      placeholder="e.g. Adebayo"
                      className={`w-full rounded-lg border bg-gray-50 py-2.5 pl-10 pr-3 text-sm text-gray-900 outline-none transition-colors focus:bg-white focus:ring-2 ${
                        errors.lastName
                          ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                          : "border-gray-200 focus:border-emerald-300 focus:ring-emerald-100"
                      }`}
                    />
                  </div>
                  {errors.lastName && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                      <AlertCircle className="h-3 w-3" /> {errors.lastName}
                    </p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  Email Address <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: "" })); }}
                    placeholder="e.g. ngozi@maritime-etss.com"
                    className={`w-full rounded-lg border bg-gray-50 py-2.5 pl-10 pr-3 text-sm text-gray-900 outline-none transition-colors focus:bg-white focus:ring-2 ${
                      errors.email
                        ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                        : "border-gray-200 focus:border-emerald-300 focus:ring-emerald-100"
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                    <AlertCircle className="h-3 w-3" /> {errors.email}
                  </p>
                )}
              </div>

              {/* Phone + Role side by side */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Phone */}
                <div>
                  <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    Phone Number <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => { setPhone(e.target.value); setErrors((p) => ({ ...p, phone: "" })); }}
                      placeholder="+234 800 000 0000"
                      className={`w-full rounded-lg border bg-gray-50 py-2.5 pl-10 pr-3 text-sm text-gray-900 outline-none transition-colors focus:bg-white focus:ring-2 ${
                        errors.phone
                          ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                          : "border-gray-200 focus:border-emerald-300 focus:ring-emerald-100"
                      }`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                      <AlertCircle className="h-3 w-3" /> {errors.phone}
                    </p>
                  )}
                </div>

                {/* Role */}
                <div>
                  <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    Role / Designation <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <select
                      value={userTypeId}
                      onChange={(e) => { setUserTypeId(e.target.value); setErrors((p) => ({ ...p, role: "" })); }}
                      disabled={loadingUserTypes}
                      className={`w-full appearance-none rounded-lg border bg-gray-50 py-2.5 pl-10 pr-8 text-sm text-gray-900 outline-none transition-colors focus:bg-white focus:ring-2 ${
                        errors.role
                          ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                          : "border-gray-200 focus:border-emerald-300 focus:ring-emerald-100"
                      }`}
                    >
                      <option value="">{loadingUserTypes ? "Loading roles..." : "Select a role..."}</option>
                      {userTypes.map((ut) => (
                        <option key={ut.id} value={ut.id}>{ut.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  </div>
                  {errors.role && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                      <AlertCircle className="h-3 w-3" /> {errors.role}
                    </p>
                  )}
                </div>
              </div>

              {/* Department */}
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  Department
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Operations"
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-3 text-sm text-gray-900 outline-none transition-colors focus:border-emerald-300 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                  />
                </div>
              </div>
            </div>
          </Section>

          {/* Step 2: Permissions */}
          <Section title="Assigned Permissions" description="Control what this member can access" icon={Shield} step={2}>
            <div className="space-y-3">
              {/* Header actions */}
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  <span className="font-semibold text-gray-700">{selectedPermissions.size}</span> of {totalPermissions} permissions selected
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSelectAllPermissions}
                    className="text-xs font-medium text-emerald-600 hover:underline"
                  >
                    Select All
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    type="button"
                    onClick={handleClearAllPermissions}
                    className="text-xs font-medium text-red-500 hover:underline"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {errors.permissions && (
                <p className="flex items-center gap-1 text-xs text-red-500">
                  <AlertCircle className="h-3 w-3" /> {errors.permissions}
                </p>
              )}

              {/* Module Accordions */}
              <div className="space-y-2">
                {loadingPermissions ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                    <span className="ml-2 text-sm text-gray-500">Loading permissions...</span>
                  </div>
                ) : (
                  permissionModules
                    .filter((mod) => mod.permissions.length > 0)
                    .map((mod) => (
                      <PermissionGroup
                        key={mod.id}
                        module={mod}
                        selected={selectedPermissions}
                        onToggle={handleTogglePermission}
                        onToggleAll={handleToggleAll}
                      />
                    ))
                )}
              </div>
            </div>
          </Section>
        </div>

        {/* ─── Right Column: Summary (2/5) ─── */}
        <div className="lg:col-span-2 space-y-5">
          {/* Preview Card */}
          <div className="sticky top-20 space-y-5">
            <div className="rounded-xl border border-gray-200 bg-white">
              <div className="border-b border-gray-100 px-5 py-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Summary Preview</h3>
              </div>
              <div className="px-5 py-4">
                {/* Avatar + Name */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0f1e2e] text-sm font-bold text-white">
                    {firstName || lastName
                      ? `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
                      : "?"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{firstName || lastName ? `${firstName} ${lastName}`.trim() : "New Team Member"}</p>
                    <p className="text-xs text-gray-400 truncate">{email || "email@example.com"}</p>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Phone</span>
                    <span className="font-medium text-gray-700">{phone || "—"}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Role</span>
                    <span className="font-medium text-gray-700">{selectedUserType?.name || "—"}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Department</span>
                    <span className="font-medium text-gray-700">
                      {department || "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Account Type</span>
                    <span className="font-medium text-gray-700">Sub-Account</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Permissions</span>
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                      {selectedPermissions.size} Assigned
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Permissions Summary */}
            {selectedPermissions.size > 0 && (
              <div className="rounded-xl border border-gray-200 bg-white">
                <div className="border-b border-gray-100 px-5 py-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Permissions Breakdown</h3>
                </div>
                <div className="px-5 py-4 space-y-2">
                  {permissionModules.map((mod) => {
                    const count = mod.permissions.filter((p) => selectedPermissions.has(p.id)).length;
                    if (count === 0) return null;
                    return (
                      <div key={mod.id} className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">{mod.name}</span>
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600">
                          {count}/{mod.permissions.length}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <button
                onClick={handleSubmit}
                disabled={createTeamMember.isPending || isLoading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createTeamMember.isPending ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <UserPlus className="h-4 w-4" />
                )}
                {createTeamMember.isPending ? "Creating..." : "Create Team Member"}
              </button>
              <button
                onClick={() => router.push("/dashboard/team")}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
            </div>

            {/* Note */}
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
              <p className="text-[11px] text-amber-700 leading-relaxed">
                <span className="font-semibold">Note:</span> An activation email will be sent with login
                instructions. The member must activate their account before accessing the
                platform. All creation actions are logged for audit.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

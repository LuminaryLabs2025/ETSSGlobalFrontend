"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Building2,
  MapPin,
  FileText,
  CheckCircle2,
  X,
  AlertCircle,
  ChevronDown,
  UserPlus,
  Shield,
  Truck,
  Ship,
  Landmark,
  Warehouse,
  Loader2,
} from "lucide-react";
import { useUserTypes } from "@/hooks/useUserTypes";
import { useCreateUser } from "@/hooks/users/useUserActions";

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

// ─── Category Icon ───
function getCategoryIcon(category: string): React.ElementType {
  switch (category) {
    case "Terminal": return Landmark;
    case "Facility": return Warehouse;
    case "Transit Park": return MapPin;
    case "Shipping": return Ship;
    case "Enforcement": return Shield;
    case "Tow": return Truck;
    default: return Building2;
  }
}

// ─── Main Page ───
export function CreateUserPage() {
  const router = useRouter();

  // API hooks
  const { data: externalUserTypes = [], isLoading: loadingUserTypes } = useUserTypes({ category: "EXTERNAL" });
  const createUser = useCreateUser();

  // Form state
  const [userTypeId, setUserTypeId] = useState("");
  const [orgName, setOrgName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [extraFields, setExtraFields] = useState<Record<string, unknown>>({});

  const [sameAsOrgName, setSameAsOrgName] = useState(false);

  // UI state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const selectedUserType = externalUserTypes.find((ut) => ut.id === userTypeId);
  const metadataFields = selectedUserType?.metadata?.fields ?? [];
  const bondedTerminalFieldName = metadataFields.find((f) => f.label === "Name of Bonded Terminal")?.name;

  // Sync "Name of Bonded Terminal" with orgName when checkbox is checked
  useEffect(() => {
    if (sameAsOrgName && bondedTerminalFieldName) {
      setExtraFields((prev) => ({ ...prev, [bondedTerminalFieldName]: orgName }));
    }
  }, [sameAsOrgName, orgName, bondedTerminalFieldName]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  }, []);

  // Handle user type change — reset extra fields
  const handleUserTypeChange = (id: string) => {
    setUserTypeId(id);
    setExtraFields({});
    setSameAsOrgName(false);
    setErrors((p) => ({ ...p, userType: "" }));
  };

  // Handle extra field change
  const handleExtraFieldChange = (name: string, value: unknown) => {
    setExtraFields((prev) => ({ ...prev, [name]: value }));
    setErrors((p) => ({ ...p, [name]: "" }));
  };

  // Handle multi-select toggle
  const handleMultiSelectToggle = (name: string, value: string) => {
    setExtraFields((prev) => {
      const current = (prev[name] as string[]) || [];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [name]: next };
    });
    setErrors((p) => ({ ...p, [name]: "" }));
  };

  // ─── Validation ───
  const validate = () => {
    const errs: Record<string, string> = {};
    if (!userTypeId) errs.userType = "Please select a user type";
    if (!orgName.trim()) errs.orgName = "Organization name is required";
    if (!firstName.trim()) errs.firstName = "First name is required";
    if (!lastName.trim()) errs.lastName = "Last name is required";
    if (!email.trim()) errs.email = "Email address is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errs.email = "Enter a valid email address";
    if (!phone.trim()) errs.phone = "Phone number is required";

    // Validate metadata fields
    for (const field of metadataFields) {
      if (!field.required || field.autoPopulated) continue;
      const val = extraFields[field.name];
      if (field.type === "multi-select") {
        if (!val || (val as string[]).length === 0) {
          errs[field.name] = `${field.label} is required`;
        }
      } else if (!val || (typeof val === "string" && !val.trim())) {
        errs[field.name] = `${field.label} is required`;
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ─── Submit ───
  const handleSubmit = () => {
    if (!validate()) return;

    // Build extra_fields from metadata, including auto-populated values
    const builtExtraFields: Record<string, unknown> = { ...extraFields };
    for (const field of metadataFields) {
      if (field.autoPopulated && field.autoPopulatedValue) {
        builtExtraFields[field.name] = field.autoPopulatedValue;
      }
      // Convert number fields
      if (field.type === "number" && builtExtraFields[field.name]) {
        builtExtraFields[field.name] = Number(builtExtraFields[field.name]);
      }
    }

    createUser.mutate(
      {
        user_type_id: userTypeId,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        organization_name: orgName.trim(),
        address: address.trim(),
        extra_fields: builtExtraFields,
      },
      {
        onSuccess: () => {
          setSubmitted(true);
          showToast(`User account successfully created for ${orgName}`);
        },
      }
    );
  };

  // ─── Reset Form ───
  const resetForm = () => {
    setSubmitted(false);
    setUserTypeId("");
    setOrgName("");
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setAddress("");
    setSameAsOrgName(false);
    setExtraFields({});
    setErrors({});
  };

  // ─── Success State ───
  if (submitted) {
    return (
      <div className="p-6 space-y-5">
        <div className="mx-auto max-w-lg rounded-2xl border border-gray-200 bg-white p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">User Account Created</h2>
          <p className="mt-2 text-sm text-gray-600">
            A new <span className="font-semibold">{selectedUserType?.name ?? ""}</span> account has been created for{" "}
            <span className="font-semibold">{orgName}</span>. An automated email with login credentials and
            onboarding instructions has been sent to <span className="font-semibold">{email}</span>.
          </p>
          <div className="mt-4 rounded-lg border border-gray-100 bg-gray-50 p-4 text-left">
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Organization</span>
                <span className="font-medium text-gray-900">{orgName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Contact Person</span>
                <span className="font-medium text-gray-900">{firstName} {lastName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">User Type</span>
                <span className="font-medium text-gray-900">{selectedUserType?.name ?? ""}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Email</span>
                <span className="font-medium text-gray-900">{email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Account Type</span>
                <span className="font-medium text-gray-900">Primary</span>
              </div>
            </div>
          </div>
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              onClick={() => router.push("/dashboard/users")}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              Back to Users
            </button>
            <button
              onClick={resetForm}
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

  return (
    <div className="p-6 space-y-5">
      {/* Toast */}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      {/* ─── Header Banner ─── */}
      <div className="rounded-2xl bg-[#0f1e2e] p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Create New User</h1>
            <p className="text-xs text-gray-400">Onboard a new operational entity into the ETSS-Nigeria platform</p>
          </div>
          <button
            onClick={() => router.push("/dashboard/users")}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-gray-300 transition-colors hover:bg-white/5 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Users
          </button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-5">
        {/* ─── Left Column: Form (3/5) ─── */}
        <div className="space-y-5 lg:col-span-3">
          {/* Step 1: Select User Type */}
          <Section title="User Type" description="Select the type of user account to create" icon={Shield} step={1}>
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                User Type <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <select
                  value={userTypeId}
                  onChange={(e) => handleUserTypeChange(e.target.value)}
                  disabled={loadingUserTypes}
                  className={`w-full appearance-none rounded-lg border bg-gray-50 py-2.5 pl-10 pr-8 text-sm text-gray-900 outline-none transition-colors focus:bg-white focus:ring-2 ${
                    errors.userType
                      ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                      : "border-gray-200 focus:border-emerald-300 focus:ring-emerald-100"
                  }`}
                >
                  <option value="">{loadingUserTypes ? "Loading user types..." : "Select a user type..."}</option>
                  {externalUserTypes.map((ut) => (
                    <option key={ut.id} value={ut.id}>
                      {ut.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              </div>
              {errors.userType && (
                <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                  <AlertCircle className="h-3 w-3" /> {errors.userType}
                </p>
              )}

              {/* Selected type indicator */}
              {selectedUserType && (
                <div className="mt-3 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
                  {(() => {
                    const CatIcon = getCategoryIcon(selectedUserType.category);
                    return <CatIcon className="h-4 w-4 text-emerald-600" />;
                  })()}
                  <span className="text-xs font-medium text-emerald-700">
                    Category: {selectedUserType.category}
                  </span>
                  {metadataFields.length > 0 && (
                    <span className="text-xs text-emerald-500">
                      — {metadataFields.filter((f) => !f.autoPopulated).length} additional fields
                    </span>
                  )}
                </div>
              )}
            </div>
          </Section>

          {/* Step 2: Common Information */}
          <Section title="Organization & Contact" description="Common details for the new user account" icon={Building2} step={2}>
            <div className="space-y-4">
              {/* Organization Name */}
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  Organization Name <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={orgName}
                    onChange={(e) => { setOrgName(e.target.value); setErrors((p) => ({ ...p, orgName: "" })); }}
                    placeholder="e.g. APM Terminals Apapa"
                    className={`w-full rounded-lg border bg-gray-50 py-2.5 pl-10 pr-3 text-sm text-gray-900 outline-none transition-colors focus:bg-white focus:ring-2 ${
                      errors.orgName
                        ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                        : "border-gray-200 focus:border-emerald-300 focus:ring-emerald-100"
                    }`}
                  />
                </div>
                {errors.orgName && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                    <AlertCircle className="h-3 w-3" /> {errors.orgName}
                  </p>
                )}
              </div>

              {/* First Name + Last Name */}
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
                      placeholder="e.g. Ayo"
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
                      placeholder="e.g. Moses"
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

              {/* Email + Phone */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                      placeholder="e.g. admin@company.com"
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
              </div>

              {/* Address */}
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  Address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Wharf Road, Apapa, Lagos"
                    rows={2}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-3 text-sm text-gray-900 outline-none transition-colors focus:border-emerald-300 focus:bg-white focus:ring-2 focus:ring-emerald-100 resize-none"
                  />
                </div>
              </div>

            </div>
          </Section>

          {/* Step 3: Type-Specific Fields (Dynamic from metadata) */}
          {selectedUserType && metadataFields.length > 0 && (
            <Section
              title={`${selectedUserType.name} Details`}
              description={`Additional fields specific to ${selectedUserType.name} accounts`}
              icon={getCategoryIcon(selectedUserType.category)}
              step={3}
            >
              <div className="space-y-4">
                {metadataFields.map((field) => {
                  // Skip auto-populated fields (they are set automatically on submit)
                  if (field.autoPopulated) {
                    return (
                      <div key={field.name}>
                        <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                          {field.label}
                        </label>
                        <input
                          type="text"
                          value={field.autoPopulatedValue ?? ""}
                          disabled
                          className="w-full rounded-lg border border-gray-200 bg-gray-100 py-2.5 px-3 text-sm text-gray-500 cursor-not-allowed"
                        />
                        <p className="mt-1 text-[10px] text-gray-400">Auto-populated</p>
                      </div>
                    );
                  }

                  if (field.type === "multi-select" && field.options) {
                    const selectedValues = (extraFields[field.name] as string[]) || [];
                    return (
                      <div key={field.name}>
                        <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                          {field.label} {field.required && <span className="text-red-400">*</span>}
                        </label>
                        <div className={`rounded-lg border p-3 space-y-2 ${
                          errors[field.name] ? "border-red-300" : "border-gray-200"
                        }`}>
                          {field.options.map((opt) => {
                            const isSelected = selectedValues.includes(opt.value);
                            return (
                              <label
                                key={opt.value}
                                className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 transition-colors hover:bg-gray-50"
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => handleMultiSelectToggle(field.name, opt.value)}
                                  className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                />
                                <span className="text-sm text-gray-700">{opt.label}</span>
                              </label>
                            );
                          })}
                        </div>
                        {selectedValues.length > 0 && (
                          <p className="mt-1 text-[10px] text-gray-400">{selectedValues.length} selected</p>
                        )}
                        {errors[field.name] && (
                          <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                            <AlertCircle className="h-3 w-3" /> {errors[field.name]}
                          </p>
                        )}
                      </div>
                    );
                  }

                  if (field.type === "select" && field.options) {
                    return (
                      <div key={field.name}>
                        <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                          {field.label} {field.required && <span className="text-red-400">*</span>}
                        </label>
                        <div className="relative">
                          <select
                            value={(extraFields[field.name] as string) || ""}
                            onChange={(e) => handleExtraFieldChange(field.name, e.target.value)}
                            className={`w-full appearance-none rounded-lg border bg-gray-50 py-2.5 pl-3 pr-8 text-sm text-gray-900 outline-none transition-colors focus:bg-white focus:ring-2 ${
                              errors[field.name]
                                ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                                : "border-gray-200 focus:border-emerald-300 focus:ring-emerald-100"
                            }`}
                          >
                            <option value="">{field.placeholder || `Select ${field.label}...`}</option>
                            {field.options.map((opt) => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        </div>
                        {errors[field.name] && (
                          <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                            <AlertCircle className="h-3 w-3" /> {errors[field.name]}
                          </p>
                        )}
                      </div>
                    );
                  }

                  // Default: string, number, text
                  const isBondedTerminalName = field.name === bondedTerminalFieldName;
                  return (
                    <div key={field.name}>
                      <div className="mb-1.5 flex items-center justify-between">
                        <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                          {field.label} {field.required && <span className="text-red-400">*</span>}
                        </label>
                        {isBondedTerminalName && (
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={sameAsOrgName}
                              onChange={(e) => {
                                setSameAsOrgName(e.target.checked);
                                if (e.target.checked) {
                                  handleExtraFieldChange(field.name, orgName);
                                }
                              }}
                              className="h-3.5 w-3.5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                            />
                            <span className="text-[11px] text-gray-500">Same as Organization Name</span>
                          </label>
                        )}
                      </div>
                      <input
                        type={field.type === "number" ? "number" : "text"}
                        value={(extraFields[field.name] as string) || ""}
                        onChange={(e) => {
                          handleExtraFieldChange(field.name, e.target.value);
                          if (isBondedTerminalName) setSameAsOrgName(false);
                        }}
                        disabled={isBondedTerminalName && sameAsOrgName}
                        placeholder={field.placeholder || `Enter ${field.label}`}
                        className={`w-full rounded-lg border bg-gray-50 py-2.5 px-3 text-sm text-gray-900 outline-none transition-colors focus:bg-white focus:ring-2 ${
                          errors[field.name]
                            ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                            : "border-gray-200 focus:border-emerald-300 focus:ring-emerald-100"
                        } ${isBondedTerminalName && sameAsOrgName ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""}`}
                      />
                      {errors[field.name] && (
                        <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                          <AlertCircle className="h-3 w-3" /> {errors[field.name]}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </Section>
          )}
        </div>

        {/* ─── Right Column: Summary (2/5) ─── */}
        <div className="lg:col-span-2 space-y-5">
          <div className="sticky top-20 space-y-5">
            {/* Preview Card */}
            <div className="rounded-xl border border-gray-200 bg-white">
              <div className="border-b border-gray-100 px-5 py-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Summary Preview</h3>
              </div>
              <div className="px-5 py-4">
                {/* Avatar + Name */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0f1e2e] text-sm font-bold text-white">
                    {orgName
                      ? orgName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
                      : "?"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{orgName || "Organization Name"}</p>
                    <p className="text-xs text-gray-400 truncate">{firstName || lastName ? `${firstName} ${lastName}`.trim() : "Contact Person"}</p>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">User Type</span>
                    <span className="font-medium text-gray-700">{selectedUserType?.name || "—"}</span>
                  </div>
                  {selectedUserType && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Category</span>
                      <span className="font-medium text-gray-700">{selectedUserType.category}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Email</span>
                    <span className="font-medium text-gray-700 truncate ml-4">{email || "—"}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Phone</span>
                    <span className="font-medium text-gray-700">{phone || "—"}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Account Type</span>
                    <span className="font-medium text-gray-700">Primary</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Type-Specific Summary */}
            {selectedUserType && metadataFields.length > 0 && Object.keys(extraFields).some((k) => {
              const val = extraFields[k];
              return Array.isArray(val) ? val.length > 0 : !!val;
            }) && (
              <div className="rounded-xl border border-gray-200 bg-white">
                <div className="border-b border-gray-100 px-5 py-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">{selectedUserType.name} Details</h3>
                </div>
                <div className="px-5 py-4 space-y-2">
                  {metadataFields.filter((f) => !f.autoPopulated).map((field) => {
                    const val = extraFields[field.name];
                    if (!val || (Array.isArray(val) && val.length === 0)) return null;
                    const displayVal = Array.isArray(val)
                      ? (val as string[]).map((v) => field.options?.find((o) => o.value === v)?.label ?? v).join(", ")
                      : field.type === "select" && field.options
                        ? field.options.find((o) => o.value === val)?.label ?? String(val)
                        : String(val);
                    return (
                      <div key={field.name} className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">{field.label}</span>
                        <span className="font-medium text-gray-700 truncate ml-4 text-right">{displayVal}</span>
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
                disabled={createUser.isPending || loadingUserTypes}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createUser.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <UserPlus className="h-4 w-4" />
                )}
                {createUser.isPending ? "Creating Account..." : "Create User Account"}
              </button>
              <button
                onClick={() => router.push("/dashboard/users")}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                <p className="text-[11px] text-emerald-700 leading-relaxed">
                  <span className="font-semibold">Primary Account:</span> This creates a Primary account user.
                  The primary user can then create other team members (sub-accounts) within their organization.
                </p>
              </div>
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                <p className="text-[11px] text-amber-700 leading-relaxed">
                  <span className="font-semibold">Audit Notice:</span> All user creation and modification actions
                  are recorded in the audit trail for accountability and compliance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Building2,
  Search,
  Download,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  Clock,
  Mail,
  Phone,
  MapPin,
  Shield,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Eye,
  Edit2,
  Trash2,
  Users,
  UsersRound,
} from "lucide-react";
import { toast } from "sonner";
import { useCompanies } from "@/hooks/companies/useCompanies";
import { useCompany } from "@/hooks/companies/useCompany";
import { useDeleteCompany, useUpdateCompany } from "@/hooks/companies/useCompanyActions";
import { TableActionsDropdown } from "@/components/dashboard/TableActionsDropdown";
import type {
  CompaniesSummary,
  Company,
  CompanyDetail,
  UpdateCompanyPayload,
} from "@/types/companies.types";

const PAGE_SIZE = 20;
const STATUS_FILTERS = ["All", "ACTIVE", "INACTIVE"] as const;

function formatLabel(value: string) {
  if (value === "All") return "All";
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function displayOrDash(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : "—";
}

function buildCompaniesSummary(companies: Company[]): CompaniesSummary {
  const byType = new Map<string, number>();
  let active = 0;
  let inactive = 0;

  for (const company of companies) {
    if (company.is_active) active += 1;
    else inactive += 1;
    const typeName = company.user_type?.name ?? "Unknown";
    byType.set(typeName, (byType.get(typeName) ?? 0) + 1);
  }

  return {
    total: companies.length,
    active,
    inactive,
    by_user_type: Array.from(byType.entries()).map(([user_type, count]) => ({
      user_type,
      count,
    })),
  };
}

function ActiveBadge({ isActive }: { isActive: boolean }) {
  if (isActive) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
        <CheckCircle2 className="h-3 w-3" />
        Active
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-700">
      <XCircle className="h-3 w-3" />
      Inactive
    </span>
  );
}

function UserTypeBadge({ type }: { type: string }) {
  const config: Record<string, string> = {
    Transporter: "bg-blue-50 text-blue-700",
    "Terminal Operator": "bg-cyan-50 text-cyan-700",
    "Bonded Terminal": "bg-teal-50 text-teal-700",
    "Truck Park": "bg-indigo-50 text-indigo-700",
    "Fish-Van Park": "bg-sky-50 text-sky-700",
    EPT: "bg-orange-50 text-orange-700",
    Pregate: "bg-amber-50 text-amber-700",
    "Shipping Lines": "bg-violet-50 text-violet-700",
    NPA: "bg-emerald-50 text-emerald-700",
  };
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[11px] font-medium whitespace-nowrap ${
        config[type] ?? "bg-gray-100 text-gray-700"
      }`}
    >
      {type}
    </span>
  );
}

function ConfirmDialog({
  title,
  message,
  confirmLabel,
  danger,
  isPending,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  danger?: boolean;
  isPending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onCancel} />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl border border-gray-200 bg-white p-6 shadow-2xl">
        <h3 className="text-sm font-bold text-gray-900">{title}</h3>
        <p className="mt-2 text-sm text-gray-600">{message}</p>
        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            onClick={onCancel}
            disabled={isPending}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50 ${
              danger ? "bg-red-600 hover:bg-red-700" : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </>
  );
}

function SummaryPanel({ summary }: { summary: CompaniesSummary }) {
  const statusCards = [
    { label: "Total Companies", value: summary.total, icon: Building2, color: "text-blue-400", bg: "bg-blue-400/10" },
    { label: "Active", value: summary.active, icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-400/10" },
    { label: "Inactive", value: summary.inactive, icon: XCircle, color: "text-red-400", bg: "bg-red-400/10" },
  ];

  const typeCounts = [...summary.by_user_type].sort((a, b) => b.count - a.count).slice(0, 6);

  return (
    <div className="rounded-2xl bg-[#0f1e2e] p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Companies</h1>
          <p className="text-xs text-gray-400">All registered companies across the ETSS-Nigeria platform</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {statusCards.map((card) => (
          <div key={card.label} className="rounded-xl bg-white/5 p-4 transition-colors hover:bg-white/10">
            <div className="mb-2 flex items-center gap-2">
              <div className={`rounded-lg p-1.5 ${card.bg}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{card.value}</p>
            <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-gray-500">{card.label}</p>
          </div>
        ))}
      </div>

      {typeCounts.length > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {typeCounts.map((t) => (
            <div
              key={t.user_type}
              className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3 transition-colors hover:bg-white/10"
            >
              <div>
                <p className="text-lg font-bold text-white">{t.count}</p>
                <p className="truncate text-[10px] font-medium uppercase tracking-wider text-gray-500">
                  {t.user_type}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CompanyDetailDrawer({
  company: fallbackCompany,
  onClose,
  formatTimestamp,
}: {
  company: Company;
  onClose: () => void;
  formatTimestamp: (ts: string) => string;
}) {
  const { data: detail, isLoading, isError } = useCompany(fallbackCompany.id);
  const company: CompanyDetail = detail ?? fallbackCompany;
  const users = company.users ?? [];
  const teamMembers = company.team_members ?? [];

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[460px] flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 bg-[#0f1e2e] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600/20">
              <Building2 className="h-5 w-5 text-emerald-400" />
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-sm font-bold text-white">{company.name}</h2>
              <p className="truncate text-[11px] text-gray-400">{displayOrDash(company.email)}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-6">
          {isLoading && (
            <div className="flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-xs text-gray-500">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-500" />
              Loading company details...
            </div>
          )}
          {isError && (
            <div className="flex items-center gap-2 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-xs text-amber-700">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              Some detail fields may be unavailable. Showing cached company data.
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <ActiveBadge isActive={company.is_active} />
            <UserTypeBadge type={company.user_type?.name ?? "Unknown"} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <div className="mb-2 flex items-center gap-2">
                <div className="rounded-lg bg-blue-100 p-1.5">
                  <Mail className="h-3.5 w-3.5 text-blue-600" />
                </div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Email</p>
              </div>
              <p className="truncate text-xs font-medium text-gray-900">{displayOrDash(company.email)}</p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <div className="mb-2 flex items-center gap-2">
                <div className="rounded-lg bg-emerald-100 p-1.5">
                  <Phone className="h-3.5 w-3.5 text-emerald-600" />
                </div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Phone</p>
              </div>
              <p className="text-xs font-medium text-gray-900">{displayOrDash(company.phone)}</p>
            </div>
            <div className="col-span-2 rounded-xl border border-gray-100 bg-gray-50 p-4">
              <div className="mb-2 flex items-center gap-2">
                <div className="rounded-lg bg-violet-100 p-1.5">
                  <MapPin className="h-3.5 w-3.5 text-violet-600" />
                </div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Address</p>
              </div>
              <p className="text-xs font-medium text-gray-900">{displayOrDash(company.address)}</p>
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white">
            <div className="border-b border-gray-100 px-4 py-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Company Details</p>
            </div>
            <div className="divide-y divide-gray-50">
              {[
                { label: "Company ID", value: company.id, mono: true },
                { label: "Name", value: company.name },
                { label: "Email", value: displayOrDash(company.email) },
                { label: "Phone", value: displayOrDash(company.phone) },
                { label: "Website", value: displayOrDash(company.website) },
                { label: "Address", value: displayOrDash(company.address) },
                { label: "User Type", value: displayOrDash(company.user_type?.name) },
                { label: "User Type Category", value: displayOrDash(company.user_type?.category) },
                { label: "Status", value: company.is_active ? "Active" : "Inactive" },
              ].map(({ label, value, mono }) => (
                <div key={label} className="flex items-start justify-between gap-4 px-4 py-3">
                  <p className="shrink-0 text-xs text-gray-500">{label}</p>
                  <p className={`text-right text-xs font-medium text-gray-800 ${mono ? "font-mono" : ""}`}>
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Linked Users</p>
              {!isLoading && (
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600">
                  {users.length}
                </span>
              )}
            </div>
            {isLoading ? (
              <div className="flex items-center gap-2 px-4 py-4 text-xs text-gray-500">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-500" />
                Loading linked users...
              </div>
            ) : users.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {users.map((user) => (
                  <div key={user.id} className="px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900">
                          {`${user.first_name} ${user.last_name}`.trim()}
                        </p>
                        <p className="truncate text-xs text-gray-500">{user.email}</p>
                      </div>
                      {user.status && (
                        <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
                          {formatLabel(user.status)}
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-gray-400">
                      {user.account_type && <span>{formatLabel(user.account_type)}</span>}
                      {user.is_super_admin && (
                        <span className="inline-flex items-center gap-0.5 text-violet-600">
                          <Shield className="h-3 w-3" /> Super Admin
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-4 py-3">
                <p className="text-xs text-gray-400">No linked users for this company.</p>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-gray-100 bg-white">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Team Members</p>
              {!isLoading && (
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600">
                  {teamMembers.length}
                </span>
              )}
            </div>
            {isLoading ? (
              <div className="flex items-center gap-2 px-4 py-4 text-xs text-gray-500">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-500" />
                Loading team members...
              </div>
            ) : teamMembers.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {teamMembers.map((member) => (
                  <div key={member.id} className="px-4 py-3">
                    <p className="text-sm font-semibold text-gray-900">
                      {`${member.first_name} ${member.last_name}`.trim()}
                    </p>
                    <p className="truncate text-xs text-gray-500">{member.email}</p>
                    <p className="mt-1 text-[11px] text-gray-400">
                      {member.is_active ? "Active" : "Inactive"}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-4 py-3">
                <p className="text-xs text-gray-400">No team members linked to this company.</p>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-gray-100 bg-white">
            <div className="border-b border-gray-100 px-4 py-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Timestamps</p>
            </div>
            <div className="divide-y divide-gray-50">
              <div className="flex items-center justify-between px-4 py-3">
                <p className="text-xs text-gray-500">Created At</p>
                <p className="flex items-center gap-1 text-xs font-medium text-gray-800">
                  <Clock className="h-3 w-3 text-gray-400" />
                  {formatTimestamp(company.created_at)}
                </p>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <p className="text-xs text-gray-500">Last Updated</p>
                <p className="flex items-center gap-1 text-xs font-medium text-gray-800">
                  <Clock className="h-3 w-3 text-gray-400" />
                  {formatTimestamp(company.updated_at)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function EditCompanyModal({
  company,
  onClose,
  onSaved,
}: {
  company: Company;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { data: detail, isLoading: detailLoading } = useCompany(company.id);
  const updateCompany = useUpdateCompany();

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (initialized) return;
    if (detailLoading && !detail) return;

    const source = detail ?? company;
    setName(source.name ?? "");
    setAddress(source.address ?? "");
    setPhone(source.phone ?? "");
    setWebsite(source.website ?? "");
    setIsActive(source.is_active);
    setInitialized(true);
  }, [detail, detailLoading, company, initialized]);

  function validate() {
    const nextErrors: Record<string, string> = {};
    if (!name.trim()) nextErrors.name = "Company name is required.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSave() {
    if (!validate()) return;

    const payload: UpdateCompanyPayload = {
      name: name.trim(),
      address: address.trim(),
      phone: phone.trim(),
      website: website.trim(),
      is_active: isActive,
    };

    updateCompany.mutate(
      { id: company.id, payload },
      {
        onSuccess: () => {
          toast.success("Company updated successfully.");
          onSaved();
          onClose();
        },
      },
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/40" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-[70] flex max-h-[90vh] w-full max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col rounded-2xl border border-gray-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0f1e2e]">
              <Edit2 className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">Edit Company</h2>
              <p className="text-xs text-gray-500">{company.name}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
          {detailLoading && !initialized && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-500" />
              Loading company details...
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-700">
              Company Name <span className="text-red-500">*</span>
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 ${
                errors.name ? "border-red-300" : "border-gray-200"
              }`}
            />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-700">Address</label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-700">Phone</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-700">Website</label>
              <input
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 px-4 py-3">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
            />
            <div>
              <p className="text-sm font-semibold text-gray-900">Active Company</p>
              <p className="text-xs text-gray-500">Inactive companies are hidden from operational workflows.</p>
            </div>
          </label>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={updateCompany.isPending}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={updateCompany.isPending}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {updateCompany.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Changes
          </button>
        </div>
      </div>
    </>
  );
}

function ActionsMenu({
  company,
  onAction,
}: {
  company: Company;
  onAction: (action: string, company: Company) => void;
}) {
  const actions = [
    { label: "View Details", icon: Eye, action: "view" },
    { label: "Edit Company", icon: Edit2, action: "edit" },
    { label: "Delete Company", icon: Trash2, action: "delete", danger: true },
  ];

  return (
    <TableActionsDropdown width={208}>
      {(close) => (
        <>
          {actions.map((a) => (
            <button
              key={a.action}
              onClick={() => {
                close();
                onAction(a.action, company);
              }}
              className={`flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-gray-50 ${
                a.danger ? "text-red-600" : "text-gray-700"
              }`}
            >
              <a.icon className="h-3.5 w-3.5" />
              {a.label}
            </button>
          ))}
        </>
      )}
    </TableActionsDropdown>
  );
}

export function CompaniesPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_FILTERS)[number]>("All");
  const [userTypeFilter, setUserTypeFilter] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [confirm, setConfirm] = useState<{
    title: string;
    message: string;
    confirmLabel: string;
    danger?: boolean;
    onConfirm: () => void;
  } | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [editCompany, setEditCompany] = useState<Company | null>(null);

  const { data: companies = [], isLoading, isError } = useCompanies();
  const deleteCompany = useDeleteCompany();

  useEffect(() => {
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [search]);

  const userTypeOptions = useMemo(() => {
    const types = new Set<string>();
    for (const company of companies) {
      if (company.user_type?.name) types.add(company.user_type.name);
    }
    return ["All", ...Array.from(types).sort()];
  }, [companies]);

  const filteredCompanies = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    return companies.filter((company) => {
      if (statusFilter === "ACTIVE" && !company.is_active) return false;
      if (statusFilter === "INACTIVE" && company.is_active) return false;
      if (userTypeFilter !== "All" && company.user_type?.name !== userTypeFilter) return false;
      if (!q) return true;
      return [
        company.name,
        company.email,
        company.phone,
        company.address,
        company.website,
        company.user_type?.name,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q));
    });
  }, [companies, debouncedSearch, statusFilter, userTypeFilter]);

  const summary = useMemo(() => buildCompaniesSummary(companies), [companies]);

  const totalPages = Math.max(1, Math.ceil(filteredCompanies.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedCompanies = filteredCompanies.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const hasActiveFilters = search || statusFilter !== "All" || userTypeFilter !== "All";
  const activeFilterCount = [statusFilter !== "All", userTypeFilter !== "All"].filter(Boolean).length;

  const formatTimestamp = (ts: string) =>
    new Date(ts).toLocaleString("en-NG", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  function clearFilters() {
    setSearch("");
    setDebouncedSearch("");
    setStatusFilter("All");
    setUserTypeFilter("All");
    setPage(1);
  }

  function handleExport(format: "csv" | "pdf") {
    toast.info(`Export as ${format.toUpperCase()} — coming soon.`);
  }

  function handleAction(action: string, company: Company) {
    if (action === "view") {
      setSelectedCompany(company);
      return;
    }
    if (action === "edit") {
      setEditCompany(company);
      return;
    }
    if (action === "delete") {
      setConfirm({
        title: "Delete Company",
        message: `Are you sure you want to delete ${company.name}? This action cannot be undone.`,
        confirmLabel: "Delete Company",
        danger: true,
        onConfirm: () => {
          setConfirm(null);
          deleteCompany.mutate(company.id, {
            onSuccess: () => toast.success(`${company.name} has been deleted.`),
          });
        },
      });
    }
  }

  return (
    <div className="space-y-5 p-6">
      {confirm && (
        <ConfirmDialog
          {...confirm}
          isPending={deleteCompany.isPending}
          onCancel={() => setConfirm(null)}
        />
      )}

      {selectedCompany && (
        <CompanyDetailDrawer
          company={selectedCompany}
          onClose={() => setSelectedCompany(null)}
          formatTimestamp={formatTimestamp}
        />
      )}

      {editCompany && (
        <EditCompanyModal
          company={editCompany}
          onClose={() => setEditCompany(null)}
          onSaved={() => setEditCompany(null)}
        />
      )}

      <SummaryPanel summary={summary} />

      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-50 flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, phone, or address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-emerald-300 focus:bg-white focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
              showFilters || hasActiveFilters
                ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                : "border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Filter className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
                {activeFilterCount}
              </span>
            )}
          </button>

          <div className="group relative">
            <button className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50">
              <Download className="h-4 w-4" />
              Export
              <ChevronDown className="h-3 w-3" />
            </button>
            <div className="absolute right-0 top-full z-20 mt-1 hidden w-36 rounded-lg border border-gray-200 bg-white py-1 shadow-lg group-hover:block">
              <button
                onClick={() => handleExport("csv")}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <FileText className="h-3.5 w-3.5 text-gray-400" /> CSV
              </button>
              <button
                onClick={() => handleExport("pdf")}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <FileText className="h-3.5 w-3.5 text-red-500" /> PDF
              </button>
            </div>
          </div>
        </div>

        {showFilters && (
          <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-gray-100 pt-3">
            <div className="relative">
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                User Type
              </label>
              <select
                value={userTypeFilter}
                onChange={(e) => {
                  setUserTypeFilter(e.target.value);
                  setPage(1);
                }}
                className="appearance-none rounded-lg border border-gray-200 bg-white py-1.5 pl-3 pr-8 text-xs text-gray-700 outline-none focus:border-emerald-300"
              >
                {userTypeOptions.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute bottom-2.5 right-2 h-3 w-3 text-gray-400" />
            </div>

            <div className="relative">
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as (typeof STATUS_FILTERS)[number]);
                  setPage(1);
                }}
                className="appearance-none rounded-lg border border-gray-200 bg-white py-1.5 pl-3 pr-8 text-xs text-gray-700 outline-none focus:border-emerald-300"
              >
                {STATUS_FILTERS.map((s) => (
                  <option key={s} value={s}>
                    {formatLabel(s)}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute bottom-2.5 right-2 h-3 w-3 text-gray-400" />
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50"
              >
                <X className="h-3 w-3" />
                Clear All
              </button>
            )}
          </div>
        )}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
          <span className="ml-2 text-sm text-gray-500">Loading companies…</span>
        </div>
      )}

      {isError && (
        <div className="flex items-center justify-center py-20">
          <p className="text-sm text-red-500">Failed to load companies. Please try again.</p>
        </div>
      )}

      {!isLoading && !isError && (
        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-250">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                    Company
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                    User Type
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                    Contact
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                    Users
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                    Created
                  </th>
                  <th className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedCompanies.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Building2 className="h-8 w-8 text-gray-300" />
                        <p className="text-sm font-medium text-gray-400">No companies match your filters</p>
                        {hasActiveFilters && (
                          <button
                            onClick={clearFilters}
                            className="text-xs font-medium text-emerald-600 hover:underline"
                          >
                            Clear all filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedCompanies.map((company) => (
                    <tr key={company.id} className="transition-colors hover:bg-gray-50/80">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0f1e2e]">
                            <Building2 className="h-4 w-4 text-emerald-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-xs font-medium text-gray-900">{company.name}</p>
                            <p className="truncate text-[11px] text-gray-400">{displayOrDash(company.address)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <UserTypeBadge type={company.user_type?.name ?? "Unknown"} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-0.5">
                          <p className="flex items-center gap-1 truncate text-xs text-gray-600">
                            <Mail className="h-3 w-3 shrink-0 text-gray-400" />
                            {displayOrDash(company.email)}
                          </p>
                          <p className="flex items-center gap-1 truncate text-[11px] text-gray-400">
                            <Phone className="h-3 w-3 shrink-0 text-gray-400" />
                            {displayOrDash(company.phone)}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3 text-xs text-gray-600">
                          <span className="inline-flex items-center gap-1">
                            <Users className="h-3 w-3 text-gray-400" />
                            {company.users?.length ?? 0}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <UsersRound className="h-3 w-3 text-gray-400" />
                            {company.team_members?.length ?? 0}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <ActiveBadge isActive={company.is_active} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Clock className="h-3 w-3 shrink-0 text-gray-400" />
                          {formatTimestamp(company.created_at)}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <ActionsMenu company={company} onAction={handleAction} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
            <p className="text-xs text-gray-500">
              Showing{" "}
              <span className="font-medium text-gray-700">
                {filteredCompanies.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}
              </span>
              –
              <span className="font-medium text-gray-700">
                {Math.min(currentPage * PAGE_SIZE, filteredCompanies.length)}
              </span>{" "}
              of <span className="font-medium text-gray-700">{filteredCompanies.length}</span> companies
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(Math.max(1, currentPage - 1))}
                disabled={currentPage <= 1}
                className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`h-7 w-7 rounded-lg text-xs font-medium transition-colors ${
                    p === currentPage ? "bg-emerald-600 text-white" : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage >= totalPages}
                className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-center gap-2 text-[11px] text-gray-400">
        <Shield className="h-3.5 w-3.5" />
        Company records are managed by SuperAdmin users. All changes are logged for audit.
      </div>
    </div>
  );
}

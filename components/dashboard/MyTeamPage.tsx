"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Download,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  Clock,
  User,
  Mail,
  Shield,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
  UserPlus,
  Archive,
  Ban,
  Power,
  Send,
  MoreHorizontal,
  Building2,
  Briefcase,
  Loader2,
} from "lucide-react";
import { useTeamMembers } from "@/hooks/team/useTeamMembers";
import { useTeamSummary } from "@/hooks/team/useTeamSummary";
import {
  useDisableTeamMember,
  useEnableTeamMember,
  useArchiveTeamMember,
  useResendTeamInvite,
} from "@/hooks/team/useTeamActions";
import { toast } from "sonner";
import type { TeamMember, TeamSummaryResponse } from "@/types/team.types";

// ─── Filter Options ───
const ACCOUNT_TYPES = ["All", "SYSTEM", "PRIMARY", "SUB_ACCOUNT"];
const STATUSES = ["All", "ACTIVE", "INACTIVE", "AWAITING_ACTIVATION", "ARCHIVED"];
const PAGE_SIZE = 20;

/** Format API enum values for display (e.g. SUB_ACCOUNT → Sub Account) */
function formatLabel(value: string) {
  if (value === "All") return "All";
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// ─── Status Badge ───
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, string> = {
    ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
    INACTIVE: "bg-red-50 text-red-700 border-red-200",
    AWAITING_ACTIVATION: "bg-amber-50 text-amber-700 border-amber-200",
    ARCHIVED: "bg-gray-50 text-gray-700 border-gray-200",
  };
  const icons: Record<string, React.ElementType> = {
    ACTIVE: CheckCircle2,
    INACTIVE: XCircle,
    AWAITING_ACTIVATION: AlertCircle,
    ARCHIVED: Archive,
  };
  const Icon = icons[status] ?? AlertCircle;
  const label = formatLabel(status);
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${config[status] ?? "bg-gray-50 text-gray-700 border-gray-200"}`}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}

// ─── User Type Badge ───
function UserTypeBadge({ type }: { type: string }) {
  const config: Record<string, string> = {
    "ETSS-Nigeria SuperAdmin": "bg-violet-50 text-violet-700",
    "Super Admin": "bg-violet-50 text-violet-700",
    "ETSS Admin": "bg-violet-50 text-violet-700",
    "Customer Service Personnel": "bg-blue-50 text-blue-700",
    "Traffic Manager": "bg-cyan-50 text-cyan-700",
    "Gate Ops Personnel": "bg-amber-50 text-amber-700",
    "Road Marshall": "bg-indigo-50 text-indigo-700",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium whitespace-nowrap ${config[type] ?? "bg-gray-100 text-gray-700"}`}>
      {type}
    </span>
  );
}

// ─── Account Type Badge ───
function AccountBadge({ type }: { type: string }) {
  const isPrimary = type === "SYSTEM" || type === "PRIMARY";
  const label = formatLabel(type);
  return (
    <span
      className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${
        isPrimary ? "bg-violet-50 text-violet-600" : "bg-gray-100 text-gray-600"
      }`}
    >
      {label}
    </span>
  );
}


// ─── Confirm Dialog ───
function ConfirmDialog({
  title,
  message,
  confirmLabel,
  danger,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  danger?: boolean;
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
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`rounded-lg px-4 py-2 text-sm font-medium text-white ${
              danger ? "bg-red-600 hover:bg-red-700" : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Summary Panel ───
function SummaryPanel({ summary }: { summary: TeamSummaryResponse | undefined }) {
  const statusCards = [
    { label: "Total Members", value: summary?.total ?? 0, icon: Users, color: "text-blue-400", bg: "bg-blue-400/10" },
    { label: "Active", value: summary?.active ?? 0, icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-400/10" },
    { label: "Inactive", value: summary?.inactive ?? 0, icon: XCircle, color: "text-red-400", bg: "bg-red-400/10" },
    { label: "Awaiting Activation", value: summary?.awaiting_activation ?? 0, icon: AlertCircle, color: "text-amber-400", bg: "bg-amber-400/10" },
  ];

  const typeCounts = [...(summary?.by_user_type ?? [])]
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  return (
    <div className="rounded-2xl bg-[#0f1e2e] p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">My Team Members</h1>
          <p className="text-xs text-gray-400">ETSS-Nigeria team management dashboard</p>
        </div>
        <Link
          href="/dashboard/team/invite"
          className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-emerald-700"
        >
          <UserPlus className="h-3.5 w-3.5" />
          Add Team Member
        </Link>
      </div>

      {/* Status Row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
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

      {/* User Type Breakdown */}
      {typeCounts.length > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {typeCounts.map((t) => (
            <div key={t.user_type} className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3 transition-colors hover:bg-white/10">
              <div>
                <p className="text-lg font-bold text-white">{t.count}</p>
                <p className="text-[10px] font-medium uppercase tracking-wider text-gray-500 truncate">{t.user_type}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Actions Menu ───
function ActionsMenu({
  member,
  onAction,
}: {
  member: TeamMember;
  onAction: (action: string, member: TeamMember) => void;
}) {
  const [open, setOpen] = useState(false);

  const actions: { label: string; icon: React.ElementType; action: string; danger?: boolean }[] = [];

  if (member.status === "ACTIVE") {
    actions.push({ label: "Disable User", icon: Ban, action: "disable", danger: true });
    actions.push({ label: "Archive User", icon: Archive, action: "archive", danger: true });
  } else if (member.status === "INACTIVE") {
    actions.push({ label: "Enable User", icon: Power, action: "enable" });
    actions.push({ label: "Archive User", icon: Archive, action: "archive", danger: true });
  } else if (member.status === "AWAITING_ACTIVATION") {
    actions.push({ label: "Resend Activation Mail", icon: Send, action: "resend" });
    actions.push({ label: "Archive User", icon: Archive, action: "archive", danger: true });
  } else if (member.status === "ARCHIVED") {
    actions.push({ label: "Enable User", icon: Power, action: "enable" });
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-20 mt-1 w-52 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
            {actions.map((a) => (
              <button
                key={a.action}
                onClick={() => {
                  setOpen(false);
                  onAction(a.action, member);
                }}
                className={`flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-gray-50 ${
                  a.danger ? "text-red-600" : "text-gray-700"
                }`}
              >
                <a.icon className="h-3.5 w-3.5" />
                {a.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Main Page ───
export function MyTeamPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [accountTypeFilter, setAccountTypeFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce search input
  useEffect(() => {
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [search]);

  const [confirm, setConfirm] = useState<{
    title: string;
    message: string;
    confirmLabel: string;
    danger?: boolean;
    onConfirm: () => void;
  } | null>(null);

  // ─── API Hooks ───
  const { data: summary } = useTeamSummary();
  const { data: teamData, isLoading, isError } = useTeamMembers({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
    status: statusFilter !== "All" ? statusFilter : undefined,
  });

  const disableMember = useDisableTeamMember();
  const enableMember = useEnableTeamMember();
  const archiveMember = useArchiveTeamMember();
  const resendInvite = useResendTeamInvite();

  const members = teamData?.data ?? [];
  const meta = teamData?.meta;
  const totalPages = meta?.total_pages ?? 1;
  const currentPage = meta?.page ?? page;

  const clearFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setAccountTypeFilter("All");
    setStatusFilter("All");
    setPage(1);
  };

  const hasActiveFilters =
    search ||
    accountTypeFilter !== "All" ||
    statusFilter !== "All";

  const activeFilterCount = [
    accountTypeFilter !== "All",
    statusFilter !== "All",
  ].filter(Boolean).length;

  const formatTimestamp = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleString("en-NG", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // ─── Export ───
  const handleExport = (format: "csv" | "pdf") => {
    alert(`Exporting team members as ${format.toUpperCase()}`);
  };

  // ─── Actions ───
  const handleAction = (action: string, member: TeamMember) => {
    const fullName = member.name;
    if (action === "disable") {
      setConfirm({
        title: "Disable User",
        message: `Are you sure you want to disable ${fullName}? Their access will be revoked immediately.`,
        confirmLabel: "Disable User",
        danger: true,
        onConfirm: () => {
          setConfirm(null);
          disableMember.mutate(member.id, {
            onSuccess: () => toast.success(`${fullName} has been disabled successfully`),
          });
        },
      });
    } else if (action === "enable") {
      setConfirm({
        title: "Enable User",
        message: `Are you sure you want to enable ${fullName}? Their access will be restored.`,
        confirmLabel: "Enable User",
        onConfirm: () => {
          setConfirm(null);
          enableMember.mutate(member.id, {
            onSuccess: () => toast.success(`${fullName} has been enabled successfully`),
          });
        },
      });
    } else if (action === "archive") {
      setConfirm({
        title: "Archive User",
        message: `Are you sure you want to archive ${fullName}? Their record will be moved to the archived list.`,
        confirmLabel: "Archive User",
        danger: true,
        onConfirm: () => {
          setConfirm(null);
          archiveMember.mutate(member.id, {
            onSuccess: () => toast.success(`${fullName} has been archived successfully`),
          });
        },
      });
    } else if (action === "resend") {
      setConfirm({
        title: "Resend Activation Mail",
        message: `Send a new activation email to ${member.email}?`,
        confirmLabel: "Send Email",
        onConfirm: () => {
          setConfirm(null);
          resendInvite.mutate(member.id, {
            onSuccess: () => toast.success(`Activation email sent to ${member.email}`),
          });
        },
      });
    }
  };

  return (
    <div className="p-6 space-y-5">
      {/* Confirm Dialog */}
      {confirm && (
        <ConfirmDialog
          title={confirm.title}
          message={confirm.message}
          confirmLabel={confirm.confirmLabel}
          danger={confirm.danger}
          onConfirm={confirm.onConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}

      {/* ─── Summary Panel ─── */}
      <SummaryPanel summary={summary} />

      {/* ─── Toolbar ─── */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-50">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-emerald-300 focus:bg-white focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          {/* Filter Toggle */}
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

          {/* Export */}
          <div className="relative group">
            <button className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50">
              <Download className="h-4 w-4" />
              Export
              <ChevronDown className="h-3 w-3" />
            </button>
            <div className="absolute right-0 top-full z-20 mt-1 hidden w-36 rounded-lg border border-gray-200 bg-white py-1 shadow-lg group-hover:block">
              <button onClick={() => handleExport("csv")} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                <FileText className="h-3.5 w-3.5 text-gray-400" /> CSV
              </button>
              <button onClick={() => handleExport("pdf")} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                <FileText className="h-3.5 w-3.5 text-red-500" /> PDF
              </button>
            </div>
          </div>
        </div>

        {/* ─── Filter Row ─── */}
        {showFilters && (
          <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-gray-100 pt-3">
            {/* Account Type */}
            <div className="relative">
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-gray-400">Account Type</label>
              <select
                value={accountTypeFilter}
                onChange={(e) => { setAccountTypeFilter(e.target.value); setPage(1); }}
                className="appearance-none rounded-lg border border-gray-200 bg-white py-1.5 pl-3 pr-8 text-xs text-gray-700 outline-none focus:border-emerald-300"
              >
                {ACCOUNT_TYPES.map((t) => <option key={t} value={t}>{formatLabel(t)}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute bottom-2.5 right-2 h-3 w-3 text-gray-400" />
            </div>

            {/* Status */}
            <div className="relative">
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-gray-400">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="appearance-none rounded-lg border border-gray-200 bg-white py-1.5 pl-3 pr-8 text-xs text-gray-700 outline-none focus:border-emerald-300"
              >
                {STATUSES.map((s) => <option key={s} value={s}>{formatLabel(s)}</option>)}
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

      {/* ─── Loading / Error ─── */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
          <span className="ml-2 text-sm text-gray-500">Loading team members…</span>
        </div>
      )}

      {isError && (
        <div className="flex items-center justify-center py-20">
          <p className="text-sm text-red-500">Failed to load team members. Please try again.</p>
        </div>
      )}

      {/* ─── Table ─── */}
      {!isLoading && !isError && (
        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-250">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">User</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">User Type</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">Account</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">Department</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">Status</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">Created</th>
                  <th className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {members.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Users className="h-8 w-8 text-gray-300" />
                        <p className="text-sm font-medium text-gray-400">No team members match your filters</p>
                        {hasActiveFilters && (
                          <button onClick={clearFilters} className="text-xs font-medium text-emerald-600 hover:underline">
                            Clear all filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  members.map((member) => {
                    const initials = member.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase();
                    return (
                      <tr key={member.id} className="transition-colors hover:bg-gray-50/80">
                        {/* User */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0f1e2e] text-[10px] font-bold text-white">
                              {initials}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-gray-900 truncate">{member.name}</p>
                              <p className="text-[11px] text-gray-400 truncate">{member.email}</p>
                            </div>
                          </div>
                        </td>
                        {/* User Type */}
                        <td className="px-4 py-3">
                          <UserTypeBadge type={member.user_type?.name ?? "Unknown"} />
                        </td>
                        {/* Account Type */}
                        <td className="px-4 py-3">
                          <AccountBadge type={member.account_type} />
                        </td>
                        {/* Department */}
                        <td className="px-4 py-3">
                          <span className="text-xs text-gray-600">{member.department ?? "—"}</span>
                        </td>
                        {/* Status */}
                        <td className="px-4 py-3">
                          <StatusBadge status={member.status} />
                        </td>
                        {/* Created */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <Clock className="h-3 w-3 text-gray-400 shrink-0" />
                            {formatTimestamp(member.created_at)}
                          </div>
                        </td>
                        {/* Actions */}
                        <td className="px-4 py-3 text-center">
                          <ActionsMenu member={member} onAction={handleAction} />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* ─── Pagination ─── */}
          <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
            <p className="text-xs text-gray-500">
              Showing{" "}
              <span className="font-medium text-gray-700">{(meta?.total ?? 0) === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}</span>
              –<span className="font-medium text-gray-700">{Math.min(currentPage * PAGE_SIZE, meta?.total ?? 0)}</span>
              {" "}of <span className="font-medium text-gray-700">{meta?.total ?? 0}</span> members
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(Math.max(1, currentPage - 1))}
                disabled={currentPage <= 1}
                className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
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
                className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Access Notice ─── */}
      <div className="flex items-center justify-center gap-2 text-[11px] text-gray-400">
        <Shield className="h-3.5 w-3.5" />
        Only SuperAdmin users have access to team management. All actions are logged for audit.
      </div>
    </div>
  );
}

"use client";

import { useState, useMemo } from "react";
import {
  Activity,
  Search,
  Download,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  Clock,
  User,
  Monitor,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Shield,
  Eye,
} from "lucide-react";
import { activityLogEntries, type ActivityLogEntry } from "@/lib/mock-data";

const USER_TYPES = ["All", "SuperAdmin", "Admin", "Operator", "Transporter", "Driver", "Terminal", "System"] as const;
const MODULES = ["All", "Auth", "Bookings", "Trucks", "Drivers", "Terminals", "Penalties & Fines", "e-Revenue", "Users & Team", "Settings"] as const;
const STATUSES = ["All", "Success", "Failed", "Pending"] as const;
const PAGE_SIZE = 10;

// ─── Status Badge ───
function StatusBadge({ status }: { status: ActivityLogEntry["status"] }) {
  const config = {
    Success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Failed: "bg-red-50 text-red-700 border-red-200",
    Pending: "bg-amber-50 text-amber-700 border-amber-200",
  };
  const icons = {
    Success: CheckCircle2,
    Failed: XCircle,
    Pending: AlertCircle,
  };
  const Icon = icons[status];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${config[status]}`}>
      <Icon className="h-3 w-3" />
      {status}
    </span>
  );
}

// ─── User Type Badge ───
function UserTypeBadge({ type }: { type: ActivityLogEntry["userType"] }) {
  const config: Record<string, string> = {
    SuperAdmin: "bg-violet-50 text-violet-700",
    Admin: "bg-blue-50 text-blue-700",
    Operator: "bg-cyan-50 text-cyan-700",
    Transporter: "bg-emerald-50 text-emerald-700",
    Driver: "bg-amber-50 text-amber-700",
    Terminal: "bg-indigo-50 text-indigo-700",
    System: "bg-gray-100 text-gray-600",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${config[type] || "bg-gray-100 text-gray-600"}`}>
      {type}
    </span>
  );
}

// ─── Summary Panel ───
function SummaryPanel({ entries }: { entries: ActivityLogEntry[] }) {
  const total = entries.length;
  const success = entries.filter((e) => e.status === "Success").length;
  const failed = entries.filter((e) => e.status === "Failed").length;
  const pending = entries.filter((e) => e.status === "Pending").length;

  const cards = [
    { label: "Total Activities", value: total, icon: Activity, color: "text-blue-400", bg: "bg-blue-400/10" },
    { label: "Successful", value: success, icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-400/10" },
    { label: "Failed", value: failed, icon: XCircle, color: "text-red-400", bg: "bg-red-400/10" },
    { label: "Pending", value: pending, icon: AlertCircle, color: "text-amber-400", bg: "bg-amber-400/10" },
  ];

  return (
    <div className="rounded-2xl bg-[#0f1e2e] p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Activity Log</h1>
          <p className="text-xs text-gray-400">Complete audit trail of all system activities</p>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-emerald-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          Live
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl bg-white/5 p-4 transition-colors hover:bg-white/10"
          >
            <div className="mb-2 flex items-center gap-2">
              <div className={`rounded-lg p-1.5 ${card.bg}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{card.value.toLocaleString()}</p>
            <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-gray-500">
              {card.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Detail Drawer ───
function DetailDrawer({
  entry,
  onClose,
}: {
  entry: ActivityLogEntry;
  onClose: () => void;
}) {
  const ts = new Date(entry.timestamp);
  const formattedDate = ts.toLocaleDateString("en-NG", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const formattedTime = ts.toLocaleTimeString("en-NG", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const fields = [
    { label: "Activity ID", value: entry.id, icon: FileText },
    { label: "Timestamp", value: `${formattedDate} at ${formattedTime}`, icon: Clock },
    { label: "User", value: entry.userName, icon: User },
    { label: "Email", value: entry.email, icon: User },
    { label: "Company", value: entry.company, icon: Shield },
    { label: "Module", value: entry.module, icon: FileText },
    { label: "IP Address", value: entry.ipAddress, icon: Monitor },
    { label: "Device", value: entry.device, icon: Monitor },
  ];

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-gray-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h2 className="text-sm font-bold text-gray-900">Activity Detail</h2>
            <p className="text-xs text-gray-500">{entry.id}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* Action + Status */}
          <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Action Performed</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">{entry.action}</p>
            <div className="mt-3 flex items-center gap-3">
              <StatusBadge status={entry.status} />
              <UserTypeBadge type={entry.userType} />
            </div>
          </div>

          {/* Fields */}
          <div className="space-y-4">
            {fields.map((f) => (
              <div key={f.label} className="flex items-start gap-3">
                <div className="rounded-lg bg-gray-100 p-2">
                  <f.icon className="h-4 w-4 text-gray-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">{f.label}</p>
                  <p className="mt-0.5 text-sm text-gray-900 break-all">{f.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Details */}
          {entry.details && (
            <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Details</p>
              <p className="mt-1 text-sm text-gray-700 leading-relaxed">{entry.details}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-3">
          <p className="text-center text-[10px] text-gray-400">
            Activity logs are immutable and retained for 12 months
          </p>
        </div>
      </div>
    </>
  );
}

// ─── Main Page ───
export function ActivityLogPage() {
  const [search, setSearch] = useState("");
  const [userTypeFilter, setUserTypeFilter] = useState<string>("All");
  const [moduleFilter, setModuleFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [page, setPage] = useState(1);
  const [selectedEntry, setSelectedEntry] = useState<ActivityLogEntry | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // ─── Filtering & Search ───
  const filtered = useMemo(() => {
    return activityLogEntries.filter((entry) => {
      // Search across name, email, action, module
      if (search) {
        const q = search.toLowerCase();
        const searchable = `${entry.userName} ${entry.email} ${entry.action} ${entry.module} ${entry.company}`.toLowerCase();
        if (!searchable.includes(q)) return false;
      }
      if (userTypeFilter !== "All" && entry.userType !== userTypeFilter) return false;
      if (moduleFilter !== "All" && entry.module !== moduleFilter) return false;
      if (statusFilter !== "All" && entry.status !== statusFilter) return false;
      return true;
    });
  }, [search, userTypeFilter, moduleFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const formatTimestamp = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleString("en-NG", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const clearFilters = () => {
    setSearch("");
    setUserTypeFilter("All");
    setModuleFilter("All");
    setStatusFilter("All");
    setPage(1);
  };

  const hasActiveFilters = search || userTypeFilter !== "All" || moduleFilter !== "All" || statusFilter !== "All";

  // ─── Export Handlers (stub) ───
  const handleExport = (format: "csv" | "excel" | "pdf") => {
    // In a real app, this would trigger a download via API
    alert(`Exporting ${filtered.length} records as ${format.toUpperCase()}`);
  };

  return (
    <div className="p-6 space-y-5">
      {/* ─── Summary Panel ─── */}
      <SummaryPanel entries={activityLogEntries} />

      {/* ─── Toolbar ─── */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-50">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, action, module..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
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
            {hasActiveFilters && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
                {[userTypeFilter !== "All", moduleFilter !== "All", statusFilter !== "All"].filter(Boolean).length}
              </span>
            )}
          </button>

          {/* Export Dropdown */}
          <div className="relative group">
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
                <FileText className="h-3.5 w-3.5 text-gray-400" />
                CSV
              </button>
              <button
                onClick={() => handleExport("excel")}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <FileText className="h-3.5 w-3.5 text-emerald-500" />
                Excel
              </button>
              <button
                onClick={() => handleExport("pdf")}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <FileText className="h-3.5 w-3.5 text-red-500" />
                PDF
              </button>
            </div>
          </div>
        </div>

        {/* ─── Filter Row (collapsible) ─── */}
        {showFilters && (
          <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-gray-100 pt-3">
            {/* User Type */}
            <div className="relative">
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-gray-400">User Type</label>
              <select
                value={userTypeFilter}
                onChange={(e) => { setUserTypeFilter(e.target.value); setPage(1); }}
                className="appearance-none rounded-lg border border-gray-200 bg-white py-1.5 pl-3 pr-8 text-xs text-gray-700 outline-none focus:border-emerald-300"
              >
                {USER_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute bottom-2.5 right-2 h-3 w-3 text-gray-400" />
            </div>

            {/* Module */}
            <div className="relative">
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-gray-400">Module</label>
              <select
                value={moduleFilter}
                onChange={(e) => { setModuleFilter(e.target.value); setPage(1); }}
                className="appearance-none rounded-lg border border-gray-200 bg-white py-1.5 pl-3 pr-8 text-xs text-gray-700 outline-none focus:border-emerald-300"
              >
                {MODULES.map((m) => <option key={m} value={m}>{m}</option>)}
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
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
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

      {/* ─── Table ─── */}
      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-250">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">S/No</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">Timestamp</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">User</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">User Type</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">Company</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">Action</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">Module</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">IP / Device</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">Status</th>
                <th className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-gray-500">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Activity className="h-8 w-8 text-gray-300" />
                      <p className="text-sm font-medium text-gray-400">No activities match your filters</p>
                      {hasActiveFilters && (
                        <button onClick={clearFilters} className="text-xs font-medium text-emerald-600 hover:underline">
                          Clear all filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paged.map((entry, idx) => {
                  const serialNo = (currentPage - 1) * PAGE_SIZE + idx + 1;
                  return (
                    <tr
                      key={entry.id}
                      onClick={() => setSelectedEntry(entry)}
                      className="cursor-pointer transition-colors hover:bg-gray-50/80"
                    >
                      <td className="px-4 py-3 text-xs font-medium text-gray-400">{serialNo}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-xs text-gray-700">
                          <Clock className="h-3 w-3 text-gray-400 shrink-0" />
                          {formatTimestamp(entry.timestamp)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs font-medium text-gray-900">{entry.userName}</p>
                        <p className="text-[11px] text-gray-400">{entry.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <UserTypeBadge type={entry.userType} />
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">{entry.company}</td>
                      <td className="px-4 py-3 text-xs font-medium text-gray-800 max-w-45 truncate">{entry.action}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">
                          {entry.module}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-[11px] font-mono text-gray-500">{entry.ipAddress}</p>
                        <p className="text-[10px] text-gray-400">{entry.device}</p>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={entry.status} />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedEntry(entry); }}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-emerald-50 hover:text-emerald-600"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
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
            Showing <span className="font-medium text-gray-700">{((currentPage - 1) * PAGE_SIZE) + 1}</span>
            –<span className="font-medium text-gray-700">{Math.min(currentPage * PAGE_SIZE, filtered.length)}</span>
            {" "}of <span className="font-medium text-gray-700">{filtered.length}</span> activities
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
                  p === currentPage
                    ? "bg-emerald-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
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

      {/* ─── Retention Notice ─── */}
      <div className="flex items-center justify-center gap-2 text-[11px] text-gray-400">
        <Shield className="h-3.5 w-3.5" />
        Activity logs are immutable and retained for 12 months. All entries are tamper-proof.
      </div>

      {/* ─── Detail Drawer ─── */}
      {selectedEntry && (
        <DetailDrawer entry={selectedEntry} onClose={() => setSelectedEntry(null)} />
      )}
    </div>
  );
}

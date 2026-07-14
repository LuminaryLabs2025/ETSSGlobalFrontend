"use client";

import { useState } from "react";
import {
  Ticket,
  Search,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronRight as Chevron,
  X,
  Clock,
  Eye,
  Edit2,
  Ban,
  Download,
  FileText,
  MoreHorizontal,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Shield,
  Building2,
  User,
  Users,
  Plus,
  Zap,
  Anchor,
  Activity,
  CheckCircle2,
  History,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth.store";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { useUtilityTickets } from "@/hooks/utility-tickets/useUtilityTickets";
import { useUtilityTicketsSummary } from "@/hooks/utility-tickets/useUtilityTicketsSummary";
import { useUtilityTicket } from "@/hooks/utility-tickets/useUtilityTicket";
import {
  useGenerateUtilityTicket,
  useEditUtilityTicket,
  useApproveUtilityTicket,
  useCancelUtilityTicket,
  useExportUtilityTickets,
  useDownloadUtilityETicket,
} from "@/hooks/utility-tickets/useUtilityTicketActions";
import type {
  UtilityTicket,
  UtilityTicketStatus,
  UtilityTerminalType,
  UtilityRequestType,
  UtilityTicketsSummaryResponse,
  UtilityTicketsListParams,
  EditUtilityTicketPayload,
  GenerateUtilityTicketPayload,
} from "@/types/utility-tickets.types";

const PAGE_SIZE = 10;

type SortField = "date_raised" | "status" | "terminal_name";
type SortDir = "asc" | "desc";

const STATUS_OPTIONS: (UtilityTicketStatus | "All")[] = [
  "All", "PENDING", "IN_PROGRESS", "RESOLVED", "CLOSED",
];

const RAISED_BY_OPTIONS = [
  "All",
  "Femi Okunlola",
  "Emeka Okafor",
  "Amina Suleiman",
  "Chidi Okafor",
  "SuperAdmin",
];

const REQUEST_TYPE_LABELS: Record<UtilityRequestType, string> = {
  POWER: "Power",
  WATER: "Water",
  MAINTENANCE: "Maintenance",
  WASTE_MANAGEMENT: "Waste Management",
  SECURITY: "Security",
  FUEL: "Fuel",
  OTHER: "Other",
};

function buildSortParam(field: SortField, dir: SortDir): string {
  const prefix = dir === "desc" ? "-" : "";
  if (field === "terminal_name") return `${prefix}terminal_name`;
  return `${prefix}${field}`;
}

function formatTimestamp(ts: string) {
  return new Date(ts).toLocaleString("en-NG", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
}

function StatusBadge({ status }: { status: UtilityTicketStatus }) {
  const map: Record<UtilityTicketStatus, string> = {
    PENDING: "bg-amber-50 text-amber-700 border-amber-200",
    IN_PROGRESS: "bg-blue-50 text-blue-700 border-blue-200",
    RESOLVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
    CLOSED: "bg-gray-100 text-gray-500 border-gray-200",
  };
  const labels: Record<UtilityTicketStatus, string> = {
    PENDING: "Pending",
    IN_PROGRESS: "In Progress",
    RESOLVED: "Resolved",
    CLOSED: "Closed",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${map[status]}`}>
      {labels[status]}
    </span>
  );
}

function TerminalTypeBadge({ type }: { type: UtilityTerminalType }) {
  const isPort = type === "PORT";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${
      isPort ? "border-orange-200 bg-orange-50 text-orange-700" : "border-teal-200 bg-teal-50 text-teal-700"
    }`}>
      {isPort ? <Anchor className="h-3 w-3" /> : <Building2 className="h-3 w-3" />}
      {isPort ? "Port" : "Non-Port"}
    </span>
  );
}

function PriorityBadge({ ticket }: { ticket: UtilityTicket }) {
  const isPriority = ticket.booking_priority === "PRIORITY";
  return (
    <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase ${
      isPriority ? "bg-red-50 text-red-600" : "bg-gray-100 text-gray-600"
    }`}>
      {isPriority ? <Zap className="h-3 w-3" /> : null}
      {isPriority ? "Priority" : "Standard"}
    </span>
  );
}

function SummaryPanel({
  summary,
  isLoading,
}: {
  summary?: UtilityTicketsSummaryResponse;
  isLoading?: boolean;
}) {
  const kpis = [
    { label: "Total Requests", value: summary?.total ?? 0, color: "text-blue-400", bg: "bg-blue-400/10", Icon: Ticket },
    { label: "Pending", value: summary?.pending ?? 0, color: "text-amber-400", bg: "bg-amber-400/10", Icon: Clock },
    { label: "In Progress", value: summary?.in_progress ?? 0, color: "text-cyan-400", bg: "bg-cyan-400/10", Icon: Activity },
    { label: "Resolved", value: summary?.resolved ?? 0, color: "text-emerald-400", bg: "bg-emerald-400/10", Icon: CheckCircle2 },
    { label: "Closed", value: summary?.closed ?? 0, color: "text-gray-400", bg: "bg-gray-400/10", Icon: Ban },
    { label: "Port Terminals", value: summary?.port_terminals ?? 0, color: "text-orange-400", bg: "bg-orange-400/10", Icon: Anchor },
    { label: "Non-Port", value: summary?.non_port_terminals ?? 0, color: "text-teal-400", bg: "bg-teal-400/10", Icon: Building2 },
  ];

  return (
    <div className="rounded-2xl bg-[#0f1e2e] p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Utility Ticket Management</h1>
          <p className="text-xs text-gray-400">Database of utility ticket requests from Port &amp; Non-Port Terminals</p>
        </div>
        <div className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5">
          <Shield className="h-3.5 w-3.5 text-amber-400" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-400">SuperAdmin</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-7">
        {isLoading ? (
          <div className="col-span-full flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-400" />
          </div>
        ) : (
          kpis.map((card) => (
            <div key={card.label} className="rounded-xl bg-white/5 p-4 transition-colors hover:bg-white/10">
              <div className="mb-2">
                <div className={`inline-flex rounded-lg p-1.5 ${card.bg}`}>
                  <card.Icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-white">{card.value}</p>
              <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-gray-500">{card.label}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function DetailDrawer({
  ticketId,
  onClose,
}: {
  ticketId: string;
  onClose: () => void;
}) {
  const { data: ticket, isLoading, isError } = useUtilityTicket(ticketId);

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[520px] flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between bg-[#0f1e2e] px-6 py-4">
          <div>
            <p className="font-mono text-sm font-bold text-white">{ticket?.ticket_id ?? "Loading..."}</p>
            {ticket && (
              <div className="mt-1 flex flex-wrap gap-1.5">
                <StatusBadge status={ticket.status} />
                <TerminalTypeBadge type={ticket.terminal.type} />
                <PriorityBadge ticket={ticket} />
              </div>
            )}
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-white/10"><X className="h-4 w-4" /></button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex flex-col items-center gap-2 py-12">
              <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
              <p className="text-sm text-gray-400">Loading ticket details...</p>
            </div>
          ) : isError || !ticket ? (
            <div className="flex flex-col items-center gap-2 py-12">
              <AlertCircle className="h-8 w-8 text-red-300" />
              <p className="text-sm text-gray-400">Failed to load ticket details</p>
            </div>
          ) : (
            <>
          <div className="rounded-xl border border-gray-100">
            <p className="border-b border-gray-100 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Full Request Description</p>
            <p className="px-4 py-3 text-sm leading-relaxed text-gray-700">{ticket.full_description}</p>
          </div>

          <div className="rounded-xl border border-gray-100">
            <p className="border-b border-gray-100 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Terminal Details</p>
            <div className="divide-y divide-gray-50">
              {[
                ["Terminal Name", ticket.terminal.name],
                ["Terminal Code", ticket.terminal.code],
                ["Terminal Type", ticket.terminal.type === "PORT" ? "Port Terminal" : "Non-Port Terminal"],
                ["Location", ticket.terminal.location],
                ["Request Type", REQUEST_TYPE_LABELS[ticket.request_type]],
                ["Delivery Company", ticket.delivery_company_name],
                ...(ticket.truck_plate_number ? [["Truck Plate No.", ticket.truck_plate_number]] : []),
              ].map(([label, value]) => (
                <div key={String(label)} className="flex items-start justify-between gap-4 px-4 py-2.5">
                  <p className="shrink-0 text-xs text-gray-500">{String(label)}</p>
                  <p className="text-right text-xs font-medium text-gray-800">{String(value)}</p>
                </div>
              ))}
            </div>
          </div>

          {ticket.assigned_personnel && ticket.assigned_personnel.length > 0 && (
            <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
              <p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-blue-600">
                <Users className="h-3.5 w-3.5" /> Assigned Personnel
              </p>
              {ticket.assigned_personnel.map((p) => (
                <div key={p.id} className="mt-2 rounded-lg bg-white p-3">
                  <p className="text-xs font-semibold text-gray-800">{p.name}</p>
                  <p className="text-[11px] text-gray-500">{p.role}</p>
                  <p className="mt-0.5 text-[10px] text-gray-400">Assigned {formatTimestamp(p.assigned_at)}</p>
                </div>
              ))}
            </div>
          )}

          <div className="rounded-xl border border-gray-100">
            <p className="border-b border-gray-100 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              <History className="mr-1 inline h-3.5 w-3.5" /> Request History
            </p>
            <div className="divide-y divide-gray-50">
              {[...(ticket.request_history ?? [])].reverse().map((h) => (
                <div key={h.id} className="px-4 py-3">
                  <div className="flex items-center justify-between">
                    <StatusBadge status={h.status} />
                    <span className="text-[10px] text-gray-400">{formatTimestamp(h.timestamp)}</span>
                  </div>
                  <p className="mt-1 text-[11px] text-gray-600">{h.notes}</p>
                  <p className="text-[10px] text-gray-400">{h.performed_by}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-[11px] text-gray-500">
            Raised by {ticket.raised_by.user_name} ({ticket.raised_by.user_id}) · {formatTimestamp(ticket.date_raised)}
          </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

function EditModal({
  ticket,
  onSave,
  onClose,
  isSaving,
}: {
  ticket: UtilityTicket;
  onSave: (payload: EditUtilityTicketPayload) => void;
  onClose: () => void;
  isSaving?: boolean;
}) {
  const [description, setDescription] = useState(ticket.full_description);
  const [requestType, setRequestType] = useState(ticket.request_type);
  const [deliveryCompany, setDeliveryCompany] = useState(ticket.delivery_company_name);
  const [truckPlate, setTruckPlate] = useState(ticket.truck_plate_number ?? "");
  const [status, setStatus] = useState(ticket.status);

  function handleSave() {
    if (!description.trim() || !deliveryCompany.trim()) {
      toast.error("Description and delivery company are required.");
      return;
    }
    onSave({
      full_description: description.trim(),
      request_type: requestType,
      delivery_company_name: deliveryCompany.trim(),
      truck_plate_number: truckPlate.trim() || undefined,
      status,
    });
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-full max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-gray-200 bg-white p-6 shadow-2xl">
        <h3 className="text-sm font-bold text-gray-900">Edit Utility Request</h3>
        <p className="font-mono text-xs text-gray-500">{ticket.ticket_id}</p>

        <div className="mt-4 space-y-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700">Request Type</label>
            <select
              value={requestType}
              onChange={(e) => setRequestType(e.target.value as UtilityRequestType)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-emerald-300"
            >
              {Object.entries(REQUEST_TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700">Delivery Company Name</label>
            <input
              value={deliveryCompany}
              onChange={(e) => setDeliveryCompany(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-emerald-300"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700">Truck Plate (optional — unregistered OK)</label>
            <input
              value={truckPlate}
              onChange={(e) => setTruckPlate(e.target.value)}
              placeholder="e.g. LAG-887-KJA"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-emerald-300"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as UtilityTicketStatus)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-emerald-300"
            >
              {STATUS_OPTIONS.filter((s) => s !== "All").map((s) => (
                <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700">Full Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-gray-200 p-3 text-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} disabled={isSaving} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50">Cancel</button>
          <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50">
            {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Changes
          </button>
        </div>
      </div>
    </>
  );
}

function ApproveModal({
  ticket,
  onApprove,
  onClose,
  isPending,
}: {
  ticket: UtilityTicket;
  onApprove: () => void;
  onClose: () => void;
  isPending?: boolean;
}) {
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl border border-gray-200 bg-white p-6 shadow-2xl">
        <h3 className="text-sm font-bold text-gray-900">Approve Utility Ticket</h3>
        <p className="mt-2 text-sm text-gray-600">
          Approve {ticket.ticket_id}? This will lock editing and generate the E-Utility Ticket.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} disabled={isPending} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50">Cancel</button>
          <button onClick={onApprove} disabled={isPending} className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50">
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Approve
          </button>
        </div>
      </div>
    </>
  );
}

function GenerateTicketModal({
  onGenerate,
  onClose,
  isSubmitting,
}: {
  onGenerate: (payload: GenerateUtilityTicketPayload) => void;
  onClose: () => void;
  isSubmitting?: boolean;
}) {
  const [terminalName, setTerminalName] = useState("");
  const [terminalCode, setTerminalCode] = useState("");
  const [terminalLocation, setTerminalLocation] = useState("");
  const [terminalType, setTerminalType] = useState<UtilityTerminalType>("PORT");
  const [requestType, setRequestType] = useState<UtilityRequestType>("POWER");
  const [deliveryCompany, setDeliveryCompany] = useState("");
  const [description, setDescription] = useState("");
  const [truckPlate, setTruckPlate] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!terminalName.trim() || !terminalCode.trim() || !terminalLocation.trim() || !deliveryCompany.trim() || !description.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }
    onGenerate({
      terminal_name: terminalName.trim(),
      terminal_code: terminalCode.trim(),
      terminal_location: terminalLocation.trim(),
      terminal_type: terminalType,
      request_type: requestType,
      delivery_company_name: deliveryCompany.trim(),
      description: description.trim(),
      truck_plate_number: truckPlate.trim() || undefined,
    });
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-full max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-gray-200 bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Generate Utility Ticket</h3>
            <p className="mt-0.5 text-xs text-gray-500">Create a utility ticket on behalf of a terminal. Port terminals receive Priority booking classification.</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100"><X className="h-4 w-4" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-700">Terminal Name *</label>
              <input value={terminalName} onChange={(e) => setTerminalName(e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-emerald-300" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-700">Terminal Code *</label>
              <input value={terminalCode} onChange={(e) => setTerminalCode(e.target.value)} placeholder="e.g. APM" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-emerald-300" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-700">Terminal Location *</label>
              <input value={terminalLocation} onChange={(e) => setTerminalLocation(e.target.value)} placeholder="e.g. Apapa, Lagos" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-emerald-300" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-700">Terminal Type *</label>
              <select value={terminalType} onChange={(e) => setTerminalType(e.target.value as UtilityTerminalType)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-emerald-300">
                <option value="PORT">Port Terminal (Priority)</option>
                <option value="NON_PORT">Non-Port Terminal (Standard)</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-700">Request Type *</label>
              <select value={requestType} onChange={(e) => setRequestType(e.target.value as UtilityRequestType)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-emerald-300">
                {Object.entries(REQUEST_TYPE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-700">Delivery Company Name *</label>
              <input value={deliveryCompany} onChange={(e) => setDeliveryCompany(e.target.value)} placeholder="Utility service provider" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-emerald-300" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700">Truck Plate (optional)</label>
            <input value={truckPlate} onChange={(e) => setTruckPlate(e.target.value)} placeholder="Unregistered trucks allowed" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-emerald-300" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700">Request Description *</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full rounded-lg border border-gray-200 p-3 text-sm outline-none focus:border-emerald-300" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Generate Utility Ticket
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export function UtilityTicketsPage() {
  const user = useAuthStore((s) => s.user);
  const isSuperAdmin = user?.is_super_admin ?? false;

  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [page, setPage] = useState(1);
  const { search, setSearch, debouncedSearch, resetSearch } = useDebouncedSearch("", () => setPage(1));
  const [statusFilter, setStatusFilter] = useState<UtilityTicketStatus | "All">("All");
  const [raisedByFilter, setRaisedByFilter] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState<SortField>("date_raised");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [sortActive, setSortActive] = useState(false);

  const [detailTicketId, setDetailTicketId] = useState<string | null>(null);
  const [editTicket, setEditTicket] = useState<UtilityTicket | null>(null);
  const [approveTicket, setApproveTicket] = useState<UtilityTicket | null>(null);
  const [cancelTarget, setCancelTarget] = useState<UtilityTicket | null>(null);

  const listParams: UtilityTicketsListParams = {
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
    status: statusFilter !== "All" ? statusFilter : undefined,
    raised_by: raisedByFilter !== "All" ? raisedByFilter : undefined,
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
    sort: sortActive ? buildSortParam(sortField, sortDir) : undefined,
  };

  const { data: summary, isLoading: summaryLoading } = useUtilityTicketsSummary(isSuperAdmin);
  const { data: ticketsData, isLoading, isError } = useUtilityTickets(listParams, isSuperAdmin);

  const generateTicket = useGenerateUtilityTicket();
  const editTicketMutation = useEditUtilityTicket();
  const approveTicketMutation = useApproveUtilityTicket();
  const cancelTicketMutation = useCancelUtilityTicket();
  const exportTickets = useExportUtilityTickets();
  const downloadETicket = useDownloadUtilityETicket();

  const tickets = Array.isArray(ticketsData?.data) ? ticketsData.data : [];
  const meta = ticketsData?.meta;
  const totalPages = meta?.total_pages ?? 1;
  const totalCount = meta?.total ?? 0;

  const hasActiveFilters =
    debouncedSearch || statusFilter !== "All" ||
    raisedByFilter !== "All" || dateFrom || dateTo;

  function clearFilters() {
    resetSearch();
    setStatusFilter("All");
    setRaisedByFilter("All");
    setDateFrom("");
    setDateTo("");
    setSortActive(false);
    setSortField("date_raised");
    setSortDir("desc");
    setPage(1);
  }

  function handleSort(field: SortField) {
    setSortActive(true);
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortField(field);
      setSortDir("asc");
    }
    setPage(1);
  }

  function SortIcon({ field }: { field: SortField }) {
    if (!sortActive || sortField !== field) return <ArrowUpDown className="ml-1 h-3 w-3 text-gray-300" />;
    return sortDir === "asc"
      ? <ArrowUp className="ml-1 h-3 w-3 text-emerald-600" />
      : <ArrowDown className="ml-1 h-3 w-3 text-emerald-600" />;
  }

  function handleExportCsv() {
    exportTickets.mutate(listParams, {
      onSuccess: () => toast.success("CSV export downloaded."),
    });
  }

  function handleCancel(ticket: UtilityTicket) {
    cancelTicketMutation.mutate(ticket.id, {
      onSuccess: (res) => {
        toast.success(res.message ?? `Utility ticket ${ticket.ticket_id} has been cancelled.`);
        setCancelTarget(null);
      },
    });
  }

  function ActionsMenu({ ticket }: { ticket: UtilityTicket }) {
    const [open, setOpen] = useState(false);
    const canEdit = !ticket.super_admin_approved && ticket.status !== "CLOSED";
    const canCancel = ticket.status !== "CLOSED";

    return (
      <div className="relative">
        <button onClick={() => setOpen(!open)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
          <MoreHorizontal className="h-4 w-4" />
        </button>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <div className="absolute right-0 top-full z-20 mt-1 w-60 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
              <button
                onClick={() => { setOpen(false); setDetailTicketId(ticket.id); }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <Eye className="h-3.5 w-3.5" /> View Utility Request Details
              </button>
              {canEdit && (
                <>
                  <button
                    onClick={() => { setOpen(false); setEditTicket(ticket); }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Edit2 className="h-3.5 w-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => { setOpen(false); setApproveTicket(ticket); }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-emerald-700 hover:bg-gray-50"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" /> Approve Ticket
                  </button>
                </>
              )}
              {canCancel && (
                <button
                  onClick={() => { setOpen(false); setCancelTarget(ticket); }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-gray-50"
                >
                  <Ban className="h-3.5 w-3.5" /> Cancel
                </button>
              )}
              {ticket.e_ticket_available && (
                <button
                  onClick={() => {
                    setOpen(false);
                    downloadETicket.mutate(ticket.id, {
                      onSuccess: () => toast.success(`E-Utility Ticket ${ticket.ticket_id} downloaded.`),
                    });
                  }}
                  disabled={downloadETicket.isPending}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-blue-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  <Download className="h-3.5 w-3.5" /> Download E-Utility Ticket
                </button>
              )}
            </div>
          </>
        )}
      </div>
    );
  }

  const SortableTH = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <th
      onClick={() => handleSort(field)}
      className="cursor-pointer select-none px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500 hover:text-gray-700"
    >
      <span className="inline-flex items-center">{children}<SortIcon field={field} /></span>
    </th>
  );

  const staticTH = (label: string) => (
    <th className="px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">{label}</th>
  );

  if (!isSuperAdmin) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-6">
        <Shield className="h-12 w-12 text-amber-400" />
        <h1 className="mt-4 text-lg font-bold text-gray-900">SuperAdmin Access Required</h1>
        <p className="mt-2 max-w-md text-center text-sm text-gray-500">
          Utility Ticket Management is restricted to SuperAdmin users only.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5 p-6">
      {detailTicketId && (
        <DetailDrawer
          ticketId={detailTicketId}
          onClose={() => setDetailTicketId(null)}
        />
      )}
      {editTicket && (
        <EditModal
          ticket={editTicket}
          onSave={(payload) => {
            editTicketMutation.mutate(
              { id: editTicket.id, payload },
              {
                onSuccess: (res) => {
                  toast.success(res.message ?? "Utility ticket updated successfully.");
                  setEditTicket(null);
                },
              },
            );
          }}
          onClose={() => setEditTicket(null)}
          isSaving={editTicketMutation.isPending}
        />
      )}
      {approveTicket && (
        <ApproveModal
          ticket={approveTicket}
          onApprove={() => {
            approveTicketMutation.mutate(approveTicket.id, {
              onSuccess: (res) => {
                toast.success(res.message ?? "Ticket approved. E-Utility Ticket is now available.");
                setApproveTicket(null);
              },
            });
          }}
          onClose={() => setApproveTicket(null)}
          isPending={approveTicketMutation.isPending}
        />
      )}
      {showGenerateModal && (
        <GenerateTicketModal
          onGenerate={(payload) => {
            generateTicket.mutate(payload, {
              onSuccess: (res) => {
                toast.success(res.message ?? "Utility ticket generated successfully.");
                setShowGenerateModal(false);
              },
            });
          }}
          onClose={() => setShowGenerateModal(false)}
          isSubmitting={generateTicket.isPending}
        />
      )}
      {cancelTarget && (
        <>
          <div className="fixed inset-0 z-40 bg-black/30" onClick={() => !cancelTicketMutation.isPending && setCancelTarget(null)} />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl border border-gray-200 bg-white p-6 shadow-2xl">
            <h3 className="text-sm font-bold text-gray-900">Cancel Utility Ticket</h3>
            <p className="mt-2 text-sm text-gray-600">Cancel {cancelTarget.ticket_id}? This action will close the ticket.</p>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setCancelTarget(null)} disabled={cancelTicketMutation.isPending} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50">Back</button>
              <button onClick={() => handleCancel(cancelTarget)} disabled={cancelTicketMutation.isPending} className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">
                {cancelTicketMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Cancel Ticket
              </button>
            </div>
          </div>
        </>
      )}

      <nav className="flex items-center gap-1.5 text-xs text-gray-500">
        <span>Administration</span>
        <Chevron className="h-3 w-3" />
        <span className="font-semibold text-gray-800">Utility Tickets</span>
      </nav>

      <SummaryPanel summary={summary} isLoading={summaryLoading} />

      <div className="rounded-xl border border-gray-200 bg-white px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0f1e2e]">
              <Ticket className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900">Utility Ticket Requests</h1>
              <p className="text-xs text-gray-500">All utility ticket requests from Port &amp; Non-Port Terminals</p>
            </div>
          </div>
          <button
            onClick={() => setShowGenerateModal(true)}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" /> Generate Utility Ticket
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-60 flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search terminal name or ticket ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-emerald-300 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                  showFilters || hasActiveFilters ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Filter className="h-4 w-4" /> Filters
              </button>
              <div className="relative group">
                <button className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
                  <Download className="h-4 w-4" /> Export<ChevronDown className="h-3 w-3" />
                </button>
                <div className="absolute right-0 top-full z-20 mt-1 hidden w-36 rounded-lg border border-gray-200 bg-white py-1 shadow-lg group-hover:block">
                  <button onClick={handleExportCsv} disabled={exportTickets.isPending} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                    {exportTickets.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-400" /> : <FileText className="h-3.5 w-3.5 text-gray-400" />}
                    CSV
                  </button>
                  <button
                    onClick={() => toast.info("Excel export — coming soon.")}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <FileText className="h-3.5 w-3.5 text-emerald-500" /> Excel
                  </button>
                  <button
                    onClick={() => toast.info("PDF export — coming soon.")}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <FileText className="h-3.5 w-3.5 text-red-500" /> PDF
                  </button>
                </div>
              </div>
            </div>

            {showFilters && (
              <div className="mt-3 flex flex-wrap items-end gap-4 border-t border-gray-100 pt-3">
                <div>
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-gray-400">Request Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value as UtilityTicketStatus | "All"); setPage(1); }}
                    className="rounded-lg border border-gray-200 py-1.5 pl-3 pr-8 text-xs outline-none focus:border-emerald-300"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s === "All" ? "All Statuses" : s.replace(/_/g, " ")}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-gray-400">Raised By</label>
                  <select
                    value={raisedByFilter}
                    onChange={(e) => { setRaisedByFilter(e.target.value); setPage(1); }}
                    className="rounded-lg border border-gray-200 py-1.5 pl-3 pr-8 text-xs outline-none focus:border-emerald-300"
                  >
                    {RAISED_BY_OPTIONS.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-gray-400">Date From</label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                    className="rounded-lg border border-gray-200 py-1.5 pl-3 text-xs outline-none focus:border-emerald-300"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-gray-400">Date To</label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                    className="rounded-lg border border-gray-200 py-1.5 pl-3 text-xs outline-none focus:border-emerald-300"
                  />
                </div>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50"
                  >
                    <X className="h-3 w-3" /> Clear All
                  </button>
                )}
              </div>
            )}
          </div>

          <p className="text-xs text-gray-500">
            Showing <span className="font-semibold text-gray-800">{totalCount}</span> request{totalCount !== 1 ? "s" : ""}
            {hasActiveFilters && " matching your filters"}
          </p>

          <div className="min-w-0 rounded-xl border border-gray-200 bg-white">
            <div className="overflow-x-auto">
              <table className="min-w-max w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/60">
                    {staticTH("S/No.")}
                    {staticTH("Ticket ID")}
                    <SortableTH field="terminal_name">Terminal Name</SortableTH>
                    {staticTH("Terminal Type")}
                    {staticTH("Request Type")}
                    {staticTH("Description")}
                    <SortableTH field="status">Status</SortableTH>
                    <SortableTH field="date_raised">Date Raised</SortableTH>
                    {staticTH("Last Updated")}
                    {staticTH("Raised By")}
                    <th className="px-3 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan={11} className="px-4 py-12 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
                          <p className="text-sm font-medium text-gray-400">Loading utility tickets...</p>
                        </div>
                      </td>
                    </tr>
                  ) : isError ? (
                    <tr>
                      <td colSpan={11} className="px-4 py-12 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <AlertCircle className="h-8 w-8 text-red-300" />
                          <p className="text-sm font-medium text-gray-400">Failed to load utility tickets</p>
                        </div>
                      </td>
                    </tr>
                  ) : tickets.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="px-4 py-12 text-center">
                        <Ticket className="mx-auto h-8 w-8 text-gray-300" />
                        <p className="mt-2 text-sm font-medium text-gray-400">No utility tickets match your filters</p>
                        {hasActiveFilters && (
                          <button onClick={clearFilters} className="mt-2 text-xs font-medium text-emerald-600 hover:underline">Clear all filters</button>
                        )}
                      </td>
                    </tr>
                  ) : (
                    tickets.map((t, idx) => (
                      <tr key={t.id} className="transition-colors hover:bg-gray-50/80">
                        <td className="px-3 py-3 text-xs font-medium text-gray-400">{(page - 1) * PAGE_SIZE + idx + 1}</td>
                        <td className="px-3 py-3">
                          <button
                            onClick={() => setDetailTicketId(t.id)}
                            className="font-mono text-xs font-bold text-emerald-700 hover:underline"
                          >
                            {t.ticket_id}
                          </button>
                          <div className="mt-0.5"><PriorityBadge ticket={t} /></div>
                        </td>
                        <td className="px-3 py-3">
                          <p className="text-sm font-semibold text-gray-900">{t.terminal.name}</p>
                          <p className="font-mono text-[10px] text-gray-400">{t.terminal.code}</p>
                        </td>
                        <td className="px-3 py-3"><TerminalTypeBadge type={t.terminal.type} /></td>
                        <td className="px-3 py-3">
                          <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-700">
                            {REQUEST_TYPE_LABELS[t.request_type]}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <p className="max-w-[200px] truncate text-xs text-gray-600" title={t.description}>{t.description}</p>
                          <p className="mt-0.5 text-[10px] text-gray-400">{t.delivery_company_name}</p>
                        </td>
                        <td className="px-3 py-3"><StatusBadge status={t.status} /></td>
                        <td className="px-3 py-3">
                          <span className="flex items-center gap-1 text-[11px] text-gray-500">
                            <Clock className="h-3 w-3" />{formatTimestamp(t.date_raised)}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <span className="text-[11px] text-gray-500">{formatTimestamp(t.last_updated_at)}</span>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3 text-gray-400" />
                            <div>
                              <p className="text-xs font-medium text-gray-800">{t.raised_by.user_name}</p>
                              <p className="text-[10px] text-gray-400">{t.raised_by.user_id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-center"><ActionsMenu ticket={t} /></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
              <p className="text-xs text-gray-500">
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, totalCount)} of {totalCount}
              </p>
              <div className="flex items-center gap-1">
                <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-lg border border-gray-200 p-1.5 disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button key={p} onClick={() => setPage(p)} className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium ${p === page ? "bg-emerald-600 text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>{p}</button>
                ))}
                <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="rounded-lg border border-gray-200 p-1.5 disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button>
              </div>
            </div>
          </div>

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <p className="mb-2 text-xs font-bold text-blue-700">Booking Priority Classification</p>
        <div className="grid gap-2 md:grid-cols-2">
          <div className="text-[11px] text-blue-700">
            <span className="font-semibold">Port Terminals → Priority:</span> Utility tickets from Port Terminals are treated as priority utility bookings.
          </div>
          <div className="text-[11px] text-blue-700">
            <span className="font-semibold">Non-Port Terminals → Standard:</span> Utility tickets from Non-Port Terminals are treated as standard utility bookings.
          </div>
        </div>
        <p className="mt-2 text-[11px] text-blue-600">
          Delivery company name is the utility service provider — trucks need not be registered on MARITIME-ETSS.
        </p>
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
        <p className="text-[11px] leading-relaxed text-amber-700">
          <span className="font-semibold">Audit Notice:</span> All SuperAdmin actions (export, filter, record view, edit, approve, cancel) are logged for audit purposes.
        </p>
      </div>
    </div>
  );
}

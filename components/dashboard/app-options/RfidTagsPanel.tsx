"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Radio,
  Search,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  Info,
  Upload,
  Download,
  FileSpreadsheet,
} from "lucide-react";
import { toast } from "sonner";
import { useRfidTags } from "@/hooks/rfid-tags/useRfidTags";
import { useRfidTag } from "@/hooks/rfid-tags/useRfidTag";
import {
  useBulkUploadRfidTags,
  useCreateRfidTag,
  useDeleteRfidTag,
  useUpdateRfidTag,
} from "@/hooks/rfid-tags/useRfidTagActions";
import { useTrucks } from "@/hooks/trucks/useTrucks";
import { TableActionsDropdown } from "@/components/dashboard/TableActionsDropdown";
import {
  RFID_TAG_STATUS_OPTIONS,
  type RfidTag,
  type RfidTagCreatePayload,
  type RfidTagUpdatePayload,
} from "@/types/rfid-tags.types";

const PAGE_SIZE = 20;
const STATUS_FILTERS = ["All", ...RFID_TAG_STATUS_OPTIONS.map((s) => s.value)] as const;
const ASSIGNED_STATUSES = new Set(["ASSIGNED", "ACTIVE"]);

function formatLabel(value: string) {
  if (value === "All") return "All";
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function displayOrDash(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : "—";
}

function isAssignedStatus(status: string) {
  return ASSIGNED_STATUSES.has(status);
}

function downloadRfidTemplate() {
  const csv = "rfid_tag_number\nRFID-00001\nRFID-00002\nRFID-00003\n";
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "rfid-tags-upload-template.csv";
  anchor.click();
  URL.revokeObjectURL(url);
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status.toUpperCase();
  if (normalized === "UNASSIGNED") {
    return (
      <span className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-[11px] font-medium text-sky-700">
        Unassigned
      </span>
    );
  }
  if (normalized === "ASSIGNED" || normalized === "ACTIVE") {
    return (
      <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
        {formatLabel(status)}
      </span>
    );
  }
  if (normalized === "LOST" || normalized === "DEACTIVATED" || normalized === "INACTIVE") {
    return (
      <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[11px] font-medium text-gray-500">
        {formatLabel(status)}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[11px] font-medium text-gray-600">
      {formatLabel(status)}
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
              danger ? "bg-red-600 hover:bg-red-700" : "bg-sky-600 hover:bg-sky-700"
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

function RfidTagCreateModal({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: () => void;
}) {
  const createTag = useCreateRfidTag();
  const { data: trucksData, isLoading: trucksLoading } = useTrucks({ page: 1, limit: 100 });

  const [rfidTagNumber, setRfidTagNumber] = useState("");
  const [status, setStatus] = useState("UNASSIGNED");
  const [truckId, setTruckId] = useState("");
  const [transporterName, setTransporterName] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const trucks = trucksData?.data ?? [];
  const requiresTruck = isAssignedStatus(status);

  function validate() {
    const nextErrors: Record<string, string> = {};
    if (!rfidTagNumber.trim()) nextErrors.rfid_tag_number = "RFID tag serial number is required.";
    if (requiresTruck && !truckId.trim()) {
      nextErrors.truck_id = "Select a truck when status is assigned.";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSave() {
    if (!validate()) return;

    const payload: RfidTagCreatePayload = {
      rfid_tag_number: rfidTagNumber.trim(),
      status,
      truck_id: requiresTruck ? truckId.trim() : null,
      transporter_name: transporterName.trim() || null,
    };

    createTag.mutate(payload, {
      onSuccess: () => {
        toast.success("RFID tag added successfully.");
        onSaved();
        onClose();
      },
    });
  }

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/40" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-[70] flex max-h-[90vh] w-full max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col rounded-2xl border border-gray-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0f1e2e]">
              <Radio className="h-4 w-4 text-sky-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">Add RFID Tag</h2>
              <p className="text-xs text-gray-500">Register a single tag serial number</p>
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
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-700">
              RFID Tag Serial Number <span className="text-red-500">*</span>
            </label>
            <input
              value={rfidTagNumber}
              onChange={(e) => setRfidTagNumber(e.target.value)}
              placeholder="e.g. RFID-00001"
              className={`w-full rounded-lg border px-3 py-2.5 font-mono text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 ${
                errors.rfid_tag_number ? "border-red-300" : "border-gray-200"
              }`}
            />
            {errors.rfid_tag_number && (
              <p className="mt-1 text-xs text-red-500">{errors.rfid_tag_number}</p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-700">Status</label>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                if (!isAssignedStatus(e.target.value)) setTruckId("");
              }}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            >
              {RFID_TAG_STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {requiresTruck && (
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                Assigned Truck <span className="text-red-500">*</span>
              </label>
              <select
                value={truckId}
                onChange={(e) => setTruckId(e.target.value)}
                disabled={trucksLoading}
                className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 disabled:opacity-60 ${
                  errors.truck_id ? "border-red-300" : "border-gray-200"
                }`}
              >
                <option value="">
                  {trucksLoading ? "Loading trucks…" : "Select registered truck…"}
                </option>
                {trucks.map((truck) => (
                  <option key={truck.id} value={truck.id}>
                    {truck.plate_number}
                    {truck.registered_by?.company_name
                      ? ` — ${truck.registered_by.company_name}`
                      : ""}
                  </option>
                ))}
              </select>
              {errors.truck_id && <p className="mt-1 text-xs text-red-500">{errors.truck_id}</p>}
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-700">Transporter Name</label>
            <input
              value={transporterName}
              onChange={(e) => setTransporterName(e.target.value)}
              placeholder="Optional transporter / company name"
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={createTag.isPending}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={createTag.isPending}
            className="flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-50"
          >
            {createTag.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Add RFID Tag
          </button>
        </div>
      </div>
    </>
  );
}

function RfidTagEditModal({
  tag,
  onClose,
  onSaved,
}: {
  tag: RfidTag;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { data: detail, isLoading: detailLoading } = useRfidTag(tag.id);
  const updateTag = useUpdateRfidTag();
  const { data: trucksData, isLoading: trucksLoading } = useTrucks({ page: 1, limit: 100 });

  const [status, setStatus] = useState("UNASSIGNED");
  const [truckId, setTruckId] = useState("");
  const [transporterName, setTransporterName] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [initialized, setInitialized] = useState(false);

  const trucks = trucksData?.data ?? [];
  const requiresTruck = isAssignedStatus(status);

  useEffect(() => {
    if (initialized) return;
    if (detailLoading && !detail) return;
    if (trucksLoading) return;

    const source = detail ?? tag;
    setStatus(source.status ?? "UNASSIGNED");
    setTruckId(source.truck_id ?? "");
    setTransporterName(source.transporter_name ?? "");
    setInitialized(true);
  }, [detail, detailLoading, tag, initialized, trucksLoading]);

  function validate() {
    const nextErrors: Record<string, string> = {};
    if (requiresTruck && !truckId.trim()) {
      nextErrors.truck_id = "Select a truck when status is assigned.";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSave() {
    if (!validate()) return;

    const payload: RfidTagUpdatePayload = {
      status,
      truck_id: requiresTruck ? truckId.trim() : null,
      transporter_name: transporterName.trim() || null,
    };

    updateTag.mutate(
      { id: tag.id, payload },
      {
        onSuccess: () => {
          toast.success("RFID tag updated successfully.");
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
              <Radio className="h-4 w-4 text-sky-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">Edit RFID Tag</h2>
              <p className="font-mono text-xs text-gray-500">{tag.rfid_tag_number}</p>
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
              <Loader2 className="h-3.5 w-3.5 animate-spin text-sky-500" />
              Loading RFID tag...
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-700">Status</label>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                if (!isAssignedStatus(e.target.value)) setTruckId("");
              }}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            >
              {RFID_TAG_STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {requiresTruck && (
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                Assigned Truck <span className="text-red-500">*</span>
              </label>
              <select
                value={truckId}
                onChange={(e) => setTruckId(e.target.value)}
                disabled={trucksLoading}
                className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 disabled:opacity-60 ${
                  errors.truck_id ? "border-red-300" : "border-gray-200"
                }`}
              >
                <option value="">
                  {trucksLoading ? "Loading trucks…" : "Select registered truck…"}
                </option>
                {trucks.map((truck) => (
                  <option key={truck.id} value={truck.id}>
                    {truck.plate_number}
                    {truck.registered_by?.company_name
                      ? ` — ${truck.registered_by.company_name}`
                      : ""}
                  </option>
                ))}
              </select>
              {errors.truck_id && <p className="mt-1 text-xs text-red-500">{errors.truck_id}</p>}
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-700">Transporter Name</label>
            <input
              value={transporterName}
              onChange={(e) => setTransporterName(e.target.value)}
              placeholder="Transporter / company name"
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={updateTag.isPending}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={updateTag.isPending}
            className="flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-50"
          >
            {updateTag.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Changes
          </button>
        </div>
      </div>
    </>
  );
}

function BulkUploadModal({
  onClose,
  onUploaded,
}: {
  onClose: () => void;
  onUploaded: () => void;
}) {
  const bulkUpload = useBulkUploadRfidTags();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  function handleUpload() {
    if (!selectedFile) {
      toast.error("Select a CSV or Excel file to upload.");
      return;
    }

    bulkUpload.mutate(selectedFile, {
      onSuccess: () => {
        onUploaded();
        onClose();
      },
    });
  }

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/40" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-[70] w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-gray-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0f1e2e]">
              <Upload className="h-4 w-4 text-sky-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">Upload RFID Tags</h2>
              <p className="text-xs text-gray-500">Bulk import tag serial numbers from a template file</p>
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

        <div className="space-y-4 px-6 py-5">
          <div className="rounded-lg border border-sky-100 bg-sky-50/60 p-4">
            <p className="text-[11px] leading-relaxed text-sky-800">
              Download the standardized template, add one RFID tag serial number per row under the{" "}
              <span className="font-mono font-medium">rfid_tag_number</span> column, then upload the
              completed CSV or Excel file.
            </p>
            <button
              type="button"
              onClick={downloadRfidTemplate}
              className="mt-3 flex items-center gap-1.5 rounded-lg border border-sky-200 bg-white px-3 py-2 text-xs font-medium text-sky-700 hover:bg-sky-50"
            >
              <Download className="h-3.5 w-3.5" />
              Download CSV Template
            </button>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-700">Upload File</label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              className="hidden"
              onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-sm text-gray-600 transition-colors hover:border-sky-300 hover:bg-sky-50/40"
            >
              <FileSpreadsheet className="h-5 w-5 text-gray-400" />
              {selectedFile ? selectedFile.name : "Click to select CSV or Excel file"}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={bulkUpload.isPending}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleUpload}
            disabled={bulkUpload.isPending || !selectedFile}
            className="flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-50"
          >
            {bulkUpload.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Upload Tags
          </button>
        </div>
      </div>
    </>
  );
}

function ActionsMenu({
  item,
  onAction,
}: {
  item: RfidTag;
  onAction: (action: "edit" | "delete", item: RfidTag) => void;
}) {
  return (
    <TableActionsDropdown width={208}>
      {(close) => (
        <>
          <button
            onClick={() => {
              close();
              onAction("edit", item);
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
          >
            <Edit2 className="h-3.5 w-3.5" />
            Edit
          </button>
          <button
            onClick={() => {
              close();
              onAction("delete", item);
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 transition-colors hover:bg-gray-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </>
      )}
    </TableActionsDropdown>
  );
}

export function RfidTagsPanel() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_FILTERS)[number]>("All");
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
  const [showCreate, setShowCreate] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [editTarget, setEditTarget] = useState<RfidTag | null>(null);

  const deleteTag = useDeleteRfidTag();
  const { data: trucksData } = useTrucks({ page: 1, limit: 100 });

  const truckPlateMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const truck of trucksData?.data ?? []) {
      map.set(truck.id, truck.plate_number);
    }
    return map;
  }, [trucksData]);

  useEffect(() => {
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [search]);

  const { data, isLoading, isError } = useRfidTags({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
    status: statusFilter !== "All" ? statusFilter : undefined,
  });

  const items = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta?.total_pages ?? 1;
  const currentPage = meta?.page ?? page;
  const hasActiveFilters = search || statusFilter !== "All";

  const formatTimestamp = (ts: string) =>
    new Date(ts).toLocaleString("en-NG", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  function resolveTruckLabel(item: RfidTag) {
    if (item.truck?.plate_number) return item.truck.plate_number;
    if (item.truck_id) return truckPlateMap.get(item.truck_id) ?? item.truck_id;
    return "—";
  }

  function handleAction(action: "edit" | "delete", item: RfidTag) {
    if (action === "edit") {
      setEditTarget(item);
      return;
    }
    setConfirm({
      title: "Delete RFID Tag",
      message: `Delete tag "${item.rfid_tag_number}" permanently? This cannot be undone.`,
      confirmLabel: "Delete",
      danger: true,
      onConfirm: () => {
        setConfirm(null);
        deleteTag.mutate(item.id, {
          onSuccess: () => toast.success(`${item.rfid_tag_number} has been deleted.`),
        });
      },
    });
  }

  return (
    <>
      {confirm && (
        <ConfirmDialog
          {...confirm}
          isPending={deleteTag.isPending}
          onCancel={() => setConfirm(null)}
        />
      )}

      {showCreate && (
        <RfidTagCreateModal onClose={() => setShowCreate(false)} onSaved={() => setShowCreate(false)} />
      )}

      {showBulkUpload && (
        <BulkUploadModal
          onClose={() => setShowBulkUpload(false)}
          onUploaded={() => setShowBulkUpload(false)}
        />
      )}

      {editTarget && (
        <RfidTagEditModal
          tag={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={() => setEditTarget(null)}
        />
      )}

      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-sky-50 p-2.5">
              <Radio className="h-5 w-5 text-sky-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">RFID Tags</h2>
              <p className="text-xs text-gray-500">
                Central registry of uploaded RFID tag serial numbers and truck assignments
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-medium text-sky-700">
              {meta?.total ?? 0} total
            </span>
            <button
              type="button"
              onClick={() => setShowBulkUpload(true)}
              className="flex items-center gap-1.5 rounded-lg border border-sky-200 bg-white px-3 py-2 text-xs font-medium text-sky-700 transition-colors hover:bg-sky-50"
            >
              <Upload className="h-3.5 w-3.5" />
              Upload RFID Tags
            </button>
            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-1.5 rounded-lg bg-sky-600 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-sky-700"
            >
              <Plus className="h-3.5 w-3.5" />
              Add RFID Tag
            </button>
          </div>
        </div>

        <div className="border-b border-sky-100 bg-sky-50/40 px-5 py-3">
          <div className="flex items-start gap-2">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-600" />
            <p className="text-[11px] leading-relaxed text-sky-800">
              View all RFID tags uploaded to ETSS-Nigeria. Verify whether each tag is unassigned or
              issued to a registered truck. Add tags individually or bulk-upload using the CSV template
              so Customer Service can link trucks to tags. SuperAdmin only.
            </p>
          </div>
        </div>

        <div className="border-b border-gray-100 px-5 py-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-50 flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by serial number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-sky-300 focus:bg-white focus:ring-2 focus:ring-sky-100"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                showFilters || hasActiveFilters
                  ? "border-sky-300 bg-sky-50 text-sky-700"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Filter className="h-4 w-4" />
              Filters
            </button>
          </div>

          {showFilters && (
            <div className="mt-3 flex flex-wrap items-center gap-3">
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
                  className="appearance-none rounded-lg border border-gray-200 bg-white py-1.5 pl-3 pr-8 text-xs text-gray-700 outline-none focus:border-sky-300"
                >
                  {STATUS_FILTERS.map((s) => (
                    <option key={s} value={s}>
                      {formatLabel(s)}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute bottom-2.5 right-2 h-3 w-3 text-gray-400" />
              </div>
            </div>
          )}
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-sky-600" />
            <span className="ml-2 text-sm text-gray-500">Loading RFID tags…</span>
          </div>
        )}

        {isError && (
          <div className="flex items-center justify-center py-16">
            <p className="text-sm text-red-500">Failed to load RFID tags. Please try again.</p>
          </div>
        )}

        {!isLoading && !isError && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-200">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/60">
                    <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                      S/No.
                    </th>
                    <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                      Serial Number
                    </th>
                    <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                      Assigned Truck
                    </th>
                    <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                      Transporter
                    </th>
                    <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                      Created By
                    </th>
                    <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                      Upload Timestamp
                    </th>
                    <th className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center">
                        <Radio className="mx-auto h-8 w-8 text-gray-300" />
                        <p className="mt-2 text-sm font-medium text-gray-400">No RFID tags found</p>
                      </td>
                    </tr>
                  ) : (
                    items.map((item, index) => (
                      <tr key={item.id} className="transition-colors hover:bg-gray-50/80">
                        <td className="px-4 py-3 text-xs text-gray-500">
                          {(currentPage - 1) * PAGE_SIZE + index + 1}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-mono text-xs font-medium text-gray-900">
                            {item.rfid_tag_number}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={item.status} />
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs text-gray-600">{resolveTruckLabel(item)}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs text-gray-600">{displayOrDash(item.transporter_name)}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs text-gray-600">{displayOrDash(item.created_by)}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs text-gray-600">
                            {item.created_at ? formatTimestamp(item.created_at) : "—"}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <ActionsMenu item={item} onAction={handleAction} />
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
                  {meta?.total === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}
                </span>
                –
                <span className="font-medium text-gray-700">
                  {Math.min(currentPage * PAGE_SIZE, meta?.total ?? 0)}
                </span>{" "}
                of <span className="font-medium text-gray-700">{meta?.total ?? 0}</span> tags
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage <= 1}
                  className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .slice(0, 7)
                  .map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`min-w-8 rounded-lg px-2 py-1 text-xs font-medium ${
                        p === currentPage
                          ? "bg-sky-600 text-white"
                          : "text-gray-600 hover:bg-gray-100"
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
          </>
        )}
      </div>
    </>
  );
}

export function useRfidTagsCount() {
  const { data } = useRfidTags({ page: 1, limit: 1 });
  return data?.meta.total ?? 0;
}

"use client";

import { useRef, useState } from "react";
import {
  FileCheck,
  X,
  Loader2,
  Download,
  Upload,
  FileSpreadsheet,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { SearchableSelect } from "@/components/dashboard/book-assist/BookAssistUi";
import { useTerminals } from "@/hooks/terminals/useTerminals";
import { useBulkCreateTeps, useCreateTEP } from "@/hooks/teps/useTepActions";
import type { CreateTEPPayload, TEPClassification } from "@/types/teps.types";
import {
  downloadTepUploadTemplate,
  parseTepUploadFile,
  TEP_UPLOAD_HEADERS,
} from "@/lib/tep-upload";

const CLASSIFICATION_OPTIONS: TEPClassification[] = [
  "EMPTY_TDO",
  "IMPORT_TDO",
  "EXPORT_TDO",
  "GATEPASS_PORT",
  "GATEPASS_NON_PORT",
];

const CLASSIFICATION_LABELS: Record<TEPClassification, string> = {
  EMPTY_TDO: "Empty TDO",
  IMPORT_TDO: "Import TDO",
  EXPORT_TDO: "Export TDO",
  GATEPASS_PORT: "Gatepass (Port)",
  GATEPASS_NON_PORT: "Gatepass (Non-Port)",
};

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

const inputCls = (hasError?: boolean) =>
  `w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 ${
    hasError ? "border-red-300" : "border-gray-200"
  }`;

function buildTepPayload(
  terminal: { id: string; name: string },
  fields: {
    reference_number: string;
    classification: TEPClassification;
    company_name: string;
    truck_plate_number: string;
    expiry_date: string;
  },
): CreateTEPPayload {
  return {
    terminal_id: terminal.id,
    facility_name: terminal.name,
    reference_number: fields.reference_number.trim(),
    classification: fields.classification,
    company_name: fields.company_name.trim(),
    truck_plate_number: fields.truck_plate_number.trim(),
    expiry_date: fields.expiry_date.trim(),
  };
}

export function CreateTepModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const createTep = useCreateTEP();
  const { data: terminalsData, isLoading: loadingTerminals } = useTerminals({
    page: 1,
    limit: 100,
    status: "ACTIVE",
  });
  const terminals = terminalsData?.data ?? [];

  const [selectedTerminalId, setSelectedTerminalId] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [classification, setClassification] = useState<TEPClassification>("EMPTY_TDO");
  const [companyName, setCompanyName] = useState("");
  const [truckPlate, setTruckPlate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedTerminal = terminals.find((t) => t.id === selectedTerminalId);
  const terminalCode = selectedTerminal?.terminal_code ?? "";

  function validate() {
    const nextErrors: Record<string, string> = {};
    if (!selectedTerminalId) nextErrors.terminal = "Select a terminal.";
    if (!referenceNumber.trim()) nextErrors.reference_number = "Reference number is required.";
    if (!companyName.trim()) nextErrors.company_name = "Company name is required.";
    if (!truckPlate.trim()) nextErrors.truck_plate_number = "Truck plate number is required.";
    if (!expiryDate) nextErrors.expiry_date = "Expiry date is required.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit() {
    if (!validate() || !selectedTerminal) return;

    createTep.mutate(
      buildTepPayload(selectedTerminal, {
        reference_number: referenceNumber,
        classification,
        company_name: companyName,
        truck_plate_number: truckPlate,
        expiry_date: expiryDate,
      }),
      {
        onSuccess: (result) => {
          toast.success(result.message ?? "TEP created successfully.");
          onCreated();
          onClose();
        },
      },
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/40" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-[70] flex max-h-[90vh] w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 flex-col rounded-2xl border border-gray-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0f1e2e]">
              <FileCheck className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">Create TEP</h2>
              <p className="text-xs text-gray-500">Register a truck entry permit for the selected terminal</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid flex-1 gap-4 overflow-y-auto px-6 py-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <SearchableSelect
              label="Terminal Name"
              placeholder={loadingTerminals ? "Loading terminals…" : "Select terminal…"}
              value={selectedTerminalId}
              onChange={setSelectedTerminalId}
              options={terminals.map((terminal) => ({
                value: terminal.id,
                label: terminal.name,
              }))}
              required
              disabled={loadingTerminals}
              searchPlaceholder="Type to filter terminals…"
            />
            {errors.terminal && <p className="mt-1 text-xs text-red-500">{errors.terminal}</p>}
          </div>

          <Field label="Terminal Code">
            <input
              value={terminalCode}
              readOnly
              placeholder="Auto-filled from terminal"
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 outline-none"
            />
          </Field>

          <Field label="Reference Number" required error={errors.reference_number}>
            <input
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              placeholder="e.g. ETD-2026-001001"
              className={inputCls(!!errors.reference_number)}
            />
          </Field>

          <Field label="Classification" required>
            <select
              value={classification}
              onChange={(e) => setClassification(e.target.value as TEPClassification)}
              className={inputCls()}
            >
              {CLASSIFICATION_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {CLASSIFICATION_LABELS[option]}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Company Name" required error={errors.company_name}>
            <input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Maersk Line Nigeria"
              className={inputCls(!!errors.company_name)}
            />
          </Field>

          <Field label="Truck Plate Number" required error={errors.truck_plate_number}>
            <input
              value={truckPlate}
              onChange={(e) => setTruckPlate(e.target.value)}
              placeholder="e.g. ABC-123-XY"
              className={inputCls(!!errors.truck_plate_number)}
            />
          </Field>

          <Field label="Expiry Date" required error={errors.expiry_date}>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className={inputCls(!!errors.expiry_date)}
            />
          </Field>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={createTep.isPending}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={createTep.isPending}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {createTep.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            <Plus className="h-4 w-4" />
            Create TEP
          </button>
        </div>
      </div>
    </>
  );
}

export function BulkUploadTepsModal({
  onClose,
  onUploaded,
}: {
  onClose: () => void;
  onUploaded: () => void;
}) {
  const bulkCreate = useBulkCreateTeps();
  const { data: terminalsData, isLoading: loadingTerminals } = useTerminals({
    page: 1,
    limit: 100,
    status: "ACTIVE",
  });
  const terminals = terminalsData?.data ?? [];
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedTerminalId, setSelectedTerminalId] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedCount, setParsedCount] = useState<number | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [terminalError, setTerminalError] = useState<string | null>(null);

  const selectedTerminal = terminals.find((t) => t.id === selectedTerminalId);
  const terminalCode = selectedTerminal?.terminal_code ?? "";

  async function handleFileChange(file: File | null) {
    setSelectedFile(file);
    setParsedCount(null);
    setParseError(null);

    if (!file) return;

    try {
      const rows = await parseTepUploadFile(file);
      setParsedCount(rows.length);
    } catch (error) {
      setParseError(error instanceof Error ? error.message : "Failed to read upload file.");
    }
  }

  async function handleUpload() {
    setTerminalError(null);
    setParseError(null);

    if (!selectedTerminal) {
      setTerminalError("Select a terminal.");
      return;
    }
    if (!selectedFile) {
      toast.error("Select a CSV or Excel file to upload.");
      return;
    }

    try {
      const rows = await parseTepUploadFile(selectedFile);
      bulkCreate.mutate(
        {
          teps: rows.map((row) => buildTepPayload(selectedTerminal, row)),
        },
        {
          onSuccess: (result) => {
            toast.success(result.message ?? `${rows.length} TEP(s) uploaded successfully.`);
            onUploaded();
            onClose();
          },
        },
      );
    } catch (error) {
      setParseError(error instanceof Error ? error.message : "Failed to parse upload file.");
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/40" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-[70] w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-gray-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0f1e2e]">
              <Upload className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">Bulk Upload TEPs</h2>
              <p className="text-xs text-gray-500">Import multiple TEPs for the selected terminal</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          <div>
            <SearchableSelect
              label="Terminal Name"
              placeholder={loadingTerminals ? "Loading terminals…" : "Select terminal…"}
              value={selectedTerminalId}
              onChange={(value) => {
                setSelectedTerminalId(value);
                setTerminalError(null);
              }}
              options={terminals.map((terminal) => ({
                value: terminal.id,
                label: terminal.name,
              }))}
              required
              disabled={loadingTerminals}
              searchPlaceholder="Type to filter terminals…"
            />
            {terminalError && <p className="mt-1 text-xs text-red-500">{terminalError}</p>}
          </div>

          <Field label="Terminal Code">
            <input
              value={terminalCode}
              readOnly
              placeholder="Auto-filled from terminal"
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 outline-none"
            />
          </Field>

          <div className="rounded-lg border border-emerald-100 bg-emerald-50/60 p-4">
            <p className="text-[11px] leading-relaxed text-emerald-800">
              Select the terminal first, then download the template with headers (
              {TEP_UPLOAD_HEADERS.join(", ")}). Dates must be{" "}
              <span className="font-mono font-medium">YYYY-MM-DD</span>. Facility name is taken
              from the selected terminal.
            </p>
            <button
              type="button"
              onClick={downloadTepUploadTemplate}
              className="mt-3 flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-white px-3 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-50"
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
              onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-sm text-gray-600 transition-colors hover:border-emerald-300 hover:bg-emerald-50/40"
            >
              <FileSpreadsheet className="h-5 w-5 text-gray-400" />
              {selectedFile ? selectedFile.name : "Click to select CSV or Excel file"}
            </button>
            {parsedCount !== null && !parseError && (
              <p className="mt-2 text-xs font-medium text-emerald-700">
                {parsedCount} TEP{parsedCount === 1 ? "" : "s"} ready to upload.
              </p>
            )}
            {parseError && <p className="mt-2 text-xs text-red-500">{parseError}</p>}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={bulkCreate.isPending}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleUpload}
            disabled={bulkCreate.isPending || !selectedFile || !!parseError}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {bulkCreate.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Upload TEPs
          </button>
        </div>
      </div>
    </>
  );
}

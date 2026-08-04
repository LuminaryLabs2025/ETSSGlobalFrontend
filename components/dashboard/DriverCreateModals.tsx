"use client";

import { useRef, useState } from "react";
import {
  Users,
  X,
  Loader2,
  Download,
  Upload,
  FileSpreadsheet,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { useCompanies } from "@/hooks/companies/useCompanies";
import { useBulkCreateDrivers, useCreateDriver } from "@/hooks/drivers/useDriverActions";
import type { CreateDriverPayload, DriverSex, DriverVisibility } from "@/types/drivers.types";
import {
  downloadDriverUploadTemplate,
  DRIVER_UPLOAD_HEADERS,
  parseDriverUploadFile,
} from "@/lib/driver-upload";

const SEX_OPTIONS: DriverSex[] = ["MALE", "FEMALE"];
const VISIBILITY_OPTIONS: DriverVisibility[] = ["PUBLIC", "PRIVATE"];

function formatLabel(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

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

export function CreateDriverModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const createDriver = useCreateDriver();
  const { data: companies = [], isLoading: loadingCompanies } = useCompanies();

  const [transporterCompanyId, setTransporterCompanyId] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [licenseExpiryDate, setLicenseExpiryDate] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [sex, setSex] = useState<DriverSex>("MALE");
  const [visibility, setVisibility] = useState<DriverVisibility>("PUBLIC");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const activeCompanies = companies.filter((c) => c.is_active);

  function validate() {
    const nextErrors: Record<string, string> = {};
    if (!transporterCompanyId) nextErrors.transporter_company_id = "Select a transporter company.";
    if (!firstName.trim()) nextErrors.first_name = "First name is required.";
    if (!lastName.trim()) nextErrors.last_name = "Last name is required.";
    if (!mobileNumber.trim()) nextErrors.mobile_number = "Mobile number is required.";
    if (!licenseNumber.trim()) nextErrors.license_number = "License number is required.";
    if (!licenseExpiryDate) nextErrors.license_expiry_date = "License expiry date is required.";
    if (!dateOfBirth) nextErrors.date_of_birth = "Date of birth is required.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;

    const payload: CreateDriverPayload = {
      transporter_company_id: transporterCompanyId,
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      mobile_number: mobileNumber.trim(),
      license_number: licenseNumber.trim(),
      license_expiry_date: licenseExpiryDate,
      date_of_birth: dateOfBirth,
      sex,
      visibility,
    };

    createDriver.mutate(payload, {
      onSuccess: (result) => {
        toast.success(result.message ?? "Driver created successfully.");
        onCreated();
        onClose();
      },
    });
  }

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/40" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-[70] flex max-h-[90vh] w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 flex-col rounded-2xl border border-gray-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0f1e2e]">
              <Users className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">Add Driver</h2>
              <p className="text-xs text-gray-500">Register a single driver on behalf of a transporter</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid flex-1 gap-4 overflow-y-auto px-6 py-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Transporter Company" required error={errors.transporter_company_id}>
              <select
                value={transporterCompanyId}
                onChange={(e) => setTransporterCompanyId(e.target.value)}
                disabled={loadingCompanies}
                className={inputCls(!!errors.transporter_company_id)}
              >
                <option value="">
                  {loadingCompanies ? "Loading companies…" : "Select transporter company…"}
                </option>
                {activeCompanies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="First Name" required error={errors.first_name}>
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="e.g. Emeka"
              className={inputCls(!!errors.first_name)}
            />
          </Field>

          <Field label="Last Name" required error={errors.last_name}>
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="e.g. Okafor"
              className={inputCls(!!errors.last_name)}
            />
          </Field>

          <Field label="Mobile Number" required error={errors.mobile_number}>
            <input
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              placeholder="e.g. +2348012345678"
              className={inputCls(!!errors.mobile_number)}
            />
          </Field>

          <Field label="License Number" required error={errors.license_number}>
            <input
              value={licenseNumber}
              onChange={(e) => setLicenseNumber(e.target.value)}
              placeholder="e.g. DL-123456789"
              className={inputCls(!!errors.license_number)}
            />
          </Field>

          <Field label="License Expiry Date" required error={errors.license_expiry_date}>
            <input
              type="date"
              value={licenseExpiryDate}
              onChange={(e) => setLicenseExpiryDate(e.target.value)}
              className={inputCls(!!errors.license_expiry_date)}
            />
          </Field>

          <Field label="Date of Birth" required error={errors.date_of_birth}>
            <input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className={inputCls(!!errors.date_of_birth)}
            />
          </Field>

          <Field label="Sex" required>
            <select value={sex} onChange={(e) => setSex(e.target.value as DriverSex)} className={inputCls()}>
              {SEX_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {formatLabel(option)}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Visibility" required>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as DriverVisibility)}
              className={inputCls()}
            >
              {VISIBILITY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {formatLabel(option)}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={createDriver.isPending}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={createDriver.isPending}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {createDriver.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            <Plus className="h-4 w-4" />
            Add Driver
          </button>
        </div>
      </div>
    </>
  );
}

export function BulkUploadDriversModal({
  onClose,
  onUploaded,
}: {
  onClose: () => void;
  onUploaded: () => void;
}) {
  const bulkCreate = useBulkCreateDrivers();
  const { data: companies = [], isLoading: loadingCompanies } = useCompanies();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [transporterCompanyId, setTransporterCompanyId] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedCount, setParsedCount] = useState<number | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [companyError, setCompanyError] = useState<string | null>(null);

  const activeCompanies = companies.filter((c) => c.is_active);

  async function handleFileChange(file: File | null) {
    setSelectedFile(file);
    setParsedCount(null);
    setParseError(null);

    if (!file) return;

    try {
      const drivers = await parseDriverUploadFile(file);
      setParsedCount(drivers.length);
    } catch (error) {
      setParseError(error instanceof Error ? error.message : "Failed to read upload file.");
    }
  }

  async function handleUpload() {
    setCompanyError(null);
    setParseError(null);

    if (!transporterCompanyId) {
      setCompanyError("Select a transporter company.");
      return;
    }
    if (!selectedFile) {
      toast.error("Select a CSV or Excel file to upload.");
      return;
    }

    try {
      const drivers = await parseDriverUploadFile(selectedFile);
      bulkCreate.mutate(
        { transporter_company_id: transporterCompanyId, drivers },
        {
          onSuccess: (result) => {
            toast.success(result.message ?? `${drivers.length} driver(s) uploaded successfully.`);
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
              <h2 className="text-sm font-bold text-gray-900">Bulk Upload Drivers</h2>
              <p className="text-xs text-gray-500">Import multiple drivers using the standardized template</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          <Field label="Transporter Company" required error={companyError ?? undefined}>
            <select
              value={transporterCompanyId}
              onChange={(e) => {
                setTransporterCompanyId(e.target.value);
                setCompanyError(null);
              }}
              disabled={loadingCompanies}
              className={inputCls(!!companyError)}
            >
              <option value="">
                {loadingCompanies ? "Loading companies…" : "Select transporter company…"}
              </option>
              {activeCompanies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </Field>

          <div className="rounded-lg border border-emerald-100 bg-emerald-50/60 p-4">
            <p className="text-[11px] leading-relaxed text-emerald-800">
              Download the template with pre-populated column headers (
              {DRIVER_UPLOAD_HEADERS.join(", ")}). Dates must be{" "}
              <span className="font-mono font-medium">YYYY-MM-DD</span>. The sample row shows the
              expected format.
            </p>
            <button
              type="button"
              onClick={downloadDriverUploadTemplate}
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
                {parsedCount} driver{parsedCount === 1 ? "" : "s"} ready to upload.
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
            Upload Drivers
          </button>
        </div>
      </div>
    </>
  );
}

"use client";

import { useRef, useState } from "react";
import {
  Truck,
  X,
  Loader2,
  Download,
  Upload,
  FileSpreadsheet,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { useCompanies } from "@/hooks/companies/useCompanies";
import { useCreateTruck, useBulkCreateTrucks } from "@/hooks/trucks/useTruckActions";
import type { CreateTruckPayload, TruckType, Visibility } from "@/types/trucks.types";
import {
  downloadTruckUploadTemplate,
  parseTruckUploadFile,
  TRUCK_UPLOAD_HEADERS,
} from "@/lib/truck-upload";

const TRUCK_TYPE_OPTIONS: TruckType[] = [
  "20-FOOTER",
  "40-FOOTER",
  "FLATBED",
  "LOW_LOADER",
  "TANKER",
  "CURTAINSIDER",
];

const COLOR_OPTIONS = ["White", "Red", "Blue", "Grey", "Green", "Yellow", "Black", "Silver"];

const VISIBILITY_OPTIONS: Visibility[] = ["PUBLIC", "PRIVATE"];

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

export function CreateTruckModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const createTruck = useCreateTruck();
  const { data: companies = [], isLoading: loadingCompanies } = useCompanies();

  const [transporterCompanyId, setTransporterCompanyId] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [truckType, setTruckType] = useState<TruckType>("40-FOOTER");
  const [color, setColor] = useState("White");
  const [chassisNumber, setChassisNumber] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [truckLength, setTruckLength] = useState("");
  const [truckCapacity, setTruckCapacity] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("PUBLIC");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const activeCompanies = companies.filter((c) => c.is_active);

  function validate() {
    const nextErrors: Record<string, string> = {};
    if (!transporterCompanyId) nextErrors.transporter_company_id = "Select a transporter company.";
    if (!plateNumber.trim()) nextErrors.plate_number = "Plate number is required.";
    if (!chassisNumber.trim()) nextErrors.chassis_number = "Chassis number is required.";
    if (!brand.trim()) nextErrors.brand = "Brand is required.";
    if (!model.trim()) nextErrors.model = "Model is required.";
    if (!truckLength.trim()) nextErrors.truck_length = "Truck length is required.";
    if (!truckCapacity.trim()) nextErrors.truck_capacity = "Truck capacity is required.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;

    const payload: CreateTruckPayload = {
      transporter_company_id: transporterCompanyId,
      plate_number: plateNumber.trim(),
      truck_type: truckType,
      color,
      chassis_number: chassisNumber.trim(),
      brand: brand.trim(),
      model: model.trim(),
      truck_length: truckLength.trim(),
      truck_capacity: truckCapacity.trim(),
      visibility,
    };

    createTruck.mutate(payload, {
      onSuccess: (result) => {
        toast.success(result.message ?? "Truck created successfully.");
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
              <Truck className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">Add Truck</h2>
              <p className="text-xs text-gray-500">Register a single truck on behalf of a transporter</p>
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

          <Field label="Plate Number" required error={errors.plate_number}>
            <input
              value={plateNumber}
              onChange={(e) => setPlateNumber(e.target.value)}
              placeholder="e.g. ABC-123-XY"
              className={inputCls(!!errors.plate_number)}
            />
          </Field>

          <Field label="Truck Type" required>
            <select value={truckType} onChange={(e) => setTruckType(e.target.value as TruckType)} className={inputCls()}>
              {TRUCK_TYPE_OPTIONS.map((type) => (
                <option key={type} value={type}>
                  {formatLabel(type)}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Color" required>
            <select value={color} onChange={(e) => setColor(e.target.value)} className={inputCls()}>
              {COLOR_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Visibility" required>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as Visibility)}
              className={inputCls()}
            >
              {VISIBILITY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {formatLabel(option)}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Chassis Number" required error={errors.chassis_number}>
            <input
              value={chassisNumber}
              onChange={(e) => setChassisNumber(e.target.value)}
              placeholder="e.g. WDB9300341L123456"
              className={inputCls(!!errors.chassis_number)}
            />
          </Field>

          <Field label="Brand" required error={errors.brand}>
            <input
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="e.g. Mercedes-Benz"
              className={inputCls(!!errors.brand)}
            />
          </Field>

          <Field label="Model" required error={errors.model}>
            <input
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="e.g. Actros 2548"
              className={inputCls(!!errors.model)}
            />
          </Field>

          <Field label="Truck Length" required error={errors.truck_length}>
            <input
              value={truckLength}
              onChange={(e) => setTruckLength(e.target.value)}
              placeholder="e.g. 12.2m"
              className={inputCls(!!errors.truck_length)}
            />
          </Field>

          <Field label="Truck Capacity" required error={errors.truck_capacity}>
            <input
              value={truckCapacity}
              onChange={(e) => setTruckCapacity(e.target.value)}
              placeholder="e.g. 40 Tons"
              className={inputCls(!!errors.truck_capacity)}
            />
          </Field>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={createTruck.isPending}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={createTruck.isPending}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {createTruck.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            <Plus className="h-4 w-4" />
            Add Truck
          </button>
        </div>
      </div>
    </>
  );
}

export function BulkUploadTrucksModal({
  onClose,
  onUploaded,
}: {
  onClose: () => void;
  onUploaded: () => void;
}) {
  const bulkCreate = useBulkCreateTrucks();
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
      const trucks = await parseTruckUploadFile(file);
      setParsedCount(trucks.length);
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
      const trucks = await parseTruckUploadFile(selectedFile);
      bulkCreate.mutate(
        { transporter_company_id: transporterCompanyId, trucks },
        {
          onSuccess: (result) => {
            toast.success(result.message ?? `${trucks.length} truck(s) uploaded successfully.`);
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
              <h2 className="text-sm font-bold text-gray-900">Bulk Upload Trucks</h2>
              <p className="text-xs text-gray-500">Import multiple trucks using the standardized template</p>
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
              {TRUCK_UPLOAD_HEADERS.join(", ")}), fill in one truck per row, then upload the
              completed CSV file. The sample row shows the expected format.
            </p>
            <button
              type="button"
              onClick={downloadTruckUploadTemplate}
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
                {parsedCount} truck{parsedCount === 1 ? "" : "s"} ready to upload.
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
            Upload Trucks
          </button>
        </div>
      </div>
    </>
  );
}

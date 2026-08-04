import type { TEPClassification } from "@/types/teps.types";

export const TEP_UPLOAD_HEADERS = [
  "reference_number",
  "classification",
  "company_name",
  "truck_plate_number",
  "expiry_date",
] as const;

export type TepUploadRow = {
  reference_number: string;
  classification: TEPClassification;
  company_name: string;
  truck_plate_number: string;
  expiry_date: string;
};

const VALID_CLASSIFICATIONS: TEPClassification[] = [
  "EMPTY_TDO",
  "IMPORT_TDO",
  "EXPORT_TDO",
  "GATEPASS_PORT",
  "GATEPASS_NON_PORT",
];

const SAMPLE_ROW = [
  "ETD-2026-001001",
  "EMPTY_TDO",
  "Maersk Line Nigeria",
  "ABC-123-XY",
  "2027-12-31",
];

export function downloadTepUploadTemplate() {
  const csv = `${TEP_UPLOAD_HEADERS.join(",")}\n${SAMPLE_ROW.join(",")}\n`;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "teps-upload-template.csv";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(url);
}

function parseCsvRows(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        cell += '"';
        i += 1;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        cell += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(cell.trim());
      cell = "";
    } else if (char === "\n" || (char === "\r" && next === "\n")) {
      row.push(cell.trim());
      if (row.some((value) => value.length > 0)) rows.push(row);
      row = [];
      cell = "";
      if (char === "\r") i += 1;
    } else if (char !== "\r") {
      cell += char;
    }
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell.trim());
    if (row.some((value) => value.length > 0)) rows.push(row);
  }

  return rows;
}

function normalizeHeader(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, "_");
}

function isValidClassification(value: string): value is TEPClassification {
  return VALID_CLASSIFICATIONS.includes(value as TEPClassification);
}

function isValidDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));
}

export function parseTepUploadCsv(text: string): TepUploadRow[] {
  const rows = parseCsvRows(text.trim());
  if (rows.length === 0) {
    throw new Error("The uploaded file is empty.");
  }

  const headerRow = rows[0].map(normalizeHeader);
  const expected = TEP_UPLOAD_HEADERS as readonly string[];

  const hasValidHeader = expected.every((header, index) => headerRow[index] === header);
  if (!hasValidHeader) {
    throw new Error(`Invalid template headers. Expected: ${expected.join(", ")}`);
  }

  const dataRows = rows.slice(1).filter((row) => row.some((cell) => cell.trim().length > 0));
  if (dataRows.length === 0) {
    throw new Error("No TEP rows found. Add at least one data row below the header.");
  }

  return dataRows.map((row, index) => {
    const line = index + 2;
    const [reference_number, classification, company_name, truck_plate_number, expiry_date] = row;

    if (!reference_number?.trim()) throw new Error(`Row ${line}: reference_number is required.`);
    if (!classification?.trim() || !isValidClassification(classification.trim())) {
      throw new Error(`Row ${line}: classification must be one of ${VALID_CLASSIFICATIONS.join(", ")}.`);
    }
    if (!company_name?.trim()) throw new Error(`Row ${line}: company_name is required.`);
    if (!truck_plate_number?.trim()) throw new Error(`Row ${line}: truck_plate_number is required.`);
    if (!expiry_date?.trim() || !isValidDate(expiry_date.trim())) {
      throw new Error(`Row ${line}: expiry_date must be YYYY-MM-DD.`);
    }

    return {
      reference_number: reference_number.trim(),
      classification: classification.trim() as TEPClassification,
      company_name: company_name.trim(),
      truck_plate_number: truck_plate_number.trim(),
      expiry_date: expiry_date.trim(),
    };
  });
}

export async function parseTepUploadFile(file: File): Promise<TepUploadRow[]> {
  const extension = file.name.split(".").pop()?.toLowerCase();

  if (extension === "csv" || file.type.includes("csv") || file.type === "text/plain") {
    const text = await file.text();
    return parseTepUploadCsv(text);
  }

  if (extension === "xlsx" || extension === "xls") {
    throw new Error("Excel files are not parsed in-browser yet. Download the CSV template, open it in Excel, then save as CSV before uploading.");
  }

  throw new Error("Unsupported file type. Upload a CSV file using the downloadable template.");
}

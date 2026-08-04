import type { BulkCreateDriverItem, DriverSex, DriverVisibility } from "@/types/drivers.types";

export const DRIVER_UPLOAD_HEADERS = [
  "first_name",
  "last_name",
  "mobile_number",
  "license_number",
  "license_expiry_date",
  "date_of_birth",
  "sex",
  "visibility",
] as const;

const VALID_SEX: DriverSex[] = ["MALE", "FEMALE"];
const VALID_VISIBILITY: DriverVisibility[] = ["PUBLIC", "PRIVATE"];

const SAMPLE_ROW = [
  "Emeka",
  "Okafor",
  "+2348012345678",
  "DL-123456789",
  "2027-12-31",
  "1985-06-15",
  "MALE",
  "PUBLIC",
];

export function downloadDriverUploadTemplate() {
  const csv = `${DRIVER_UPLOAD_HEADERS.join(",")}\n${SAMPLE_ROW.join(",")}\n`;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "drivers-upload-template.csv";
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

function isValidSex(value: string): value is DriverSex {
  return VALID_SEX.includes(value as DriverSex);
}

function isValidVisibility(value: string): value is DriverVisibility {
  return VALID_VISIBILITY.includes(value as DriverVisibility);
}

function isValidDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));
}

export function parseDriverUploadCsv(text: string): BulkCreateDriverItem[] {
  const rows = parseCsvRows(text.trim());
  if (rows.length === 0) {
    throw new Error("The uploaded file is empty.");
  }

  const headerRow = rows[0].map(normalizeHeader);
  const expected = DRIVER_UPLOAD_HEADERS as readonly string[];

  const hasValidHeader = expected.every((header, index) => headerRow[index] === header);
  if (!hasValidHeader) {
    throw new Error(`Invalid template headers. Expected: ${expected.join(", ")}`);
  }

  const dataRows = rows.slice(1).filter((row) => row.some((cell) => cell.trim().length > 0));
  if (dataRows.length === 0) {
    throw new Error("No driver rows found. Add at least one data row below the header.");
  }

  return dataRows.map((row, index) => {
    const line = index + 2;
    const [
      first_name,
      last_name,
      mobile_number,
      license_number,
      license_expiry_date,
      date_of_birth,
      sex,
      visibility,
    ] = row;

    if (!first_name?.trim()) throw new Error(`Row ${line}: first_name is required.`);
    if (!last_name?.trim()) throw new Error(`Row ${line}: last_name is required.`);
    if (!mobile_number?.trim()) throw new Error(`Row ${line}: mobile_number is required.`);
    if (!license_number?.trim()) throw new Error(`Row ${line}: license_number is required.`);
    if (!license_expiry_date?.trim() || !isValidDate(license_expiry_date.trim())) {
      throw new Error(`Row ${line}: license_expiry_date must be YYYY-MM-DD.`);
    }
    if (!date_of_birth?.trim() || !isValidDate(date_of_birth.trim())) {
      throw new Error(`Row ${line}: date_of_birth must be YYYY-MM-DD.`);
    }
    if (!sex?.trim() || !isValidSex(sex.trim().toUpperCase())) {
      throw new Error(`Row ${line}: sex must be MALE or FEMALE.`);
    }
    if (!visibility?.trim() || !isValidVisibility(visibility.trim().toUpperCase())) {
      throw new Error(`Row ${line}: visibility must be PUBLIC or PRIVATE.`);
    }

    return {
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      mobile_number: mobile_number.trim(),
      license_number: license_number.trim(),
      license_expiry_date: license_expiry_date.trim(),
      date_of_birth: date_of_birth.trim(),
      sex: sex.trim().toUpperCase() as DriverSex,
      visibility: visibility.trim().toUpperCase() as DriverVisibility,
    };
  });
}

export async function parseDriverUploadFile(file: File): Promise<BulkCreateDriverItem[]> {
  const extension = file.name.split(".").pop()?.toLowerCase();

  if (extension === "csv" || file.type.includes("csv") || file.type === "text/plain") {
    const text = await file.text();
    return parseDriverUploadCsv(text);
  }

  if (extension === "xlsx" || extension === "xls") {
    throw new Error("Excel files are not parsed in-browser yet. Download the CSV template, open it in Excel, then save as CSV before uploading.");
  }

  throw new Error("Unsupported file type. Upload a CSV file using the downloadable template.");
}

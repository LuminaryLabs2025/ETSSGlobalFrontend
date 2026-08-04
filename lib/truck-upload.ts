import type { BulkCreateTruckItem, TruckType, Visibility } from "@/types/trucks.types";

export const TRUCK_UPLOAD_HEADERS = [
  "plate_number",
  "truck_type",
  "color",
  "chassis_number",
  "brand",
  "model",
  "truck_length",
  "truck_capacity",
  "visibility",
] as const;

const VALID_TRUCK_TYPES: TruckType[] = [
  "20-FOOTER",
  "40-FOOTER",
  "FLATBED",
  "LOW_LOADER",
  "TANKER",
  "CURTAINSIDER",
];

const VALID_VISIBILITY: Visibility[] = ["PUBLIC", "PRIVATE"];

const SAMPLE_ROW = [
  "ABC-123-XY",
  "40-FOOTER",
  "White",
  "WDB9300341L123456",
  "Mercedes-Benz",
  "Actros 2548",
  "12.2m",
  "40 Tons",
  "PUBLIC",
];

export function downloadTruckUploadTemplate() {
  const csv = `${TRUCK_UPLOAD_HEADERS.join(",")}\n${SAMPLE_ROW.join(",")}\n`;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "trucks-upload-template.csv";
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

function isValidTruckType(value: string): value is TruckType {
  return VALID_TRUCK_TYPES.includes(value as TruckType);
}

function isValidVisibility(value: string): value is Visibility {
  return VALID_VISIBILITY.includes(value as Visibility);
}

export function parseTruckUploadCsv(text: string): BulkCreateTruckItem[] {
  const rows = parseCsvRows(text.trim());
  if (rows.length === 0) {
    throw new Error("The uploaded file is empty.");
  }

  const headerRow = rows[0].map(normalizeHeader);
  const expected = TRUCK_UPLOAD_HEADERS as readonly string[];

  const hasValidHeader = expected.every((header, index) => headerRow[index] === header);
  if (!hasValidHeader) {
    throw new Error(
      `Invalid template headers. Expected: ${expected.join(", ")}`,
    );
  }

  const dataRows = rows.slice(1).filter((row) => row.some((cell) => cell.trim().length > 0));
  if (dataRows.length === 0) {
    throw new Error("No truck rows found. Add at least one data row below the header.");
  }

  return dataRows.map((row, index) => {
    const line = index + 2;
    const [
      plate_number,
      truck_type,
      color,
      chassis_number,
      brand,
      model,
      truck_length,
      truck_capacity,
      visibility,
    ] = row;

    if (!plate_number?.trim()) throw new Error(`Row ${line}: plate_number is required.`);
    if (!truck_type?.trim() || !isValidTruckType(truck_type.trim())) {
      throw new Error(`Row ${line}: truck_type must be one of ${VALID_TRUCK_TYPES.join(", ")}.`);
    }
    if (!color?.trim()) throw new Error(`Row ${line}: color is required.`);
    if (!chassis_number?.trim()) throw new Error(`Row ${line}: chassis_number is required.`);
    if (!brand?.trim()) throw new Error(`Row ${line}: brand is required.`);
    if (!model?.trim()) throw new Error(`Row ${line}: model is required.`);
    if (!truck_length?.trim()) throw new Error(`Row ${line}: truck_length is required.`);
    if (!truck_capacity?.trim()) throw new Error(`Row ${line}: truck_capacity is required.`);
    if (!visibility?.trim() || !isValidVisibility(visibility.trim().toUpperCase())) {
      throw new Error(`Row ${line}: visibility must be PUBLIC or PRIVATE.`);
    }

    return {
      plate_number: plate_number.trim(),
      truck_type: truck_type.trim() as TruckType,
      color: color.trim(),
      chassis_number: chassis_number.trim(),
      brand: brand.trim(),
      model: model.trim(),
      truck_length: truck_length.trim(),
      truck_capacity: truck_capacity.trim(),
      visibility: visibility.trim().toUpperCase() as Visibility,
    };
  });
}

export async function parseTruckUploadFile(file: File): Promise<BulkCreateTruckItem[]> {
  const extension = file.name.split(".").pop()?.toLowerCase();

  if (extension === "csv" || file.type.includes("csv") || file.type === "text/plain") {
    const text = await file.text();
    return parseTruckUploadCsv(text);
  }

  if (extension === "xlsx" || extension === "xls") {
    throw new Error("Excel files are not parsed in-browser yet. Download the CSV template, open it in Excel, then save as CSV before uploading.");
  }

  throw new Error("Unsupported file type. Upload a CSV file using the downloadable template.");
}

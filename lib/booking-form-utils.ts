import type { GroupedSelectOption } from "@/components/dashboard/book-assist/BookAssistUi";
import type { BookingOptionsResponse, BookingPreviewFee } from "@/types/booking-creation.types";

export type BondedBookingCategoryVariant =
  | "import_container"
  | "import_non_container"
  | "empty_container"
  | "export_container"
  | "export_non_container"
  | "fmcg"
  | "fish";

export function formatAssistNaira(amount: number) {
  return `₦${amount.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
}

export function formatAssistDateLong(isoDate: string) {
  if (!isoDate) return "—";
  return new Date(isoDate).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatAssistDateShort(isoDate: string) {
  if (!isoDate) return "—";
  return new Date(isoDate).toLocaleDateString("en-NG", {
    day: "2-digit",
    month: "short",
  });
}

export function stripGroupedLabel(label: string) {
  return label.split(" (")[0];
}

export function flattenBookingOptions(
  response: BookingOptionsResponse | undefined,
): GroupedSelectOption[] {
  if (!response) return [];
  return [...response.mine, ...response.public];
}

export function resolveCategoryVariantFromName(name: string): BondedBookingCategoryVariant {
  const normalized = name.toLowerCase();
  if (normalized.includes("fish")) return "fish";
  if (normalized.includes("fmcg")) return "fmcg";
  if (normalized.includes("empty") && normalized.includes("container")) return "empty_container";
  if (normalized.includes("import") && normalized.includes("non")) return "import_non_container";
  if (normalized.includes("export") && normalized.includes("non")) return "export_non_container";
  if (normalized.includes("import") && normalized.includes("container")) return "import_container";
  if (normalized.includes("export") && normalized.includes("container")) return "export_container";
  return "import_non_container";
}

export function isContainerizedBondedCategory(variant: BondedBookingCategoryVariant): boolean {
  return (
    variant === "import_container" ||
    variant === "export_container" ||
    variant === "empty_container"
  );
}

export function formatTimeslotLabel(startTime: string, endTime: string, name?: string) {
  if (name) return name;
  return `${startTime} - ${endTime}`;
}

export function mapPreviewFee(fee: BookingPreviewFee | undefined) {
  if (!fee) return null;
  return {
    feeConfigured: fee.fee_configured,
    total: fee.total,
    lines: fee.lines,
  };
}

export const PREVIEW_REFERENCE_PLACEHOLDER = "Assigned on confirm";

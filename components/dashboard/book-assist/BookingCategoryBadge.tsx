import { Container, Fish } from "lucide-react";
import {
  isContainerizedBondedCategory,
  type BondedBookingCategoryVariant,
} from "@/lib/book-assist-mock-data";

export function BookingCategoryBadge({
  variant,
  label,
  referenceNumber,
}: {
  variant: BondedBookingCategoryVariant;
  label: string;
  referenceNumber: string;
}) {
  const isContainer = isContainerizedBondedCategory(variant);
  const refLabel = isContainer ? "Container Number" : "GatePass Number";
  const base =
    "relative flex h-32 w-52 flex-col items-center justify-center rounded-lg border-2 px-4 text-center shadow-sm";

  if (variant === "import_container") {
    return (
      <div className={`${base} border-blue-300 bg-white`}>
        <div className="absolute inset-x-0 top-0 h-2 bg-blue-500" />
        <div className="absolute inset-x-0 bottom-0 h-2 bg-blue-500" />
        <Container className="h-10 w-10 text-blue-600" strokeWidth={1.2} />
        <p className="mt-2 text-xs font-bold text-gray-900">{label}</p>
        <p className="mt-1 text-[10px] text-gray-500">
          {refLabel}: <span className="font-semibold text-gray-800">{referenceNumber}</span>
        </p>
      </div>
    );
  }

  if (variant === "export_container") {
    return (
      <div className={`${base} border-gray-800 bg-white`}>
        <div className="absolute inset-x-0 top-0 h-2 bg-emerald-500" />
        <div className="absolute inset-x-0 bottom-0 h-2 bg-emerald-500" />
        <Container className="h-10 w-10 text-emerald-600" strokeWidth={1.2} />
        <p className="mt-2 text-xs font-bold text-gray-900">{label}</p>
        <p className="mt-1 text-[10px] text-gray-500">
          {refLabel}: <span className="font-semibold text-gray-800">{referenceNumber}</span>
        </p>
      </div>
    );
  }

  if (variant === "empty_container") {
    return (
      <div className={`${base} border-gray-400 bg-white`}>
        <div className="absolute inset-y-0 left-0 w-2 bg-gray-800" />
        <div className="absolute inset-y-0 right-0 w-2 bg-gray-800" />
        <Container className="h-10 w-10 text-gray-700" strokeWidth={1.2} />
        <p className="mt-2 text-xs font-bold text-gray-900">{label}</p>
        <p className="mt-1 text-[10px] text-gray-500">
          {refLabel}: <span className="font-semibold text-gray-800">{referenceNumber}</span>
        </p>
      </div>
    );
  }

  if (variant === "export_non_container") {
    return (
      <div className={`${base} border-emerald-500 bg-emerald-50/30`}>
        <p className="text-sm font-bold text-gray-900">{label}</p>
        <p className="mt-2 text-[10px] text-gray-600">
          {refLabel}: <span className="font-semibold text-gray-800">{referenceNumber}</span>
        </p>
      </div>
    );
  }

  if (variant === "import_non_container") {
    return (
      <div className={`${base} border-gray-900 bg-white`}>
        <p className="text-sm font-bold text-gray-900">{label}</p>
        <p className="mt-2 text-[10px] text-gray-600">
          {refLabel}: <span className="font-semibold text-gray-800">{referenceNumber}</span>
        </p>
      </div>
    );
  }

  if (variant === "fmcg") {
    return (
      <div className={`${base} border-red-400 bg-red-50`}>
        <p className="text-sm font-bold text-red-600">{label}</p>
        <p className="mt-2 text-[10px] text-gray-600">
          {refLabel}: <span className="font-semibold text-gray-800">{referenceNumber}</span>
        </p>
      </div>
    );
  }

  if (variant === "fish") {
    return (
      <div className={`${base} border-gray-800 bg-white`}>
        <Fish className="h-12 w-12 text-teal-500" strokeWidth={1.2} />
        <p className="mt-2 text-xs font-bold text-gray-900">{label}</p>
        <p className="mt-1 text-[10px] text-gray-500">
          {refLabel}: <span className="font-semibold text-gray-800">{referenceNumber}</span>
        </p>
      </div>
    );
  }

  return (
    <div className={`${base} border-gray-200 bg-gray-50`}>
      <p className="text-sm font-bold text-gray-900">{label}</p>
      <p className="mt-2 text-[10px] text-gray-600">
        {refLabel}: <span className="font-semibold text-gray-800">{referenceNumber}</span>
      </p>
    </div>
  );
}

export function buildBookingReferenceNumber(
  plateLabel: string | undefined,
  variant: BondedBookingCategoryVariant | undefined,
): string {
  const plate = (plateLabel ?? "REF").replace(/-/g, "").replace(/\s/g, "");
  const suffix = plate.slice(-6).padStart(6, "0");
  if (variant && isContainerizedBondedCategory(variant)) {
    return `CNTR${suffix}7890`;
  }
  return `NXP${suffix}7890`;
}

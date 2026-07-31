import { MOCK_TRUCKS } from "@/lib/trucks-mock-data";
import { MOCK_DRIVERS } from "@/lib/drivers-mock-data";

export type TerminalZone = "APAPA" | "TINCAN";

export interface BookAssistTransporter {
  id: string;
  name: string;
}

export interface BookAssistTruckOption {
  id: string;
  plate_number: string;
  company_name: string;
  visibility: "PRIVATE" | "PUBLIC";
  is_mine: boolean;
}

export interface BookAssistDriverOption {
  id: string;
  name: string;
  company_name: string;
  visibility: "PRIVATE" | "PUBLIC";
  is_mine: boolean;
}

export interface EptOption {
  id: string;
  name: string;
  zone: TerminalZone;
  facility: string;
}

export const BOOK_ASSIST_TRANSPORTERS: BookAssistTransporter[] = [
  { id: "tr-1", name: "ABC Logistics Ltd" },
  { id: "tr-2", name: "BUA Transport Services" },
  { id: "tr-3", name: "Dangote Transport Services" },
  { id: "tr-4", name: "Mikano Logistics" },
  { id: "tr-5", name: "Shina & Sons Logistics" },
  { id: "tr-6", name: "TSL Logistics" },
  { id: "tr-7", name: "Calabar Haulage Co." },
];

export const PORT_TERMINALS_BY_ZONE: Record<TerminalZone, string[]> = {
  APAPA: [
    "APM Terminals",
    "PTML Apapa",
    "Grimaldi Terminal",
    "ENL Terminal",
    "Five Star Terminal",
    "LPC Terminal",
  ],
  TINCAN: [
    "Tincan Island Terminal",
    "Greenview Terminal",
    "P&C Terminal",
    "MRS Terminal",
  ],
};

export type BondedTerminalLocation =
  | "APAPA_PORT"
  | "APAPA_NON_PORT"
  | "TINCAN_PORT"
  | "TINCAN_NON_PORT";

export const BONDED_TERMINAL_LOCATIONS: { value: BondedTerminalLocation; label: string }[] = [
  { value: "APAPA_PORT", label: "Apapa (Port-Terminals)" },
  { value: "APAPA_NON_PORT", label: "Apapa (Non-Port Terminals)" },
  { value: "TINCAN_PORT", label: "Tincan (Port Terminals)" },
  { value: "TINCAN_NON_PORT", label: "Tincan (Non-Port Terminals)" },
];

export const TERMINALS_BY_BONDED_LOCATION: Record<BondedTerminalLocation, string[]> = {
  APAPA_PORT: PORT_TERMINALS_BY_ZONE.APAPA,
  APAPA_NON_PORT: ["Apapa NPT-A", "Apapa NPT-B", "Mile 2 Non-Port Terminal"],
  TINCAN_PORT: PORT_TERMINALS_BY_ZONE.TINCAN,
  TINCAN_NON_PORT: ["Tincan NPT-A", "Tincan NPT-B", "Kirikiri Non-Port Terminal"],
};

export interface BondedTerminalFacility {
  id: string;
  name: string;
}

export const BONDED_TERMINAL_FACILITIES: BondedTerminalFacility[] = [
  { id: "bt-1", name: "EMOG Bonded Terminals" },
  { id: "bt-2", name: "BNSC Bonded Terminal" },
  { id: "bt-3", name: "Lagos Bonded Warehouse" },
  { id: "bt-4", name: "Apapa Bonded Terminal A" },
  { id: "bt-5", name: "Tincan Bonded Terminal" },
  { id: "bt-6", name: "Warri Bonded Terminal" },
];

export interface TruckParkFacility {
  id: string;
  name: string;
}

export const TRUCK_PARK_FACILITIES: TruckParkFacility[] = [
  { id: "tp-1", name: "JOF Truck Park" },
  { id: "tp-2", name: "Goldspeed Truck Park" },
  { id: "tp-3", name: "RainPark Truck Park" },
  { id: "tp-4", name: "Apapa Truck Park" },
  { id: "tp-5", name: "Tincan Truck Park" },
  { id: "tp-6", name: "Mile 2 Truck Park" },
];

export type BondedBookingCategoryVariant =
  | "import_container"
  | "import_non_container"
  | "empty_container"
  | "export_container"
  | "export_non_container"
  | "fmcg"
  | "fish";

export const BONDED_BOOKING_CATEGORIES: {
  value: string;
  label: string;
  variant: BondedBookingCategoryVariant;
}[] = [
  { value: "IMPORT_CONTAINER", label: "Import Container", variant: "import_container" },
  { value: "IMPORT_NON_CONTAINER", label: "Import Non-Containerized", variant: "import_non_container" },
  { value: "EMPTY_CONTAINER", label: "Empty Container", variant: "empty_container" },
  { value: "EXPORT_CONTAINER", label: "Export Container", variant: "export_container" },
  { value: "EXPORT_NON_CONTAINER", label: "Export Non-Containerized", variant: "export_non_container" },
  { value: "FMCG", label: "FMCG", variant: "fmcg" },
  { value: "FISH", label: "Fish", variant: "fish" },
];

export const FACILITY_ARRIVAL_TIMESLOTS = [
  { value: "06-09", label: "06:00 - 09:00hrs" },
  { value: "09-12", label: "09:00 - 12:00hrs" },
  { value: "12-15", label: "12:00 - 15:00hrs" },
  { value: "15-18", label: "15:00 - 18:00hrs" },
  { value: "18-21", label: "18:00 - 21:00hrs" },
];

export function getBondedLocationLabel(location: BondedTerminalLocation): string {
  return BONDED_TERMINAL_LOCATIONS.find((l) => l.value === location)?.label ?? location;
}

export function isContainerizedBondedCategory(variant: BondedBookingCategoryVariant): boolean {
  return (
    variant === "import_container" ||
    variant === "export_container" ||
    variant === "empty_container"
  );
}

export const FISH_VAN_PARKS = [
  "Avian Fish Park",
  "Ijora Fish-Van Park",
  "Apapa Fish-Van Park",
  "Tincan Fish-Van Park",
  "Creek Road Fish Park",
];

export const EXPORT_TYPES = [
  { value: "AGRO", label: "Agro Export" },
  { value: "MANUFACTURED", label: "Manufactured Export" },
  { value: "OTHERS", label: "Others" },
];

export const EPT_OPERATION_TYPES = [
  { value: "LOADED_DELIVERY", label: "Loaded Export Container Delivery to EPT" },
  { value: "EMPTY_DELIVERY", label: "Empty Container Delivery to EPT" },
  { value: "VERIFIED_COLLECTION", label: "Verified Export Container Collection from EPT" },
  {
    value: "LOADED_WITH_COLLECTION",
    label: "Loaded Export Container Delivery to EPT with Container Collection for Port Terminal Delivery",
  },
];

export const EPT_OPTIONS: EptOption[] = [
  { id: "ept-1", name: "Lilypond Transit Park", zone: "APAPA", facility: "Lilypond Transit Park" },
  { id: "ept-2", name: "Apapa EPT-1", zone: "APAPA", facility: "Apapa EPT-1" },
  { id: "ept-3", name: "Apapa EPT-2", zone: "APAPA", facility: "Apapa EPT-2" },
  { id: "ept-4", name: "Orile EPT", zone: "APAPA", facility: "Orile EPT" },
  { id: "ept-5", name: "Kirikiri EPT", zone: "APAPA", facility: "Kirikiri EPT" },
  { id: "ept-6", name: "Tincan EPT-1", zone: "TINCAN", facility: "Tincan EPT-1" },
  { id: "ept-7", name: "Tincan EPT-2", zone: "TINCAN", facility: "Tincan EPT-2" },
  { id: "ept-8", name: "Mile 2 EPT", zone: "TINCAN", facility: "Mile 2 EPT" },
];

export const BOOK_ASSIST_FEES = {
  booking_fee: 5000,
  taxes: 375,
  stamp_denotation: 50,
};

export const MOCK_WALLET_BALANCE = 273_180;

export function getAssistTrucks(transporterName: string): BookAssistTruckOption[] {
  return MOCK_TRUCKS.filter(
    (t) =>
      t.registration_status !== "DISABLED" &&
      (t.registered_by.company_name === transporterName || t.visibility === "PUBLIC"),
  ).map((t) => {
    const belongsToTransporter = t.registered_by.company_name === transporterName;
    return {
      id: t.id,
      plate_number: t.plate_number,
      company_name: t.registered_by.company_name,
      visibility: t.visibility,
      is_mine: belongsToTransporter,
    };
  });
}

export function getAssistDrivers(transporterName: string): BookAssistDriverOption[] {
  return MOCK_DRIVERS.filter(
    (d) =>
      d.verification_status !== "DISABLED" &&
      (d.registered_by.company_name === transporterName || d.visibility === "PUBLIC"),
  ).map((d) => {
    const belongsToTransporter = d.registered_by.company_name === transporterName;
    return {
      id: d.id,
      name: `${d.first_name} ${d.last_name}`,
      company_name: d.registered_by.company_name,
      visibility: d.visibility,
      is_mine: belongsToTransporter,
    };
  });
}

export function formatAssistNaira(amount: number) {
  return `₦${amount.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
}

export function formatAssistDateLong(isoDate: string) {
  return new Date(isoDate).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatAssistDateShort(isoDate: string) {
  return new Date(isoDate).toLocaleDateString("en-NG", {
    day: "2-digit",
    month: "short",
  });
}

export function buildGroupedTruckOptions(transporterName: string) {
  const trucks = getAssistTrucks(transporterName);
  const mine = trucks.filter((t) => t.is_mine);
  const pub = trucks.filter((t) => !t.is_mine && t.visibility === "PUBLIC");
  return [
    ...mine.map((t) => ({ value: t.id, label: t.plate_number, group: "mine" as const })),
    ...pub.map((t) => ({
      value: t.id,
      label: `${t.plate_number} (${t.company_name})`,
      group: "public" as const,
    })),
  ];
}

export function buildGroupedDriverOptions(transporterName: string) {
  const drivers = getAssistDrivers(transporterName);
  const mine = drivers.filter((d) => d.is_mine);
  const pub = drivers.filter((d) => !d.is_mine && d.visibility === "PUBLIC");
  return [
    ...mine.map((d) => ({ value: d.id, label: d.name, group: "mine" as const })),
    ...pub.map((d) => ({
      value: d.id,
      label: `${d.name} (${d.company_name})`,
      group: "public" as const,
    })),
  ];
}

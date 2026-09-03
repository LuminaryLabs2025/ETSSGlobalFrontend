import type { TerminalType } from "@/types/terminals.types";
import type { TerminalLocation } from "@/types/terminals.types";

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

export function parseBondedTerminalLocation(location: BondedTerminalLocation): {
  location: TerminalLocation;
  type: TerminalType;
} {
  switch (location) {
    case "APAPA_PORT":
      return { location: "APAPA", type: "PORT_TERMINAL" };
    case "APAPA_NON_PORT":
      return { location: "APAPA", type: "NON_PORT_TERMINAL" };
    case "TINCAN_PORT":
      return { location: "TINCAN", type: "PORT_TERMINAL" };
    case "TINCAN_NON_PORT":
      return { location: "TINCAN", type: "NON_PORT_TERMINAL" };
  }
}

export function getBondedLocationLabel(location: BondedTerminalLocation): string {
  return BONDED_TERMINAL_LOCATIONS.find((l) => l.value === location)?.label ?? location;
}

export const EXPORT_TYPES = [
  { value: "AGRO_EXPORT", label: "Agro Export" },
  { value: "MANUFACTURED_EXPORT", label: "Manufactured Export" },
  { value: "OTHERS", label: "Others" },
] as const;

export const EPT_OPERATION_TYPES = [
  { value: "LOADED_EXPORT_DELIVERY", label: "Loaded Export Container Delivery to EPT" },
  { value: "EMPTY_CONTAINER_DELIVERY", label: "Empty Container Delivery to EPT" },
  { value: "VERIFIED_EXPORT_COLLECTION", label: "Verified Export Container Collection from EPT" },
  {
    value: "LOADED_DELIVERY_WITH_COLLECTION",
    label:
      "Loaded Export Container Delivery to EPT with Container Collection for Port Terminal Delivery",
  },
] as const;

/** Default arrival time when the form has no time picker (EPT API requires HH:mm). */
export const DEFAULT_EPT_ARRIVAL_TIME = "08:00";

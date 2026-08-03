export type LocationType = "FACILITY" | "TERMINAL_GATE" | string;

export interface LocationReference {
  id: string;
  name?: string;
}

export interface LocationRecord {
  id: string;
  name: string;
  type: LocationType;
  reference_id: string;
  reference?: LocationReference | null;
  created_by?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export type LocationDetail = LocationRecord;

export interface LocationsListParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
}

export interface LocationsListResponse {
  data: LocationRecord[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export interface LocationPayload {
  name: string;
  type: string;
  reference_id: string;
}

export interface LocationActionResponse {
  message?: string;
  data?: LocationRecord;
}

export const LOCATION_TYPE_OPTIONS = [
  { value: "FACILITY", label: "Facility" },
  { value: "TERMINAL_GATE", label: "Terminal Gate" },
] as const;

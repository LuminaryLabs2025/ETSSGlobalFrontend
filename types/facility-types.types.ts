export type FacilityTypeStatus = "ACTIVE" | "INACTIVE" | string;

export interface FacilityTypeLinkedRef {
  id: string;
  name: string;
}

export interface FacilityTypeRecord {
  id: string;
  name: string;
  status: FacilityTypeStatus;
  park_types?: FacilityTypeLinkedRef[] | string[];
  park_type_ids?: string[];
  created_by?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export type FacilityTypeDetail = FacilityTypeRecord;

export interface FacilityTypesListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export interface FacilityTypesListResponse {
  data: FacilityTypeRecord[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export interface FacilityTypePayload {
  name: string;
  status: string;
  park_type_ids: string[];
}

export interface FacilityTypeActionResponse {
  message?: string;
  data?: FacilityTypeRecord;
}

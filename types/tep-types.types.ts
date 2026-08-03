export type TepTypeStatus = "ACTIVE" | "INACTIVE" | string;

export interface TepTypeLinkedRef {
  id: string;
  name: string;
}

export interface TepType {
  id: string;
  name: string;
  status: TepTypeStatus;
  booking_categories?: TepTypeLinkedRef[] | string[];
  truck_types?: TepTypeLinkedRef[] | string[];
  booking_category_ids?: string[];
  truck_type_ids?: string[];
  created_by?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export type TepTypeDetail = TepType;

export interface TepTypesListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export interface TepTypesListResponse {
  data: TepType[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export interface TepTypePayload {
  name: string;
  status: string;
  booking_category_ids: string[];
  truck_type_ids: string[];
}

export interface TepTypeActionResponse {
  message?: string;
  data?: TepType;
}

export type ParkTypeStatus = "ACTIVE" | "INACTIVE" | string;

export interface ParkType {
  id: string;
  name: string;
  status: ParkTypeStatus;
  created_by?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export type ParkTypeDetail = ParkType;

export interface ParkTypesListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export interface ParkTypesListResponse {
  data: ParkType[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export interface ParkTypePayload {
  name: string;
  status: string;
}

export interface ParkTypeActionResponse {
  message?: string;
  data?: ParkType;
}

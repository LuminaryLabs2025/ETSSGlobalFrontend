export type TruckLengthStatus = "ACTIVE" | "INACTIVE" | string;

export interface TruckLengthTruckType {
  id: string;
  name: string;
  description?: string | null;
  status?: string | null;
}

export interface TruckLength {
  id: string;
  truck_type_id: string;
  length_value: string;
  status: TruckLengthStatus;
  truck_type?: TruckLengthTruckType | null;
  created_by?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export type TruckLengthDetail = TruckLength;

export interface TruckLengthsListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  truck_type_id?: string;
}

export interface TruckLengthsListResponse {
  data: TruckLength[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export interface TruckLengthPayload {
  truck_type_id: string;
  length_value: string;
  status: string;
}

export interface TruckLengthActionResponse {
  message?: string;
  data?: TruckLength;
}

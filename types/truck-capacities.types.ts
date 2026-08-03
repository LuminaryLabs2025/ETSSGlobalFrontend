export type TruckCapacityStatus = "ACTIVE" | "INACTIVE" | string;

export interface TruckCapacityTruckType {
  id: string;
  name: string;
  description?: string | null;
  status?: string | null;
}

export interface TruckCapacity {
  id: string;
  truck_type_id: string;
  capacity_value: string;
  status: TruckCapacityStatus;
  truck_type?: TruckCapacityTruckType | null;
  created_by?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export type TruckCapacityDetail = TruckCapacity;

export interface TruckCapacitiesListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  truck_type_id?: string;
}

export interface TruckCapacitiesListResponse {
  data: TruckCapacity[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export interface TruckCapacityPayload {
  truck_type_id: string;
  capacity_value: string;
  status: string;
}

export interface TruckCapacityActionResponse {
  message?: string;
  data?: TruckCapacity;
}

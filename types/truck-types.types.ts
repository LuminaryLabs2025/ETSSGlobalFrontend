export type TruckTypeStatus = "ACTIVE" | "INACTIVE" | string;

export interface TruckTypeLinkedRef {
  id: string;
  name: string;
}

export interface TruckTypeRecord {
  id: string;
  name: string;
  description: string;
  status: TruckTypeStatus;
  linked_booking_categories?: string[] | TruckTypeLinkedRef[];
  linked_booking_category_ids?: string[];
  created_by?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export type TruckTypeDetail = TruckTypeRecord;

export interface TruckTypesListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  type?: string;
}

export interface TruckTypesListResponse {
  data: TruckTypeRecord[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export interface TruckTypePayload {
  name: string;
  description: string;
  status: string;
  linked_booking_categories?: string[];
}

export interface TruckTypeActionResponse {
  message?: string;
  data?: TruckTypeRecord;
}

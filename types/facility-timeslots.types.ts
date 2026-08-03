export type FacilityTimeslotStatus = "ACTIVE" | "INACTIVE" | string;

export interface FacilityTimeslot {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  status: FacilityTimeslotStatus;
  type?: string | null;
  created_by?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export type FacilityTimeslotDetail = FacilityTimeslot;

export interface FacilityTimeslotsListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  type?: string;
}

export interface FacilityTimeslotsListResponse {
  data: FacilityTimeslot[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export interface FacilityTimeslotPayload {
  name: string;
  start_time: string;
  end_time: string;
  status: string;
}

export interface FacilityTimeslotActionResponse {
  message?: string;
  data?: FacilityTimeslot;
}

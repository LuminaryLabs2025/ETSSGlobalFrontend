export type RfidTagStatus =
  | "UNASSIGNED"
  | "ASSIGNED"
  | "ACTIVE"
  | "INACTIVE"
  | "DEACTIVATED"
  | "LOST"
  | string;

export interface RfidTagTruck {
  id: string;
  plate_number?: string | null;
}

export interface RfidTag {
  id: string;
  rfid_tag_number: string;
  status: RfidTagStatus;
  truck_id?: string | null;
  transporter_name?: string | null;
  truck?: RfidTagTruck | null;
  created_by?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export type RfidTagDetail = RfidTag;

export interface RfidTagsListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export interface RfidTagsListResponse {
  data: RfidTag[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export interface RfidTagCreatePayload {
  rfid_tag_number: string;
  status: string;
  truck_id?: string | null;
  transporter_name?: string | null;
}

export interface RfidTagUpdatePayload {
  status: string;
  truck_id?: string | null;
  transporter_name?: string | null;
}

export interface RfidTagActionResponse {
  message?: string;
  data?: RfidTag;
}

export interface RfidTagBulkUploadResponse {
  message?: string;
  data?: {
    imported?: number;
    failed?: number;
    total?: number;
    errors?: string[];
  };
}

export const RFID_TAG_STATUS_OPTIONS = [
  { value: "UNASSIGNED", label: "Unassigned" },
  { value: "ASSIGNED", label: "Assigned" },
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "DEACTIVATED", label: "Deactivated" },
  { value: "LOST", label: "Lost" },
] as const;

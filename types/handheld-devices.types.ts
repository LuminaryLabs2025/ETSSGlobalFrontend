export type HandheldDeviceStatus = "ACTIVE" | "INACTIVE" | string;

export interface HandheldDeviceUser {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  company?: {
    id?: string;
    name?: string | null;
  } | null;
}

export interface HandheldDeviceLocation {
  id: string;
  name?: string | null;
  type?: string | null;
}

export interface HandheldDevice {
  id: string;
  name: string;
  user_id: string;
  location_id: string;
  status: HandheldDeviceStatus;
  user?: HandheldDeviceUser | null;
  location?: HandheldDeviceLocation | null;
  created_by?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export type HandheldDeviceDetail = HandheldDevice;

export interface HandheldDevicesListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export interface HandheldDevicesListResponse {
  data: HandheldDevice[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export interface HandheldDevicePayload {
  name: string;
  user_id: string;
  location_id: string;
  status: string;
}

export interface HandheldDeviceActionResponse {
  message?: string;
  data?: HandheldDevice;
}

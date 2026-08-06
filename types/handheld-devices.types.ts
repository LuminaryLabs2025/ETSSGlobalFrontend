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

export interface HandheldDeviceBarrier {
  id: string;
  barrier_id_number?: string | null;
  name?: string | null;
  service_provider_name?: string | null;
}

export interface HandheldDevice {
  id: string;
  name: string;
  user_id: string;
  location_id?: string | null;
  barrier_id?: string | null;
  status: HandheldDeviceStatus;
  user?: HandheldDeviceUser | null;
  location?: HandheldDeviceLocation | null;
  barrier?: HandheldDeviceBarrier | null;
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
  location_id?: string;
  barrier_id?: string;
  status: string;
}

export interface HandheldDeviceActionResponse {
  message?: string;
  data?: HandheldDevice;
}

export function buildHandheldDevicePayload(fields: {
  name: string;
  user_id: string;
  status: string;
  location_id?: string;
  barrier_id?: string;
}): HandheldDevicePayload {
  const payload: HandheldDevicePayload = {
    name: fields.name.trim(),
    user_id: fields.user_id.trim(),
    status: fields.status,
  };

  const locationId = fields.location_id?.trim();
  const barrierId = fields.barrier_id?.trim();

  if (locationId) payload.location_id = locationId;
  if (barrierId) payload.barrier_id = barrierId;

  return payload;
}

export function resolveHandheldBarrierLabel(
  item: HandheldDevice,
  barrierNameMap?: Map<string, string>,
): string {
  if (item.barrier?.barrier_id_number?.trim()) return item.barrier.barrier_id_number.trim();
  if (item.barrier?.name?.trim()) return item.barrier.name.trim();
  if (item.barrier_id && barrierNameMap?.has(item.barrier_id)) {
    return barrierNameMap.get(item.barrier_id)!;
  }
  return item.barrier_id?.trim() || "—";
}

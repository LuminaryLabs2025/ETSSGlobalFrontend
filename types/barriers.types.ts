import type { FacilityParkType } from "@/types/facilities.types";

export type BarrierOperationalStatus = "ONLINE" | "OFFLINE";
export type BarrierStatus = "ACTIVE" | "INACTIVE";
export type BarrierRole = "ENTRY" | "EXIT";
export type BarrierSiteType = "FACILITY" | "TRANSIT_PARK" | "TERMINAL";

export interface BarrierLinkedFacility {
  id: string;
  name: string;
  park_type?: string;
}

export interface BarrierLinkedSite {
  link_id: string;
  site_type: BarrierSiteType;
  site_id: string;
  barrier_role: BarrierRole;
  site: { id: string; name: string; park_type?: string } | null;
}

export interface BarrierLinkedHandheld {
  id: string;
  name: string;
  status: string;
}

export interface BarrierRecord {
  id: string;
  barrier_id_number: string;
  service_provider_name: string;
  operational_status: BarrierOperationalStatus;
  status: BarrierStatus;
  barrier_type: BarrierRole | null;
  linked_facility: BarrierLinkedFacility | null;
  linked_site: BarrierLinkedSite | null;
  linked_sites: BarrierLinkedSite[];
  linked_handheld: BarrierLinkedHandheld | null;
  linked_handhelds: BarrierLinkedHandheld[];
  created_at: string;
  updated_at: string;
}

export type BarrierDetail = BarrierRecord;

export interface BarriersListParams {
  page?: number;
  limit?: number;
  search?: string;
  site_type?: BarrierSiteType;
  park_type?: FacilityParkType;
  operational_status?: BarrierOperationalStatus;
  barrier_type?: BarrierRole;
  status?: BarrierStatus;
}

export interface BarriersListResponse {
  data: BarrierRecord[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export interface BarriersSummaryParams {
  site_type?: BarrierSiteType;
  park_type?: FacilityParkType;
}

export interface BarrierSummaryBucket {
  active: number;
  inactive: number;
  total: number;
}

export interface BarriersSummaryResponse {
  all: BarrierSummaryBucket;
  entry: BarrierSummaryBucket;
  exit: BarrierSummaryBucket;
}

export interface BarrierPayload {
  service_provider_name: string;
  barrier_id_number: string;
  operational_status?: BarrierOperationalStatus;
}

export interface BarrierActionResponse {
  message?: string;
  data?: BarrierRecord;
}

import apiClient from "@/api/client";
import { TRAFFIC } from "@/api/endpoints";
import {
  mapCancelledBookingsResponse,
  mapLiveTrucksResponse,
  mapLiveTrucksSummary,
  mapOccDashboard,
  mapOccEmergenciesResponse,
  mapTrafficLocationsResponse,
} from "@/lib/mappers/traffic.mapper";
import type { ApiResponse } from "@/types/api.types";
import type {
  LiveTrucksParams,
  LiveTrucksResponse,
  LiveTrucksSummaryResponse,
  OccCancelledBookingsParams,
  OccCancelledBookingsResponse,
  OccEmergenciesParams,
  OccEmergenciesResponse,
  OccDashboardParams,
  OccDashboardResponse,
  TrafficLocationsParams,
  TrafficLocationsResponse,
} from "@/types/traffic.types";

function locationParams(params?: TrafficLocationsParams) {
  if (!params) return undefined;
  const out: Record<string, string> = {};
  const kind = params.kind ?? params.facility_kind;
  if (kind && kind !== "ALL") {
    out.kind = kind;
  }
  if (params.park_type && params.park_type !== "ALL") {
    out.park_type = params.park_type;
  }
  return out;
}

function occParams(params?: OccDashboardParams) {
  if (!params) return undefined;
  const out: Record<string, string> = {};
  if (params.date_from && params.date_to) {
    out.date_from = params.date_from;
    out.date_to = params.date_to;
  } else if (params.date_preset) {
    out.date_preset = params.date_preset;
  }
  return out;
}

function occEmergenciesParams(params?: OccEmergenciesParams) {
  if (!params) return undefined;
  const out: Record<string, string | number> = {};
  if (params.date_from && params.date_to) {
    out.date_from = params.date_from;
    out.date_to = params.date_to;
  } else if (params.date_preset) {
    out.date_preset = params.date_preset;
  }
  if (params.emergency_type && params.emergency_type !== "ALL") {
    out.emergency_type = params.emergency_type;
  }
  if (params.page) out.page = params.page;
  if (params.limit) out.limit = params.limit;
  return out;
}

function occCancelledBookingsParams(params?: OccCancelledBookingsParams) {
  if (!params) return undefined;
  const out: Record<string, string | number> = {};
  if (params.date_from && params.date_to) {
    out.date_from = params.date_from;
    out.date_to = params.date_to;
  } else if (params.date_preset) {
    out.date_preset = params.date_preset;
  }
  if (params.search) out.search = params.search;
  if (params.page) out.page = params.page;
  if (params.limit) out.limit = params.limit;
  return out;
}

function unwrapTrafficPayload(payload: unknown): Record<string, unknown> {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return {};
  }
  const root = payload as Record<string, unknown>;
  if (Array.isArray(root.data)) {
    return root;
  }
  if (
    root.data
    && typeof root.data === "object"
    && !Array.isArray(root.data)
    && Array.isArray((root.data as Record<string, unknown>).data)
  ) {
    return root.data as Record<string, unknown>;
  }
  return root;
}

export const trafficService = {
  liveTrucks: async (params?: LiveTrucksParams): Promise<LiveTrucksResponse> => {
    const { data } = await apiClient.get<ApiResponse<Record<string, unknown>>>(
      TRAFFIC.LIVE_TRUCKS,
      { params },
    );
    return mapLiveTrucksResponse(unwrapTrafficPayload(data.data));
  },

  liveTrucksSummary: async (): Promise<LiveTrucksSummaryResponse> => {
    const { data } = await apiClient.get<ApiResponse<Record<string, unknown>>>(
      TRAFFIC.LIVE_TRUCKS_SUMMARY,
    );
    const payload = data.data;
    const raw =
      payload && typeof payload === "object" && !Array.isArray(payload)
        ? (payload as Record<string, unknown>)
        : {};
    return mapLiveTrucksSummary(raw);
  },

  locations: async (params?: TrafficLocationsParams): Promise<TrafficLocationsResponse> => {
    const { data } = await apiClient.get<ApiResponse<Record<string, unknown>>>(
      TRAFFIC.LOCATIONS,
      { params: locationParams(params) },
    );
    return mapTrafficLocationsResponse(unwrapTrafficPayload(data.data));
  },

  occDashboard: async (params?: OccDashboardParams): Promise<OccDashboardResponse> => {
    const { data } = await apiClient.get<ApiResponse<Record<string, unknown>>>(
      TRAFFIC.OCC_OVERVIEW,
      { params: occParams(params) },
    );
    return mapOccDashboard(unwrapTrafficPayload(data.data));
  },

  dispatchCommand: async (actionSlug: string): Promise<{ message?: string }> => {
    const { data } = await apiClient.post<ApiResponse<unknown>>(
      TRAFFIC.DISPATCH_COMMAND(actionSlug),
    );
    return { message: data.message };
  },

  emergencies: async (params?: OccEmergenciesParams): Promise<OccEmergenciesResponse> => {
    const { data } = await apiClient.get<ApiResponse<Record<string, unknown>>>(
      TRAFFIC.OCC_EMERGENCIES,
      { params: occEmergenciesParams(params) },
    );
    return mapOccEmergenciesResponse(unwrapTrafficPayload(data.data));
  },

  cancelledBookings: async (
    params?: OccCancelledBookingsParams,
  ): Promise<OccCancelledBookingsResponse> => {
    const { data } = await apiClient.get<ApiResponse<Record<string, unknown>>>(
      TRAFFIC.OCC_CANCELLED_BOOKINGS,
      { params: occCancelledBookingsParams(params) },
    );
    return mapCancelledBookingsResponse(unwrapTrafficPayload(data.data));
  },

  exportCancelledBookings: async (params?: OccCancelledBookingsParams): Promise<void> => {
    const response = await apiClient.get(TRAFFIC.OCC_CANCELLED_BOOKINGS_EXPORT, {
      params: occCancelledBookingsParams(params),
      responseType: "blob",
    });
    const blob = new Blob([response.data], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `occ-cancelled-bookings-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};

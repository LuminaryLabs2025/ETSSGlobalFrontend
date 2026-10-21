import apiClient from "@/api/client";
import { DASHBOARD_OVERVIEW } from "@/api/endpoints";
import type { ApiResponse } from "@/types/api.types";
import type {
  DashboardBookingsByCategoryResponse,
  DashboardBookingsByTerminalResponse,
  DashboardCreateOpsOrderPayload,
  DashboardIncidentBoardResponse,
  DashboardLiftOpsOrderPayload,
  DashboardMatchingsByFacilityResponse,
  DashboardOpsCommandResponse,
  DashboardOpsOrder,
  DashboardOverviewCorridorResponse,
  DashboardOverviewExecutiveResponse,
  DashboardOverviewLifecycleResponse,
  DashboardOverviewRedZoneResponse,
  DashboardOverviewRevenueResponse,
  DashboardPeriodFilter,
  DashboardRecentActivityResponse,
} from "@/types/dashboard-overview.types";

function periodParams(filter?: DashboardPeriodFilter) {
  if (!filter) return undefined;
  const out: Record<string, string> = {};
  if (filter.date_preset) out.date_preset = filter.date_preset;
  if (filter.date_from) out.date_from = filter.date_from;
  if (filter.date_to) out.date_to = filter.date_to;
  return Object.keys(out).length ? out : undefined;
}

async function getData<T>(path: string, params?: Record<string, string | number>) {
  const { data } = await apiClient.get<ApiResponse<T>>(path, { params });
  return data.data;
}

export const dashboardOverviewService = {
  revenue: () => getData<DashboardOverviewRevenueResponse>(DASHBOARD_OVERVIEW.REVENUE),

  corridor: () => getData<DashboardOverviewCorridorResponse>(DASHBOARD_OVERVIEW.CORRIDOR),

  redZone: () => getData<DashboardOverviewRedZoneResponse>(DASHBOARD_OVERVIEW.RED_ZONE),

  executive: () => getData<DashboardOverviewExecutiveResponse>(DASHBOARD_OVERVIEW.EXECUTIVE),

  lifecycle: () => getData<DashboardOverviewLifecycleResponse>(DASHBOARD_OVERVIEW.LIFECYCLE),

  bookingsByTerminal: (filter?: DashboardPeriodFilter) =>
    getData<DashboardBookingsByTerminalResponse>(
      DASHBOARD_OVERVIEW.BOOKINGS_BY_TERMINAL,
      periodParams(filter),
    ),

  matchingsByFacility: (filter?: DashboardPeriodFilter) =>
    getData<DashboardMatchingsByFacilityResponse>(
      DASHBOARD_OVERVIEW.MATCHINGS_BY_FACILITY,
      periodParams(filter),
    ),

  recentActivity: (type: "bookings" | "matchings", limit = 5) =>
    getData<DashboardRecentActivityResponse>(DASHBOARD_OVERVIEW.RECENT_ACTIVITY, {
      type,
      limit,
    }),

  bookingsByCategory: (filter?: DashboardPeriodFilter) =>
    getData<DashboardBookingsByCategoryResponse>(
      DASHBOARD_OVERVIEW.BOOKINGS_BY_CATEGORY,
      periodParams(filter),
    ),

  incidentBoard: (limit = 5) =>
    getData<DashboardIncidentBoardResponse>(DASHBOARD_OVERVIEW.INCIDENT_BOARD, { limit }),

  opsCommand: () => getData<DashboardOpsCommandResponse>(DASHBOARD_OVERVIEW.OPS_COMMAND),

  createOpsOrder: async (payload: DashboardCreateOpsOrderPayload): Promise<DashboardOpsOrder> => {
    const body = {
      action: payload.action,
      targets: payload.targets.map((t) => ({
        type: t.type,
        name: t.name,
        id: t.id,
      })),
      notes: payload.notes,
    };
    const { data } = await apiClient.post<ApiResponse<DashboardOpsOrder>>(
      DASHBOARD_OVERVIEW.OPS_ORDERS,
      body,
    );
    return data.data;
  },

  liftOpsOrder: async (id: string, payload: DashboardLiftOpsOrderPayload): Promise<DashboardOpsOrder> => {
    const { data } = await apiClient.patch<ApiResponse<DashboardOpsOrder>>(
      DASHBOARD_OVERVIEW.OPS_ORDER_LIFT(id),
      payload,
    );
    return data.data;
  },
};

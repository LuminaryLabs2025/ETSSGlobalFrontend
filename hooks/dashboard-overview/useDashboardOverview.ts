import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { dashboardOverviewService } from "@/services/dashboard-overview.service";
import type { ApiError } from "@/types/api.types";
import type {
  DashboardCreateOpsOrderPayload,
  DashboardLiftOpsOrderPayload,
  DashboardPeriodFilter,
} from "@/types/dashboard-overview.types";

const POLL_FAST = 30_000;
const POLL_SLOW = 60_000;

const overviewKey = ["dashboard", "overview"] as const;

export function useOverviewRevenue(enabled = true) {
  return useQuery({
    queryKey: [...overviewKey, "revenue"],
    queryFn: () => dashboardOverviewService.revenue(),
    enabled,
    refetchInterval: POLL_SLOW,
  });
}

export function useOverviewCorridor(enabled = true) {
  return useQuery({
    queryKey: [...overviewKey, "corridor"],
    queryFn: () => dashboardOverviewService.corridor(),
    enabled,
    refetchInterval: POLL_FAST,
  });
}

export function useOverviewRedZone(enabled: boolean) {
  return useQuery({
    queryKey: [...overviewKey, "red-zone"],
    queryFn: () => dashboardOverviewService.redZone(),
    enabled,
  });
}

export function useOverviewExecutive(enabled = true) {
  return useQuery({
    queryKey: [...overviewKey, "executive"],
    queryFn: () => dashboardOverviewService.executive(),
    enabled,
    refetchInterval: POLL_FAST,
  });
}

export function useOverviewLifecycle(enabled = true) {
  return useQuery({
    queryKey: [...overviewKey, "lifecycle"],
    queryFn: () => dashboardOverviewService.lifecycle(),
    enabled,
    refetchInterval: POLL_FAST,
  });
}

export function useOverviewBookingsByTerminal(filter?: DashboardPeriodFilter, enabled = true) {
  return useQuery({
    queryKey: [...overviewKey, "bookings-by-terminal", filter],
    queryFn: () => dashboardOverviewService.bookingsByTerminal(filter),
    enabled,
    refetchInterval: POLL_SLOW,
  });
}

export function useOverviewMatchingsByFacility(filter?: DashboardPeriodFilter, enabled = true) {
  return useQuery({
    queryKey: [...overviewKey, "matchings-by-facility", filter],
    queryFn: () => dashboardOverviewService.matchingsByFacility(filter),
    enabled,
    refetchInterval: POLL_SLOW,
  });
}

export function useOverviewRecentActivity(
  type: "bookings" | "matchings",
  enabled = true,
) {
  return useQuery({
    queryKey: [...overviewKey, "recent-activity", type],
    queryFn: () => dashboardOverviewService.recentActivity(type, 5),
    enabled,
    refetchInterval: POLL_SLOW,
  });
}

export function useOverviewBookingsByCategory(filter?: DashboardPeriodFilter, enabled = true) {
  return useQuery({
    queryKey: [...overviewKey, "bookings-by-category", filter],
    queryFn: () => dashboardOverviewService.bookingsByCategory(filter),
    enabled,
    refetchInterval: POLL_SLOW,
  });
}

export function useOverviewIncidentBoard(enabled = true) {
  return useQuery({
    queryKey: [...overviewKey, "incident-board"],
    queryFn: () => dashboardOverviewService.incidentBoard(5),
    enabled,
    refetchInterval: POLL_FAST,
  });
}

export function useOverviewOpsCommand(enabled = true) {
  return useQuery({
    queryKey: [...overviewKey, "ops-command"],
    queryFn: () => dashboardOverviewService.opsCommand(),
    enabled,
    refetchInterval: POLL_FAST,
  });
}

export function useCreateOverviewOpsOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: DashboardCreateOpsOrderPayload) =>
      dashboardOverviewService.createOpsOrder(payload),
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: [...overviewKey, "ops-command"] });
      if (order.notification_error) {
        toast.warning(`Order saved (${order.reference_id}) but notification failed.`);
      } else {
        toast.success(`Order ${order.reference_id} authorised.`);
      }
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to authorise order");
    },
  });
}

export function useLiftOverviewOpsOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: DashboardLiftOpsOrderPayload }) =>
      dashboardOverviewService.liftOpsOrder(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...overviewKey, "ops-command"] });
      toast.success("Order lifted.");
    },
    onError: (error: AxiosError<ApiError>) => {
      toast.error(error.response?.data?.message ?? "Failed to lift order");
    },
  });
}

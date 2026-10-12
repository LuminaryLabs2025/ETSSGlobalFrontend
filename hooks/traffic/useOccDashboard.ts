import { useQuery } from "@tanstack/react-query";
import { trafficService } from "@/services/traffic.service";
import type { OccDashboardParams } from "@/types/traffic.types";

const LIVE_REFETCH_MS = 12_000;

export function useOccDashboard(params?: OccDashboardParams, enabled = true) {
  return useQuery({
    queryKey: ["traffic", "occ", params],
    queryFn: () => trafficService.occDashboard(params),
    enabled,
    refetchInterval: LIVE_REFETCH_MS,
  });
}

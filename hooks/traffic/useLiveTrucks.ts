import { useQuery } from "@tanstack/react-query";
import { trafficService } from "@/services/traffic.service";
import type { LiveTrucksParams } from "@/types/traffic.types";

const LIVE_REFETCH_MS = 12_000;

const DEFAULT_LIVE_TRUCKS_PARAMS: LiveTrucksParams = { page: 1, limit: 100 };

export function useLiveTrucks(
  params: LiveTrucksParams = DEFAULT_LIVE_TRUCKS_PARAMS,
  enabled = true,
) {
  return useQuery({
    queryKey: ["traffic", "live-trucks", params],
    queryFn: () => trafficService.liveTrucks(params),
    enabled,
    refetchInterval: LIVE_REFETCH_MS,
  });
}

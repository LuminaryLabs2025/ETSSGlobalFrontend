import { useQuery } from "@tanstack/react-query";
import { trafficService } from "@/services/traffic.service";
import type { TrafficLocationsParams } from "@/types/traffic.types";

const LIVE_REFETCH_MS = 12_000;

export function useTrafficLocations(params?: TrafficLocationsParams, enabled = true) {
  return useQuery({
    queryKey: ["traffic", "locations", params],
    queryFn: () => trafficService.locations(params),
    enabled,
    refetchInterval: LIVE_REFETCH_MS,
  });
}

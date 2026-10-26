import { useQuery } from "@tanstack/react-query";
import { trafficService } from "@/services/traffic.service";

const LIVE_REFETCH_MS = 12_000;

export function useLiveTrucksSummary(enabled = true) {
  return useQuery({
    queryKey: ["traffic", "live-trucks", "summary"],
    queryFn: () => trafficService.liveTrucksSummary(),
    enabled,
    refetchInterval: LIVE_REFETCH_MS,
  });
}

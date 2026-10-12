import { useQuery } from "@tanstack/react-query";
import { trafficService } from "@/services/traffic.service";
import type { OccEmergenciesParams } from "@/types/traffic.types";

export function useOccEmergencies(params: OccEmergenciesParams, enabled = true) {
  return useQuery({
    queryKey: ["traffic", "occ", "emergencies", params],
    queryFn: () => trafficService.emergencies(params),
    enabled,
  });
}

import { useQuery } from "@tanstack/react-query";
import { incidentsService } from "@/services/incidents.service";
import type { IncidentsListParams } from "@/types/incidents.types";

export function useIncidents(params?: IncidentsListParams, enabled = true) {
  return useQuery({
    queryKey: ["incidents", "list", params],
    queryFn: () => incidentsService.list(params),
    enabled,
  });
}

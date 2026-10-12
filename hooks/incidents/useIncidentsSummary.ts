import { useQuery } from "@tanstack/react-query";
import { incidentsService } from "@/services/incidents.service";

export function useIncidentsSummary(enabled = true) {
  return useQuery({
    queryKey: ["incidents", "summary"],
    queryFn: () => incidentsService.summary(),
    enabled,
  });
}

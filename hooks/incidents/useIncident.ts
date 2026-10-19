import { useQuery } from "@tanstack/react-query";
import { incidentsService } from "@/services/incidents.service";

export function useIncident(id: string | null, enabled = true) {
  return useQuery({
    queryKey: ["incidents", "detail", id],
    queryFn: () => incidentsService.getById(id!),
    enabled: enabled && Boolean(id),
  });
}

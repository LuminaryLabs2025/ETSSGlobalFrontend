import { useQuery } from "@tanstack/react-query";
import { incidentsService } from "@/services/incidents.service";

export function useIncidentAssigneeCompanies(enabled = true) {
  return useQuery({
    queryKey: ["incidents", "assignees", "companies"],
    queryFn: () => incidentsService.listAssigneeCompanies(),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

export function useIncidentAssigneeUsers(companyId: string | null, enabled = true) {
  return useQuery({
    queryKey: ["incidents", "assignees", "users", companyId],
    queryFn: () => incidentsService.listAssigneeUsers(companyId!),
    enabled: enabled && Boolean(companyId),
  });
}

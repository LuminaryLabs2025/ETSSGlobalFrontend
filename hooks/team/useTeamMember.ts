import { useQuery } from "@tanstack/react-query";
import { teamService } from "@/services/team.service";

export function useTeamMember(id: string | null) {
  return useQuery({
    queryKey: ["team-members", "detail", id],
    queryFn: () => teamService.getById(id!),
    enabled: !!id,
  });
}

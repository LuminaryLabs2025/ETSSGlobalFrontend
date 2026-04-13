import { useQuery } from "@tanstack/react-query";
import { teamService } from "@/services/team.service";
import type { TeamListParams } from "@/types/team.types";

export function useTeamMembers(params?: TeamListParams) {
  return useQuery({
    queryKey: ["team-members", params],
    queryFn: () => teamService.list(params),
  });
}

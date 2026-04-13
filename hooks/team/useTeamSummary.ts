import { useQuery } from "@tanstack/react-query";
import { teamService } from "@/services/team.service";

export function useTeamSummary() {
  return useQuery({
    queryKey: ["team-members", "summary"],
    queryFn: teamService.summary,
  });
}

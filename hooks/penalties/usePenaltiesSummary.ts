import { useQuery } from "@tanstack/react-query";
import { penaltiesService } from "@/services/penalties.service";

export function usePenaltiesSummary(enabled = true) {
  return useQuery({
    queryKey: ["penalties", "summary"],
    queryFn: () => penaltiesService.summary(),
    enabled,
  });
}

import { useQuery } from "@tanstack/react-query";
import { penaltiesService } from "@/services/penalties.service";
import type { PenaltiesListParams } from "@/types/penalties.types";

export function usePenalties(params?: PenaltiesListParams, enabled = true) {
  return useQuery({
    queryKey: ["penalties", "list", params],
    queryFn: () => penaltiesService.list(params),
    enabled,
  });
}

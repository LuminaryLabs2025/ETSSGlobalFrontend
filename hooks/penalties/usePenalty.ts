import { useQuery } from "@tanstack/react-query";
import { penaltiesService } from "@/services/penalties.service";

export function usePenalty(id: string | null, enabled = true) {
  return useQuery({
    queryKey: ["penalties", "detail", id],
    queryFn: () => penaltiesService.getById(id!),
    enabled: enabled && Boolean(id),
  });
}

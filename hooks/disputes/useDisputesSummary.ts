import { useQuery } from "@tanstack/react-query";
import { disputesService } from "@/services/disputes.service";

export function useDisputesSummary(enabled = true) {
  return useQuery({
    queryKey: ["disputes", "summary"],
    queryFn: () => disputesService.summary(),
    enabled,
  });
}

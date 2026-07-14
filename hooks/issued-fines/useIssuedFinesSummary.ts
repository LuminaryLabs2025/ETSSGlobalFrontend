import { useQuery } from "@tanstack/react-query";
import { issuedFinesService } from "@/services/issued-fines.service";

export function useIssuedFinesSummary(enabled = true) {
  return useQuery({
    queryKey: ["issued-fines", "summary"],
    queryFn: () => issuedFinesService.summary(),
    enabled,
  });
}

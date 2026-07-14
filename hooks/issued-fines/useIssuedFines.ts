import { useQuery } from "@tanstack/react-query";
import { issuedFinesService } from "@/services/issued-fines.service";
import type { IssuedFinesListParams } from "@/types/penalties.types";

export function useIssuedFines(params?: IssuedFinesListParams, enabled = true) {
  return useQuery({
    queryKey: ["issued-fines", "list", params],
    queryFn: () => issuedFinesService.list(params),
    enabled,
  });
}

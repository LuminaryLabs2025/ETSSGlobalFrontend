import { useQuery } from "@tanstack/react-query";
import { issuedFinesService } from "@/services/issued-fines.service";

export function useIssuedFine(id: string | null, enabled = true) {
  return useQuery({
    queryKey: ["issued-fines", "detail", id],
    queryFn: () => issuedFinesService.getById(id!),
    enabled: enabled && Boolean(id),
  });
}

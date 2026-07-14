import { useQuery } from "@tanstack/react-query";
import { disputesService } from "@/services/disputes.service";
import type { DisputesListParams } from "@/types/penalties.types";

export function useDisputes(params?: DisputesListParams, enabled = true) {
  return useQuery({
    queryKey: ["disputes", "list", params],
    queryFn: () => disputesService.list(params),
    enabled,
  });
}

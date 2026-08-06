import { useQuery } from "@tanstack/react-query";
import { barriersService } from "@/services/barriers.service";
import type { BarriersSummaryParams } from "@/types/barriers.types";

export function useBarriersSummary(params?: BarriersSummaryParams) {
  return useQuery({
    queryKey: ["barriers", "summary", params],
    queryFn: () => barriersService.summary(params),
  });
}

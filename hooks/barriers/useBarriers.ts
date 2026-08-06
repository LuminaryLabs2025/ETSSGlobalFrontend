import { useQuery } from "@tanstack/react-query";
import { barriersService } from "@/services/barriers.service";
import type { BarriersListParams } from "@/types/barriers.types";

export function useBarriers(params?: BarriersListParams) {
  return useQuery({
    queryKey: ["barriers", params],
    queryFn: () => barriersService.list(params),
  });
}

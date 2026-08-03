import { useQuery } from "@tanstack/react-query";
import { truckLengthsService } from "@/services/truck-lengths.service";
import type { TruckLengthsListParams } from "@/types/truck-lengths.types";

export function useTruckLengths(params?: TruckLengthsListParams) {
  return useQuery({
    queryKey: ["truck-lengths", params],
    queryFn: () => truckLengthsService.list(params),
  });
}

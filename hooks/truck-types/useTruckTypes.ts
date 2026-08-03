import { useQuery } from "@tanstack/react-query";
import { truckTypesService } from "@/services/truck-types.service";
import type { TruckTypesListParams } from "@/types/truck-types.types";

export function useTruckTypes(params?: TruckTypesListParams) {
  return useQuery({
    queryKey: ["truck-types", params],
    queryFn: () => truckTypesService.list(params),
  });
}

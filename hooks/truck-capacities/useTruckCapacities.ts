import { useQuery } from "@tanstack/react-query";
import { truckCapacitiesService } from "@/services/truck-capacities.service";
import type { TruckCapacitiesListParams } from "@/types/truck-capacities.types";

export function useTruckCapacities(params?: TruckCapacitiesListParams) {
  return useQuery({
    queryKey: ["truck-capacities", params],
    queryFn: () => truckCapacitiesService.list(params),
  });
}

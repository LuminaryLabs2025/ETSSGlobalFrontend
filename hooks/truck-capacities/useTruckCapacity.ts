import { useQuery } from "@tanstack/react-query";
import { truckCapacitiesService } from "@/services/truck-capacities.service";

export function useTruckCapacity(id: string | null) {
  return useQuery({
    queryKey: ["truck-capacities", "detail", id],
    queryFn: () => truckCapacitiesService.getById(id!),
    enabled: !!id,
  });
}

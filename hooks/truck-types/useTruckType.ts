import { useQuery } from "@tanstack/react-query";
import { truckTypesService } from "@/services/truck-types.service";

export function useTruckType(id: string | null) {
  return useQuery({
    queryKey: ["truck-types", "detail", id],
    queryFn: () => truckTypesService.getById(id!),
    enabled: !!id,
  });
}

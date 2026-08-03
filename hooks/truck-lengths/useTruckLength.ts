import { useQuery } from "@tanstack/react-query";
import { truckLengthsService } from "@/services/truck-lengths.service";

export function useTruckLength(id: string | null) {
  return useQuery({
    queryKey: ["truck-lengths", "detail", id],
    queryFn: () => truckLengthsService.getById(id!),
    enabled: !!id,
  });
}

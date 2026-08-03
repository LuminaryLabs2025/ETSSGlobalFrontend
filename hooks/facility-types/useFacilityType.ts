import { useQuery } from "@tanstack/react-query";
import { facilityTypesService } from "@/services/facility-types.service";

export function useFacilityType(id: string | null) {
  return useQuery({
    queryKey: ["facility-types", "detail", id],
    queryFn: () => facilityTypesService.getById(id!),
    enabled: !!id,
  });
}
